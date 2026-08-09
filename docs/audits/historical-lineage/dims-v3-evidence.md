# DIMS-v3 Evidence Manifest

**Current root ID:** `1PMjJLQWLJqTmvQP53UBw3pyGdjhJxTtE`  
**Created:** 2026-06-17

## Verified top-level structure

Current DIMS-v3 root contains:

- `Build/`
- `Design/`
- `Deployments/`
- `Enterprise Repository/`
- `Health Reports/`
- `_SAFE_OVERWRITE_ARCHIVE/`
- `Forms/`
- `Enterprise_Forms_Package_v1/`
- `Discovery/`
- `SHAMARENE/`
- `KUBERNĒSIS/`
- `Snapshots/`
- `Checkpoints/`
- `Templates/`
- `Imports/`
- `Documents/`
- `Backups/`
- `Archives/`
- `VAULT/`
- `DDBB/`
- `MARTUREŌ/`
- `NESHAMAH/`
- `Exports/`
- `ADRs/`
- `Artifacts/`
- `Anchors/`
- `Chronicles/`

The root also contains governance/registry records such as document-governance, execution-order, approval, canonicalization, handoff-readiness, and governance-audit records.

## Institutionalization evidence

DIMS-v3 materially differs from earlier DIMS because it introduced or formalized:

- enterprise repository structure;
- governance records and approval artifacts;
- ADRs and standards;
- checkpoints and snapshots;
- archives/backups/recovery structures;
- formal artifacts and anchors;
- build/design/deployment separation;
- forms and enterprise-form packages;
- health reports;
- named historical subsystems including KUBERNĒSIS, VAULT, DDBB, MARTUREŌ, NESHAMAH, and SHAMARENE.

## Important caution

The `Backups/` tree contains dated FULL_BACKUP copies of DIMS-v3, DOME, forms, architecture documents, KPR standards, health reports, and recovered records. These should not be counted as distinct canonical artifacts merely because they are newer copies.

## Audit questions specific to DIMS-v3

1. Which governance structures are genuinely mature and should become services or administration features in the DOME app?
2. Which repository structures are still required if Google Drive remains canonical institutional storage?
3. Which named subsystems should become workflows/capabilities under the seven canonical modules rather than competing top-level modules?
4. Which backup/recovery mechanisms are operationally valuable and should be preserved or modernized?
5. Which DIMS-v3 folders are now historical implementation scaffolding that can eventually be archived after verification?
6. Which standards/ADRs should remain governing authority for DOME?

## Recommended audit treatment

Treat the current DIMS-v3 root as a major **institutionalization generation**, while evaluating every child artifact individually for `CANONICAL CURRENT`, `CANONICAL HISTORICAL`, `EXTEND / MIGRATE`, `REFERENCE ONLY`, `BACKUP COPY`, `DUPLICATE`, `SUPERSEDED`, or `REQUIRES HUMAN DECISION`.
