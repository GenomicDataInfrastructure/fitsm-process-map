// SPDX-FileCopyrightText: 2026 PNED G.I.E.
//
// SPDX-License-Identifier: CC-BY-4.0

import { test } from "node:test";
import assert from "node:assert/strict";
import { chartScale, lineColour, elementLink, chartOutline, renderChart, arrowPoints, text, LABEL_SIZE } from "../src/chart.js";
import { labelState } from "../src/content.js";

// A small chart in the shape of FitSM-2's PM chart: two groups, a branch, objects, an external end.
const chart = {
  process: "PM",
  source: { doc: "FitSM-2", section: "PR10", page: 33 },
  size: { w: 300, h: 200 },
  notes: [],
  elements: [
    { id: "identify", kind: "group", activity: "PM.A1", label: "Identify problems", x: 100, y: 0, w: 180, h: 60 },
    { id: "trend", kind: "step", group: "identify", label: "Perform trend\nanalysis", x: 110, y: 25, w: 70, h: 25 },
    { id: "register", kind: "step", group: "identify", label: "Register problem", mark: "record", x: 200, y: 25, w: 70, h: 25 },
    { id: "handle", kind: "group", activity: "PM.A2", label: "Handle problems", x: 100, y: 80, w: 180, h: 100 },
    { id: "close", kind: "step", group: "handle", label: "Close", x: 200, y: 140, w: 70, h: 25 },
    { id: "classify", kind: "step", group: "handle", label: "Classify", x: 110, y: 100, w: 70, h: 25 },
    { id: "lonely", kind: "step", group: "handle", label: "Unlinked step", x: 110, y: 145, w: 70, h: 25 },
    { id: "assess", kind: "step", group: "handle", label: "Assess", x: 200, y: 100, w: 70, h: 25 },
    { id: "trend-info", kind: "object", shape: "document", fill: "grey", label: "Trend information", x: 0, y: 25, w: 80, h: 25 },
    { id: "problem-new", kind: "object", shape: "document", fill: "white", label: "Problem\n[new]", record: "problem", x: 0, y: 100, w: 80, h: 25 },
    { id: "to-chm", kind: "external", process: "CHM", direction: "to", label: "to CHM", x: 280, y: 100, w: 20, h: 14 },
    { id: "to-xyz", kind: "external", process: "SLM", direction: "to", label: "to SLM", x: 280, y: 150, w: 20, h: 14 },
  ],
  arrows: [
    { from: "trend-info", to: "trend", kind: "flow" },
    { from: "trend", to: "register", kind: "sequence" },
    { from: "register", to: "problem-new", kind: "flow", points: [[150, 70], [40, 70]] },
    { from: "problem-new", to: "classify", kind: "flow" },
    { from: "classify", to: "assess", kind: "sequence" },
    { from: "assess", to: "close", kind: "sequence", label: "Yes" },
    { from: "assess", to: "problem-new", kind: "flow", heads: "both" },
  ],
};
const model = {
  records: new Map([["problem", { id: "problem", name: "Problem" }]]),
  interfaces: new Map([["CHM-PM", { id: "CHM-PM" }]]),
  processes: new Map([["CHM", { name: "Change Management" }], ["SLM", { name: "Service Level Management" }]]),
};

test("chartScale keeps labels at least 12 px high", () => {
  assert.deepEqual(chartScale(chart, 600), { scale: 2, minWidth: 480, width: 600 });
  const narrow = chartScale(chart, 200);
  assert.equal(narrow.width, 480);
  assert.equal(narrow.scale * LABEL_SIZE, 12);
});

test("lineColour splits a segment where it crosses a group", () => {
  const pieces = lineColour([[50, 30], [150, 30]], chart);
  assert.deepEqual(pieces.map((p) => p.tone), ["dark", "light"]);
  assert.deepEqual(pieces[0].to, [100, 30]);
  assert.deepEqual(lineColour([[0, 70], [90, 70]], chart).map((p) => p.tone), ["dark"]);
  assert.deepEqual(lineColour([[120, 40], [190, 40]], chart).map((p) => p.tone), ["light"]);
});

test("labelState reads the bracketed state, across line breaks", () => {
  assert.equal(labelState("Problem\n[known error]"), "known error");
  assert.equal(labelState("CMDB"), null);
  assert.equal(text("Problem\n[new]"), "Problem [new]");
});

