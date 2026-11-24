---

description: "Task list for feature 002: Records Aligned with FitSM"
---

# Tasks: Records Aligned with FitSM

**Input**: Design documents from `/specs/002-fitsm-records/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md),
[data-model.md](data-model.md), [contracts/](contracts/), [quickstart.md](quickstart.md)

**Tests**: Included. The spec requires new checks with failing fixtures (FR-013, SC-007), and
the plan's Testing section lists unit tests for `content.js`, `router.js` and the check script.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested
on its own.

**Sources**: FitSM-0 v3.0.1 and FitSM-2 v3.0.2 PDFs from the URLs in
`content/fitsm-3.0/edition.json`. Pages are PDF page numbers: FitSM-0 printed page + 4,
FitSM-2 printed page + 2 (research R3). Quote FitSM text unchanged.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

---

## Phase 1: Setup

**Purpose**: Confirm the starting point and the sources.

- [X] T001 Run `node scripts/check.js`, `node --test` and `reuse lint` on branch `002-fitsm-records` and confirm all pass before any change (baseline: 0 errors, 69 tests)
- [X] T002 Download FitSM-0 v3.0.1 and FitSM-2 v3.0.2 from the `url` fields of content/fitsm-3.0/edition.json into a directory outside the repository (never commit them) and extract their text with `pdftotext -layout` for quoting and `match` lookups

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Switch `records.json` to the new shape and make the model and checks understand it, while the page keeps showing today's nine records.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T003 Migrate content/fitsm-3.0/records.json to the data-model shape: keep the nine ids and their `name` and `definition` unchanged; replace each `usedBy` entry `{ process, basis: "output", derived, source }` with a relationship `{ "process", "kind": "maintains", "basis": { "output": "<process>", "match": "<≥3 characters copied from that process's output text in processes.json>" } }`; add `"general": true` to `record` and drop its relationships (data-model.md Record: "Only on `record` (FitSM-0 6.53) … exempt from 'needs a relationship'")
- [X] T004 [P] Migrate the `records.json` of every fixture edition under tests/fixtures/ (valid/, editions/good/, two-editions/good/, two-editions/bad/ and every broken/<case>/) to the same shape with a one-off `node -e` rewrite; take every `match` from that fixture's own `processes.json` outputs (not from the real content, whose text may differ), so each basis resolves within the fixture; do not commit the rewrite script; `node --test` must pass at T008
- [X] T005 Rewrite the record part of `buildModel` in src/content.js: resolve every relationship's basis (`activity` → first `procedure` step of that activity containing `match`; `input`/`output` → first item of that process's `inputs`/`outputs` containing `match`; `flow` → first flow of that interface whose `item` contains `match`) into `relation.resolved = { text, source, link? }` with `link` `#activity/<id>` for activity bases; set `process.records = { maintains: [], uses: [] }` and `activity.records = { maintains: [], uses: [] }` from the relationships, skipping `general` records; keep `record.processes` as the list of related codes for existing callers
- [X] T006 Update scripts/check.js rule 3 and the record block (around line 238) for the new shape: error `records.json: <id>: usedBy is replaced by relations` when `usedBy` is present; remove the `usedBy` checks; keep id, name and definition checks (full rule 16 comes in US3)
- [X] T007 [P] Update tests/content.test.js: a relationship with each basis form resolves to the right text, source and link; `process.records` and `activity.records` group by kind; a `general` record appears in neither
- [X] T008 Run `node scripts/check.js` and `node --test`; serve the site and confirm the nine records still open at `#record/<id>` and still appear on their processes

**Checkpoint**: The new shape is in place and nothing visible has regressed.

---

## Phase 3: User Story 1 - Learn what a process records (Priority: P1) 🎯 MVP

**Goal**: Every process shows the FitSM information it creates, maintains or uses, with FitSM-0 definitions, in "Information and records"; activities and record views show the same relationships.

**Independent Test**: quickstart R1–R6: open `#PM`, Known error, the known error database and `#activity/PM.A3`; check definitions against the PDFs.

### Content for User Story 1

All content tasks edit content/fitsm-3.0/records.json and run in order. Apply FR-001/FR-004a (data-model.md "Derivation rules"): `maintains` from an output or a step that registers, records, documents, updates or maintains the object; `uses` from an input or a step that consults, checks, analyses or uses it; a flow counts for both ends; one relationship per process per record, `maintains` wins. Name each record exactly as FitSM-0 prints the term (clarification 1).

