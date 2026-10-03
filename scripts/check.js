#!/usr/bin/env node
// SPDX-FileCopyrightText: 2026 PNED G.I.E.
//
// SPDX-License-Identifier: CC-BY-4.0

/*
 * Consistency and contrast checks over the content store.
 * Contract: specs/001-fitsm-process-map/contracts/check-cli.md
 *
 *   node scripts/check.js [--content <dir>] [--editions <file>] [--quiet]
 *
 * Exit 0: no errors. Exit 1: errors. Exit 2: could not run (missing or invalid files).
 * Uses Node built-ins only.
 */

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { resolve, join, basename, dirname } from "node:path";
import { execFileSync } from "node:child_process";

const FILES = ["edition", "processes", "requirements", "roles", "activities", "records", "interfaces", "map"];
const ROLE_KINDS = ["owner", "manager", "case-owner", "staff", "specific"];
const SIDES = ["n", "s", "e", "w"];
const PATTERNS = {
  code: /^[A-Z]{2,6}$/,
  general: /^GR[1-7]$/,
  processGroup: /^PR([1-9]|1[0-4])$/,
  slug: /^[a-z][a-z0-9-]*$/,
  activity: /^[A-Z]{2,6}\.(A\d+|S)$/,
  colour: /^#[0-9a-fA-F]{6}$/,
};

/* ---------- CLI ---------- */

const args = process.argv.slice(2);
const opts = { content: null, editions: "content/editions.json", quiet: false };
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--content") opts.content = args[++i];
  else if (args[i] === "--editions") opts.editions = args[++i];
  else if (args[i] === "--quiet") opts.quiet = true;
  else fail(2, `Unknown option ${args[i]}`);
}

const findings = [];
let itemsChecked = 0;

function report(level, edition, file, item, message) {
  findings.push({ level, line: `${level.padEnd(7)} ${edition ? `${edition}/` : ""}${file}: ${item}: ${message}` });
}
function fail(code, message) {
  console.error(message);
  process.exit(code);
}

/* ---------- loading ---------- */

function readJson(path, label) {
  if (!existsSync(path)) fail(2, `error   ${label}: file not found`);
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    fail(2, `error   ${label}: not valid JSON (${e.message})`);
  }
}

const editions = [];
if (opts.content) {
  editions.push({ id: basename(resolve(opts.content)), dir: resolve(opts.content) });
} else {
  const editionsPath = resolve(opts.editions);
  const list = readJson(editionsPath, "editions.json");
  if (!list || !Array.isArray(list.editions)) fail(2, "error   editions.json: editions: must be an array");
  if (!list.editions.some((e) => e.id === list.current)) {
    report("error", "", "editions.json", "current", `"${list.current}" is not a listed edition`);
  }
  for (const e of list.editions) {
    const dir = resolve(dirname(editionsPath), e.path);
    if (!existsSync(dir)) fail(2, `error   editions.json: editions.${e.id}: directory "${e.path}" not found`);
    editions.push({ id: e.id, dir });
  }
}

for (const edition of editions) checkEdition(edition);
checkScripts();

const errors = findings.filter((f) => f.level === "error").length;
const warnings = findings.length - errors;
for (const f of findings) console.error(f.line);
if (!opts.quiet) console.log(`${errors} errors, ${warnings} warnings, ${itemsChecked} items checked across ${editions.length} edition(s)`);
process.exit(errors ? 1 : 0);

/* ---------- per-edition checks ---------- */

