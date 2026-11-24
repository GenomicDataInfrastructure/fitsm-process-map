// SPDX-FileCopyrightText: 2026 PNED G.I.E.
//
// SPDX-License-Identifier: CC-BY-4.0

import { test } from "node:test";
import assert from "node:assert/strict";
import { parse, format, canonical } from "../src/router.js";

const model = {
  processes: new Map([["ISRM", {}], ["PM", {}], ["CHM", {}]]),
  aliases: new Map([["INCM", "ISRM"]]),
  interfaces: new Map([["ISRM-PM", {}], ["CHM-PM", {}]]),
  roles: new Map([["ISRM.manager", {}]]),
  activities: new Map([["ISRM.A1", {}]]),
  records: new Map([["incident-record", {}]]),
};

test("parse recognises every kind", () => {
  assert.deepEqual(parse(""), { kind: "none", raw: "" });
  assert.deepEqual(parse("#"), { kind: "none", raw: "" });
  assert.deepEqual(parse("#GR"), { kind: "general", raw: "GR" });
  assert.deepEqual(parse("#RECORDS"), { kind: "records", raw: "RECORDS" });
  assert.deepEqual(parse("#records"), { kind: "records", raw: "records" });
  assert.deepEqual(parse("#ISRM"), { kind: "process", id: "ISRM", raw: "ISRM" });
  assert.deepEqual(parse("#ISRM-PM"), { kind: "interface", id: "ISRM-PM", raw: "ISRM-PM" });
  assert.deepEqual(parse("#role/ISRM.manager"), { kind: "role", id: "ISRM.manager", raw: "role/ISRM.manager" });
  assert.deepEqual(parse("#activity/ISRM.A1"), { kind: "activity", id: "ISRM.A1", raw: "activity/ISRM.A1" });
  assert.deepEqual(parse("#record/incident-record"), { kind: "record", id: "incident-record", raw: "record/incident-record" });
  assert.equal(parse("#what/ever").kind, "unknown");
  assert.equal(parse("#toolongcode").kind, "unknown");
});

test("parse upper-cases codes typed by hand", () => {
  assert.equal(parse("#isrm").id, "ISRM");
  assert.equal(parse("#pm-isrm").id, "PM-ISRM");
  assert.equal(parse("#gr").kind, "general");
});

test("format is the inverse of parse for every valid selection", () => {
  for (const hash of ["", "#GR", "#RECORDS", "#ISRM", "#ISRM-PM", "#CHM-PM,ISRM-PM", "#role/ISRM.manager", "#activity/ISRM.A1", "#record/incident-record"]) {
    const p = parse(hash);
    assert.equal(format(p.kind, p.ids ?? p.id), hash);
  }
});

test("canonical keeps a canonical address without redirect", () => {
  assert.deepEqual(canonical(parse("#ISRM"), model), { kind: "process", id: "ISRM", hash: "#ISRM", redirect: false });
  assert.deepEqual(canonical(parse("#ISRM-PM"), model), { kind: "interface", id: "ISRM-PM", hash: "#ISRM-PM", redirect: false });
  assert.deepEqual(canonical(parse("#GR"), model), { kind: "general", hash: "#GR", redirect: false });
  assert.deepEqual(canonical(parse("#RECORDS"), model), { kind: "records", hash: "#RECORDS", redirect: false });
  assert.deepEqual(canonical(parse("#Records"), model), { kind: "records", hash: "#RECORDS", redirect: true });
  assert.deepEqual(canonical(parse(""), model), { kind: "none", hash: "", redirect: false });
});

test("canonical redirects lower-case, reversed and alias addresses", () => {
  assert.deepEqual(canonical(parse("#isrm"), model), { kind: "process", id: "ISRM", hash: "#ISRM", redirect: true });
  assert.deepEqual(canonical(parse("#PM-ISRM"), model), { kind: "interface", id: "ISRM-PM", hash: "#ISRM-PM", redirect: true });
  assert.deepEqual(canonical(parse("#INCM"), model), { kind: "process", id: "ISRM", hash: "#ISRM", redirect: true });
  assert.deepEqual(canonical(parse("#PM-INCM"), model), { kind: "interface", id: "ISRM-PM", hash: "#ISRM-PM", redirect: true });
  assert.equal(canonical(parse("#gr"), model).redirect, true);
});

test("canonical reports unknown items without redirect", () => {
  for (const hash of ["#XYZ", "#ISRM-CHM", "#ISRM-ISRM", "#role/nope", "#activity/nope", "#record/nope", "#what/ever"]) {
    const c = canonical(parse(hash), model);
    assert.equal(c.kind, "unknown", hash);
    assert.equal(c.redirect, false, hash);
  }
});

test("several interfaces: parsed, sorted, de-duplicated, and one alone is a plain interface", () => {
  assert.deepEqual(parse("#ISRM-PM,chm-pm"), { kind: "interfaces", ids: ["ISRM-PM", "CHM-PM"], raw: "ISRM-PM,chm-pm" });
  assert.equal(parse("#ISRM-PM,GR").kind, "unknown");
  assert.deepEqual(canonical(parse("#CHM-PM,ISRM-PM"), model), { kind: "interfaces", ids: ["CHM-PM", "ISRM-PM"], hash: "#CHM-PM,ISRM-PM", redirect: false });
  assert.deepEqual(canonical(parse("#PM-INCM,PM-CHM"), model), { kind: "interfaces", ids: ["CHM-PM", "ISRM-PM"], hash: "#CHM-PM,ISRM-PM", redirect: true });
  assert.deepEqual(canonical(parse("#ISRM-PM,PM-ISRM"), model), { kind: "interface", id: "ISRM-PM", hash: "#ISRM-PM", redirect: true });
  assert.equal(canonical(parse("#ISRM-PM,ISRM-CHM"), model).kind, "unknown", "one unknown interface makes the whole address unknown");
});
