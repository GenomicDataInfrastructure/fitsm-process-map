# Contract: link grammar changes

Extends [feature 001's link grammar](../../001-fitsm-process-map/contracts/url-hash.md).

```text
selection   = … | records
records     = "RECORDS"          ; case-insensitive, like "GR"
```

| Address | Shows | Map | Back control when entered directly |
|---|---|---|---|
| `#RECORDS` (any case) | Records overview | nothing highlighted | intro (`#`) |
| `#record/<id>` | Record view (unchanged address) | nothing highlighted | intro (`#`) |

- `#records` and other casings are canonicalised to `#RECORDS` with `history.replaceState`,
  as `#gr` is to `#GR`.
- `RECORDS` cannot be a process code or alias: those match `^[A-Z]{2,6}$` (7 letters here).
- From the overview, opening a record or process pushes a history entry, so the frame's back
  control returns to the overview (feature 001, FR-015).
- Page title: `Records – FitSM Process Map`.

`router.parse` returns `{ kind: "records", raw }`; `router.format("records")` returns
`"#RECORDS"`.
