# Feature Specification: FitSM Process Map

**Feature Branch**: `001-fitsm-process-map`

**Created**: 2026-10-03

**Status**: Draft

**Input**: User description: "I want to build a website deployable in GitHub pages, that should contain the process map of the latest version of FitSM. As FitSM has a lot of process, inputs, outputs, interfaces, requirements and roles, I need the process map to dynamic and clickable. Let's try to use public transportation maps styles, like subway maps, only connecting processes (stations). When clicking on the processes, we display on the right, in a frame: databases, records, processes requirements, roles, activities. When clicking on roles you show tasks. When clicking on activities, you show procedures. When clicking on processes relationship, you details in that right frame inputs and outputs and intesrfaces. Keep it simple to update, when new fitsm versions are releases. Ensure references are kept to the original document. Respect license requirements. This project is opensource and must be distributed under the same license as FitSM. I have removed old files, so you must ignore previous commits and start from scratch."

## Clarifications

### Session 2026-10-03

- Q: When two connected processes sit on different lines, how should the connection between
  them be drawn? → A: Connections between processes on the same line take that line's colour;
  connections across lines are drawn once in a neutral "transfer" style.
- Q: Should the site also show FitSM-1's general requirements (GR1–GR7)? → A: Yes, as one
  separate item opened from the page (not a station), showing GR1–GR7 with their sources in the
  detail frame.
- Q: When a later FitSM edition is added, can visitors switch between editions on the page?
  → A: No. The site shows one edition at a time (the latest); older editions stay in version
  control only, and the content carries edition metadata so a switcher could be added later.
- Q: May the published site load anything from third-party servers at runtime? → A: No. The
  site is fully self-contained: everything it needs is served from its own origin.
- Q: Should the page offer a text search or filter to find items by name? → A: No. Navigation
  is by the map and the links in the frame; search is out of scope for this feature.

### Session 2026-10-03 (second pass, after the content/UX checklist)

- Q: Which parts of FitSM-2 count as defining an interface between two processes? → A: Either
  place: a connection exists when the pair appears in a key-interfaces table or in the
  inputs/outputs tables. When only flows exist, the frame says FitSM-2 lists inputs and
  outputs but gives no interface description.
- Q: How should inputs and outputs whose other end is not a FitSM process (customers, users,
  suppliers, top management) be shown? → A: In the process view, not on the map: the frame
  gets an "inputs from and outputs to outside the processes" list naming the other party, with
  sources. No connection is drawn.
- Q: Must every process belong to a line, and may a process belong to more than one? → A:
  Every process is on at least one line; more than one is allowed. A line colours its member
  stations and the connections between members; it is not drawn as a separate track where
  FitSM gives no interface. When two connected members share more than one line, the line
  listed first wins.
- Q: Which outputs of a process count as its derived "databases and records"? → A: Only
  outputs that match a term FitSM-0 defines. Other outputs stay in the inputs/outputs lists
  and are not records.
- Q: What should a screen-reader user hear for the map and the detail frame? → A: Full map
  access: every station and connection has a spoken name with process name, code and line (or
  "transfer"); the map has a short spoken description; a new selection is announced when the
  frame updates; the legend is readable text.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Explore a process from the map (Priority: P1)

A person learning FitSM opens the site and sees the 14 FitSM processes drawn as stations on a
map in the style of a public transport (subway) map, with connections between processes drawn
as lines. They click a process station. A detail frame on the right shows that process: its
objective, its FitSM-1 requirements, its roles, the databases and records it works with, and
its activities. Each item in the frame names the FitSM document and section it comes from.

**Why this priority**: This is the core of the product. Without the map and the process detail
frame, nothing else has a place to live. On its own it already teaches the structure of FitSM.

**Independent Test**: Open the site, click any of the 14 processes, and confirm the frame shows
the process's objective, requirements, roles, databases and records, and activities, each with a
source reference. Open the site with a process code in the address and confirm the same frame
opens directly.

**Acceptance Scenarios**:

