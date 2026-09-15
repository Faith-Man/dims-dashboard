/**
 * TASK-0120 — Read-only acceptance probe for controlled two-way teaching sync.
 *
 * EBYC: depends on TeachingArtifactSyncExtension.gs and
 * TeachingTwoWaySyncExtension.gs. It performs no enrollment, no patch,
 * no conflict creation, and no content write.
 *
 * First governed acceptance case:
 *   compareTeachingSyncState_("DIMS-TEACH-0002")
 */
function compareTeachingSyncState_(assetCode) {
  var state = teachingTwoWayLoadState_(assetCode);
  var drive = teachingTwoWayReadDriveState_(state.teaching, state.registry);
  var supabaseBody = teachingTwoWayExpectedBodyText_(state.teaching);
  var supabaseHash = teachingTwoWayHash_(supabaseBody);
  var bodiesMatch = drive.body_hash === supabaseHash;

  return {
    asset_code: assetCode,
    read_only: true,
    sync_mode: state.registry.sync_mode,
    conflict_status: state.registry.conflict_status,
    drive_file_id: drive.file_id,
    drive_revision_id: drive.revision_id,
    drive_body_hash: drive.body_hash,
    supabase_content_hash: supabaseHash,
    canonical_bodies_match: bodiesMatch,
    enrollment_eligible: state.registry.sync_mode === 'unenrolled' &&
      state.registry.conflict_status === 'none' && bodiesMatch,
    next_action: bodiesMatch
      ? 'canonical_match_verified_no_write'
      : 'canonical_mismatch_preserve_both_no_write',
    checked_at: new Date().toISOString()
  };
}

/**
 * Zero-argument acceptance wrapper for clasp/App Script editor execution.
 * Safe/read-only: delegates to compareTeachingSyncState_ only.
 */
function runTask0120KeepTheGardenAcceptance() {
  var result = compareTeachingSyncState_('DIMS-TEACH-0002');
  console.log(JSON.stringify(result, null, 2));
  return result;
}
