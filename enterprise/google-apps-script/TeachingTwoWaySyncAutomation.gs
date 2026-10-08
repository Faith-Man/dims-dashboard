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

/**
 * PROJ-0015 — URL Fetch quota recovery.
 *
 * Root cause (2026-10-08): every 5 minutes this watcher fully re-compared
 * up to 25 teachings, each costing 2 Supabase reads + 1 Docs API read even
 * when nothing had changed (~77 URL fetches per run, ~22,000 per day),
 * which exhausted the daily urlfetch quota.
 *
 * Each run now:
 *   1. skips while a quota pause is active, and never overlaps itself;
 *   2. loads every candidate's registry row and Supabase body in two
 *      requests (bulk), instead of per teaching;
 *   3. runs the existing full comparison only for teachings whose Drive
 *      modified time, Supabase body hash or registry baseline differs from
 *      the last settled check (a Drive metadata read, not a URL fetch);
 *   4. caps full comparisons at `limit`; anything over the cap or cut off
 *      by quota exhaustion is untouched and picked up on the next run.
 *
 * Comparison, conflict gates, pre-write revalidation and post-write
 * verification are unchanged.
 */
var TEACHING_TWO_WAY_GATE_PREFIX = 'TEACHING_TWO_WAY_GATE_';

function processAutomaticTeachingTwoWaySync(limit) {
  limit = (typeof limit === 'number' || typeof limit === 'string') ? Number(limit) : 25;
  if (!isFinite(limit) || limit < 1) limit = 25;
  limit = Math.floor(limit);

  var pausedUntil = teachingSyncQuotaPausedUntil_();
  if (pausedUntil) {
    return { processed: 0, skipped: 'quota_paused', resume_after: new Date(pausedUntil).toISOString() };
  }
  var lease = teachingSyncAcquireLease_('TWO_WAY', 7 * 60 * 1000);
  if (!lease) return { processed: 0, skipped: 'previous_run_still_active' };

  try {
    return runAutomaticTeachingTwoWaySync_(limit);
  } catch (err) {
    if (teachingSyncIsQuotaError_(err)) {
      return { processed: 0, skipped: 'quota_exhausted', resume_after: new Date(teachingSyncPauseForQuota_(err)).toISOString() };
    }
    throw err;
  } finally {
    teachingSyncReleaseLease_(lease);
  }
}

function runAutomaticTeachingTwoWaySync_(limit) {
  // Unenrolled candidates are still always prioritized so newly
  // institutionalized teachings are never starved by settled ones.
  var rows = fetchTeachingTwoWayAutomationCandidates_();
  rows.sort(function(a, b) {
    return (a.sync_mode === 'unenrolled' ? 0 : 1) - (b.sync_mode === 'unenrolled' ? 0 : 1);
  });
  var bodyHashes = fetchTeachingTwoWaySupabaseHashes_(rows.map(function(row) { return row.asset_code; }));

  var props = PropertiesService.getScriptProperties();
  var storedGates = props.getProperties();
  var results = [];
  var unchanged = 0;
  var deferred = 0;
  var fullChecks = 0;

  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];

    // Conflicted rows are paused without any request, exactly as before.
    if (row.conflict_status && row.conflict_status !== 'none') {
      results.push(processOneAutomaticTeachingTwoWaySync_(row));
      continue;
    }

    var gate = teachingTwoWayGateSignature_(row, bodyHashes[row.asset_code]);
    if (gate && storedGates[TEACHING_TWO_WAY_GATE_PREFIX + row.asset_code] === gate) {
      unchanged++;
      continue;
    }

    if (fullChecks >= limit) {
      deferred++;
      continue;
    }
    fullChecks++;

    var result;
    try {
      result = processOneAutomaticTeachingTwoWaySync_(row);
    } catch (err) {
      if (teachingSyncIsQuotaError_(err)) {
        var resumeAfter = teachingSyncPauseForQuota_(err);
        results.push({ asset_code: row.asset_code, action: 'interrupted_quota', synchronized: false });
        return teachingTwoWayAutomationSummary_(results, unchanged, deferred + (rows.length - i - 1), {
          stopped: 'quota_exhausted',
          resume_after: new Date(resumeAfter).toISOString()
        });
      }
      result = {
        asset_code: row.asset_code,
        action: 'error',
        synchronized: false,
        error: String(err && err.message ? err.message : err)
      };
    }
    results.push(result);

    // Only a settled, write-free outcome may be skipped next time. Anything
    // that wrote or advanced the baseline gets one more full check, which
    // then settles as no_op.
    if (gate && (result.action === 'no_op' || result.action === 'unenrolled_canonical_mismatch_review_required')) {
      props.setProperty(TEACHING_TWO_WAY_GATE_PREFIX + row.asset_code, gate);
    }
  }

  return teachingTwoWayAutomationSummary_(results, unchanged, deferred, null);
}

function teachingTwoWayAutomationSummary_(results, unchanged, deferred, extra) {
  var summary = { processed: results.length, unchanged_skipped: unchanged, deferred: deferred, results: results };
  if (extra) Object.keys(extra).forEach(function(k) { summary[k] = extra[k]; });
  return summary;
}

/**
 * Everything a settled comparison depended on. Returns null (forcing a full
 * check) whenever an input cannot be read cheaply.
 */
function teachingTwoWayGateSignature_(row, supabaseHash) {
  if (!supabaseHash) return null;
  var fileId = extractTeachingGoogleFileId_(row.url);
  if (!fileId) return null;

  var driveModified;
  try {
    driveModified = DriveApp.getFileById(fileId).getLastUpdated().getTime();
  } catch (err) {
    return null;
  }

  return [
    driveModified,
    supabaseHash,
    row.sync_mode || 'unenrolled',
    row.drive_revision_id || '',
    row.drive_body_hash || '',
    row.supabase_content_hash || ''
  ].join('|');
}

function fetchTeachingTwoWayAutomationCandidates_() {
  var registryResult = teachingSyncRequest_(
    'asset_registry', 'get', null,
    'system_area=eq.' + encodeURIComponent('Teaching / YARATHĒKĒ') +
      '&status=eq.institutionalized' +
      '&order=updated_at.asc&limit=1000' +
      '&select=asset_code,sync_mode,conflict_status,url,updated_at,' +
      'drive_revision_id,drive_body_hash,supabase_content_hash'
  );
  teachingSyncRequireSuccess_(registryResult, 'Load teaching two-way automation candidates');
  return registryResult.body || [];
}

/** Supabase canonical body hash per teaching id, loaded in bulk. */
function fetchTeachingTwoWaySupabaseHashes_(assetCodes) {
  var hashes = {};
  var codes = assetCodes.filter(Boolean);
  for (var start = 0; start < codes.length; start += 100) {
    var chunk = codes.slice(start, start + 100).map(function(code) {
      return encodeURIComponent('"' + String(code).replace(/"/g, '\\"') + '"');
    });
    var result = teachingSyncRequest_(
      'teachings', 'get', null,
      'id=in.(' + chunk.join(',') + ')&select=id,content_md'
    );
    teachingSyncRequireSuccess_(result, 'Load teaching bodies for two-way automation');
    (result.body || []).forEach(function(teaching) {
      hashes[teaching.id] = teachingTwoWayHash_(teachingTwoWayExpectedBodyText_(teaching));
    });
  }
  return hashes;
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
    .everyMinutes(15)
    .create();

  var result = {
    installed: true,
    handler: handler,
    cadence: 'every_15_minutes',
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
