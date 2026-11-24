# Feature Specification: FitSM Process Charts

**Feature Branch**: `003-process-charts`

**Created**: 2026-11-24

**Status**: Closed (2026-11-24), merged in pull request #6; screen-reader pass deferred, see tasks.md "Closure"

**Input**: User description: "Show each FitSM process's own process chart on the FitSM Process Map, as an interactive flowchart in the process view. FitSM-2 v3.0.2 has a 'PROCESS CHART' in every process section (PR1–PR14). Each chart groups the process's ongoing activities as boxes, the steps inside them in order with arrows between them, and the information objects the steps read or produce, drawn as documents or databases with their states (e.g. 'Problem [new]', 'Problem [known error]', 'CMDB', 'Request for change' going 'to CHM'), with dashed arrows for information flow and solid arrows for sequence. The charts are vector drawings in the PDF, so they must be redrawn. (1) Each process view gets a 'Process chart' section that redraws FitSM-2's chart faithfully with its source; nothing is added; anything that differs from the PDF is labelled 'Not part of FitSM'. (2) The chart is clickable: activity groups open their activity view, information objects open their record view when they match a record from feature 002, flows to another process open that interface or process. (3) Keyboard, screen-reader (text alternative), WCAG 2.1 AA, not colour alone, phone width. (4) Chart content lives in the content store, one entry per process, with new checks. Constraints: quote FitSM unchanged, label interpretation, no new dependencies. Builds on feature 002. Out of scope: editing charts, BPMN export, charts for GR1–GR7."

## Clarifications

### Session 2026-11-24

- Q: Where is a process chart shown, given the frame is narrower than FitSM-2's charts? → A: In
  both places: a compact chart in the process view's frame, and an "Open chart" link to a wide
  view at `#chart/<code>` that shows the chart across the map's area at full size, with its
  text version beside it; Back or "Map" returns to the map.
- Q: How closely do the redrawn charts copy FitSM-2's look? → A: FitSM-2's look: the same shapes
  and colour roles (filled activity groups, lighter step boxes, document and database shapes,
  solid and dashed arrows), with colours adjusted only as far as WCAG 2.1 AA contrast needs.
- Q: Is a chart's text version shown in the process view's frame? → A: No, only in the wide view,
  beside the chart; the frame shows the compact chart and the "Open chart" link, whose name
  says the wide view includes the text version.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See how a process runs (Priority: P1)

A person learning FitSM opens Problem Management (PM). Below its objective and requirements
they find a "Process chart" section showing FitSM-2's own chart for PM: the three activity
groups "Identify problems", "Handle problems" and "Maintain the KEDB", the steps inside each
in order ("Perform incident pattern and trend analysis" → "Register problem"), and the
information the steps read and produce ("Trend information on incidents", "Problem [new]",
"Problem [known error]", "Problem [closed]", "CMDB", "Known error database (KEDB)",
"Request for change" going to CHM). Solid arrows show the order of steps, dashed arrows the
flow of information, as in FitSM-2. The chart names its source (FitSM-2, PR10, page).

**Why this priority**: The step lists the site shows today say what a process does, but not
in what order and with which information. FitSM-2 answers that in one picture per process;
without it a learner has to open the PDF.

**Independent Test**: Open each of the 14 processes and compare its chart with the chart in
the FitSM-2 PDF: every activity group, step, information object, state and arrow is there,
with the same wording and arrow style, and nothing else is.

**Acceptance Scenarios**:

1. **Given** the map, **When** the visitor opens PM, **Then** the process view has a "Process
   chart" section with FitSM-2's PM chart and the source "FitSM-2 v3.0.2 §PR10" with its page.
2. **Given** a chart, **When** the visitor compares it with FitSM-2, **Then** every box, label,
   state and arrow matches in wording, grouping and direction, and solid and dashed arrows
   differ by line pattern, not only by colour.
