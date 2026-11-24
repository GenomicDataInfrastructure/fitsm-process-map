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

- Process charts (feature 003): every process view shows FitSM-2's own process chart (FitSM-2
  v3.0.2, PR1–PR14), redrawn from the PDF with its source: activity groups, steps in order,
  decisions, end states, the information read and produced (with states such as "Problem
  [known error]"), notes and arrows to other processes. Groups and steps open their activity,
  information objects open their record, and "to/from" arrows open the interface. Where the
  chart's wording differs in meaning from FitSM-2's activity text, a "Not part of FitSM" note
  shows both.
- `#chart/<code>` shows a chart across the map's area beside a text version of everything it
  draws; record views list the charts a record appears in.
- `content/<edition>/charts.json` and check rule 17 for charts.

- Records aligned with FitSM (feature 002): 36 records with 84 process relationships, up from
  9 records. Every information object FitSM-0 defines that a process creates, maintains or
  uses has its own record with its FitSM-0 definition (FitSM-0
  v3.0.1), for example Problem, Known error, Incident, Change and Configuration item, plus
  the stores FitSM-2 names without a FitSM-0 definition, such as the known error database
  (FitSM-2 v3.0.2). Each process–record relationship names the FitSM-2 activity step, input,
  output or interface flow it rests on and is labelled "Not part of FitSM".
- The process view's "Information and records" (formerly "Databases and records") lists what
  the process creates or maintains and what it uses; the activity view lists its records.
- A records overview at `#RECORDS`, opened from the header: every record against the 14
  processes, ● creates or maintains, ○ uses.
- Checks for records and relationships: every relationship must resolve to FitSM-2 text in
  the content.

- The map shows its two halves, Plan & Deliver and Operate & Control, as shaded bands
  (`zones` in `map.json`, checked by `scripts/check.js`), named in the legend, in each
  station's spoken name and in its frame subtitle, and labelled as a study aid.
- Clicking a stretch of the map where several connections run together selects all of them
  (`#A-B,C-D`): the frame lists each one's description and flows, and the map highlights and
  animates each.
- `scripts/check.js` prints layout metrics for each edition's map (crossing points,
  shared segments by kind, close parallels); `--layout` lists each one with its grid
  coordinates.
- `drawFirst` in `map.json` names transfers to draw before the others, so the others break
  where they cross them.
- A grid overlay for maintainers, off by default: `SHOW_GRID` in `src/map.js` or `?grid` in
  the address.
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

### Changed

- SPM is now the main station: it is the only interchange, at the top centre of the map, on
  the Agreements line (CRM–SPM–SUPPM) and the Assurance line, which runs from SPM down to SLM
  and forks there to SACM, CAPM and ISM. SLM is on the Assurance line only, so CRM–SLM and
  SLM–SUPPM are now transfers. The map still has 13 crossing points.
- The Reporting and improvement line is orange (`#e06000`, was `#bf360c`) so it can be told
  apart from the red Operations line.
- A new map layout: CRM and SLM swap places so the Agreements row is straight and the
  Assurance line forks below SLM; transfers leaving CHM, ISRM and CONFM run together as
  trunks and branch off; the Reporting line runs below the Assurance fork on row 14; no
  transfer runs along a coloured line. Crossing points on the map fall from 51 to 13 and
  close parallels from 28 to 5.
- Route bends are drawn as curves, so a branch leaves a trunk smoothly; a curve next to a
  crossing is tightened, down to a sharp corner, so the crossing's gap fits.
