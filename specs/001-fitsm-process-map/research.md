# Research: FitSM Process Map

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Date**: 2026-10-03 (revised)

Each entry resolves one open point from the plan's Technical Context or a design choice that
affects more than one artifact. R3, R10 and R11 changed in the revision after `/speckit-analyze`.

## R1. Latest FitSM edition and licence

**Decision**: Content reflects FitSM 3.0. The edition's `edition.json` records each document's
full version string (for example FitSM-1 v3.0.1), taken from the front matter of the PDF
actually used, and the page where the PDF states its licence. The licence shown is CC BY 4.0,
credited to ITEMO e.V.

**Rationale**: fitsm.eu/downloads (checked 2026-10-03) lists FitSM 3.0 as the current edition,
with FitSM-0, -1, -2, -3 at v3.0 and FitSM-6 at v3.0; FitSM-4 and -5 are template and guide
collections. The download page does not print the licence; it is stated inside each PDF. The
patch versions in the spec (3.0.1, 3.0.2) come from earlier work and must be confirmed from the
PDFs when the content is entered.

**Alternatives considered**: Hard-coding "v3" only. Rejected: the page must state the exact
documents and versions (FR-021), and patch versions change wording.

## R2. Content format: JSON files loaded over HTTP

**Decision**: Content is a set of JSON files, one per concern, inside an edition directory,
fetched by the page over HTTP from its own origin. The page is served by GitHub Pages or any
static server (`python3 -m http.server` locally).

**Rationale**: JSON is the simplest format a maintainer can edit, diff and validate; the check
script reads it with `JSON.parse`; it carries no code, which keeps content and behaviour apart
(constitution IV). Several files keep diffs small and let the map layout (`map.json`) change
without touching FitSM text. ES modules and `fetch` both need HTTP.

**Alternatives considered**: a single JavaScript file assigning a global (works from `file://`
but mixes content with code); a single JSON file (one 350 KB diff target); YAML (needs a
parser). All rejected.

**Consequence**: opening `index.html` from the file system does not work. The README and the
release zip say so and give the one-line server command.

## R3. Map rendering: inline SVG generated from grid data, with line labels

**Decision**: `map.js` builds one `<svg>` at load time from the edition's `map.json`. Stations
have integer grid coordinates; routes are lists of grid waypoints, so segments are horizontal,
vertical or 45° (octilinear). A station on two or more lines is an interchange, drawn as a
white disc with one coloured ring per line. Stations are labelled with their FitSM code only;
the full name is the station link's `<title>` tooltip and its spoken name, and the frame
shows it when opened. Line names are not drawn on the map: the legend beside the map and the
frame's wording identify lines (FR-006). Stations and connections are SVG `<a href="#...">`
elements. Each connection has a wide transparent stroke under the visible one
as a hit area. The SVG uses `viewBox` and scales to its container; under 900 px the container
scrolls horizontally.

**Rationale**: SVG is resolution-independent, styleable with CSS and accessible through native
links. Generating it from data keeps the layout editable without touching code (FR-025).
Code-only station labels keep the map uncluttered; the legend carries the line names (FR-006).

**Alternatives considered**: Canvas (no DOM, no native links); a diagram library (dependency);
hand-drawn static SVG (drifts from content). All rejected.

## R4. Typography: system font stack, no web fonts

**Decision**: `font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue",
Arial, sans-serif`. No font files are bundled or loaded.

**Rationale**: FR-029a forbids third-party requests; a bundled font is 200–400 KB and one more
licence. A system stack costs nothing (constitution III).

**Alternatives considered**: bundling IBM Plex Sans (OFL). Rejected as unnecessary weight.

## R5. Testing without package-managed dependencies

**Decision**: Three layers: `scripts/check.js` (content checks, contrast arithmetic);
`node --test` (pure modules and `check.js` against fixtures); manual browser scenarios
in [quickstart.md](quickstart.md).

**Rationale**: Browser automation is a package-managed dependency with a downloaded browser;
constitution III rejects it unless a spec justifies it. Putting logic into pure modules makes
the risky parts testable in Node.

**Alternatives considered**: Playwright in CI (dependency, ~300 MB); no automated tests
(constitution VI). Both rejected.

## R6. REUSE compliance for JSON files

**Decision**: `REUSE.toml` at the repository root annotates `content/**` (and other files that
cannot carry a comment header) with `SPDX-FileCopyrightText` for ITEMO e.V. and the project,
and `SPDX-License-Identifier = "CC-BY-4.0"`. Every other file carries an SPDX header.
`LICENSES/CC-BY-4.0.txt` holds the licence text.

**Rationale**: JSON has no comments; REUSE 3.3's `REUSE.toml` exists for that case and
`fsfe/reuse-action` understands it.

**Alternatives considered**: `.license` sidecar files (many files to keep in sync);
`.reuse/dep5` (deprecated). Both rejected.

## R7. Deployment and CI

