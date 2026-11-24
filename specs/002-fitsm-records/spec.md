# Feature Specification: Records Aligned with FitSM

**Feature Branch**: `002-fitsm-records`

**Created**: 2026-11-20

**Status**: Implemented (2026-11-21); pull request pending

**Input**: User description: "Align the databases and records shown on the FitSM process map with FitSM's own definitions, and add an overview of all records across processes. Today content/fitsm-3.0/records.json has only 9 entries, and three of them are generic (Record, Report, Request for change). For example, Problem Management (PM) shows only those generic items and never says what a Problem or a Known error is. (1) Records aligned with FitSM-0: every information object FitSM-0 defines that a process creates, maintains or uses gets its own record entry, with its FitSM-0 definition quoted unchanged and its section and page. Information stores that FitSM-2 names but FitSM-0 does not define, such as the known error database (KEDB), are included only with their FitSM-2 source and labelled as such. Each record lists the processes that create or maintain it and the processes that use it, derived from the FitSM-2 activities and inputs/outputs and labelled 'Not part of FitSM' where it is an interpretation. The process view lists its records grouped as 'creates or maintains' and 'uses'. (2) Records overview: a new view, opened from the page header like General requirements, that shows all records of all processes at once, preferably as a matrix (processes × records, each cell marked creates/maintains or uses, readable without colour). Each record and process in the overview is clickable and opens its existing view, and the view has its own link. Out of scope: flowcharts of each process's activities (a later feature)."

## Clarifications

### Session 2026-11-20

- Q: FitSM-0 defines "Problem" as the cause of incidents, not as the record kept about it. What
  are entries called on the page? → A: After the FitSM-0 term (Problem, Known error, Incident),
  quoted unchanged; the process view's section is renamed "Information and records" so it does
  not claim that a problem is itself a record.
- Q: Which FitSM-2 text may a process–record relationship be based on? → A: Both the
  inputs/outputs tables and activity steps that name the object as something the process acts
  on; a step that only mentions the object in passing does not count.
- Q: Should an activity's view list the records that activity creates, maintains or uses? →
  A: Yes, in the same two groups and with the same "Not part of FitSM" label, built from the
  relationships whose basis is that activity.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Learn what a process records (Priority: P1)

A person learning FitSM opens Problem Management (PM) on the map. Under "Information and
records" they no longer see only the generic words "Record", "Report" and "Request for
change". They see the things PM actually works with: a **Problem** and a **Known error**,
each with FitSM-0's definition, and the known error database that FitSM-2 tells PM to set
up. The list is split into what PM creates or maintains and what it only uses, such as
incidents and the CMDB. Clicking any of them opens its definition, its source and
every process that creates, maintains or uses it.

**Why this priority**: This is the gap the feature exists to close. Without it, a learner
cannot find out from the map what a problem or a known error is, which is basic FitSM
vocabulary.

**Independent Test**: Open `#PM`, then each record listed there. Every record shows a
definition quoted from FitSM-0 (or, for a store FitSM-0 does not define, a FitSM-2 quote with
a visible label saying so), with document, section and page. Every process–record link
names the FitSM-2 activity or input/output it was derived from.

**Acceptance Scenarios**:

1. **Given** the map, **When** the visitor opens PM, **Then** the frame lists Problem and
   Known error under "Creates or maintains", each linking to its record view.
2. **Given** PM's frame, **When** the visitor opens Known error, **Then** the frame shows
   FitSM-0's definition unchanged with "FitSM-0", its section and its page, and lists PM
   under "Created or maintained by" and every other process that uses known errors under
   "Used by".
3. **Given** a record that FitSM-2 names but FitSM-0 does not define (such as the known error
   database), **When** it is shown, **Then** its text is quoted from FitSM-2 with that source,
   and a visible note says FitSM-0 gives no definition for it.
4. **Given** any process view, **When** it shows records, **Then** the "Creates or maintains"
   and "Uses" groups carry the label that the grouping is derived and not part of FitSM.
