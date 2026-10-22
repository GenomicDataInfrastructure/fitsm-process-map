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
  assert.equal(m.shared.length, 0);
  assert.equal(m.close.length, 0);
});

test("routes meeting at a station they share do not cross", () => {
  const m = layoutMetrics({
    stations: { AA: at(0, 0), BB: at(2, 0), CC: at(4, 0), DD: at(2, 2) },
    routes: { "AA-BB": [], "BB-CC": [], "BB-DD": [] },
  });
  assert.deepEqual(m, { crossings: [], shared: [], close: [] });
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
  assert.deepEqual(m.shared, [{ a: "AA-BB", b: "AA-CC", from: [0, 0], to: [0, 1] }]);
  assert.equal(m.crossings.length, 0);
});

test("parallel routes one unit apart are close; two units apart are not", () => {
  const m = layoutMetrics({
    stations: { AA: at(0, 0), BB: at(4, 0), CC: at(1, 1), DD: at(6, 1), EE: at(0, 3), FF: at(4, 3) },
    routes: { "AA-BB": [], "CC-DD": [], "EE-FF": [] },
  });
  assert.deepEqual(m.close, [{ a: "AA-BB", b: "CC-DD", from: [1, 0], to: [4, 0], distance: 1 }]);
});
