// SPDX-FileCopyrightText: 2026 PNED G.I.E.
//
// SPDX-License-Identifier: CC-BY-4.0

/*
 * Detail-frame views. `render(view, data, ctx)` builds the frame's DOM for one
 * view; ctx = { model, goBack, panel }. Fixed sentences and labels are the ones in
 * specs/…/contracts/content-files.md.
 */

import { connectionLabel, stationLines, stationZone } from "./graph.js";

export const LABELS = {
  interpretation: "Not part of FitSM",
  derivedRecords: "Derived from FitSM-2's activities, inputs and outputs; FitSM does not list records per process.",
  notInFitSM0: "FitSM-0 gives no definition for this; the text is from FitSM-2.",
  noDescription: "FitSM-2 lists these inputs and outputs but gives no interface description.",
  multipleDescriptions: "FitSM describes this interface in more than one place.",
  noSpecificTasks: "FitSM-3 lists no process-specific tasks for this role.",
  externalFlows: "Inputs from and outputs to outside the processes",
  records: "Information and records",
  maintains: "Creates or maintains",
  uses: "Uses",
  maintainedBy: "Created or maintained by",
  usedBy: "Used by",
  overview: "Records",
  overviewIntro: "Every record of every process. Rows are records, grouped by the first process (in FitSM order) that creates or maintains them; columns are the 14 processes.",
};

