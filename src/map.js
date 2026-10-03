// SPDX-FileCopyrightText: 2026 PNED G.I.E.
//
// SPDX-License-Identifier: CC-BY-4.0

/*
 * Draws the subway-style map as inline SVG from map.json and the model
 * (research R3, R10). Connections are drawn first so stations sit on top.
 */

import { stationLines, isInterchange, connectionLine, stationLabel, interfaceLabel, lineLabelAnchor } from "./graph.js";

const SVG_NS = "http://www.w3.org/2000/svg";
const XLINK_NS = "http://www.w3.org/1999/xlink";

const STATION_RADIUS = 12;
const RING_STEP = 5;
// Grid cells left of / above the first column and row, so edge labels have room.
const MARGIN_X = 2;
const MARGIN_Y = 1;
const LINE_HEIGHT = 14;

function el(name, attrs = {}, children = []) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === null) continue;
    if (key === "href") node.setAttributeNS(XLINK_NS, "href", value);
    node.setAttribute(key, value);
  }
  for (const child of children) node.append(child);
  return node;
}

/* Label placement relative to a station centre, by side. */
// Station labels are two lines (code, then name). `y` is the baseline of the first line.
const STATION_LABEL = {
  n: (x, y, lines) => ({ x, y: y - STATION_RADIUS - 8 - lines * LINE_HEIGHT, anchor: "middle" }),
  s: (x, y) => ({ x, y: y + STATION_RADIUS + 16, anchor: "middle" }),
  e: (x, y, lines) => ({ x: x + STATION_RADIUS + 8, y: y + 5 - (lines * LINE_HEIGHT) / 2, anchor: "start" }),
  w: (x, y, lines) => ({ x: x - STATION_RADIUS - 8, y: y + 5 - (lines * LINE_HEIGHT) / 2, anchor: "end" }),
};

/* Splits a long process name into two lines at the space nearest its middle. Nothing is
 * shortened; the full name is always shown (FR-001). */
const WRAP_AT = 22;
function wrapName(name) {
  if (name.length <= WRAP_AT) return [name];
  const middle = name.length / 2;
  let best = -1;
  for (let i = name.indexOf(" "); i !== -1; i = name.indexOf(" ", i + 1)) {
    if (best === -1 || Math.abs(i - middle) < Math.abs(best - middle)) best = i;
  }
  return best === -1 ? [name] : [name.slice(0, best), name.slice(best + 1)];
}
// Line name labels sit one line further out than a station label on the same side would.
const LINE_LABEL = {
  n: (x, y) => ({ x, y: y - STATION_RADIUS - 12 - 2 * LINE_HEIGHT, anchor: "middle" }),
  s: (x, y) => ({ x, y: y + STATION_RADIUS + 20 + 2 * LINE_HEIGHT, anchor: "middle" }),
  e: (x, y) => ({ x: x + STATION_RADIUS + 8, y: y + 5, anchor: "start" }),
  w: (x, y) => ({ x: x - STATION_RADIUS - 8, y: y + 5, anchor: "end" }),
};

export function renderMap(container, model) {
  const { map } = model;
  const unit = map.grid.unit;
  const width = (map.grid.cols + MARGIN_X + 2) * unit;
  const height = (map.grid.rows + MARGIN_Y + 1) * unit;
  const point = (gx, gy) => [(gx + MARGIN_X) * unit, (gy + MARGIN_Y) * unit];

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
  svg.style.setProperty("--transfer-dash", map.transfer.dash);

  // Connections
  const connections = el("g", { class: "connections" });
  for (const iface of model.interfaces.values()) {
    const [a, b] = iface.processes;
    const route = map.routes[iface.id];
    if (!map.stations[a] || !map.stations[b] || !route) continue;
    const points = [point(map.stations[a].x, map.stations[a].y), ...route.map(([x, y]) => point(x, y)), point(map.stations[b].x, map.stations[b].y)];
    const d = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x} ${y}`).join(" ");
    const line = connectionLine(iface.id, model);
    const link = el("a", {
      href: `#${iface.id}`,
      "data-hash": `#${iface.id}`,
      "aria-label": interfaceLabel(iface.id, model),
      class: line ? "connection" : "connection connection-transfer",
    }, [
      el("path", { class: "connection-hit", d }),
      el("path", { class: "connection-visible", d, stroke: line ? line.colour : map.transfer.colour }),
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
    if (isInterchange(code, model)) {
      // One ring per line, outermost first, over a white disc.
      link.append(el("circle", { class: "station-disc", cx: x, cy: y, r: STATION_RADIUS + (lines.length - 1) * RING_STEP, stroke: lines[0].colour }));
      lines.slice(1).forEach((line, i) => {
        link.append(el("circle", { class: "station-ring", cx: x, cy: y, r: STATION_RADIUS + (lines.length - 2 - i) * RING_STEP, stroke: line.colour, "stroke-width": 4 }));
      });
    } else {
      link.append(el("circle", { class: "station-disc", cx: x, cy: y, r: STATION_RADIUS, stroke: lines[0] ? lines[0].colour : map.transfer.colour }));
    }
    const nameLines = wrapName(process.name);
    const label = STATION_LABEL[pos.label](x, y, nameLines.length);
    const text = el("text", { class: "station-label", x: label.x, y: label.y, "text-anchor": label.anchor, "aria-hidden": "true" }, [
      el("tspan", { class: "station-code", x: label.x }, [document.createTextNode(code)]),
      ...nameLines.map((line) => el("tspan", { class: "station-name", x: label.x, dy: LINE_HEIGHT }, [document.createTextNode(line)])),
    ]);
    link.append(text);
    stations.append(link);
  }
  svg.append(stations);

  // Line name labels
  const labels = el("g", { class: "line-labels", "aria-hidden": "true" });
  for (const line of map.lines) {
    const anchor = lineLabelAnchor(line.id, model);
    const [x, y] = point(anchor.x, anchor.y);
    const place = LINE_LABEL[anchor.side](x, y);
    labels.append(el("text", { class: "line-label", x: place.x, y: place.y, "text-anchor": place.anchor, fill: line.colour }, [document.createTextNode(`${line.name} line`)]));
  }
  svg.append(labels);

  container.replaceChildren(svg);
  return svg;
}

/* Highlights the station or connection whose hash matches; null clears all. */
export function setSelected(container, hash) {
  for (const link of container.querySelectorAll("a[data-hash]")) {
    const selected = hash !== null && link.dataset.hash === hash;
    link.classList.toggle("selected", selected);
    if (selected) link.setAttribute("aria-current", "true");
    else link.removeAttribute("aria-current");
  }
}
