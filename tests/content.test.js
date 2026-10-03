// SPDX-FileCopyrightText: 2026 PNED G.I.E.
//
// SPDX-License-Identifier: CC-BY-4.0

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { buildModel, loadContent, FILES } from "../src/content.js";

const here = dirname(fileURLToPath(import.meta.url));
const fixture = join(here, "fixtures", "valid");

function readFixture(dir) {
  const files = {};
  for (const name of FILES) files[name] = JSON.parse(readFileSync(join(dir, `${name}.json`), "utf8"));
  return files;
}

test("buildModel indexes every entity by id", () => {
  const model = buildModel(readFixture(fixture));
  assert.equal(model.processes.size, 14);
  assert.equal(model.requirementGroups.size, 21);
  assert.equal(model.requirements.size, 21);
  assert.ok(model.roles.has("AA.manager"));
  assert.ok(model.activities.has("AA.A1"));
  assert.ok(model.records.has("record"));
  assert.ok(model.interfaces.has("AA-BB"));
  assert.equal(model.lines.size, 2);
});

test("buildModel derives the reverse indexes", () => {
  const model = buildModel(readFixture(fixture));
  const aa = model.processes.get("AA");
  assert.deepEqual(aa.roles.map((r) => r.id), ["AA.owner", "AA.manager", "AA.staff", "AA.case-owner"]);
  assert.deepEqual(aa.activities.map((a) => a.id), ["AA.S", "AA.A1"]);
  assert.deepEqual(aa.records.map((r) => r.id), ["record"]);
  assert.deepEqual(aa.interfaces.map((i) => i.id), ["AA-BB"]);
  assert.equal(aa.requirementGroup.id, "PR1");
  assert.equal(aa.externalFlows.length, 1);
  assert.deepEqual(model.records.get("record").processes, ["AA", "BB"]);
  const iface = model.interfaces.get("AA-BB");
  assert.deepEqual([...iface.directions.keys()], ["AA", "BB"]);
  assert.equal(iface.directions.get("AA")[0].item, "Records");
  assert.equal(model.requirements.get("GR1.1").group.kind, "general");
  assert.equal(model.requirements.get("PR1.1").group.kind, "process");
});

test("buildModel tolerates missing optional fields", () => {
  const files = readFixture(fixture);
  delete files.processes[0].externalFlows;
  delete files.interfaces[1].descriptions;
  const model = buildModel(files);
  assert.deepEqual(model.processes.get("AA").externalFlows, []);
  assert.deepEqual(model.interfaces.get("BB-CC").descriptions, []);
});

function fakeFetch(dir, { failOn } = {}) {
  return async (url) => {
    const rel = url.replace(/^content\//, "");
    if (failOn && rel.endsWith(failOn)) return { ok: false, json: async () => ({}) };
    const path = rel === "editions.json" ? join(dir, "editions.json") : join(dir, rel);
    const text = readFileSync(path, "utf8");
    return { ok: true, json: async () => JSON.parse(text) };
  };
}

test("loadContent reads editions.json and the current edition", async () => {
  const dir = join(here, "fixtures", "two-editions");
  const loaded = await loadContent(fakeFetch(dir), "content/");
  assert.equal(loaded.current.id, "good");
  assert.equal(loaded.model.processes.size, 14);
});

test("loadContent names the file that failed", async () => {
  const dir = join(here, "fixtures", "two-editions");
  await assert.rejects(loadContent(fakeFetch(dir, { failOn: "roles.json" }), "content/"), /^Error: Could not load content\/good\/roles\.json$/);
  await assert.rejects(loadContent(fakeFetch(dir, { failOn: "editions.json" }), "content/"), /^Error: Could not load content\/editions\.json$/);
});

test("loadContent rejects an editions file whose current edition is not listed", async () => {
  const dir = join(here, "fixtures", "editions");
  await assert.rejects(loadContent(fakeFetch(dir), "content/"), /current edition "nope" is not listed/);
});