5. **Given** an activity whose steps are the basis of a relationship (such as PM's initial
   process setup), **When** the visitor opens it, **Then** its view lists those records in
   the same two groups, with the interpretation label.
6. **Given** a record listed for a process, **When** the visitor looks at the record view,
   **Then** each process entry names the FitSM-2 activity, input or output it comes from,
   and that item is a link where it has its own view (an activity).

---

### User Story 2 - See all records of all processes at once (Priority: P2)

A service owner preparing their organisation's FitSM implementation wants to know which
processes share which information, for example which processes need access to the CMDB or
to known errors. They click **Records** in the page header and see one table: the records
down the side, the 14 processes across the top, and in each cell whether that process
creates or maintains the record, uses it, or neither. Clicking a record name or a process
code opens that item's own view.

**Why this priority**: It turns 14 separate process views into one picture of FitSM's
information landscape, which is what tool selection and data ownership discussions need.
It builds on the record content of Story 1.

**Independent Test**: Open `#RECORDS` directly. The table shows every record and all 14
processes; each relationship from the record views appears as a marked cell, and no other
cell is marked. Each mark can be read without colour. Record names and process codes open
their views.

**Acceptance Scenarios**:

1. **Given** any page, **When** the visitor activates "Records" in the header, **Then** the
   frame shows the records overview and the address becomes `#RECORDS`.
2. **Given** the overview, **When** the visitor reads a cell, **Then** it shows a text symbol
   for "creates or maintains" or for "uses" (or is empty), explained by a legend, and a
   screen reader announces the record, the process and the relation.
3. **Given** the overview, **When** the visitor activates a record name or a process code,
   **Then** that record's or process's view opens, and its back control returns to the
   overview.
4. **Given** a phone-width screen, **When** the overview is shown, **Then** the record names
   stay visible while the process columns scroll sideways inside the table, and the page
   itself does not scroll sideways.
5. **Given** the overview, **When** it is shown, **Then** a label states that the
   relationships are derived from FitSM-2 and are not part of FitSM.

---

### User Story 3 - Maintain the records content (Priority: P3)

A maintainer adds a record FitSM-0 defines, or corrects which processes use it, by editing
the content files only. The automated checks tell them when a record has no definition or
source, or when a relationship names an unknown process or rests on FitSM-2 text that does
not exist.

**Why this priority**: The constitution requires new kinds of content to come with new checks
and content changes to need no code changes. It matters most when the next FitSM edition
arrives.

**Independent Test**: Break the content in each of the ways listed in FR-013 and run the
checks. Each run fails with a message naming the file, the record and the problem. Add a
record with one relationship by editing content only, and see it in the process view, the
record view and the overview.

**Acceptance Scenarios**:

1. **Given** a record without a definition source, **When** the checks run, **Then** they fail
   and name the record.
2. **Given** a relationship naming a process code that does not exist, an unknown relation
   kind, or a basis whose quoted words FitSM-2 does not contain, **When** the checks run,
   **Then** they fail and name the record and the relationship.
3. **Given** a new record with one relationship added to the content only, **When** the page
   loads, **Then** the record appears in the process view, in its own view and in the
   overview, with no change to page code.

---

### Edge Cases

- A process both creates and uses the same record: it is listed once, under "Creates or
  maintains", and the overview cell shows that mark only.
- A process has records only of one kind: the other group is omitted rather than shown empty,
  as in feature 001. A process with no records at all omits the section.
- FitSM-0 defines a term that FitSM-2 never has a process create, maintain or use (for example
  a general concept such as "customer"): it is not a record and is not shown.
- FitSM-0 and FitSM-2 name the same object differently, or give definitions that do not match:
  the record uses FitSM-0's name and definition and shows FitSM-2's wording beside it with a
  note, per the constitution's rule on disagreements. Neither is silently dropped.
