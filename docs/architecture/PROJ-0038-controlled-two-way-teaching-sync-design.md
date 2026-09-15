# PROJ-0038 — Controlled Two-Way Teaching Synchronization Design

Status: DESIGN BASELINE — implementation not yet deployed
Project: PROJ-0038 — DOME/OrEl ↔ Google Drive Controlled Two-Way Teaching Sync
Related: TASK-0076, TASK-0120, DIMS-STD-0005, ADR-0009
Principle: EBYC — Extend Before You Create

## 1. Decision

DIMS will support two governed teaching editing surfaces:

- Google Docs
- OrEl / DOME Content Editor backed by `public.teachings`

Synchronization is bidirectional, controlled, revision-aware, and conflict-safe.

Google Drive remains the authoritative documentary record. Supabase remains the authoritative operational/runtime representation used by DOME/YARATHĒKĒ.

The existing verified TASK-0076 Supabase → Drive path remains intact and is extended rather than replaced.

## 2. Non-negotiable safety rules

1. No blind last-write-wins.
2. If only Supabase changed since the last verified checkpoint, synchronize Supabase → Drive.
3. If only Drive changed since the last verified checkpoint, synchronize Drive → Supabase.
4. If neither changed, no-op.
5. If both changed, preserve both versions and create a conflict requiring reconciliation. Do not overwrite either side.
6. Every successful synchronization creates a new verified checkpoint.
7. One-way fallback modes must remain available without schema replacement or data migration.
8. TASK-0076 worker behavior remains backward compatible.
9. Existing teaching IDs and registered Drive file IDs remain stable.
10. TASK-0120 / DIMS-TEACH-0002 Keep The Garden is the first required regression/conflict test case.

## 3. Existing verified foundation

TASK-0076 currently provides the Supabase → Drive half:

`public.teachings` update → SQL-0013 queue row in `public.sync_log` → `TeachingArtifactSyncExtension.gs` → update/reuse governed Google Doc → reconcile `asset_registry` → read-back verification → mark queue job verified.

The worker already reuses the registered Drive artifact when a Google file ID exists and verifies content, folder, registry, and teaching identity after persistence.

This implementation is not to be recreated.

## 4. Proposed synchronization state

Add a dedicated state record per governed teaching rather than overloading `teachings`, `asset_registry`, or `sync_log`.

Proposed table: `public.teaching_sync_state`

Core fields:

- `teaching_id text primary key references public.teachings(id)`
- `drive_file_id text not null`
- `sync_mode text not null default 'bidirectional'`
  - `bidirectional`
  - `drive_to_supabase`
  - `supabase_to_drive`
  - `paused`
- `sync_status text not null default 'idle'`
  - `idle`
  - `pending_drive_to_supabase`
  - `pending_supabase_to_drive`
  - `conflict`
  - `error`
- `last_verified_supabase_hash text`
- `last_verified_drive_hash text`
- `last_verified_supabase_updated_at timestamptz`
- `last_verified_drive_modified_at timestamptz`
- `last_verified_at timestamptz`
- `last_direction text`
- `conflict_detected_at timestamptz`
- `conflict_reason text`
- `created_at timestamptz`
- `updated_at timestamptz`

The verified checkpoint consists of the known-good Supabase content fingerprint, Drive content fingerprint, revision timestamps, and artifact identity.

## 5. Content fingerprint rule

The two systems format teaching content differently, so hashes must be computed from a canonical normalized representation, not raw file bytes.

Normalization must be deterministic and versioned. At minimum:

- normalize CRLF/LF line endings
- normalize Unicode where practical
- remove platform-only control characters
- normalize trailing whitespace
- use the same teaching header/body extraction rules for every comparison

TASK-0076's existing `teachingSyncNormalizeText_()` logic should be reused or extended so the two directions do not develop competing normalization algorithms.

Store a hash of the normalized content, not the content itself, in `teaching_sync_state`.

## 6. Change-detection state machine

At each synchronization cycle:

1. Resolve teaching ID → registered Drive file ID.
2. Load current Supabase teaching content and `updated_at`.
3. Load current Drive document text and Drive modified/revision metadata.
4. Normalize both representations and compute fingerprints.
5. Compare each current fingerprint to its last verified checkpoint.

Decision table:

| Supabase changed? | Drive changed? | Action |
|---|---|---|
| No | No | No-op |
| Yes | No | Supabase → Drive |
| No | Yes | Drive → Supabase |
| Yes | Yes | Conflict — preserve both; no overwrite |

A successful one-way synchronization must read back the destination and verify equality before updating the checkpoint.

## 7. Conflict handling

When both sides differ from the last verified checkpoint:

- set `sync_status='conflict'`
- record a conflict event in `sync_log`
- preserve both current versions
- do not enqueue an automatic write in either direction
- expose enough evidence to reconcile:
  - teaching ID
  - Drive file ID
  - prior verified hashes/timestamps
  - current hashes/timestamps
  - source that detected the conflict

