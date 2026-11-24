---

description: "Task list for feature 003: FitSM Process Charts"
---

# Tasks: FitSM Process Charts

**Input**: Design documents from `/specs/003-process-charts/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md),
[data-model.md](data-model.md), [contracts/](contracts/), [quickstart.md](quickstart.md)

**Tests**: Included. The spec requires failing fixtures for the new checks (FR-012, SC-006),
and the plan lists unit tests for `src/chart.js`, `router.js`, `content.js` and the checks.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested
on its own. Revised after `/speckit-analyze` (M1–M5, L1–L4): the text version is part of US1's
wide view; check rule 17 comes before the transcription, with only its "no chart" error
switched on once all 14 charts exist.

**Source**: FitSM-2 v3.0.2 from the `url` in `content/fitsm-3.0/edition.json`. Chart pages
(PDF): SPM 12, SLM 15, SRM 18, SACM 20, CAPM 22, ISM 24, CRM 26, SUPPM 28, ISRM 31, PM 33,
CONFM 35, CHM 37, RDM 39, CSI 42 (research R1, corrected during implementation). Coordinates are PDF points from the chart's
top-left corner; labels are quoted exactly as printed in the chart, line breaks as `\n`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1–US4)

---

## Phase 1: Setup

- [X] T001 Run `node scripts/check.js`, `node --test` and `reuse lint` on branch `003-process-charts`; all must pass (baseline: 0 errors, 85 tests)
- [X] T002 Download FitSM-2 v3.0.2 outside the repository (never commit it) and render the 14 chart pages listed above at 200 dpi with `pdftoppm -f <p> -l <p> -r 200 -png`, cropped to the chart (all 14 are bitmaps, research R1)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Load a ninth content file, index it, validate it, and provide the pure chart functions every story needs.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T003 Add `"charts"` to `FILES` in src/content.js and scripts/check.js; create content/fitsm-3.0/charts.json as `[]`; in scripts/check.js rule 3 require `charts.json` to be an array (contracts/check-cli.md "Changed rules")
- [X] T004 [P] Add a charts.json to every fixture edition under tests/fixtures/ (valid/, editions/good/, two-editions/good/, two-editions/bad/ and every broken/<case>/): one minimal chart per fixture process AA…NN with `source` `{ "doc": "FitSM-2", "section": "<that process's PR group>", "page": 5 }`, `size` `{ "w": 200, "h": 100 }`, one `group` linked to `<code>.A1` and one `step` inside it, no arrows; generate once with a one-off `node -e` (not committed)
- [X] T005 In src/content.js set `process.chart` from charts.json and build `record.charts = [{ process, states }]` from objects with `record`, where a state is the bracketed part of the label ("Problem [known error]" → "known error") (data-model.md "Derived model")
- [X] T006 Create src/chart.js with pure functions (no DOM): `chartScale(chart, availableWidth)` → `{ scale, minWidth }` with labels at 7.5 chart units (changed from 9 after the PM pilot, research R4) and `minWidth = size.w × 12 / 7.5` (research R4); `lineColour(segment, chart)` → `"light"` when the segment lies inside a group box, else `"dark"` (research R5); `labelState(label)`; `elementLink(element, chart, model)` → `#activity/<id>` for groups and their steps, `#record/<id>` for objects with `record`, `#<A>-<B>` or `#<code>` for externals, else null; `chartOutline(chart, model)` → groups in reading order (top-to-bottom, then left-to-right), each with steps in sequence order (start at the step with no incoming `sequence` arrow from a step of the same group, follow `sequence` arrows, append unreached steps in reading order) and their reads/produces from `flow` arrows, decisions with branch labels, then objects (with state and record), notes, externals, and all arrows as `{ from, to, kind, heads, label }` (research R7)
- [X] T007 [P] Create tests/chart.test.js covering every function of T006 on a hand-made chart: scale and min width, light/dark segments, state parsing, each kind of link (including an external with and without an interface), sequence order with a branch and an unreached step
- [X] T008 [P] Add tests to tests/content.test.js: `process.chart` is set from a fixture chart; `record.charts` lists a process once with all its states
- [X] T009 Implement rule 17 in scripts/check.js exactly as in contracts/check-cli.md (each condition and message of its table and the informational `charts` line) **except** the "no chart" row, which T021 switches on; so every chart added from here on is validated while the empty content still passes
- [X] T010 Run `node scripts/check.js` and `node --test`; both pass with `charts.json` still empty

**Checkpoint**: Charts load, are validated and the pure functions are tested; nothing is drawn yet.

---

## Phase 3: User Story 1 - See how a process runs (Priority: P1) 🎯 MVP

**Goal**: Each process view shows FitSM-2's chart, faithfully redrawn, with its source and a wide view at `#chart/<code>` with its text version.

**Independent Test**: quickstart C1–C4: compare each chart with the PDF render; the wide view shows chart and text version.

### Rendering for User Story 1