- An address for a record that existed before this feature, such as `#record/report`, is
  opened from an old link: it opens the same record, now with its revised relationships.
- The overview is opened while the content failed to load: the same single error message as
  every other view is shown (feature 001, FR-034).
- A record is used by all 14 processes: its row is fully marked; the table stays readable
  because marks are short symbols.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The content MUST contain one record for each information object that FitSM-0
  defines and that FitSM-2 has at least one process create, maintain or use. An information
  object is something FitSM-2 says is registered, recorded, documented, stored, maintained or
  kept up to date (such as problems, known errors, incidents, service requests, changes,
  releases, configuration items and information security incidents), together with the
  records and stores already shown (service portfolio, service catalogue, SLA, OLA, UA, CMDB,
  report, request for change).
- **FR-002**: Each record's name and definition MUST be quoted unchanged from FitSM-0, with the
  document, section and page.
- **FR-003**: An information store or record that FitSM-2 names but FitSM-0 does not define
  (such as the known error database) MUST be included only with a quote from FitSM-2 and its
  source, and MUST carry a visible note that FitSM-0 gives no definition for it.
- **FR-004**: Each record MUST list its relationships to processes. A relationship names one
  process, one kind ("creates or maintains" or "uses") and the FitSM-2 item it is derived
  from (an activity step, a process input or output, or a flow in a key interfaces table)
  with its source. A process appears at most once
  per record; when FitSM-2 supports both kinds, "creates or maintains" is kept.
