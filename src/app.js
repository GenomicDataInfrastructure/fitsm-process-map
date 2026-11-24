// SPDX-FileCopyrightText: 2026 PNED G.I.E.
//
// SPDX-License-Identifier: CC-BY-4.0

/*
 * Entry point: load the content, draw the map, and route on the address hash
 * (research R9). Every selection is a hash change, so the browser's back button
 * works; each history entry is tagged with its depth so the frame's own back control
 * can step back through the browser history when there is somewhere to go.
 */

import { loadContent } from "./content.js";
import { parse, canonical, format } from "./router.js";
import { renderMap, setSelected, connectionsAt } from "./map.js";
import { render } from "./panel.js";

const SITE_TITLE = "FitSM Process Map";

const dom = {
  map: document.getElementById("map"),
  panel: document.getElementById("panel"),
  main: document.querySelector("main.layout"),
  legend: document.getElementById("legend-list"),
  edition: document.getElementById("edition-label"),
  attribution: document.getElementById("attribution"),
  documents: document.getElementById("documents"),
  status: document.getElementById("status"),
};

const state = {
  model: null,
  current: null,      // canonical hash of the current view; null before the first route
  depth: null,        // this entry's position among the page's own history entries
};

const ctx = { get model() { return state.model; }, goBack, panel: dom.panel };

async function start() {
  let loaded;
  try {
    loaded = await loadContent(fetch.bind(window), "content/");
  } catch (error) {
    render("error", error.message, ctx);
    announceHeading(false);
    return;
  }
  state.model = loaded.model;
  dom.edition.textContent = loaded.current.label;
  renderMap(dom.map, state.model);
  renderLegend(state.model);
  renderFooter(state.model);
  window.addEventListener("hashchange", route);
  // A pointer click on a connection selects every connection drawn along that stretch
  // (a keyboard Enter has no position and selects the focused one). Clicking the current
  // selection again deselects it.
  dom.map.addEventListener("click", (event) => {
    const link = event.target.closest("a[data-hash]");
    if (!link) return;
    let target = link.dataset.hash;
    if (event.detail > 0 && link.closest(".connections")) {
      const ids = connectionsAt(dom.map, target.slice(1), event.clientX, event.clientY);
      if (ids.length > 1) target = format("interfaces", ids);
    }
    if (target === link.dataset.hash && target !== state.current) return; // the link's own navigation
    event.preventDefault();
    if (target === state.current) {
      history.pushState({ depth: state.depth + 1 }, "", location.pathname + location.search);
      route();
    } else {
      location.hash = target;
    }
  });
  route();
}

function route() {
  const model = state.model;
  const result = canonical(parse(location.hash), model);
  if (result.redirect) {
    history.replaceState(history.state, "", result.hash || location.pathname + location.search);
  }
  const hash = result.kind === "unknown" ? location.hash : result.hash;
  const firstRoute = state.current === null;
  // Every history entry of this page carries its depth, so the frame's back control knows
  // whether history.back() stays on the page. An entry without one was just created by the
  // browser for a hash link: tag it one deeper than the entry it came from.
  if (history.state && Number.isInteger(history.state.depth)) {
    state.depth = history.state.depth;
  } else {
    state.depth = firstRoute ? 0 : state.depth + 1;
    history.replaceState({ depth: state.depth }, "", location.href);
  }
  state.current = hash;

  let title = SITE_TITLE;
  // A process chart's wide view takes the map's place (specs/003, FR-001a).
  dom.main.classList.toggle("chart-mode", result.kind === "chart");
  switch (result.kind) {
    case "none":
      render("intro", null, ctx);
      setSelected(dom.map, null);
      break;
    case "general":
      render("general", null, ctx);
      setSelected(dom.map, null);
      title = `General requirements – ${SITE_TITLE}`;
      break;
    case "chart": {
      const process = model.processes.get(result.id);
      render("chart", process, ctx);
      setSelected(dom.map, `#${result.id}`);
      title = `${process.name} chart – ${SITE_TITLE}`;
      break;
    }
    case "records":
      render("records", null, ctx);
      setSelected(dom.map, null);
      title = `Records – ${SITE_TITLE}`;
      break;
    case "process": {
      const process = model.processes.get(result.id);
      render("process", process, ctx);
      setSelected(dom.map, `#${result.id}`);
      title = `${process.name} – ${SITE_TITLE}`;
      break;
    }
    case "interface": {
      const iface = model.interfaces.get(result.id);
      render("interface", iface, ctx);
      setSelected(dom.map, `#${result.id}`);
      const [a, b] = iface.processes;
      title = `${a} ↔ ${b} – ${SITE_TITLE}`;
      break;
    }
    case "interfaces": {
      render("interfaces", result.ids.map((id) => model.interfaces.get(id)), ctx);
      setSelected(dom.map, result.hash);
      title = `${result.ids.length} connections – ${SITE_TITLE}`;
      break;
    }
    case "role": {
      const role = model.roles.get(result.id);
      render("role", role, ctx);
      setSelected(dom.map, `#${role.process}`);
      title = `${role.name} – ${SITE_TITLE}`;
      break;
    }
    case "activity": {
      const activity = model.activities.get(result.id);
      render("activity", activity, ctx);
      setSelected(dom.map, `#${activity.process}`);
      title = `${activity.name} – ${SITE_TITLE}`;
      break;
    }
    case "record": {
      const record = model.records.get(result.id);
      render("record", record, ctx);
      setSelected(dom.map, null);
      title = `${record.name} – ${SITE_TITLE}`;
      break;
    }
    default:
      render("notFound", result.raw, ctx);
      setSelected(dom.map, null);
      title = `Not found – ${SITE_TITLE}`;
  }
  document.title = title;
  announceHeading(!firstRoute);
}

