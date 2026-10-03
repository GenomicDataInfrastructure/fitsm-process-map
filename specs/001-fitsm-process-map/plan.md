# Implementation Plan: FitSM Process Map

**Branch**: `001-fitsm-process-map` | **Date**: 2026-10-03 (revised after `/speckit-analyze`) | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-fitsm-process-map/spec.md`

## Summary

A single-page static site, published on GitHub Pages, that draws the 14 FitSM 3.0 processes as
stations on a subway-style map and shows the standard's content (requirements, roles and
tasks, activities and procedures, records, interfaces with inputs and outputs, external
inputs/outputs) in a detail frame when a station or connection is clicked. All FitSM content
lives in JSON files under `content/<edition>/`, one directory per FitSM edition, with
`content/editions.json` naming the edition the page shows; every item carries a reference to
its FitSM document and section. The map is an inline SVG generated at load time from the
edition's `map.json`, with named, labelled lines as a study aid. Navigation is by URL hash
(`#ISRM`, `#ISRM-PM`, `#GR`), so every view is linkable, keyboard-reachable and screen-reader
accessible through ordinary links. A dependency-free Node script checks the content for broken
references, missing data, octilinear routes and colour contrast, and runs in CI with a REUSE
licence check. The whole project is CC BY 4.0.

**Revision notes**: this revision resolves the `/speckit-analyze` findings: C1 (constitution
IV: editions side by side → `content/<edition>/` directories), I1 (data model and contracts
synced with the second clarification pass: zero-description interfaces, external flows,
"process on no line" check), G1 (line name labels drawn on the map), U2 (alias collision
check), I3 (scale estimates). Spec-level findings (A1 breakpoint, A2 readability criteria, T1
terminology, U1 load failure, I2 network profile) are not changed here; this plan states the
values it uses so they can be lifted into the spec.

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript ES2022 as native ES modules in the browser. Node.js
22 LTS or later for checks and tests (local machine has Node 26; CI pins Node 22).

**Primary Dependencies**: None at runtime and none package-managed. Browser APIs only (`fetch`,
SVG DOM, `hashchange`, `history.replaceState`). Node built-ins only (`node:fs`, `node:path`,
`node:child_process`, `node:test`, `node:assert`). CI uses SHA-pinned GitHub Actions
(`actions/checkout`, `fsfe/reuse-action`, `actions/setup-node`, `actions/configure-pages`,
`actions/upload-pages-artifact`, `actions/deploy-pages`).

**Storage**: Static JSON files. `content/editions.json` lists the editions present and names the
current one; `content/<edition-id>/` holds that edition's eight files (see
[data-model.md](data-model.md)). Loaded with `fetch` over HTTP from the same origin. No
database, no browser storage.

**Testing**: `node scripts/check.js` (content consistency and contrast checks over every edition
listed in `editions.json`, exit code 1 on any error); `node --test` for the pure modules
(`router`, `graph`, `content`) and for `check.js` against fixtures, using Node's built-in
runner; manual browser scenarios in [quickstart.md](quickstart.md). No browser automation (it
would need a package-managed dependency; research R5).

**Target Platform**: Current evergreen desktop and mobile browsers (last two major versions of
Chrome, Firefox, Safari, Edge), served from GitHub Pages or any static HTTP server.

**Project Type**: Static single-page web site with a versioned content store and a CLI check
script.

**Performance Goals**: Usable within 2 s on a "Fast 3G" throttle (the profile quickstart E8
uses; SC-004 says "typical broadband", which is looser): total transfer of page, styles,
scripts and the current edition's JSON under 400 KB, no web fonts. Click-to-frame update under
100 ms: all content is in memory after load; a frame view is a synchronous DOM build.

**Constraints**: No build step, no bundler, no framework (constitution I and Technical
Constraints). No request to any third-party host at runtime (FR-029a, SC-011). Works with the
network disconnected after first load. WCAG 2.1 AA: 4.5:1 for text, 3:1 for line strokes,
station glyphs and the focus indicator; nothing by colour alone. Every file carries SPDX info;
`reuse lint` passes. GitHub Actions pinned to SHAs. Frame beside the map at ≥ 900 px viewport
width, below it under 900 px (value to be lifted into FR-008).

