/**
 * TASK-0120 — Acceptance and governed enrollment probes for controlled
 * two-way teaching sync.
 *
 * EBYC: depends on TeachingArtifactSyncExtension.gs and
 * TeachingTwoWaySyncExtension.gs.
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

function runTask0120KeepTheGardenAcceptance() {
  var result = compareTeachingSyncState_('DIMS-TEACH-0002');
  console.log(JSON.stringify(result, null, 2));
  return result;
}

/**
 * Governed one-time enrollment runner for the first acceptance asset.
 * teachingTwoWayEnroll_ performs its own fresh canonical-body comparison
 * immediately before writing baseline fingerprints. It will not enroll if
 * either canonical body has diverged.
 *
 * This writes synchronization state only. It does not write teaching content
 * to Google Docs or Supabase.
 */
function runTask0120EnrollKeepTheGardenTwoWay() {
  var result = teachingTwoWayEnroll_('DIMS-TEACH-0002', 'two_way');
  console.log(JSON.stringify(result, null, 2));
  return result;
}

/**
 * Read-only post-enrollment verification runner.
 */
function runTask0120VerifyKeepTheGardenEnrollment() {
  var result = compareTeachingSyncState_('DIMS-TEACH-0002');
  console.log(JSON.stringify(result, null, 2));
  return result;
}

/**
 * Read-only diagnostic for a failed teaching envelope boundary.
 */
function diagnoseTeachingEnvelope_(assetCode) {
  var state = teachingTwoWayLoadState_(assetCode);
  var teaching = state.teaching;
  var registry = state.registry;
  var fileId = extractTeachingGoogleFileId_(registry.url);
  if (!fileId) throw new Error('Registered Google Doc URL is missing/invalid for ' + assetCode);

  var doc = DocumentApp.openById(fileId);
  var children = doc.getBody().getParagraphs();
  var actual = [];
  for (var i = 0; i < Math.min(children.length, 4); i++) {
    actual.push(String(children[i].getText() || ''));
  }

  var expectedTitle = String(teaching.title || 'Dominion1st Teaching');
  var expectedMeta = String(teachingSyncMetaText_(teaching) || '');
  var hasSummary = !!teaching.summary;
  var expectedSummary = hasSummary ? String(teaching.summary) : null;
  var expectedBodyFirst = teachingTwoWayFirstCanonicalBodyLine_(teaching);

  var actualTitle = actual.length > 0 ? actual[0] : null;
  var actualMeta = actual.length > 1 ? actual[1] : null;
  var actualSummary = hasSummary && actual.length > 2 ? actual[2] : null;
  var bodyIndex = hasSummary ? 3 : 2;
  var actualBodyFirst = actual.length > bodyIndex ? actual[bodyIndex] : null;

  var result = {
    asset_code: assetCode,
    read_only: true,
    drive_file_id: fileId,
    drive_revision_id: teachingTwoWayDriveRevisionId_(registry),
    expected: {
      title: expectedTitle,
      metadata: expectedMeta,
      summary: expectedSummary,
      first_body_paragraph: expectedBodyFirst
    },
    actual: {
      title: actualTitle,
      metadata: actualMeta,
      summary: actualSummary,
      first_body_paragraph: actualBodyFirst
    },
    exact_match: {
      title: actualTitle === expectedTitle,
      metadata: actualMeta === expectedMeta,
      summary: !hasSummary || actualSummary === expectedSummary,
      first_body_paragraph: actualBodyFirst === expectedBodyFirst
    },
    lengths: {
      expected_title: expectedTitle.length,
      actual_title: actualTitle === null ? null : actualTitle.length,
      expected_metadata: expectedMeta.length,
      actual_metadata: actualMeta === null ? null : actualMeta.length,
      expected_summary: expectedSummary === null ? null : expectedSummary.length,
      actual_summary: actualSummary === null ? null : actualSummary.length,
      expected_first_body_paragraph: expectedBodyFirst === null ? null : expectedBodyFirst.length,
      actual_first_body_paragraph: actualBodyFirst === null ? null : actualBodyFirst.length
    },
    first_difference: {
      title: teachingTwoWayFirstDifference_(expectedTitle, actualTitle),
      metadata: teachingTwoWayFirstDifference_(expectedMeta, actualMeta),
      summary: hasSummary ? teachingTwoWayFirstDifference_(expectedSummary, actualSummary) : null,
      first_body_paragraph: teachingTwoWayFirstDifference_(expectedBodyFirst, actualBodyFirst)
    },
    checked_at: new Date().toISOString()
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}

function teachingTwoWayFirstCanonicalBodyLine_(teaching) {
  var canonical = teachingTwoWayExpectedBodyText_(teaching);
  var lines = String(canonical || '').split('\n');
  for (var i = 0; i < lines.length; i++) {
    if (lines[i] !== '') return lines[i];
  }
  return null;
}

function teachingTwoWayFirstDifference_(expected, actual) {
  if (expected === actual) return null;
  if (expected === null || actual === null) {
    return { index: 0, expected_code_point: null, actual_code_point: null };
  }
  expected = String(expected);
  actual = String(actual);
  var limit = Math.min(expected.length, actual.length);
  var index = 0;
  while (index < limit && expected.charAt(index) === actual.charAt(index)) index++;
  return {
    index: index,
    expected_code_point: index < expected.length ? expected.charCodeAt(index) : null,
    actual_code_point: index < actual.length ? actual.charCodeAt(index) : null
  };
}

function runTask0120KeepTheGardenEnvelopeDiagnostic() {
  return diagnoseTeachingEnvelope_('DIMS-TEACH-0002');
}