1. **Given** the site is open, **When** the page has loaded, **Then** all 14 FitSM processes
   are shown as stations with their FitSM name and code, and no process is missing or added.
2. **Given** the map is shown, **When** the visitor clicks a process station, **Then** the right
   frame shows the process name, code, objective, requirements, roles, databases and records,
   and activities, and the clicked station is visibly highlighted on the map.
3. **Given** the right frame shows a process, **When** the visitor reads any requirement, role,
   database, record or activity, **Then** it carries a reference to the FitSM document, version
   and section it comes from.
4. **Given** a visitor has a link to the site that includes a process code (for example
   `#ISRM`), **When** they open it, **Then** the map loads with that process selected and its
   detail frame open.
5. **Given** a process is selected, **When** the visitor clicks another process, **Then** the
   frame replaces its content with the new process and the highlight moves on the map.
6. **Given** the site is open, **When** the visitor opens the general requirements entry
   (outside the map), **Then** the frame shows GR1–GR7 with their identifiers, text and
   sources, and no station on the map is highlighted.

---

### User Story 2 - Explore an interface between two processes (Priority: P2)

A visitor wants to know how two processes work together. They click the line segment that
connects two stations. The right frame shows the relationship: the inputs and outputs that flow
between the two processes, and the interface description(s) FitSM gives for that pair, each
with a source reference.

**Why this priority**: Interfaces are what the subway metaphor exists to show. This story turns
the lines from decoration into content, and is the second thing a learner asks for.

**Independent Test**: Click any connection on the map and confirm the frame names both
processes, lists the inputs and outputs exchanged, shows FitSM's interface description(s), and
cites the source.

**Acceptance Scenarios**:

1. **Given** the map is shown, **When** the visitor clicks a connection between two processes,
   **Then** the frame shows both process names, the interface description(s), and the inputs
   and outputs exchanged, with their direction, and the connection is highlighted on the map.
2. **Given** FitSM describes a pair's interface differently in two places, **When** the visitor
   opens that connection, **Then** both descriptions are shown, each with its source, and a
   note says that they differ.
3. **Given** two processes exchange inputs and outputs in both directions, **When** the
   visitor opens the connection, **Then** each direction is shown separately and clearly.
4. **Given** a relationship is shown in the frame, **When** the visitor clicks either process
   name in the frame, **Then** that process's detail opens (User Story 1).

---

### User Story 3 - Drill into roles and activities (Priority: P3)

From a process's detail frame, a visitor clicks a role and sees the tasks FitSM assigns to that
role, split into tasks specific to the process and tasks common to every process role of that
kind. They click an activity and see its procedure as the ordered steps FitSM describes.

**Why this priority**: This is the deepest level of the standard and the one most useful to
someone implementing FitSM. It depends on User Story 1 for the entry point.

**Independent Test**: Open any process, click one of its roles and confirm the tasks list;
go back, click one of its activities and confirm the ordered procedure steps.

**Acceptance Scenarios**:

1. **Given** a process is shown in the frame, **When** the visitor clicks a role, **Then** the
   frame shows the role's name, how many people typically hold it, its process-specific tasks,
   and its generic tasks, each group labelled and each with a source reference.
2. **Given** a process is shown, **When** the visitor clicks an activity, **Then** the frame
   shows the activity's name and its procedure as ordered steps with a source reference.
3. **Given** a role or activity is shown, **When** the visitor uses the back control in the
   frame, **Then** the frame returns to the process it came from, and the map highlight is
   unchanged.
4. **Given** a role, database or record is used by several processes, **When** it is shown,
   **Then** the frame lists the processes that use it, and each listed process is clickable.

---

### User Story 4 - Update the content for a new FitSM edition (Priority: P4)

A maintainer learns that ITEMO has published a new FitSM edition. They update the site's
content without touching how the map is drawn or how the frame works. Every item they enter
carries its source reference, and automated checks tell them if anything is inconsistent
(a reference that does not resolve, a process with no requirements, a connection to an
unknown process). The site shows which FitSM edition it reflects.

