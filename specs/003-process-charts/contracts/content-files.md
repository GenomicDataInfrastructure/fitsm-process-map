# Contract: content file changes

Extends the content contracts of features [001](../../001-fitsm-process-map/contracts/content-files.md)
and [002](../../002-fitsm-records/contracts/content-files.md).

## New file

| File | Shape | Holds |
|---|---|---|
| `charts.json` | array of Chart ([../data-model.md](../data-model.md)) | FitSM-2's process charts, one per process, transcribed |

Load order for maintainers: `processes.json` → `requirements.json` → `roles.json` →
`activities.json` → `interfaces.json` → `records.json` → `charts.json` → `map.json`.

## What the page shows from `charts.json`

| Content | Page |
|---|---|
| chart | Process view "Process chart" (compact) and `#chart/<code>` (wide), with "FitSM-2 v3.0.2 §PRn (p. n)" |
| `notes[]` | "Not part of FitSM" box under the chart |
| element `record` | link on the object; text version "Information" entry "… – taken to be the record <name> (Not part of FitSM)"; record view "In process charts" |
| element `activity` / `group` | link to the activity on the group and its steps |
| element `external` | link to the interface or process |

## Maintainer workflow: transcribing or correcting a chart

1. Render the chart's page: `pdftoppm -f <page> -l <page> -r 200 -png FitSM-2.pdf chart`
   (poppler; a reading aid, not part of the project), and crop it to the chart.
2. Measure positions in PDF points from the chart's top-left corner (pixels × 72 ÷ 200).
3. Write every element with its label exactly as printed (line breaks as `\n`), every arrow with
   its kind, heads and label, and bends where the route turns.
4. Link groups to activities, objects to records where the object is that record, and external
   ends to processes.
5. Run `node scripts/check.js`, then compare the page's chart with the PDF side by side: same
   elements, labels, arrows, directions and arrangement. In `notes`, list anything the site
   draws differently and every difference in meaning between the chart's wording and FitSM-2's
   text for the same activity or step, naming both wordings.
