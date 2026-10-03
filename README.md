<!--
SPDX-FileCopyrightText: 2026 PNED G.I.E.

SPDX-License-Identifier: CC-BY-4.0
-->

[![REUSE status](https://api.reuse.software/badge/github.com/GenomicDataInfrastructure/fitsm-process-map)](https://api.reuse.software/info/github.com/GenomicDataInfrastructure/fitsm-process-map)
[![Run Tests](https://github.com/GenomicDataInfrastructure/fitsm-process-map/actions/workflows/test.yml/badge.svg)](https://github.com/GenomicDataInfrastructure/fitsm-process-map/actions/workflows/test.yml)
[![Publish main](https://github.com/GenomicDataInfrastructure/fitsm-process-map/actions/workflows/main.yml/badge.svg)](https://github.com/GenomicDataInfrastructure/fitsm-process-map/actions/workflows/main.yml)
[![Publish release](https://github.com/GenomicDataInfrastructure/fitsm-process-map/actions/workflows/release.yml/badge.svg)](https://github.com/GenomicDataInfrastructure/fitsm-process-map/actions/workflows/release.yml)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)

# FitSM Process Map

A subway-style map of [FitSM](https://www.fitsm.eu/), the lightweight IT service management
standard. The 14 FitSM processes are stations; the interfaces between them are the
connections. Click a station or a connection and the frame beside the map shows what FitSM
says about it, with a reference to the FitSM document and section for every item.

**Live site:** https://genomicdatainfrastructure.github.io/fitsm-process-map/

## What you can explore

| Click on | You see |
| --- | --- |
| A process (station) | Its objective, requirements (FitSM-1), roles, databases and records, activities, interfaces, and inputs/outputs exchanged with parties outside the processes |
| A connection | FitSM's description of the interface and the inputs and outputs exchanged in each direction |
| A role | Its tasks (FitSM-3), split into tasks specific to the process and tasks common to every role of that kind |
| An activity | Its procedure, as the ordered steps from FitSM-2 |
| A database or record | Its FitSM-0 definition and the processes that use it |
| **General requirements** (header) | FitSM-1's general requirements GR1–GR7 |

Any view can be opened directly by link, for example `…/fitsm-process-map/#ISRM` for a
process, `#ISRM-PM` for an interface or `#GR` for the general requirements.

The coloured lines group related processes as a study aid. They are not part of FitSM, and
the page says so wherever they appear. Everything else on the page is FitSM's own text, with
the few interpretations (such as which records a process uses) labelled "Not part of FitSM".

## Sources

The content comes from FitSM edition 3.0, published by ITEMO e.V. under
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) at
[fitsm.eu/downloads](https://www.fitsm.eu/downloads/):

- FitSM-0 Overview and vocabulary: definitions of records and information stores
- FitSM-1 Requirements: general requirements GR1–GR7 and process requirements PR1–PR14
- FitSM-2 Process activities and implementation: objectives, activities and procedures,
  inputs/outputs and key interfaces
- FitSM-3 Role model: roles and tasks

The exact document versions the site reflects are listed in the page footer and in
`content/fitsm-3.0/edition.json`.

## Running locally

The page fetches its content over HTTP, so opening `index.html` from the file system does not
work. Serve the folder with any static server, for example:

```bash
python3 -m http.server 8765
```

Then open http://localhost:8765. No build step and no dependencies are needed.

## Project structure

| Path | Purpose |
| --- | --- |
| `index.html`, `styles.css` | The page: header, map container, legend, detail frame, footer |
| `src/app.js` | Loads the content, builds the model, renders, and routes on the address hash |
| `src/content.js` | Turns the JSON files into an indexed model (pure, tested in Node) |
| `src/graph.js` | Line colours, interchanges, labels (pure, tested in Node) |
| `src/router.js` | Parses and formats the address hash (pure, tested in Node) |
| `src/map.js` | Draws the SVG map |
| `src/panel.js` | Renders the detail frame views |
| `content/editions.json` | Which FitSM editions are present and which one the page shows |
| `content/fitsm-3.0/` | The FitSM 3.0 content: eight JSON files (see below) |
| `scripts/check.js` | Consistency and contrast checks, run in CI |
| `tests/` | Unit tests (`node --test`) and fixtures for the check script |

Each edition directory holds `edition.json` (documents, versions, licence), `processes.json`,
`requirements.json`, `roles.json`, `activities.json`, `records.json`, `interfaces.json` and
`map.json` (lines, station positions, routes). Every content item carries a `source` naming
the FitSM document and section it comes from.

## Checks and tests

```bash
node scripts/check.js
```

Checks every edition listed in `content/editions.json`: all references resolve, every process
has its objective, requirements, roles and activities and sits on a line, every interface has
a route, line colours pass WCAG contrast, and more. Exit code 0 means no errors; 1 means at
least one error (each printed as `error   <edition>/<file>: <item>: <message>`); 2 means a
file could not be read. A line whose processes are not all connected through that line is a
warning and does not fail the run. Options: `--content <dir>` checks one edition directory;
`--editions <file>` names a different editions file; `--quiet` prints findings only.

```bash
node --test
```

Runs the unit tests for the pure modules and the check script's fixtures.

## Updating the content

Only `content/` changes for a content update; the page code does not.

### Updating to a new FitSM edition

1. Download the new PDFs from the URL in the current `edition.json` (`downloads`).
2. Copy the current edition directory to a new one, for example `content/fitsm-3.1/`, and add
   it to `content/editions.json` under `editions`. Leave `current` pointing at the old one
   until the new content is complete.
3. In the new directory, update `edition.json`: each document's `version`, `url` and the page
   of its licence statement.
4. Work through the files in this order, because later files reference earlier ones:
   `processes.json` → `requirements.json` → `roles.json` → `activities.json` →
   `records.json` → `interfaces.json` → `map.json`. Quote FitSM text unchanged; put wording
   of your own only into `note` fields.
5. Run `node scripts/check.js` and fix every error; read the warnings.
6. Set `current` in `content/editions.json` to the new id and add a line to `CHANGELOG.md`
   naming the edition and the documents' versions.
7. Open a pull request citing the FitSM document and section for each content change.

### Adding a connection

1. Add an entry to `interfaces.json` with the two process codes in alphabetical order and at
   least one description or one flow.
2. Add a route for the same id to `map.json` under `routes` (an empty array draws a straight
   segment).
3. Run the checks: a missing route fails with the interface id.

### Changing the lines

Edit `lines` in `map.json` only. Membership, names, colours and label sides are free to
change; the checks verify that every process is on a line, that colours pass contrast, and
warn when a line's stations are not connected through interfaces.

## CI/CD

| Workflow | Trigger | What it does |
| --- | --- | --- |
| `test.yml` — Run Tests | Every push and pull request | [REUSE](https://reuse.software/) compliance, `node scripts/check.js`, `node --test` |
| `main.yml` — Publish main | After Run Tests succeeds on `main` (or manually) | Re-runs the checks, copies the site files to `_site/` and deploys them to GitHub Pages |
| `release.yml` — Publish release | Tags matching `v*` | Creates a GitHub release with the site attached as a zip |

All actions are pinned to commit SHAs. The project has no package-managed dependencies and
loads nothing from third-party servers at runtime.

**One-time setup:** in the repository's *Settings → Pages*, set **Source** to **GitHub Actions**.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md). Every
file carries SPDX copyright and licence information ([REUSE](https://reuse.software/)); check
with `reuse lint`.

## Licence

The whole project, code, documentation and content, is licensed under
[Creative Commons Attribution 4.0 International (CC BY 4.0)](LICENSES/CC-BY-4.0.txt), the same
licence as FitSM. FitSM content © ITEMO e.V., reproduced unchanged; the site's own additions
are labelled on the page. See the SPDX headers and `REUSE.toml` for per-file information.

The only third-party files in the repository are the [Spec Kit](https://github.com/github/spec-kit)
templates and scripts under `.specify/`, used to write the specification; they stay under
their own [MIT licence](LICENSES/MIT.txt) and are not part of the published site.
