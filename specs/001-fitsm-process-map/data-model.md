# Data Model: FitSM Process Map

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Date**: 2026-10-03 (revised)

The content store is `content/editions.json` plus one directory per edition holding eight JSON
files. This document defines the entities, their fields, identifiers and the rules
`scripts/check.js` enforces. File-level shapes and the maintainer workflow are in
[contracts/content-files.md](contracts/content-files.md).

**Revision**: adds Editions (research R11), `externalFlows` on Process, zero-description
interfaces, line `labelSide`, alias uniqueness and the "process on no line" rule (second
clarification pass and `/speckit-analyze` C1, I1, U2).

## Conventions

- **Identifiers** are strings built from FitSM's own codes (constitution IV, FR-026). They are
  stable across editions; a renamed process keeps its code and gains an `alias` (see Process).
- **Source reference** (`source`) is mandatory on every content item (FR-017). The document's
  version comes from the edition's `edition.json`, so an edition update changes versions in
  one place.
- **Quotation vs interpretation**: text fields hold FitSM's wording unchanged (FR-018). Any
  field that records interpretation is named for it (`derived`, `note`, `lines`) and is
  labelled on the page (FR-019).
- Cross-references point from child to parent (a role names its process; a process does not
  list its roles). `content.js` builds the reverse indexes at load time.

## Entities

### Editions (`content/editions.json`)

```json
{
  "current": "fitsm-3.0",
  "editions": [
    { "id": "fitsm-3.0", "label": "FitSM 3.0 (English)", "path": "fitsm-3.0" }
  ]
}
```

| Field | Type | Rule |
|---|---|---|
| `current` | string | Must equal the `id` of one entry in `editions` |
| `editions[].id` | string | `^[a-z0-9.-]+$`; unique |
| `editions[].label` | string | Shown in the header |
| `editions[].path` | string | Directory under `content/` holding the eight files; must exist |

Exactly one edition is shown (Clarification 3); any number may be present (constitution IV).

### Source

```json
{ "doc": "FitSM-2", "section": "4.9.3", "page": 27 }
```

| Field | Type | Rule |
|---|---|---|
| `doc` | string | Must be a key of `edition.documents` |
| `section` | string | Section number or heading as printed in the document; required |
| `page` | integer | Optional; PDF page of the cited text |

### Edition (`<edition>/edition.json`)

| Field | Type | Rule |
|---|---|---|
| `standard` | string | `"FitSM"` |
| `edition` | string | `"3.0"` |
| `documents` | object | Key = document code (`FitSM-0` …); value `{ "title", "version", "url", "licenceStatement": { "page" } }`; `title`, `version`, `url` required |
| `downloads` | string | URL of the official download page |
| `licence` | object | `{ "name": "CC BY 4.0", "url": "https://creativecommons.org/licenses/by/4.0/" }` |
| `attribution` | string | `"ITEMO e.V."` |

### Process (`processes.json`, array)

| Field | Type | Rule |
|---|---|---|
| `code` | string | FitSM abbreviation (`SPM`, `SLM`, `SRM`, `SACM`, `CAPM`, `ISM`, `CRM`, `SUPPM`, `ISRM`, `PM`, `CONFM`, `CHM`, `RDM`, `CSI`); unique; `^[A-Z]{2,6}$` |
| `name` | string | Full FitSM name |
| `objective` | object | `{ "text", "source" }`; text quoted from FitSM-2 |
| `requirements` | string | Id of its requirement group (`PR9`); must exist in `requirements.process` |
| `inputs` | array | `{ "text", "source" }` per bullet of FitSM-2's "Process inputs" list, quoted; may be empty |
| `outputs` | array | `{ "text", "source" }` per bullet of FitSM-2's "Process outputs" list, quoted; records are derived from these; may be empty |
| `externalFlows` | array | `{ "direction": "in" \| "out", "party": string, "item": string, "source": Source }`; `party` is the non-process name as FitSM-2 prints it and MUST NOT equal any process code or alias; `party` and `item` non-empty; the array may be empty |
| `aliases` | string[] | Optional; former codes that still resolve to this process. Each alias matches `^[A-Z]{2,6}$`, is unique across all processes and aliases, and is not equal to any `code` |

Rules: exactly 14 entries; every process has ≥ 1 role of kind `owner`, `manager` and `staff`,
≥ 1 activity, a requirement group with ≥ 1 item, and belongs to ≥ 1 line in `map.json`.

