// SPDX-FileCopyrightText: 2026 PNED G.I.E.
//
// SPDX-License-Identifier: CC-BY-4.0

/*
 * Detail-frame views. `render(view, data, ctx)` builds the frame's DOM for one
 * view; ctx = { model, goBack, panel }. Fixed sentences and labels are the ones in
 * specs/…/contracts/content-files.md.
 */

import { connectionLabel, stationLines } from "./graph.js";

export const LABELS = {
  interpretation: "Not part of FitSM",
  derivedRecords: "Derived from this process's outputs; FitSM does not list records per process.",
  noDescription: "FitSM-2 lists these inputs and outputs but gives no interface description.",
  multipleDescriptions: "FitSM describes this interface in more than one place.",
  noSpecificTasks: "FitSM-3 lists no process-specific tasks for this role.",
  externalFlows: "Inputs from and outputs to outside the processes",
  records: "Databases and records",
};

const GENERIC_KIND_NAMES = {
  owner: "process owner",
  manager: "process manager",
  "case-owner": "case owner",
  staff: "process staff member",
};

/* ---------- small DOM helpers ---------- */

function h(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === null) continue;
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else node.setAttribute(key, value);
  }
  for (const child of children) node.append(child);
  return node;
}

/* "FitSM-2 v3.0.2 §PR9 (p. 31)" */
export function sourceRef(source, model) {
  const doc = model.edition.documents[source.doc];
  const version = doc ? ` v${doc.version}` : "";
  const page = source.page ? ` (p. ${source.page})` : "";
  return `${source.doc}${version} §${source.section}${page}`;
}

function sourceLine(source, model) {
  return h("span", { class: "source", text: sourceRef(source, model) });
}

function quoted(text, source, model) {
  return h("li", {}, [h("span", { class: "quote", text }), sourceLine(source, model)]);
}

function interpretation(text) {
  return h("div", { class: "interpretation", role: "note" }, [h("strong", { text: LABELS.interpretation }), document.createTextNode(text)]);
}

// tabindex -1 lets app.js move focus to the new heading after a selection.
function heading(text) {
  return h("h2", { id: "panel-title", tabindex: "-1", text });
}

function section(title, children) {
  return [h("h3", { text: title }), ...children];
}

function link(hash, text) {
  return h("a", { href: hash, text });
}

function processLink(code, model) {
  const process = model.processes.get(code);
  return link(`#${code}`, process ? `${process.name} (${code})` : code);
}

function backControl(ctx) {
  const button = h("button", { type: "button", text: "← Back" });
  button.addEventListener("click", () => ctx.goBack());
  return h("p", { class: "back-control" }, [button]);
}

function editionLine(model) {
  const docs = Object.values(model.edition.documents).map((d) => `${d.title.replace(/^FitSM-\d: /, "")} v${d.version}`);
  return `${model.edition.standard} ${model.edition.edition}: ${docs.join("; ")}.`;
}

/* ---------- views ---------- */

