// SPDX-FileCopyrightText: 2026 PNED G.I.E.
//
// SPDX-License-Identifier: CC-BY-4.0

/*
 * Draws the subway-style map as inline SVG from map.json and the model
 * (research R3, R10). Connections are drawn first so stations sit on top; where
 * a connection crosses one drawn before it, it yields: it stops short of the other
 * line with a short tick at each end and resumes beyond it, so each line can be
 * followed through the crossing.
 */

import { stationLines, isInterchange, connectionLine, stationLabel, interfaceLabel } from "./graph.js";

const SVG_NS = "http://www.w3.org/2000/svg";

const STATION_RADIUS = 11;
const RING_STEP = 5;
const GAP_HALF = 7;   // half the length of the gap a yielding line leaves at a crossing
const TICK = 4;       // half the length of the perpendicular tick at each end of the gap
const CORNER_RADIUS = 36; // radius of the curve drawn at a route's bend, so a branch peels off smoothly
const DEFAULT_MARGIN = { x: 2, y: 1 };
// Layout aid: draw the grid that stations and route bends sit on, with row and column
// numbers in the margins. Off by default; also switched on by adding ?grid to the address.
const SHOW_GRID = false;

function el(name, attrs = {}, children = []) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === null) continue;
    node.setAttribute(key, value);
  }
  for (const child of children) node.append(child);
  return node;
}

// Station labels are the process code only, placed on the station's `label` side, `r` px
// (the station's outer radius, larger for interchanges) from its centre.
const STATION_LABEL = {
  n: (x, y, r) => ({ x, y: y - r - 7, anchor: "middle" }),
  s: (x, y, r) => ({ x, y: y + r + 16, anchor: "middle" }),
  e: (x, y, r) => ({ x: x + r + 7, y: y + 5, anchor: "start" }),
  w: (x, y, r) => ({ x: x - r - 7, y: y + 5, anchor: "end" }),
};

/* ---------- crossings ---------- */

function unitVector(p, q) {
  const len = Math.hypot(q[0] - p[0], q[1] - p[1]);
  return [(q[0] - p[0]) / len, (q[1] - p[1]) / len];
}

function pointEquals(p, q) {
  return Math.abs(p[0] - q[0]) < 1e-6 && Math.abs(p[1] - q[1]) < 1e-6;
}

/* True when two unit vectors point along the same line (either way). */
function parallel(u, v) {
  return Math.abs(u[0] * v[1] - u[1] * v[0]) < 1e-6;
}

