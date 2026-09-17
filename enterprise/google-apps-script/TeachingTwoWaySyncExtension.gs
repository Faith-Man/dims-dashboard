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
 * teachingTwoWayCompare_() (above) only reports required action; it never
 * writes. These functions perform the actual write, but only after two
 * independent safety checkpoints:
 *
 *   Checkpoint A (entry gate)     — teachingTwoWaySyncDriveToSupabase_ /
 *                                    teachingTwoWaySyncSupabaseToDrive_ entry
 *   Checkpoint B (pre-write gate) — teachingTwoWayPreWriteRevalidate_
 *
 * A comparator result such as "drive_to_supabase_required" is a snapshot,
 * not a write authorization. Checkpoint B reloads and rehashes both sides
 * immediately before the mutation, so a race (the other side changing
 * between comparison and write) is converted into a preserved conflict
 * instead of a silent overwrite. The registry baseline only advances after
 * the write is independently re-verified by hash equality.
 */

function teachingTwoWayConflictGateOrPause_(assetCode) {
  var state = teachingTwoWayLoadState_(assetCode);
  if (state.registry.conflict_status !== 'none') {
    return {
      blocked: true,
      result: {
        asset_code: assetCode,
        action: 'paused_for_conflict',
        conflict_status: state.registry.conflict_status,
        synchronized: false
      }
    };
  }
  return { blocked: false, state: state };
}

/**
 * Checkpoint B. Reloads teaching/registry/Drive state fresh and re-derives
 * both canonical hashes, independent of whatever the caller observed
 * earlier. Only returns a go-ahead when exactly the expected one-sided
 * change still holds; any other outcome (conflict_status changed, mode no
 * longer permits the direction, both sides changed, or the one-sided
 * change evaporated) is returned as blocked so the caller cannot write.
 */
function teachingTwoWayPreWriteRevalidate_(assetCode, direction) {
  var state = teachingTwoWayLoadState_(assetCode);
  var registry = state.registry;

  if (registry.conflict_status !== 'none') {
    return {
      blocked: true,
      result: {
        asset_code: assetCode,
        action: 'paused_for_conflict',
        conflict_status: registry.conflict_status,
        synchronized: false
      }
    };
  }

  var modeAllows = registry.sync_mode === 'two_way' || registry.sync_mode === direction + '_only';
  if (!modeAllows) {
    return {
      blocked: true,
      result: {
        asset_code: assetCode,
        action: direction + '_blocked_by_mode',
        allowed: false,
        synchronized: false
      }
    };
  }

  var drive = teachingTwoWayReadDriveState_(state.teaching, registry);
  var supabaseBody = teachingTwoWayExpectedBodyText_(state.teaching);
  var supabaseHash = teachingTwoWayHash_(supabaseBody);

  var driveChanged = drive.body_hash !== registry.drive_body_hash;
  var supabaseChanged = supabaseHash !== registry.supabase_content_hash;

  if (driveChanged && supabaseChanged) {
    var conflictId = teachingTwoWayFlagConflict_(
      state, drive, supabaseBody, supabaseHash,
      'race_detected_during_' + direction + '_prewrite_revalidation'
    );
    return {
      blocked: true,
      result: {
        asset_code: assetCode,
        action: 'conflict_flagged',
        conflict_id: conflictId,
        synchronized: false
      }
    };
  }

  var expectedSideChanged = direction === 'drive_to_supabase' ? driveChanged : supabaseChanged;
  var otherSideChanged = direction === 'drive_to_supabase' ? supabaseChanged : driveChanged;

  if (!expectedSideChanged || otherSideChanged) {
    return {
      blocked: true,
      result: {
        asset_code: assetCode,
        action: 'stale_decision_recheck_required',
        synchronized: false
      }
    };
  }

  return { blocked: false, state: state, drive: drive, supabaseBody: supabaseBody, supabaseHash: supabaseHash };
}

/**
 * Reconstructs markdown syntax from the Doc's actual paragraph styling,
 * inverting appendTeachingMarkdown_() in TeachingArtifactSyncExtension.gs
 * exactly (that function is the only writer of these Docs, so it is the
 * ground truth for what each style combination means):
 *
 *   HEADING1/2/3 paragraph  -> '# '/'## '/'### ' + text   (lossless)
 *   ListItem element        -> '- ' + text                (lossless)
 *   italic + gold paragraph -> '> ' + text                (heuristic, but
 *                               that combination is never produced for any
 *                               other line type by the existing encoder)
 *   anything else           -> text as-is
 *
 * Inline '**bold**' spans are NOT reconstructed. appendTeachingMarkdown_
 * strips '**' and never calls setBold() for non-heading lines, so that
 * information does not exist anywhere in the Doc to recover — this is a
 * pre-existing limitation of TASK-0076's encoder, not something a cleverer
 * reader could work around.
 *
 * Self-verifying: the caller must confirm teachingTwoWayExpectedBodyText_
 * applied to the reconstructed markdown reproduces the same hash as the
 * plain-text extraction before trusting this output. Any Doc shape this
 * walker does not handle correctly (manual edits, unsupported elements)
 * will disagree with that already-proven-correct comparison and must be
 * treated as a hard failure, never a silent best-effort write.
 */