### Requirement group and Requirement (`requirements.json`)

```json
{
  "general": [
    { "id": "GR1", "name": "Top management responsibility", "source": {...},
      "items": [ { "id": "GR1.1", "text": "...", "source": {...} } ] }
  ],
  "process": [
    { "id": "PR9", "process": "ISRM", "source": {...},
      "items": [ { "id": "PR9.1", "text": "...", "source": {...} } ] }
  ]
}
```

| Field | Type | Rule |
|---|---|---|
| `id` (group) | string | `^GR[1-7]$` for general, `^PR([1-9]\|1[0-4])$` for process; unique |
| `name` | string | General groups only; FitSM-1 heading |
| `process` | string | Process groups only; must be a process code; one group per process |
| `items[].id` | string | `<group>.<n>`; unique across the file |
| `items[].text` | string | Quoted from FitSM-1 |

Rules: 7 general groups; 14 process groups, one per process; every process referenced by
exactly one group; `items` non-empty.

### Role and Task (`roles.json`)

```json
{
  "generic": {
    "owner":  { "name": "Process owner",  "source": {...}, "tasks": [ "..." ] },
    "manager": { ... }, "case-owner": { ... }, "staff": { ... }
  },
  "roles": [
    { "id": "ISRM.manager", "process": "ISRM", "kind": "manager",
      "name": "Process manager ISRM", "count": "1 per process",
      "source": {...}, "tasks": [ { "text": "...", "source": {...} } ] }
  ]
}
```

| Field | Type | Rule |
|---|---|---|
| `id` | string | `<process>.<slug>`; unique; slug `^[a-z][a-z0-9-]*$` |
| `process` | string | Process code |
| `kind` | enum | `owner`, `manager`, `case-owner`, `staff`, `specific` |
| `name` | string | FitSM-3 role name |
| `count` | string | FitSM-3 wording for how many hold the role |
| `tasks` | array | Process-specific tasks, each `{ text, source }`; may be empty |
| `generic.<kind>.tasks` | string[] | FitSM-3 common tasks for that kind; `specific` has none |

The frame shows `tasks` as "specific to this process" and `generic[kind].tasks` as "common to
every <kind>", each group labelled (FR-011).

### Activity and Procedure (`activities.json`, array)

| Field | Type | Rule |
|---|---|---|
| `id` | string | `<process>.A<n>` for an "ongoing process execution" activity (`n` its order in FitSM-2) or `<process>.S` for the process's "initial process setup" list; unique |
| `process` | string | Process code |
| `phase` | enum | `setup` or `execution`; the FitSM-2 heading the activity comes from. The frame groups activities by phase |
| `name` | string | FitSM-2 activity name; for `<process>.S` the heading "Initial process setup" |
| `source` | Source | |
| `procedure` | string[] | Ordered steps quoted from FitSM-2 (the sub-bullets of an execution activity, or the setup bullets); non-empty |

### Record (`records.json`, array)

Covers both "databases" and "records" in the user's words; FitSM-0 defines both. Shown on
the page under the heading "Databases and records", the user's term.

| Field | Type | Rule |
|---|---|---|
| `id` | string | slug; unique |
| `name` | string | FitSM-0 term |
| `definition` | object | `{ "text", "source" }` quoted from FitSM-0 |
| `usedBy` | array | `{ "process", "basis": "output", "derived": true, "source" }`; `process` must exist; non-empty; `source` cites the FitSM-2 output |

Rule (Clarification 4, second session): a process uses a record only when one of its FitSM-2
outputs matches the record's FitSM-0 term. Nothing FitSM-0 does not define is a record.

### Interface (`interfaces.json`, array)

One entry per unordered pair of processes that FitSM-2 names in a key-interfaces table or in an
inputs/outputs table (Clarification 1, second session).

```json
{
  "id": "ISRM-PM",
  "processes": ["ISRM", "PM"],
  "descriptions": [ { "text": "...", "source": {...} } ],
  "flows": [ { "from": "ISRM", "to": "PM", "item": "Incident records", "source": {...} } ]
}
```