/* Lets screen-reader users know the frame changed, once: after a selection focus moves to
 * the new heading (which announces it and puts keyboard users in the frame); on the first
 * route and on a load error, where stealing focus would be wrong, the heading's text goes
 * to the live status line instead. */
function announceHeading(moveFocus) {
  const headingEl = dom.panel.querySelector("#panel-title");
  if (moveFocus) headingEl?.focus();
  else dom.status.textContent = headingEl ? headingEl.textContent : "";
}

/* The frame's back control: the previous entry of this visit, else the item's parent. */
function goBack() {
  if (state.depth > 0) {
    history.back(); // the entry below is this page's own; the hash change re-routes
    return;
  }
  const parsed = parse(state.current);
  let target = "";
  if (parsed.kind === "role") target = format("process", state.model.roles.get(parsed.id).process);
  else if (parsed.kind === "activity") target = format("process", state.model.activities.get(parsed.id).process);
  else if (parsed.kind === "chart") target = format("process", parsed.id);
  if (target === "") {
    history.pushState({ depth: state.depth + 1 }, "", location.pathname + location.search);
    route();
  } else {
    location.hash = target;
  }
}

function renderLegend(model) {
  const zones = (model.map.zones || []).map((zone) => {
    const li = document.createElement("li");
    const swatch = document.createElement("span");
    swatch.className = "swatch swatch-zone";
    swatch.style.background = zone.fill;
    li.append(swatch, document.createTextNode(`${zone.name} half`));
    return li;
  });
  const items = model.map.lines.map((line) => {
    const li = document.createElement("li");
    const swatch = document.createElement("span");
    swatch.className = "swatch";
    swatch.style.background = line.colour;
    li.append(swatch, document.createTextNode(`${line.name} line`));
    return li;
  });
  const transfer = document.createElement("li");
  const swatch = document.createElement("span");
  swatch.className = "swatch swatch-transfer";
  swatch.style.background = model.map.transfer.colour;
  transfer.append(swatch, document.createTextNode("Thin grey: transfer between lines"));
  dom.legend.replaceChildren(...zones, ...items, transfer);
}

function renderFooter(model) {
  const { edition } = model;
  const licence = edition.licence;
  dom.attribution.replaceChildren(
    document.createTextNode("FitSM content © "),
    document.createTextNode(`${edition.attribution}, `),
    textLink("FitSM", "https://www.fitsm.eu/"),
    document.createTextNode(", licensed under "),
    textLink(licence.name, licence.url),
    document.createTextNode(". This site reproduces FitSM text unchanged and labels its own additions. This site is licensed under "),
    textLink("CC BY 4.0", "https://creativecommons.org/licenses/by/4.0/"),
    document.createTextNode("; source on "),
    textLink("GitHub", "https://github.com/GenomicDataInfrastructure/fitsm-process-map"),
    document.createTextNode("."),
  );
  const docs = Object.values(edition.documents).flatMap((d, i, all) => [
    textLink(`${d.title} v${d.version}`, d.url),
    document.createTextNode(i < all.length - 1 ? " · " : ""),
  ]);
  dom.documents.replaceChildren(
    document.createTextNode("Documents: "),
    ...docs,
    document.createTextNode(" · "),
    textLink("All FitSM downloads", edition.downloads),
  );
}

function textLink(text, href) {
  const a = document.createElement("a");
  a.href = href;
  a.textContent = text;
  return a;
}

start();
