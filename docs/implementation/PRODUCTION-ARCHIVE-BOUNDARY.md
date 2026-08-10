# Production / Archive Boundary

**Status:** Phase 1A repository foundation; not deployed

`dist/` is the sole proposed static deployment artifact. `scripts/build-production.mjs` deletes and recreates it from an explicit runtime allowlist. Netlify and Wrangler now point at `dist/`, rather than the repository root.

The allowlist excludes ZIP files, `docs/` (including audits and historical evidence), `supabase/`, test pages, enterprise metadata exports, backup payloads, and obsolete/superseded HTML variants by default. Adding a runtime file therefore requires an intentional source review and allowlist change. Netlify Functions remain separately bundled from `netlify/functions/`; secrets are not copied into `dist/`.

This boundary does not identify the authoritative production platform, deploy anything, or prove every allowlisted legacy page is a future canonical route. Netlify-versus-Cloudflare authority and the final unified DOME application shell remain human decisions.
