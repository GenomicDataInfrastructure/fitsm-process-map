// SPDX-FileCopyrightText: 2026 PNED G.I.E.
//
// SPDX-License-Identifier: CC-BY-4.0

/*
 * Address-hash grammar (specs/001-fitsm-process-map/contracts/url-hash.md).
 *
 *   ""                    nothing selected
 *   "#GR"                 general requirements
 *   "#ISRM"               process (code, case-insensitive)
 *   "#ISRM-PM"            interface (codes in alphabetical order)
 *   "#role/ISRM.manager"  role, "#activity/ISRM.A1" activity, "#record/incident-record" record
 *
 * Pure: no DOM access. `canonical` needs the content model for aliases and lookups.
 */

const CODE = /^[A-Z]{2,6}$/;
const PAIR = /^([A-Z]{2,6})-([A-Z]{2,6})$/;
const PREFIXED = /^(role|activity|record)\/(.+)$/;

export function parse(hash) {
  const raw = String(hash || "").replace(/^#/, "");
  if (raw === "") return { kind: "none", raw };
  const prefixed = raw.match(PREFIXED);
  if (prefixed) return { kind: prefixed[1], id: prefixed[2], raw };
  const upper = raw.toUpperCase();
  if (upper === "GR") return { kind: "general", raw };
  if (PAIR.test(upper)) return { kind: "interface", id: upper, raw };
  if (CODE.test(upper)) return { kind: "process", id: upper, raw };
  return { kind: "unknown", raw };
}

export function format(kind, id) {
  switch (kind) {
    case "none":
      return "";
    case "general":
      return "#GR";
    case "process":
    case "interface":
      return `#${id}`;
    case "role":
    case "activity":
    case "record":
      return `#${kind}/${id}`;
    default:
      return "";
  }
}

/* Resolves a code or alias to the current process code, or null. */
function resolveCode(code, model) {
  if (model.processes.has(code)) return code;
  return model.aliases.get(code) || null;
}

/*
 * Applies aliases and ordering rules. Returns { kind, id, hash, redirect }:
 * `redirect` is true when the address should be replaced by `hash` without a
 * history entry. Unknown items come back with kind "unknown" and the raw hash.
 */
export function canonical(parsed, model) {
  const unknown = { kind: "unknown", raw: parsed.raw, hash: `#${parsed.raw}`, redirect: false };
  switch (parsed.kind) {
    case "none":
      return { kind: "none", hash: "", redirect: false };
    case "general":
      return { kind: "general", hash: "#GR", redirect: parsed.raw !== "GR" };
    case "process": {
      const code = resolveCode(parsed.id, model);
      if (!code) return unknown;
      const hash = format("process", code);
      return { kind: "process", id: code, hash, redirect: hash !== `#${parsed.raw}` };
    }
    case "interface": {
      const [, a, b] = parsed.id.match(PAIR);
      const codes = [resolveCode(a, model), resolveCode(b, model)];
      if (codes.includes(null) || codes[0] === codes[1]) return unknown;
      const id = codes.sort().join("-");
      if (!model.interfaces.has(id)) return unknown;
      const hash = format("interface", id);
      return { kind: "interface", id, hash, redirect: hash !== `#${parsed.raw}` };
    }
    case "role":
    case "activity":
    case "record": {
      const index = { role: model.roles, activity: model.activities, record: model.records }[parsed.kind];
      if (!index.has(parsed.id)) return unknown;
      return { kind: parsed.kind, id: parsed.id, hash: format(parsed.kind, parsed.id), redirect: false };
    }
    default:
      return unknown;
  }
}
