<!--
SPDX-FileCopyrightText: 2026 PNED G.I.E.

SPDX-License-Identifier: CC-BY-4.0
-->

# Changelog

All notable changes to this project are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/). Content updates name the FitSM edition and the
document versions they bring in.

## [Unreleased]

### Added

- Initial process map of FitSM 3.0: FitSM-0 Overview and vocabulary v3.0.1, FitSM-1
  Requirements v3.0.1, FitSM-2 Process activities and implementation v3.0.2, FitSM-3 Role
  model v3.0.1 (all ITEMO e.V., CC BY 4.0). 14 processes, 17 general and 65 process
  requirements, 58 roles, 53 activities, 9 records, 31 interfaces with 64 flows.
- Subway-style map with five study-aid lines, a detail frame for every item, direct links
  (`#ISRM`, `#ISRM-PM`, `#GR`), keyboard and screen-reader access.
- `scripts/check.js` consistency and contrast checks, unit tests, REUSE compliance, GitHub
  Pages deployment and release workflows.
- Map layout on a finer grid: no two connections share a segment, a connection yields at a
  crossing (a short gap with ticks parallel to the crossing line, which stays unbroken),
  transfers are thin solid grey, stations show only their code (full name as tooltip and in
  the frame), and line names appear in the legend only.
- Selection by fading: the selected station or connection and what it connects to keep full
  strength with a soft halo while everything else fades; clicking the selection again
  deselects it; a selected connection shows moving markers in the direction of each flow
  FitSM-2 lists (hidden under `prefers-reduced-motion`).
- After a selection, focus moves to the frame's heading and only that heading is announced
  to screen readers; the legend's transfer sample takes its colour from the content.
- Checks for alias format, `map.grid` fields and role `tasks`; `scripts/check.js` works
  from any working directory; unit tests for the map geometry and selection rules.
