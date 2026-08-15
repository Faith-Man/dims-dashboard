# RB-001-06 — DIMS Configuration & Secrets Recovery Procedure

**Status:** Controlled recovery procedure
**Scope:** DIMS/DOME runtime configuration and credential recovery
**Control:** EBYC — extend existing configuration sources; do not create a second configuration system.

## Objective

Restore DIMS/DOME configuration safely after loss or rebuild without placing secret values in Git, recovery manifests, reports, tickets, chat, logs, or deployment artifacts.

## Recovery principle

Recover **configuration** from source-controlled definitions and provider metadata. Recover **credentials/secrets** from their approved custody source or rotate/reissue them at the provider. A secret value is never reconstructed from source code or copied into repository evidence.

## Verified repository controls

- `.gitignore` excludes `.env*` and `.dev.vars*` while permitting example files.
- The current Netlify OrAI function reads `OPENAI_API_KEY` from the runtime environment rather than embedding the value in source.
- Source-controlled platform definitions (`netlify.toml`, `_redirects`, Wrangler configuration, application files, and Git history) are configuration inputs, not secret stores.
- Publishable/browser configuration is treated separately from privileged credentials. Publishable values may be source-controlled when intentionally public; service-role keys, passwords, private API keys, shared tokens, and connection strings may not be committed.

## Configuration classes and recovery source

| Class | Examples | Authoritative recovery source | Recovery action |
|---|---|---|---|
| Source-controlled runtime configuration | Netlify build/publish settings, redirects, Wrangler worker/assets settings, application routes | Canonical GitHub repository and verified recovery bundle | Restore exact tracked files; compare commit/ref before deployment. |
| Public client configuration | Supabase project URL and publishable client key where intentionally browser-exposed | Supabase project metadata / canonical application configuration | Re-read current provider metadata and update only if the canonical value has changed. |
| Privileged API secrets | `OPENAI_API_KEY` and any future private provider key | Approved provider account plus approved secret custody mechanism | Retrieve through approved secret manager if available; otherwise rotate/reissue at provider, then inject into runtime. Never record the value in recovery evidence. |
| Optional shared/application secrets | e.g. a configured shared runtime token | Approved secret custody mechanism or provider rotation path | Restore from approved custody or replace with a newly generated value and update all authorized consumers. |
| Database privileged credentials | database password, service-role key, direct connection credentials | Supabase/provider administration and approved secret custody | Rotate/reissue if custody cannot restore it; inject only into authorized server/runtime tooling. Never place in browser code. |
| Platform deployment credentials | Cloudflare/Netlify access tokens, deploy keys, webhook secrets | Provider account / approved secret custody | Reissue or rotate, then reconnect only the approved deployment integration. |

## Recovery sequence

1. **Freeze and identify the recovery baseline.** Record repository, branch/commit, environment name, Supabase project ref, Cloudflare/Netlify site or worker identity, and incident/recovery owner. Do not record secret values.
2. **Restore non-secret configuration first.** Restore the verified Git repository/bundle and compare tracked configuration files with the intended baseline.
3. **Inventory required secret names only.** Derive names from source references and provider configuration metadata. Record only name, purpose, platform, custodian/status, and whether rotation is required.
4. **Recover through approved custody.** If an approved secret manager/custody source contains the credential, inject it directly into the target runtime without displaying or persisting the value in recovery evidence.
5. **Rotate when custody is unavailable or uncertain.** Reissue the credential at the authoritative provider, revoke the superseded credential where appropriate, and update authorized consumers. Do not attempt to infer or recover unknown values from code, backups, logs, or chat.
6. **Inject by platform controls.** Configure the secret using the provider's protected environment/secret mechanism. Never place privileged values in static assets, `dist/`, Git-tracked files, browser JavaScript, reports, or manifests.
7. **Verify without disclosure.** Confirm that each required secret name is present/configured and that the dependent service passes a minimally scoped functional or health check. Evidence records PASS/FAIL, timestamp, platform, and credential version/rotation event identifier where available — never the value.
8. **Close the recovery event.** Record configuration commit/ref, secret names restored or rotated, custodian, verification result, exceptions, and next rotation/review date. Preserve only redacted metadata.

## Secret-name evidence rules

Allowed evidence:

- variable/secret **name**;
- platform/environment;
- purpose;
- custodian or responsible role;
- configured / missing / rotated status;
- provider-side version or rotation event identifier when safe;
- verification timestamp and result.

Prohibited evidence:

- passwords;
- API key values;
- service-role key values;
- tokens or bearer strings;
- database connection strings containing credentials;
- private keys;
- webhook signing secrets;
- plaintext `.env` / `.dev.vars` contents.

## Current verified minimum inventory

| Name / class | Classification | Current evidence | Recovery rule |
|---|---|---|---|
| `OPENAI_API_KEY` | Privileged secret | Referenced by current Netlify function through `process.env` | Restore from approved custody or rotate/reissue through OpenAI; inject into authorized runtime only. |
| Supabase browser project configuration | Public client configuration | Current application uses browser-facing Supabase configuration | Re-read from the authoritative Supabase project; do not confuse publishable configuration with privileged database/service-role credentials. |
| Cloudflare / Netlify deployment credentials | Privileged platform secrets | Values are not required in repository recovery evidence | Recover/rotate through the provider and approved custody when reconstruction is performed. |
| Supabase privileged database/service credentials | Privileged secret | Not present in this repository procedure and must remain undisclosed | Recover/rotate through Supabase/provider controls and approved custody only. |

This inventory is intentionally **name/class only**. Platform-specific secret-name inventories may be appended from authorized read-only provider metadata, but values must never be copied into this document.

## Verification checklist

A configuration/secret recovery is considered successful only when all applicable conditions are met:

- tracked non-secret configuration matches the selected recovery baseline;
- required secret names are present in the correct target platform/environment;
- missing or uncertain secrets have been rotated/reissued rather than guessed;
- no privileged value exists in Git, static deployment output, recovery reports, manifests, chat, or logs;
- dependent health/function checks succeed without exposing values;
- recovery/rotation metadata and responsible custodian are recorded;
- production changes, if any, are separately authorized under the applicable recovery/change-control procedure.

## Relationship to other RB-001 controls

- **RB-001-03** proves Supabase backup/restore; this procedure does not claim database restorability.
- **RB-001-04 / 05** prove Cloudflare and Netlify reconstruction; this procedure defines how their secrets are handled during that work.
- **RB-001-09** proves full-system restoration and must confirm configuration linkage without revealing credentials.
- **RB-001-10** may record names/status/checksums for non-secret evidence but must not contain credential values.

## Certification boundary

RB-001-06 certifies that DIMS has a controlled, non-secret-bearing procedure for recovering configuration and credentials. It does **not** certify that every provider credential has been escrowed or that every platform has already been reconstructed. Provider-specific reconstruction remains governed by the corresponding RB-001 task.
