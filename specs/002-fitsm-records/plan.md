# Implementation Plan: Records Aligned with FitSM

**Branch**: `002-fitsm-records` | **Date**: 2026-11-20 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-fitsm-records/spec.md`

## Summary

Replace the nine generic records with about 35 information objects taken from FitSM-0 (for
example Problem, Known error, Incident, Change, Configuration item) plus the stores FitSM-2
names without a FitSM-0 definition (for example the known error database, the customer
database). Each record carries its quoted definition and a list of relationships to
processes, each relationship "creates or maintains" or "uses" and resting on a FitSM-2
activity step, process input/output or interface flow, quoted by a short `match` string. The
page derives three things from these relationships: the process view's "Information and
records" groups, a new record list on the activity view, and a new records overview at
`#RECORDS`, an HTML table of records against the 14 processes reached from the header. The
check script gains rules that resolve every relationship against the FitSM-2 text already in
the content. No new dependency; only `content/` holds FitSM text.

## Technical Context

**Language/Version**: Unchanged from feature 001: HTML5, CSS3, JavaScript ES2022 as native ES
modules; Node.js 22 LTS or later for checks and tests.

**Primary Dependencies**: None at runtime and none package-managed (unchanged).

**Storage**: Static JSON under `content/fitsm-3.0/`. Only `records.json` changes shape
(`usedBy` → `relations`, new fields; see [data-model.md](data-model.md)). No new content file.

**Testing**: `node scripts/check.js` with new record rules (contracts/check-cli.md); `node
--test` for `content.js` (relationship indexes, overview ordering), `router.js` (`#RECORDS`)
and the check fixtures; manual browser scenarios in [quickstart.md](quickstart.md).

**Target Platform**: Current evergreen desktop and mobile browsers; GitHub Pages (unchanged).

**Project Type**: Static single-page web site with a versioned content store and a CLI check
script (unchanged).

**Performance Goals**: Feature 001's budget holds: total transfer under 400 KB, usable within
2 s on "Fast 3G", click-to-frame under 100 ms. `records.json` grows from about 6 KB to an
estimated 40 KB (35 records, about 250 relationships of about 150 bytes each). Delivered:
36 records and 84 relationships, 4.4 KB gzipped; the whole page is 268 KB on disk.

**Constraints**: Quote FitSM text unchanged (Constitution II); label every relationship as an
interpretation; WCAG 2.1 AA; no colour-only meaning; keyboard and phone-width use.

**Scale/Scope**: About 35 records (26 from FitSM-0, 9 FitSM-2-only, research R1–R2), about
250 relationships, one new view, changes to three existing views (process, activity, record).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Check | Result |
|---|---|---|
| I. Practicality | Static files, no build step. The overview is one click from the header; every record stays within two clicks of the map (station → record). `#RECORDS` and `#record/<id>` are linkable. Keyboard and phone width covered by FR-011, FR-012, FR-017. | Pass |
| II. Consistency with the Standard | Names and definitions quoted unchanged from FitSM-0 with section and page; FitSM-2-only stores flagged and quoted from FitSM-2 (FR-003). Every relationship is labelled "Not part of FitSM" and names its FitSM-2 basis (FR-004a, FR-005). Differing FitSM-2 wording is shown beside FitSM-0's (Edge Cases). No process, role or requirement is added. | Pass |
| III. Sufficiency | No dependency, no container image. The overview serves understanding of how processes share information. | Pass |
| IV. Extendibility | All record content stays in `content/<edition>/records.json`; the overview, activity and process lists are derived. Record ids are kept stable (R5); bases use `match` strings rather than indexes, so a new edition shows breakage in the checks instead of silently pointing at the wrong step (R4). | Pass |
| V. Openness and Attribution | FitSM content stays credited to ITEMO e.V. under CC BY 4.0; the downloaded PDFs are research inputs and are not committed. New files carry SPDX information through `REUSE.toml`. | Pass |
| VI. Continual Improvement | New kind of content (relationships) comes with new checks and fixtures (FR-013, contracts/check-cli.md). CHANGELOG entry names FitSM-0 v3.0.1 and FitSM-2 v3.0.2. | Pass |

**Post-design re-check (after Phase 1)**: Pass. The data model adds no field that holds
interpretation without being labelled on the page (`relations` is always shown under the
"Not part of FitSM" box), and the contracts keep the content/presentation split.

## Project Structure

### Documentation (this feature)

```text
specs/002-fitsm-records/
├── plan.md              # This file
├── research.md          # Phase 0: term list, FitSM-2-only stores, page convention, basis format
├── data-model.md        # Phase 1: Record, Relationship, Basis; derived views
├── quickstart.md        # Phase 1: validation scenarios
├── contracts/
│   ├── content-files.md # Changes to records.json and the maintainer workflow
│   ├── url-hash.md      # #RECORDS
│   └── check-cli.md     # New check rules and messages
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/speckit-tasks; not created here)
```

### Source Code (repository root)

```text
index.html               # + "Records" header link next to "General requirements"
styles.css               # + overview table: scroll container, sticky row headers, marks
src/
├── app.js               # + route kind "records" (title, back target, header state)
├── content.js           # + relations index per process and per activity, overview rows
│                        #   and ordering (FR-010); basis resolution to source and link
├── router.js            # + parse/format "#RECORDS"
└── panel.js             # Process view: "Information and records" with two groups;
                         #   activity view: record list; record view: grouped processes
                         #   with basis; new overview view
content/fitsm-3.0/
└── records.json         # Rewritten: ~35 records with relations (data-model.md)
scripts/
└── check.js             # + record and relationship rules (contracts/check-cli.md)
tests/
├── content.test.js, router.test.js, check.test.js   # + cases for the above
└── fixtures/            # every edition's records.json migrated to the new shape;
                         #   + broken/<case>/ for each new rule
README.md, CHANGELOG.md  # "What you can explore" row for the overview; changelog entry
```

**Structure Decision**: Same single static site as feature 001; this feature changes one
content file, four modules, the page header and the stylesheet. `map.js` and `graph.js` are
untouched (the map does not change).

## Complexity Tracking

No constitution violations to justify.