Conflict resolution must be explicit. Resolution choices:

- accept Drive version → write Drive → Supabase → verify → checkpoint
- accept Supabase version → write Supabase → Drive → verify → checkpoint
- manually merge → persist merged version to both → verify → checkpoint

## 8. Loop prevention

Bidirectional sync can create infinite echo loops if a write on one side immediately re-triggers the opposite direction.

Required control:

- mark synchronization-origin writes with a correlation/job identifier
- after a successful destination write, update the verified checkpoint before the next poll/trigger evaluates the same artifact
- Drive → Supabase writes must not cause SQL-0013 to blindly requeue a redundant Supabase → Drive write if the current Drive fingerprint already matches the new Supabase fingerprint

Implementation may accomplish this with checkpoint comparison rather than disabling existing triggers.

## 9. Drive → Supabase extension

The new direction should be implemented as an extension to the existing Apps Script synchronization project where possible.

Responsibilities:

- enumerate governed teaching artifacts from `asset_registry` / sync state
- read Drive content and Drive modification metadata
- compare against the last verified checkpoint
- if Drive-only change is detected, transform document content into the canonical teaching representation
- update the existing `public.teachings` row using the same teaching ID
- read back Supabase
- verify content equivalence
- update checkpoint
- log verification evidence

No new teaching row should be created merely because a registered Drive document changed.

## 10. Supabase → Drive path

TASK-0076 remains authoritative for this direction.

Required extension before production bidirectional mode:

- consult `teaching_sync_state.sync_mode`
- consult checkpoint/current Drive fingerprint before writing
- refuse to overwrite when both sides changed
- update checkpoint only after TASK-0076 read-back verification succeeds

## 11. One-way fallback modes

Fallback is a governed mode switch, not a rebuild.

### `supabase_to_drive`
OrEl/Supabase is the only active write origin. Direct Drive edits are detected but not imported automatically; they should be flagged before overwrite.

### `drive_to_supabase`
Google Docs is the only active write origin. OrEl content editing should be read-only or save-blocked while this mode is active.

### `paused`
Detect/report only. No automatic writes.

## 12. TASK-0120 acceptance role

DIMS-TEACH-0002 — Keep The Garden already represents the exact failure class the architecture is designed to prevent: Drive and Supabase content diverged after edits landed through uncertain paths.

Do not overwrite either version during design work.

Use it to prove:

1. the system detects both-side divergence;
2. neither side is overwritten;
3. a conflict record is created;
4. an explicit reconciliation can be performed;
5. both sides converge afterward;
6. a new verified checkpoint is written.

## 13. Implementation sequence

### Phase 1 — Safe infrastructure
- create `teaching_sync_state` schema and RLS
- create checkpoint helpers
- seed state only for a controlled test teaching
- no live bidirectional writes yet

### Phase 2 — Detection only
- implement Drive metadata/content fingerprint collection
- detect four state-machine outcomes
- log only; do not write
- verify with controlled artifacts and TASK-0120

### Phase 3 — Drive → Supabase write path
- enable only for controlled test teaching
- verify read-back and checkpoint update
- confirm no echo loop into redundant Supabase → Drive write

### Phase 4 — Extend TASK-0076 conflict guard
- add checkpoint/conflict awareness before Supabase → Drive persistence
- preserve all existing TASK-0076 verification gates

### Phase 5 — Controlled bidirectional pilot
- `sync_mode='bidirectional'` for test artifact(s) only
- verify Supabase-only edit
- verify Drive-only edit
- verify no-change no-op
- verify deliberate simultaneous-edit conflict
- verify one-way fallback switches

### Phase 6 — Governed rollout
- user review
- reconcile DIMS standards/ADR
- promote only after verification evidence is recorded

## 14. Acceptance criteria

PROJ-0038 is not complete until all are independently verified:

- existing TASK-0076 Supabase → Drive flow still passes
- Drive → Supabase flow passes
- no-change cycle causes no write
- Supabase-only edit converges correctly
- Drive-only edit converges correctly
- simultaneous edits produce a conflict without overwriting either side
- explicit conflict resolution converges both sides
- no synchronization echo loop occurs
- one-way fallback modes operate without schema changes
- existing teaching IDs/Drive file IDs remain stable
- TASK-0120 is reconciled and verified
- evidence links are recorded in TETELESTAI

## 15. Deployment constraint

The Apps Script source belongs in GitHub and the operational state belongs in Supabase. Deployment into the live Apps Script project remains a separate governed step because current ChatGPT and Claude tool environments do not expose direct Apps Script project/trigger deployment controls.

This constraint does not block architecture, schema, detection logic, test fixtures, or source-controlled implementation work.