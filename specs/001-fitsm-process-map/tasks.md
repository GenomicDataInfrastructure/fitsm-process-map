# Tasks: FitSM Process Map

**Input**: Design documents from `/specs/001-fitsm-process-map/` (revised after
`/speckit-analyze`)

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md),
[data-model.md](data-model.md), [contracts/](contracts/), [quickstart.md](quickstart.md)

**Tests**: Included. The spec requires automated consistency checks (FR-027, SC-006) and the
constitution requires every change to pass them (Principle VI), so the check script, its
fixtures and the unit tests for the pure modules are deliverables. Browser behaviour is
verified with the manual scenarios in `quickstart.md`.

**Organization**: Tasks are grouped by user story so each story is an independent, testable
increment. Content entry (transcribing FitSM) is placed in the first story that needs each
file, so later stories only add views.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on unfinished tasks)
- **[Story]**: Which user story this task belongs to (US1–US5)
- Every task names the exact file(s) it creates or changes

## Path Conventions

Single static site at the repository root, as in plan.md: `index.html`, `styles.css`,
`src/`, `content/editions.json`, `content/fitsm-3.0/` (the edition directory), `scripts/`,
`tests/`, `.github/`. The FitSM PDFs are working material only: download them to a folder
outside the repository (for example `~/fitsm-pdfs/`); never commit them.

## Conventions for every file

<!-- REUSE-IgnoreStart -->
- Every file that can carry a comment starts with the SPDX header (constitution V):
  `SPDX-FileCopyrightText: 2026 PNED G.I.E.` and `SPDX-License-Identifier: CC-BY-4.0`
  (HTML: `<!-- -->`, CSS/JS: `/* */` or `//`, YAML/TOML/Markdown: `#` or `<!-- -->`).
  JSON files are covered by `REUSE.toml` instead (research R6).
<!-- REUSE-IgnoreEnd -->
- Quoted FitSM text is copied unchanged (FR-018). Project wording goes only into fields named
  `note` or into the fixed sentences the spec and contracts define.
- Every content item has `source: { doc, section, page? }` where `doc` is a key of
  `edition.json.documents` (data-model.md, Source).
- Message strings printed by `check.js` and sentences shown by the page are taken verbatim
  from contracts/check-cli.md and contracts/content-files.md so tests can assert on them.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Lift the plan's values into the spec, create the repository skeleton, licensing
and CI.

