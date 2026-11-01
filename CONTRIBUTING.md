# Contributing to Effix

Thanks for helping. Effix is small on purpose, so read [CONVENTIONS.md](CONVENTIONS.md) first.

## Setup
```bash
git clone https://github.com/asticore/effix.git
cd effix
npm install
npx playwright install chromium   # for the smoke test
```

## Workflow
```bash
npm run build   # dist/ + docs/index.html (fails over the gzip budget)
npm test        # cross-browser smoke test (chromium firefox webkit)
node tests/smoke.js chromium      # one browser
```
Open `docs/index.html` in a browser to try every feature live.

`dist/` and `docs/index.html` are generated **and committed**; CI fails if they are out of date, so run `npm run build` before you push.

## Adding a feature
1. Create `src/features/<name>.js` (default export `{ name, selector, defaults, init }`; `init` returns a cleanup).
2. Add `src/features/<name>.css` if it needs styles. Read colors through the Shine chain:
   `var(--efx-color, var(--sh-tone, var(--sh-primary, #6366f1)))`.
3. Add `src/features/<name>.meta.js` with title, group, summary, classes, options, vars and at least one example.
   The smoke test renders the first example and checks the feature starts, so make it self-contained.
4. `npm run build && npm test`.

Checklist: cleanup undoes everything · reduced motion gives a static end state · pointer effects need a fine pointer ·
content visible without JS · keyboard + ARIA for anything interactive · ≈1 KB gzip.

## Pull requests
One feature or fix per PR, with a short description and a note of the size change shown by `npm run build`.
