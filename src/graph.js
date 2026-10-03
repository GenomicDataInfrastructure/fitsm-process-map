// SPDX-FileCopyrightText: 2026 PNED G.I.E.
//
// SPDX-License-Identifier: CC-BY-4.0

/*
 * Line and label helpers for the map (research R3, R8, R10).
 *
 * Model fields used: `model.map` (map.json), `model.processes` (Map by code,
 * each with `name`), `model.interfaces` (Map by id, each with `processes: [a, b]`).
 * Pure: no DOM access.
 */

/* Lines containing the station, in map.lines order. */
export function stationLines(code, model) {
  return model.map.lines.filter((line) => line.stations.includes(code));
}

export function isInterchange(code, model) {
  return stationLines(code, model).length >= 2;
}

/* First line (file order) containing both ends of the interface, or null for a transfer. */
export function connectionLine(interfaceId, model) {
  const iface = model.interfaces.get(interfaceId);
  if (!iface) return null;
  const [a, b] = iface.processes;
  return model.map.lines.find((line) => line.stations.includes(a) && line.stations.includes(b)) || null;
}

/* "Operations line" or "transfer between lines"; used in the frame and in aria-labels. */
export function connectionLabel(interfaceId, model) {
  const line = connectionLine(interfaceId, model);
  return line ? `${line.name} line` : "transfer between lines";
}

/* "A line", "A and B lines", "A, B and C lines". */
function lineNames(lines) {
  const names = lines.map((line) => line.name);
  if (names.length === 1) return `${names[0]} line`;
  const last = names.pop();
  return `${names.join(", ")} and ${last} lines`;
}

/* Spoken name of a station: "Incident and service request management, ISRM, on the Operations line". */
export function stationLabel(code, model) {
  const process = model.processes.get(code);
  const lines = stationLines(code, model);
  const where = lines.length ? `, on the ${lineNames(lines)}` : "";
  return `${process.name}, ${code}${where}`;
}

/* Spoken name of a connection: "Interface between <A> and <B>, Operations line". */
export function interfaceLabel(interfaceId, model) {
  const [a, b] = model.interfaces.get(interfaceId).processes;
  return `Interface between ${model.processes.get(a).name} and ${model.processes.get(b).name}, ${connectionLabel(interfaceId, model)}`;
}
