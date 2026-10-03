# Contract: URL Hash Grammar

**Audience**: visitors who share links, and `src/router.js`, which parses and formats them.
Links are public once shared, so this grammar is stable: a hash that resolves today must still
resolve after a content update (FR-022, FR-023, edge case "renamed process").

## Grammar

```text
hash        = "" | "#" selection
selection   = process | general | interface | role | activity | record
process     = CODE                      ; "#ISRM"
general     = "GR"                      ; "#GR"  general requirements
interface   = CODE "-" CODE             ; "#ISRM-PM"  alphabetical order is canonical
role        = "role/" ROLE_ID           ; "#role/ISRM.manager"
activity    = "activity/" ACTIVITY_ID   ; "#activity/ISRM.A1"
record      = "record/" RECORD_ID       ; "#record/incident-record"
CODE        = [A-Z]{2,6}                ; a process code or alias
```

Matching is case-sensitive except for `CODE`, which is upper-cased before lookup so that
`#isrm` works when typed by hand.

## Resolution rules

| Hash | Result |
|---|---|
| empty or `#` | Map with nothing selected; frame shows the introduction and the edition line |
| `#GR` | General requirements view; no station highlighted |
| `#<code>` where code is a process | Process view; station highlighted |
| `#<code>` where code is in some process's `aliases` | Redirect: hash replaced with the current code (no history entry), then as above |
| `#A-B` where `A-B` is an interface id | Interface view; connection highlighted |
| `#B-A` (wrong order) | Redirect to `#A-B` (no history entry) |
| `#role/<id>`, `#activity/<id>`, `#record/<id>` that exists | That view; the owning process's station highlighted (records: no highlight) |
| anything else | Not-found view: "No item called `<hash>`" and the list of the 14 process codes as links (FR-024); nothing highlighted |

## Behaviour

- Every selectable element on the page is an `<a href="#...">` with a hash from this grammar.
  Clicking changes `location.hash`; `app.js` listens to `hashchange` and renders. There is no
  other way to change the selection, so the address always matches the view (FR-023).
- A redirect uses `history.replaceState`, so the browser back button skips it.
- The frame's back control (FR-015) calls `history.back()` when the previous history entry
  belongs to this page (`app.js` tags every entry with its depth in `history.state`). At the
  page's first entry: role or activity → its process; interface or record → `#` (nothing).
- The hash is read once on load (User Story 1, scenario 4) and on every `hashchange`.

## Router API (`src/router.js`, pure)

```js
parse(hash: string): { kind: "none"|"process"|"general"|"interface"|"role"|"activity"|"record"|"unknown", id?: string, raw: string }
format(kind: string, id?: string): string   // inverse of parse; returns "#..." or ""
canonical(parsed, model): { hash: string, redirect: boolean }   // applies alias and order rules
```

`parse` and `format` round-trip for every valid selection. `canonical` is the only function
that needs the content model (for aliases and interface ids).