**Scale/Scope**: One edition (FitSM 3.0) now: 14 processes, 7 general requirement groups
(~30 requirements), 14 process requirement groups (~55 requirements), ~45 roles, ~60
activities with procedures, ~30 records, 60–80 interfaces (a pair counts when named in a
key-interfaces table *or* an inputs/outputs table) with ~150 flows, ~40 external flows, 5–7
lines. One page, 9 frame views (intro, process, general, interface, role, activity, record,
not-found, error). Current edition's JSON in the order of 350 KB.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status (pre-design) | Status (post-design) |
|---|---|---|---|
| I. Practicality | Static files, no build step, no server code or account | PASS: plain HTML/CSS/JS; JSON fetched from the same origin | PASS |
| I. Practicality | Every item within two clicks of the map; processes linkable by code | PASS: FR-016, FR-022; hash router gives `#ISRM` | PASS: [contracts/url-hash.md](contracts/url-hash.md) |
| I. Practicality | Keyboard and phone-width usable | PASS: stations and connections are SVG `<a>` links; frame stacks under 900 px | PASS |
| II. Consistency | Every item traceable to a FitSM document and section | PASS: `source` mandatory on every item and checked | PASS: `check.js` fails on a missing source |
| II. Consistency | Exactly 14 processes; nothing FitSM does not define | PASS: FR-001, FR-002; GR1–GR7 and external flows are FitSM-2/FitSM-1 content | PASS: check enforces 14; external parties are never stations |
| II. Consistency | Interpretation labelled; disagreements shown side by side | PASS: `derived` on record usage, `descriptions[]` on interfaces, legend labelled "study aid", fixed sentence for description-less interfaces | PASS |
| III. Sufficiency | No package-managed dependencies or images | PASS: none; `package.json` only sets `"type": "module"` | PASS |
| III. Sufficiency | Bundled third-party resources listed with licence | PASS: none bundled; system font stack (R4) | PASS |
| IV. Extendibility | Content separate from presentation; stable FitSM-based ids | PASS: `content/` vs `src/`; ids from FitSM codes with `aliases` | PASS |
| IV. Extendibility | A later edition, translation or part can be added **alongside** the current content | **PASS after revision** (was the C1 finding): each edition is a sibling directory `content/<edition-id>/`; `editions.json` names the current one; nothing is overwritten to add an edition (R11) | PASS: [data-model.md](data-model.md) Editions |
| V. Openness | Whole project CC BY 4.0; ITEMO credited; SPDX on every file; `reuse lint` | PASS: `LICENSES/CC-BY-4.0.txt`, `REUSE.toml` covers JSON (R6), credit in footer and `edition.json` | PASS |
| VI. Continual improvement | Consistency checks in CI; new content kinds get new checks; tagged releases and changelog | PASS: `scripts/check.js` in `test.yml`; `CHANGELOG.md`; `release.yml` on `v*` | PASS |
| Constraints | No frameworks; WCAG AA; actions pinned | PASS: contrast computed in `check.js`; workflows already pin SHAs | PASS |

No violations. The Complexity Tracking table is empty.

## Project Structure

### Documentation (this feature)

```text
specs/001-fitsm-process-map/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   ├── content-files.md # Content store: editions, files, shapes, maintainer workflow
│   ├── url-hash.md      # Public link grammar
│   └── check-cli.md     # scripts/check.js command contract
├── checklists/          # requirements.md (built-in), content-ux.md (review gate)
└── tasks.md             # Phase 2 output (/speckit-tasks; must be regenerated after this revision)
```

### Source Code (repository root)

