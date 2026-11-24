# Contract: content file changes

Extends [feature 001's content contract](../../001-fitsm-process-map/contracts/content-files.md).
Only `records.json` changes; its shape is in [../data-model.md](../data-model.md).

## What the page shows from `records.json`

| Content | Page |
|---|---|
| `records[]` without `general` | Rows of the overview; links from process, activity and record views |
| `records[]` with `general: true` | Definition at the top of the overview; its own record view |
| `fitsm0: false` | Note in the record view: "FitSM-0 gives no definition for this; the text is from FitSM-2." |
| `alsoCalled[]` | "FitSM-2 wording" line under the definition, with source; `note` in a "Not part of FitSM" box |
| `relations[]` | Process view "Information and records", activity view list, record view process groups, overview cells; always under a "Not part of FitSM" box: "Derived from FitSM-2's activities, inputs and outputs; FitSM does not list records per process." |

## Maintainer workflow for records

1. Find the FitSM-0 term (§6.x) or, for a store FitSM-0 does not define, the FitSM-2 text that
   names it. Apply FR-001: the object must be registered, recorded, documented, stored or
   maintained by a process, or be one of its inputs or outputs.
2. Add or edit the record in `records.json`: quote the name and definition unchanged with
   document, section and PDF page. Keep existing ids.
3. For each process, add one relationship: `maintains` or `uses`, with a basis pointing at the
   activity step, input, output or interface flow and a `match` copied from its text.
4. Run `node scripts/check.js`; every relationship must resolve.
5. When a new FitSM edition is added, run the checks first: each `match` that no longer occurs
   is reported with the record and the place searched.