/* Parameter (0..1, exclusive) of point v along segment p-q when v lies strictly inside it, else null. */
function alongSegment(v, p, q) {
  const cross = (q[0] - p[0]) * (v[1] - p[1]) - (q[1] - p[1]) * (v[0] - p[0]);
  const dot = (v[0] - p[0]) * (q[0] - p[0]) + (v[1] - p[1]) * (q[1] - p[1]);
  const l2 = (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2;
  return Math.abs(cross) < 1e-6 && dot > 1e-6 && dot < l2 - 1e-6 ? dot / l2 : null;
}

/* Intersection point of segments p1-p2 and p3-p4 strictly inside both, or null. */
export function intersection(p1, p2, p3, p4) {
  const d = (p2[0] - p1[0]) * (p4[1] - p3[1]) - (p2[1] - p1[1]) * (p4[0] - p3[0]);
  if (Math.abs(d) < 1e-9) return null; // parallel or collinear
  const t = ((p3[0] - p1[0]) * (p4[1] - p3[1]) - (p3[1] - p1[1]) * (p4[0] - p3[0])) / d;
  const u = ((p3[0] - p1[0]) * (p2[1] - p1[1]) - (p3[1] - p1[1]) * (p2[0] - p1[0])) / d;
  const eps = 1e-6;
  if (t <= eps || t >= 1 - eps || u <= eps || u >= 1 - eps) return null;
  return { t, point: [p1[0] + t * (p2[0] - p1[0]), p1[1] + t * (p2[1] - p1[1])] };
}

/* Path data for a polyline that yields at every crossing with `others` (arrays of points):
 * the line stops short of the crossing line, with a short tick at each end drawn parallel
 * to the crossing line, and resumes on the other side. The crossing line itself stays
 * unbroken. At shallow angles the gap widens so the ticks still clear the crossing line.
 * Bends are drawn as curves of the given radius (smaller where the segments are short), so a
 * route leaving a shared trunk curves away from it instead of meeting it at a corner. */
export function yieldingPath(points, others, radius = CORNER_RADIUS) {
  let d = `M${points[0][0]} ${points[0][1]}`;
  // A bend sitting exactly on a line is a crossing that `intersection` never reports (it is
  // an end point of a segment on one side), so vertices are tested separately, both ways:
  // this route's own bends against the other lines, and the other lines' bends against
  // this route's segments. Where the two run along the same stretch on one side of the bend,
  // the bend is a junction (one route branching off a shared trunk), not a crossing.
  const vertexHit = (i) => {
    const v = points[i];
    const own = [unitVector(points[i - 1], v), unitVector(v, points[i + 1])];
    for (const other of others) {
      for (let k = 1; k < other.length; k++) {
        if (alongSegment(v, other[k - 1], other[k]) === null) continue;
        const odir = unitVector(other[k - 1], other[k]);
        if (!own.some((u) => parallel(u, odir))) return odir;
      }
    }
    return null;
  };
  const last = points.length - 1;
  const hits = points.map((_, i) => (i > 0 && i < last ? vertexHit(i) : null));
  const tick = ([x, y], [tx, ty]) => ` M${x + tx * TICK} ${y + ty * TICK} L${x - tx * TICK} ${y - ty * TICK}`;

  // First pass: every crossing on every segment, as { t, odir, half }.
  const segments = [null];
  for (let i = 1; i <= last; i++) {
    const a = points[i - 1], b = points[i];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const dir = unitVector(a, b);
    const halfFor = (odir) => {
      const sin = Math.abs(dir[0] * odir[1] - dir[1] * odir[0]);
      return Math.min(GAP_HALF / Math.max(sin, 0.5), 2 * GAP_HALF);
    };
    // On a stretch shared with an earlier line, a crossing that already yielded to that line
    // shows its gap there; yielding again would break both lines.
    const shown = (t, ci) => {
      const x = [a[0] + dir[0] * t * len, a[1] + dir[1] * t * len];
      return others.slice(0, ci).some((line) => line.some((p, k) => k > 0 && parallel(unitVector(line[k - 1], p), dir) &&
        (alongSegment(x, line[k - 1], p) !== null || pointEquals(x, p) || pointEquals(x, line[k - 1])) &&
        Math.abs((p[0] - a[0]) * dir[1] - (p[1] - a[1]) * dir[0]) < 1e-6));
    };
    const crossings = [];
    const add = (t, odir) => crossings.push({ t, odir, half: halfFor(odir) });
    for (const [ci, other] of others.entries()) {
      for (let k = 1; k < other.length; k++) {
        const p = other[k - 1], q = other[k];
        const hit = intersection(a, b, p, q);
        if (hit && !shown(hit.t, ci)) add(hit.t, unitVector(p, q));
        // The other line's bend lying on this segment; the tick follows its incoming side.
        // A bend where the other line joins or leaves this segment is a junction: no gap.
        if (k < other.length - 1) {
          const t = alongSegment(q, a, b);
          const joins = parallel(unitVector(p, q), dir) || parallel(unitVector(q, other[k + 1]), dir);
          if (t !== null && !joins && !shown(t, ci)) add(t, unitVector(p, q));
        }
      }
    }
    segments.push({ a, b, len, dir, halfFor, crossings });
  }

  // How far before and after each bend the curve starts and ends: 0 for a bend on another
  // line, and never so far that it leaves no room for the gap of a crossing next to it (the
  // bend turns sharp if it has to).
  const corners = points.map((v, i) => {
    if (i === 0 || i === last || hits[i]) return 0;
    const into = segments[i], out = segments[i + 1];
    const turn = Math.acos(Math.max(-1, Math.min(1, into.dir[0] * out.dir[0] + into.dir[1] * out.dir[1])));
    let size = Math.min(radius * Math.tan(turn / 2), into.len / 2, out.len / 2);
    for (const g of into.crossings) size = Math.min(size, into.len - g.t * into.len - g.half - TICK - 0.5);
    for (const g of out.crossings) size = Math.min(size, g.t * out.len - g.half - TICK - 0.5);
    return Math.max(0, Math.round(size * 1e6) / 1e6);
  });

  let resume = null; // direction of the line the previous segment stopped short of at its end vertex
  for (let i = 1; i <= last; i++) {
    const { a, b, len, dir, halfFor, crossings } = segments[i];
    // Gaps around a vertex on another line: the end of this segment, the start of the next.
    // A segment too short for both becomes one gap, with its ticks at the middle.
    const endHit = hits[i];
    let lo = resume ? halfFor(resume) : corners[i - 1];
    let hi = len - (endHit ? halfFor(endHit) : corners[i]);
    const squeezed = lo >= hi;
    if (squeezed) lo = hi = len / 2;
    if (resume) {
      const start = [a[0] + dir[0] * lo, a[1] + dir[1] * lo];
      d += tick(start, resume) + ` M${start[0]} ${start[1]}`;
      resume = null;
    }
    const gaps = crossings.filter((g) => g.t * len > lo + g.half + TICK && g.t * len < hi - g.half - TICK);
    gaps.sort((p, q) => p.t - q.t);
    // Gaps that are too close to draw separately are merged into one longer gap; each end
    // keeps the tick direction of the crossing line it stops at.
    const merged = [];
    for (const gap of gaps) {
      const start = gap.t * len - gap.half, end = gap.t * len + gap.half;
      const prev = merged[merged.length - 1];
      if (prev && start - prev.end < TICK) {
        prev.end = Math.max(prev.end, end);
        prev.odirEnd = gap.odir;
      } else {
        merged.push({ start, end, odirStart: gap.odir, odirEnd: gap.odir });
      }
    }
    for (const gap of merged) {
      const from = [a[0] + dir[0] * gap.start, a[1] + dir[1] * gap.start];
      const to = [a[0] + dir[0] * gap.end, a[1] + dir[1] * gap.end];
      d += ` L${from[0]} ${from[1]}` + tick(from, gap.odirStart) + tick(to, gap.odirEnd) + ` M${to[0]} ${to[1]}`;
    }
    if (endHit) {
      const stop = [a[0] + dir[0] * hi, a[1] + dir[1] * hi];
      if (!squeezed) d += ` L${stop[0]} ${stop[1]}`;
      d += tick(stop, endHit);
      resume = endHit;
    } else if (corners[i] > 0) {
      const stop = [a[0] + dir[0] * hi, a[1] + dir[1] * hi];
      const next = unitVector(b, points[i + 1]);
      d += ` L${stop[0]} ${stop[1]} Q${b[0]} ${b[1]} ${b[0] + next[0] * corners[i]} ${b[1] + next[1] * corners[i]}`;
    } else {
      d += ` L${b[0]} ${b[1]}`;
    }
  }
  return d;
}

/* ---------- rendering ---------- */

// Kept from the last render so that setSelected can animate the selected connection.
let rendered = { model: null, routes: new Map() };

export function renderMap(container, model) {
  const { map } = model;
  rendered = { model, routes: new Map() };
  const unit = map.grid.unit;
  const margin = map.grid.margin || DEFAULT_MARGIN;
  const width = (map.grid.cols + 2 * margin.x) * unit;
  const height = (map.grid.rows + 2 * margin.y) * unit;
  const point = (gx, gy) => [(gx + margin.x) * unit, (gy + margin.y) * unit];

  const svg = el("svg", {
    viewBox: `0 0 ${width} ${height}`,
    role: "img",
    "aria-labelledby": "map-title",
    "aria-describedby": "map-note",
  });
  svg.append(
    el("title", { id: "map-title" }, [document.createTextNode(`Map of the ${model.processes.size} FitSM processes and their interfaces`)]),
    el("desc", { id: "map-note" }, [document.createTextNode(map.note)]),
    el("rect", { width, height, fill: map.background }),
  );

  // Halves of the map, drawn as shaded bands across the full width with their name in the
  // corner given by the zone's `label`. A band touching the top or bottom of the grid runs
  // into the margin.
  const zones = el("g", { class: "zones", "aria-hidden": "true" });
  for (const zone of map.zones || []) {
    const top = zone.top <= 0 ? 0 : point(0, zone.top)[1];
    const bottom = zone.bottom >= map.grid.rows ? height : point(0, zone.bottom)[1];
    zones.append(
      el("rect", { class: "zone", x: 0, y: top, width, height: bottom - top, fill: zone.fill }),
      el("text", {
        class: "zone-label",
        x: zone.label.endsWith("w") ? 12 : width - 12,
        y: zone.label.startsWith("n") ? top + 22 : bottom - 12,
        "text-anchor": zone.label.endsWith("w") ? "start" : "end",
      }, [document.createTextNode(zone.name)]),
    );
  }
  svg.append(zones);
  if (SHOW_GRID || new URLSearchParams(location.search).has("grid")) svg.append(gridOverlay(map.grid, point));

  // Connections: coloured (line) connections first, transfers on top so their hops read.
  const connections = el("g", { class: "connections" });
  const drawn = [];
  const ordered = [...model.interfaces.values()].sort((a, b) => Number(!!connectionLine(b.id, model)) - Number(!!connectionLine(a.id, model)));
  for (const iface of ordered) {
    const [a, b] = iface.processes;
    const route = map.routes[iface.id];
    if (!map.stations[a] || !map.stations[b] || !route) continue;
    const points = [point(map.stations[a].x, map.stations[a].y), ...route.map(([x, y]) => point(x, y)), point(map.stations[b].x, map.stations[b].y)];
    const d = yieldingPath(points, drawn);
    const hit = yieldingPath(points, []);
    drawn.push(points);
    rendered.routes.set(iface.id, points);
    const line = connectionLine(iface.id, model);
    const link = el("a", {
      href: `#${iface.id}`,
      "data-hash": `#${iface.id}`,
      "aria-label": interfaceLabel(iface.id, model),
      class: line ? "connection" : "connection connection-transfer",
    }, [
      el("path", { class: "connection-hit", d: hit }),
      // Soft halo in the connection's own colour, shown only while it is selected.
      el("path", { class: "connection-halo", d: hit, stroke: line ? line.colour : map.transfer.colour }),
      el("path", {
        class: "connection-visible",
        d,
        stroke: line ? line.colour : map.transfer.colour,
        // Inline style, because a stylesheet rule beats a presentation attribute.
        style: line ? undefined : `stroke-width: ${map.transfer.width}px`,
      }),
    ]);
    connections.append(link);
  }
  svg.append(connections);

  // Stations
  const stations = el("g", { class: "stations" });
  for (const [code, pos] of Object.entries(map.stations)) {
    const process = model.processes.get(code);
    if (!process) continue;
    const [x, y] = point(pos.x, pos.y);
    const lines = stationLines(code, model);
    const link = el("a", { href: `#${code}`, "data-hash": `#${code}`, "aria-label": stationLabel(code, model) });
    const outerRadius = STATION_RADIUS + Math.max(0, lines.length - 1) * RING_STEP + 2; // + half the stroke
    // Soft halo in the station's own line colour, shown only while it is selected.
    link.append(el("circle", { class: "station-halo", cx: x, cy: y, r: outerRadius + 8, fill: lines[0] ? lines[0].colour : map.transfer.colour }));
    if (isInterchange(code, model)) {
      // One ring per line, outermost first, over a white disc.
      link.append(el("circle", { class: "station-disc", cx: x, cy: y, r: STATION_RADIUS + (lines.length - 1) * RING_STEP, stroke: lines[0].colour }));
      lines.slice(1).forEach((line, i) => {
        link.append(el("circle", { class: "station-ring", cx: x, cy: y, r: STATION_RADIUS + (lines.length - 2 - i) * RING_STEP, stroke: line.colour, "stroke-width": 4 }));
      });
    } else {
      link.append(el("circle", { class: "station-disc", cx: x, cy: y, r: STATION_RADIUS, stroke: lines[0] ? lines[0].colour : map.transfer.colour }));
    }
    // Only the code is printed on the map; the full name is the link's tooltip and spoken
    // name, and the frame shows it when the station is opened.
    const label = STATION_LABEL[pos.label](x, y, outerRadius);
    link.prepend(el("title", {}, [document.createTextNode(process.name)]));
    link.append(el("text", { class: "station-label station-code", x: label.x, y: label.y, "text-anchor": label.anchor, "aria-hidden": "true" }, [document.createTextNode(code)]));
    stations.append(link);
  }
  svg.append(stations);

  container.replaceChildren(svg);
  return svg;
}

/* Thin lines through every grid point, a little stronger every fifth, numbered every second
 * point along the top and left margins. */
function gridOverlay(grid, point) {
  const group = el("g", { class: "grid-overlay", "aria-hidden": "true" });
  const line = (x1, y1, x2, y2, major) => group.append(el("line", { x1, y1, x2, y2, class: major ? "grid-line grid-line-major" : "grid-line" }));
  const label = (x, y, text, anchor) => group.append(el("text", { x, y, class: "grid-label", "text-anchor": anchor }, [document.createTextNode(text)]));
  for (let gx = 0; gx <= grid.cols; gx++) {
    const [x, top] = point(gx, 0), [, bottom] = point(gx, grid.rows);
    line(x, top, x, bottom, gx % 5 === 0);
    if (gx % 2 === 0) label(x, top - 6, gx, "middle");
  }
  for (let gy = 0; gy <= grid.rows; gy++) {
    const [left, y] = point(0, gy), [right] = point(grid.cols, gy);
    line(left, y, right, y, gy % 5 === 0);
    if (gy % 2 === 0) label(left - 6, y + 3, gy, "end");
  }
  return group;
}

/* Pure classification of one map element (`own`, "#CODE" or "#A-B") against the selected
 * hash (null for none; "#A-B,C-D" for several connections): `selected` when it is one of
 * the selected items; `related` for a connection touching the selected station, or a
 * station at either end of a selected connection. Far-end stations of a selected station
 * are added by setSelected once the connections are known. */
export function selectionState(hash, own) {
  if (hash === null || hash === undefined) return { selected: false, related: false };
  const items = hash.slice(1).split(",");
  if (items.includes(own.slice(1))) return { selected: true, related: false };
  const codes = own.slice(1).split("-");
  const related = items.some((item) => {
    const selectedCodes = item.split("-");
    const touches = codes.some((c) => selectedCodes.includes(c));
    return touches && (codes.length === 2 ? selectedCodes.length === 1 : selectedCodes.length === 2);
  });
  return { selected: false, related };
}

/* ---------- connections under a point ---------- */

/* Closest point to `p` on the polyline `points`, with the direction of that segment. */
function closestOnPolyline(p, points) {
  let best = null;
  for (let k = 1; k < points.length; k++) {
    const a = points[k - 1], b = points[k];
    const l2 = (b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2;
    const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * (b[0] - a[0]) + (p[1] - a[1]) * (b[1] - a[1])) / l2));
    const q = [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])];
    const dist = Math.hypot(p[0] - q[0], p[1] - q[1]);
    if (!best || dist < best.dist) best = { point: q, dist, dir: unitVector(a, b) };
  }
  return best;
}

