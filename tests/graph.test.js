// SPDX-FileCopyrightText: 2026 PNED G.I.E.
//
// SPDX-License-Identifier: CC-BY-4.0

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  stationLines, isInterchange, connectionLine, connectionLabel,
  stationLabel, interfaceLabel,
} from "../src/graph.js";

const model = {
  map: {
    lines: [
      { id: "ops", name: "Operations", colour: "#c62828", stations: ["ISRM", "PM"], labelSide: "n" },
      { id: "ctl", name: "Control", colour: "#6a1b9a", stations: ["PM", "CHM"], labelSide: "s" },
      { id: "all", name: "Everything", colour: "#000000", stations: ["ISRM", "PM", "CHM"], labelSide: "e" },
    ],
    stations: { ISRM: { x: 2, y: 6, label: "s" }, PM: { x: 5, y: 6, label: "s" }, CHM: { x: 7, y: 8, label: "s" } },
  },
  processes: new Map([
    ["ISRM", { name: "Incident and service request management" }],
    ["PM", { name: "Problem management" }],
    ["CHM", { name: "Change management" }],
  ]),
  interfaces: new Map([
    ["ISRM-PM", { processes: ["ISRM", "PM"] }],
    ["CHM-PM", { processes: ["CHM", "PM"] }],
    ["CHM-ISRM", { processes: ["CHM", "ISRM"] }],
  ]),
};

test("stationLines and isInterchange", () => {
  assert.deepEqual(stationLines("ISRM", model).map((l) => l.id), ["ops", "all"]);
  assert.deepEqual(stationLines("PM", model).map((l) => l.id), ["ops", "ctl", "all"]);
  assert.equal(isInterchange("PM", model), true);
  assert.equal(isInterchange("ISRM", model), true);
  assert.equal(isInterchange("XYZ", model), false);
});

test("connectionLine picks the first shared line in file order", () => {
  assert.equal(connectionLine("ISRM-PM", model).id, "ops"); // shared by ops and all; ops is first
  assert.equal(connectionLine("CHM-PM", model).id, "ctl");
  assert.equal(connectionLine("CHM-ISRM", model).id, "all");
});

test("connectionLine is null for a transfer and for an unknown id", () => {
  const noShared = { ...model, map: { ...model.map, lines: model.map.lines.slice(0, 2) } };
  assert.equal(connectionLine("CHM-ISRM", noShared), null);
  assert.equal(connectionLabel("CHM-ISRM", noShared), "transfer between lines");
  assert.equal(connectionLine("XX-YY", model), null);
});

test("labels name lines in words", () => {
  assert.equal(connectionLabel("ISRM-PM", model), "Operations line");
  assert.equal(stationLabel("CHM", model), "Change management, CHM, on the Control and Everything lines");
  assert.equal(stationLabel("PM", model), "Problem management, PM, on the Operations, Control and Everything lines");
  assert.equal(interfaceLabel("ISRM-PM", model), "Interface between Incident and service request management and Problem management, Operations line");
});