**Decision**: Three workflows adapted from the existing ones: `test.yml` (REUSE, `check.js`,
`node --test` on Node 22) on every push and pull request; `main.yml` after tests pass on
`main` (copy `index.html styles.css src content` into `_site/`, upload, deploy to Pages);
`release.yml` on `v*` tags (checks, zip, GitHub release). All actions SHA-pinned.

**Rationale**: GitHub Pages with the Actions source needs no branch gymnastics; the
test-then-deploy chain keeps a broken content edit off the live site. The folder copy is not
a build step.

**Alternatives considered**: deploying from a `gh-pages` branch. Rejected: no test gate.

## R8. What a line is when its stations are not all connected by interfaces

**Decision**: A line is a named colour applied to its member stations (ring colour), to every
connection whose two ends are both members, and to its name label. It is not drawn as a
separate track through stations that FitSM does not connect. `check.js` warns when a line's
members are not all reachable from each other through same-line connections.

**Rationale**: FR-002 forbids drawing a connection FitSM does not define; Clarification 3
(second session) fixed this reading and removed the conflicting Line wording from the spec.

**Alternatives considered**: a faint background track. Rejected: it looks like a connection.

## R9. Navigation: URL hash, browser history and the frame's back control

**Decision**: Every selectable item has a hash (grammar in
[contracts/url-hash.md](contracts/url-hash.md)). Clicking anything sets `location.hash`; a
`hashchange` listener renders the frame and updates the map highlight. The frame's back control
pops an in-memory stack of visited hashes; when empty it goes to the item's parent.

**Rationale**: Hash routing needs no server configuration on GitHub Pages and lets stations be
plain links.

**Alternatives considered**: `history.pushState` path routing. Rejected: 404s on GitHub Pages.

## R10. Accessibility details

**Decision**:
- The SVG has `role="img"` and a `<title>` "Map of the 14 FitSM processes and their
  interfaces", plus `aria-describedby` pointing at the study-aid note.
- Station `aria-label`: "<process name>, <code>, on the <line name> line" (several lines: "on
  the A and B lines").
- Connection `aria-label`: "Interface between <A name> and <B name>, <line name> line" or
  "Interface between <A name> and <B name>, transfer between lines".
- The selected item gets `aria-current="true"`; it and what it connects to keep full strength
  while everything else fades, and the selected station or connection shows a soft halo in
  its own colour (a translucent disc behind the station; a translucent wide stroke under the
  connection). Strokes never change width, so lines never overlap when selected.
- A selected connection carries moving markers (SVG `animateMotion` along the route, three
  per direction, ~70 px/s) in the direction of each flow; the route is reversed for the
  second direction. Hidden under `prefers-reduced-motion: reduce`.
- The frame is `<section aria-labelledby="panel-title">`. After a selection, focus moves to
  the new heading (`tabindex="-1"`), which announces it and puts keyboard users in the frame;
  on the first route and on a load error, where stealing focus would be wrong, the heading's
  text goes to a small visually hidden `aria-live="polite"` status line instead, so the
  heading is announced exactly once. `document.title` follows the selection.
- Lines are told apart by name: the legend (name + swatch + "study aid") and the frame's
  wording; nothing on the map relies on reading a line's name. The transfer style is a thinner solid grey stroke, so width
  differs as well as colour. Connections never share a segment; at crossings the later-drawn
  connection yields: it stops short of the other with a short perpendicular tick at each end
  and resumes beyond it, so the crossing line stays unbroken.
- `check.js` computes WCAG 2.1 contrast: each line colour and the transfer colour against the
  map background ≥ 3:1; label text ≥ 4.5:1.
- Focus is visible on every link (`:focus-visible` outline, 3 px, ≥ 3:1 against white).
- Tab order follows DOM order: header, map connections, map stations, legend, frame.

**Rationale**: FR-006, FR-007, FR-007b, FR-033, SC-008.

**Alternatives considered**: an accessibility library as a dependency. Rejected.

## R11. Editions side by side (new; resolves analysis C1)

**Decision**: `content/editions.json` lists every edition present (`id`, `label`, `path`) and
names the `current` one. Each edition lives in its own directory, `content/<id>/`, holding the
eight content files. The page loads `editions.json`, then the current edition's files.
`check.js` checks every listed edition (or one directory given with `--content`). Adding an
edition is adding a directory and an entry; switching the site to it is changing `current`.

**Rationale**: Constitution IV requires that a later edition, translation or part can be added
alongside the current content, not on top of it. A flat `content/` could only be replaced.
Directories give side-by-side editions (and later a translation as `fitsm-3.0-pt`) at the cost
of one extra one-line file and one extra fetch. Clarification 3 (one edition shown at a time)
is unchanged: the page shows `current` only; a switcher is a later feature.

**Alternatives considered**: flat `content/` with edition metadata only (the C1 finding);
one JSON file per edition (one huge diff target). Both rejected.