function teachingTwoWayReconstructMarkdownFromDoc_(doc, teaching) {
  var body = doc.getBody();
  var count = body.getNumChildren();
  var index = 0;

  if (index < count) {
    var first = body.getChild(index);
    if (first.getType() === DocumentApp.ElementType.PARAGRAPH &&
        first.asParagraph().getText() === '') {
      index++;
    }
  }

  index++; // title
  index++; // metadata
  if (teaching.summary) index++; // optional summary

  var lines = [];
  for (; index < count; index++) {
    lines.push(teachingTwoWayReconstructLine_(body.getChild(index)));
  }
  return lines.join('\n');
}

function teachingTwoWayReconstructLine_(child) {
  var type = child.getType();

  if (type === DocumentApp.ElementType.LIST_ITEM) {
    return '- ' + String(child.asListItem().getText() || '');
  }

  if (type !== DocumentApp.ElementType.PARAGRAPH) {
    throw new Error(
      'Unsupported document element in teaching body (type: ' + type +
      '); refusing to guess a markdown equivalent.'
    );
  }

  var paragraph = child.asParagraph();
  var text = String(paragraph.getText() || '');
  if (text === '') return '';

  var heading = paragraph.getHeading();
  if (heading === DocumentApp.ParagraphHeading.HEADING3) return '### ' + text;
  if (heading === DocumentApp.ParagraphHeading.HEADING2) return '## ' + text;
  if (heading === DocumentApp.ParagraphHeading.HEADING1) return '# ' + text;

  // Blockquote fingerprint: appendTeachingMarkdown_ applies italic + this
  // exact gold color ONLY to '>' lines, and applies it to every '>' line.
  var textElement = paragraph.editAsText();
  var isItalic = textElement.isItalic(0) === true;
  var color = String(textElement.getForegroundColor(0) || '').toUpperCase();
  if (isItalic && color === '#9C7A2E') {
    return '> ' + text;
  }

  return text;
}

function teachingTwoWaySyncDriveToSupabase_(assetCode) {
  // Checkpoint A.
  var gate = teachingTwoWayConflictGateOrPause_(assetCode);
  if (gate.blocked) return gate.result;
  if (gate.state.registry.sync_mode === 'unenrolled') {
    return { asset_code: assetCode, action: 'unenrolled', synchronized: false };
  }
  teachingTwoWayRequireMode_(gate.state.registry.sync_mode, false);

  // A stale comparator snapshot is never write authorization; require a
  // fresh comparison right now to confirm this direction is actually due.
  var comparison = teachingTwoWayCompare_(assetCode);
  if (comparison.action !== 'drive_to_supabase_required') {
    return comparison;
  }

  // Checkpoint B.
  var revalidation = teachingTwoWayPreWriteRevalidate_(assetCode, 'drive_to_supabase');
  if (revalidation.blocked) return revalidation.result;

  var state = revalidation.state;
  var drive = revalidation.drive;

  // Reconstruct markdown structure (headings/lists/blockquotes) from the
  // Doc's actual paragraph styling instead of writing flattened plain text,
  // so a Drive-origin change doesn't strip formatting out of content_md.
  // Inline '**bold**' cannot be part of this — see
  // teachingTwoWayReconstructMarkdownFromDoc_'s header comment for why.
  //
  // Self-verified before it's trusted: flattening the reconstruction back
  // through the same transform used for real comparisons must reproduce
  // exactly drive.body_hash. If it doesn't, this Doc's shape isn't one the
  // reconstructor understands (manual edit, unsupported element, etc.) and
  // we refuse to write an unverified guess rather than degrade silently.
  var doc = DocumentApp.openById(drive.file_id);
  var reconstructedMarkdown = teachingTwoWayReconstructMarkdownFromDoc_(doc, state.teaching);
  var reconstructedHash = teachingTwoWayHash_(
    teachingTwoWayExpectedBodyText_({ content_md: reconstructedMarkdown })
  );
  if (reconstructedHash !== drive.body_hash) {
    throw new Error(
      'TASK-0120 markdown reconstruction failed self-verification for ' + assetCode +
      ': flattening the reconstructed markdown does not reproduce the Doc\'s actual ' +
      'canonical body. Refusing to write an unverified reconstruction.'
    );
  }

  var writeResult = teachingSyncRequest_(
    'teachings', 'patch', { content_md: reconstructedMarkdown },
    'id=eq.' + encodeURIComponent(state.teaching.id)
  );
  teachingSyncRequireSuccess_(writeResult, 'Write Drive body to Supabase for ' + assetCode);

  // Post-write verification: re-read Supabase, independent of the write
  // call's own reported success, and require exact canonical equality
  // before the baseline is allowed to move.
  var postState = teachingTwoWayLoadState_(assetCode);
  var postSupabaseBody = teachingTwoWayExpectedBodyText_(postState.teaching);
  var postSupabaseHash = teachingTwoWayHash_(postSupabaseBody);

  if (postSupabaseHash !== drive.body_hash) {
    throw new Error(
      'TASK-0120 post-write verification failed for ' + assetCode +
      ': Supabase hash ' + postSupabaseHash + ' != Drive hash ' + drive.body_hash +
      ' after drive_to_supabase write. Baseline NOT advanced.'
    );
  }

  var now = new Date().toISOString();
  teachingTwoWayPatchRegistry_(assetCode, {
    drive_revision_id: drive.revision_id,
    drive_body_hash: drive.body_hash,
    supabase_content_hash: postSupabaseHash,
    last_verified_sync_at: now,
    updated_at: now
  });

  return {
    asset_code: assetCode,
    action: 'drive_to_supabase_executed',
    synchronized: true,
    drive_revision_id: drive.revision_id,
    body_hash: postSupabaseHash,
    verified_at: now
  };
}