**Why this priority**: The user asked that the site stay simple to update. Without this, the
map goes stale and loses its value. It is lower priority only because it does not block a
first release.

**Independent Test**: Change one requirement's text and source in the content, run the checks,
and confirm the change appears on the page with no other edits. Introduce a reference to a
non-existent process and confirm the checks fail with a clear message.

**Acceptance Scenarios**:

1. **Given** the content is stored separately from the map's presentation and behaviour,
   **When** a maintainer corrects or adds content, **Then** the change appears on the site with
   no change to presentation or behaviour.
2. **Given** the content has an item that refers to a process, role, activity or database that
   does not exist, **When** the checks run, **Then** they fail and name the offending item.
3. **Given** the site is open, **When** the visitor looks for the edition, **Then** the page
   states which FitSM documents and versions the content comes from, and links to the official
   FitSM download page.
4. **Given** the maintainer adds a process-to-process connection, **When** they do not provide
   a position or route for it on the map, **Then** the checks tell them what is missing.

---

### User Story 5 - See attribution and reuse the work (Priority: P5)

A visitor or another project wants to know where the content comes from and whether they may
reuse the site. The page credits ITEMO e.V. as the author of FitSM, states the licence, and
links to the official FitSM site. The repository states that the whole project is distributed
under the same licence as FitSM, and every file carries its licence information.

**Why this priority**: Attribution is a condition of the FitSM licence, so the site may not be
published without it. It is small, independent work, and so it is listed last.

**Independent Test**: Open the site and find the ITEMO credit, the licence name and the link
to fitsm.eu. Open the repository and find the licence file and per-file licence information.

**Acceptance Scenarios**:

1. **Given** the site is open, **When** the visitor looks at the page, **Then** it credits
   ITEMO e.V. for FitSM, names the licence (CC BY 4.0), and links to fitsm.eu.
2. **Given** the repository is open, **When** someone looks for the licence, **Then** a licence
   file for CC BY 4.0 is present at the top level and the README states that the project is
   distributed under that licence.
3. **Given** any file in the repository, **When** it is opened, **Then** it carries copyright
   and licence information, and the repository's licence check passes.
4. **Given** the page shows text that is an interpretation rather than a quotation of FitSM
   (such as derived databases, a reconciliation of differing tables, or a colour grouping),
   **When** the visitor reads it, **Then** it is visibly labelled as interpretation.

---

### Edge Cases

- A process has interfaces with many other processes. The map must still be readable, which
  means: no station label overlaps another label or a stroke; no segment passes through a
  station it does not end at; parallel segments between the same two stations do not overlap.
  Routes may bend, and a station shared by several lines is drawn as an interchange.
- Two processes have interfaces in both directions. The connection is one clickable element,
  and the frame separates the two directions.
- Two connected processes are on different lines. The connection is drawn once, in the neutral
  transfer style, and the frame still shows it as a normal interface.
- A pair of processes appears only in inputs/outputs tables, with no key-interface description.
  The connection is drawn, and the frame shows the flows with the fixed "no interface
  description" sentence (FR-010).
- An input or output names a party that is not a process (for example "customers"). It is
  shown in the process view's external list (FR-009); nothing is drawn on the map and the
  party is not clickable.
- FitSM-2 lists the same interface with different wording in its two tables. Both are shown
  with a note (User Story 2, scenario 2).
- FitSM does not list databases per process. Databases shown for a process are derived from its
  outputs and are labelled as derived, naming the FitSM-0 definition each one comes from.
- The address contains a code that is not a process (for example `#XYZ`). The map opens with
  nothing selected and the frame shows a short "not found" message with the list of valid codes.
- The screen is narrower than 900 px (phone). The frame moves below the map rather than
  disappearing, and the map's container scrolls horizontally; the page does not pan or zoom
  the map itself.
