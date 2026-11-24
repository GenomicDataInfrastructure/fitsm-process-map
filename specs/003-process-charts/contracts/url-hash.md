# Contract: link grammar changes

Extends the link grammar of features [001](../../001-fitsm-process-map/contracts/url-hash.md)
and [002](../../002-fitsm-records/contracts/url-hash.md).

```text
selection   = … | chart
chart       = "chart/" CODE      ; process code or alias, any case: "#chart/PM", "#chart/pm"
```

| Address | Shows | Map | Back control when entered directly |
|---|---|---|---|
| `#chart/<code>` | Wide chart view: chart across the map's area, text version beside it | hidden (chart mode); the process's station stays selected for when it returns | the process view `#<code>` |

- `#chart/pm` and aliases are canonicalised to `#chart/PM` with `history.replaceState`.
- An unknown code, or a process without a chart, shows the not-found view.
- From the wide view, links to activities, records and interfaces push history; back returns
  to the chart. The header's "Map" link (`#`) leaves chart mode.
- Page title: `<Process name> chart – FitSM Process Map`.

`router.parse` returns `{ kind: "chart", id, raw }`; `router.format("chart", "PM")` returns
`"#chart/PM"`.
