# Quickstart: Records Aligned with FitSM

Validation scenarios for this feature. Run them on the served site after implementation;
tick each one. Feature 001's scenarios ([001 quickstart](../001-fitsm-process-map/quickstart.md))
still apply.

## Prerequisites

- Node.js 22 or later; Python 3 (for the static server); a current browser; for R9, VoiceOver
  (macOS) or NVDA (Windows).
- The FitSM-0 v3.0.1 and FitSM-2 v3.0.2 PDFs, from the URLs in
  `content/fitsm-3.0/edition.json`, for the spot checks.

```bash
node scripts/check.js && node --test
```

```bash
python3 -m http.server 8765
```

Open http://localhost:8765.

## Scenarios

### Story 1: what a process records

- [X] R1 Open `#PM`. The section is titled "Information and records" and has "Creates or
  maintains" (at least Problem, Known error, Workaround, Known error database) and "Uses" (at
  least Incident and the CMDB), with the "Not part of FitSM" box. (FR-006, SC-001)
- [X] R2 Open Known error. The definition matches FitSM-0 §6.38 word for word, with "FitSM-0",
  the section and the page. PM is under "Created or maintained by", ISRM under "Used by", each
  naming the FitSM-2 activity or flow it rests on; an activity basis is a link. (FR-002, FR-007)
- [X] R3 Open the known error database. Its text is from FitSM-2 with a FitSM-2 source, and
  the note says FitSM-0 gives no definition for it. (FR-003)
- [X] R4 Open `#activity/PM.A3` ("Maintain the KEDB"). It lists Known error and the known
  error database under "Creates or maintains", with the interpretation box. (FR-006b)
- [X] R5 Open each of the 14 processes. Each lists at least one record other than Report and
  Request for change, or research.md R1 records why FitSM-2 gives it none. (SC-004)
- [X] R6 Spot check 10 records chosen at random against the PDFs: name and definition
  unchanged, section and PDF page correct. (SC-002)
- [X] R6a With the keyboard only, open `#PM`, Tab through "Information and records" to Known
  error, open it with Enter, and Tab to an activity basis link: every link has a visible
  focus ring. At 375 px wide, `#PM`, `#activity/PM.A3` and the Known error view do not scroll
  sideways and no text is cut. (FR-017)

### Story 2: the overview

- [X] R7 Click "Records" in the header. The address is `#RECORDS`; the frame shows the
  definition of "Record" (FitSM-0 §6.53) on top, a legend, and a table with every record as a
  row and the 14 process codes as columns in PR order. (FR-008–FR-010, FR-016)
- [X] R8 Pick three records; for each, the marked cells match the record view's two groups
  exactly, and the marks differ by shape, not only colour (check in greyscale). (FR-009,
  SC-005)
- [ ] R9 With a screen reader, move through the table: each cell is read with its record and
  process and "creates or maintains" or "uses". Tab moves only through record names and
  process codes, not cells. (FR-011)
- [X] R10 Activate a record name, then the frame's back control: the overview returns. Same for
  a process code. (FR-011)
- [X] R11 At 375 px wide, the record names stay visible while the columns scroll inside the
  table; the page does not scroll sideways. (FR-012)
- [X] R12 Open `#records`: the address becomes `#RECORDS`. (url-hash contract)

### Story 3: maintenance

- [X] R13 `node --test` passes, including one failing-fixture case per rule in
  [contracts/check-cli.md](contracts/check-cli.md). (FR-013, SC-007)
- [X] R14 In a copy of the edition, change one relationship's `match` to text that does not
  occur; `node scripts/check.js --content <copy>` fails naming the record and the place
  searched.
- [X] R15 Add a record with one relationship in a copy of the edition only and serve it: the
  record appears in the process view, its own view and the overview. (FR-014)

### Regression

- [X] R16 Open each of the nine record addresses that existed before (`#record/service-portfolio`,
  `#record/service-catalogue`, `#record/service-level-agreement`,
  `#record/operational-level-agreement`, `#record/underpinning-agreement`,
  `#record/configuration-management-database`, `#record/record`, `#record/report`,
  `#record/request-for-change`): each opens its record. (FR-015, SC-006)
- [X] R17 Devtools Network: total transfer still under 400 KB; usable within 2 s on "Fast 3G".
  (SC-008)
