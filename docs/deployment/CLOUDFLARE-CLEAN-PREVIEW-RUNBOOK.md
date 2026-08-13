# Cloudflare Clean Preview Runbook

Purpose: verify the current `feature/dscc-orbital-intelligence` source in an isolated Cloudflare preview before any production promotion.

## Preconditions

- Work from a fresh clone/checkout of `Faith-Man/dims-dashboard`.
- Checkout `feature/dscc-orbital-intelligence`.
- Do not reuse a stale local deployment directory.
- Do not promote or roll back `dome-dashboard` or `dims-dashboard` during this verification.
- Confirm `yaratheke.html` contains `categoryFilter`, the four sort options (`library`, `newest`, `oldest`, `title`), `teaching-date`, and the Dominion blue hero gradient.
- Confirm `system-health.html` is the current DSCC branch version.

## Clean-source verification

```bash
git clone https://github.com/Faith-Man/dims-dashboard.git dims-dashboard-clean
cd dims-dashboard-clean
git fetch --all --prune
git checkout feature/dscc-orbital-intelligence
git status --short
git rev-parse HEAD
grep -n "categoryFilter" yaratheke.html
grep -n "Teaching Date — Newest" yaratheke.html
grep -n "DOME SYSTEM COMMAND CENTER" system-health.html
```

`git status --short` must be empty before upload.

## Isolated Cloudflare preview

Use a non-production Worker name. Do not deploy directly to `dome-dashboard` or `dims-dashboard` during verification.

Create a temporary preview config locally:

```json
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "dims-dashboard-preview",
  "compatibility_date": "2026-07-23",
  "observability": { "enabled": true },
  "assets": { "directory": "." },
  "compatibility_flags": ["nodejs_compat"]
}
```

Then upload a preview version from the clean checkout:

```bash
npx wrangler versions upload --config wrangler.preview.jsonc
```

Do not promote the preview to production traffic.

## Verification checklist

Desktop and mobile must verify:

- YARATHĒKĒ loads all expected teachings.
- Category headings appear.
- Category filter dropdown appears and filters correctly.
- Sort choices work: Category / Series / Title; Teaching Date — Newest; Teaching Date — Oldest; Title A–Z.
- Teaching dates render on entries.
- Dominion blue Reader styling is present.
- Reader document/listen controls remain functional.
- DSCC renders the current DOME System Command Center branch design and orbital interaction.

## Promotion gate

Only after preview verification succeeds should an exact tested source commit be considered for production deployment. Preserve both current Cloudflare Worker histories until the production role of `dome-dashboard` and `dims-dashboard` is formally resolved.
