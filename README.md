# DIMS — Dominion1st (Dashboard + Doctrines + Glossary + AI)

## Deployment authority
Cloudflare Workers is the primary deployment platform for DIMS / DOME.

Repository configuration:
- Worker: `dims-dashboard`
- Wrangler configuration: `wrangler.jsonc`
- Production branch: `main`
- Non-production feature branches should be verified through Cloudflare preview versions before merge.

### Cloudflare production
Production changes are promoted only after branch/PR verification. `main` is the production source of truth.

### Cloudflare previews
For non-production review, use Cloudflare Workers preview versions rather than promoting feature code to production. The intended preview command is:

`npx wrangler versions upload`

Preview verification should include desktop/mobile rendering, navigation, runtime diagnostics, and regression checks for previously verified DIMS/DOME functions.

## Netlify transition status
Netlify is retained temporarily as a secondary/fallback environment while Cloudflare preview, production deployment, rollback, and RB-001 recovery procedures are fully verified. Netlify is not the authoritative release target and should not be removed until the Cloudflare path is certified end to end.

## Publish content updates
- Doctrines: in the editor **Export JSON**, replace `teachings/teachings.json`, commit, then verify through the governed deployment path.
- Glossary: in the editor **Export JSON**, replace `glossary/glossary.json`, commit, then verify through the governed deployment path.
