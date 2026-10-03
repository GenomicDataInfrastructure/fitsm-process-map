# Contract: Content Files

**Audience**: maintainers who update the FitSM content. This is the interface between the
content store and the page; the page and the check script depend on it. Entity fields and
rules are in [../data-model.md](../data-model.md); this file lists what the page reads and
what a maintainer must do. Revised for edition directories (research R11).

## Layout

```text
content/
├── editions.json        # which editions exist and which one the page shows
└── <edition-id>/        # one directory per edition, e.g. fitsm-3.0
    ├── edition.json
    ├── processes.json
    ├── requirements.json
    ├── roles.json
    ├── activities.json
    ├── records.json
    ├── interfaces.json
    └── map.json
```

## Files the page loads

`content/editions.json` first, then the eight files of the `current` edition's directory, in
parallel, from the same origin:

| File | Top level | Holds |
|---|---|---|
| `edition.json` | object | Documents, versions, download URL, licence, attribution |
| `processes.json` | array of Process | 14 processes, each with `objective`, `inputs`, `outputs` and `externalFlows` |
| `requirements.json` | `{ general: [...], process: [...] }` | GR1–GR7 and PR1–PR14 groups with items |
| `roles.json` | `{ generic: {...}, roles: [...] }` | Common tasks per role kind, roles per process |
| `activities.json` | array of Activity | Activities with procedure steps |
| `records.json` | array of Record | Records with FitSM-0 definitions and derived usage |
| `interfaces.json` | array of Interface | One per connected process pair (descriptions and/or flows) |
| `map.json` | object | Lines with name-label sides, station grid positions, route waypoints, styles |

If `editions.json` or any edition file fails to load or parse, the page shows a single error
message in the frame naming the file (`Could not load content/<edition>/<file>`), and draws
nothing. There is no partial render.

## Stability promises

- Entity ids (`code`, `id`) are stable across editions. A process that FitSM renames keeps its
  code; the new name goes in `name` and the old code, if it changes, goes in `aliases`.
- Adding a field to any entity is backward compatible: the page ignores unknown fields.
- Removing or renaming a field listed in the data model is a breaking change and needs a
  matching change in `src/` and `scripts/check.js` in the same pull request.
- `source` on every item is mandatory and is rendered verbatim as
  `<doc> v<version> §<section>` (page number appended when present).

## Updating to a new FitSM edition

1. Download the new PDFs from the URL in the current `edition.json.downloads`.
2. Copy the current edition directory to a new one, for example `content/fitsm-3.1/`, and
   add it to `editions.json.editions` (keep `current` pointing at the old one until the new
   content is complete).
3. In the new directory, update `edition.json`: each document's `version`, `url` and
   `licenceStatement.page`; keep `licence` and `attribution` unless the PDFs say otherwise.
4. Work through the files in this order, because later files reference earlier ones:
   `processes.json` → `requirements.json` → `roles.json` → `activities.json` →
   `records.json` → `interfaces.json` → `map.json`. Quote text unchanged; put wording that
   is yours into `note` fields only.
5. Run `node scripts/check.js` (it checks every listed edition) and fix every error; read the
   warnings.
6. Set `editions.json.current` to the new id. Add a line to `CHANGELOG.md` naming the edition
   and the documents' versions.
7. Open a pull request citing the FitSM document and section for each content change.

The old directory may stay (so the site can grow an edition switcher later) or be removed in
a later release; either way it remains in version control.

## Adding a connection

1. Add an Interface entry to `interfaces.json` with the two codes in alphabetical order and at
   least one description or one flow.
2. Add a route for the same id to `map.json.routes` (an empty array for a straight segment).
3. Run the checks: a missing route fails with the interface id.

## Changing the lines (study aid)

Edit `map.json.lines` only. Membership, names, colours and label sides are free to change; the
checks verify that every process is on a line, that colours pass contrast, and warn when a
line's stations are not connected through interfaces. Nothing in `src/` needs to change.

## What the page does with interpretation and fixed sentences

| Field or case | How the page shows it |
|---|---|
| `records[].usedBy[].derived` | Box "Not part of FitSM": "Derived from this process's outputs; FitSM does not list records per process." with the output's source |
| `interfaces[].descriptions` with more than one entry | Box "Not part of FitSM": "FitSM describes this interface in more than one place." with all sources |
| `interfaces[].descriptions` empty | Fixed sentence in place of the description: "FitSM-2 lists these inputs and outputs but gives no interface description." |
| `processes[].externalFlows` non-empty | Section "Inputs from and outputs to outside the processes" with direction, party, item, source |
| `interfaces[].note`, any `note` | Box "Not part of FitSM" |
| `map.json.lines` | Legend entries (name and colour) under the heading "Lines are a study aid, not part of FitSM", and `map.json.note` |
