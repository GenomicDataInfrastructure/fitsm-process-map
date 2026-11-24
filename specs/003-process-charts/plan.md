# Implementation Plan: FitSM Process Charts

**Branch**: `003-process-charts` | **Date**: 2026-11-24 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/003-process-charts/spec.md`

## Summary

Redraw FitSM-2's 14 process charts as interactive SVG. Each chart is transcribed by hand from
the PDF into a new content file, `charts.json`: elements (activity groups, steps, decisions,
end states, information objects, notes, external ends) with positions in PDF points, and
arrows (sequence or information flow, one or two heads, optional label and bends). A new pure
module builds the SVG and the text version from that content. The process view shows a compact
chart scaled to the frame with an "Open chart, with text version" link; `#chart/<code>` shows
the chart across the map's area with its text version beside it. Groups and steps open their
activity, objects open their feature-002 record, external ends open the interface; the record
view lists the charts a record appears in. A new check rule validates every chart. No new
dependency.

## Technical Context

**Language/Version**: Unchanged: HTML5, CSS3, JavaScript ES2022 as native ES modules; Node.js 22
LTS or later for checks and tests.

**Primary Dependencies**: None at runtime and none package-managed. Maintainers transcribing a
chart use the poppler command-line tools (`pdftoppm`) only as reading aids; they
are not part of the project or CI (research R1).

**Storage**: Static JSON under `content/fitsm-3.0/`; new ninth file `charts.json`
([data-model.md](data-model.md)).

**Testing**: `node scripts/check.js` (new rule 17, contracts/check-cli.md); `node --test` for the
new `src/chart.js` pure functions (layout scale, line colour by background, text-version
order), `router.js` (`#chart/<code>`), `content.js` (record ↔ chart index) and check fixtures;
manual comparison of each chart with the PDF and browser scenarios in
[quickstart.md](quickstart.md).

**Target Platform**: Current evergreen desktop and mobile browsers; GitHub Pages (unchanged).

**Project Type**: Static single-page web site with a versioned content store and a CLI check
script (unchanged).

**Performance Goals**: Feature 001's budget holds (under 400 KB, usable within 2 s on "Fast 3G",
click-to-frame under 100 ms). `charts.json` estimated 56 KB raw, about 8 KB gzipped; drawing
one chart (≤ 40 elements, ≤ 50 arrows) is well under 100 ms.

**Constraints**: Labels quoted as printed in the chart; differences introduced by the site
listed on the chart (FR-014); WCAG 2.1 AA (ratios in research R5); labels ≥ 12 px rendered
(research R4); keyboard and phone width.

**Scale/Scope**: 14 charts, about 250 elements and 300 arrows in total; one new view (wide
chart), one new section in the process view, one new list in the record view.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Check | Result |
|---|---|---|
| I. Practicality | Static files, no build step. Each chart is one click from the map (station → process view) and linkable (`#chart/PM`). Keyboard, screen reader (text version) and phone width covered by FR-010, FR-011. | Pass |
| II. Consistency with the Standard | Every label quoted as printed in the chart, with FitSM-2 section and page; nothing added or omitted (FR-002, SC-001); where chart and text differ, both stay as printed (Edge Cases); record links and any site-made difference are labelled "Not part of FitSM" (FR-007, FR-014). | Pass |
| III. Sufficiency | No dependency; poppler is a reading aid outside the project, like the PDFs. The charts serve understanding of how each process runs. | Pass |
| IV. Extendibility | Charts live in `content/<edition>/charts.json`; code only draws them. Elements reference activities and records by their stable ids. | Pass |
| V. Openness and Attribution | Charts are FitSM-2 content under CC BY 4.0, credited with source on each chart. The PDF and its renders are not committed. | Pass |
| VI. Continual Improvement | New content kind with new checks (rule 17) and fixtures; CHANGELOG entry naming FitSM-2 v3.0.2. | Pass |

**Post-design re-check (after Phase 1)**: Pass. The only site-made visual change with a content
consequence (white lines over group fill, research R5) is styling, recorded in research and not
a difference of elements or arrows; rerouted arrows, if any, must be listed per chart (FR-014,
`notes` in the data model).

## Project Structure

### Documentation (this feature)

```text
specs/003-process-charts/
├── plan.md              # This file
├── research.md          # Phase 0: where the charts are, anatomy, coordinates, style, routes
├── data-model.md        # Phase 1: Chart, Element, Arrow; derived indexes
├── quickstart.md        # Phase 1: validation scenarios
├── contracts/
│   ├── content-files.md # charts.json and the transcription workflow
│   ├── url-hash.md      # #chart/<code>
│   └── check-cli.md     # Rule 17 and its messages
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/speckit-tasks; not created here)
```

### Source Code (repository root)

```text
index.html               # unchanged structure; chart mode is a class on <main>
styles.css               # + chart colours (research R5), compact/wide layout, chart mode
src/
├── chart.js             # NEW. Pure: chart → SVG elements (via a small element factory
│                        #   passed in, so tests run without a DOM), scale and min width,
│                        #   line colour by background, text-version outline
├── content.js           # + load charts.json; chart per process; record.charts index
├── router.js            # + "#chart/<code>" (prefixed kind, code or alias)
├── app.js               # + route kind "chart": chart mode on <main>, title, back target
└── panel.js             # + process view "Process chart" section; wide chart view;
                         #   record view "In process charts"
content/fitsm-3.0/
└── charts.json          # NEW. 14 charts transcribed from FitSM-2 v3.0.2
scripts/
└── check.js             # + "charts" in FILES; rule 17 (contracts/check-cli.md)
tests/
├── chart.test.js        # NEW
├── content.test.js, router.test.js, check.test.js   # + cases
└── fixtures/            # + charts.json in every edition; broken/<case>/ per rule 17 row
README.md, CHANGELOG.md  # explore table row, "Adding or correcting a chart", changelog
```

**Structure Decision**: Same static site. The chart renderer is its own module, like `map.js`,
because it is the second hand-drawn SVG; unlike `map.js` its geometry and text-version logic
are pure and unit-tested.

## Complexity Tracking

No constitution violations to justify.
