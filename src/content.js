// SPDX-FileCopyrightText: 2026 PNED G.I.E.
//
// SPDX-License-Identifier: CC-BY-4.0

/*
 * Turns the edition's JSON files into an indexed model (specs/…/data-model.md).
 * Pure: no DOM access. `loadContent` takes the fetch function as a parameter so
 * tests can pass a stub.
 */

export const FILES = [
  "edition", "processes", "requirements", "roles", "activities", "records", "interfaces", "map",
];

/* Builds the model from the eight parsed files. Cross-references are resolved into
 * Maps and reverse indexes; nothing is validated here (scripts/check.js does that). */
export function buildModel(files) {
  const model = {
    edition: files.edition,
    map: files.map,
    generic: files.roles.generic,
    processes: new Map(),
    aliases: new Map(),
    requirementGroups: new Map(),
    requirements: new Map(),
    roles: new Map(),
    activities: new Map(),
    records: new Map(),
    interfaces: new Map(),
    lines: new Map(),
  };

  for (const p of files.processes) {
    model.processes.set(p.code, {
      ...p,
      externalFlows: p.externalFlows || [],
      inputs: p.inputs || [],
      outputs: p.outputs || [],
      roles: [],
      activities: [],
      records: [],
      interfaces: [],
      requirementGroup: null,
    });
    for (const alias of p.aliases || []) model.aliases.set(alias, p.code);
  }

  for (const group of [...files.requirements.general, ...files.requirements.process]) {
    const g = { ...group, kind: group.process ? "process" : "general" };
    model.requirementGroups.set(g.id, g);
    for (const item of g.items) model.requirements.set(item.id, { ...item, group: g });
    if (g.process) {
      const process = model.processes.get(g.process);
      if (process) process.requirementGroup = g;
    }
  }

  for (const role of files.roles.roles) {
    model.roles.set(role.id, role);
    model.processes.get(role.process)?.roles.push(role);
  }

  for (const activity of files.activities) {
    model.activities.set(activity.id, activity);
    model.processes.get(activity.process)?.activities.push(activity);
  }

  for (const record of files.records) {
    const r = { ...record, processes: record.usedBy.map((u) => u.process) };
    model.records.set(r.id, r);
    for (const use of record.usedBy) model.processes.get(use.process)?.records.push(r);
  }

  for (const iface of files.interfaces) {
    const directions = new Map();
    for (const flow of iface.flows || []) {
      if (!directions.has(flow.from)) directions.set(flow.from, []);
      directions.get(flow.from).push(flow);
    }
    const i = { ...iface, descriptions: iface.descriptions || [], flows: iface.flows || [], directions };
    model.interfaces.set(i.id, i);
    for (const code of i.processes) model.processes.get(code)?.interfaces.push(i);
  }

  for (const line of files.map.lines) model.lines.set(line.id, line);

  return model;
}

/* Fetches editions.json, then the current edition's eight files in parallel.
 * Throws Error("Could not load content/<edition>/<file>") naming the first failure. */
export async function loadContent(fetchImpl, baseUrl = "content/") {
  const editionsUrl = `${baseUrl}editions.json`;
  const editions = await fetchJson(fetchImpl, editionsUrl, "content/editions.json");
  const current = editions.editions.find((e) => e.id === editions.current);
  if (!current) throw new Error(`Could not load content/editions.json: current edition "${editions.current}" is not listed`);

  const files = {};
  await Promise.all(FILES.map(async (name) => {
    const path = `${current.path}/${name}.json`;
    files[name] = await fetchJson(fetchImpl, `${baseUrl}${path}`, `content/${path}`);
  }));
  return { editions, current, files, model: buildModel(files) };
}

async function fetchJson(fetchImpl, url, label) {
  let response;
  try {
    response = await fetchImpl(url);
  } catch {
    throw new Error(`Could not load ${label}`);
  }
  if (!response.ok) throw new Error(`Could not load ${label}`);
  try {
    return await response.json();
  } catch {
    throw new Error(`Could not load ${label}`);
  }
}
