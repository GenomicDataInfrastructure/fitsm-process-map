<!--
SPDX-FileCopyrightText: 2024 PNED G.I.E.

SPDX-License-Identifier: CC-BY-4.0
-->

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Interactive FitSM v3 process map (`index.html`) showing the 14 processes and their key interfaces.
- FitSM content in `fitsm-data.js`: requirements (FitSM-1), activities and procedures, inputs / outputs and interfaces (FitSM-2), roles and tasks (FitSM-3), and databases and records (FitSM-0).
- `scripts/check.js` consistency checks, run in CI.
- GitHub Pages deployment from `main` after the tests pass.
- GitHub releases with the site attached as a zip, for `v*` tags.

### Changed

- Contact method for conduct and security reports: GitHub issues.
- CI actions pinned to commit SHAs; tests also run on pull requests.

### Removed

- Docker image build and publication (`Dockerfile`); the site is served by GitHub Pages.
- Template placeholder page and template screenshot.
- ORT licence scan: the project has no package-managed dependencies.
- SonarCloud badge: SonarCloud is not used.
- Trivy scan: no Docker images are built.
