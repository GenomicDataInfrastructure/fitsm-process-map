# Research: FitSM Process Charts

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Date**: 2026-11-24

Source: FitSM-2 v3.0.2, downloaded from the `url` in `content/fitsm-3.0/edition.json`
(not committed). Pages below are PDF pages (printed page + 2), the site's convention.

## R1. Where the charts are and what they are made of

| Process | PDF page | Printed page | Process | PDF page | Printed page |
|---|---|---|---|---|---|
| SPM | 12 | 10 | CRM | 26 | 24 |
| SLM | 15 | 13 | SUPPM | 28 | 26 |
| SRM | 18 | 16 | ISRM | 31 | 29 |
| SACM | 20 | 18 | PM | 33 | 31 |
| CAPM | 22 | 20 | CONFM | 35 | 33 |
| ISM | 24 | 22 | CHM | 37 | 35 |
| | | | RDM | 39 | 37 |
| | | | CSI | 42 | 40 |

Every process section has exactly one chart, between "Process outputs" and "Key
interfaces". Where the "Process chart" heading falls at the foot of a page (SRM, SACM, CAPM,
CRM, SUPPM, ISRM, CONFM, RDM, CSI), the chart itself is at the top of the next page; the page
above is the chart's own page. **All 14 charts are embedded bitmaps** (1073×743 to 2048×1557
pixels; corrected during implementation, after a first pass had looked at the heading pages),
and none of their labels is in the PDF's text layer.

**Decision**: Transcribe each chart by hand from a 200 dpi render of its page
(`pdftoppm -r 200`), cropped to the chart. Neither tool is part of the project: they are research aids, documented in the
maintainer workflow, like the PDFs themselves.

**Rationale**: The spec forbids copying the drawing as an image (FR-002, constitution II on
quoting text, plus readability and links). Automatic extraction cannot work on bitmaps, so a
hand transcription checked against the render is the only route.

**Alternatives considered**: Embedding the bitmaps or the PDF's vector paths (rejected:
no links, no text version, labels not selectable or translatable); OCR (rejected: a
dependency, and it would still need a full manual check).

## R2. Anatomy of a chart (from PM, SPM and CHM)

| Element | Drawn in FitSM-2 as | Example |
|---|---|---|
| Activity group | dark-blue filled box with a white title | "Handle problems" (= activity PM.A2) |
| Step | light-blue box inside a group | "Classify and prioritise" |
| Record mark on a step | small document icon in the step's corner | "Register problem", "Register change" |
| Decision | diamond inside or on the edge of a group, with labelled branches | "Approved?" → "Yes" / "No" |
| End state | white rounded box | "Change rejected", "Proposal refused" |
| Information object | document, stacked documents or database (cylinder); white or grey fill; optional state in brackets | "Problem [known error]", "CMDB", "Known error database (KEDB)" |
| Note | grey rectangle with text, linked by a dashed line | CHM "Assessment criteria based on - Benefits …" |
| External end | grey arrow leaving or entering the chart with a label | "to CHM", "to RDM", "from RDM" |
| Sequence | solid black arrow; also solid two-headed arrows between groups (SPM) | "Classify change" → "Assess change" |
| Information flow | dashed arrow, one- or two-headed | "Problem [new]" ⇢ "Classify and prioritise"; KEDB ⇠⇢ "Update or remove known error" |

Grey versus white fill of information objects is kept as printed; FitSM-2 does not explain it,
so the site does not either.

**Decision**: The content model has seven element kinds (group, step, decision, end, object,
note, external) and two arrow kinds (sequence, flow), each arrow with one or two heads and an
optional label (data-model.md).

## R3. Groups and activities

