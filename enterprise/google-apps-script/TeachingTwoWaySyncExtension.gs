/**
 * ==========================================================
 * TeachingTwoWaySyncExtension.gs
 * DIMS — Controlled Google Docs <-> Supabase Teaching Sync
 * PROJ-0038 / TASK-0120
 * ==========================================================
 *
 * EBYC: extends TeachingArtifactSyncExtension.gs. It does not replace
 * TASK-0076 or alter its queue/worker path.
 *
 * SAFETY:
 * - unenrolled assets never synchronize automatically;
 * - enrollment establishes a baseline only when canonical bodies match;
 * - divergent bodies are preserved before reconciliation;
 * - comparison functions return required actions; they do not overwrite
 *   either Google Docs or Supabase content.
 */

function teachingTwoWayEnroll_(assetCode, requestedMode) {
  requestedMode = requestedMode || 'two_way';
  teachingTwoWayRequireMode_(requestedMode, false);

  var state = teachingTwoWayLoadState_(assetCode);
  if (state.registry.sync_mode !== 'unenrolled') {
    throw new Error('Asset is already enrolled: ' + assetCode + ' (' + state.registry.sync_mode + ')');
  }

  var drive = teachingTwoWayReadDriveState_(state.teaching, state.registry);
  var supabaseBody = teachingTwoWayExpectedBodyText_(state.teaching);
  var supabaseHash = teachingTwoWayHash_(supabaseBody);

  if (drive.body_hash !== supabaseHash) {
    var conflictId = teachingTwoWayFlagConflict_(state, drive, supabaseBody, supabaseHash, 'initial_enrollment_mismatch');
    return {
      asset_code: assetCode,
      enrolled: false,
      conflict: true,
      conflict_id: conflictId,
      reason: 'Canonical bodies differ. Neither side was overwritten.'
    };
  }

  var now = new Date().toISOString();
  teachingTwoWayPatchRegistry_(assetCode, {
    drive_revision_id: drive.revision_id,
    drive_body_hash: drive.body_hash,
    supabase_content_hash: supabaseHash,
    last_verified_sync_at: now,
    sync_mode: requestedMode,
    conflict_status: 'none',
    updated_at: now
  });

  return {
    asset_code: assetCode,
    enrolled: true,
    sync_mode: requestedMode,
    drive_revision_id: drive.revision_id,
    body_hash: supabaseHash,
    baseline_at: now
  };
}

function teachingTwoWayCompare_(assetCode) {
  var state = teachingTwoWayLoadState_(assetCode);
  var registry = state.registry;

  if (registry.sync_mode === 'unenrolled') {
    return { asset_code: assetCode, action: 'unenrolled', synchronized: false };
  }
  teachingTwoWayRequireMode_(registry.sync_mode, false);

  if (registry.conflict_status === 'flagged' || registry.conflict_status === 'reconciling') {
    return {
      asset_code: assetCode,
      action: 'paused_for_conflict',
      conflict_status: registry.conflict_status,
      synchronized: false
    };
  }

  var supabaseBody = teachingTwoWayExpectedBodyText_(state.teaching);
  var supabaseHash = teachingTwoWayHash_(supabaseBody);
  var supabaseChanged = supabaseHash !== registry.supabase_content_hash;
  var currentRevision = teachingTwoWayDriveRevisionId_(registry);
  var driveRevisionChanged = currentRevision !== registry.drive_revision_id;

  if (!driveRevisionChanged) {
    if (!supabaseChanged) {
      return { asset_code: assetCode, action: 'no_op', synchronized: false };
    }
    return teachingTwoWayDirectionalResult_(registry.sync_mode, 'supabase_to_drive', assetCode, {
      supabase_content_hash: supabaseHash,
      drive_revision_id: currentRevision
    });
  }

  var drive = teachingTwoWayReadDriveState_(state.teaching, registry, currentRevision);
  var driveChanged = drive.body_hash !== registry.drive_body_hash;

  if (!driveChanged && !supabaseChanged) {
    teachingTwoWayPatchRegistry_(assetCode, {
      drive_revision_id: drive.revision_id,
      updated_at: new Date().toISOString()
    });
    return { asset_code: assetCode, action: 'revision_only_no_op', synchronized: false };
  }

  if (driveChanged && supabaseChanged) {
    var conflictId = teachingTwoWayFlagConflict_(state, drive, supabaseBody, supabaseHash, 'both_bodies_changed');
    return {
      asset_code: assetCode,
      action: 'conflict_flagged',
      conflict_id: conflictId,
      synchronized: false
    };
  }

  if (driveChanged) {
    return teachingTwoWayDirectionalResult_(registry.sync_mode, 'drive_to_supabase', assetCode, {
      drive_revision_id: drive.revision_id,
      drive_body_hash: drive.body_hash,
      supabase_content_hash: supabaseHash
    });
  }

  return teachingTwoWayDirectionalResult_(registry.sync_mode, 'supabase_to_drive', assetCode, {
    drive_revision_id: drive.revision_id,
    drive_body_hash: drive.body_hash,
    supabase_content_hash: supabaseHash
  });
}