/* Ids of every route running along the clicked route `id` at `p` (map coordinates): the
 * point on `id` nearest `p`, and every route that passes through that point in the same
 * direction. A route merely crossing there is not included. Sorted; `id` alone when it
 * shares nothing there. */
export function connectionsThrough(routes, id, p) {
  const own = closestOnPolyline(p, routes.get(id));
  const ids = [];
  for (const [other, points] of routes) {
    const near = closestOnPolyline(own.point, points);
    if (other === id || (near.dist < 0.5 && parallel(near.dir, own.dir))) ids.push(other);
  }
  return ids.sort();
}

/* The connection ids under a click on connection `id` at client coordinates (x, y). */
export function connectionsAt(container, id, x, y) {
  const svg = container.querySelector("svg");
  const ctm = svg?.getScreenCTM();
  if (!ctm || !rendered.routes.has(id)) return [id];
  const p = new DOMPoint(x, y).matrixTransform(ctm.inverse());
  return connectionsThrough(rendered.routes, id, [p.x, p.y]);
}

/* Highlights the station or connection whose hash matches; null clears all. Nothing gets
 * heavier: the selected element and what it connects to keep full strength while everything
 * else fades (FR-005). A selected station also shows a soft halo. */
export function setSelected(container, hash) {
  const svg = container.querySelector("svg");
  if (!svg) return;
  const selectedCodes = new Set(hash ? hash.slice(1).split("-") : []);
  for (const link of container.querySelectorAll("a[data-hash]")) {
    const { selected, related } = selectionState(hash, link.dataset.hash);
    link.classList.toggle("selected", selected);
    link.classList.toggle("related", related);
    if (selected) link.setAttribute("aria-current", "true");
    else link.removeAttribute("aria-current");
  }
  // Stations at the far end of a selected station's connections stay at full strength too.
  if (hash && selectedCodes.size === 1 && !hash.includes(",")) {
    const [code] = selectedCodes;
    for (const conn of container.querySelectorAll(".connections a[data-hash]")) {
      const ends = conn.dataset.hash.slice(1).split("-");
      if (!ends.includes(code)) continue;
      const other = ends.find((c) => c !== code);
      container.querySelector(`.stations a[data-hash="#${other}"]`)?.classList.add("related");
    }
  }
  svg.classList.toggle("has-selection", hash !== null);
  animateFlows(svg, hash);
}