```text
index.html               # The page: header, map container, legend, detail frame, footer
styles.css               # Layout, colours, focus states, narrow-screen stacking
src/
├── app.js               # Entry: load editions + content, build model, render, route
├── content.js           # Pure: parse the edition's JSON into an indexed model, derive
│                        #   reverse indexes and per-process lists
├── graph.js             # Pure: connection line/colour (same line vs transfer), interchanges,
│                        #   line label placement, direction grouping
├── router.js            # Pure: parse/format/canonicalise location.hash
├── map.js               # Build the SVG map: connections, stations, line name labels
└── panel.js             # Render detail-frame views
content/
├── editions.json        # { "current": "fitsm-3.0", "editions": [ { id, label, path } ] }
└── fitsm-3.0/
    ├── edition.json     # Documents, versions, download URL, licence, attribution
    ├── processes.json   # 14 processes incl. objective and external flows
    ├── requirements.json# GR1–GR7 and PR1–PR14 groups with items
    ├── roles.json       # Generic tasks per role kind + roles per process
    ├── activities.json  # Activities with procedure steps
    ├── records.json     # Records with FitSM-0 definitions and derived usage
    ├── interfaces.json  # One entry per connected process pair: descriptions + flows
    └── map.json         # Lines (study aid), station grid positions, route waypoints
scripts/
└── check.js             # Consistency and contrast checks (contracts/check-cli.md)
tests/
├── content.test.js, graph.test.js, router.test.js, check.test.js
└── fixtures/            # valid/ and broken/<case>/ content directories for check.test.js
.github/
├── workflows/test.yml, main.yml, release.yml   # rewritten from the existing files
├── ISSUE_TEMPLATE/, pull_request_template.md   # existing; headers updated to CC BY 4.0
package.json             # {"type":"module","private":true}; no dependencies
REUSE.toml, LICENSES/CC-BY-4.0.txt
README.md, CHANGELOG.md, CONTRIBUTING.md, CODE_OF_CONDUCT.md
```

**Structure Decision**: A single static site. Content (`content/`) is separated from behaviour
(`src/`) and presentation (`index.html`, `styles.css`) so that a content update touches only
`content/` (constitution IV, FR-025). Each FitSM edition is a self-contained directory; adding
an edition is adding a directory and an entry in `editions.json`, and the page shows the one
named `current` (FR-028, Clarification 3). `src/` modules that hold logic (`content.js`,
`graph.js`, `router.js`) are pure and import nothing from the DOM, so Node's test runner can
exercise them. `map.js` and `panel.js` touch the DOM and are verified through
[quickstart.md](quickstart.md). The existing `.github/` files are kept where they still apply
(SHA-pinned actions, issue templates) and rewritten where they reference the discarded layout.
The spec's *detail frame* is the `#panel` element rendered by `panel.js`; "frame" in prose and
"panel" in code name the same thing.

## Complexity Tracking

No constitution violations to justify.

## Phase 0: Research

See [research.md](research.md). All Technical Context items are decided; no NEEDS CLARIFICATION
remains. New in this revision: R11 (edition directories), R3 and R10 updated (line labels on
the map, accessible names).

## Phase 1: Design

- [data-model.md](data-model.md): entities, JSON shapes, identifiers, validation rules.
- [contracts/content-files.md](contracts/content-files.md): the maintainer-facing contract.
- [contracts/url-hash.md](contracts/url-hash.md): the visitor-facing link grammar (unchanged).
- [contracts/check-cli.md](contracts/check-cli.md): the CI-facing check script contract.
- [quickstart.md](quickstart.md): how to run, check and verify the feature end to end.

Post-design Constitution Check: re-evaluated above, all gates pass, including IV.

## Values this plan uses that the spec should state

Lifted here so `/speckit-specify` or a manual spec edit can adopt them (analysis A1, A2, I2,
U1):

- FR-008 breakpoint: 900 px viewport width.
- "Readable map" criteria: no station label overlaps another label or a stroke; no segment
  passes through a station it does not end at; parallel segments between the same two
  stations do not overlap.
- SC-004 network profile: "Fast 3G" throttle.
- Load failure: if any content file fails to load or parse, the frame shows one error naming
  the file and the map is not drawn.
