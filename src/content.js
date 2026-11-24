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
      records: { maintains: [], uses: [] },
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
    const r = { ...role, tasks: role.tasks || [] };
    model.roles.set(r.id, r);
    model.processes.get(r.process)?.roles.push(r);
  }

  for (const activity of files.activities) {
    const a = { ...activity, records: { maintains: [], uses: [] } };
    model.activities.set(a.id, a);
    model.processes.get(a.process)?.activities.push(a);
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

  // Records after activities and interfaces: each relationship's basis resolves against them.
  for (const record of files.records) {
    const relations = (record.relations || []).map((rel) => ({ ...rel, resolved: resolveBasis(rel.basis, model) }));
    const r = { ...record, relations, processes: relations.map((rel) => rel.process) };
    model.records.set(r.id, r);
    if (r.general) continue;
    for (const rel of relations) {
      const group = rel.kind === "maintains" ? "maintains" : "uses";
      model.processes.get(rel.process)?.records[group].push(r);
      if (rel.basis?.activity) model.activities.get(rel.basis.activity)?.records[group].push(r);
    }
  }

  for (const line of files.map.lines) model.lines.set(line.id, line);

  model.overview = buildOverview(model);
  return model;
}

/* The records overview (FR-009, FR-010): processes in FitSM order (PR1 … PR14); one row per
 * record, grouped by the first process in that order that creates or maintains it, then by
 * name; records nobody creates or maintains last. The general record heads the view, not a row. */
export function buildOverview(model) {
  const prNumber = (group) => Number(String(group.id).replace(/\D/g, "")) || Infinity;
  const processes = [...model.requirementGroups.values()]
    .filter((g) => g.kind === "process" && model.processes.has(g.process))
    .sort((a, b) => prNumber(a) - prNumber(b))
    .map((g) => g.process);
  const position = new Map(processes.map((code, i) => [code, i]));
  const rows = [...model.records.values()].filter((r) => !r.general).map((record) => {
    const cells = new Map();
    for (const rel of record.relations) {
      if (cells.get(rel.process) !== "maintains") cells.set(rel.process, rel.kind === "maintains" ? "maintains" : "uses");
    }
    const owners = record.relations.filter((rel) => rel.kind === "maintains").map((rel) => position.get(rel.process) ?? Infinity);
    return { record, cells, group: owners.length ? Math.min(...owners) : Infinity };
  });
  rows.sort((a, b) => a.group - b.group || a.record.name.localeCompare(b.record.name));
  return {
    general: [...model.records.values()].find((r) => r.general) || null,
    processes,
    rows: rows.map(({ record, cells }) => ({ record, cells })),
  };
}

/* The FitSM-2 text a relationship rests on (data-model.md "Basis"): the first activity step,
 * process input or output, or interface flow containing `match`, with its source and, where
 * it has a view, a link. Null when nothing matches (scripts/check.js reports that). */
export function resolveBasis(basis, model) {
  if (!basis || typeof basis.match !== "string") return null;
  const has = (text) => typeof text === "string" && text.includes(basis.match);
  if (basis.activity) {
    const activity = model.activities.get(basis.activity);
    const step = activity?.procedure.find(has);
    return step ? { kind: "activity", text: step, source: activity.source, link: `#activity/${activity.id}`, label: activity.name } : null;
  }
  for (const kind of ["input", "output"]) {
    if (!basis[kind]) continue;
    const item = model.processes.get(basis[kind])?.[`${kind}s`].find((x) => has(x.text));
    return item ? { kind, text: item.text, source: item.source } : null;
  }
  if (basis.flow) {
    const iface = model.interfaces.get(basis.flow);
    const flow = iface?.flows.find((f) => has(f.item));
    return flow ? { kind: "flow", text: flow.item, source: flow.source, link: `#${iface.id}`, from: flow.from, to: flow.to } : null;
  }
  return null;
}

/* Fetches editions.json, then the current edition's eight files in parallel.
 * Throws Error("Could not load content/<edition>/<file>") naming the first failure. */
export async function loadContent(fetchImpl, baseUrl = "content/") {
  const editionsUrl = `${baseUrl}editions.json`;
  const editions = await fetchJson(fetchImpl, editionsUrl, "content/editions.json");
  if (!editions || !Array.isArray(editions.editions)) throw new Error("Could not load content/editions.json");
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