3. **Given** a chart, **When** it is shown, **Then** the arrangement follows FitSM-2's (groups
   in the same relative positions), so a learner can hold the PDF beside it.
4. **Given** PM's process view, **When** the visitor activates "Open chart", **Then** the address
   becomes `#chart/PM` and the chart is shown across the map's area at full size with its text
   version beside it; Back returns to PM's process view.

---

### User Story 2 - Move from the chart to the details (Priority: P2)

From PM's chart the learner clicks "Handle problems" and reads that activity's steps; clicks
"Problem [known error]" and reads FitSM-0's definition of a known error; clicks "to CHM" and
sees the PM–CHM interface. From the record view of Known error they see that it appears in
PM's chart, and in which states.

**Why this priority**: The chart becomes a way into the content the site already has, and
connects features 001 (activities, interfaces) and 002 (records).

**Independent Test**: In each chart, activate every activity group, every information object
that matches a record, and every flow to another process; each opens the expected view, and
the back control returns to the process.

**Acceptance Scenarios**:

1. **Given** a chart, **When** the visitor activates an activity group, **Then** that
   activity's view opens.
2. **Given** a chart, **When** the visitor activates an information object that matches a
   record (for example "Problem [known error]" → Known error), **Then** the record view opens.
3. **Given** a chart, **When** the visitor activates a flow marked to or from another process
   (for example "to CHM"), **Then** the interface between the two processes opens, or that
   process when they have no interface.
4. **Given** a record that appears in one or more charts, **When** its view opens, **Then** it
   lists those processes' charts and the states the record has in each.
