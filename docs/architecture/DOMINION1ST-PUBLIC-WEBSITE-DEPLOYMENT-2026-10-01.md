# Dominion1st.org Public Website Deployment Record

Recorded: 2026-10-01
Governance: TASK-0099; OAuth dependency TASK-0098

## Current deployment

- Public site: https://dominion1st.org/
- Privacy policy: https://dominion1st.org/privacy/
- Cloudflare Pages project: `dominion1st-public-site`
- Repository: `Faith-Man/dims-dashboard`
- Production branch: `task-0099-public-website-recovery`
- Baseline commit at successful setup: `e0f8c970844fced2b21556f92ad6c41c82e201cc`
- Framework preset: None
- Build command: blank
- Build output directory: `public-site`
- Root directory: blank
- Automatic deployments: enabled
- Pages hostname: `dominion1st-public-site.pages.dev`
- Custom domain: `dominion1st.org` (Active)

## DNS authority

- Registrar: GoDaddy
- Authoritative DNS: Cloudflare
- Nameservers:
  - `gerald.ns.cloudflare.com`
  - `maya.ns.cloudflare.com`
- Replaced GoDaddy nameservers:
  - `ns65.domaincontrol.com`
  - `ns66.domaincontrol.com`
- DNSSEC was off during migration.
- Google Workspace MX, SPF, DKIM and Google verification records were preserved.

## Architecture boundary

The Dominion1st.org public ministry website is a separate deployment from DIMS/DOME. Existing DIMS/DOME Workers are not to be repurposed for the public website.

## Reconciliation with proposed public-site ADR

The proposed ADR recorded earlier on 2026-10-01 described a promotion chain of GitHub → Netlify Preview → Cloudflare TEST → Cloudflare PRODUCTION. Actual implementation established a dedicated Cloudflare Pages project connected directly to GitHub, with `task-0099-public-website-recovery` configured as its production branch and `dominion1st.org` active.

Before ratification, reconcile the proposed ADR to the verified implementation. Do not create a competing ADR. Preserve the broader decisions that the public site is separate from DIMS/DOME, GitHub is authoritative source, Cloudflare is the production platform, and Google Workspace DNS must be preserved.

## Historical note

An earlier Cloudflare Workers Builds attempt failed during repository cloning. Cloudflare Pages Git integration is the successful public-site deployment path. Netlify remains non-authoritative and is not required in the current working production path.

## Source-of-truth placement

Per ADR-0006 / Source of Truth Hierarchy:
- Google Drive: human-readable deployment record.
- GitHub: version-controlled technical deployment record and canonical ADR when ratified.
- Supabase/TETELESTAI: operational task status, dependency, registry/decision metadata.
