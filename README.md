<!--
SPDX-FileCopyrightText: 2024 PNED G.I.E.

SPDX-License-Identifier: CC-BY-4.0
-->

[![REUSE status](https://api.reuse.software/badge/github.com/GenomicDataInfrastructure/fitsm-process-map)](https://api.reuse.software/info/github.com/GenomicDataInfrastructure/fitsm-process-map)
[![Run Tests](https://github.com/GenomicDataInfrastructure/fitsm-process-map/actions/workflows/test.yml/badge.svg)](https://github.com/GenomicDataInfrastructure/fitsm-process-map/actions/workflows/test.yml)
[![Publish main](https://github.com/GenomicDataInfrastructure/fitsm-process-map/actions/workflows/main.yml/badge.svg)](https://github.com/GenomicDataInfrastructure/fitsm-process-map/actions/workflows/main.yml)
[![Publish release](https://github.com/GenomicDataInfrastructure/fitsm-process-map/actions/workflows/release.yml/badge.svg)](https://github.com/GenomicDataInfrastructure/fitsm-process-map/actions/workflows/release.yml)
[![GitHub contributors](https://img.shields.io/github/contributors/GenomicDataInfrastructure/fitsm-process-map)](https://github.com/GenomicDataInfrastructure/fitsm-process-map/graphs/contributors)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)

# FitSM Process Map

An interactive diagram for learning [FitSM](https://www.fitsm.eu/), the lightweight IT service management standard. It shows the 14 FitSM processes and the interfaces between them, and lets you drill into each part of the standard.

**Live site:** https://genomicdatainfrastructure.github.io/fitsm-process-map/

## What you can explore

| Click on | You see |
| --- | --- |
| A process | Its objective, requirements (FitSM-1), roles, databases and records, activities and interfaces |
| A role | Its tasks (FitSM-3), split into process-specific and generic tasks, and how many are assigned |
| A database or record | Its description, source, and which processes use it |
| An activity | Its procedures, as the ordered steps from FitSM-2 |
| An arrow (interface) | The relationship description and the inputs / outputs exchanged between the two processes |

A process can also be opened directly by link, e.g. `…/fitsm-process-map/#ISRM`.

## Sources

The content comes from the FitSM v3 standard, published by ITEMO e.V. under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) at [fitsm.eu/downloads](https://www.fitsm.eu/downloads/):

- FitSM-0 Overview and vocabulary v3.0: definitions used for databases and records
- FitSM-1 Requirements v3.0.1: requirements PR1–PR14
- FitSM-2 Process activities and implementation v3.0.2: objectives, activities, inputs / outputs and key interfaces
- FitSM-3 Role model v3.0.1: roles and tasks

A few things are interpretation rather than quotation, and each is labelled on the page:

- FitSM does not list databases per process; they are derived from each process's outputs, and each one names its source.
- Where FitSM-2's two interface tables disagree, both descriptions are shown with a note.
- The colour groups are a study aid, not part of the standard.

## Project structure

| File | Purpose |
| --- | --- |
| `index.html` | The page: layout, styles and the diagram / panel logic |
| `fitsm-data.js` | All FitSM content: processes, requirements, roles, databases, activities, interfaces and diagram positions |
| `scripts/check.js` | Consistency checks run in CI (references resolve, nothing missing, page script parses) |

To correct or extend the content, edit `fitsm-data.js`. No build step is needed.

## Running locally

The page loads `fitsm-data.js` next to it, so serve the folder over HTTP:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. To run the same checks as CI:

```bash
node scripts/check.js
```

## CI/CD

| Workflow | Trigger | What it does |
| --- | --- | --- |
| `test.yml` — Run Tests | Every push and pull request | [REUSE](https://reuse.software/) compliance and `scripts/check.js` |
| `main.yml` — Publish main | After Run Tests succeeds on `main` (or manually) | Re-runs `scripts/check.js`, then deploys the site to GitHub Pages |
| `release.yml` — Publish release | Tags matching `v*` | Creates a GitHub release with the site attached as a zip |

All actions are pinned to commit SHAs.

The project has no package-managed dependencies (no npm, pip or similar), and no Docker image is built, so neither a dependency licence scan (ORT) nor an image scan (Trivy) runs. The only external resource is the [IBM Plex](https://github.com/IBM/plex) font family, loaded at runtime from Google Fonts under the SIL Open Font License 1.1. If a package-managed dependency or a container image is added, reintroduce those scans.

**One-time setup:** in the repository's *Settings → Pages*, set **Source** to **GitHub Actions**.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md). Every file must carry SPDX copyright and licence information ([REUSE](https://reuse.software/)); check with `reuse lint`.

## Licenses

This work is licensed under multiple licences:

- Source code (`index.html`, `scripts/`, workflows) is licensed under [Apache-2.0](./LICENSES/Apache-2.0.txt).
- Documentation and the FitSM content in `fitsm-data.js` are licensed under [CC-BY-4.0](./LICENSES/CC-BY-4.0.txt). FitSM content © ITEMO e.V.
- For more accurate information, check the individual files.
