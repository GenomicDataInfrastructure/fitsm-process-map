// SPDX-FileCopyrightText: 2026 PNED G.I.E.
//
// SPDX-License-Identifier: Apache-2.0

/*
 * Consistency checks for the FitSM Process Map. No dependencies: `node scripts/check.js`.
 * - fitsm-data.js loads and every cross-reference (interfaces, "used by", groups) resolves
 * - every process has requirements, roles with tasks, databases and activities with procedures
 * - nodes and routed arrows stay inside the diagram's viewBox
 * - the inline script in index.html is valid JavaScript and the data file is referenced
 */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const errors = [];
const fail = msg => errors.push(msg);

/* ── Load data ───────────────────────────── */
const ctx = {};
vm.createContext(ctx);
try {
  const src = fs.readFileSync(path.join(root, "fitsm-data.js"), "utf8");
  vm.runInContext(`${src}\n;this.__data = { GROUPS, GENERIC_TASKS, PROCESSES, INTERFACES, ANY_INTERFACES };`, ctx, { filename: "fitsm-data.js" });
} catch (e) {
  console.error(`fitsm-data.js failed to load: ${e.message}`);
  process.exit(1);
}
const { GROUPS, GENERIC_TASKS, PROCESSES, INTERFACES, ANY_INTERFACES } = ctx.__data;

/* ── Processes ───────────────────────────── */
const VIEW = { w: 1260, h: 800 }, NODE = { hw: 78, hh: 33 };
const ids = new Set();
if (PROCESSES.length !== 14) fail(`expected 14 processes, found ${PROCESSES.length}`);

PROCESSES.forEach((p, i) => {
  const at = `process ${p.id || "#" + i}`;
  if (!p.id || ids.has(p.id)) fail(`${at}: missing or duplicate id`);
  ids.add(p.id);
  if (!/^PR\d+$/.test(p.num)) fail(`${at}: invalid number "${p.num}"`);
  if (!GROUPS[p.group]) fail(`${at}: unknown group "${p.group}"`);
  if (!p.name || !p.objective) fail(`${at}: missing name or objective`);

  const { x, y } = p.pos || {};
  if (!(x - NODE.hw >= 0 && x + NODE.hw <= VIEW.w && y - NODE.hh >= 0 && y + NODE.hh <= VIEW.h)) fail(`${at}: node at (${x}, ${y}) is outside the diagram`);

  if (!p.requirements.length) fail(`${at}: no requirements`);
  p.requirements.forEach(([rid, text]) => {
    if (!rid.startsWith(p.num + ".")) fail(`${at}: requirement ${rid} does not belong to ${p.num}`);
    if (!text) fail(`${at}: requirement ${rid} has no text`);
  });

  if (!p.roles.length) fail(`${at}: no roles`);
  p.roles.forEach(r => {
    const generic = r.noGeneric ? [] : (GENERIC_TASKS[r.type] || []);
    if (!r.name || !r.count) fail(`${at}: role without name or count`);
    if (!r.specific.length && !generic.length) fail(`${at}: role "${r.name}" has no tasks`);
  });

  if (!p.databases.length) fail(`${at}: no databases`);
  p.databases.forEach(d => {
    if (!d.name || !d.desc || !d.src) fail(`${at}: database "${d.name}" is missing name, description or source`);
    (d.usedBy || []).forEach(u => { if (!PROCESSES.some(q => q.id === u)) fail(`${at}: database "${d.name}" used by unknown process "${u}"`); });
  });

  if (!p.activities.length) fail(`${at}: no activities`);
  p.activities.forEach(a => { if (!a.procedures.length) fail(`${at}: activity "${a.name}" has no procedures`); });
});

/* ── Interfaces ──────────────────────────── */
const pairs = new Set();
INTERFACES.forEach((f, i) => {
  const at = `interface #${i} ${f.from}→${f.to}`;
  if (!ids.has(f.from) || !ids.has(f.to)) fail(`${at}: unknown process`);
  if (f.from === f.to) fail(`${at}: points to itself`);
  if (pairs.has(f.from + ">" + f.to)) fail(`${at}: duplicate`);
  pairs.add(f.from + ">" + f.to);
  if (!f.items || !f.items.length) fail(`${at}: no inputs/outputs listed`);
  if (!f.sender || !f.receiver) fail(`${at}: missing relationship description`);
  (f.route || []).forEach(([x, y]) => {
    if (!(x >= 0 && x <= VIEW.w && y >= 0 && y <= VIEW.h)) fail(`${at}: route point (${x}, ${y}) is outside the diagram`);
  });
});
ANY_INTERFACES.forEach((a, i) => {
  if (!ids.has(a.process)) fail(`"any" interface #${i}: unknown process "${a.process}"`);
  if (!["in", "out"].includes(a.dir)) fail(`"any" interface #${i}: dir must be "in" or "out"`);
});

/* ── Page ────────────────────────────────── */
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
if (!/<script src="fitsm-data\.js"/.test(html)) fail("index.html does not load fitsm-data.js");
const inline = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
if (!inline.length) fail("index.html has no inline script");
inline.forEach((code, i) => {
  try { new vm.Script(code, { filename: `index.html inline script #${i}` }); }
  catch (e) { fail(`index.html inline script #${i}: ${e.message}`); }
});

/* ── Report ──────────────────────────────── */
if (errors.length) {
  console.error(`✗ ${errors.length} problem(s):\n` + errors.map(e => "  - " + e).join("\n"));
  process.exit(1);
}
console.log(`✓ ${PROCESSES.length} processes, ${INTERFACES.length} interfaces (+${ANY_INTERFACES.length} "any"), page script OK`);
