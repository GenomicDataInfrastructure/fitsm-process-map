# Research: Records Aligned with FitSM

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Date**: 2026-11-20

Sources read for this research: FitSM-0 v3.0.1 (19 pages) and FitSM-2 v3.0.2, downloaded
from the URLs in `content/fitsm-3.0/edition.json` on 2026-11-20. The PDFs are not committed.

## R1. Which FitSM-0 terms are records (FR-001)

**Decision**: Apply FR-001 term by term to FitSM-0 §6.1–6.80. A term qualifies when a FitSM-2
process section (PR1–PR14) registers, records, documents, stores or maintains the object, or
lists it as a process input or output. The provisional list below is confirmed entry by entry
while the content is written (each entry needs at least one relationship, FR-013).

| FitSM-0 term (§) | Main maintaining process | FitSM-2 evidence (examples) |
|---|---|---|
| Service portfolio (6.69) | SPM | "Maintain the service portfolio"; output "Complete and up-to-date service portfolio" |
| Service catalogue (6.62) | SLM | "Maintain service catalogues"; used by CRM ("Current service catalogue") |
| Service level agreement (6.64) | SLM | SLA lifecycle activities; input to SRM, SACM, CAPM, ISM, CRM, ISRM |
| Operational level agreement (6.45) | SLM | OLA activities; used by SUPPM |
| Underpinning agreement (6.76) | SLM | UA activities; used by SUPPM |
| Report (6.56) | SRM | "List of all (agreed) reports"; reports produced by most processes |
| Information security control (6.31) | ISM | "Documented information security controls" |
| Information security event (6.32) | ISM | "Monitor, record and classify information security events" |
| Information security incident (6.33) | ISM | "Identify and handle information security incidents" |
| Policy (6.47) | ISM | information security policy documented and reviewed |
| Risk (6.58) | ISM, SACM | "Assess risks related to service availability and continuity"; ISM risk assessment |
| Incident (6.29) | ISRM | "Register incident or service request"; output "Incident records" |
| Major incident (6.40) | ISRM | major incidents handled "from recording to closure" |
| Service request (6.71) | ISRM | output "Service request records" |
| Problem (6.50) | PM | "Register a problem"; output KEDB "with information (records) on problems" |
| Known error (6.38) | PM | "Add a known error … to the KEDB"; used by ISRM |
| Workaround (6.80) | PM | "register problems, known errors and related workarounds" |
| Configuration item (6.15) | CONFM | "Record new CI in the CMDB (create a configuration record)" |
| Configuration management database (6.16) | CONFM | output CMDB; input to ISRM, PM, CHM, RDM |
| Request for change (6.57) | CHM | "Register a change based on a request for change"; raised by SPM, SACM, CAPM, ISM, CRM, ISRM, PM, CSI |
| Change (6.8) | CHM | output "Change records" |
| Emergency change (6.23) | CHM | emergency changes handled "from recording to closure" |
| Release (6.54) | RDM | "Information on deployed releases (release records)" to CHM |
| Release and deployment strategy (6.55) | RDM | to be confirmed in RDM's activity text |
| Service acceptance criteria (6.61) | RDM | "record the results of … evaluation of acceptance criteria" |
| Improvement (6.28) | CSI | "Identify and register an opportunity / suggestion for improvement" |
| Record (6.53) | — | general term, shown at the top of the overview (FR-016) |

Excluded after the scan: Underpinning contract (6.77, never named in FitSM-2); Service
management plan (6.67) and other SMS-level documents (named only in GR1–GR7, not in a process,
so no relationship is possible); Post implementation review (6.48) and Service review (6.72),
which FitSM-2 treats as activities, not stored objects, unless an activity step records them
(then the record is the result, e.g. CRM "Perform and record a service review"; revisit while
writing CRM); concept terms such as Customer, Supplier, Service, Capacity, Availability.

**Outcome (implementation, 2026-11-21)**: all 26 terms in the table qualified and were
written; every process has at least one record specific to it (SC-004), so no process needed
a "none" note. Borderline cases kept, each resting on one FitSM-2 step: Service acceptance
criteria (RDM setup step "evaluation of acceptance criteria", uses), Release and deployment
strategy and Emergency change (setup steps, maintains), Information security incident (ISM
"Identify and handle", maintains). Left out on the text: CHM as a user of the CMDB (no CHM text
names it), SPM as a maintainer of SLAs (an ISRM-SPM interface row that duplicates SLM's and
reads as a FitSM-2 copy slip), CHM as a user of plans for new or changed services (the flow is
about RFCs), CSI as a user of customer complaints records (named only as an example of
feedback).

**Rationale**: FR-001's rule decides each case from the text, so the list is reproducible by a
maintainer for the next edition.

**Alternatives considered**: All 80 FitSM-0 terms (rejected: most are concepts, not
information objects, and would have no relationship); only terms named in inputs/outputs
tables (rejected by clarification 2).

## R2. Stores FitSM-2 names that FitSM-0 does not define (FR-003)

**Decision**: Include a FitSM-2-only store when a PROCESS OUTPUTS list or a KEY INTERFACES
table names it as a database, plan, list or set of records and no FitSM-0 term covers it:

| FitSM-2 name | Process | Note |
|---|---|---|
| Known error database (KEDB) | PM | used by ISRM; holds problems, known errors, workarounds |
| Customer database | CRM | FitSM-0 defines "Customer", not the database |
| Customer complaints records | CRM | output "Customer complaints records" |
| Supplier database | SUPPM | FitSM-0 defines "Supplier", not the database |
| Service availability and continuity plans | SACM | output |
| Capacity plans | CAPM | output |
| List of all (agreed) reports | SRM | output "List of all (agreed) reports" |
| Plans for new or changed services | SPM | output; used by SUPPM and CHM |
| List of (pre-defined) standard changes | CHM | output "Up-to-date list of (pre-defined) standard changes …" |
| Inventory of information assets | ISM | output "Up-to-date inventory of information assets" (added during implementation) |

Each is named as FitSM-2 prints it (clarification 1), quoted from FitSM-2 with its source, and
flagged `fitsm0: false` (data model). Delivered: 10 FitSM-2-only stores, 36 records in all
plus the general "Record", with 84 relationships.

**Alternatives considered**: Only KEDB, as in the request's example (rejected: CRM and SUPPM
would then show their databases nowhere, which is the same gap the feature fixes for PM).

## R3. Page numbers

**Decision**: Keep feature 001's convention: `page` is the PDF page number, not the printed
page. FitSM-0's printed page + 4 (6.69 is printed page 14, PDF page 18); FitSM-2's printed
page + 2 (PR10 starts on printed page 30, PDF page 32).

**Rationale**: Every existing source uses it; mixing conventions would break SC-002 spot
checks.

## R4. How a relationship points at its FitSM-2 basis (FR-004, FR-004a)

**Decision**: A relationship's `basis` names the item it rests on and a short `match` string
that must occur verbatim in that item's text:

- an activity step: `{ "activity": "PM.A1", "match": "Register a problem" }`;
- a process input or output: `{ "output": "PM", "match": "Up-to-date KEDB" }`;
- an interface flow: `{ "flow": "ISRM-PM", "match": "Known error database" }`.

The source shown on the page is taken from the referenced item, so it is never retyped.

**Rationale**: The match string makes the JSON self-explanatory for maintainers and survives
reordering of steps; the check (FR-013) catches a match that no longer occurs, for example after
an edition update.

**Alternatives considered**: Step or list indexes (rejected: silent breakage when FitSM
reorders a list, unreadable in review); copying the quoted text into the relationship
(rejected: duplicates content already in `activities.json`, `processes.json` and
`interfaces.json`).

## R5. Existing record addresses (FR-015)

**Decision**: All nine existing record ids (`service-portfolio`, `service-catalogue`,
`service-level-agreement`, `operational-level-agreement`, `underpinning-agreement`,
`configuration-management-database`, `record`, `report`, `request-for-change`) are kept. No
record is removed or renamed, so no redirect mapping is needed. `record` keeps its view and
gains `general: true`, which keeps it off process and activity lists (FR-016).

**Consequence for the spec**: FR-015's redirect branch, FR-013's redirect check, the "Record
address redirect" entity and the matching edge case were narrowed to "every existing record
address keeps opening the same record" (spec updated with this plan).

## R6. Overview layout and accessibility (FR-009–FR-012, FR-017)

**Decision**: A real HTML `<table>` with `<caption>`, `<th scope="col">` per process code
(each a link, with the full process name as its accessible name) and `<th scope="row">` per
record (a link). Cells hold a text mark: "●" for creates or maintains and "○" for uses, each
wrapped in an element whose accessible text is "creates or maintains" / "uses", and a legend
under the caption. Empty cells are empty. The table sits in a container that scrolls
horizontally; the row-header column is `position: sticky` so record names stay visible
(FR-012). Cells are not focusable (FR-011).

**Rationale**: Table semantics give screen readers row and column headers for free; filled and
hollow circles differ by shape, not colour, and are in every system font.

**Alternatives considered**: SVG matrix (rejected: no table semantics, harder at phone width);
node-link diagram (rejected by the request: too dense); letters "M"/"U" (kept as fallback if
the symbols render poorly in a font; decided at implementation).

## R7. Overview address and header control (FR-008)

**Decision**: `#RECORDS`, parsed case-insensitively like `#GR`, as a new route kind
`records`. It cannot collide with a process code or alias, which are 2–6 letters
(`^[A-Z]{2,6}$`). The header gets a "Records" link next to "General requirements". The
overview's back target when entered directly is the intro (`#`), as for `#GR`.

## R8. Effect on fixtures and checks

**Decision**: `records.json` keeps being an array; `usedBy` is replaced by `relations`. All
fixture editions under `tests/fixtures/` get the new shape (mechanical rewrite), and new broken
fixtures cover each FR-013 rule. The check report gains a count of records and relationships.

## R9. Note for feature 003

FitSM-2 v3.0.2 has a "PROCESS CHART" in every process section (PR1–PR14), right after the
process outputs. Feature 003's flowcharts can follow those charts rather than infer a flow
from the step lists, which keeps them within Constitution II. The relationships in this
feature that are based on activity steps (R4) give 003 the records each step touches.
