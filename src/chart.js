// SPDX-FileCopyrightText: 2026 PNED G.I.E.
//
// SPDX-License-Identifier: CC-BY-4.0

/*
 * FitSM-2 process charts (specs/003-process-charts): layout helpers, the text version and the
 * SVG drawing. Pure: the drawing goes through an element factory `el(name, attrs, children)`
 * passed in, so everything here runs in Node tests without a DOM.
 *
 * Chart units are PDF points (data-model.md). Labels are drawn at LABEL_SIZE units and must
 * render at least MIN_LABEL_PX pixels high (research R4).
 */

import { labelState } from "./content.js";

export const LABEL_SIZE = 7.5; // FitSM-2's chart labels are about 7 pt
export const TITLE_SIZE = 8.5;
export const MIN_LABEL_PX = 12;
const LINE_HEIGHT = 8.8;

/* ---------- geometry ---------- */

const box = (e) => ({ x: e.x, y: e.y, w: e.w, h: e.h });
const centre = (b) => [b.x + b.w / 2, b.y + b.h / 2];
const inside = (b, [px, py]) => px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h;

/* Width to draw the chart at, and the narrowest width at which its labels stay readable. */
export function chartScale(chart, availableWidth) {
  const minWidth = Math.ceil((chart.size.w * MIN_LABEL_PX) / LABEL_SIZE);
  const width = Math.max(availableWidth || 0, minWidth);
  return { scale: width / chart.size.w, minWidth, width };
}

/* Where an arrow towards `target` leaves box `b`. FitSM-2's charts are drawn orthogonally, so
 * when the target is level with the box (or straight above or below it) the arrow leaves
 * straight out at the target's height (or x); otherwise along the ray from the box's centre. */
function boxEdge(b, target) {
  const [tx0, ty0] = target;
  if (ty0 >= b.y && ty0 <= b.y + b.h && (tx0 > b.x + b.w || tx0 < b.x)) return [tx0 > b.x + b.w ? b.x + b.w : b.x, ty0];
  if (tx0 >= b.x && tx0 <= b.x + b.w && (ty0 > b.y + b.h || ty0 < b.y)) return [tx0, ty0 > b.y + b.h ? b.y + b.h : b.y];
  const [cx, cy] = centre(b);
  const dx = target[0] - cx, dy = target[1] - cy;
  if (dx === 0 && dy === 0) return [cx, cy];
  const tx = dx === 0 ? Infinity : (b.w / 2) / Math.abs(dx);
  const ty = dy === 0 ? Infinity : (b.h / 2) / Math.abs(dy);
  const t = Math.min(tx, ty);
  return [cx + dx * t, cy + dy * t];
}

/* An external arrow lies along the bottom of its box. It points away from the chart for "to"
 * and into it for "from"; its inner end is the end nearer the chart's middle. */
function externalEnds(element, chart) {
  const y = element.y + element.h - 2;
  const leftSide = element.x + element.w / 2 < chart.size.w / 2;
  const inner = [leftSide ? element.x + element.w : element.x, y];
  const outer = [leftSide ? element.x : element.x + element.w, y];
  return element.direction === "to" ? { tail: inner, head: outer, inner } : { tail: outer, head: inner, inner };
}

/* The point where an arrow meets an element: the inner end of an external arrow, or the edge
 * of the element's box facing `towards`. */
function anchor(element, towards, chart) {
  if (element.kind === "external") return externalEnds(element, chart).inner;
  if (element.kind === "decision") {
    // The diamond's edge: |dx| / (w/2) + |dy| / (h/2) = 1.
    const b = box(element);
    const [cx, cy] = centre(b);
    const dx = towards[0] - cx, dy = towards[1] - cy;
    const k = Math.abs(dx) / (b.w / 2) + Math.abs(dy) / (b.h / 2);
    return k === 0 ? [cx, cy] : [cx + dx / k, cy + dy / k];
  }
  return boxEdge(box(element), towards);
}

/* Polyline of an arrow, from the edge of `from` through the bends to the edge of `to`. A first
 * or last bend lying on (or in) the box it touches becomes the arrow's end there, so an arrow
 * can meet a box off its centre line, as FitSM-2's often do. */
export function arrowPoints(arrow, byId, chart = { size: { w: Infinity } }) {
  const from = byId.get(arrow.from), to = byId.get(arrow.to);
  const bends = [...(arrow.points || [])];
  const touches = (el, p) => el.kind !== "external" && p && inside({ x: el.x - 0.5, y: el.y - 0.5, w: el.w + 1, h: el.h + 1 }, p);
  const start = touches(from, bends[0]) ? bends.shift()
    : anchor(from, bends[0] || (to.kind === "external" ? anchor(to, centre(box(from)), chart) : centre(box(to))), chart);
  const end = touches(to, bends[bends.length - 1]) ? bends.pop() : anchor(to, bends[bends.length - 1] || start, chart);
  return [start, ...bends, end];
}