| Field | Type | Rule |
|---|---|---|
| `id` | string | The two codes in alphabetical order joined by `-`; unique |
| `processes` | string[2] | Two distinct process codes, alphabetical, matching `id` |
| `descriptions` | array | ≥ 0 `{ text, source }`; when > 1 the frame shows all with the "more than one place" note (FR-020); when 0 the frame shows the fixed "no interface description" sentence (FR-010) |
| `flows` | array | ≥ 0; `{ from, to, item, listedBy, source }`; `from`/`to` ∈ `processes`, `from ≠ to`; `listedBy` names the process under whose FitSM-2 key-interfaces table the row appears. In FitSM 3.0.2 every row of those tables is a flow, so the same row usually appears twice (listed by each process); identical wording is shown once with both sources, differing wording triggers the FR-020 note |
| `note` | string | Optional interpretation note, shown labelled |

Rule: at least one description or one flow must exist.

### Line (`map.json`)

Study aid, not FitSM content (FR-003).

| Field | Type | Rule |
|---|---|---|
| `id` | string | slug; unique |
| `name` | string | Shown on the map, in the legend and in the frame |
| `colour` | string | `#rrggbb`; contrast ≥ 3:1 against `map.background` |
| `stations` | string[] | ≥ 2 process codes, each existing; the first is where the name label is drawn |
| `labelSide` | enum | `n`, `s`, `e`, `w`: side of the first station on which the line name is drawn; MUST differ from that station's `label` side |

Rules: every process appears in at least one line (error); when two connected processes share
several lines, the first line in file order colours the connection.

### Map layout (`map.json`)

```json
{
  "note": "The lines group related processes as a study aid. They are not part of FitSM.",
  "background": "#ffffff",
  "transfer": { "colour": "#6b6b6b", "dash": "6 4" },
  "grid": { "unit": 60, "cols": 14, "rows": 9 },
  "lines": [ { "id": "operations", "name": "Operations", "colour": "#d81b60",
               "stations": ["ISRM", "PM"], "labelSide": "w" } ],
  "stations": { "ISRM": { "x": 3, "y": 4, "label": "s" } },
  "routes": { "ISRM-PM": [ [4, 4] ] }
}
```

| Field | Rule |
|---|---|
| `stations` | One entry per process code (all 14); `x`,`y` integers within the grid; `label` ∈ `n`,`s`,`e`,`w`; no two stations share a cell |
| `routes` | One entry per interface id; waypoints are grid points; empty array = straight segment; each consecutive pair must be horizontal, vertical or 45° |
| `transfer` | Style for cross-line connections; colour contrast ≥ 3:1 |

## Derived values (computed by `content.js` / `graph.js`, never stored)

| Derived | From | Used for |
|---|---|---|
| `process.roles`, `.activities`, `.records`, `.interfaces`, `.externalFlows` | reverse indexes / own field | Process frame view |
| `connection.line` | first line in `map.lines` order containing both ends; `null` = transfer | Map colour and dash; frame wording; `aria-label` |
| `station.lines` | lines containing the code | Interchange rings; `aria-label`; name labels |
| `interface.directions` | `flows` grouped by `from` | Frame shows each direction separately |
| `record.processes` | `usedBy[].process` | Record frame lists clickable processes |

## Validation summary (enforced by `scripts/check.js`)

1. `editions.json` parses; `current` names a listed edition; every listed `path` exists and
   holds the eight files, each parsing as JSON with the top-level shape above.
2. Ids are unique within their entity and match their pattern; aliases are unique and never
   equal to a code.
3. Every reference resolves: process codes, requirement group ↔ process, role/activity/record
   usage → process, interface processes, flow endpoints, `source.doc` → `edition.documents`,
   map stations and routes ↔ processes and interfaces, line stations → processes.
4. Exactly 14 processes, 7 general groups, 14 process groups.
5. Every process has objective, ≥ 1 requirement, owner + manager + staff roles, ≥ 1 activity,
   and is on ≥ 1 line; every external flow has a valid `direction`, non-empty `party` and
   `item`, a `source`, and a `party` that is not a process code or alias.
6. Every item has a `source` with `doc` and `section`.
7. Interface ids are alphabetical and match `processes`; no duplicate pair; ≥ 1 description or
   flow.
8. Map: every process has a station, every interface a route, cells unique, segments
   octilinear, colours parse and pass contrast, `labelSide` valid and different from the
   first station's `label` side.
9. Warnings (non-fatal): a line whose stations are not connected through same-line
   interfaces (R8).
10. `src/*.js` and `scripts/check.js` parse (`node --check`).

## State

There is no mutable state. The only runtime state is the current hash (selection) and the
in-memory back stack (R9).
