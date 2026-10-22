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
  // A bend that is not on any other line is drawn through as before (sharp with radius 0).
  assert.equal(yieldingPath([[0, 0], [50, 0], [100, 50]], [[[70, -50], [70, 50]]], 0).startsWith("M0 0 L50 0 "), true);
});

test("yieldingPath draws a bend as a curve, shortened where the segments are short", () => {
  // A 90° bend with radius 20: the curve starts 20 px before the corner and ends 20 px after.
  assert.equal(yieldingPath([[0, 0], [100, 0], [100, 100]], [], 20), "M0 0 L80 0 Q100 0 100 20 L100 100");
  // Segments of 30 px leave room for at most 15 px on each side of the corner.
  assert.equal(yieldingPath([[0, 0], [30, 0], [30, 30]], [], 20), "M0 0 L15 0 Q30 0 30 15 L30 30");
  // A straight run through a vertex is not a bend.
  assert.equal(yieldingPath([[0, 0], [50, 0], [100, 0]], [], 20), "M0 0 L50 0 L100 0");
});

test("yieldingPath leaves no gap where a route branches off a shared stretch", () => {
  const trunk = [[0, 0], [100, 0]];
  // This route runs along the trunk to x = 50, then turns away: a junction, not a crossing.
  const branch = yieldingPath([[0, 0], [50, 0], [100, 50]], [trunk], 0);
  assert.equal(branch, "M0 0 L50 0 L100 50");
  // The trunk does not yield where the branch leaves it.
  assert.equal(yieldingPath(trunk, [[[0, 0], [50, 0], [100, 50]]], 0), "M0 0 L100 0");
});

test("yieldingPath on a shared stretch skips a crossing an earlier line already yielded to", () => {
  const cross = [[50, -50], [50, 50]];
  const trunk = [[0, 0], [100, 0]];
  // The crossing line was drawn after the first trunk line, so it already has a gap there;
  // a second line on the same stretch stays unbroken too.
  assert.equal(yieldingPath(trunk, [trunk, cross]), "M0 0 L100 0");
  // Drawn before the trunk, the crossing line is unbroken, so the trunk yields as usual.
  assert.equal(yieldingPath(trunk, [cross, trunk]), "M0 0 L43 0 M43 4 L43 -4 M57 4 L57 -4 M57 0 L100 0");
});

test("yieldingPath cuts a gap where another line's bend lies on this segment", () => {
  // The other line turns at (50,0), which is in the middle of this straight segment.
  const through = yieldingPath([[0, 0], [100, 0]], [[[50, -50], [50, 0], [100, -50]]]);
  assert.equal(through, "M0 0 L43 0 M43 4 L43 -4 M57 4 L57 -4 M57 0 L100 0");
});

test("yieldingPath turns a segment too short for two vertex gaps into one gap", () => {
  // Segment (30,0)-(40,0) is 10 px long; both ends sit on other lines (a vertical one and a
  // diagonal one), whose half-gaps add up to more than that.
  const d = yieldingPath([[0, 0], [30, 0], [40, 0], [40, 50]], [[[30, -50], [30, 50]], [[20, -20], [60, 20]]]);
  assert.ok(!d.includes("M37 0"), d);            // no resume point beyond the stop point
  assert.match(d, /M35 4 L35 -4/, "both ticks sit at the middle of the short segment");
  assert.match(d, / L40 50$/);
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