/* ---------- flow animation ---------- */

const DOTS_PER_DIRECTION = 3;
const DOT_SPEED = 70; // px per second

/* While connections are selected, small markers travel along each in the direction of each
 * flow FitSM-2 lists (both ways when flows exist in both directions). Removed on deselect,
 * and never shown when the visitor prefers reduced motion. */
function animateFlows(svg, hash) {
  svg.querySelector(".flow-animation")?.remove();
  const { model } = rendered;
  if (!model || !hash) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const group = el("g", { class: "flow-animation", "aria-hidden": "true" });
  for (const id of hash.slice(1).split(",")) addFlows(group, id);
  if (group.childNodes.length) svg.append(group);
}

function addFlows(group, id) {
  const { model, routes } = rendered;
  const iface = model.interfaces.get(id);
  const points = routes.get(id);
  if (!iface || !points) return;
  const line = connectionLine(id, model);
  const colour = line ? line.colour : model.map.transfer.colour;
  const [a] = iface.processes;
  for (const from of iface.directions.keys()) {
    const oriented = from === a ? points : [...points].reverse();
    const d = yieldingPath(oriented, []);
    const pathId = `flow-${id}-${from}`;
    group.append(el("path", { id: pathId, d, fill: "none", stroke: "none" }));
    const length = oriented.slice(1).reduce((sum, p, i) => sum + Math.hypot(p[0] - oriented[i][0], p[1] - oriented[i][1]), 0);
    const duration = Math.max(2, length / DOT_SPEED);
    for (let i = 0; i < DOTS_PER_DIRECTION; i++) {
      const motion = el("animateMotion", { dur: `${duration.toFixed(2)}s`, repeatCount: "indefinite", begin: `${(-duration * i / DOTS_PER_DIRECTION).toFixed(2)}s` });
      const mpath = el("mpath", { href: `#${pathId}` });
      motion.append(mpath);
      group.append(el("circle", { class: "flow-dot", r: 4, stroke: colour }, [motion]));
    }
  }
}
