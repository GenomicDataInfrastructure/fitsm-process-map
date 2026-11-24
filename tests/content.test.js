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
  assert.deepEqual(aa.records.maintains.map((r) => r.id), []);
  assert.deepEqual(aa.records.uses.map((r) => r.id), ["report"]);
  assert.deepEqual(model.processes.get("CC").records.maintains.map((r) => r.id), ["report"]);
  assert.deepEqual(aa.interfaces.map((i) => i.id), ["AA-BB"]);
  assert.equal(aa.requirementGroup.id, "PR1");
  assert.equal(aa.externalFlows.length, 1);
  assert.deepEqual(model.records.get("report").processes, ["CC", "AA"]);
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

test("buildModel resolves each kind of relationship basis", () => {
  const files = readFixture(fixture);
  files.records = [
    { id: "record", name: "Record", general: true, definition: files.records[0].definition, relations: [{ process: "AA", kind: "maintains", basis: { output: "AA", match: "A record" } }] },
    {
      id: "thing", name: "Thing", definition: files.records[1].definition,
      relations: [
        { process: "AA", kind: "maintains", basis: { activity: "AA.A1", match: "Step two" } },
        { process: "BB", kind: "uses", basis: { input: "BB", match: "An input" } },
        { process: "CC", kind: "maintains", basis: { output: "CC", match: "A record" } },
        { process: "DD", kind: "uses", basis: { flow: "AA-BB", match: "Reports" } },
        { process: "EE", kind: "uses", basis: { output: "EE", match: "not in the text" } },
      ],
    },
  ];
  const model = buildModel(files);
  const [activity, input, output, flow, missing] = model.records.get("thing").relations.map((r) => r.resolved);
  assert.deepEqual(activity, { kind: "activity", text: "Step two", source: model.activities.get("AA.A1").source, link: "#activity/AA.A1", label: model.activities.get("AA.A1").name });
  assert.equal(input.kind, "input");
  assert.equal(input.text, "An input");
  assert.equal(output.text, "A record");
  assert.equal(flow.link, "#AA-BB");
  assert.equal(flow.text, "Reports");
  assert.equal(missing, null);
  // Grouped by kind on processes and on the activity the basis names.
  assert.deepEqual(model.activities.get("AA.A1").records.maintains.map((r) => r.id), ["thing"]);
  assert.deepEqual(model.activities.get("AA.S").records.maintains, []);
  assert.deepEqual(model.processes.get("BB").records.uses.map((r) => r.id), ["thing"]);
  // The general record appears in no process or activity list.
  assert.deepEqual(model.processes.get("AA").records.maintains.map((r) => r.id), ["thing"]);
});

test("buildModel orders the records overview by FitSM process order, then by name", () => {
  const files = readFixture(fixture);
  const def = files.records[1].definition;
  const rel = (process, kind, match = "A record") => ({ process, kind, basis: { output: process, match } });
  files.records = [
    files.records[0],
    { id: "zeta", name: "Zeta", definition: def, relations: [rel("BB", "maintains"), rel("AA", "uses")] },
    { id: "alpha", name: "Alpha", definition: def, relations: [rel("BB", "maintains")] },
    { id: "first", name: "First", definition: def, relations: [rel("AA", "maintains"), rel("CC", "uses")] },
    { id: "loose", name: "Loose", definition: def, relations: [rel("CC", "uses")] },
  ];
  const { overview } = buildModel(files);
  assert.equal(overview.general.id, "record");
  assert.equal(overview.processes.length, 14);
  assert.deepEqual(overview.processes.slice(0, 3), ["AA", "BB", "CC"]);
  assert.deepEqual(overview.rows.map((r) => r.record.id), ["first", "alpha", "zeta", "loose"]);
  const zeta = overview.rows.find((r) => r.record.id === "zeta");
  assert.deepEqual([...zeta.cells], [["BB", "maintains"], ["AA", "uses"]]);
});

test("buildModel attaches each process's chart and lists, per record, the charts that draw it", () => {
  const files = readFixture(fixture);
  const report = { id: "rep", kind: "object", shape: "document", fill: "white", x: 0, y: 0, w: 10, h: 10 };
  files.charts[0].elements.push({ ...report, label: "Report\n[draft]", record: "report" }, { ...report, id: "rep2", label: "Report [final]", record: "report" });
  files.charts[1].elements.push({ ...report, label: "Report", record: "report" });
  const model = buildModel(files);
  assert.equal(model.processes.get("AA").chart.process, "AA");
  assert.deepEqual(model.records.get("report").charts, [{ process: "AA", states: ["draft", "final"] }, { process: "BB", states: [] }]);
  assert.deepEqual(model.records.get("record").charts, []);
});