- **FR-004a**: A relationship MUST be based on a FitSM-2 process input or output, a flow in a
  FitSM-2 key interfaces table (as recorded in the interfaces content), or an activity step
  that names the object as something the process acts on. "Creates or maintains" comes from an
  output or an outgoing flow, or from a step that registers, records, documents, updates
  or maintains the object; "uses" comes from an input or an incoming flow, or from a step that consults, checks,
  analyses or uses it. A step that only mentions the object as context (for example "be
  aware of") is not a basis. A flow between two processes counts for both: for the sender
  when it produces the object, for the receiver as a use.
- **FR-005**: Every relationship MUST be shown as an interpretation, labelled "Not part of
  FitSM" with a short statement of how it was derived, because FitSM does not list records per
  process.
- **FR-006**: The process view MUST list the process's records under the heading "Information
  and records" (formerly "Databases and records"), in two groups, "Creates or maintains" and
  "Uses", each record linking to its view. An empty group is omitted.
- **FR-006a**: Each record MUST be named by its FitSM-0 term exactly as FitSM-0 prints it (for
  example "Problem", not "Problem record"); only a store FitSM-0 does not define (FR-003) is
  named as FitSM-2 names it.
- **FR-006b**: The activity view MUST list the records whose relationships are based on a
  step of that activity (FR-004a), in the same two groups as FR-006 and with the same
  interpretation label. An activity with no such relationships omits the list.
- **FR-007**: The record view MUST show the definition and its source, any FitSM-2 wording
  that differs (FR-003, Edge Cases), and the processes grouped as "Created or maintained by"
  and "Used by". Each process entry links to the process and names the FitSM-2 item it was
  derived from, linking to that item when it has a view.
- **FR-008**: The page header MUST offer a "Records" control, next to "General requirements",
  that opens the records overview. The overview MUST have its own address, `#RECORDS`, that
  opens it directly.
- **FR-009**: The overview MUST show every record against all 14 processes in one table. Each
  cell shows one of two short text marks or is empty, and a legend explains the marks. The
  relation MUST NOT be shown by colour alone.
- **FR-010**: In the overview, processes MUST be ordered as in FitSM (PR1 to PR14) and records
  grouped by the first process, in that order, that creates or maintains them, so related
  records sit together. Records with no creating process come last.
- **FR-011**: In the overview, every record name and process code MUST open that item's view.
  The cells themselves MUST NOT be separate stops in the keyboard order, so a keyboard user
  reaches every link in at most one tab stop per record and per process. Screen readers MUST
  be able to read each cell with its record and process headers.
- **FR-012**: At phone width the overview MUST keep the record names visible while the process
  columns scroll sideways within the table; the page as a whole MUST NOT scroll sideways.
- **FR-013**: The automated checks MUST fail, naming the file, the record and the problem,
  when: a record has no definition or no definition source; a FitSM-2-only record lacks the
  "no FitSM-0 definition" flag or a FitSM-2 source; a relationship names an unknown process or an
  unknown kind, or its basis does not resolve to a FitSM-2 activity step, input, output or
  interface flow that contains the quoted words; a process appears twice for one record; a
  record other than the general "Record" has no relationship; or two records share an
  identifier.
- **FR-014**: Adding, correcting or removing a record or a relationship MUST need changes to
  the content files only.
- **FR-015**: Every record address that existed before this feature MUST keep opening the same
  record; record identifiers MUST NOT be removed or renamed.
- **FR-016**: The generic FitSM-0 term "Record" MUST no longer be listed per process. Its
  definition MUST be shown at the top of the overview, as the explanation of what a record
  is.
- **FR-017**: The overview, the process view's record groups and the record view MUST meet the
  same keyboard, screen-reader, contrast and narrow-screen requirements as the rest of the
  page (feature 001, FR-007, FR-007b and FR-033).

### Key Entities

- **Record**: A FitSM information object or store. Has a stable identifier, a name, a
  definition (quoted from FitSM-0, or from FitSM-2 with a "no FitSM-0 definition" flag), the
  definition's source, optional differing FitSM-2 wording with its source, and one or more
  relationships.
- **Relationship**: Links one record to one process. Has a kind ("creates or maintains" or
  "uses"), the FitSM-2 item it is derived from (activity, output or input) and that item's
  source. Always an interpretation.
- **Records overview**: A view built from the records and their relationships. It stores no
  content of its own beyond the general "Record" definition it displays.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A visitor can go from the map to FitSM-0's definition of a problem and of a known
  error in two clicks (PM, then the record).
- **SC-002**: 100% of record definitions are quoted unchanged and carry document, section and
  page; a spot check of 10 records against the FitSM PDFs finds no reworded definition.
- **SC-003**: 100% of process–record relationships name the FitSM-2 item they come from, and
  every place they are shown carries the "Not part of FitSM" label.
- **SC-004**: Every one of the 14 processes either lists at least one record specific to it
  (not only "Report" or "Request for change") or the research notes (research.md, R1) record
  why FitSM-2 gives it none.
- **SC-005**: From the overview, a visitor can answer "which processes create or use the
  CMDB?" without leaving the view and without relying on colour.
- **SC-006**: All 9 record addresses that exist today still open a view; none shows the
  not-found view.
- **SC-007**: Each content fault listed in FR-013 makes the checks fail with a message that
  names the record; the current checks and tests still pass.
- **SC-008**: The page stays within feature 001's budget: usable within 2 seconds on a "Fast
  3G" throttle and under 400 KB in total.

## Assumptions

- The sources are the FitSM 3.0 documents already used by the site: FitSM-0 v3.0.1 and
  FitSM-2 v3.0.2. The full list of FitSM-0 terms that qualify under FR-001 is established
  during planning research by reading both documents; the names in this spec are candidates
  drawn from the request and from FitSM-2's activity text.
- "Report" and "Request for change" stay as records, since FitSM-0 defines them and processes
  produce them; their relationships are revised under the rules above.
- Records keep their current addresses (`#record/<id>`); "Record" keeps its own view too but is
  no longer listed per process and is explained at the top of the overview (FR-015, FR-016).
- The overview places records in rows and processes in columns, because 14 columns fit a
  laptop screen better than about 25.
- The map itself does not change.
- Flowcharts of each process's activities are out of scope and belong to a later feature.
