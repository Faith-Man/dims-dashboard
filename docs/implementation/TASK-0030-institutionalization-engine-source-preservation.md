# TASK-0030 — Institutionalization Engine Source Preservation

**Status:** Verified source preserved on governed GitHub branch.

## Purpose

Preserve the verified DIMS-v3 Institutionalization Engine and the two server-side helpers required by its certified ECCOM-001 acceptance run.

## Preserved Apps Script sources

- `enterprise/google-apps-script/InstitutionalizationEngine.gs`
- `enterprise/google-apps-script/EnterpriseWorkRegistry.gs`
- `enterprise/google-apps-script/RepositoryVerificationAndRegistration.gs`

## Verified acceptance evidence

Acceptance case: `ECCOM-001 — Dominion1st Kingdom Governance & Intelligence Framework™ — Draft v0.3`.

The controlled Apps Script run returned:

- `status = INSTITUTIONALIZED`
- existing `PROJ-0020` reused
- existing Drive acceptance artifact reused/updated
- `constitutionalStatus = PERSISTENCE_VERIFIED`
- `reusedExistingArtifact = true`
- Supabase `asset_registry` upsert returned HTTP `201`
- registration `success = true`

Acceptance asset code: `ECCOM-001-INST-ACCEPTANCE`.

Acceptance artifact Drive file ID: `18awUnoEm29UPsvoyGoIacieraw3invugkJCXjqx7fPw`.

## Security correction preserved

Both server-side Supabase write paths now obtain `SUPABASE_SERVICE_ROLE_KEY` from Apps Script Script Properties. The service-role value is not stored in GitHub.

No RLS policy was weakened and no service-role credential was committed.

## Governance

EBYC — Extend Before You Create was preserved. The existing project/task registry, RepositoryService, read-back verification, artifact routing, and `asset_registry` upsert model remain in place.

Production deployment/promotion is not part of this source-preservation task.