function teachingTwoWaySyncSupabaseToDrive_(assetCode) {
  // Checkpoint A.
  var gate = teachingTwoWayConflictGateOrPause_(assetCode);
  if (gate.blocked) return gate.result;
  if (gate.state.registry.sync_mode === 'unenrolled') {
    return { asset_code: assetCode, action: 'unenrolled', synchronized: false };
  }
  teachingTwoWayRequireMode_(gate.state.registry.sync_mode, false);

  var comparison = teachingTwoWayCompare_(assetCode);
  if (comparison.action !== 'supabase_to_drive_required') {
    return comparison;
  }

  // Checkpoint B.
  var revalidation = teachingTwoWayPreWriteRevalidate_(assetCode, 'supabase_to_drive');
  if (revalidation.blocked) return revalidation.result;

  var state = revalidation.state;
  var supabaseBody = revalidation.supabaseBody;
  var supabaseHash = revalidation.supabaseHash;

  teachingTwoWayWriteDriveBody_(state.teaching, state.registry, supabaseBody);

  // Post-write verification: re-read Drive fresh (new revision id) and
  // require exact canonical equality before the baseline is allowed to move.
  var postDrive = teachingTwoWayReadDriveState_(state.teaching, state.registry);

  if (postDrive.body_hash !== supabaseHash) {
    throw new Error(
      'TASK-0120 post-write verification failed for ' + assetCode +
      ': Drive hash ' + postDrive.body_hash + ' != Supabase hash ' + supabaseHash +
      ' after supabase_to_drive write. Baseline NOT advanced.'
    );
  }

  var now = new Date().toISOString();
  teachingTwoWayPatchRegistry_(assetCode, {
    drive_revision_id: postDrive.revision_id,
    drive_body_hash: postDrive.body_hash,
    supabase_content_hash: supabaseHash,
    last_verified_sync_at: now,
    updated_at: now
  });

  return {
    asset_code: assetCode,
    action: 'supabase_to_drive_executed',
    synchronized: true,
    drive_revision_id: postDrive.revision_id,
    body_hash: supabaseHash,
    verified_at: now
  };
}

/**
 * Writes newBodyText into the Doc, preserving the title/metadata/summary
 * envelope exactly. Only the text after the envelope boundary is replaced;
 * the envelope paragraphs themselves are never touched. Refuses to guess a
 * boundary if the envelope doesn't match what's on record (same safety
 * rule as the read-side extractor).
 */
function teachingTwoWayWriteDriveBody_(teaching, registry, newBodyText) {
  var fileId = extractTeachingGoogleFileId_(registry.url);
  if (!fileId) throw new Error('Registered Google Doc URL is missing/invalid for ' + teaching.id);

  var doc = DocumentApp.openById(fileId);
  var body = doc.getBody();
  var fullText = String(body.getText() || '');

  // Mirrors the leading-blank-paragraph tolerance in
  // teachingTwoWayExtractBodyText_: some existing Docs (including the
  // canonical DIMS-TEACH-0002 doc) have one structural empty paragraph
  // before the envelope. Track it as an offset rather than stripping the
  // string, since real character positions are needed for editing below.
  var leadingOffset = 0;
  var matchText = fullText;
  if (matchText.indexOf('\n') === 0) {
    leadingOffset = 1;
    matchText = matchText.substring(1);
  }

  var envelope = [
    teaching.title || 'Dominion1st Teaching',
    teachingSyncMetaText_(teaching)
  ];
  if (teaching.summary) envelope.push(teaching.summary);
  var prefix = envelope.join('\n');

  var hasExistingBody = matchText.indexOf(prefix + '\n') === 0;
  if (!hasExistingBody && matchText !== prefix) {
    throw new Error(
      'Teaching envelope mismatch for ' + teaching.id +
      '; refusing to write body without a safely-identified boundary.'
    );
  }

  var text = body.editAsText();
  var totalLength = text.getText().length;

  if (hasExistingBody) {
    var bodyStart = leadingOffset + prefix.length + 1;
    if (totalLength > bodyStart) {
      text.deleteText(bodyStart, totalLength - 1);
    }
    if (newBodyText) {
      text.insertText(bodyStart, newBodyText);
    }
  } else if (newBodyText) {
    text.insertText(totalLength, '\n' + newBodyText);
  }

  doc.saveAndClose();
}
