-- Phase 1A dependency marker only. This file intentionally changes no objects.
-- The 2026-08-09 evidence capture is insufficient to reconstruct exact DDL.
-- Required input: reviewed schema-only dump, owners/extensions, full grants,
-- function and trigger definitions, policies, and a verified restore rehearsal.
select 'DIMS baseline reconstruction pending verified DDL export' as migration_notice;