- A visitor uses only the keyboard. Every station, connection, role, activity, database and
  record can be reached and opened with the keyboard, and the current focus is visible.
- A visitor uses a screen reader. Moving through the map reads each station and connection by
  name (FR-007b); opening one announces the frame's new heading; nothing in the map is reached
  only by sight.
- Colour is the only difference between two lines. Lines must also be told apart by name or
  label, so the map works for colour-blind visitors and in print.
- The content is updated to an edition that renames or merges a process. The old code keeps
  resolving (to the new process or to an explanation), so shared links do not break.
- The content is updated to an edition that removes a process. Its old code resolves to a
  short note "This process is not part of FitSM <edition>" with a link back to the map, so
  shared links still land somewhere meaningful.
- A role is process-specific (not an owner, manager, case owner or staff role). The frame shows
  only its own tasks; there is no "common to every …" group for it.
- FitSM-3 lists no process-specific tasks for a role (typical for process owners). The frame
  shows the fixed sentence "FitSM-3 lists no process-specific tasks for this role." in place of
  the list.
- FitSM-3 gives no count for a role, or FitSM-2 gives a paragraph rather than numbered steps
  for an activity. The count line is omitted; the paragraph is shown as a single step.
- A process has no derived records, or an interface has flows in one direction only. The empty
  section (records) or the empty direction is omitted rather than shown as "none".
- Information is shown on hover (tooltip). Nothing may be available only on hover; everything
  a tooltip would say is also in the frame, so touch and keyboard visitors see it too.

## Requirements *(mandatory)*

### Functional Requirements

**Map**

- **FR-001**: The site MUST show all 14 FitSM processes as stations on a single map in the style
  of a public transport map, each labelled with its FitSM code and name. In this style: every
  segment is horizontal, vertical or at 45°; every station uses the same glyph; connections
  have no arrowheads; the map scales to the width of its container; and station labels are
  never shortened or hidden at any size.
- **FR-002**: The map MUST draw one connection between two processes when FitSM-2 names the
  pair in either place it documents process relationships: a process's key-interfaces table,
  or a process's inputs/outputs tables (an output going to the other process, or an input
  coming from it). The map MUST NOT draw a connection for a pair that appears in neither.
- **FR-003**: Connections MUST be drawn as named, coloured lines in the subway style. Each
  line is a group of related processes (for example "Service quality", "Operations",
  "Control"), with a name and a colour. A connection between two processes on the same line
  is drawn once in that line's colour. A connection between processes on different lines is
  drawn once in a neutral "transfer" style: a grey, dashed stroke, so that it differs from
  every line in shape as well as colour. No interface is drawn twice. Every process MUST belong to at least one line and
  MAY belong to several. When two connected processes share more than one line, the line
  listed first in the content wins. A line is never drawn as a separate track between members
  that FitSM does not connect (FR-002). The grouping is not part of FitSM: it MUST be labelled
  on the page as a study aid (FR-019), and a maintainer MUST be able to change which processes
  belong to which line without touching behaviour.
- **FR-004**: A station reached by more than one line MUST be drawn as an interchange: a white
  disc with one coloured ring per line it belongs to, so that the reader sees it belongs to
  several lines.
- **FR-005**: Stations and connections MUST be clickable. The selected station or connection
  MUST be highlighted by a thicker stroke (not only a colour change) and marked as current for
  assistive technology. While a role or activity is shown, its owning process's station stays
  highlighted; while a record, the general requirements, the not-found view or nothing is
  shown, no station is highlighted.
- **FR-006**: Lines MUST be distinguishable without relying on colour alone. Two means are
  required: each line's name is printed on the map next to its first station, and a legend
  lists every line with its name, a colour sample and the label "study aid". The name is the
  required means of telling lines apart; the colours themselves need not be distinguishable to
  colour-blind visitors.
- **FR-007**: The map MUST be usable with a keyboard: every station and connection can be
  focused and activated. Tab order is header, map connections, map stations, legend, frame.
  The focus indicator is an outline at least 3 px wide with contrast of at least 3:1 against
  its surroundings.