function teachingTwoWayDirectionalResult_(mode, direction, assetCode, evidence) {
  var allowed = mode === 'two_way' || mode === direction + '_only';
  return {
    asset_code: assetCode,
    action: allowed ? direction + '_required' : direction + '_blocked_by_mode',
    allowed: allowed,
    synchronized: false,
    evidence: evidence
  };
}

function teachingTwoWayLoadState_(assetCode) {
  var teachingResult = teachingSyncRequest_(
    'teachings', 'get', null,
    'id=eq.' + encodeURIComponent(assetCode) + '&limit=1&select=*'
  );
  teachingSyncRequireSuccess_(teachingResult, 'Load teaching ' + assetCode);
  var teachings = teachingResult.body || [];
  if (!teachings.length) throw new Error('Teaching not found: ' + assetCode);

  var registryResult = teachingSyncRequest_(
    'asset_registry', 'get', null,
    'asset_code=eq.' + encodeURIComponent(assetCode) + '&limit=1&select=*'
  );
  teachingSyncRequireSuccess_(registryResult, 'Load asset registry ' + assetCode);
  var registryRows = registryResult.body || [];
  if (!registryRows.length) throw new Error('Asset registry record not found: ' + assetCode);

  return { teaching: teachings[0], registry: registryRows[0] };
}

function teachingTwoWayReadDriveState_(teaching, registry, knownRevision) {
  var fileId = extractTeachingGoogleFileId_(registry.url);
  if (!fileId) throw new Error('Registered Google Doc URL is missing/invalid for ' + teaching.id);

  var revisionId = knownRevision || teachingTwoWayDriveRevisionId_(registry);
  var doc = DocumentApp.openById(fileId);
  var bodyText = teachingTwoWayExtractBodyText_(doc, teaching);

  return {
    file_id: fileId,
    revision_id: revisionId,
    body_text: bodyText,
    body_hash: teachingTwoWayHash_(bodyText)
  };
}

function teachingTwoWayDriveRevisionId_(registry) {
  var fileId = extractTeachingGoogleFileId_(registry.url);
  if (!fileId) throw new Error('Registered Google Doc URL is missing/invalid for ' + registry.asset_code);

  var response = UrlFetchApp.fetch(
    'https://docs.googleapis.com/v1/documents/' + encodeURIComponent(fileId) + '?fields=revisionId',
    {
      method: 'get',
      headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
      muteHttpExceptions: true
    }
  );
  var code = response.getResponseCode();
  if (code < 200 || code >= 300) {
    throw new Error('Google Docs revisionId lookup failed for ' + registry.asset_code + '. HTTP ' + code);
  }
  var payload = JSON.parse(response.getContentText() || '{}');
  if (!payload.revisionId) throw new Error('Google Docs returned no revisionId for ' + registry.asset_code);
  return String(payload.revisionId);
}