test("elementLink sends each kind of element to its view", () => {
  const by = (id) => chart.elements.find((e) => e.id === id);
  assert.equal(elementLink(by("identify"), chart, model), "#activity/PM.A1");
  assert.equal(elementLink(by("register"), chart, model), "#activity/PM.A1");
  assert.equal(elementLink(by("problem-new"), chart, model), "#record/problem");
  assert.equal(elementLink(by("trend-info"), chart, model), null);
  assert.equal(elementLink(by("to-chm"), chart, model), "#CHM-PM");
  assert.equal(elementLink(by("to-xyz"), chart, model), "#SLM");
});

test("chartOutline lists groups in reading order and steps in sequence order", () => {
  const o = chartOutline(chart, model);
  assert.deepEqual(o.groups.map((g) => g.label), ["Identify problems", "Handle problems"]);
  assert.deepEqual(o.groups[0].steps.map((s) => s.label), ["Perform trend analysis", "Register problem"]);
  // Sequence first (Classify → Assess → Close), then the unreached step in reading order.
  assert.deepEqual(o.groups[1].steps.map((s) => s.label), ["Classify", "Assess", "Close", "Unlinked step"]);
  const register = o.groups[0].steps[1];
  assert.equal(register.record, true);
  assert.deepEqual(register.produces, ["Problem [new]"]);
  assert.deepEqual(o.groups[0].steps[0].reads, ["Trend information"]);
  // A two-headed flow counts both ways.
  const assess = o.groups[1].steps[1];
  assert.deepEqual(assess.reads, ["Problem [new]"]);
  assert.deepEqual(assess.produces, ["Problem [new]"]);
  assert.deepEqual(o.objects.map((x) => [x.label, x.state, x.record?.id ?? null]), [
    ["Trend information", null, null], ["Problem [new]", "new", "problem"],
  ]);
  assert.equal(o.arrows.length, chart.arrows.length);
  assert.deepEqual(o.arrows[5], { from: "Assess", to: "Close", kind: "sequence", heads: "end", label: "Yes" });
});

test("arrowPoints starts and ends on the element edges, through the bends", () => {
  const byId = new Map(chart.elements.map((e) => [e.id, e]));
  const pts = arrowPoints(chart.arrows[2], byId, chart);
  assert.deepEqual(pts.slice(1, 3), [[150, 70], [40, 70]]);
  assert.equal(pts[0][1], 50); // bottom edge of "Register problem"
  assert.equal(pts[3][1], 100); // top edge of "Problem [new]"
});

test("renderChart links every linkable element, in reading order, and nothing else", () => {
  const el = (name, attrs = {}, children = []) => ({ name, attrs, children });
  const svg = renderChart(chart, model, el);
  const links = [];
  const walk = (n) => { if (!n || typeof n !== "object") return; if (n.name === "a") links.push(n.attrs.href); (n.children || []).forEach(walk); };
  walk(svg);
  assert.deepEqual(links, [
    "#activity/PM.A1", "#activity/PM.A1", "#activity/PM.A1",
    "#activity/PM.A2", "#activity/PM.A2", "#activity/PM.A2", "#activity/PM.A2", "#activity/PM.A2",
    "#record/problem", "#CHM-PM", "#SLM",
  ]);
  assert.equal(svg.attrs.viewBox, "0 0 300 200");
});

test("a bend on the target's edge becomes the arrow's end; external arrows point away for \"to\"", () => {
  const byId = new Map(chart.elements.map((e) => [e.id, e]));
  const pts = arrowPoints({ from: "classify", to: "close", kind: "sequence", points: [[195, 112], [195, 150], [200, 150]] }, byId, chart);
  assert.deepEqual(pts.at(-1), [200, 150]); // on the left edge of "Close", off its centre line
  assert.equal(pts.length, 4);
  const el = (name, attrs = {}, children = []) => ({ name, attrs, children });
  const lines = [];
  const walk = (n) => { if (!n || typeof n !== "object") return; if (n.name === "line") lines.push(n.attrs); (n.children || []).forEach(walk); };
  walk(renderChart(chart, model, el));
  // "to CHM" sits on the right: tail at its left end, head at its right end.
  assert.ok(lines[0].x2 > lines[0].x1);
  const left = { ...chart, elements: chart.elements.map((e) => (e.id === "to-chm" ? { ...e, x: 0 } : e)) };
  const leftLines = [];
  const walk2 = (n) => { if (!n || typeof n !== "object") return; if (n.name === "line") leftLines.push(n.attrs); (n.children || []).forEach(walk2); };
  walk2(renderChart(left, model, el));
  assert.ok(leftLines[0].x2 < leftLines[0].x1); // on the left it points left, away from the chart
});