- **FR-007b**: The map MUST be usable with a screen reader: every station has a spoken name
  made of the process name, its code and its line name(s); every connection has a spoken name
  naming both processes and its line or "transfer between lines"; the map itself has a short
  spoken description stating what it shows and how many processes it holds; when the frame
  changes, the new item's name is announced; and the legend is ordinary readable text.
- **FR-007a**: The page MUST offer one entry point in the page header, labelled "General
  requirements", that opens the FitSM-1 general requirements (GR1–GR7) in the detail frame,
  each requirement with its identifier, text and source. It MUST be openable by the direct
  link `#GR` (FR-022) and MUST NOT be drawn as a station or connected to any line.

**Detail frame**

- **FR-008**: A detail frame MUST be shown beside the map, to its right, when the viewport is
  900 px wide or more, and below the map when it is narrower. Beside the map, the frame scrolls
  independently of the map so that long content (for example fifteen requirements and eight
  roles) never pushes the map off screen; below the map, the page scrolls.
- **FR-009**: When a process is selected, the frame MUST show, in this order: its code and name,
  objective, FitSM-1 requirements, roles, databases and records, activities (grouped as
  FitSM-2 groups them: initial process setup, then ongoing process execution), process
  inputs and process outputs as FitSM-2 lists them, interfaces, and external inputs/outputs.
  The order is binding. A section with nothing to show (for example
  no derived records or no external flows) is omitted; objective, requirements, roles and
  activities always exist (FR-027). When FitSM-2 lists inputs or
  outputs for the process whose other end is not a FitSM process (for example customers,
  users, suppliers, top management), the frame MUST also show them in a list headed "Inputs
  from and outputs to outside the processes", naming the other party and the direction, each
  with its source. No station or connection is drawn for these parties.
