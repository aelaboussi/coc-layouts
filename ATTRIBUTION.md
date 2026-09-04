# Data attribution

`data/coc-bases-source.json` is copied verbatim from the
[nschmeller/clash-bases](https://github.com/nschmeller/clash-bases) project,
licensed **MIT**. It aggregates 5,162 community base layouts (Town Hall
4–18), each pointing to a real in-game share link
(`link.clashofclans.com/...OpenLayout...`) and a preview image.

Individual entries carry their own `builder` attribution back to the
original source that layout was collected from — e.g. `cocbases.com`,
`isabelle1309/COCBaseShowcase`, `saadahmed0147/coc_bases`,
`tonykslee/ClashCookies`. That attribution is preserved and surfaced on every
base's detail page in this app.

This is an unofficial fan project. It is not affiliated with, endorsed, or
sponsored by Supercell. See Supercell's Fan Content Policy:
https://supercell.com/en/fan-content-policy/

## Coverage

The open dataset covers Town Hall 4–18 only — no Town Hall 3 and no Builder
Hall levels. The site's navigation still lists TH3 and BH3–BH10 (matching
the original product's scope) but shows an honest "no layouts yet" state for
those levels rather than fabricated content. Wire up a second data source
for those levels via the same `lib/data.ts` interface to fill them in.
