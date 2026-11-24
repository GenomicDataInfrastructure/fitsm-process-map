# Data Model: FitSM Process Charts

**Feature**: [spec.md](spec.md) | **Research**: [research.md](research.md)

One new content file per edition, `content/<edition>/charts.json`. Other files keep the shapes of
features 001 and 002. Sources use `{ "doc", "section", "page" }` with `page` the PDF page.

## Chart (`charts.json`, array; one per process)

```json
{
  "process": "PM",
  "source": { "doc": "FitSM-2", "section": "PR10", "page": 33 },
  "size": { "w": 470, "h": 330 },
  "notes": [],
  "elements": [
    { "id": "identify", "kind": "group", "activity": "PM.A1", "label": "Identify problems", "x": 120, "y": 0, "w": 220, "h": 70 },
    { "id": "trend", "kind": "step", "group": "identify", "label": "Perform incident pattern\nand trend analysis", "x": 130, "y": 30, "w": 90, "h": 28 },
    { "id": "register", "kind": "step", "group": "identify", "label": "Register problem", "mark": "record", "x": 238, "y": 30, "w": 90, "h": 28 },
    { "id": "problem-new", "kind": "object", "shape": "document", "fill": "white", "label": "Problem [new]", "record": "problem", "x": 0, "y": 125, "w": 80, "h": 26 },
    { "id": "kedb", "kind": "object", "shape": "database", "fill": "grey", "label": "Known error\ndatabase (KEDB)", "record": "known-error-database", "x": 390, "y": 290, "w": 80, "h": 30 },
    { "id": "to-chm", "kind": "external", "process": "CHM", "direction": "to", "label": "to CHM", "x": 420, "y": 120, "w": 50, "h": 14 }
  ],
  "arrows": [
    { "from": "trend", "to": "register", "kind": "sequence" },
    { "from": "register", "to": "problem-new", "kind": "flow", "points": [[220, 85], [40, 100]] },
    { "from": "kedb", "to": "update", "kind": "flow", "heads": "both" }
  ]
}
```

| Field | Type | Rule |
|---|---|---|
| `process` | string | An existing process code; exactly one chart per process. |
| `source` | object | FitSM-2 section `PR<n>` of that process and the PDF page of the chart. |
| `size` | object | `{ w, h }`, positive integers, chart units = PDF points. |
| `notes` | array | `{ "text" }` per difference the site introduces, and per difference in meaning between the chart's wording and FitSM-2's text for the same activity or step, naming both wordings (FR-014); shown as "Not part of FitSM" on the chart. May be empty. |
| `elements` | array | See Element. Non-empty; ids unique within the chart. |
| `arrows` | array | See Arrow. |

## Element (`charts[].elements[]`)

Common fields: `id` (`^[a-z0-9]+(-[a-z0-9]+)*$`, unique in the chart), `kind`, `label` (as
printed; `\n` marks a line break as printed), `x`, `y`, `w`, `h` (integers; the box lies inside
`size`).

| `kind` | Extra fields | Drawn as | Links to |
|---|---|---|---|
| `group` | `activity` (id of an activity of the chart's process) | filled box, title at top | `#activity/<id>` |
| `step` | `group` (id of a group element; the step lies inside it); optional `mark: "record"` | light box; record mark = small document icon in its corner | the group's activity |
| `decision` | optional `group` | diamond | — |
| `end` | — | rounded box | — |
| `object` | `shape`: `document`, `documents` or `database`; `fill`: `white` or `grey`; optional `record` (a record id) | document, stacked documents or cylinder | `#record/<id>` when `record` is set |
| `note` | — | grey box with text | — |
| `external` | `process` (a process code other than the chart's), `direction`: `to` or `from` | grey arrow with its label | the interface `#<A>-<B>` if it exists, else `#<process>` |

A label's state is the text in square brackets, if any ("Problem [known error]" → "known
error"); it is not stored separately.

## Arrow (`charts[].arrows[]`)

| Field | Type | Rule |
|---|---|---|
| `from`, `to` | string | Element ids of this chart; different. |
| `kind` | string | `sequence` (solid) or `flow` (dashed `4 3`). |
| `heads` | string | Optional: `end` (default), `both`, or `none` for a plain connector (e.g. PM's dashed line between "Problem [known error]" and "Information on identified workarounds"; added during implementation). |
| `label` | string | Optional, as printed (e.g. "Yes", "No"). |
| `points` | array | Optional bends `[x, y]` inside `size`, so the route follows FitSM-2's; the arrow runs from the edge of `from` through the bends to the edge of `to`. A first or last bend on the edge of the box it touches becomes the arrow's end there. |
| `curve` | boolean | Optional: draw the arrow as a smooth curve through its points, where FitSM-2 draws it curved (added during implementation). |

## Derived model

| Derived | From | Used by |
|---|---|---|
| `process.chart` | chart by `process` | Process view section, wide view |
| `record.charts` = `[{ process, states: [..] }]` | objects with `record` | Record view "In process charts" (FR-009) |
| `chartScale(chart, width)` → `{ scale, minWidth, width }` | `size`, 7.5-unit labels, 12 px floor | Compact and wide layout (research R4) |
| `chartOutline(chart, model)` → groups, steps in sequence order with reads/produces, decisions, objects, notes, externals, all arrows | elements and arrows | Text version (research R7) |
| `lineColour(segment, chart)` → `"light"` inside a group, else `"dark"` | group boxes | Contrast (research R5) |

Sequence order inside a group: start at the step with no incoming `sequence` arrow from a step of
the same group; follow `sequence` arrows; steps not reached are appended in reading order
(top-to-bottom, left-to-right).

## Validation

Rules and messages: [contracts/check-cli.md](contracts/check-cli.md).
