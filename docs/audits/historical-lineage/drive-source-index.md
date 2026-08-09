# Drive Source Index — Historical DIMS/DOME Audit

## DMS / Dominion1st Management System

- Earliest identifiable baseline: **Dominion1st Management System (DMS)**
- Drive file ID: `1RSL7RmP2ITuK8pSQoigKY9zZXJBpIbQzJCsGT1r0OGU`
- Created: 2025-08-14
- Modified: 2025-09-05
- Type: native Google Doc
- Authority note: no literal top-level Drive folder named `DMS` was resolved in the current search. Treat the DMS document and related DMS artifacts as the lineage baseline unless stronger evidence is found.

## DIMS

- A folder currently titled `DIMS` with ID `1kN8Rz7E0PYDdl2LoP8yz0DxvemIEmEP2` was resolved, but metadata traces it to:
  - parent `KUBERNĒSIS` (`1whQeyI8oqp4nBmS6rNCVWIY1Q_O9FZl0`)
  - inside `FULL_BACKUP_2026-08-05_06-33` (`1F9hWhWG2ifvgUnsJ6OJ9ZsC4pqRsSsR4`)
  - under the DIMS-v3 Backups tree.
- Therefore this `DIMS` folder is **backup evidence, not a verified original DIMS root**.
- Historical DIMS lineage should additionally use recovered DIMS launch records and DIMS_Daily_Backups evidence.

## DIMS_Daily_Backups

- Folder ID: `184ZPRbL-XR3EXgfVnX8-ifeIKM5gYlco`
- Role: historical preservation/evidence stream; not automatically production authority.

## DIMS-v3

- Current root ID: `1PMjJLQWLJqTmvQP53UBw3pyGdjhJxTtE`
- Created: 2026-06-17
- This is a verified current top-level DIMS-v3 root, distinct from dated FULL_BACKUP copies.

## DOME

- Current root ID: `1aOsFcdA-MQgrwvCezf_TAvxI2oqjMm6K`
- Created: 2026-07-30
- This is the current DOME root. Dated DIMS-v3 backups contain other copied folders named DOME/dome; those copies must not be treated as the current root.

## Interpretation rule

Build the lineage as **DMS → DIMS → DIMS-v3 → DOME**. Treat **DIMS_Daily_Backups** as a parallel preservation/evidence stream rather than another generation.