// Text marks of the records overview: told apart by shape, not colour (FR-009).
export const MARKS = {
  maintains: { symbol: "●", text: "creates or maintains" },
  uses: { symbol: "○", text: "uses" },
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

function section(title, children, tag = "h3") {
  return [h(tag, { text: title }), ...children];
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

/* What FitSM says about one interface: its description and the flows in each direction.
 * `tag` is the heading level of its sections. */
function interfaceDetails(iface, model, tag) {
  const [a, b] = iface.processes;
  const out = [];
  if (iface.descriptions.length > 1) out.push(interpretation(` ${LABELS.multipleDescriptions}`));
  if (iface.descriptions.length) {
    out.push(...section("Interface description", [h("ul", {}, iface.descriptions.map((d) => quoted(d.text, d.source, model)))], tag));
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
    out.push(...section(`${from} → ${to}`, children, tag));
  }

  if (iface.note) out.push(interpretation(` ${iface.note}`));
  return out;
}

/* The records of a process or an activity in two groups (FR-006, FR-006b); [] when none. */
function recordGroups(records, tag = "h3") {
  const groups = [[LABELS.maintains, records.maintains], [LABELS.uses, records.uses]].filter(([, list]) => list.length);
  if (!groups.length) return [];
  const sub = tag === "h3" ? "h4" : "h5";
  return section(LABELS.records, [
    interpretation(` ${LABELS.derivedRecords}`),
    ...groups.flatMap(([title, list]) => [
      h(sub, { text: title }),
      h("ul", {}, list.map((record) => h("li", {}, [link(`#record/${record.id}`, record.name)]))),
    ]),
  ], tag);
}

/* One process entry of a record view: the process and the FitSM-2 text the relationship rests on. */
function relationItem(rel, model) {
  const r = rel.resolved;
  const children = [processLink(rel.process, model)];
  if (!r) return h("li", {}, children);
  const where = r.kind === "activity" ? [document.createTextNode(" – activity "), link(r.link, r.label)]
    : r.kind === "flow" ? [document.createTextNode(" – interface "), link(r.link, `${r.from} → ${r.to}`)]
      : [document.createTextNode(` – process ${r.kind}`)];
  children.push(...where, document.createTextNode(": "), h("span", { class: "quote", text: r.text }), sourceLine(r.source, model));
  return h("li", {}, children);
}

/* ---------- views ---------- */

const views = {
  intro(_, ctx) {
    const { model } = ctx;
    return [
      heading("FitSM Process Map"),
      h("p", { text: `This map shows the ${model.processes.size} FitSM processes as stations and the interfaces FitSM-2 defines between them as connections.` }),
      h("p", { text: "Click a station to read the process's objective, requirements, roles, information and records, and activities. Click a connection to see what the two processes exchange. Everything can be reached with the keyboard: Tab to a station or connection and press Enter." }),
      h("p", { text: `Content: ${editionLine(model)}` }),
      interpretation(` ${model.map.note}`),
    ];
  },

  process(process, ctx) {
    const { model } = ctx;
    // Which half and line(s) the station is in, in words (FR-006): both are a study aid.
    const zone = stationZone(process.code, model);
    const lineNames = stationLines(process.code, model).map((l) => l.name);
    const onLines = lineNames.length === 0 ? "On no line"
      : lineNames.length === 1 ? `On the ${lineNames[0]} line`
        : `On the ${lineNames.slice(0, -1).join(", ")} and ${lineNames[lineNames.length - 1]} lines`;
    const out = [
      heading(`${process.name} (${process.code})`),
      h("p", { class: "subtitle", text: `${zone ? `In ${zone.name}. ` : ""}${onLines} (study aid, not part of FitSM)` }),
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

    out.push(...recordGroups(process.records));

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
    return [
      h("h2", { id: "panel-title", tabindex: "-1" }, [processLink(a, model), document.createTextNode(" ↔ "), processLink(b, model)]),
      h("p", { class: "subtitle", text: capitalise(connectionLabel(iface.id, model)) }),
      backControl(ctx),
      ...interfaceDetails(iface, model, "h3"),
    ];
  },

  // Several connections drawn along the same stretch of the map, clicked together.
  interfaces(ifaces, ctx) {
    const { model } = ctx;
    const out = [
      heading(`${ifaces.length} connections run here`),
      h("p", { class: "subtitle", text: "They share this stretch of the map. Each is listed with what FitSM says about it." }),
      backControl(ctx),
    ];
    for (const iface of ifaces) {
      const [a, b] = iface.processes;
      out.push(
        h("h3", { class: "connection-heading" }, [link(`#${iface.id}`, `${model.processes.get(a).name} ↔ ${model.processes.get(b).name}`)]),
        h("p", { class: "subtitle", text: capitalise(connectionLabel(iface.id, model)) }),
        ...interfaceDetails(iface, model, "h4"),
      );
    }
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
      ...recordGroups(activity.records),
    ];
  },

  record(record, ctx) {
    const { model } = ctx;
    const out = [
      heading(record.name),
      backControl(ctx),
      ...section("Definition", [h("p", { class: "quote", text: record.definition.text }), sourceLine(record.definition.source, model)]),
    ];
    if (record.fitsm0 === false) out.push(h("p", { class: "fixed-sentence", text: LABELS.notInFitSM0 }));
    for (const also of record.alsoCalled || []) {
      out.push(h("p", {}, [document.createTextNode("FitSM-2 wording: "), h("span", { class: "quote", text: also.text }), sourceLine(also.source, model)]));
      if (also.note) out.push(interpretation(` ${also.note}`));
    }
    if (record.general) {
      out.push(h("p", {}, [document.createTextNode("This is FitSM's general term. Every record of every process is listed in the "), link("#RECORDS", "records overview"), document.createTextNode(".")]));
      return out;
    }
    const groups = [[LABELS.maintainedBy, "maintains"], [LABELS.usedBy, "uses"]]
      .map(([title, kind]) => [title, record.relations.filter((rel) => rel.kind === kind)])
      .filter(([, list]) => list.length);
    if (groups.length) {
      out.push(interpretation(` ${LABELS.derivedRecords}`));
      for (const [title, list] of groups) out.push(...section(title, [h("ul", {}, list.map((rel) => relationItem(rel, model)))]));
    }
    return out;
  },

  // Records overview (FR-008 – FR-012): a table of records against processes.
  records(_, ctx) {
    const { model } = ctx;
    const { general, processes, rows } = model.overview;
    const out = [heading(LABELS.overview)];
    if (general) {
      out.push(h("p", {}, [
        h("strong", {}, [link(`#record/${general.id}`, general.name)]), document.createTextNode(": "),
        h("span", { class: "quote", text: general.definition.text }), sourceLine(general.definition.source, model),
      ]));
    }
    out.push(h("p", { text: LABELS.overviewIntro }));
    out.push(interpretation(` ${LABELS.derivedRecords}`));
    out.push(h("p", { class: "records-legend" }, Object.values(MARKS).flatMap((m, i) => [
      i ? document.createTextNode(" · ") : null,
      h("span", { class: "mark", "aria-hidden": "true", text: m.symbol }),
      document.createTextNode(` ${m.text}`),
    ].filter(Boolean))));

    const headRow = h("tr", {}, [
      h("th", { scope: "col", text: "Record" }),
      ...processes.map((code) => h("th", { scope: "col" }, [
        h("a", { href: `#${code}`, title: model.processes.get(code).name, "aria-label": `${model.processes.get(code).name} (${code})`, text: code }),
      ])),
    ]);
    const bodyRows = rows.map(({ record, cells }) => h("tr", {}, [
      h("th", { scope: "row" }, [link(`#record/${record.id}`, record.name)]),
      ...processes.map((code) => {
        const kind = cells.get(code);
        if (!kind) return h("td", {});
        return h("td", {}, [
          h("span", { class: "mark", "aria-hidden": "true", text: MARKS[kind].symbol }),
          h("span", { class: "visually-hidden", text: MARKS[kind].text }),
        ]);
      }),
    ]));
    out.push(h("div", { class: "records-table-wrap" }, [
      h("table", { class: "records-table" }, [
        h("caption", { class: "visually-hidden", text: "Records against processes: creates or maintains, or uses" }),
        h("thead", {}, [headRow]),
        h("tbody", {}, bodyRows),
      ]),
    ]));
    return out;
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
