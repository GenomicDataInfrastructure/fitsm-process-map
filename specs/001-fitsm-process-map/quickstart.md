# Quickstart: FitSM Process Map

How to run the site, run the automated checks, and walk through the acceptance scenarios that
need a browser. Entity rules are in [data-model.md](data-model.md); the link grammar in
[contracts/url-hash.md](contracts/url-hash.md); the check script in
[contracts/check-cli.md](contracts/check-cli.md). Revised for edition directories and the
screen-reader requirement (FR-007b).

## Prerequisites

- Node.js 22 or later (`node --version`)
- Python 3 (for the one-line static server) or any other static file server
- A current browser; for E9, VoiceOver (macOS, built in) or NVDA (Windows)
- Optional, for the licence check locally: `pipx run reuse lint` (CI runs it anyway)

No `npm install`. The repository has no dependencies.

## Run the automated checks

```bash
node scripts/check.js
```

Expected: `0 errors, 0 warnings, <K> items checked across 1 edition(s)`, exit code 0.

```bash
node --test
```

Expected: all tests pass (`router`, `graph`, `content`, `check` fixtures).

```bash
pipx run reuse lint
```

Expected: `Congratulations! Your project is compliant with version 3.3 of the REUSE
Specification :-)`.

## Serve the site

```bash
python3 -m http.server 8765
```

Open http://localhost:8765. (The Claude Code preview config `.claude/launch.json` starts the
same server under the name `fitsm-map`.) Opening `index.html` from the file system does not
work: the page fetches `content/editions.json` and `content/<edition>/*.json` over HTTP
(research R2).

## Browser scenarios

Each scenario maps to a spec acceptance scenario (US = user story). Tick each when it passes.

### US1: Explore a process

- [ ] 1.1 The map shows 14 stations, each labelled with its code only; hovering a station shows
      its full name as a tooltip. Count them against `content/fitsm-3.0/processes.json`.
- [ ] 1.2 Click **ISRM**. The frame shows code, name, objective, requirements (PR9.x), roles,
      records, activities, interfaces and, if any, "Inputs from and outputs to outside the
      processes". The ISRM station is highlighted: it keeps full colour with a soft halo,
      its connections and their far ends stay at full strength, everything else fades, and
      it carries `aria-current`.
- [ ] 1.3 Every item in the frame ends with a source line like `FitSM-1 v3.0.1 §PR9.1`.
- [ ] 1.4 Open http://localhost:8765/#CHM in a new tab. CHM is selected and its frame is open.
- [ ] 1.5 With ISRM open, click **PM**. The frame now shows PM; the highlight moved.
- [ ] 1.5a With PM open, click **PM** again. Nothing is selected: the intro view returns, the
      address has no item, and no station or connection is faded.
- [ ] 1.6 Click **General requirements** in the header. GR1–GR7 appear with sources; no station
      is highlighted; the address is `#GR`.

### US2: Explore a relationship

- [ ] 2.1 Click the connection between **ISRM** and **PM**. The frame names both processes,
      says which line it is on (or "Transfer between lines"), shows the interface
      description(s), and lists flows with direction (ISRM → PM, PM → ISRM in separate
      groups). The connection is highlighted: it keeps full colour with a soft halo along its
      length, its two stations stay at full strength, everything else fades, and small
      markers travel along it in both directions (ISRM–PM has flows both ways; a one-way
      interface such as SLM–SACM shows markers in one direction only). Address is
      `#ISRM-PM`.
- [ ] 2.2 Open an interface with two descriptions. Both show with their sources and the "more
      than one place" note.
- [ ] 2.3 Open an interface that has flows but no description (find one with
      `node -e` over `interfaces.json`, filtering `descriptions.length === 0`). The frame shows
      "FitSM-2 lists these inputs and outputs but gives no interface description" and the
      flows.
- [ ] 2.4 In the interface frame, click the **PM** name. The PM process frame opens.
- [ ] 2.5 Type `#PM-ISRM` in the address bar. It redirects to `#ISRM-PM` and the browser back
      button does not return to `#PM-ISRM`.