function checkEdition({ id: ed, dir }) {
  const d = {};
  for (const name of FILES) d[name] = readJson(join(dir, `${name}.json`), `${ed}/${name}.json`);
  const err = (file, item, msg) => report("error", ed, `${file}.json`, item, msg);
  const warn = (file, item, msg) => report("warning", ed, `${file}.json`, item, msg);

  // 3. Shape
  const shapeOk =
    isObj(d.edition) && isObj(d.edition.documents) &&
    Array.isArray(d.processes) &&
    isObj(d.requirements) && Array.isArray(d.requirements.general) && Array.isArray(d.requirements.process) &&
    isObj(d.roles) && isObj(d.roles.generic) && Array.isArray(d.roles.roles) &&
    Array.isArray(d.activities) && Array.isArray(d.records) && Array.isArray(d.interfaces) &&
    isObj(d.map) && Array.isArray(d.map.lines) && isObj(d.map.stations) && isObj(d.map.routes) && isObj(d.map.grid) && isObj(d.map.transfer);
  if (!shapeOk) {
    err("edition", "shape", "one or more files do not have the expected top-level shape");
    return;
  }
  const docs = new Set(Object.keys(d.edition.documents));
  const hasSource = (file, item, source) => {
    itemsChecked++;
    if (!isObj(source) || !source.doc || !source.section) {
      err(file, item, "missing source");
      return;
    }
    if (!docs.has(source.doc)) err(file, item, `source document "${source.doc}" is not in edition.json`);
  };

  // 4. Ids and processes
  const codes = new Set();
  const aliases = new Map();
  for (const p of d.processes) {
    if (!PATTERNS.code.test(p.code || "")) err("processes", p.code || "?", "code does not match ^[A-Z]{2,6}$");
    if (codes.has(p.code)) err("processes", p.code, "duplicate code");
    codes.add(p.code);
  }
  for (const p of d.processes) {
    for (const a of p.aliases || []) {
      if (codes.has(a)) err("processes", "aliases", `"${a}" is already a process code`);
      else if (aliases.has(a)) err("processes", "aliases", `"${a}" is used by more than one process`);
      else aliases.set(a, p.code);
    }
  }
  if (d.processes.length !== 14) err("processes", "count", `expected 14 processes, found ${d.processes.length}`);

  for (const p of d.processes) {
    if (!isObj(p.objective) || !p.objective.text) err("processes", p.code, "missing objective");
    else hasSource("processes", `${p.code}.objective`, p.objective.source);
    for (const [i, io] of (p.inputs || []).entries()) hasSource("processes", `${p.code}.inputs[${i}]`, io.source);
    for (const [i, io] of (p.outputs || []).entries()) hasSource("processes", `${p.code}.outputs[${i}]`, io.source);
    for (const [i, f] of (p.externalFlows || []).entries()) {
      const item = `${p.code}.externalFlows[${i}]`;
      if (!["in", "out"].includes(f.direction)) err("processes", item, `direction "${f.direction}" is not "in" or "out"`);
      if (!f.party) err("processes", item, "party is empty");
      if (!f.item) err("processes", item, "item is empty");
      if (codes.has(f.party) || aliases.has(f.party)) err("processes", item, `party "${f.party}" is a process code; move this flow to interfaces.json`);
      hasSource("processes", item, f.source);
    }
  }

  // Requirements
  const groupIds = new Set();
  const reqIds = new Set();
  const groupByProcess = new Map();
  if (d.requirements.general.length !== 7) err("requirements", "general", `expected 7 general groups, found ${d.requirements.general.length}`);
  if (d.requirements.process.length !== 14) err("requirements", "process", `expected 14 process groups, found ${d.requirements.process.length}`);
  for (const [kind, groups] of [["general", d.requirements.general], ["process", d.requirements.process]]) {
    for (const g of groups) {
      const pattern = kind === "general" ? PATTERNS.general : PATTERNS.processGroup;
      if (!pattern.test(g.id || "")) err("requirements", g.id || "?", `id does not match ${pattern}`);
      if (groupIds.has(g.id)) err("requirements", g.id, "duplicate group id");
      groupIds.add(g.id);
      hasSource("requirements", g.id, g.source);
      if (kind === "general" && !g.name) err("requirements", g.id, "missing name");
      if (kind === "process") {
        if (!codes.has(g.process)) err("requirements", g.id, `process "${g.process}" does not exist`);
        else if (groupByProcess.has(g.process)) err("requirements", g.id, `process "${g.process}" already has group ${groupByProcess.get(g.process)}`);
        else groupByProcess.set(g.process, g.id);
      }
      if (!Array.isArray(g.items) || !g.items.length) err("requirements", g.id, "items is empty");
      for (const item of g.items || []) {
        if (!item.id || !item.id.startsWith(`${g.id}.`)) err("requirements", item.id || `${g.id}.?`, `id must start with "${g.id}."`);
        if (reqIds.has(item.id)) err("requirements", item.id, "duplicate requirement id");
        reqIds.add(item.id);
        if (!item.text) err("requirements", item.id, "missing text");
        hasSource("requirements", item.id, item.source);
      }
    }
  }
  for (const p of d.processes) {
    if (!groupByProcess.has(p.code)) err("requirements", "process", `no requirement group for process "${p.code}"`);
    if (p.requirements && groupByProcess.get(p.code) !== p.requirements) err("processes", p.code, `requirements "${p.requirements}" does not match group ${groupByProcess.get(p.code) || "(none)"}`);
  }

  // Roles
  for (const kind of ["owner", "manager", "case-owner", "staff"]) {
    const g = d.roles.generic[kind];
    if (!isObj(g) || !Array.isArray(g.tasks) || !g.tasks.length) err("roles", `generic.${kind}`, "missing generic tasks");
    else hasSource("roles", `generic.${kind}`, g.source);
  }
  const roleIds = new Set();
  const kindsByProcess = new Map();
  for (const r of d.roles.roles) {
    const item = r.id || "?";
    const [proc, slug] = (r.id || "").split(".");
    if (!proc || !slug || !PATTERNS.slug.test(slug) || proc !== r.process) err("roles", item, "id must be <process>.<slug>");
    if (roleIds.has(r.id)) err("roles", item, "duplicate role id");
    roleIds.add(r.id);
    if (!codes.has(r.process)) err("roles", item, `process "${r.process}" does not exist`);
    if (!ROLE_KINDS.includes(r.kind)) err("roles", item, `kind "${r.kind}" is not one of ${ROLE_KINDS.join(", ")}`);
    if (!r.name) err("roles", item, "missing name");
    hasSource("roles", item, r.source);
    for (const [i, t] of (r.tasks || []).entries()) {
      if (!t.text) err("roles", `${item}.tasks[${i}]`, "missing text");
      hasSource("roles", `${item}.tasks[${i}]`, t.source);
    }
    if (!kindsByProcess.has(r.process)) kindsByProcess.set(r.process, new Set());
    kindsByProcess.get(r.process).add(r.kind);
  }

  // Activities
  const activityIds = new Set();
  const activitiesByProcess = new Map();
  for (const a of d.activities) {
    const item = a.id || "?";
    if (!PATTERNS.activity.test(a.id || "") || !a.id.startsWith(`${a.process}.`)) err("activities", item, "id must be <process>.A<n> or <process>.S");
    if (activityIds.has(a.id)) err("activities", item, "duplicate activity id");
    activityIds.add(a.id);
    if (!codes.has(a.process)) err("activities", item, `process "${a.process}" does not exist`);
    if (!a.name) err("activities", item, "missing name");
    if (!Array.isArray(a.procedure) || !a.procedure.length) err("activities", item, "procedure is empty");
    hasSource("activities", item, a.source);
    activitiesByProcess.set(a.process, (activitiesByProcess.get(a.process) || 0) + 1);
  }

  // Records
  const recordIds = new Set();
  for (const r of d.records) {
    const item = r.id || "?";
    if (!PATTERNS.slug.test(r.id || "")) err("records", item, "id must be a slug");
    if (recordIds.has(r.id)) err("records", item, "duplicate record id");
    recordIds.add(r.id);
    if (!r.name) err("records", item, "missing name");
    if (!isObj(r.definition) || !r.definition.text) err("records", item, "missing definition");
    else hasSource("records", `${item}.definition`, r.definition.source);
    if (!Array.isArray(r.usedBy) || !r.usedBy.length) err("records", item, "usedBy is empty");
    for (const [i, u] of (r.usedBy || []).entries()) {
      if (!codes.has(u.process)) err("records", `${item}.usedBy[${i}]`, `process "${u.process}" does not exist`);
      if (u.derived !== true) warn("records", `${item}.usedBy[${i}]`, "derived is not true; FitSM does not list records per process");
      hasSource("records", `${item}.usedBy[${i}]`, u.source);
    }
  }

  // Interfaces
  const interfaceIds = new Set();
  for (const i of d.interfaces) {
    const item = i.id || "?";
    const [a, b] = i.processes || [];
    if (!a || !b || a === b || !codes.has(a) || !codes.has(b)) {
      for (const c of [a, b]) if (c && !codes.has(c)) err("interfaces", item, `process "${c}" does not exist`);
      if (a && a === b) err("interfaces", item, "the two processes must differ");
      if (!a || !b) err("interfaces", item, "processes must list two codes");
    }
    const expected = [a, b].filter(Boolean).sort().join("-");
    if (i.id !== expected) err("interfaces", item, `id must be "${expected}" (codes in alphabetical order)`);
    if (interfaceIds.has(i.id)) err("interfaces", item, "duplicate interface");
    interfaceIds.add(i.id);
    const descriptions = i.descriptions || [];
    const flows = i.flows || [];
    if (!descriptions.length && !flows.length) err("interfaces", item, "no description and no flow");
    for (const [k, desc] of descriptions.entries()) {
      if (!desc.text) err("interfaces", `${item}.descriptions[${k}]`, "missing text");
      hasSource("interfaces", `${item}.descriptions[${k}]`, desc.source);
    }
    for (const [k, f] of flows.entries()) {
      const fi = `${item}.flows[${k}]`;
      if (![a, b].includes(f.from) || ![a, b].includes(f.to) || f.from === f.to) err("interfaces", fi, `flow ${f.from} → ${f.to} is not between ${a} and ${b}`);
      if (!f.item) err("interfaces", fi, "missing item");
      hasSource("interfaces", fi, f.source);
    }
    itemsChecked++;
  }

  // 7. Completeness per process (roles, activities, line membership)
  const lineMembership = new Map();
  for (const line of d.map.lines) for (const s of line.stations || []) lineMembership.set(s, (lineMembership.get(s) || 0) + 1);
  for (const p of d.processes) {
    const kinds = kindsByProcess.get(p.code) || new Set();
    for (const kind of ["owner", "manager", "staff"]) if (!kinds.has(kind)) err("roles", p.code, `no role of kind "${kind}"`);
    if (!activitiesByProcess.get(p.code)) err("activities", p.code, "no activity");
    if (!lineMembership.get(p.code)) err("map", "lines", `process "${p.code}" is on no line`);
  }

  // 10. Map
  const { grid, stations, routes, lines, transfer, background } = d.map;
  const cells = new Map();
  for (const [code, s] of Object.entries(stations)) {
    if (!codes.has(code)) err("map", `stations.${code}`, `process "${code}" does not exist`);
    if (!Number.isInteger(s.x) || !Number.isInteger(s.y) || s.x < 0 || s.y < 0 || s.x > grid.cols || s.y > grid.rows) err("map", `stations.${code}`, "position is outside the grid");
    if (!SIDES.includes(s.label)) err("map", `stations.${code}`, `label "${s.label}" is not n, s, e or w`);
    const cell = `${s.x},${s.y}`;
    if (cells.has(cell)) err("map", `stations.${code}`, `shares cell ${cell} with ${cells.get(cell)}`);
    cells.set(cell, code);
  }
  for (const code of codes) if (!stations[code]) err("map", "stations", `no station for process "${code}"`);
  for (const id of interfaceIds) if (!routes[id]) err("map", "routes", `no route for interface "${id}"`);
  for (const [id, waypoints] of Object.entries(routes)) {
    if (!interfaceIds.has(id)) {
      err("map", `routes.${id}`, "no interface with this id");
      continue;
    }
    const [a, b] = id.split("-");
    if (!stations[a] || !stations[b] || !Array.isArray(waypoints)) continue;
    const points = [[stations[a].x, stations[a].y], ...waypoints, [stations[b].x, stations[b].y]];
    for (let k = 1; k < points.length; k++) {
      const dx = Math.abs(points[k][0] - points[k - 1][0]);
      const dy = Math.abs(points[k][1] - points[k - 1][1]);
      if (!(dx === 0 || dy === 0 || dx === dy)) err("map", `routes.${id}`, `segment ${k} from (${points[k - 1]}) to (${points[k]}) is not horizontal, vertical or 45°`);
    }
  }
  const lineIds = new Set();
  if (!PATTERNS.colour.test(background || "")) err("map", "background", `colour "${background}" is not #rrggbb`);
  if (!PATTERNS.colour.test(transfer.colour || "")) err("map", "transfer", `colour "${transfer.colour}" is not #rrggbb`);
  else checkContrast("transfer", transfer.colour);
  // The transfer stroke must be thinner than the 6 px line stroke (FR-003).
  if (typeof transfer.width !== "number" || !(transfer.width >= 1 && transfer.width <= 10 && transfer.width < 6)) {
    err("map", "transfer", `width ${transfer.width} is not a number between 1 and 10 below the line stroke`);
  }
  if (grid.margin !== undefined) {
    const m = grid.margin;
    if (!isObj(m) || !Number.isInteger(m.x) || !Number.isInteger(m.y) || m.x < 0 || m.y < 0) {
      err("map", "grid.margin", "x and y must be non-negative integers");
    }
  }
  for (const line of lines) {
    const item = `lines.${line.id || "?"}`;
    if (!PATTERNS.slug.test(line.id || "")) err("map", item, "id must be a slug");
    if (lineIds.has(line.id)) err("map", item, "duplicate line id");
    lineIds.add(line.id);
    if (!line.name) err("map", item, "missing name");
    if (!Array.isArray(line.stations) || line.stations.length < 2) err("map", item, "a line needs at least two stations");
    for (const s of line.stations || []) if (!codes.has(s)) err("map", item, `process "${s}" does not exist`);
    // labelSide is optional: line names are shown in the legend, not on the map.
    if (line.labelSide !== undefined) {
      if (!SIDES.includes(line.labelSide)) err("map", item, `labelSide "${line.labelSide}" is not n, s, e or w`);
      const first = stations[(line.stations || [])[0]];
      if (first && first.label === line.labelSide) err("map", item, `labelSide "${line.labelSide}" is the same side as station ${line.stations[0]}'s label`);
    }
    if (!PATTERNS.colour.test(line.colour || "")) err("map", item, `colour "${line.colour}" is not #rrggbb`);
    else checkContrast(item, line.colour);
    // 12. Connectivity through same-line connections (warning)
    const members = (line.stations || []).filter((s) => codes.has(s));
    if (members.length >= 2) {
      const adjacency = new Map(members.map((m) => [m, []]));
      for (const i of d.interfaces) {
        const [a, b] = i.processes || [];
        if (adjacency.has(a) && adjacency.has(b)) { adjacency.get(a).push(b); adjacency.get(b).push(a); }
      }
      const seen = new Set([members[0]]);
      const queue = [members[0]];
      while (queue.length) for (const n of adjacency.get(queue.shift())) if (!seen.has(n)) { seen.add(n); queue.push(n); }
      const unreachable = members.filter((m) => !seen.has(m));
      if (unreachable.length) warn("map", item, `stations ${members[0]} and ${unreachable.join(", ")} are not connected through this line`);
    }
    itemsChecked++;
  }
  itemsChecked += d.processes.length;

  function checkContrast(item, colour) {
    if (!PATTERNS.colour.test(background || "")) return;
    const ratio = contrast(colour, background);
    if (ratio < 3) err("map", item, `colour ${colour} has contrast ${ratio.toFixed(1)}:1 against background (needs 3:1)`);
  }
}

/* ---------- 13. scripts parse ---------- */

function checkScripts() {
  const files = [];
  if (existsSync("src")) for (const f of readdirSync("src")) if (f.endsWith(".js")) files.push(join("src", f));
  files.push(join("scripts", "check.js"));
  for (const file of files) {
    if (!existsSync(file)) continue;
    try {
      execFileSync(process.execPath, ["--check", file], { stdio: "pipe" });
    } catch (e) {
      report("error", "", file, "syntax", String(e.stderr || e.message).trim().split("\n").pop());
    }
    itemsChecked++;
  }
}

/* ---------- helpers ---------- */

function isObj(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

/* WCAG 2.1 relative luminance and contrast ratio. */
function luminance(hex) {
  const channel = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const n = parseInt(hex.slice(1), 16);
  return 0.2126 * channel(n >> 16) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
}
function contrast(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}
