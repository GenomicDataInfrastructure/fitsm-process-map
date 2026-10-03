# Contract: `scripts/check.js`

**Audience**: CI (`test.yml`, `release.yml`) and maintainers. The script is the automated half
of constitution VI and the test for FR-027 and SC-006. Revised for edition directories, the
"process on no line" rule, alias collisions and description-less interfaces.

## Invocation

```bash
node scripts/check.js [--content <dir>] [--quiet]
```

| Option | Default | Meaning |
|---|---|---|
| `--content <dir>` | none | Check one edition directory (the eight files) instead of reading an editions file |
| `--editions <file>` | `content/editions.json`, relative to the current working directory | The editions file to read; every listed edition is checked. Edition `path`s inside it resolve relative to the file's own directory. Ignored when `--content` is given |
| `--quiet` | off | Print errors and warnings only; suppress the summary line |

No dependencies beyond `node:fs`, `node:path` and `node:child_process` (for `node --check`).
Requires Node 22 or later.

## Exit codes

| Code | Meaning |
|---|---|
| 0 | No errors (warnings allowed) |
| 1 | One or more errors |
| 2 | Could not run: `editions.json` or an edition directory or file missing, or a file that is not JSON (reported before any other check) |

## Output format

One line per finding on stderr (errors and warnings), summary on stdout:

```text
error   <edition>/<file>: <item id or path>: <message>
warning <edition>/<file>: <item id or path>: <message>
<N> errors, <M> warnings, <K> items checked across <E> edition(s)
```

With `--content <dir>`, `<edition>` is the directory's base name.

Examples:

```text
error   fitsm-3.0/interfaces.json: ISRM-XYZ: process "XYZ" does not exist
error   fitsm-3.0/map.json: routes: no route for interface "CHM-RDM"
error   fitsm-3.0/map.json: lines: process "CSI" is on no line
error   fitsm-3.0/roles.json: ISRM.manager: missing source
error   fitsm-3.0/processes.json: aliases: "PM" is already a process code
error   fitsm-3.0/interfaces.json: SLM-SRM: no description and no flow
error   fitsm-3.0/map.json: lines.operations: colour #ffcc00 has contrast 1.5:1 against background (needs 3:1)
error   editions.json: current: "fitsm-4.0" is not a listed edition
error   fitsm-3.0/processes.json: ISRM.externalFlows[2]: party "PM" is a process code; move this flow to interfaces.json
error   fitsm-3.0/map.json: lines.operations: labelSide "s" is the same side as station ISRM's label
warning fitsm-3.0/map.json: lines.control: stations CSI and SRM are not connected through this line
```

Every message names the file and the item (FR-027). Messages are stable strings so that
tests can assert on them.

## Checks performed

In this order, for each edition; the script runs all checks and reports every finding rather
than stopping at the first.

1. **Editions**: `editions.json` parses; `current` is listed; every `path` exists (exit 2
   otherwise).
2. **Load**: all eight files of the edition exist and parse (exit 2 otherwise).
3. **Shape**: top-level shape of each file as in [../data-model.md](../data-model.md);
   `map.grid.unit`, `cols` and `rows` are positive integers; every role's `tasks` is an
   array (it may be empty).
4. **Ids**: unique per entity; pattern per entity; aliases match `^[A-Z]{2,6}$`, are unique
   across processes and never equal to a code.
5. **References**: every cross-reference resolves (data-model Validation summary 3).
6. **Counts**: 14 processes, 7 general groups, 14 process groups, one group per process.
7. **Completeness per process**: objective, ≥ 1 requirement, roles of kind owner, manager and
   staff, ≥ 1 activity, on ≥ 1 line. **External flows**: each entry has `direction` ∈
   `in`/`out`, non-empty `party` and `item`, a `source`, and `party` is not a process code or
   alias (a flow to a process belongs in `interfaces.json`).
8. **Sources**: every item has `source.doc` (known document) and `source.section`.
9. **Interfaces**: id alphabetical and equal to `processes` joined by `-`; no duplicate pair;
   flow endpoints within the pair and distinct; ≥ 1 description or ≥ 1 flow.
10. **Map**: station for every process and no extra; unique cells within the grid; route for
    every interface and no extra; octilinear segments; colours are `#rrggbb`; station
    `label` valid; a line's `labelSide`, if present, is valid and differs from the `label`
    side of the line's first station.
11. **Contrast**: WCAG 2.1 relative luminance and contrast ratio; each line colour and the
    transfer colour ≥ 3:1 against `background`.
12. **Line connectivity** (warning): members of each line reachable from each other through
    same-line connections.
13. **Scripts parse** (once, not per edition): `node --check` on every file in `src/` and on
    `scripts/check.js`.

## Tests

`tests/check.test.js` runs the script with `--content` against fixture directories under
`tests/fixtures/`: `valid/` (a minimal complete edition) and `broken/<case>/`, one per error
class above, asserting exit code and the exact message. Check 1 is covered by running the
script with `--editions tests/fixtures/editions/editions.json` (edition paths inside that
file resolve relative to the file's own directory). This is how SC-006 ("detects 100% of
deliberately introduced broken references") is verified.