5. **Given** an information object that matches no record (for example "Trend information on
   incidents"), **When** it is shown, **Then** it is drawn like the others but is not a link.

---

### User Story 3 - Read the chart without seeing it, or on a phone (Priority: P3)

A screen-reader user opening PM hears that a process chart follows and that its text version is
in the wide view; there they can read it as text: the activity groups in order, the steps in each, what each step reads and produces, and where
the arrows lead. A phone user sees the chart at a size where its labels can be read.

**Why this priority**: Required by the constitution and by feature 001's accessibility
requirements; the chart must not be the only way to get its content.

**Independent Test**: With VoiceOver or NVDA, read PM's chart through its text alternative
and reconstruct the groups, step order and information flows; at 375 px wide, read every
label without zooming the page.

**Acceptance Scenarios**:

1. **Given** a compact chart in a process view, **When** a screen reader reaches it, **Then** it
   announces the chart and the link to the wide view with its text version; **Given** the wide
   view, **Then** the text version beside the chart lists every group, its steps in order, every information
   object with its state, and every arrow as "from → to" with its kind (sequence or
   information flow).
2. **Given** a chart, **When** the visitor uses only the keyboard, **Then** every clickable
   element of the chart can be reached and activated, with a visible focus indicator.
3. **Given** a phone-width screen, **When** the chart is shown, **Then** its labels are at
   least 12 px high and the chart scrolls sideways inside its box; the page itself does not
   scroll sideways.

---

### User Story 4 - Maintain the charts (Priority: P4)

A maintainer corrects a chart, or adds the charts of a new FitSM edition, by editing content
only. The automated checks tell them when a chart refers to an unknown activity or record,
when an arrow points at a box that does not exist, or when a chart has no source.

**Why this priority**: Constitution IV and VI: content separate from code, and new kinds of
content come with new checks.

**Independent Test**: Break a chart in each way listed in FR-012 and run the checks; each run
fails naming the process and the problem. Change a label in the content only and see it on
the page.

**Acceptance Scenarios**:

1. **Given** a chart whose activity group names an activity that does not exist, **When** the
   checks run, **Then** they fail and name the process and the group.
2. **Given** an arrow whose end is not a box of the chart, **When** the checks run, **Then**
   they fail and name the arrow.
3. **Given** a corrected label in the content, **When** the page loads, **Then** the chart
   shows it with no change to page code.

---

### Edge Cases

- A chart's wording differs from the FitSM-2 text the site already shows (for example the
  chart's "Update or remove known error" and the activity step "Update or deactivate a known
  error record"): the chart shows its own wording, quoted as printed, and the activity view
  keeps its text. Neither is changed to match the other. Where the two differ in meaning (here
  "remove" against "deactivate"), the chart's "Not part of FitSM" note names both wordings so
  the learner sees the difference.
- A chart draws something the FitSM-2 text does not mention, or the text lists an activity
  the chart leaves out: the chart is still drawn as printed, and a "Not part of FitSM" note
  on the chart says what differs, per the constitution's rule on disagreements.
- An information object appears several times in one chart with different states (Problem
  [new], [known error], [closed]): each occurrence is drawn and links to the same record.
- An arrow leaves the chart towards another process with no interface between the two in the
  site's content: it links to that process.
- A process's chart includes initial setup activities as well as ongoing ones: they are drawn
  as printed; the chart is not limited to ongoing activities.
- The content for one process's chart is missing: that process view omits the section, and
  the checks report the missing chart (FR-012).
- Very small labels in the PDF (for example on PM's "Information on identified workarounds"):
  shown at the chart's normal label size; the redraw does not copy font sizes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Each of the 14 process views MUST have a "Process chart" section showing that
  process's chart from FitSM-2, scaled to the frame, placed after the process's activities,
  with an "Open chart" link to the wide view (FR-001a).
- **FR-001a**: Each chart MUST have a wide view at `#chart/<code>` (process code or alias, as for
  process addresses) that shows the chart across the map's area at full size with its text
  version beside it (below it on screens narrower than 900 px, the site's layout breakpoint).
  The wide view has a back control (to the process view when entered directly) and the
  header's "Map" link returns to the map. The compact and wide charts show the same content.
- **FR-002**: A chart MUST contain exactly the elements of FitSM-2's chart: activity groups;
  the steps inside them, with the small record icon where FitSM-2 draws one; decisions with
  their labelled branches (e.g. "Yes", "No"); end states (e.g. "Change rejected"); information
  objects with their shape (document, set of documents or database), fill (white or grey) and
  state; notes; ends going to or coming from another process (e.g. "to CHM"); and arrows of two
  kinds, sequence (solid) and information flow (dashed), each with its direction, one or two
  heads, and its label if any. Labels MUST be quoted as printed in the chart.
- **FR-003**: The chart's layout MUST keep FitSM-2's arrangement: the relative positions of
  groups, steps and objects and the routing side of each arrow, so the redraw can be compared
  with the PDF.
- **FR-004**: Each chart MUST show its source: FitSM-2 with its version, the process section
  (PR1–PR14) and the page.
- **FR-005**: The chart MUST use FitSM-2's visual language: filled activity groups, lighter
  step boxes inside them, document, document-set and database shapes for information objects,
  solid sequence arrows and dashed information-flow arrows. Colours follow FitSM-2's roles and
  are adjusted only as far as WCAG 2.1 AA contrast needs (4.5:1 for labels, 3:1 for lines and
  shapes). Arrow kinds MUST differ by line pattern and arrowhead, not by colour alone.
- **FR-006**: Activating an activity group MUST open that activity's view; activating a step
  MUST open the view of the activity it belongs to.
- **FR-007**: Activating an information object that matches a record (feature 002) MUST open
  that record's view. The match is part of the content and is shown as an interpretation in
  the text version ("Not part of FitSM": which record the chart's object is taken to be).
- **FR-008**: Activating an arrow end or label marked as going to or coming from another
  process MUST open the interface between the two processes, or that process when there is
  none.
- **FR-009**: The record view MUST list the process charts in which the record appears, with
  the states it is drawn in, each linking to that process view.
- **FR-010**: The wide view MUST show each chart's text version beside the chart (below it on
  screens narrower than 900 px), visible to everyone and read by screen readers, listing the groups in chart
  order, each group's steps in order, the information objects with their states, and each
  arrow as "from → to" with its kind and label. The process view's frame shows no text version;
  its compact chart MUST have an accessible name ("Process chart of <process>") and its link
  MUST be named so that it says the wide view includes the text version (for example "Open
  chart, with text version"). The drawing MUST NOT be the only place its content is available.
- **FR-011**: Every clickable element of the chart MUST be reachable and operable with the
  keyboard, with a visible focus indicator. At any width the chart's labels MUST render at least
  12 px high (the map's legibility floor, feature 001 FR-001); where the space is narrower the
  chart scrolls sideways inside its box, and the page MUST NOT scroll sideways.
- **FR-012**: The automated checks MUST fail, naming the process and the problem, when: a
  process has no chart; a chart has no source; an activity group or step names an activity
  that does not exist or belongs to another process; an information object links to a record
  that does not exist; an arrow's end is not an element of the chart; an arrow has an unknown
  kind; a link to another process names an unknown process; two elements share an
  identifier; or an element lies outside the chart's drawing area.
- **FR-013**: Adding or correcting a chart MUST need changes to the content files only.
- **FR-014**: Any difference between a chart and the PDF that the site introduces (for
  example a rerouted arrow to avoid overlap) MUST be listed in a "Not part of FitSM" note on
  that chart, and so MUST every difference in meaning between the chart's wording and
  FitSM-2's text for the same activity or step (Edge Cases).

### Key Entities

- **Process chart**: One per process. Has the process code, the FitSM-2 source, a drawing
  area, its elements and arrows, and optional notes on differences from the PDF.
- **Chart element**: An activity group (linked to an activity), a step (inside a group,
  linked to that activity), an information object (label as printed, shape, optional state,
  optional link to a record), or an external end (another process, e.g. "to CHM"). Has a
  position and size in the drawing area and a stable identifier.
- **Chart arrow**: Connects two elements; kind sequence or information flow; direction; optional
  label as printed; optional bends so it follows FitSM-2's routing.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 14 processes show their chart; a side-by-side comparison of each with the
  FitSM-2 PDF finds no missing, extra or reworded element or arrow (100% match).
- **SC-002**: A learner can go from the map to the chart of any process in one click, and from
  any activity group or matched information object to its details in one more.
- **SC-003**: 100% of information objects that name a FitSM record link to it, and 100% of
  arrows to other processes link to the interface or process.
- **SC-004**: Using only the text version, a reviewer can reconstruct each chart's groups,
  step order and information flows without the drawing.
- **SC-005**: At 375 px wide, every label of every chart renders at least 12 px high without
  zooming, and the page does not scroll sideways.
- **SC-006**: Each content fault listed in FR-012 makes the checks fail with a message naming
  the process; the existing checks and tests still pass.
- **SC-007**: The page stays within the existing budget: under 400 KB in total and usable within
  2 seconds on a "Fast 3G" throttle.

## Assumptions

- The source is FitSM-2 v3.0.2, the version the site already uses; its 14 process charts are
  on PDF pages 12, 15, 18, 20, 22, 24, 26, 28, 31, 33, 35, 37, 39 and 42 (printed pages
  10–40; research R1).
- Although the request calls the charts vector drawings, all 14 are embedded bitmaps
  (research R1), so all are transcribed by hand.
- Charts are transcribed by hand from the PDF into the content, then compared with the PDF; the
  PDF's chart image is not copied or converted.
- The chart uses the site's font; shapes, colour roles, arrow patterns and arrangement follow
  FitSM-2 (clarification 2). Contrast adjustments to colours and the font are styling, not a
  difference of content, and need no note under FR-014.
- Matching chart objects to feature 002's records is done in the content by the maintainer;
  objects such as "Trend information on incidents" stay unlinked.
- In the wide view the map is not shown; the chart takes its place until the visitor leaves
  the view (clarification 1).
- Out of scope: editing charts on the page, BPMN export, charts for the general requirements
  GR1–GR7, and changing the map.
