// SPDX-FileCopyrightText: 2026 PNED G.I.E.
//
// SPDX-License-Identifier: CC-BY-4.0

import { test } from "node:test";
import assert from "node:assert/strict";
import { intersection, yieldingPath, selectionState } from "../src/map.js";

test("intersection finds crossings strictly inside both segments", () => {
  const hit = intersection([0, 0], [10, 10], [0, 10], [10, 0]);
  assert.ok(hit);
  assert.deepEqual(hit.point, [5, 5]);
  assert.equal(hit.t, 0.5);
  assert.equal(intersection([0, 0], [10, 0], [0, 5], [10, 5]), null, "parallel");
  assert.equal(intersection([0, 0], [10, 0], [10, -5], [10, 5]), null, "touching at an end point");
  assert.equal(intersection([0, 0], [10, 0], [20, -5], [20, 5]), null, "disjoint");
});

test("yieldingPath leaves a gap with ticks at a crossing and nothing elsewhere", () => {
  const straight = yieldingPath([[0, 0], [100, 0]], []);
  assert.equal(straight, "M0 0 L100 0");
  const crossed = yieldingPath([[0, 0], [100, 0]], [[[50, -50], [50, 50]]]);
  // One gap centred on x = 50: stop at 43, resume at 57, with vertical ticks at both ends.
  assert.equal(crossed, "M0 0 L43 0 M43 4 L43 -4 M57 4 L57 -4 M57 0 L100 0");
});

test("yieldingPath merges crossings that are too close into one gap", () => {
  const two = yieldingPath([[0, 0], [100, 0]], [[[50, -50], [50, 50]], [[60, -50], [60, 50]]]);
  // The gaps for x = 50 (43–57) and x = 60 (53–67) overlap: one gap from 43 to 67.
  assert.equal(two, "M0 0 L43 0 M43 4 L43 -4 M67 4 L67 -4 M67 0 L100 0");
  // Far enough apart, both crossings keep their own gap.
  const apart = yieldingPath([[0, 0], [100, 0]], [[[30, -50], [30, 50]], [[70, -50], [70, 50]]]);
  assert.match(apart, /L23 0 .* M37 0 L63 0 .* M77 0 L100 0$/);
});

test("yieldingPath cuts a gap around a bend that lies on another line", () => {
  // The route turns at (50,0), which sits on a vertical line; neither segment crosses it
  // in its interior, so the vertex itself must be skipped with a tick on each side.
  const bend = yieldingPath([[0, 0], [50, 0], [100, 50]], [[[50, -50], [50, 50]]]);
  assert.ok(!bend.includes("L50 0"), bend);
  assert.match(bend, /^M0 0 L43 0 M43 4 L43 -4 M/, "stops 7 px before the bend with a vertical tick");
  assert.match(bend, / L100 50$/, "resumes after the bend and reaches the far end");
  // A bend that is not on any other line is drawn through as before.
  assert.equal(yieldingPath([[0, 0], [50, 0], [100, 50]], [[[70, -50], [70, 50]]]).startsWith("M0 0 L50 0 "), true);
});

test("selectionState: nothing selected", () => {
  assert.deepEqual(selectionState(null, "#ISRM"), { selected: false, related: false });
  assert.deepEqual(selectionState(null, "#ISRM-PM"), { selected: false, related: false });
});

test("selectionState: a station is selected", () => {
  assert.deepEqual(selectionState("#ISRM", "#ISRM"), { selected: true, related: false });
  assert.deepEqual(selectionState("#ISRM", "#ISRM-PM"), { selected: false, related: true }, "its connections");
  assert.deepEqual(selectionState("#ISRM", "#CHM-PM"), { selected: false, related: false }, "other connections");
  assert.deepEqual(selectionState("#ISRM", "#PM"), { selected: false, related: false }, "far ends are added by setSelected");
});

test("selectionState: a connection is selected", () => {
  assert.deepEqual(selectionState("#ISRM-PM", "#ISRM-PM"), { selected: true, related: false });
  assert.deepEqual(selectionState("#ISRM-PM", "#ISRM"), { selected: false, related: true }, "its two stations");
  assert.deepEqual(selectionState("#ISRM-PM", "#PM"), { selected: false, related: true });
  assert.deepEqual(selectionState("#ISRM-PM", "#ISRM-SLM"), { selected: false, related: false }, "sibling connections fade");
  assert.deepEqual(selectionState("#ISRM-PM", "#CHM-PM"), { selected: false, related: false });
  assert.deepEqual(selectionState("#ISRM-PM", "#SLM"), { selected: false, related: false });
});