### US3: Roles and activities

- [ ] 3.1 In the ISRM frame, click **Process manager ISRM**. Tasks appear in two labelled
      groups: specific to ISRM, and common to every process manager. The count is shown.
- [ ] 3.2 Back in ISRM, click the first activity. Its procedure appears as numbered steps.
- [ ] 3.3 Click the frame's **Back** control. The ISRM frame returns; the map highlight is
      unchanged.
- [ ] 3.4 Open a record used by several processes (for example the configuration management
      database). The frame lists the processes, each clickable, and the "derived" label with
      its source.

### US4: Maintainability

- [ ] 4.1 Edit one requirement's text in `content/fitsm-3.0/requirements.json`, reload the
      page: the change is visible; no file outside `content/` was touched.
- [ ] 4.2 Change a `process` value in `content/fitsm-3.0/roles.json` to `"XYZ"`, run
      `node scripts/check.js`: exit code 1 and a message naming the role id and `"XYZ"`.
      Revert.
- [ ] 4.3 The page header names the edition and the footer lists the FitSM documents and
      versions with links, plus the downloads page, all from `edition.json`.
- [ ] 4.4 Add an interface without a route in `map.json`, run the checks: error names the
      interface id. Revert.
- [ ] 4.5 Copy `content/fitsm-3.0/` to `content/fitsm-test/`, add it to `editions.json`
      without changing `current`, run the checks: both editions are checked and the site is
      unchanged. Remove the copy.

### US5: Attribution and licence

- [ ] 5.1 The footer credits ITEMO e.V., names CC BY 4.0 with a link, and links to fitsm.eu.
- [ ] 5.2 `LICENSES/CC-BY-4.0.txt` exists; `README.md` states the licence for the whole
      project.
- [ ] 5.3 `pipx run reuse lint` passes.
- [ ] 5.4 Derived records, multiple descriptions, external flows and the line legend each carry
      their label or fixed wording as in contracts/content-files.md.

### Edge cases and non-functional

- [ ] E1 Open `#XYZ`: nothing selected; the frame says no item called `XYZ` and lists the 14
      codes as links.
- [ ] E2 Narrow the window below 900 px (or use the browser's phone emulation): the frame
      moves below the map; the map scrolls horizontally; nothing is cut off.
- [ ] E3 Keyboard only: press Tab from the page top; focus goes header → map connections → map
      stations → legend → frame; every focusable element shows a visible focus ring; Enter
      opens it.
- [ ] E4 A cross-line connection is a thin solid grey stroke; where connections cross, one
      stops short of the other with a tick at each end and resumes beyond it; a same-line
      connection has the line's
      colour; no line names appear on the map itself; the legend names every line and says it
      is a study aid.
- [ ] E5 Browser devtools, Network tab, reload and click through every view: every request
      goes to `localhost:8765`; none to another host (SC-011).
- [ ] E6 Devtools, Network, set "Offline" after load: clicking stations and connections still
      works (all content is already in memory).
- [ ] E7 Devtools, Lighthouse or the accessibility panel: no contrast failures (SC-008). The
      same is enforced by `check.js` for map colours.
- [ ] E8 Performance: with devtools throttled to "Fast 3G", the map and frame are usable within
      2 s (SC-004); total transfer under 400 KB.
- [ ] E9 Screen reader (FR-007b): with VoiceOver or NVDA, entering the map reads "Map of the 14
      FitSM processes and their interfaces"; each station reads "<name>, <code>, on the <line>
      line"; each connection reads "Interface between <A> and <B>, <line> line" or "…, transfer
      between lines"; activating one announces the frame's new heading.
- [ ] E10 Stop the server, reload: the frame shows "Could not load content/editions.json" and no
      map is drawn (then restart the server).

## CI

Push a branch and open a pull request. `Run Tests` must be green: REUSE lint, `check.js`,
`node --test`. Merging to `main` runs `Publish main`, which deploys to GitHub Pages. Tagging
`vX.Y.Z` runs `Publish release`, which attaches a zip of the site to a GitHub release.