- [X] T009 [US1] Add or revise the agreement records with relationships for SPM, SLM, SRM, CRM and SUPPM in content/fitsm-3.0/records.json: Service portfolio (6.69), Service catalogue (6.62), Service level agreement (6.64), Operational level agreement (6.45), Underpinning agreement (6.76), Report (6.56); plus every SLA/OLA/UA/report use by other processes found in their inputs, outputs and flows
- [X] T010 [US1] Add the assurance and security records in content/fitsm-3.0/records.json: Information security control (6.31), Information security event (6.32), Information security incident (6.33), Policy (6.47), Risk (6.58), with relationships for ISM, SACM and CAPM; confirm each against FR-001 in the FitSM-2 text and drop any that fails
- [X] T011 [US1] Add the operations records in content/fitsm-3.0/records.json: Incident (6.29), Major incident (6.40), Service request (6.71), Problem (6.50), Known error (6.38), Workaround (6.80), with relationships for ISRM, PM and every process that uses them (e.g. PM inputs "Incident and service request records")
- [X] T012 [US1] Add the control records in content/fitsm-3.0/records.json: Configuration item (6.15), Configuration management database (6.16), Request for change (6.57), Change (6.8), Emergency change (6.23), Release (6.54), Release and deployment strategy (6.55), Service acceptance criteria (6.61), Improvement (6.28), with relationships for CONFM, CHM, RDM, CSI and every process that raises RFCs or uses the CMDB
- [X] T013 [US1] Add the FitSM-2-only stores with `"fitsm0": false`, the name as FitSM-2 prints it and a FitSM-2 quote and source in content/fitsm-3.0/records.json: Known error database (KEDB) (PM, ISRM), Customer database and Customer complaint records (CRM), Supplier database (SUPPM), Service availability and continuity plans (SACM), Capacity plans (CAPM), List of agreed reports (SRM), Plans for new or changed services (SPM, SUPPM, CHM), List of standard changes (CHM) (research R2)
- [X] T014 [US1] Add `alsoCalled` entries in content/fitsm-3.0/records.json where FitSM-2 names a record differently from FitSM-0 (for example "known error record", "configuration record", "release records"), each with its FitSM-2 source
- [X] T015 [US1] For each of the 14 processes, confirm it has at least one record other than Report and Request for change; where FitSM-2 gives none, record why in research.md R1 (SC-004)

### Page for User Story 1

- [X] T016 [P] [US1] In the process view of src/panel.js, rename the section to "Information and records" and render two groups, "Creates or maintains" and "Uses", from `process.records`, each record a link to `#record/<id>`, an empty group omitted, under one interpretation box "Derived from FitSM-2's activities, inputs and outputs; FitSM does not list records per process." (FR-005, FR-006)
- [X] T017 [US1] In the activity view of src/panel.js, add the same two groups from `activity.records` with the same interpretation box, omitted when empty (FR-006b)
- [X] T018 [US1] In the record view of src/panel.js: show the definition with its source; for `fitsm0: false` the note "FitSM-0 gives no definition for this; the text is from FitSM-2."; each `alsoCalled` entry as a "FitSM-2 wording" line with source and its `note` in an interpretation box; then "Created or maintained by" and "Used by", each process entry linking to the process and naming the resolved basis text with its source, the basis linking to `#activity/<id>` when it is an activity (FR-007)
- [X] T019 [P] [US1] Update the intro text in src/panel.js ("…roles, records and activities") to match the new section name, and README.md's "What you can explore" rows for a process and for a database or record
- [X] T020 [US1] Run quickstart R1–R6 and R6a on the served site and fix any finding in the file that owns it

**Checkpoint**: User Story 1 is complete and can ship as the MVP.

---

## Phase 4: User Story 2 - See all records of all processes at once (Priority: P2)

**Goal**: A records overview at `#RECORDS`, reached from the header, with records against the 14 processes.

**Independent Test**: quickstart R7–R12.

- [X] T021 [P] [US2] Add the `records` route to src/router.js per contracts/url-hash.md: `parse` returns `{ kind: "records", raw }` for `RECORDS` in any case; `format("records")` returns `"#RECORDS"`; canonicalise like `#GR`
- [X] T022 [P] [US2] Add router cases to tests/router.test.js: `#RECORDS`, `#records` (canonicalised), and that `RECORDS` never parses as a process
- [X] T023 [P] [US2] Add `model.overview` to src/content.js per data-model.md "Overview ordering": processes in PR order from the requirement groups; rows grouped by the first process in that order with a `maintains` relationship, then by `name`; records with no `maintains` last by `name`; the `general` record as `overview.general`, not a row; each row's `cells` a map from process code to kind
- [X] T024 [P] [US2] Add overview ordering and cell tests to tests/content.test.js
- [X] T025 [US2] Add the overview view to src/panel.js: heading "Records"; the `general` record's definition and source on top; a legend for the two marks; a `<table>` with `<caption>`, `<th scope="col">` per process code (link to `#<code>`, accessible name the full process name), `<th scope="row">` per record (link to `#record/<id>`), cells holding "●" for creates or maintains and "○" for uses inside an element whose accessible text is "creates or maintains" / "uses", empty otherwise, cells not focusable; the interpretation box (FR-009–FR-011, research R6)
- [X] T026 [US2] Handle the `records` route in src/app.js: render the overview, page title "Records – FitSM Process Map", nothing highlighted on the map, back target the intro when entered directly; links from the overview push history so back returns to it
- [X] T027 [P] [US2] Add the "Records" header link next to "General requirements" in index.html (`href="#RECORDS"`, class `header-link`)
- [X] T028 [P] [US2] Style the overview in styles.css: horizontally scrolling table container, `position: sticky` row-header column with an opaque background, readable marks, focus-visible on header links; the page itself must not scroll sideways at 375 px (FR-012)
- [ ] T029 [US2] Run quickstart R7–R12 on the served site (R9 with VoiceOver or NVDA) and fix any finding — **Partly done (2026-11-21)**: R7, R8, R10–R12 pass in the browser; the screen-reader run (R9) needs a person with VoiceOver or NVDA.