- [X] T011 [US1] Add `renderChart(chart, model, el)` to src/chart.js, which builds the SVG through an injected element factory `el(name, attrs, children)`: viewBox `0 0 w h`; `group` = filled rect with title at top; `step` = light rect inside, with a small document icon in the top-right corner when `mark: "record"`; `decision` = diamond; `end` = rounded rect; `object` = document (wavy bottom), `documents` (two offset documents) or `database` (cylinder), `fill` white or grey; `note` = grey rect; `external` = grey arrow with its label; labels centred, 9 units, split on `\n`; arrows from box edge through `points` to box edge, `sequence` solid and `flow` dashed `4 3`, arrowhead at the end or at both ends for `heads: "both"`, optional label at the midpoint, each segment classed light or dark by `lineColour`; CSS classes only, no inline colours (research R2, R5)
- [X] T012 [P] [US1] Add chart styles to styles.css with the values of research R5: group #2f5f98 with #ffffff title, step #c6d7ec with #1d1d1f text and #2f5f98 border, object white #ffffff or grey #d9d9d9 with #1d1d1f text, dark lines #1d1d1f, light lines #ffffff, external arrows #6b6b6b; `.chart-compact` scrolling sideways in its box with the SVG's `min-width` from `chartScale` so labels never render below 12 px (FR-011)
- [X] T013 [US1] In the process view of src/panel.js add a "Process chart" section after "Activities": a `<figure>` named "Process chart of <process name>" holding `renderChart` with the real DOM factory, the source line "FitSM-2 v3.0.2 §PRn (p. n)", the chart's `notes` in a "Not part of FitSM" box, and a link "Open chart, with text version" to `#chart/<code>`; omit the section when the process has no chart (FR-001, FR-004, FR-014)
- [X] T014 [P] [US1] Add `chart` to src/router.js per contracts/url-hash.md: prefixed `chart/<code>` resolving codes and aliases case-insensitively, `format("chart", code)` → `#chart/<code>`, unknown code or no chart → not found; add the cases to tests/router.test.js
- [X] T015 [US1] Handle route kind `chart` in src/app.js and the wide view in src/panel.js: add class `chart-mode` to `<main>` (map column hidden, frame full width), render the chart at up to 2× scale with its source, notes and a back control (to `#<code>` when entered directly), title "<Process name> chart – FitSM Process Map", keep the process's station selected; remove `chart-mode` on any other route; add the `chart-mode` layout to styles.css (FR-001a)
- [X] T016 [US1] In the wide view of src/panel.js render `chartOutline` as the text version beside the chart (below it under 900 px): a list of groups (each a link to its activity) with their steps in order and "reads: …" / "produces: …" lines, decisions with their branches, then "Information" (objects with state; record links marked as the site's match), "Notes", "Other processes" and "All arrows" as "from → to (sequence | information flow[, label])" (FR-001a, FR-010, research R7)

### Content for User Story 1

Every transcription is validated by rule 17 (T009) as it is written. For each chart: every element and arrow of the PDF chart, labels exactly as printed, positions in points (pixels × 72 ÷ 200), `group.activity` set to the matching activity id, objects linked to records only where the object is that record; then serve the page and compare side by side with the render. In `notes`, list (a) any difference the site draws and (b) every difference in meaning between the chart's wording and FitSM-2's text for the same activity or step, naming both wordings (e.g. PM: chart "Update or remove known error", text "Update or deactivate a known error record") (FR-014, contracts/content-files.md "Maintainer workflow"). Batches may be written in parallel as separate fragments, each owning whole charts, then merged into charts.json and checked, as in feature 002.

- [X] T017 [US1] Transcribe PM's chart (page 33) in content/fitsm-3.0/charts.json, run `node scripts/check.js`, and compare it with the PDF (MVP chart)
- [X] T018 [US1] Transcribe SPM (12), SLM (15), SRM (18) and SACM (20) in content/fitsm-3.0/charts.json, check, and compare each with the PDF
- [X] T019 [US1] Transcribe CAPM (22), ISM (24), CRM (26) and SUPPM (28) in content/fitsm-3.0/charts.json, check, and compare each with the PDF
- [X] T020 [US1] Transcribe ISRM (31), CONFM (35), CHM (37), RDM (39) and CSI (42) in content/fitsm-3.0/charts.json, check, and compare each with the PDF
- [X] T021 [US1] Switch on rule 17's "no chart" error in scripts/check.js (`charts.json: <code>: no chart`) now that all 14 charts exist, and run `node scripts/check.js`
- [X] T022 [US1] Run quickstart C1–C4 for all 14 processes and fix every difference in content/fitsm-3.0/charts.json or src/chart.js

**Checkpoint**: Every process shows its chart and the wide view with its text version; this is the MVP.

---

## Phase 4: User Story 2 - Move from the chart to the details (Priority: P2)

**Goal**: Chart elements open activities, records and interfaces; record views list the charts they appear in.

**Independent Test**: quickstart C5–C7.

- [X] T023 [US2] In src/chart.js `renderChart`, wrap every element with a non-null `elementLink` in an `<a>` with that href and an accessible name (the label, plus "activity", "record" or "interface with <process>"); unlinked elements stay plain; links appear in reading order in the DOM (FR-006–FR-008)
- [X] T024 [P] [US2] In the record view of src/panel.js add "In process charts" from `record.charts`: each process name with its states, linking to `#chart/<code>`, under a "Not part of FitSM" note that the match of chart objects to records is the site's (FR-007, FR-009)
- [X] T025 [P] [US2] Add link cases to tests/chart.test.js: rendering with a stub factory produces one `<a>` per linkable element with the expected href and none for unlinked objects
- [X] T026 [US2] Run quickstart C5–C7 and fix any finding

**Checkpoint**: Stories 1 and 2 work on their own.

---

## Phase 5: User Story 3 - Read the chart without seeing it, or on a phone (Priority: P3)

**Goal**: Keyboard access, screen-reader names and the phone-width layout for both the compact and the wide chart.

**Independent Test**: quickstart C8–C10.

- [X] T027 [P] [US3] Finish the responsive layout in styles.css: wide view side by side at ≥ 900 px and stacked below; compact and wide charts scrolling sideways in their boxes at phone width with labels ≥ 12 px; focus ring on chart links like the map's (FR-011)
- [X] T028 [US3] Run quickstart C8–C10 and fix any finding in src/chart.js, src/panel.js or styles.css; C9 (VoiceOver or NVDA) is best done in one session with feature 001's T045/T057 and feature 002's R9, all of which need the same manual run — **Won't do (2026-11-24)**: the maintainer decided the manual screen-reader pass is not needed.

**Checkpoint**: Stories 1–3 work on their own.

---

## Phase 6: User Story 4 - Maintain the charts (Priority: P4)

**Goal**: Every rule-17 error is proven by a failing fixture; the transcription workflow is documented.

**Independent Test**: quickstart C11–C12.

- [X] T029 [P] [US4] Create one fixture per rule-17 error row under tests/fixtures/broken/chart-<case>/ (chart-missing, chart-duplicate, chart-bad-source, chart-bad-size, chart-bad-id, chart-bad-kind, chart-box-outside, chart-wrong-activity, chart-step-outside-group, chart-bad-object, chart-unknown-record, chart-bad-external, chart-arrow-unknown-end, chart-arrow-bad-kind, chart-bend-outside), each a copy of tests/fixtures/valid/ differing only in charts.json
- [X] T030 [US4] Add one case per new fixture to tests/check.test.js asserting exit code 1 and the contract's message
- [X] T031 [P] [US4] Add "Adding or correcting a chart" to README.md from contracts/content-files.md "Maintainer workflow", including the rule to note differences in meaning, and add `charts.json` to the file order and the edition file list
- [X] T032 [US4] Run quickstart C11–C12

**Checkpoint**: All user stories are complete.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T033 [P] Add a CHANGELOG.md entry under Unreleased naming FitSM-2 v3.0.2 and the 14 process charts, the wide view `#chart/<code>` and the new check rule; add the chart rows to README.md "What you can explore" and `#chart/PM` to the direct-link examples
- [X] T034 [P] Run quickstart C13–C14 (canonical addresses, not found, page weight under 400 KB, timing)
- [X] T035 Final `node scripts/check.js`, `node --test` and `reuse lint`; set spec.md status to "Implemented"; open the pull request citing FitSM-2 v3.0.2 PR1–PR14 chart pages — **Closure note (2026-11-24)**: delivered in pull request #6 (merged); checks, 111 tests and `reuse lint` passed in CI.

---

## Dependencies & Execution Order

- **Setup** → **Foundational** → stories.
- **US1** needs Phase 2. T011 before T013, T015 and T016; T014 is independent. Transcription T017–T020 runs in order on one file (or as parallel fragments) and can start once T011 and T013 render something to compare against; T021 after T020; T022 last.
- **US2** needs T011 and at least one transcribed chart; T024 can be built on fixtures.
- **US3** needs T015–T016.
- **US4** needs T009 (rule 17) and T021 (the "no chart" row) for its fixtures and tests.
- **Polish** last.

## Parallel Examples

- Phase 2: T004, T007 and T008 alongside T005/T006; T009 after T003.
- US1: T012 and T014 alongside T011; transcription batches as parallel fragments.
- US2: T024 and T025 alongside T023.
- US4: T029 and T031 alongside each other; T030 after T029.

## Implementation Strategy

1. **MVP**: Phases 1–2, then T011–T017 (rendering, wide view with text version, PM's chart); then the other 13 charts (T018–T020), T021 and T022.
2. **Increment 2**: Phase 4 (links, record view).
3. **Increment 3**: Phase 5 (keyboard, screen reader, phone width).
4. **Increment 4**: Phase 6 (fixtures, docs), then Phase 7.

Each checkpoint leaves `node scripts/check.js` and `node --test` passing.

---

## Closure (2026-11-24)

Feature 003 is closed, merged through pull request #6. Every task is done except the
screen-reader pass of the charts (T028's C9), deferred because it needs a manual run with
VoiceOver or NVDA. One session can cover it together with feature 001's T045/T057 and feature
002's R9.

**Update (2026-11-24)**: the screen-reader pass (T028, quickstart C9) is marked won't do; the maintainer
decided it is not needed. The feature is complete.
