# Quickstart: FitSM Process Charts

Validation scenarios for this feature. Run them on the served site after implementation and
tick each one. The scenarios of features [001](../001-fitsm-process-map/quickstart.md) and
[002](../002-fitsm-records/quickstart.md) still apply.

## Prerequisites

- Node.js 22 or later, Python 3, a current browser; VoiceOver (macOS) or NVDA (Windows) for C9.
- FitSM-2 v3.0.2 from the `url` in `content/fitsm-3.0/edition.json`, and poppler
  (`pdftoppm`) to render chart pages for comparison: `pdftoppm -f 33 -l 33 -r 200 -png
  FitSM-2.pdf pm`.

```bash
node scripts/check.js && node --test
```

```bash
python3 -m http.server 8765
```

Open http://localhost:8765.

## Scenarios

### Story 1: see how a process runs

- [X] C1 From the map, click the PM station once: the process view shows, after "Activities", a
  "Process chart" section with PM's chart and "FitSM-2 v3.0.2 §PR10 (p. 33)", and an "Open
  chart, with text version" link. (FR-001, FR-004, SC-002)
- [X] C2 For each of the 14 processes, compare the chart with the PDF render (pages in
  research.md R1): same groups, steps, decisions, end states, objects with shape, fill and
  state, notes, external ends, arrows with kind, heads, direction and labels; same arrangement.
  Nothing missing, extra or reworded. Record differences the site makes in the chart's notes.
  (FR-002, FR-003, FR-014, SC-001)
- [X] C3 Solid and dashed arrows are told apart in greyscale; run the browser's contrast audit
  on the chart: labels ≥ 4.5:1, lines and shapes ≥ 3:1. (FR-005)
- [X] C4 Activate "Open chart": the address is `#chart/PM`, the map is replaced by the chart at
  full size with the text version beside it; Back returns to `#PM`; "Map" in the header
  returns to the map. (FR-001a)

### Story 2: move from the chart to the details

- [X] C5 In PM's chart activate "Handle problems" → `#activity/PM.A2`; "Classify and
  prioritise" → `#activity/PM.A2`; "Problem [known error]" → `#record/known-error`; "to CHM"
  → `#CHM-PM`. Back returns to the chart each time. (FR-006–FR-008)
- [X] C6 "Trend information on incidents" is drawn but is not a link. (Story 2 scenario 5)
- [X] C7 Open `#record/problem`: "In process charts" lists PM "as new, closed", linking to
  `#chart/PM`; `#record/known-error` lists PM too ("Problem [known error]" is taken to be a known
  error, Story 2). (FR-009)

### Story 3: without seeing it, or on a phone

- [X] C8 Keyboard only: Tab reaches every group, step, linked object and external end of the
  compact and the wide chart, each with a visible focus ring, in reading order. (FR-011)
- [ ] C9 *(deferred at closure, 2026-11-24)* With a screen reader on `#PM`: the chart is announced as "Process chart of Problem
  Management" and the link as "Open chart, with text version"; on `#chart/PM` the text version
  lists groups, steps in order with what they read and produce, objects with states, and all
  arrows. From the text alone, redraw the chart's structure. (FR-010, SC-004)
- [X] C10 At 375 px wide: `#PM` and `#chart/PM` do not scroll sideways; the chart scrolls inside
  its box and its labels are at least 12 px; on `#chart/PM` the text version sits below the
  chart, as it does at any width under 900 px. (FR-011, SC-005)

### Story 4: maintenance

- [X] C11 `node --test` passes, including one failing fixture per rule-17 error in
  [contracts/check-cli.md](contracts/check-cli.md). (FR-012, SC-006)
- [X] C12 In a copy of the edition, change one chart label and one arrow kind in `charts.json`
  only, serve it: the chart shows both changes. (FR-013)

### Regression

- [X] C13 `#chart/pm` becomes `#chart/PM`; `#chart/XYZ` shows the not-found view.
- [X] C14 Total transfer under 400 KB; usable within 2 s on "Fast 3G"; opening a process with
  its chart stays under 100 ms. (SC-007)