**Checkpoint**: User Stories 1 and 2 work on their own.

---

## Phase 5: User Story 3 - Maintain the records content (Priority: P3)

**Goal**: The checks catch every broken record or relationship, and the maintainer workflow is documented.

**Independent Test**: quickstart R13–R15.

- [X] T030 [US3] Implement rule 16 in scripts/check.js exactly as in contracts/check-cli.md (each condition and message in its table); add the record and relationship counts to the summary line
- [X] T031 [P] [US3] Create one fixture per rule 16 row under tests/fixtures/broken/ (e.g. record-no-definition, record-not-fitsm0, store-not-fitsm2, two-general, record-no-relation, relation-unknown-process, relation-bad-kind, relation-duplicate-process, basis-malformed, basis-wrong-activity, basis-wrong-io-process, basis-not-interface-end, basis-match-not-found, record-usedBy), each a copy of tests/fixtures/valid/ differing only in records.json
- [X] T032 [US3] Add one case per new fixture to tests/check.test.js asserting exit code 1 and the contract's message
- [X] T033 [P] [US3] Update README.md "Updating the content": records.json step per contracts/content-files.md "Maintainer workflow for records" (match strings, PDF pages, keep ids)
- [X] T034 [P] [US3] Add a "Superseded by feature 002" note to the Record section of specs/001-fitsm-process-map/data-model.md, pointing to specs/002-fitsm-records/data-model.md
- [X] T035 [US3] Run quickstart R13–R15

**Checkpoint**: All user stories are complete.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T036 [P] Add a CHANGELOG.md entry under Unreleased naming FitSM-0 v3.0.1 and FitSM-2 v3.0.2, the number of records and relationships, the overview and the renamed section
- [X] T037 [P] Run quickstart R16 (the nine old record addresses) and R17 (under 400 KB, usable within 2 s on "Fast 3G")
- [ ] T038 Final `node scripts/check.js`, `node --test` and `reuse lint`; set spec.md status to "Implemented"; open the pull request citing FitSM-0 v3.0.1 and FitSM-2 v3.0.2 sections used (constitution, Development Workflow) — **Partly done (2026-11-21)**: checks, tests and `reuse lint` pass and spec.md is marked Implemented; committing and the pull request wait for the maintainer (commits are GPG-signed with a smart card).

---

## Dependencies & Execution Order

- **Setup (Phase 1)** → **Foundational (Phase 2)** → user stories.
- **US1 (P1)** needs Phase 2 only. Content tasks T009–T015 run in order (one file); page tasks T016–T019 can start once T005 is done and run alongside the content tasks (T017 and T018 follow T016 in the same file).
- **US2 (P2)** needs Phase 2; it shows more once US1's content exists but can be built and tested on the migrated nine records. T025 follows T023; T026 follows T021 and T025.
- **US3 (P3)** needs Phase 2; T030 can start any time after T006. T032 follows T030 and T031.
- **Polish** after the stories that are being shipped.

## Parallel Examples

- Phase 2: T004 (fixtures) and T007 (content tests) alongside T005.
- US1: T016 and T019 (page) while T009–T015 (content) proceed.
- US2: T021, T022, T023, T024, T027 and T028 together; then T025, T026.
- US3: T031 and T033 alongside T030.

## Implementation Strategy

1. **MVP**: Phases 1–3. PM shows Problem and Known error with FitSM-0 definitions; every process lists its records; ship.
2. **Increment 2**: Phase 4, the overview at `#RECORDS`.
3. **Increment 3**: Phase 5, full checks and maintainer docs; then Phase 6.

Each checkpoint leaves `node scripts/check.js` and `node --test` passing.
