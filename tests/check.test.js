// SPDX-FileCopyrightText: 2026 PNED G.I.E.
//
// SPDX-License-Identifier: CC-BY-4.0

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const script = join(root, "scripts", "check.js");

function run(...args) {
  const r = spawnSync(process.execPath, [script, ...args], { cwd: root, encoding: "utf8" });
  return { code: r.status, out: r.stdout, err: r.stderr, lines: r.stderr.trim().split("\n").filter(Boolean) };
}

test("valid fixture passes with 0 errors", () => {
  const r = run("--content", "tests/fixtures/valid");
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /^0 errors, \d+ warnings, \d+ items checked across 1 edition\(s\)$/m);
});

test("the real content passes with 0 errors", () => {
  const r = run();
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /^0 errors/m);
});

const cases = {
  "unknown-process": 'error   unknown-process/roles.json: AA.manager: process "XYZ" does not exist',
  "missing-route": 'error   missing-route/map.json: routes: no route for interface "BB-CC"',
  "missing-source": "error   missing-source/roles.json: AA.manager: missing source",
  "wrong-count": "error   wrong-count/processes.json: count: expected 14 processes, found 13",
  "bad-interface-id": 'error   bad-interface-id/interfaces.json: BB-AA: id must be "AA-BB" (codes in alphabetical order)',
  "process-on-no-line": 'error   process-on-no-line/map.json: lines: process "NN" is on no line',
  "alias-collision": 'error   alias-collision/processes.json: aliases: "BB" is already a process code',
  "no-description-no-flow": "error   no-description-no-flow/interfaces.json: BB-CC: no description and no flow",
  "low-contrast": "error   low-contrast/map.json: lines.one: colour #ffcc00 has contrast 1.5:1 against background (needs 3:1)",
  "non-octilinear": "error   non-octilinear/map.json: routes.AA-BB: segment 1 from (1,1) to (2,3) is not horizontal, vertical or 45°",
  "external-flow-is-process": 'error   external-flow-is-process/processes.json: AA.externalFlows[0]: party "BB" is a process code; move this flow to interfaces.json',
  "label-side-clash": 'error   label-side-clash/map.json: lines.one: labelSide "s" is the same side as station AA\'s label',
  "bad-transfer-width": "error   bad-transfer-width/map.json: transfer: width 12 is not a number between 1 and 10 below the line stroke",
  "bad-margin": "error   bad-margin/map.json: grid.margin: x and y must be non-negative integers",
  "bad-alias": 'error   bad-alias/processes.json: aliases: "isrm" does not match ^[A-Z]{2,6}$',
  "bad-grid": "error   bad-grid/map.json: grid: unit, cols and rows must be positive integers",
  "role-without-tasks": "error   role-without-tasks/roles.json: AA.manager: tasks must be an array (may be empty)",
};

test("the syntax check does not depend on the working directory", () => {
  const r = spawnSync(process.execPath, [script, "--content", join(root, "tests", "fixtures", "valid")], { cwd: join(root, "content"), encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  // 8 source files parsed (src/*.js + scripts/check.js) on top of the fixture's items.
  assert.match(r.stdout, /\d+ items checked/);
  assert.ok(!r.stderr.includes("syntax"), r.stderr);
});

for (const [name, expected] of Object.entries(cases)) {
  test(`broken fixture ${name} fails with the contract message`, () => {
    const r = run("--content", `tests/fixtures/broken/${name}`);
    assert.equal(r.code, 1, `expected exit 1\n${r.err}`);
    assert.ok(r.lines.includes(expected), `expected line:\n${expected}\ngot:\n${r.lines.join("\n")}`);
  });
}

test("non-octilinear fixture reports the second segment too", () => {
  const r = run("--content", "tests/fixtures/broken/non-octilinear");
  assert.ok(r.lines.some((l) => l.includes("routes.AA-BB: segment 2")));
});

test("editions file with an unlisted current edition is an error", () => {
  const r = run("--editions", "tests/fixtures/editions/editions.json");
  assert.equal(r.code, 1);
  assert.ok(r.lines.includes('error   editions.json: current: "nope" is not a listed edition'), r.err);
});

test("every listed edition is checked and findings name the edition", () => {
  const r = run("--editions", "tests/fixtures/two-editions/editions.json");
  assert.equal(r.code, 1);
  assert.ok(r.lines.includes('error   bad/map.json: routes: no route for interface "BB-CC"'), r.err);
  assert.ok(!r.lines.some((l) => l.startsWith("error   good/")), "the good edition must have no errors");
  assert.match(r.out, /across 2 edition\(s\)/);
});

test("a missing content directory exits 2", () => {
  const r = run("--content", "tests/fixtures/does-not-exist");
  assert.equal(r.code, 2);
});

test("--quiet suppresses the summary line", () => {
  const r = run("--content", "tests/fixtures/valid", "--quiet");
  assert.equal(r.out.trim(), "");
});
