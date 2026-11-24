# Data Model: Records Aligned with FitSM

**Feature**: [spec.md](spec.md) | **Research**: [research.md](research.md)

Only `content/<edition>/records.json` changes. Every other content file keeps feature 001's
shape ([001 data model](../001-fitsm-process-map/data-model.md)). Sources keep the
`{ "doc", "section", "page" }` shape, with `page` the PDF page number (research R3).

## Record (`records.json`, array)

```json
{
  "id": "known-error",
  "name": "Known error",
  "definition": {
    "text": "<FitSM-0 6.38 definition, quoted unchanged>",
    "source": { "doc": "FitSM-0", "section": "6.38", "page": 13 }
  },
  "relations": [
    { "process": "PM", "kind": "maintains", "basis": { "activity": "PM.A3", "match": "Add a known error" } },
    { "process": "ISRM", "kind": "uses", "basis": { "flow": "ISRM-PM", "match": "Known error database (KEDB)" } }
  ]
}
```

| Field | Type | Rule |
|---|---|---|
| `id` | string | Slug, `^[a-z0-9]+(-[a-z0-9]+)*$`; unique. The nine ids that exist today are kept (R5). |
| `name` | string | The FitSM-0 term as printed (clarification 1); for `fitsm0: false`, the name as FitSM-2 prints it. |
| `fitsm0` | boolean | Optional, default `true`. `false` marks a store FitSM-0 does not define (FR-003). |
| `definition` | object | `{ "text", "source" }`. `source.doc` is `FitSM-0` unless `fitsm0` is `false`, then `FitSM-2`. |
| `alsoCalled` | array | Optional. `{ "text", "source", "note"? }`: differing FitSM-2 wording shown beside the definition (Edge Cases). `note` is project wording and is shown as interpretation. |
| `general` | boolean | Optional, default `false`. Only on `record` (FitSM-0 6.53): shown at the top of the overview, never in process or activity lists, and exempt from "needs a relationship" (FR-016). |
| `relations` | array | Non-empty unless `general`. See Relationship. |

## Relationship (`records[].relations[]`)

| Field | Type | Rule |
|---|---|---|
| `process` | string | An existing process code. At most one relationship per process per record (FR-004). |
| `kind` | string | `"maintains"` (shown as "Creates or maintains") or `"uses"` (shown as "Uses"). |
| `basis` | object | Exactly one of the four forms below, plus `match`. |

### Basis

| Form | Points at | Resolves when |
|---|---|---|
| `{ "activity": "<activity id>", "match": "…" }` | A step of an activity in `activities.json` | the activity exists and one of its `procedure` steps contains `match` |
| `{ "input": "<process code>", "match": "…" }` | An item of that process's `inputs` in `processes.json` | the item text contains `match` |
| `{ "output": "<process code>", "match": "…" }` | An item of that process's `outputs` | the item text contains `match` |
| `{ "flow": "<interface id>", "match": "…" }` | A flow of an interface in `interfaces.json` | the interface exists and one of its flows' `item` contains `match` |

`match` is a case-sensitive substring of at least 3 characters copied from FitSM-2 text. The
source shown on the page is the resolved item's `source`; the relationship stores none of its
own. When several steps contain `match`, the first is used. For an activity basis the
activity must belong to the relationship's process; for an input or output basis the code
must equal the relationship's process; for a flow basis the process must be one end of the
interface.

Derivation rules (FR-004a, clarification 2): `maintains` from an output or from a step that
registers, records, documents, updates or maintains the object; `uses` from an input or from a
step that consults, checks, analyses or uses it. A flow counts for both ends: `maintains` for
the sending process when it produces the object, `uses` for the receiving one. When both kinds
apply to one process, only `maintains` is kept.

## Derived model (`src/content.js`)

| Derived field | From | Used by |
|---|---|---|
| `record.relations[].resolved` = `{ text, source, link? }` | basis lookup | Record view: each process entry shows the basis and its source; `link` is `#activity/<id>` for activity bases |
| `process.records` = `{ maintains: Record[], uses: Record[] }` | relations by process, excluding `general` | Process view "Information and records" (FR-006) |
| `activity.records` = `{ maintains: Record[], uses: Record[] }` | relations whose basis is that activity | Activity view (FR-006b) |
| `overview` = `{ general: Record, processes: Process[], rows: { record, cells: Map<code, kind> }[] }` | all records | Records overview (FR-009, FR-010) |

Overview ordering (FR-010): processes in PR order (PR1 SPM … PR14 CSI, from `requirements`).
Rows are grouped by the first process in that order with a `maintains` relationship; within a
group, by `name`. Records with no `maintains` relationship come last, by `name`. The `general`
record is not a row.

Replaced in feature 001's model: `record.usedBy` and the per-process `records` list of uses
derived from outputs; the "Databases and records" heading becomes "Information and records".

## Validation

The rules are listed with their messages in [contracts/check-cli.md](contracts/check-cli.md).