- [X] T001 Edit specs/001-fitsm-process-map/spec.md to adopt the values listed under "Values this plan uses that the spec should state" in plan.md: add "below 900 px viewport width" to FR-008; add the three readable-map criteria (no label overlaps another label or a stroke; no segment passes through a station it does not end at; parallel segments between the same two stations do not overlap) to the Edge Cases bullet on many interfaces; change SC-004's "typical broadband connection" to "a Fast 3G throttle"; add FR-034 "If any content file fails to load or parse, the frame MUST show one error message naming the file and the map MUST NOT be drawn"; add one sentence to the Interface entity: "Interface is the FitSM relationship; connection is its drawing on the map; the two are one to one" and rename User Story 2's title to "Explore an interface between two processes"
- [X] T002 Create the repository skeleton: directories `src/`, `content/fitsm-3.0/`, `scripts/`, `tests/`, `tests/fixtures/`, `LICENSES/`; write package.json with `{ "name": "fitsm-process-map", "private": true, "type": "module", "scripts": { "check": "node scripts/check.js", "test": "node --test" }, "engines": { "node": ">=22" } }` and no `dependencies` or `devDependencies`; write content/editions.json as `{ "current": "fitsm-3.0", "editions": [ { "id": "fitsm-3.0", "label": "FitSM 3.0 (English)", "path": "fitsm-3.0" } ] }`
- [X] T003 [P] Add licensing files: download the CC BY 4.0 legal code as plain text to LICENSES/CC-BY-4.0.txt; write REUSE.toml (`version = 1`) with one `[[annotations]]` block for `content/**` (`SPDX-FileCopyrightText = ["ITEMO e.V. (FitSM content)", "2026 PNED G.I.E."]`, `SPDX-License-Identifier = "CC-BY-4.0"`) and one for `package.json` and `tests/fixtures/**` (project copyright only); rewrite .gitignore with a CC-BY-4.0 SPDX header keeping the `.claude/`, `.DS_Store` and `_site/` entries
- [X] T004 [P] Write README.md (SPDX header; sections: what the site is and the live URL, how to run locally with `python3 -m http.server 8765` and why `file://` does not work, project structure table from plan.md including `content/editions.json` and `content/<edition>/`, "Updating to a new FitSM edition", "Adding a connection" and "Changing the lines" copied from contracts/content-files.md, how to read `check.js` output and exit codes from contracts/check-cli.md, CI table, licence section stating the whole project is CC BY 4.0 with FitSM content © ITEMO e.V.), CHANGELOG.md (Keep a Changelog format, `## [Unreleased]`), CONTRIBUTING.md (issues cite FitSM document and section; PRs must pass Run Tests; commit subject imperative and ≤ 72 chars) and CODE_OF_CONDUCT.md (Contributor Covenant 2.1 with the enforcement contact set to the repository's GitHub issues page until the maintainers supply an address)
- [X] T005 [P] Rewrite .github/workflows/test.yml: SPDX header CC-BY-4.0; jobs `reuse` (actions/checkout + fsfe/reuse-action at the SHAs already pinned in the file), `check` (checkout, actions/setup-node pinned by SHA with `node-version: 22`, `node scripts/check.js`), `unit` (same setup, `node --test`); update the SPDX headers of .github/ISSUE_TEMPLATE/*.yml and .github/pull_request_template.md to CC-BY-4.0
- [X] T006 [P] Rewrite .github/workflows/main.yml and .github/workflows/release.yml: CC-BY-4.0 headers; `main.yml` keeps the `workflow_run` trigger on "Run Tests" for `main`, copies `index.html styles.css src content` into `_site/` (no build), uploads with actions/upload-pages-artifact and deploys with actions/deploy-pages (SHA-pinned, version in a comment, SHAs taken from each action's release page at implementation time); `release.yml` on `v*` tags runs `node scripts/check.js`, zips `index.html styles.css src content README.md CHANGELOG.md LICENSES` as `fitsm-process-map-<tag>.zip` and attaches it to a GitHub release

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The content files every story reads, the check script, the pure modules and the
page shell. No user story can be verified before this phase is done.

**⚠️ CRITICAL**: Complete this phase before starting any user story.

- [X] T007 Download FitSM-0, FitSM-1, FitSM-2 and FitSM-3 (edition 3.0, English) from https://www.fitsm.eu/downloads/ to a folder outside the repository; write content/fitsm-3.0/edition.json with `standard: "FitSM"`, `edition: "3.0"`, `documents` (`FitSM-0`…`FitSM-3`, each `{ title, version, url, licenceStatement: { page } }` with the exact version string and licence page from the PDF front matter), `downloads: "https://www.fitsm.eu/downloads/"`, `licence: { name: "CC BY 4.0", url: "https://creativecommons.org/licenses/by/4.0/" }` and `attribution: "ITEMO e.V."`
- [X] T008 Write content/fitsm-3.0/processes.json: the 14 processes with `code` (SPM, SLM, SRM, SACM, CAPM, ISM, CRM, SUPPM, ISRM, PM, CONFM, CHM, RDM, CSI; `^[A-Z]{2,6}$`, unique), `name` as printed in FitSM-1, `objective` `{ text, source }` quoted from each process section of FitSM-2, `requirements` set to the FitSM-1 group id (`PR1`…`PR14`, one per process), `externalFlows: []` (filled in T025) and no `aliases`
- [X] T009 [P] Write content/fitsm-3.0/map.json: `note` ("The lines group related processes as a study aid. They are not part of FitSM."), `background: "#ffffff"`, `transfer: { colour: "#6b6b6b", dash: "6 4" }`, `grid: { unit: 60, cols: 14, rows: 9 }`, `lines` as a starting grouping that covers all 14 codes with ≥ 2 stations each and a `labelSide` ∈ n/s/e/w per line (suggested: Agreements = SPM, SLM, CRM, SUPPM; Assurance = SACM, CAPM, ISM; Operations = ISRM, PM; Control = CONFM, CHM, RDM; Reporting and improvement = SRM, CSI; colours chosen to pass 3:1 against white), `stations` with one `{ x, y, label }` per code on distinct grid cells, and `routes: {}` (filled in T030)
- [X] T010 [P] Create tests/fixtures/valid/ as a minimal but complete edition directory (3 processes, 1 general group, 3 process groups, roles of all kinds, 2 activities, 2 records, 2 interfaces of which one has flows only, 2 lines with `labelSide`, stations and routes) that must pass check.js with 0 errors; tests/fixtures/editions/ with an `editions.json` whose `current` is not listed; and one broken edition directory per error class in tests/fixtures/broken/ (unknown-process, missing-route, missing-source, wrong-count, bad-interface-id, process-on-no-line, alias-collision, no-description-no-flow, low-contrast, non-octilinear, external-flow-is-process, label-side-clash)
- [X] T011 Implement scripts/check.js per contracts/check-cli.md: options `--content <dir>` (one edition directory), `--editions <file>` (default `content/editions.json` relative to cwd; edition `path`s inside it resolve relative to the file's own directory; ignored when `--content` is given) and `--quiet`; without `--content`, read the editions file and check every listed edition; exit 2 when editions.json, a directory or a file is missing or not JSON, 1 on any error, 0 otherwise; checks 1–13 in the contract order including: `current` is a listed edition; top-level shapes; id uniqueness and patterns (`^[A-Z]{2,6}$` codes, `^GR[1-7]$`, `^PR([1-9]|1[0-4])$`, role `<process>.<slug>` with slug `^[a-z][a-z0-9-]*$`, activity `<process>.A<n>`, interface `<A>-<B>` alphabetical and equal to `processes`); aliases unique and never equal to a code; every reference resolves; counts 14 / 7 / 14; per-process completeness (objective, ≥ 1 requirement, roles of kind owner, manager and staff, ≥ 1 activity, on ≥ 1 line); every `externalFlows` entry has `direction` ∈ in/out, non-empty `party` and `item`, a `source`, and a `party` that is not a process code or alias (message `party "<X>" is a process code; move this flow to interfaces.json`); `source.doc` ∈ `edition.documents` and `source.section` present on every item; interface has ≥ 1 description or ≥ 1 flow and flow endpoints within the pair and distinct; map stations for all and only the 14 codes on unique cells, route for all and only the interfaces, octilinear segments, `labelSide` and `label` valid and each line's `labelSide` different from its first station's `label` side (message `labelSide "<s>" is the same side as station <code>'s label`); WCAG 2.1 contrast ≥ 3:1 for each line colour and the transfer colour against `background`; warning for a line whose stations are not connected through same-line interfaces; `node --check` on `src/*.js`; message format `error   <edition>/<file>: <item>: <message>` on stderr and the `<N> errors, <M> warnings, <K> items checked across <E> edition(s)` summary on stdout, using the exact message strings from the contract
- [X] T012 [P] Write tests/check.test.js that runs scripts/check.js with `node:child_process` against tests/fixtures/valid (exit 0, `0 errors`), tests/fixtures/editions (run with `--editions tests/fixtures/editions/editions.json`; exit 1 with `error   editions.json: current: "<id>" is not a listed edition`) and each tests/fixtures/broken/<case> (exit 1 and the exact message from contracts/check-cli.md, for example `error   <case>/map.json: lines: process "<code>" is on no line`)
- [X] T013 [P] Implement src/router.js as pure functions per contracts/url-hash.md: `parse(hash)` returning `{ kind, id?, raw }` with kinds none/process/general/interface/role/activity/record/unknown (codes upper-cased before lookup; `GR` → general; `A-B` → interface; `role/`, `activity/`, `record/` prefixes); `format(kind, id)` as its inverse; `canonical(parsed, model)` returning `{ hash, redirect }` that applies process aliases and reorders a reversed interface id; and write tests/router.test.js with `node:test` covering round-trips for every kind, lower-case input, reversed interface id, alias, and unknown input
- [X] T014 [P] Implement src/graph.js as pure functions: `connectionLine(interfaceId, model)` returning the first line in `map.lines` order containing both processes or `null` (transfer); `stationLines(code, model)`; `isInterchange(code, model)` (≥ 2 lines); `connectionLabel(interfaceId, model)` returning "<Line name> line" or "transfer between lines"; `stationLabel(code, model)` returning "<name>, <code>, on the <line> line" (several: "on the A and B lines"); `lineLabelAnchor(lineId, model)` returning the grid point and side for the line's name label (first station, `labelSide`); and write tests/graph.test.js covering same-line, cross-line, two shared lines (first wins), interchange detection and the two label helpers
- [X] T015 Implement src/content.js as pure functions: `buildModel(editionFiles)` taking the eight parsed JSON objects and returning a model with `Map`s by id for processes, requirement groups, requirements, roles, activities, records, interfaces and lines, plus reverse indexes `process.roles`, `process.activities`, `process.records` (from `records[].usedBy`), `process.interfaces`, `process.externalFlows` (own field), `record.processes`, `interface.directions` (flows grouped by `from`), `station.lines`; and `loadContent(fetchImpl, baseUrl)` that fetches `editions.json`, then the eight files of the `current` edition's `path` in parallel, and throws `Error("Could not load content/<edition>/<file>")` (or `content/editions.json`) naming the first failing file; write tests/content.test.js against tests/fixtures/valid (after T010)
- [X] T016 Write index.html: SPDX comment; `<html lang="en">`; `<header>` with the site title, an edition label filled from `editions.json`/`edition.json`, and a link `<a href="#GR">General requirements</a>`; `<main>` with `<div id="map">`, `<aside id="legend">` and `<section id="panel" aria-live="polite" aria-labelledby="panel-title">`; `<footer>` with the attribution block (filled by app.js: "FitSM content © ITEMO e.V., licensed under CC BY 4.0 (link). FitSM documents: <title> v<version> (link) …. All FitSM downloads (link). This site reproduces FitSM text unchanged and labels its own additions. This site is licensed under CC BY 4.0." and a link to the repository); `<noscript>` message; `<script type="module" src="src/app.js">`
- [X] T017 [P] Write styles.css: SPDX comment; CSS custom properties for colours; system font stack `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`; two-column layout (map 60% / frame 40%) at ≥ 900 px viewport width and stacked (map above frame, `#map { overflow-x: auto }`) below; `:focus-visible` outline 3 px in a colour with ≥ 3:1 contrast on white; `.selected` styles for stations (stroke width 4 → 7) and connections (stroke width 6 → 10) so selection is not colour-only; dashed transfer connections via `stroke-dasharray`; line name labels with a white halo (`paint-order: stroke; stroke: #fff; stroke-width: 4px`); frame section headings, lists, the `.interpretation` box titled "Not part of FitSM", the `.source` line style; legend list
- [X] T018 Implement src/app.js: on load call `loadContent(fetch, "content/")`, `buildModel`, render the map (T019), legend, header edition label and footer; on failure render the error view with the thrown message and draw no map; subscribe to `hashchange` and run once at start: `parse` → `canonical` (on `redirect` call `history.replaceState` with the canonical hash) → render the panel view for the kind → `setSelected` on the map → set `document.title` to "<item name> – FitSM Process Map" (or "FitSM Process Map" for none); maintain a back stack of visited hashes and expose `goBack()` that pops it or falls back to the parent rule in contracts/url-hash.md (role or activity → `#<process>`; interface or record → `#`)
- [X] T019 Implement src/map.js `renderMap(container, model)` for stations and line labels (connections are added in T031): create `<svg role="img" viewBox="0 0 cols*unit rows*unit">` with a `<title>` "Map of the 14 FitSM processes and their interfaces" and `aria-describedby` pointing at an element holding `map.json.note`; for each station an `<a href="#<code>" aria-label="<graph.stationLabel>">` containing a circle (radius 12, white fill, stroke = line colour, or concentric rings one per line for interchanges) and a `<text>` label with code and name on the station's `label` side; for each line a `<text class="line-label">` with the line's name in the line's colour at `graph.lineLabelAnchor`; `setSelected(hash)` adds `class="selected"` and `aria-current="true"` to the matching `<a>` and removes them elsewhere (`setSelected(null)` clears all)
- [X] T020 Implement src/panel.js scaffolding: `render(view, data, model)` dispatching on view name; shared helpers `sourceRef(source, model)` producing "<doc> v<version> §<section>" plus " (p. <page>)" when present, `interpretation(text)` producing the box titled "Not part of FitSM", `backControl(onBack)`; and the three views that need no content story: `intro` (what the map shows, how to use it, the edition line), `notFound(raw, model)` ("No item called `<raw>`" and the 14 codes as `#<code>` links, FR-024) and `error(message)`

**Checkpoint**: `node scripts/check.js --content tests/fixtures/valid` reports 0 errors;
`node scripts/check.js` on `content/` reports only missing-route errors (fixed in US2);
`node --test` passes; the page serves a map of 14 labelled stations with line names and
the intro view in the frame; stopping the server and reloading shows the load error
(quickstart E10).

---

## Phase 3: User Story 1 - Explore a process from the map (Priority: P1) 🎯 MVP

**Goal**: Click a station (or open `#<code>`) and read the process's objective, requirements,
roles, records, activities, interfaces and external inputs/outputs, each with its FitSM
source; open `#GR` for the general requirements.

**Independent Test**: Quickstart scenarios 1.1–1.6. Open `#CHM` in a fresh tab and see CHM
selected with its frame open; click ISRM and count the sections; every item shows a source.

### Content for User Story 1

- [X] T021 [P] [US1] Write content/fitsm-3.0/requirements.json from FitSM-1: `general` with the 7 groups `GR1`…`GR7` (`name` as the FitSM-1 heading, `source`, `items` `{ id: "GRn.m", text, source }`), and `process` with the 14 groups `PR1`…`PR14` (`process` code, `source`, `items` `{ id: "PRn.m", text, source }`); every `text` quoted unchanged; ids unique across the file; every `items` non-empty
- [X] T022 [P] [US1] Write content/fitsm-3.0/roles.json from FitSM-3: `generic` with `owner`, `manager`, `case-owner`, `staff` each `{ name, source, tasks: string[] }` quoting the common tasks; `roles` with, for every process, `<code>.owner`, `<code>.manager`, `<code>.staff` and every case-owner or process-specific role FitSM-3 names (`id` `<process>.<slug>` with slug `^[a-z][a-z0-9-]*$`, `kind` ∈ owner/manager/case-owner/staff/specific, `name`, `count` as FitSM-3 words it, `source`, `tasks: [{ text, source }]` for process-specific tasks, empty array when FitSM-3 lists none)
- [X] T023 [P] [US1] Write content/fitsm-3.0/activities.json from FitSM-2: for every process, every activity as `{ id: "<code>.A<n>", process, name, source, procedure: string[] }` with `n` the activity's order in FitSM-2 and `procedure` the ordered steps quoted unchanged (non-empty; where FitSM-2 gives a single paragraph rather than steps, one entry holding that paragraph)
- [X] T024 [P] [US1] Write content/fitsm-3.0/records.json from FitSM-0 and FitSM-2: one entry per FitSM-0 defined record or information store that appears as an output of some process (`id` slug, `name` the FitSM-0 term, `definition` `{ text, source }` quoted from FitSM-0, `usedBy: [{ process, basis: "output", derived: true, source }]` where `source` cites the FitSM-2 output); apply the rule "an output counts only when its name matches a FitSM-0 defined term" (data-model.md, Record)
- [X] T025 [US1] Fill `externalFlows` in content/fitsm-3.0/processes.json from the FitSM-2 inputs/outputs tables: for each input from or output to a party that is not one of the 14 processes, `{ direction: "in" | "out", party: "<party as printed>", item: "<item as printed>", source }`; leave process-to-process flows for T029

### Implementation for User Story 1

- [X] T026 [US1] Add the `process` view to src/panel.js: heading "<name> (<code>)" as `#panel-title`; sections in this order, each an `<h3>`: Objective (quoted text + source); Requirements (`PRn.m` id + text + source, one list item each); Roles (links `#role/<id>` with name and count); Databases and records (the `interpretation` box "Derived from this process's outputs; FitSM does not list records per process." once above a list of links `#record/<id>`); Activities (links `#activity/<id>`); Interfaces (links `#<A>-<B>` with the other process's name and `graph.connectionLabel`); "Inputs from and outputs to outside the processes" (direction, party, item, source; section omitted when `externalFlows` is empty); sources rendered with `sourceRef`
- [X] T027 [P] [US1] Add the `general` view to src/panel.js: heading "General requirements (FitSM-1)" as `#panel-title`; for each of GR1–GR7 an `<h3>` with id and name and a list of `GRn.m` id + text + source
- [X] T028 [US1] Wire the process and general views in src/app.js: kinds `process` → `panel.render("process")` and `map.setSelected("#<code>")`, `general` → `panel.render("general")` and `setSelected(null)`; push the previous hash on the back stack; set `document.title`; and render the legend in `<aside id="legend">` from `map.lines` with heading "Lines are a study aid, not part of FitSM", one `<li>` per line with a colour swatch and name, plus "Dashed: transfer between lines"

**Checkpoint**: Quickstart 1.1–1.6 pass; `node scripts/check.js` reports only missing-route
errors (fixed in US2); `node --test` passes.

---

## Phase 4: User Story 2 - Explore an interface between two processes (Priority: P2)

**Goal**: Connections drawn on the map in line colours or the transfer style; clicking one
shows FitSM's interface description(s), or the fixed "no description" sentence, and the
inputs/outputs in each direction.

**Independent Test**: Quickstart scenarios 2.1–2.5. Click the ISRM–PM connection and see both
names, the line, description(s), flows per direction and the highlight; a flows-only
interface shows the fixed sentence; `#PM-ISRM` redirects.

### Content for User Story 2

- [X] T029 [US2] Write content/fitsm-3.0/interfaces.json from FitSM-2: one entry per pair of processes that appears in any process's key-interfaces table or in any inputs/outputs table with the other process as source or target; `id` the two codes in alphabetical order joined by `-`, `processes` the same two codes, `descriptions` one `{ text, source }` per key-interfaces row that names the pair (zero when only flows exist; two or more when both processes' tables describe it), `flows` `{ from, to, item, source }` per input/output row with `from ≠ to` and both within `processes`; at least one description or one flow per entry; no duplicate pair
- [X] T030 [US2] Fill `routes` in content/fitsm-3.0/map.json with one entry per interface id from T029: an array of grid waypoints (empty for a straight segment) such that every segment is horizontal, vertical or 45°, no segment passes through a station it does not end at, parallel segments between the same two stations do not overlap, and no station label overlaps another label or a stroke; adjust `stations`, `lines` and `labelSide` if the map does not read clearly; run `node scripts/check.js` until 0 errors and read the line-connectivity warnings

### Implementation for User Story 2

- [X] T031 [US2] Extend src/map.js to draw connections before stations in DOM order: for each interface an `<a href="#<id>" aria-label="Interface between <A name> and <B name>, <graph.connectionLabel>">` containing a transparent 20 px-wide hit `<path>` and the visible `<path>` (stroke 6, round joins) along station → waypoints → station; stroke colour from `graph.connectionLine(...).colour` or `map.transfer.colour` with `stroke-dasharray` from `map.transfer.dash` for transfers; `setSelected` also handles connection hashes
- [X] T032 [US2] Add the `interface` view to src/panel.js: heading "<A name> ↔ <B name>" as `#panel-title` with each name a link to its process; a line "On the <Line name> line" or "Transfer between lines"; Descriptions section rendering every entry with its source, preceded by the `interpretation` note "FitSM describes this interface in more than one place." when there are ≥ 2, or replaced by the fixed sentence "FitSM-2 lists these inputs and outputs but gives no interface description" when there are none; then one section per direction ("<A> → <B>", "<B> → <A>") listing `item` + source, omitting a direction with no flows; `note` rendered in the interpretation box when present
- [X] T033 [US2] Wire the interface kind in src/app.js: `canonical` reorders a reversed id and `replaceState`s it; `panel.render("interface")`, `map.setSelected("#<id>")`; `goBack()` fallback for an interface is `#`

**Checkpoint**: Quickstart 2.1–2.5 and E4 pass; `node scripts/check.js` reports 0 errors on
`content/`.

---

## Phase 5: User Story 3 - Drill into roles and activities (Priority: P3)

**Goal**: From a process, open a role (tasks in two labelled groups), an activity (ordered
procedure) or a record (definition, derived label, using processes), and go back.

**Independent Test**: Quickstart scenarios 3.1–3.4. Open ISRM → Process manager ISRM and see
the two task groups; back; open an activity and see numbered steps; open a record used by
several processes.

- [X] T034 [P] [US3] Add the `role` view to src/panel.js: heading "<role name>" as `#panel-title` with the process as a link; "Typically: <count>"; section "Tasks specific to <process code>" listing `tasks[].text` + source (or the sentence "FitSM-3 lists no process-specific tasks for this role." when empty); section "Tasks common to every <generic kind name>" listing `generic[kind].tasks` with the generic source (omitted for kind `specific`); back control
- [X] T035 [P] [US3] Add the `activity` view to src/panel.js: heading "<activity name>" as `#panel-title` with the process as a link; "Procedure" as an `<ol>` of the steps; source line; back control
- [X] T036 [P] [US3] Add the `record` view to src/panel.js: heading "<record name>" as `#panel-title`; Definition (quoted text + FitSM-0 source); "Used by" list with one link per process in `usedBy`, each followed by the `interpretation` note "Derived from this process's outputs (see <sourceRef>)."; back control
- [X] T037 [US3] Wire role, activity and record kinds in src/app.js: `setSelected("#<process>")` for role and activity (the owning process stays highlighted), `setSelected(null)` for record; the frame's back control calls `goBack()`

**Checkpoint**: Quickstart 3.1–3.4 pass; all nine views render; `node --test` passes.

---

## Phase 6: User Story 4 - Update the content for a new FitSM edition (Priority: P4)

**Goal**: A maintainer can change content without touching code, add an edition directory
alongside the current one, is told by the checks when something is inconsistent, and the
page states which edition it reflects.

**Independent Test**: Quickstart scenarios 4.1–4.5. Edit one requirement and reload; break a
reference and see the check name it; find the edition line and the downloads link; add a
second edition directory and see it checked without changing the site.

- [X] T038 [US4] Fill the edition label and footer in src/app.js from `editions.json` and `edition.json`: header shows the current edition's `label`; footer lists each document as "<title> v<version>" linking to its `url`, plus "All FitSM downloads" linking to `edition.json.downloads`
- [X] T039 [P] [US4] Extend tests/check.test.js with the maintainer scenarios from quickstart 4.2, 4.4 and 4.5: a fixture where a role's `process` is "XYZ" asserts `error   <case>/roles.json: <role id>: process "XYZ" does not exist`; a fixture with an interface but no route asserts `error   <case>/map.json: routes: no route for interface "<id>"`; a fixture tree with two listed editions, one valid and one broken, asserts both are checked (`across 2 edition(s)`) and the broken one's error is reported with its directory name
- [X] T040 [P] [US4] Complete the maintainer documentation in README.md: confirm the "Updating to a new FitSM edition" steps match contracts/content-files.md (copy directory, edit, check, switch `current`), "Adding a connection", "Changing the lines", and a note that only `content/` changes for a content update
- [X] T041 [US4] Add the first entry to CHANGELOG.md under `[Unreleased]`: "Initial process map of FitSM 3.0 (FitSM-0 v…, FitSM-1 v…, FitSM-2 v…, FitSM-3 v…)" with the versions from content/fitsm-3.0/edition.json

**Checkpoint**: Quickstart 4.1–4.5 pass; `node --test` passes with the new fixtures.

---

## Phase 7: User Story 5 - See attribution and reuse the work (Priority: P5)

**Goal**: The page and the repository state the licence and credit ITEMO e.V.; every file
carries licence information; interpretation is labelled wherever it appears.

**Independent Test**: Quickstart scenarios 5.1–5.4. Footer shows credit, licence and
fitsm.eu link; `pipx run reuse lint` passes; derived records, multiple descriptions, external
flows and the legend each carry their label or fixed wording.

- [X] T042 [US5] Finalise the footer attribution in index.html and src/app.js to satisfy CC BY 4.0: author "ITEMO e.V.", title "FitSM" with link to https://www.fitsm.eu/, licence "CC BY 4.0" with link, the sentence "This site reproduces FitSM text unchanged and labels its own additions.", and "This site is licensed under CC BY 4.0" with a link to the repository
- [X] T043 [P] [US5] Add SPDX headers to every file that lacks one (index.html, styles.css, src/*.js, scripts/check.js, tests/*.js, .github/**, *.md, .gitignore; REUSE.toml and LICENSES/ are exempt) and run `pipx run reuse lint` (or `uvx reuse lint`) until it reports compliance; fix REUSE.toml globs as needed
- [X] T044 [P] [US5] Audit interpretation labelling against FR-019 and the table in contracts/content-files.md across src/panel.js and src/app.js: derived records (process and record views), multiple interface descriptions, interface `note`, the legend heading and `map.json.note`; ensure each uses the shared `interpretation` helper so the wording and look are the same everywhere

**Checkpoint**: Quickstart 5.1–5.4 pass; `reuse lint` passes.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, responsiveness, performance, offline behaviour and the final
quickstart walk-through.

- [ ] T045 [P] Screen-reader pass (FR-007b, quickstart E9): with VoiceOver (macOS) or NVDA, confirm the SVG `<title>` is read on entering the map, every station and connection is read by its `aria-label`, and a selection announces the new `#panel-title`; fix any element in src/map.js or src/panel.js that is skipped or read without a name
- [X] T046 [P] Keyboard pass (quickstart E3): Tab order is header → map connections → map stations → legend → frame; every focusable element shows the `:focus-visible` outline; Enter activates; fix DOM order in src/map.js and styles.css as needed
- [X] T047 [P] Narrow-screen pass (quickstart E2): at 375 px wide the frame stacks below the map, the map scrolls horizontally without cutting labels, nothing overflows the viewport; adjust styles.css breakpoint and `#map` overflow
- [X] T048 [P] Contrast pass (quickstart E7, FR-033): run the browser's accessibility audit; confirm 4.5:1 for all text including map labels and line name labels and 3:1 for stroke colours and the focus outline; adjust CSS variables or content/fitsm-3.0/map.json colours; re-run `node scripts/check.js`
- [X] T049 [P] Network and offline pass (quickstart E5, E6, SC-011): devtools Network shows requests only to the site's origin; after load, set Offline and confirm every view still opens; remove any stray external reference (fonts, icons) from index.html or styles.css
- [X] T050 [P] Performance pass (quickstart E8, SC-004): total transfer of `index.html + styles.css + src/*.js + content/editions.json + content/fitsm-3.0/*.json` under 400 KB (`du -ch` and devtools), usable within 2 s on "Fast 3G" throttling, click-to-frame under 100 ms (Performance panel); trim JSON whitespace only if needed (keep it readable for maintainers)
- [X] T051 Walk through every scenario in specs/001-fitsm-process-map/quickstart.md (1.1–5.4, E1–E10) on the served site and tick them; fix anything that fails in the file that owns it
- [X] T052 Confirm `.claude/launch.json` (ignored by git) still points at `python3 -m http.server 8765` for the preview and that README.md "Running locally" gives the same command and port
- [ ] T053 Final `node scripts/check.js`, `node --test` and `reuse lint`; update CHANGELOG.md; open the pull request citing the FitSM documents and versions used (constitution, Development Workflow)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies; T001 is a spec edit that only needs to land before
  acceptance testing; T002–T006 can start at once (T003–T006 in parallel after T002).
- **Foundational (Phase 2)**: depends on T002 (skeleton, `editions.json`) and T003 (REUSE for
  JSON). Blocks all user stories. Within the phase: T007 → T008 → T011 (check needs real
  content for a meaningful run, but T010's fixtures let it run before content is complete);
  T010 before T012 and T015; T015 before T018; T016 and T019 before T018's render calls.
  T009, T010, T012, T013, T014, T017 are independent files.
- **US1 (Phase 3)**: depends on Phase 2. Content tasks T021–T024 only need T007/T008 and the
  PDFs; T025 needs T008.
- **US2 (Phase 4)**: depends on Phase 2 and on T025 (so flows are not entered twice); T030
  needs T029; T031 needs T019.
- **US3 (Phase 5)**: depends on Phase 2 and on T022–T024 (the content the views render).
- **US4 (Phase 6)**: depends on Phase 2; T039 needs T010 and T012.
- **US5 (Phase 7)**: depends on Phase 2; T043 is best run after US1–US3 so every file exists.
- **Polish (Phase 8)**: depends on all stories.

### User Story Dependencies

- **US1**: none beyond Foundational. It is the MVP.
- **US2**: content-wise needs T025 from US1 (external flows are split off there); otherwise
  independent and testable alone.
- **US3**: needs the content files from US1 (T022–T024); its views are independent of US2.
- **US4**: independent of US2/US3; needs US1 content to have something to edit.
- **US5**: independent; T043 is best run last.

### Parallel Opportunities

- Phase 1: T003, T004, T005, T006 in parallel after T002.
- Phase 2: T009, T010, T012, T013, T014, T017 in parallel; T011 and T015 once T008/T010 exist.
- US1: T021, T022, T023, T024 are four independent transcription tasks (the largest work in
  the feature) and can be split between people or sessions; T027 in parallel with T026.
- US3: T034, T035, T036 in parallel.
- US4: T039 and T040 in parallel.
- Polish: T045–T050 in parallel.

---

## Parallel Example: User Story 1

```bash
# Four content files from four PDFs, no shared files:
Task: "Write content/fitsm-3.0/requirements.json from FitSM-1"           # T021
Task: "Write content/fitsm-3.0/roles.json from FitSM-3"                  # T022
Task: "Write content/fitsm-3.0/activities.json from FitSM-2"             # T023
Task: "Write content/fitsm-3.0/records.json from FitSM-0 and FitSM-2"    # T024

# Then the two views; T027 is small and touches a different function than T026.
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 Setup, then Phase 2 Foundational (the check script, pure modules and the page
   shell with stations and line names).
2. Phase 3 US1: transcribe requirements, roles, activities, records and external flows; build
   the process and general-requirements views.
3. **Stop and validate** with quickstart 1.1–1.6. The site already teaches the 14 processes
   and all of FitSM-1; it can be deployed as a first release with the connections still to
   come.

### Incremental Delivery

1. US1 → first deploy (stations, line names, process content).
2. US2 → connections drawn, interfaces explorable: the subway map is complete.
3. US3 → roles, activities and records drill-down.
4. US4 and US5 → maintainer documentation, second-edition check, licence audit; tag `v1.0.0`.

### Content transcription guidance (applies to T007, T008, T021–T025, T029)

- Work from the English PDFs of edition 3.0. Copy text unchanged, including FitSM's spelling
  and punctuation; keep list items as separate array entries.
- Record `source.section` as printed (for example `4.9.3` or `PR9.1`) and `source.page` as
  the PDF page number.
- When unsure whether an output names a FitSM-0 term (T024), search FitSM-0's definitions for
  the exact phrase; if there is no match, it is not a record.
- A pair of processes is an interface (T029) when it appears in a key-interfaces table *or*
  an inputs/outputs table; a party that is not a process goes to `externalFlows` (T025).
- Run `node scripts/check.js` after each file; fix errors before moving on.

---

## Notes

- [P] tasks touch different files and have no dependency on an unfinished task.
- [Story] labels map tasks to spec.md user stories for traceability.
- Commit after each task or logical group; every commit must keep `node scripts/check.js`
  and `node --test` green once Phase 2 is done.
- Stop at any checkpoint to validate the story independently with quickstart.md.

---

## Phase 9: Convergence

**Purpose**: Remaining work found by `/speckit-converge` on 2026-10-04 after comparing the
code with spec.md, plan.md and tasks.md. Ordered by severity.

- [X] T054 Name the selected station's line(s) in words in the process view of src/panel.js: a subtitle line "On the <Line> line" / "On the <A> and <B> lines" built from `graph.stationLines`, followed by "(study aid, not part of FitSM)", so the frame identifies lines without colour for stations as it already does for connections per FR-006 (missing)
- [X] T055 Raise the connection hit target in styles.css from `stroke-width: 16` to 24 so every connection meets the 24 × 24 CSS px minimum per FR-033 (partial)
- [X] T056 Rename the 14 per-process staff roles in content/fitsm-3.0/roles.json from "Process staff member <CODE>" to FitSM-3's exact wording "Process staff member" (keep `source` FitSM-3 §5, no `count`), and make the role view in src/panel.js show the `interpretation` box "FitSM-3 defines this as a common role type (§5) that applies in every process; it does not list it per process." for kind `staff`, so no project wording is presented as FitSM's per Constitution II and FR-018 (partial)
- [ ] T057 Run quickstart E9 with VoiceOver or NVDA on `#ISRM` and `#ISRM-PM` (map title, every station and connection by name, frame heading announced on selection) and fix anything skipped or misread in src/map.js or src/panel.js; then tick T045 per FR-007b (partial)
- [X] T058 Make the map scale to its column at viewports of 900 px and wider in styles.css (remove or lower `.map svg { min-width: 1000px }` inside the `@media (min-width: 900px)` block; keep a minimum width with horizontal scrolling only below 900 px) so the map fits a laptop screen without a scrollbar per FR-001 (partial)
- [X] T059 Validate the newer map fields in scripts/check.js: `transfer.width` is a number between 1 and 10 and less than the line stroke width 6 (message `transfer: width <w> is not a number between 1 and 10 below the line stroke`), and `grid.margin`, if present, is `{ x, y }` with non-negative integers (message `grid.margin: x and y must be non-negative integers`); add fixtures tests/fixtures/broken/bad-transfer-width and tests/fixtures/broken/bad-margin and the matching cases in tests/check.test.js per FR-027 and Constitution VI (partial)
- [X] T060 Remove the obsolete `transfer.dash` field from every map.json under tests/fixtures/ (replace with `"width": 4`) and add `node_modules/` to .gitignore per the plan's project structure (unrequested)