function teachingTwoWayExtractBodyText_(doc, teaching) {
  var fullText = String(doc.getBody().getText() || '');
  var envelope = [
    teaching.title || 'Dominion1st Teaching',
    teachingSyncMetaText_(teaching)
  ];
  if (teaching.summary) envelope.push(teaching.summary);

  var prefix = envelope.join('\n');

  // Some existing Docs contain a single empty leading paragraph before the
  // governed teaching envelope. Treat that structural blank as outside the
  // canonical body, but do not skip arbitrary whitespace or non-empty text.
  // This preserves a deterministic boundary while accommodating the exact
  // legacy shape proven by the TASK-0120 read-only diagnostic.
  if (fullText.indexOf('\n') === 0) fullText = fullText.substring(1);

  if (fullText === prefix) return '';
  if (fullText.indexOf(prefix + '\n') !== 0) {
    throw new Error(
      'Teaching envelope mismatch for ' + teaching.id +
      '; body boundary cannot be established safely.'
    );
  }
  return fullText.substring(prefix.length + 1);
}

function teachingTwoWayExpectedBodyText_(teaching) {
  var lines = [];
  String(teaching.content_md || '').split(/\r?\n/).forEach(function(raw) {
    var line = raw.trim();
    if (!line) {
      lines.push('');
      return;
    }
    line = line
      .replace(/^###\s+/, '')
      .replace(/^##\s+/, '')
      .replace(/^#\s+/, '')
      .replace(/^[-*]\s+/, '')
      .replace(/^>\s*/, '')
      .replace(/\*\*/g, '');
    lines.push(line);
  });
  return lines.join('\n');
}

function teachingTwoWayHash_(value) {
  var canonical = teachingSyncNormalizeText_(value);
  var digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    canonical,
    Utilities.Charset.UTF_8
  );
  return digest.map(function(b) {
    var n = b < 0 ? b + 256 : b;
    return ('0' + n.toString(16)).slice(-2);
  }).join('');
}

function teachingTwoWayFlagConflict_(state, drive, supabaseBody, supabaseHash, reason) {
  var now = new Date().toISOString();
  var conflictPayload = {
    asset_code: state.teaching.id,
    drive_revision_id: drive.revision_id,
    drive_body_hash: drive.body_hash,
    supabase_content_hash: supabaseHash,
    drive_body_snapshot: drive.body_text,
    supabase_body_snapshot: supabaseBody,
    status: 'flagged',
    flagged_at: now,
    resolution_notes: 'Automatically preserved by TASK-0120 comparison engine. Reason: ' + reason
  };

  var result = teachingSyncRequest_('teaching_sync_conflicts', 'post', conflictPayload, null);
  teachingSyncRequireSuccess_(result, 'Preserve teaching conflict ' + state.teaching.id);

  teachingTwoWayPatchRegistry_(state.teaching.id, {
    conflict_status: 'flagged',
    updated_at: now
  });

  var rows = result.body || [];
  return rows.length && rows[0].id ? rows[0].id : null;
}

function teachingTwoWayPatchRegistry_(assetCode, payload) {
  var result = teachingSyncRequest_(
    'asset_registry', 'patch', payload,
    'asset_code=eq.' + encodeURIComponent(assetCode)
  );
  teachingSyncRequireSuccess_(result, 'Update two-way sync state ' + assetCode);
  return result;
}

function teachingTwoWayRequireMode_(mode, allowUnenrolled) {
  var allowed = ['two_way', 'drive_to_supabase_only', 'supabase_to_drive_only'];
  if (allowUnenrolled) allowed.push('unenrolled');
  if (allowed.indexOf(mode) < 0) throw new Error('Unsupported teaching sync mode: ' + mode);
}

/**
 * ==========================================================
 * TASK-0120 — Directional synchronization executors.
 * ==========================================================
 *
 * EBYC: reuses the comparison primitives above (state loading, body
 * extraction/hashing, conflict preservation, registry patching). This does
 * not modify teachingTwoWayCompare_; it always does a full Drive body read
 * rather than teachingTwoWayCompare_'s revision-only fast path, since an
 * executor about to write needs the actual current body regardless.
 */
function teachingTwoWayEvaluateForWrite_(assetCode) {
  var state = teachingTwoWayLoadState_(assetCode);
  var registry = state.registry;

  if (registry.sync_mode === 'unenrolled') {
    return { ready: false, result: { asset_code: assetCode, action: 'unenrolled', synchronized: false } };
  }
  teachingTwoWayRequireMode_(registry.sync_mode, false);

  if (registry.conflict_status !== 'none') {
    return {
      ready: false,
      result: {
        asset_code: assetCode,
        action: 'paused_for_conflict',
        conflict_status: registry.conflict_status,
        synchronized: false
      }
    };
  }

  var supabaseBody = teachingTwoWayExpectedBodyText_(state.teaching);
  var supabaseHash = teachingTwoWayHash_(supabaseBody);
  var supabaseChanged = supabaseHash !== registry.supabase_content_hash;
  var drive = teachingTwoWayReadDriveState_(state.teaching, registry);
  var driveChanged = drive.body_hash !== registry.drive_body_hash;

  if (driveChanged && supabaseChanged) {
    var conflictId = teachingTwoWayFlagConflict_(state, drive, supabaseBody, supabaseHash, 'both_bodies_changed');
    return {
      ready: false,
      result: { asset_code: assetCode, action: 'conflict_flagged', conflict_id: conflictId, synchronized: false }
    };
  }

  return {
    ready: true,
    state: state,
    registry: registry,
    drive: drive,
    supabase_body: supabaseBody,
    supabase_hash: supabaseHash,
    drive_changed: driveChanged,
    supabase_changed: supabaseChanged
  };
}

function teachingTwoWaySyncDriveToSupabase_(assetCode) {
  var gate = teachingTwoWayEvaluateForWrite_(assetCode);
  if (!gate.ready) return gate.result;

  if (!gate.drive_changed) {
    return { asset_code: assetCode, action: gate.supabase_changed ? 'supabase_to_drive_required' : 'no_op', synchronized: false };
  }
  if (!teachingTwoWayModeAllows_(gate.registry.sync_mode, 'drive_to_supabase')) {
    return { asset_code: assetCode, action: 'drive_to_supabase_blocked_by_mode', allowed: false, synchronized: false };
  }

  // Checkpoint B: a previously observed drive_to_supabase condition is not
  // authorization to write once state may have moved on. Reload and
  // re-derive the decision from current Drive/Supabase state immediately
  // before writing; if the opposite side changed in the meantime this call
  // converts it into a governed conflict rather than letting a stale
  // decision proceed.
  var revalidated = teachingTwoWayEvaluateForWrite_(assetCode);
  if (!revalidated.ready) return revalidated.result;
  if (!revalidated.drive_changed) {
    return { asset_code: assetCode, action: revalidated.supabase_changed ? 'supabase_to_drive_required' : 'no_op', synchronized: false };
  }
  if (!teachingTwoWayModeAllows_(revalidated.registry.sync_mode, 'drive_to_supabase')) {
    return { asset_code: assetCode, action: 'drive_to_supabase_blocked_by_mode', allowed: false, synchronized: false };
  }

  var drive = revalidated.drive;
  var writeResult = teachingSyncRequest_(
    'teachings', 'patch',
    { content_md: drive.body_text, updated_at: new Date().toISOString() },
    'id=eq.' + encodeURIComponent(assetCode)
  );
  teachingSyncRequireSuccess_(writeResult, 'Write drive->supabase content_md for ' + assetCode);

  return teachingTwoWayVerifyAndAdvanceBaseline_(assetCode, 'drive_to_supabase');
}

function teachingTwoWaySyncSupabaseToDrive_(assetCode) {
  var gate = teachingTwoWayEvaluateForWrite_(assetCode);
  if (!gate.ready) return gate.result;

  if (!gate.supabase_changed) {
    return { asset_code: assetCode, action: gate.drive_changed ? 'drive_to_supabase_required' : 'no_op', synchronized: false };
  }
  if (!teachingTwoWayModeAllows_(gate.registry.sync_mode, 'supabase_to_drive')) {
    return { asset_code: assetCode, action: 'supabase_to_drive_blocked_by_mode', allowed: false, synchronized: false };
  }

  // Checkpoint B: same stale-decision protection as the Drive->Supabase path.
  var revalidated = teachingTwoWayEvaluateForWrite_(assetCode);
  if (!revalidated.ready) return revalidated.result;
  if (!revalidated.supabase_changed) {
    return { asset_code: assetCode, action: revalidated.drive_changed ? 'drive_to_supabase_required' : 'no_op', synchronized: false };
  }
  if (!teachingTwoWayModeAllows_(revalidated.registry.sync_mode, 'supabase_to_drive')) {
    return { asset_code: assetCode, action: 'supabase_to_drive_blocked_by_mode', allowed: false, synchronized: false };
  }

  var teaching = revalidated.state.teaching;
  var registry = revalidated.registry;
  var fileId = extractTeachingGoogleFileId_(registry.url);
  if (!fileId) throw new Error('Registered Google Doc URL is missing/invalid for ' + assetCode);

  var doc = DocumentApp.openById(fileId);
  teachingTwoWayReplaceBodyPreservingEnvelope_(doc, teaching);
  doc.saveAndClose();

  return teachingTwoWayVerifyAndAdvanceBaseline_(assetCode, 'supabase_to_drive');
}

function teachingTwoWayModeAllows_(mode, direction) {
  return mode === 'two_way' || mode === direction + '_only';
}

/**
 * Rewrites only the region after the governed envelope (title, metadata,
 * optional summary, and the tolerated leading blank paragraph), reusing
 * TASK-0076's proven markdown-to-Doc transformation (appendTeachingMarkdown_)
 * for the replacement so the envelope itself is never duplicated, erased,
 * or turned into content, and the document is never recreated wholesale.
 */
function teachingTwoWayReplaceBodyPreservingEnvelope_(doc, teaching) {
  var body = doc.getBody();
  var envelopeCount = teachingTwoWayEnvelopeChildCount_(body, teaching);

  for (var i = body.getNumChildren() - 1; i >= envelopeCount; i--) {
    body.removeChild(body.getChild(i));
  }

  var ROYAL = '#14258F';
  var GOLD = '#9C7A2E';
  var DARK = '#1A1A1A';
  appendTeachingMarkdown_(body, teaching.content_md, ROYAL, GOLD, DARK);
}

function teachingTwoWayEnvelopeChildCount_(body, teaching) {
  var count = 0;
  if (body.getNumChildren() > 0 && body.getChild(0).getType() === DocumentApp.ElementType.PARAGRAPH) {
    if (body.getChild(0).asParagraph().getText() === '') count += 1;
  }
  count += 2; // title + metadata
  if (teaching.summary) count += 1;
  return count;
}

/**
 * Shared post-write verification and baseline advancement for both
 * directions. The baseline never advances on API write success alone: this
 * always re-reads both sides fresh, recomputes canonical hashes, and
 * requires exact equality plus a clean conflict_status before persisting.
 */
function teachingTwoWayVerifyAndAdvanceBaseline_(assetCode, direction) {
  var state = teachingTwoWayLoadState_(assetCode);
  if (state.registry.conflict_status !== 'none') {
    throw new Error(
      'Conflict status became ' + state.registry.conflict_status + ' during ' + direction +
      ' write for ' + assetCode + '; baseline not advanced.'
    );
  }

  var supabaseBody = teachingTwoWayExpectedBodyText_(state.teaching);
  var supabaseHash = teachingTwoWayHash_(supabaseBody);
  var drive = teachingTwoWayReadDriveState_(state.teaching, state.registry);

  if (drive.body_hash !== supabaseHash) {
    throw new Error(
      'Post-write verification failed for ' + assetCode + ' (' + direction + '): drive_body_hash=' +
      drive.body_hash + ' supabase_content_hash=' + supabaseHash + '. Baseline not advanced.'
    );
  }

  var now = new Date().toISOString();
  teachingTwoWayPatchRegistry_(assetCode, {
    drive_revision_id: drive.revision_id,
    drive_body_hash: drive.body_hash,
    supabase_content_hash: supabaseHash,
    last_verified_sync_at: now,
    updated_at: now
  });

  return {
    asset_code: assetCode,
    action: direction,
    synchronized: true,
    drive_revision_id: drive.revision_id,
    canonical_hash: drive.body_hash,
    verified_at: now
  };
}
