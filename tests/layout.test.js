// SPDX-FileCopyrightText: 2026 PNED G.I.E.
//
// SPDX-License-Identifier: CC-BY-4.0

import { test } from "node:test";
import assert from "node:assert/strict";
import { layoutMetrics } from "../scripts/layout.js";

const at = (x, y) => ({ x, y, label: "s" });

test("two routes crossing in an X count as one crossing", () => {
  const m = layoutMetrics({
    stations: { AA: at(0, 0), BB: at(4, 4), CC: at(0, 4), DD: at(4, 0) },
    routes: { "AA-BB": [], "CC-DD": [] },
  });
  assert.deepEqual(m.crossings, [{ a: "AA-BB", b: "CC-DD", at: [2, 2] }]);
  assert.equal(m.crossingPoints, 1);
  assert.equal(m.shared.length, 0);
  assert.equal(m.close.length, 0);
});

test("routes meeting at a station they share do not cross", () => {
  const m = layoutMetrics({
    stations: { AA: at(0, 0), BB: at(2, 0), CC: at(4, 0), DD: at(2, 2) },
    routes: { "AA-BB": [], "BB-CC": [], "BB-DD": [] },
  });
  assert.deepEqual(m, { crossings: [], crossingPoints: 0, shared: [], close: [] });
});

test("a bend lying on another route counts as a crossing", () => {
  const m = layoutMetrics({
    stations: { AA: at(0, 2), BB: at(4, 2), CC: at(1, 0), DD: at(3, 0) },
    routes: { "AA-BB": [], "CC-DD": [[2, 2]] },
  });
  assert.deepEqual(m.crossings, [{ a: "AA-BB", b: "CC-DD", at: [2, 2] }]);
});

test("routes leaving a station along the same stretch share a segment", () => {
  const m = layoutMetrics({
    stations: { AA: at(0, 0), BB: at(0, 4), CC: at(3, 4) },
    routes: { "AA-BB": [], "AA-CC": [[0, 1], [3, 4]] },
  });
  assert.deepEqual(m.shared, [{ a: "AA-BB", b: "AA-CC", kind: "merge", from: [0, 0], to: [0, 1] }]);
  assert.equal(m.crossings.length, 0);
});

test("parallel routes one unit apart are close; two units apart are not", () => {
  const m = layoutMetrics({
    stations: { AA: at(0, 0), BB: at(4, 0), CC: at(1, 1), DD: at(6, 1), EE: at(0, 3), FF: at(4, 3) },
    routes: { "AA-BB": [], "CC-DD": [], "EE-FF": [] },
  });
  assert.deepEqual(m.close, [{ a: "AA-BB", b: "CC-DD", from: [1, 0], to: [4, 0], distance: 1 }]);
});

test("shared segments are classed as transfer merges, within a line, or mixed", () => {
  const stations = { AA: at(0, 0), BB: at(0, 4), CC: at(3, 4), DD: at(-3, 4) };
  const routes = { "AA-BB": [], "AA-CC": [[0, 1], [3, 4]], "AA-DD": [[0, 1], [-3, 4]] };
  const kinds = (lines) => layoutMetrics({ stations, routes, lines }).shared.map((s) => `${s.a}=${s.b}:${s.kind}`);
  assert.deepEqual(kinds([]), ["AA-BB=AA-CC:merge", "AA-BB=AA-DD:merge", "AA-CC=AA-DD:merge"]);
  const oneLine = [{ id: "one", stations: ["AA", "BB", "CC"] }];
  assert.deepEqual(kinds(oneLine), ["AA-BB=AA-CC:line", "AA-BB=AA-DD:mixed", "AA-CC=AA-DD:mixed"]);
});

test("crossing points count a trunk crossing a line once", () => {
  const m = layoutMetrics({
    stations: { AA: at(0, 0), BB: at(4, 0), CC: at(2, -2), DD: at(2, 2), EE: at(4, 2) },
    routes: { "AA-BB": [], "CC-DD": [], "CC-EE": [[2, 2]] },   // CC-DD and CC-EE share x = 2
  });
  assert.equal(m.crossings.length, 2);
  assert.equal(m.crossingPoints, 1);
});