- **FR-010**: When a connection is selected, the frame MUST show both process names, the
  interface description(s) FitSM gives, and the inputs and outputs exchanged with their
  direction. When FitSM-2 gives no interface description for the pair (the connection exists
  only because of inputs/outputs), the frame MUST say so in a fixed sentence ("FitSM-2 lists
  these inputs and outputs but gives no interface description") in place of the description.
  Each direction is shown as its own group; a direction with no flows is omitted.
- **FR-011**: When a role is selected, the frame MUST show its name, the typical number of
  people holding it (omitted when FitSM-3 gives none), its process-specific tasks under the
  heading "Tasks specific to <process code>" and its generic tasks under "Tasks common to
  every <role kind>". When FitSM-3 lists no process-specific tasks, the first group shows the
  fixed sentence "FitSM-3 lists no process-specific tasks for this role." A process-specific
  role (one that is not an owner, manager, case owner or staff role) has no generic group.
- **FR-012**: When an activity is selected, the frame MUST show its procedure as ordered steps.
  When FitSM-2 gives a paragraph rather than steps, the paragraph is shown as a single step.
- **FR-013**: When a database or record is selected, the frame MUST show its description, its
  source, and the processes that use it.
- **FR-014**: Every item in the frame that names another item (a process, role, activity,
  database or record) MUST be clickable and open that item.
- **FR-015**: The frame MUST offer a back control on every view except the intro. It returns
  to the previously shown item in this visit; when there is none (the visitor arrived by direct
  link), it goes to the item's parent: a role or activity goes to its process, an interface or
  record to the map with nothing selected. The browser's own back button also works, because
  every selection is an address change (FR-023).
- **FR-016**: The frame MUST be reachable within two clicks from the map for every item of
  content (process, requirement, general requirement, role, task, activity, procedure,
  database, record, interface). Counting starts with nothing selected; opening the general
  requirements entry counts as one click; the back control does not count.

**Content and references**

- **FR-017**: Every item of FitSM content MUST carry a reference to the FitSM document, version
  and section (or requirement identifier) it comes from, and the frame MUST show it. Every
  identifier shown on the page (PR9.1, GR1.1, process codes) is FitSM's own; the site invents
  no identifiers of its own for display.
- **FR-018**: Quoted FitSM text MUST be reproduced without rewording. The quoted fields are: a
  process's objective, requirement text, task text, activity name, procedure steps, record
  definition, interface description and flow item. The only permitted changes are splitting
  FitSM's lists into separate entries and removing line breaks inside a sentence; spelling,
  punctuation, abbreviations and FitSM's internal cross-references ("see clause 6.2") stay as
  printed and are not turned into links.
- **FR-019**: Content that is interpretation rather than quotation (derived databases, reconciled
  descriptions, study-aid groupings, maintainer notes) MUST be labelled wherever it is shown
  with the same device: a box titled "Not part of FitSM" containing the explanation. The page's
  term for FitSM-0 records and information stores is "Databases and records".
- **FR-020**: When FitSM describes the same interface in two places with wording that is not
  identical, the frame MUST show both descriptions with their sources and the note "FitSM
  describes this interface in more than one place."
- **FR-021**: The content MUST reflect the latest published FitSM edition, which means the
  document versions offered on fitsm.eu/downloads on the date recorded in the changelog for
  the content update (currently FitSM 3.0: FitSM-0, FitSM-1, FitSM-2 and FitSM-3). The page
  MUST state the documents and versions it reflects with a link to the official download page.

**Linking**

- **FR-022**: Each process MUST be openable directly by a link that contains its FitSM code
  (`#ISRM`); the general requirements by `#GR`; an interface by both codes in alphabetical
  order (`#ISRM-PM`). Lower-case codes are accepted, and a former code of a renamed process
  resolves to the current one.
- **FR-023**: Selecting an item MUST update the address so that the current view can be copied
  and shared. A non-canonical address (`#PM-ISRM`, `#isrm`, a former code) is replaced by the
  canonical one without adding a browser-history entry. The browser tab title follows the
  selection ("<item name> – FitSM Process Map").
- **FR-024**: A link with a code that does not match any item MUST open the map with nothing
  selected and a short message listing the valid process codes.

**Maintainability**

- **FR-025**: All FitSM content MUST be kept in one place, separate from the map's presentation
  and behaviour, so that a content change needs no change to presentation or behaviour.
- **FR-026**: Each process, role, activity, database, record and interface MUST have a stable
  identifier based on FitSM's own codes or names: a process uses its FitSM code; a role is the
  process code plus the role name as a slug; an activity is the process code plus its order
  in FitSM-2; a record is its FitSM-0 term as a slug; an interface is the two process codes in
  alphabetical order. Two maintainers following these rules form the same identifier.
- **FR-027**: Automated checks MUST verify that every reference between items resolves, that
  every process has at least an objective, requirements, roles and activities, that every
  connection joins two known processes and has a drawable route, that every process belongs
  to at least one line, and that every item has a source reference. All of these are errors
  and fail the checks with a message that names the offending item. One finding is a warning
  that does not fail the checks: a line whose member processes are not all connected to each
  other through that line's own connections.
- **FR-028**: The site MUST show exactly one FitSM edition at a time, the latest. Updating to
  a later edition MUST be a change to the content store only; the previous edition is kept in
  version control, not on the page. The content MUST carry edition metadata (document names
  and versions) so that an edition switcher or a further FitSM part could be added later
  without rewriting the existing content.

**Publishing and licensing**

- **FR-029**: The site MUST be publishable on GitHub Pages as static files, with no server-side
  component, account, or build step needed to view it.
- **FR-029a**: The published site MUST be fully self-contained: every resource it needs (fonts,
  styles, scripts, images, content) is served from the site's own origin, and the page makes no
  request to any third-party server at runtime. Any bundled resource that is not the project's
  own work (such as a font) MUST be listed in the README with its licence.
- **FR-030**: The whole project (content, presentation, behaviour, documentation) MUST be
  distributed under the same licence as FitSM (Creative Commons Attribution 4.0 International,
  CC BY 4.0).
- **FR-031**: The page MUST carry the attribution CC BY 4.0 requires, in the footer: the author
  (ITEMO e.V.), the title (FitSM) linked to fitsm.eu, the licence name (CC BY 4.0) linked to
  its text, and the sentence "This site reproduces FitSM text unchanged and labels its own
  additions." as the indication of changes. The content store MUST carry the same credit.
- **FR-032**: Every file in the repository MUST carry copyright and licence information, and
  the repository MUST pass an automated licence-information check.
- **FR-033**: The site MUST work on a phone-width screen and MUST meet WCAG 2.1 AA: contrast of
  at least 4.5:1 for all text including map labels, and at least 3:1 for line strokes, station
  glyphs and the focus indicator; every station and connection has a hit target of at least
  24 × 24 CSS px; at 400 % browser zoom the frame reflows without horizontal page scrolling
  (the map container alone may scroll); and no information is available only on hover.

**States**

- **FR-034**: If any content file fails to load or parse, the frame MUST show one error message
  naming the file and the map MUST NOT be drawn. While content is loading, nothing is drawn
  and the frame is empty; there is no spinner.
- **FR-035**: When nothing is selected (the address has no item), the frame MUST show an intro
  view: what the map shows, how to use it (click a station or a connection; use the keyboard),
  and the edition line. No station is highlighted.

### Key Entities

- **FitSM edition**: The set of FitSM documents and versions the content reflects (for example
  FitSM-0 v3.0, FitSM-1 v3.0.1, FitSM-2 v3.0.2, FitSM-3 v3.0.1), with the official download
  link. Exactly one edition is held in the content and shown on the page.
- **Process**: One of the 14 FitSM processes. Has a code (for example ISRM), a name, an
  objective, and is linked to requirements, roles, activities, databases and records, and
  interfaces. Has a position on the map.
- **Requirement**: A FitSM-1 requirement with its identifier, text and source. A process
  requirement (PR1.1 … PR14.x) belongs to one process; a general requirement (GR1.1 … GR7.x)
  belongs to the management system as a whole and to no process.
- **Role**: A FitSM-3 role for a process (process owner, process manager, case owner where
  defined, process staff, and any process-specific role). Has a name, a typical count, and
  tasks.
- **Task**: A unit of work assigned to a role, either specific to the process or generic to all
  roles of that kind. Has text and a source.
- **Activity**: A FitSM-2 activity of a process. Has a name, a source, and a procedure.
- **Procedure**: The ordered steps FitSM-2 gives for an activity.
- **Database / Record**: A FitSM-0 defined information store or record. Has a name, a
  definition quoted from FitSM-0, a source, and the list of processes that use it. A process
  uses a record when one of its FitSM-2 outputs matches the record's FitSM-0 term; each such
  use is flagged as derived and names the output and its source. Nothing that FitSM-0 does
  not define is a record.
- **Interface (connection)**: A relationship between two processes, established by FitSM-2
  naming the pair in a key-interfaces table or in inputs/outputs tables. Has zero or more
  interface descriptions, each with a source; zero or more inputs and outputs exchanged, each
  with a direction and source (at least one description or one flow must exist); and a route
  on the map. "Interface" is the FitSM relationship; "connection" is its drawing on the map;
  the two are one to one, and "relationship" is not used as a third term.
- **External flow**: An input or output of a process whose other end is not a FitSM process
  (a customer, user, supplier, top management or other party named by FitSM-2). Has the
  process, the direction, the party's name as FitSM-2 gives it, the item exchanged and a
  source. Shown in the process view only; never a station or a connection.
- **Line**: A named, coloured group of related processes. Every process is on at least one
  line; a process on several lines is an interchange. The line colours its member stations and
  the FitSM connections between members; it has no track of its own. Connections between
  lines are neutral. When members share more than one line, the line listed first applies.
  The grouping is a study aid, not part of FitSM, and is labelled as interpretation wherever
  it is shown.
- **Source reference**: The FitSM document, version and section (or identifier) an item comes
  from. Attached to every content item.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time visitor can find a named process on the map and read its objective
  within 30 seconds of the page loading.
- **SC-002**: Every one of the 14 processes, the general requirements, every interface between
  processes, and every role, activity, database and record is reachable within two clicks
  from the map (100% coverage, verified by walking the content).
- **SC-003**: 100% of content items shown on the page carry a visible FitSM source reference.
- **SC-004**: The page is usable within 2 seconds of opening on a "Fast 3G" network throttle,
  and the map responds to a click within 100 milliseconds.
- **SC-005**: A maintainer can apply a one-item content correction (text and source) and see it
  on the page in under 10 minutes, without changing anything other than the content store.
- **SC-006**: The automated checks detect 100% of deliberately introduced broken references
  (unknown process, missing source, missing route) and name the offending item.
- **SC-007** *(post-release measure, not part of this feature's acceptance)*: Nine out of ten
  people in a usability test with no prior knowledge of the site can open a process, a
  connection, a role and an activity without help. The test protocol is defined when the test
  is planned.
- **SC-008**: The site passes an automated accessibility contrast check with no AA failures,
  every interactive element is reachable by keyboard, and a screen reader reads a distinct
  name for 100% of stations and connections and announces every frame change.
- **SC-009**: The repository passes its licence-information check with zero findings, and the
  licence shown on the page matches the licence file in the repository.
- **SC-010**: A link to any process, opened in a fresh browser, shows that process selected on
  the map with its frame open, in 100% of cases.
- **SC-011**: Opening the published site and using every part of it produces zero requests to
  hosts other than the site's own, and the site works with the network disconnected after the
  first load.

## Assumptions

- The latest published FitSM edition is FitSM 3.0, and the content source is FitSM-0 (Overview
  and vocabulary), FitSM-1 (Requirements), FitSM-2 (Process activities and implementation)
  and FitSM-3 (Role model). The exact document versions named in this spec (3.0, 3.0.1,
  3.0.2) are to be confirmed from each PDF's front matter when the content is entered; the
  download page shows only "v3.0". FitSM-4 (templates), FitSM-5 (guides) and FitSM-6
  (maturity) are out of scope for this feature; the content model must leave room for them
  (FR-028).
- The FitSM documents are licensed CC BY 4.0. This is to be confirmed from the licence
  statement inside each PDF when the content is entered, and the page of that statement
  recorded, because the whole project's licence (FR-030) rests on it.
- "Distributed under the same license as FitSM" means CC BY 4.0 for every part of the project,
  including presentation and behaviour, not only the FitSM content. The project constitution
  currently says code is Apache-2.0; it needs an amendment to match, handled separately.
- The site is in English only. The content model keeps room for a translation later.
- There is no text search or filter in this feature. Every item is reachable from the map or
  from links in the frame (FR-016). Search can be added later if usability testing shows a
  need.
- Visitors are learners and implementers of FitSM, reading on a desktop browser most of the
  time, sometimes on a phone. No login, tracking or personalisation is needed.
- "Databases and records" for a process are derived from the process's outputs, because FitSM
  does not list them per process. The rule: an output counts as a record of the process only
  when its name matches a term FitSM-0 defines (for example "incident record", "configuration
  management database"); every other output stays in the inputs/outputs lists. The derivation
  is labelled on the page (FR-019) and names the FitSM-2 output it came from.
- "Right frame" means beside the map at 900 px viewport width or more; below that it moves
  under the map (FR-008).
- Earlier commits in the repository are not a source of requirements. This specification starts
  from the user's description alone.
- The map layout (station positions and routes) is hand-arranged, as real transport maps are,
  and stored with the content so that a maintainer can adjust it without touching behaviour.
- Dark mode, high-contrast mode and reduced-motion preferences are out of scope for this
  feature: the site has one light colour scheme and no animation, so there is nothing to
  reduce. They can be added later without changing content.