Group titles match activity names in `activities.json` (PM.A1–A3 "Identify problems", "Handle
problems", "Maintain the KEDB"; SPM.A1–A3; CHM.A1 "Manage change evaluation and approval").
Where the text adds words the chart leaves out (CHM.A2 "… (in connection with RDM where
applicable)"), the chart keeps its own label (spec Edge Cases).

**Decision**: A group names its activity by id; a step belongs to its group and so to that
activity. The check requires the activity to belong to the chart's process.

## R4. Coordinates and size

**Decision**: Positions and sizes are integers in PDF points relative to the chart's top-left
corner, measured on the render (200 dpi ÷ 72 × points). A chart is about 450–520 pt wide and
180–320 pt high. Labels are drawn at 7.5 chart units (group titles 8.5), close to FitSM-2's
about 7 pt; a line still wider than its box is squeezed to fit once the browser can measure it
(the site's font is wider than FitSM-2's narrow font). Changed from 9 units during
implementation, when the PM pilot showed 9-unit labels overflowing FitSM-2's boxes.

- **Compact chart** (process view): scaled to the frame's width, but never below the width at
  which labels render at 12 px (001's legibility floor, FR-011): `minWidth = width × 12 / 7.5` (PM: 712 px, so the
  compact chart scrolls inside a laptop-width frame and the wide view has room).
  Below that the chart scrolls sideways in its own box.
- **Wide view**: the same drawing at up to 2× scale across the map's area, text version beside
  it (below it under 900 px).

**Rationale**: Points keep the transcription comparable with the PDF; one size rule serves
both views.

## R5. Visual language and contrast (clarification 2)

**Decision**: FitSM-2's colour roles with AA-checked values, defined once in CSS:

| Role | FitSM-2 colour (approx.) | Site value | Check |
|---|---|---|---|
| Group fill / title text | #4f81bd / white | #2f5f98 / #ffffff | 6.5:1 |
| Step fill / text | #b9cde5 / black | #c6d7ec / #1d1d1f | 11.5:1; step box vs group fill 4.5:1 |
| Object white / grey fill | white / #d9d9d9 | #ffffff / #d9d9d9 with #1d1d1f text | 16.8:1 / 11.9:1 |
| Lines and arrowheads | black / grey | #1d1d1f on white (16.8:1); #ffffff over group fill (6.5:1); external arrows #6b6b6b (5.3:1) | ≥ 3:1 everywhere |

A dark line over the group fill would be only 2.6:1, so segments that cross a group are drawn
white (see the note below). Ratios computed with the WCAG 2.1 formula.

Dashed arrows use `4 3` dashes (closest to FitSM-2 at this label size); two-headed arrows have heads at both ends. Activity groups,
steps, linked objects and external ends are links with the site's focus ring.

**Note**: FitSM-2 draws arrows between steps in black over the group fill. The site draws
those segments white (black would fail 3:1 there) and every other line #1d1d1f; the renderer
picks the colour from whether the segment lies inside a group.
This is styling, not content (spec Assumptions).

## R6. Wide view address and layout (clarification 1)

**Decision**: `#chart/<code>` (code or alias, canonicalised like `#ISRM`), a new prefixed route
kind `chart`. The page enters a "chart mode": the map column is hidden and the frame takes the
full width, showing the chart and the text version side by side (stacked under 900 px). The
back control returns to the previous entry, or to the process view when entered directly. The
map station of the process stays selected (it reappears when leaving).

**Alternatives considered**: drawing the chart inside the map's SVG (rejected: mixes two
coordinate systems and breaks the map's own focus order); a modal dialog (rejected: no address,
harder for screen readers).

## R7. Text version (clarification 3)

**Decision**: Generated from the content, not written by hand:

1. One list item per group in reading order (top to bottom, then left to right), linking to the
   activity; under it the steps in sequence order (following sequence arrows from the step with
   no incoming sequence arrow), each with "reads" / "produces" lines from its flow arrows, and
   decisions with their branches.
2. Then "Information" (objects with state and record link), "Notes" and "Other processes"
   (external ends).
3. Then "All arrows" as "from → to (sequence | information flow[, label])", so nothing in the
   drawing is only in the drawing (SC-004).

The compact chart is a `<figure>` named "Process chart of <process>"; the drawing is not hidden
from assistive technology as a single image, so its links stay reachable by Tab, and the
"Open chart, with text version" link follows it.

## R8. Linking objects to records (FR-007, FR-009)

**Decision**: An object may carry `record: "<id>"`; its state is the bracketed part of its
label ("Problem [known error]" → "known error"). The record view gets "In process charts":
each process whose chart shows the record, with its states, linking to `#chart/<code>`.
Matches are interpretation and are listed as such in the text version.

Expected links from R2's sample: PM → problem, known-error, known-error-database,
configuration-management-database, request-for-change; CHM → request-for-change, change,
configuration-management-database; SPM → service-portfolio, plans-for-new-or-changed-services.

## R9. Content file and fixtures

**Decision**: A ninth content file per edition, `charts.json` (array, one chart per process).
`FILES` in `src/content.js` and `scripts/check.js` gains it; every fixture edition gets a
`charts.json` with one minimal chart per fixture process (generated once, then kept as files).
Estimated size: 14 charts × about 4 KB = 56 KB raw, about 8 KB gzipped; the page stays under
400 KB.

## R10. Additions found while transcribing (implementation, 2026-11-24)

- **Plain connectors**: FitSM-2 draws some dashed lines with no arrowhead (PM "Problem [known
  error]" – "Information on identified workarounds"; CRM and SUPPM databases to their groups;
  SLM, SRM). Arrows gained `heads: "none"`.
- **Curves**: some flows are drawn curved (PM "Register problem" → "Problem [new]"). Arrows gained
  `curve: true`; a curve keeps one colour, the tone under most of its points.
- **Orthogonal anchors**: an arrow leaves a box straight out when its target is level with the box
  (or straight above or below it), and a first or last bend lying on a box's edge becomes the
  arrow's end there, so arrows meet boxes off their centre line as in FitSM-2.
- **External arrows** point away from the chart for "to" and into it for "from" (RDM's "to CHM"
  points left).
- **Groups without steps** are common (SRM, SACM, CAPM, CRM, SUPPM, ISM "Perform access
  control"); their title is centred and no warning is given.
- **Delivered**: 14 charts, 213 elements, 195 arrows, 50 record links; `charts.json` 57 KB, 9 KB
  gzipped. Notes on differences in meaning: PM 1, SLM 2, SRM 1, ISM 2, RDM 1, CSI 1.
