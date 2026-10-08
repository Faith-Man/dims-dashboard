/**
 * ==========================================================
 * TeachingTwoWaySyncAutomation.gs
 * DIMS — Automatic enrollment + two-way teaching sync watcher
 * PROJ-0038 / TASK-0120
 * ==========================================================
 *
 * EBYC: extends TeachingArtifactSyncExtension.gs and
 * TeachingTwoWaySyncExtension.gs. It does not replace either engine.
 *
 * PURPOSE
 * -------
 * Remove teaching-specific enrollment/sync runners from normal operations.
 * New verified teaching artifacts are enrolled automatically once their
 * canonical Google Doc and Supabase bodies match. Enrolled teachings are
 * then compared and synchronized through the already-proven TASK-0120
 * directional executors.
 *
 * SAFETY
 * ------
 * - Unenrolled mismatches are NOT auto-enrolled and neither side is changed.
 * - Existing conflict gates remain authoritative.
 * - Directional writes still pass TASK-0120's pre-write revalidation.
 * - No new document is created here.
 */

function processAutomaticTeachingTwoWaySync(limit) {
  limit = (typeof limit === 'number' || typeof limit === 'string') ? Number(limit) : 25;
  if (!isFinite(limit) || limit < 1) limit = 25;
  limit = Math.floor(limit);

  // Unenrolled candidates are fetched first and always prioritized. A
  // teaching that is already synced never advances its own updated_at on a
  // clean no_op pass, so a single updated_at-ordered query would let
  // long-settled teachings permanently occupy the batch and starve newly
  // institutionalized (but still unenrolled) teachings out of ever being
  // picked up once the total teaching count exceeds `limit`.
  var rows = fetchTeachingTwoWayAutomationCandidates_('sync_mode=eq.unenrolled', limit);
  if (rows.length < limit) {
    var enrolledRows = fetchTeachingTwoWayAutomationCandidates_('sync_mode=neq.unenrolled', limit - rows.length);
    rows = rows.concat(enrolledRows);
  }

  var results = [];
  rows.forEach(function(row) {
    try {
      results.push(processOneAutomaticTeachingTwoWaySync_(row));
    } catch (err) {
      results.push({
        asset_code: row.asset_code,
        action: 'error',
        synchronized: false,
        error: String(err && err.message ? err.message : err)
      });
    }
  });

  return { processed: results.length, results: results };
}

function fetchTeachingTwoWayAutomationCandidates_(filter, limit) {
  var registryResult = teachingSyncRequest_(
    'asset_registry', 'get', null,
    'system_area=eq.' + encodeURIComponent('Teaching / YARATHĒKĒ') +
      '&status=eq.institutionalized' +
      '&' + filter +
      '&order=updated_at.asc&limit=' + limit +
      '&select=asset_code,sync_mode,conflict_status,url,updated_at'
  );
  teachingSyncRequireSuccess_(registryResult, 'Load teaching two-way automation candidates (' + filter + ')');
  return registryResult.body || [];
}

function processOneAutomaticTeachingTwoWaySync_(registryRow) {
  var assetCode = registryRow.asset_code;
  if (!assetCode) return { action: 'skip_missing_asset_code', synchronized: false };

  if (registryRow.conflict_status && registryRow.conflict_status !== 'none') {
    return {
      asset_code: assetCode,
      action: 'paused_for_conflict',
      conflict_status: registryRow.conflict_status,
      synchronized: false
    };
  }

  if (!registryRow.sync_mode || registryRow.sync_mode === 'unenrolled') {
    return teachingTwoWayAutoEnrollIfCanonicalMatch_(assetCode);
  }

  var comparison = teachingTwoWayCompare_(assetCode);
  if (comparison.action === 'drive_to_supabase_required') {
    return teachingTwoWaySyncDriveToSupabase_(assetCode);
  }
  if (comparison.action === 'supabase_to_drive_required') {
    return teachingTwoWaySyncSupabaseToDrive_(assetCode);
  }
  return comparison;
}

function teachingTwoWayAutoEnrollIfCanonicalMatch_(assetCode) {
  var state = teachingTwoWayLoadState_(assetCode);
  var drive = teachingTwoWayReadDriveState_(state.teaching, state.registry);
  var supabaseBody = teachingTwoWayExpectedBodyText_(state.teaching);
  var supabaseHash = teachingTwoWayHash_(supabaseBody);

  if (drive.body_hash !== supabaseHash) {
    return {
      asset_code: assetCode,
      action: 'unenrolled_canonical_mismatch_review_required',
      enrolled: false,
      synchronized: false,
      // Deliberately do not call teachingTwoWayEnroll_ here because that
      // function correctly flags a mismatch as a conflict for interactive
      // enrollment. The automatic watcher must preserve both sides and wait.
      drive_revision_id: drive.revision_id,
      drive_body_hash: drive.body_hash,
      supabase_content_hash: supabaseHash
    };
  }

  var enrollment = teachingTwoWayEnroll_(assetCode, 'two_way');
  enrollment.action = 'auto_enrolled_two_way';
  enrollment.synchronized = false;
  return enrollment;
}

/**
 * One-time installer for the AUTOMATION itself — not per teaching.
 * Safe to rerun: it removes only prior triggers targeting the same handler.
 * Normal teaching operations require no manual enrollment function.
 */
function installAutomaticTeachingTwoWaySyncTrigger() {
  var handler = 'processAutomaticTeachingTwoWaySync';
  ScriptApp.getProjectTriggers().forEach(function(trigger) {
    if (trigger.getHandlerFunction() === handler) ScriptApp.deleteTrigger(trigger);
  });

  var trigger = ScriptApp.newTrigger(handler)
    .timeBased()
    .everyMinutes(5)
    .create();

  var result = {
    installed: true,
    handler: handler,
    cadence: 'every_5_minutes',
    trigger_id: trigger.getUniqueId()
  };
  console.log(JSON.stringify(result, null, 2));
  return result;
}

function verifyAutomaticTeachingTwoWaySyncTrigger() {
  var handler = 'processAutomaticTeachingTwoWaySync';
  var matches = ScriptApp.getProjectTriggers().filter(function(trigger) {
    return trigger.getHandlerFunction() === handler;
  });
  var result = {
    handler: handler,
    installed: matches.length > 0,
    trigger_count: matches.length,
    trigger_ids: matches.map(function(trigger) { return trigger.getUniqueId(); })
  };
  console.log(JSON.stringify(result, null, 2));
  return result;
}
