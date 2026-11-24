# Contract: `scripts/check.js` changes

Extends [feature 001's check contract](../../001-fitsm-process-map/contracts/check-cli.md).
Invocation, exit codes and the output format are unchanged:
`error   <edition>/<file>: <item>: <message>`.

## Changed rules

- **3. Shape**: `records.json` follows [../data-model.md](../data-model.md). A record with
  `usedBy` (feature 001's shape) is an error: `records.json: <id>: usedBy is replaced by relations`.
- **5. References**: the record part of feature 001's rule (`usedBy[].process`) is replaced by
  rule 16.

## New rule 16. Records and relationships

Run per edition after rules 1–5. Each finding is an error unless marked otherwise.

| Condition | Message (`<item>` is the record id) |
|---|---|
| `definition.text` or `definition.source` missing | `records.json: <id>: definition must have text and source` |
| `fitsm0` is not `false` and `definition.source.doc` is not `FitSM-0` | `records.json: <id>: definition must come from FitSM-0, or set "fitsm0": false` |
| `fitsm0` is `false` and `definition.source.doc` is not `FitSM-2` | `records.json: <id>: a store FitSM-0 does not define must be quoted from FitSM-2` |
| `general` on a record other than one, or on more than one record | `records.json: <id>: only one record may be general` |
| No relationships on a record that is not `general` | `records.json: <id>: needs at least one relationship` |
| `relations[k].process` unknown | `records.json: <id>: relations[<k>]: unknown process "<code>"` |
| `relations[k].kind` not `maintains` or `uses` | `records.json: <id>: relations[<k>]: kind must be "maintains" or "uses"` |
| A process appears twice | `records.json: <id>: process <code> appears more than once` |
| `basis` has none or more than one of `activity`, `input`, `output`, `flow`, or `match` is missing or shorter than 3 characters | `records.json: <id>: relations[<k>]: basis must name one activity, input, output or flow and a match of at least 3 characters` |
| Activity unknown, or not of the relationship's process | `records.json: <id>: relations[<k>]: activity "<a>" is not an activity of <code>` |
| Input or output code differs from the relationship's process | `records.json: <id>: relations[<k>]: input/output must be the relationship's own process` |
| Flow interface unknown, or the process is not one of its ends | `records.json: <id>: relations[<k>]: <code> is not an end of interface "<i>"` |
| No step, item or flow contains `match` | `records.json: <id>: relations[<k>]: "<match>" not found in <where>` |

`<where>` names what was searched, e.g. `activity PM.A3`, `outputs of PM`, `flows of ISRM-PM`.

Rule 4 (ids) covers record ids: unique, slug pattern.

## Summary line

The final line gains the number of records and relationships checked; the existing
"items checked" count includes them.

## Tests

`tests/check.test.js` gains one case per row above, each with a fixture under
`tests/fixtures/broken/<case>/` that differs from `valid/` only in `records.json`. Every
existing fixture's `records.json` is migrated to the new shape.
