# Contract: `scripts/check.js` changes

Extends [feature 001's](../../001-fitsm-process-map/contracts/check-cli.md) and
[feature 002's](../../002-fitsm-records/contracts/check-cli.md) check contracts. Invocation, exit
codes and output format are unchanged: `error   <edition>/<file>: <item>: <message>`.

## Changed rules

- **2. Load**: the edition has nine files; `charts.json` is the ninth (exit 2 if it is missing
  or does not parse).
- **3. Shape**: `charts.json` is an array of charts as in [../data-model.md](../data-model.md).

## New rule 17. Process charts

`<item>` is the process code, followed by the element id or `arrows[<k>]` where relevant.

| Condition | Message |
|---|---|
| A process has no chart | `charts.json: <code>: no chart` |
| Two charts for one process, or a chart for an unknown process | `charts.json: <code>: duplicate chart` / `charts.json: <code>: unknown process` |
| `source` missing, not FitSM-2, or section not the process's PR group | `charts.json: <code>: source must be FitSM-2 <PRn> with a page` |
| `size` not two positive integers | `charts.json: <code>: size must be { w, h } positive integers` |
| Element id missing, malformed or duplicated | `charts.json: <code>.<id>: id must be a unique slug` |
| Unknown `kind` | `charts.json: <code>.<id>: unknown kind "<kind>"` |
| Missing `label`, or `x`/`y`/`w`/`h` not integers, or the box not inside `size` | `charts.json: <code>.<id>: needs a label and a box inside the chart` |
| `group` whose `activity` is unknown or of another process | `charts.json: <code>.<id>: activity "<a>" is not an activity of <code>` |
| `step` whose `group` is not a group element, or the step box not inside the group box | `charts.json: <code>.<id>: step must lie inside group "<g>"` |
| `object` with a bad `shape` or `fill` | `charts.json: <code>.<id>: shape must be document, documents or database and fill white or grey` |
| `object` whose `record` is unknown | `charts.json: <code>.<id>: unknown record "<r>"` |
| `external` whose `process` is unknown or the chart's own, or bad `direction` | `charts.json: <code>.<id>: external end must name another process and "to" or "from"` |
| Arrow end not an element of the chart, or `from` = `to` | `charts.json: <code>.arrows[<k>]: "<id>" is not an element of this chart` |
| Arrow `kind` not `sequence`/`flow`, or `heads` not `end`/`both`/`none` | `charts.json: <code>.arrows[<k>]: kind must be sequence or flow, heads end, both or none` |
| Arrow bend outside `size` | `charts.json: <code>.arrows[<k>]: bend <n> lies outside the chart` |

A group with no step is not reported: FitSM-2 draws some (CRM, SUPPM, SRM; found during
implementation).

Informational line (like the layout metrics): `charts  <edition>/charts.json: 14 charts, <n>
elements, <m> arrows, <r> record links`.

## Tests

`tests/check.test.js` gains one case per error row, each with a fixture under
`tests/fixtures/broken/chart-<case>/` that differs from `valid/` only in `charts.json`. Every
fixture edition gets a `charts.json` with one minimal valid chart per fixture process.