const views = {
  intro(_, ctx) {
    const { model } = ctx;
    return [
      heading("FitSM Process Map"),
      h("p", { text: `This map shows the ${model.processes.size} FitSM processes as stations and the interfaces FitSM-2 defines between them as connections.` }),
      h("p", { text: "Click a station to read the process's objective, requirements, roles, records and activities. Click a connection to see what the two processes exchange. Everything can be reached with the keyboard: Tab to a station or connection and press Enter." }),
      h("p", { text: `Content: ${editionLine(model)}` }),
      interpretation(` ${model.map.note}`),
    ];
  },

  process(process, ctx) {
    const { model } = ctx;
    // Which line(s) the station is on, in words (FR-006): the lines are a study aid.
    const lineNames = stationLines(process.code, model).map((l) => l.name);
    const onLines = lineNames.length === 0 ? "On no line"
      : lineNames.length === 1 ? `On the ${lineNames[0]} line`
        : `On the ${lineNames.slice(0, -1).join(", ")} and ${lineNames[lineNames.length - 1]} lines`;
    const out = [
      heading(`${process.name} (${process.code})`),
      h("p", { class: "subtitle", text: `${onLines} (study aid, not part of FitSM)` }),
      ...section("Objective", [h("p", { class: "quote", text: process.objective.text }), sourceLine(process.objective.source, model)]),
    ];

    const group = process.requirementGroup;
    if (group) {
      out.push(...section(`Requirements (${group.id})`, [
        h("ul", {}, group.items.map((item) => h("li", {}, [h("strong", { text: `${item.id} ` }), h("span", { class: "quote", text: item.text }), sourceLine(item.source, model)]))),
      ]));
    }

    if (process.roles.length) {
      out.push(...section("Roles", [
        h("ul", {}, process.roles.map((role) => h("li", {}, [link(`#role/${role.id}`, role.name), document.createTextNode(role.count ? ` – ${role.count}` : "")]))),
      ]));
    }

    if (process.records.length) {
      out.push(...section(LABELS.records, [
        interpretation(` ${LABELS.derivedRecords}`),
        h("ul", {}, process.records.map((record) => h("li", {}, [link(`#record/${record.id}`, record.name)]))),
      ]));
    }

    if (process.activities.length) {
      const phases = [["setup", "Initial process setup"], ["execution", "Ongoing process execution"]];
      const children = [];
      for (const [phase, title] of phases) {
        const items = process.activities.filter((a) => (a.phase || "execution") === phase);
        if (!items.length) continue;
        children.push(h("h4", { text: title }));
        children.push(h("ul", {}, items.map((a) => h("li", {}, [link(`#activity/${a.id}`, a.name)]))));
      }
      out.push(...section("Activities", children));
    }

    if (process.inputs.length) {
      out.push(...section("Process inputs", [h("ul", {}, process.inputs.map((i) => quoted(i.text, i.source, model)))]));
    }
    if (process.outputs.length) {
      out.push(...section("Process outputs", [h("ul", {}, process.outputs.map((o) => quoted(o.text, o.source, model)))]));
    }

    if (process.interfaces.length) {
      out.push(...section("Interfaces", [
        h("ul", {}, process.interfaces.map((iface) => {
          const other = iface.processes.find((c) => c !== process.code);
          return h("li", {}, [link(`#${iface.id}`, `${model.processes.get(other).name} (${other})`), document.createTextNode(` – ${connectionLabel(iface.id, model)}`)]);
        })),
      ]));
    }

    if (process.externalFlows.length) {
      out.push(...section(LABELS.externalFlows, [
        // A party token the edition explains (edition.json `externalParties`) is shown as explained.
        h("ul", {}, process.externalFlows.map((f) => h("li", {}, [
          h("span", { class: "quote", text: `${f.direction === "in" ? "From" : "To"} ${model.edition.externalParties?.[f.party] || f.party}: ${f.item}` }),
          sourceLine(f.source, model),
        ]))),
      ]));
    }
    return out;
  },

  general(_, ctx) {
    const { model } = ctx;
    const out = [heading("General requirements (FitSM-1)")];
    for (const group of model.requirementGroups.values()) {
      if (group.kind !== "general") continue;
      out.push(h("h3", {}, [document.createTextNode(`${group.id} ${group.name} `), sourceLine(group.source, model)]));
      out.push(h("ul", {}, group.items.map((item) => h("li", {}, [h("strong", { text: `${item.id} ` }), h("span", { class: "quote", text: item.text }), sourceLine(item.source, model)]))));
    }
    return out;
  },

  interface(iface, ctx) {
    const { model } = ctx;
    const [a, b] = iface.processes;
    const out = [
      h("h2", { id: "panel-title", tabindex: "-1" }, [processLink(a, model), document.createTextNode(" ↔ "), processLink(b, model)]),
      h("p", { class: "subtitle", text: capitalise(connectionLabel(iface.id, model)) }),
      backControl(ctx),
    ];

    if (iface.descriptions.length > 1) out.push(interpretation(` ${LABELS.multipleDescriptions}`));
    if (iface.descriptions.length) {
      out.push(...section("Interface description", [h("ul", {}, iface.descriptions.map((d) => quoted(d.text, d.source, model)))]));
    } else if (!iface.flows.length) {
      out.push(h("p", { class: "fixed-sentence", text: LABELS.noDescription }));
    }

    for (const [from, to] of [[a, b], [b, a]]) {
      const flows = iface.directions.get(from) || [];
      if (!flows.length) continue;
      // The same row often appears under both processes' tables. Identical wording is shown
      // once with every source; different wording is shown in full with the FR-020 note.
      const byText = new Map();
      for (const f of flows) {
        if (!byText.has(f.item)) byText.set(f.item, []);
        byText.get(f.item).push(f);
      }
      const listedBy = new Set(flows.map((f) => f.listedBy).filter(Boolean));
      const children = [];
      if (listedBy.size > 1 && byText.size > 1) {
        children.push(interpretation(` ${LABELS.multipleDescriptions} Listed under ${[...listedBy].join(" and ")}.`));
      }
      children.push(h("ul", {}, [...byText.entries()].map(([text, group]) => h("li", {}, [
        h("span", { class: "quote", text }),
        ...group.map((f) => sourceLine(f.source, model)),
      ]))));
      out.push(...section(`${from} → ${to}`, children));
    }

    if (iface.note) out.push(interpretation(` ${iface.note}`));
    return out;
  },

  role(role, ctx) {
    const { model } = ctx;
    const out = [
      heading(role.name),
      h("p", { class: "subtitle" }, [document.createTextNode("Role in "), processLink(role.process, model), document.createTextNode(role.count ? ` · Typically: ${role.count}` : "")]),
      backControl(ctx),
    ];
    const specific = role.tasks.length
      ? h("ul", {}, role.tasks.map((t) => quoted(t.text, t.source, model)))
      : h("p", { class: "fixed-sentence", text: LABELS.noSpecificTasks });
    out.push(...section(`Tasks specific to ${role.process}`, [specific, role.tasks.length ? null : sourceLine(role.source, model)].filter(Boolean)));

    if (role.kind === "staff") {
      out.push(interpretation(" FitSM-3 defines this as a common role type (§5) that applies in every process; it does not list it per process."));
    }
    const generic = model.generic[role.kind];
    if (generic && role.kind !== "specific") {
      out.push(...section(`Tasks common to every ${GENERIC_KIND_NAMES[role.kind] || role.kind}`, [
        h("ul", {}, generic.tasks.map((text) => h("li", {}, [h("span", { class: "quote", text })]))),
        sourceLine(generic.source, model),
      ]));
    }
    return out;
  },

  activity(activity, ctx) {
    const { model } = ctx;
    return [
      heading(activity.name),
      h("p", { class: "subtitle" }, [document.createTextNode("Activity of "), processLink(activity.process, model)]),
      backControl(ctx),
      ...section("Procedure", [
        h("ol", {}, activity.procedure.map((step) => h("li", {}, [h("span", { class: "quote", text: step })]))),
        sourceLine(activity.source, model),
      ]),
    ];
  },

  record(record, ctx) {
    const { model } = ctx;
    return [
      heading(record.name),
      backControl(ctx),
      ...section("Definition", [h("p", { class: "quote", text: record.definition.text }), sourceLine(record.definition.source, model)]),
      ...section("Used by", [
        h("ul", {}, record.usedBy.map((use) => h("li", {}, [
          processLink(use.process, model),
          interpretation(` Derived from this process's outputs (see ${sourceRef(use.source, model)}).`),
        ]))),
      ]),
    ];
  },

  notFound(raw, ctx) {
    const { model } = ctx;
    return [
      heading("Not found"),
      h("p", {}, [document.createTextNode("No item called "), h("code", { text: raw }), document.createTextNode(". The processes are:")]),
      h("ul", { class: "code-list" }, [...model.processes.keys()].map((code) => h("li", {}, [link(`#${code}`, code)]))),
      h("p", {}, [link("#GR", "General requirements")]),
    ];
  },

  error(message) {
    return [heading("Could not load the content"), h("p", { class: "error", text: message })];
  },
};

function capitalise(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function render(view, data, ctx) {
  const builder = views[view];
  if (!builder) throw new Error(`Unknown view: ${view}`);
  ctx.panel.replaceChildren(...builder(data, ctx));
  ctx.panel.scrollTop = 0;
}