/* Parameter interval [t0, t1] of segment p→q that lies inside box b (Liang–Barsky), or null. */
function clip(p, q, b) {
  let t0 = 0, t1 = 1;
  const dx = q[0] - p[0], dy = q[1] - p[1];
  for (const [pk, qk] of [[-dx, p[0] - b.x], [dx, b.x + b.w - p[0]], [-dy, p[1] - b.y], [dy, b.y + b.h - p[1]]]) {
    if (pk === 0) { if (qk < 0) return null; continue; }
    const r = qk / pk;
    if (pk < 0) t0 = Math.max(t0, r); else t1 = Math.min(t1, r);
    if (t0 > t1) return null;
  }
  return [t0, t1];
}

/* Splits segment p→q where it crosses a group box: "light" pieces run over a group's dark fill,
 * "dark" pieces over white (research R5: one colour cannot pass 3:1 on both). */
export function lineColour([p, q], chart) {
  const groups = chart.elements.filter((e) => e.kind === "group").map(box);
  const cuts = new Set([0, 1]);
  for (const g of groups) {
    const c = clip(p, q, g);
    if (c) { cuts.add(c[0]); cuts.add(c[1]); }
  }
  const ts = [...cuts].sort((a, b) => a - b);
  const at = (t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
  const pieces = [];
  for (let i = 0; i < ts.length - 1; i++) {
    if (ts[i + 1] - ts[i] < 1e-9) continue;
    const mid = at((ts[i] + ts[i + 1]) / 2);
    const tone = groups.some((g) => inside(g, mid)) ? "light" : "dark";
    const last = pieces[pieces.length - 1];
    if (last && last.tone === tone) last.to = at(ts[i + 1]);
    else pieces.push({ from: at(ts[i]), to: at(ts[i + 1]), tone });
  }
  return pieces;
}

/* ---------- links ---------- */

/* The view an element opens, or null (FR-006 – FR-008). */
export function elementLink(element, chart, model) {
  if (element.kind === "group") return element.activity ? `#activity/${element.activity}` : null;
  if (element.kind === "step") {
    const group = chart.elements.find((e) => e.id === element.group);
    return group?.activity ? `#activity/${group.activity}` : null;
  }
  if (element.kind === "object") return element.record && model.records.has(element.record) ? `#record/${element.record}` : null;
  if (element.kind === "external") {
    const id = [chart.process, element.process].sort().join("-");
    return model.interfaces.has(id) ? `#${id}` : `#${element.process}`;
  }
  return null;
}

/* Spoken name of a linked element. */
function linkName(element, chart, model) {
  const label = text(element.label);
  if (element.kind === "group" || element.kind === "step") return `${label}, activity`;
  if (element.kind === "object") return `${label}, record ${model.records.get(element.record).name}`;
  const other = model.processes.get(element.process);
  return `${label}, interface with ${other ? other.name : element.process}`;
}

/* ---------- text version ---------- */

export const text = (label) => String(label || "").replace(/\s*\n\s*/g, " ").trim();

/* Reading order: top to bottom, then left to right; boxes whose tops are within ROW units count
 * as one row. */
const ROW = 12;
function readingOrder(a, b) {
  return Math.abs(a.y - b.y) <= ROW ? a.x - b.x || a.y - b.y : a.y - b.y;
}

/* Steps of a group in sequence order (data-model.md "Derived model"). */
function stepsInOrder(group, chart) {
  const steps = chart.elements.filter((e) => e.kind === "step" && e.group === group.id).sort(readingOrder);
  const ids = new Set(steps.map((s) => s.id));
  const next = new Map();
  const incoming = new Set();
  for (const a of chart.arrows || []) {
    if (a.kind !== "sequence" || !ids.has(a.from) || !ids.has(a.to)) continue;
    if (!next.has(a.from)) next.set(a.from, []);
    next.get(a.from).push(a.to);
    incoming.add(a.to);
  }
  const order = [];
  const seen = new Set();
  const visit = (id) => {
    if (seen.has(id)) return;
    seen.add(id);
    order.push(steps.find((s) => s.id === id));
    for (const n of next.get(id) || []) visit(n);
  };
  for (const s of steps) if (!incoming.has(s.id)) visit(s.id);
  for (const s of steps) visit(s.id);
  return order;
}

/* Everything the drawing shows, as structured text (research R7, FR-010). */
export function chartOutline(chart, model) {
  const byId = new Map(chart.elements.map((e) => [e.id, e]));
  const name = (id) => text(byId.get(id)?.label);
  const arrows = chart.arrows || [];
  const flows = (id, dir) => arrows
    .filter((a) => a.kind === "flow" && (a[dir] === id || (a.heads === "both" && a[dir === "to" ? "from" : "to"] === id)))
    .map((a) => name(dir === "to" ? (a.to === id ? a.from : a.to) : (a.from === id ? a.to : a.from)));
  const groups = chart.elements.filter((e) => e.kind === "group").sort(readingOrder).map((g) => ({
    id: g.id,
    label: text(g.label),
    link: elementLink(g, chart, model),
    steps: stepsInOrder(g, chart).map((s) => ({
      id: s.id,
      label: text(s.label),
      record: s.mark === "record",
      reads: flows(s.id, "to"),
      produces: flows(s.id, "from"),
    })),
    decisions: chart.elements
      .filter((e) => e.kind === "decision" && (e.group === g.id || (!e.group && inside(box(g), centre(box(e))))))
      .map((d) => ({ label: text(d.label), branches: arrows.filter((a) => a.from === d.id).map((a) => ({ label: a.label || "", to: name(a.to) })) })),
  }));
  const pick = (kind) => chart.elements.filter((e) => e.kind === kind).sort(readingOrder);
  return {
    groups,
    ends: pick("end").map((e) => text(e.label)),
    objects: pick("object").map((o) => ({
      label: text(o.label),
      state: labelState(o.label),
      record: o.record && model.records.has(o.record) ? model.records.get(o.record) : null,
    })),
    notes: pick("note").map((n) => text(n.label)),
    externals: pick("external").map((x) => ({ label: text(x.label), process: x.process, direction: x.direction, link: elementLink(x, chart, model) })),
    arrows: arrows.map((a) => ({ from: name(a.from), to: name(a.to), kind: a.kind, heads: a.heads || "end", label: a.label || "" })),
  };
}

/* ---------- drawing ---------- */

const f = (n) => Math.round(n * 10) / 10;
const pathOf = (pts) => pts.map(([x, y], i) => `${i ? "L" : "M"}${f(x)} ${f(y)}`).join(" ");

/* Centred label lines. `data-fit` carries the width a line may take; fitLabels() squeezes the
 * lines that overflow once the browser can measure them (the site's font is wider than the
 * narrow font of FitSM-2's charts). */
function labelLines(el, label, cx, cy, cls, maxWidth, size = LABEL_SIZE, maxHeight = Infinity) {
  const lines = String(label).split("\n");
  // Tighter lines where FitSM-2 fits more lines into a shape than the site's font allows.
  const lh = lines.length > 1 ? Math.max(size * 0.95, Math.min(LINE_HEIGHT, (maxHeight - size) / (lines.length - 1))) : LINE_HEIGHT;
  const top = cy - ((lines.length - 1) * lh) / 2 + size * 0.35;
  return el("text", { class: cls, x: f(cx), y: f(top), "text-anchor": "middle" },
    lines.map((line, i) => el("tspan", { x: f(cx), dy: i ? f(lh) : 0, "data-fit": maxWidth ? f(maxWidth) : undefined }, [line])));
}

/* In the browser: squeeze each label line that is wider than its box allows. */
export function fitLabels(svg) {
  for (const tspan of svg.querySelectorAll("tspan[data-fit]")) {
    const max = Number(tspan.getAttribute("data-fit"));
    if (tspan.getComputedTextLength() > max) {
      tspan.setAttribute("textLength", max);
      tspan.setAttribute("lengthAdjust", "spacingAndGlyphs");
    }
  }
}

function documentPath({ x, y, w, h }) {
  const wave = Math.min(5, h / 5);
  return `M${x} ${y} H${x + w} V${y + h - wave} C${x + w * 0.75} ${y + h - wave * 2.4} ${x + w * 0.5} ${y + h + wave * 0.6} ${x + w * 0.25} ${y + h} ` +
    `C${x + w * 0.12} ${y + h + wave * 0.3} ${x + w * 0.05} ${y + h - wave * 0.4} ${x} ${y + h - wave * 0.6} Z`;
}

function shape(element, el, chart) {
  const b = box(element);
  const [cx, cy] = centre(b);
  switch (element.kind) {
    case "group": {
      // The title sits at the top of a group with steps, and in the middle of one without.
      const hasSteps = chart.elements.some((e) => e.kind === "step" && e.group === element.id);
      const lines = String(element.label).split("\n").length;
      const ty = hasSteps ? b.y + 5 + ((lines - 1) * LINE_HEIGHT) / 2 + 4 : cy;
      return [
        el("rect", { class: "chart-group", x: b.x, y: b.y, width: b.w, height: b.h }),
        labelLines(el, element.label, cx, ty, "chart-group-title", b.w - 6, TITLE_SIZE, b.h - 4),
      ];
    }
    case "step": {
      const parts = [el("rect", { class: "chart-step", x: b.x, y: b.y, width: b.w, height: b.h }), labelLines(el, element.label, cx, cy, "chart-label", b.w - 4, LABEL_SIZE, b.h - 3)];
      if (element.mark === "record") {
        const ix = b.x + b.w - 11, iy = b.y + b.h - 8;
        parts.push(el("path", { class: "chart-record-mark", d: documentPath({ x: ix, y: iy, w: 9, h: 6 }) }));
      }
      return parts;
    }
    case "decision":
      return [
        el("polygon", { class: "chart-decision", points: `${cx},${b.y} ${b.x + b.w},${cy} ${cx},${b.y + b.h} ${b.x},${cy}` }),
        labelLines(el, element.label, cx, cy, "chart-label", b.w * 0.6),
      ];
    case "end":
      return [el("rect", { class: "chart-end", x: b.x, y: b.y, width: b.w, height: b.h, rx: Math.min(b.h / 2, 8) }), labelLines(el, element.label, cx, cy, "chart-label", b.w - 6)];
    case "note":
      return [el("rect", { class: "chart-note", x: b.x, y: b.y, width: b.w, height: b.h }), noteText(el, element.label, b)];
    case "object":
      return objectShape(element, el, b);
    case "external": {
      const { tail, head } = externalEnds(element, chart);
      return [
        el("line", { class: "chart-external-line", x1: tail[0], y1: tail[1], x2: head[0], y2: head[1], "marker-end": "url(#chart-head-grey)" }),
        el("text", { class: "chart-label", x: f(cx), y: f(b.y + LABEL_SIZE - 1), "text-anchor": "middle" }, [text(element.label)]),
      ];
    }
    default:
      return [];
  }
}

function noteText(el, label, b) {
  const lines = String(label).split("\n");
  return el("text", { class: "chart-note-text", x: b.x + 3, y: b.y + LABEL_SIZE }, lines.map((line, i) => el("tspan", { x: b.x + 3, dy: i ? LINE_HEIGHT : 0 }, [line])));
}

function objectShape(element, el, b) {
  const cls = `chart-object chart-object-${element.fill === "grey" ? "grey" : "white"}`;
  const [cx, cy] = centre(b);
  if (element.shape === "database") {
    const ry = Math.min(5, b.h / 5);
    return [
      el("path", { class: cls, d: `M${b.x} ${b.y + ry} A${b.w / 2} ${ry} 0 0 1 ${b.x + b.w} ${b.y + ry} V${b.y + b.h - ry} A${b.w / 2} ${ry} 0 0 1 ${b.x} ${b.y + b.h - ry} Z` }),
      el("path", { class: `${cls} chart-object-rim`, d: `M${b.x} ${b.y + ry} A${b.w / 2} ${ry} 0 0 0 ${b.x + b.w} ${b.y + ry}` }),
      labelLines(el, element.label, cx, cy + ry * 0.9, "chart-label", b.w - 4, LABEL_SIZE, b.h - 2 * ry - 2),
    ];
  }
  const parts = [];
  // Stacked documents: the back sheet down and to the right, as in FitSM-2; the box holds both.
  const front = element.shape === "documents" ? { x: b.x, y: b.y, w: b.w - 4, h: b.h - 4 } : b;
  if (element.shape === "documents") parts.push(el("path", { class: cls, d: documentPath({ x: b.x + 4, y: b.y + 4, w: b.w - 4, h: b.h - 4 }) }));
  parts.push(el("path", { class: cls, d: documentPath(front) }));
  const [fx, fy] = centre(front);
  parts.push(labelLines(el, element.label, fx, fy - 2.5, "chart-label", front.w - 8, LABEL_SIZE, front.h - 6));
  return parts;
}

/* Smooth path through the points (Catmull-Rom as cubic Béziers), for arrows FitSM-2 draws curved. */
function curvePath(pts) {
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
}

function arrowShape(arrow, byId, chart, el) {
  const pts = arrowPoints(arrow, byId, chart);
  if (arrow.curve) {
    // A curve keeps one colour: the tone of the background under most of its points.
    const tones = pts.slice(0, -1).flatMap((p, i) => lineColour([p, pts[i + 1]], chart).map((x) => x.tone));
    const tone = tones.filter((t) => t === "light").length > tones.length / 2 ? "light" : "dark";
    const out = [el("path", {
      class: `chart-arrow chart-${arrow.kind} chart-line-${tone}`,
      d: curvePath(pts),
      "marker-end": arrow.heads !== "none" ? `url(#chart-head-${tone})` : undefined,
      "marker-start": arrow.heads === "both" ? `url(#chart-head-start-${tone})` : undefined,
    })];
    return out;
  }
  const pieces = [];
  for (let i = 0; i < pts.length - 1; i++) pieces.push(...lineColour([pts[i], pts[i + 1]], chart));
  const cls = `chart-arrow chart-${arrow.kind}`;
  const out = pieces.map((piece, i) => el("path", {
    class: `${cls} chart-line-${piece.tone}`,
    d: pathOf([piece.from, piece.to]),
    "marker-end": i === pieces.length - 1 && arrow.heads !== "none" ? `url(#chart-head-${piece.tone})` : undefined,
    "marker-start": i === 0 && arrow.heads === "both" ? `url(#chart-head-start-${piece.tone})` : undefined,
  }));
  if (arrow.label) {
    // A branch label sits next to the decision it leaves, as in FitSM-2; others mid-arrow.
    const fromDecision = byId.get(arrow.from).kind === "decision";
    const [p, q] = fromDecision ? [pts[0], pts[1]] : [pts[Math.floor((pts.length - 1) / 2)], pts[Math.floor((pts.length - 1) / 2) + 1]];
    const t = fromDecision ? Math.min(0.5, 12 / (Math.hypot(q[0] - p[0], q[1] - p[1]) || 1)) : 0.5;
    const x = p[0] + (q[0] - p[0]) * t, y = p[1] + (q[1] - p[1]) * t;
    const vertical = Math.abs(q[0] - p[0]) < Math.abs(q[1] - p[1]);
    out.push(el("text", {
      class: "chart-arrow-label", x: f(vertical ? x + 3 : x), y: f(vertical ? y + 3 : y - 3), "text-anchor": vertical ? "start" : "middle",
    }, [arrow.label]));
  }
  return out;
}

function markers(el) {
  const head = (id, tone, start) => el("marker", {
    id, viewBox: "0 0 10 10", refX: start ? 1 : 9, refY: 5, markerWidth: 6, markerHeight: 6, markerUnits: "userSpaceOnUse", orient: "auto",
  }, [el("path", { class: `chart-head chart-head-${tone}`, d: start ? "M10 0 L0 5 L10 10 z" : "M0 0 L10 5 L0 10 z" })]);
  return el("defs", {}, [
    head("chart-head-dark", "dark"), head("chart-head-light", "light"), head("chart-head-grey", "grey"),
    head("chart-head-start-dark", "dark", true), head("chart-head-start-light", "light", true),
  ]);
}

/* The chart as an SVG element tree. Groups come first, each followed by its steps, then the
 * other elements in reading order, so links are reached in that order; arrows are drawn last,
 * on top, and ignore the pointer. */
export function renderChart(chart, model, el) {
  const byId = new Map(chart.elements.map((e) => [e.id, e]));
  const wrap = (element) => {
    const parts = shape(element, el, chart);
    const href = elementLink(element, chart, model);
    if (!href) return el("g", { class: `chart-el chart-el-${element.kind}` }, parts);
    return el("a", { href, class: `chart-el chart-el-${element.kind} chart-link`, "aria-label": linkName(element, chart, model) }, parts);
  };
  const groups = chart.elements.filter((e) => e.kind === "group").sort(readingOrder);
  const ordered = [];
  for (const g of groups) {
    ordered.push(g);
    ordered.push(...chart.elements.filter((e) => e.kind === "step" && e.group === g.id).sort(readingOrder));
  }
  ordered.push(...chart.elements.filter((e) => e.kind !== "group" && e.kind !== "step").sort(readingOrder));
  return el("svg", {
    class: "chart",
    viewBox: `0 0 ${chart.size.w} ${chart.size.h}`,
    xmlns: "http://www.w3.org/2000/svg",
  }, [
    markers(el),
    el("g", { class: "chart-elements" }, ordered.map(wrap)),
    el("g", { class: "chart-arrows", "aria-hidden": "true" }, (chart.arrows || []).flatMap((a) => arrowShape(a, byId, chart, el))),
  ]);
}
