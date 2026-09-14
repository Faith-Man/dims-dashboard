/**
* ==========================================================
* TeachingArtifactSyncExtension.gs
* Dominion1st Integrated Management System (DIMS-v3)
* TASK-0076 — Restore automatic teaching artifact persistence
* ==========================================================
*
* EXTENDS: SynchronizationEngine.gs / RepositoryService.gs
* GOVERNANCE: ECCOM / ADR-0009 / DIMS-STD-0005 / EBYC
*
* Purpose
* -------
* Consume teaching synchronization jobs queued by SQL-0013,
* persist/update the teaching in the governed YARATHĒKĒ Drive
* repository, reconcile asset_registry, perform real read-back
* verification, and mark sync_log verified only after success.
*
* EBYC COMPATIBILITY
* ------------------
* - Reuses the existing project-wide supabaseRequest_(table, method,
*   payload, query) implementation. It does NOT redefine it.
* - Reuses DIMS_CONFIG.supabase and DIMS_CONFIG.repositories.
* - Preserves ERBI, RepositoryService, SynchronizationEngine and the
*   existing WebAppBridge architecture.
* - Does not delete or replace existing project triggers.
*
* FIX (2026-09-11): verifyTeachingPersistence_() now retries its
* read-back check instead of failing on the very first attempt.
* Google Drive/Docs writes are eventually consistent, so checking
* immediately after a write can race the platform and report a
* false failure even though the artifact saved correctly. See the
* retry loop inside verifyTeachingPersistence_() below.
*/

function processTeachingArtifactSyncQueue(limit) {
// Time-driven triggers pass an event object, not a numeric limit.
limit = (typeof limit === 'number' || typeof limit === 'string') ? Number(limit) : 10;
if (!isFinite(limit) || limit < 1) limit = 10;
limit = Math.floor(limit);

var result = teachingSyncRequest_(
  'sync_log',
  'get',
  null,
  'sync_status=eq.queued&source=eq.TeachingArtifactSyncTrigger' +
    '&order=created_at.asc&limit=' + limit +
    '&select=id,asset_code,asset_name,sync_status,message,source,created_at'
);

teachingSyncRequireSuccess_(result, 'Load teaching synchronization queue');
var jobs = result.body || [];

if (!jobs.length) {
  return { processed: 0, message: 'No queued teaching synchronization jobs.' };
}

var results = [];
jobs.forEach(function(job) {
  results.push(processOneTeachingArtifactSync_(job));
});

return { processed: results.length, results: results };
}

function processOneTeachingArtifactSync_(job) {
markTeachingSyncJob_(job.id, 'processing', 'Teaching artifact synchronization started.');

try {
  var teachingResult = teachingSyncRequest_(
    'teachings',
    'get',
    null,
    'id=eq.' + encodeURIComponent(job.asset_code) + '&limit=1&select=*'
  );
  teachingSyncRequireSuccess_(teachingResult, 'Load teaching ' + job.asset_code);

  var teachingRows = teachingResult.body || [];
  if (!teachingRows.length) throw new Error('Teaching not found: ' + job.asset_code);

  var teaching = teachingRows[0];
  if (!teaching.content_md) throw new Error('Teaching has no content_md: ' + teaching.id);

  var registryResult = teachingSyncRequest_(
    'asset_registry',
    'get',
    null,
    'asset_code=eq.' + encodeURIComponent(teaching.id) + '&limit=1&select=*'
  );
  teachingSyncRequireSuccess_(registryResult, 'Load asset registry record ' + teaching.id);
  var registry = registryResult.body && registryResult.body.length ? registryResult.body[0] : null;

  var driveResult = persistTeachingToYaratheke_(teaching, registry);
  var assetResult = reconcileTeachingAssetRegistry_(teaching, driveResult, registry);
  var githubResult = publishTeachingMarkdownIfConfigured_(teaching);
  var verification = verifyTeachingPersistence_(teaching, driveResult);

  var evidence = {
    event: 'teaching_artifact_sync_verified',
    previous_attempt: job.sync_status === 'failed' ? job.message : null,
    teaching_id: teaching.id,
    drive: driveResult,
    asset_registry: assetResult,
    github: githubResult,
    verification: verification,
    completed_at: new Date().toISOString()
  };

  markTeachingSyncJob_(job.id, 'verified', JSON.stringify(evidence));
  return { job_id: job.id, status: 'verified', evidence: evidence };
} catch (err) {
  var failure = {
    event: 'teaching_artifact_sync_failed',
    previous_attempt: job.sync_status === 'failed' ? job.message : null,
    error: String(err && err.stack ? err.stack : err),
    failed_at: new Date().toISOString()
  };

  try {
    markTeachingSyncJob_(job.id, 'failed', JSON.stringify(failure));
  } catch (markErr) {
    console.error('Unable to mark failed sync job: ' + markErr);
  }

  return { job_id: job.id, status: 'failed', error: failure.error };
}
}

function teachingSyncYarathekeFolderId_() {
if (
  typeof DIMS_CONFIG !== 'undefined' &&
  DIMS_CONFIG.repositories &&
  DIMS_CONFIG.repositories.yarathekeFolderId
) {
  return String(DIMS_CONFIG.repositories.yarathekeFolderId);
}

var legacyProperty = PropertiesService.getScriptProperties().getProperty('YARATHEKE_FOLDER_ID');
if (legacyProperty) return legacyProperty;

throw new Error('YARATHĒKĒ folder ID is not configured in DIMS_CONFIG.repositories.yarathekeFolderId.');
}

function persistTeachingToYaratheke_(teaching, registry) {
var folderId = teachingSyncYarathekeFolderId_();
var doc;
var file;
var existingId = extractTeachingGoogleFileId_(registry && registry.url);
var expectedParents = [];

if (existingId) {
  doc = DocumentApp.openById(existingId);
  file = DriveApp.getFileById(existingId);
  var parentIterator = file.getParents();
  while (parentIterator.hasNext()) expectedParents.push(parentIterator.next().getId());
  if (!expectedParents.length) throw new Error('Registered teaching has no accessible parent folder: ' + existingId);
} else {
  var targetFolder = DriveApp.getFolderById(folderId);
  doc = DocumentApp.create(teaching.title);
  file = DriveApp.getFileById(doc.getId());
  file.moveTo(targetFolder);
  expectedParents = [folderId];
}

writeDominion1stTeachingDocument_(doc, teaching);
doc.saveAndClose();

return {
  file_id: doc.getId(),
  url: 'https://docs.google.com/document/d/' + doc.getId() + '/edit',
  title: teaching.title,
  platform: 'Google Drive',
  location: registry && registry.location ? registry.location : 'DOME / YARATHĒKĒ',
  folder_id: expectedParents[0],
  expected_parent_ids: expectedParents,
  placement_policy: existingId ? 'preserve_registered_artifact_parents' : 'configured_yaratheke_root',
  reused_existing: !!existingId
};
}

function writeDominion1stTeachingDocument_(doc, teaching) {
var body = doc.getBody();
body.clear();

var ROYAL = '#14258F';
var ELECTRIC = '#55C7FF';
var GOLD = '#9C7A2E';
var DARK = '#1A1A1A';

var title = body.appendParagraph(teaching.title || 'Dominion1st Teaching');
title.setHeading(DocumentApp.ParagraphHeading.TITLE)
     .setAlignment(DocumentApp.HorizontalAlignment.CENTER);
title.editAsText().setForegroundColor(ROYAL).setBold(true);

var meta = body.appendParagraph(teachingSyncMetaText_(teaching));
meta.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
meta.editAsText().setForegroundColor(ELECTRIC).setBold(true);

if (teaching.summary) {
  var summary = body.appendParagraph(teaching.summary);
  summary.editAsText().setForegroundColor(DARK).setItalic(true);
}

appendTeachingMarkdown_(body, teaching.content_md, ROYAL, GOLD, DARK);
}

function teachingSyncMetaText_(teaching) {
return [
  teaching.series ? 'Series: ' + teaching.series : null,
  teaching.category ? 'Category: ' + teaching.category : null,
  teaching.id ? 'Artifact: ' + teaching.id : null
].filter(Boolean).join('  •  ');
}

function appendTeachingMarkdown_(body, markdown, royal, gold, dark) {
String(markdown || '').split(/\r?\n/).forEach(function(raw) {
  var line = raw.trim();
  if (!line) {
    body.appendParagraph('');
    return;
  }

  var p;
  if (/^###\s+/.test(line)) {
    p = body.appendParagraph(line.replace(/^###\s+/, '').replace(/\*\*/g, ''));
    p.setHeading(DocumentApp.ParagraphHeading.HEADING3);
    p.editAsText().setForegroundColor(royal).setBold(true);
  } else if (/^##\s+/.test(line)) {
    p = body.appendParagraph(line.replace(/^##\s+/, '').replace(/\*\*/g, ''));
    p.setHeading(DocumentApp.ParagraphHeading.HEADING2);
    p.editAsText().setForegroundColor(royal).setBold(true);
  } else if (/^#\s+/.test(line)) {
    p = body.appendParagraph(line.replace(/^#\s+/, '').replace(/\*\*/g, ''));
    p.setHeading(DocumentApp.ParagraphHeading.HEADING1);
    p.editAsText().setForegroundColor(royal).setBold(true);
  } else if (/^[-*]\s+/.test(line)) {
    p = body.appendListItem(line.replace(/^[-*]\s+/, '').replace(/\*\*/g, ''));
    p.editAsText().setForegroundColor(dark);
  } else if (/^>\s*/.test(line)) {
    p = body.appendParagraph(line.replace(/^>\s*/, '').replace(/\*\*/g, ''));
    p.editAsText().setForegroundColor(gold).setItalic(true);
  } else {
    p = body.appendParagraph(line.replace(/\*\*/g, ''));
    p.editAsText().setForegroundColor(dark);
  }
});
}

function reconcileTeachingAssetRegistry_(teaching, driveResult, registry) {
var payload = {
  asset_code: teaching.id,
  asset_name: teaching.title,
  asset_type: teaching.content_type || 'Teaching / Knowledge',
  platform: 'Google Drive + Supabase',
  location: driveResult.location,
  file_name: teaching.slug ? teaching.slug + '.gdoc' : null,
  url: driveResult.url,
  status: 'institutionalized',
  priority: teaching.priority || 'medium',
  system_area: 'Teaching / YARATHĒKĒ',
  description: teaching.summary || 'Dominion1st teaching artifact synchronized by TeachingArtifactSyncExtension.',
  notes: 'Automated by TASK-0076 teaching artifact synchronization pipeline.',
  updated_at: new Date().toISOString()
};

var result;
if (registry) {
  result = teachingSyncRequest_(
    'asset_registry',
    'patch',
    payload,
    'asset_code=eq.' + encodeURIComponent(teaching.id)
  );
  teachingSyncRequireSuccess_(result, 'Update asset registry ' + teaching.id);
  return { action: 'updated', asset_code: teaching.id, url: driveResult.url };
}

result = teachingSyncRequest_('asset_registry', 'post', payload, null);
teachingSyncRequireSuccess_(result, 'Create asset registry ' + teaching.id);
return { action: 'created', asset_code: teaching.id, url: driveResult.url };
}

function publishTeachingMarkdownIfConfigured_(teaching) {
var props = PropertiesService.getScriptProperties();
var repo = props.getProperty('TEACHING_GITHUB_REPO');
var base = props.getProperty('TEACHING_GITHUB_BASE_PATH');

if (!repo || !base) return { status: 'not_applicable_or_not_configured' };
if (typeof githubPutFile !== 'function') {
  return { status: 'blocked', reason: 'githubPutFile helper not available in Apps Script project.' };
}

var slug = teaching.slug || String(teaching.id).toLowerCase();
var path = String(base).replace(/\/$/, '') + '/' + slug + '.md';
var header = [
  '---',
  'id: ' + teaching.id,
  'title: "' + String(teaching.title || '').replace(/"/g, '\\"') + '"',
  'status: ' + (teaching.status || 'active'),
  'category: "' + String(teaching.category || '').replace(/"/g, '\\"') + '"',
  'series: "' + String(teaching.series || '').replace(/"/g, '\\"') + '"',
  '---',
  ''
].join('\n');

var result = githubPutFile(
  path,
  header + teaching.content_md,
  'Teaching sync: ' + teaching.id + ' ' + teaching.title
);

return { status: 'published', path: path, result: result };
}

/**
* FIX (2026-09-11): Google Drive/Docs writes are eventually consistent —
* reading the file back immediately after writing it can race the platform
* and report a false mismatch even though the write succeeded. This now
* retries the full read-back check a few times with short delays before
* concluding the sync genuinely failed.
*/
function verifyTeachingPersistence_(teaching, driveResult) {
var maxAttempts = 4;
var delaysMs = [1000, 2000, 3000]; // waits between attempts 1→2, 2→3, 3→4
var lastFailureDetail = null;

for (var attempt = 1; attempt <= maxAttempts; attempt++) {
  var file = DriveApp.getFileById(driveResult.file_id);
  var parents = [];
  var parentIterator = file.getParents();
  while (parentIterator.hasNext()) parents.push(parentIterator.next().getId());

  var docText = DocumentApp.openById(driveResult.file_id).getBody().getText();
  var expectedText = teachingSyncExpectedDocumentText_(teaching);
  var contentMatches = teachingSyncNormalizeText_(docText) === teachingSyncNormalizeText_(expectedText);
  var expectedParents = driveResult.expected_parent_ids || [driveResult.folder_id];
  var folderMatches = expectedParents.length > 0 &&
    JSON.stringify(parents.slice().sort()) === JSON.stringify(expectedParents.slice().sort());

  var registryResult = teachingSyncRequest_(
    'asset_registry',
    'get',
    null,
    'asset_code=eq.' + encodeURIComponent(teaching.id) +
      '&limit=1&select=asset_code,asset_name,status,url,platform,location'
  );
  teachingSyncRequireSuccess_(registryResult, 'Verify asset registry ' + teaching.id);

  var teachingResult = teachingSyncRequest_(
    'teachings',
    'get',
    null,
    'id=eq.' + encodeURIComponent(teaching.id) +
      '&limit=1&select=id,title,status,slug,updated_at'
  );
  teachingSyncRequireSuccess_(teachingResult, 'Verify teaching ' + teaching.id);

  var registryRows = registryResult.body || [];
  var teachingRows = teachingResult.body || [];
  var registryMatches = !!registryRows.length &&
    registryRows[0].asset_code === teaching.id &&
    registryRows[0].url === driveResult.url;
  var teachingMatches = !!teachingRows.length && teachingRows[0].id === teaching.id;

  var allMatch = contentMatches && folderMatches && registryMatches && teachingMatches;

  if (allMatch) {
    return {
      verified: true,
      drive_file_id: driveResult.file_id,
      content_matches: contentMatches,
      folder_matches: folderMatches,
      actual_parent_ids: parents,
      expected_parent_ids: expectedParents,
      placement_policy: driveResult.placement_policy,
      registry_matches: registryMatches,
      registry_asset_code: registryRows[0].asset_code,
      teaching_matches: teachingMatches,
      teaching_id: teachingRows[0].id,
      verified_at: new Date().toISOString(),
      attempts_needed: attempt
    };
  }

  lastFailureDetail =
    'content=' + contentMatches +
    ' folder=' + folderMatches +
    ' registry=' + registryMatches +
    ' teaching=' + teachingMatches;

  if (attempt < maxAttempts) {
    Utilities.sleep(delaysMs[attempt - 1]);
  }
}

throw new Error(
  'Read-back verification failed for ' + teaching.id +
  ' after ' + maxAttempts + ' attempts (' + lastFailureDetail + ')'
);
}

function teachingSyncExpectedDocumentText_(teaching) {
var lines = [
  teaching.title || 'Dominion1st Teaching',
  teachingSyncMetaText_(teaching)
];

if (teaching.summary) lines.push(teaching.summary);

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

function teachingSyncNormalizeText_(value) {
return String(value || '')
  .replace(/\r\n/g, '\n')
  .replace(/\r/g, '\n')
  .replace(/[\u000B\u000C]/g, '\n')
  .split('\n')
  .map(function(line) { return line.replace(/[ \t]+$/g, '').trim(); })
  .join('\n')
  .replace(/\n{3,}/g, '\n\n')
  .trim();
}

function markTeachingSyncJob_(jobId, status, message) {
var result = teachingSyncRequest_(
  'sync_log',
  'patch',
  {
    sync_status: status,
    message: message,
    source: 'TeachingArtifactSyncExtension.gs'
  },
  'id=eq.' + encodeURIComponent(jobId)
);

teachingSyncRequireSuccess_(result, 'Update sync_log ' + jobId + ' to ' + status);
}

function teachingSyncRequireSuccess_(result, operation) {
if (!result || Number(result.code) < 200 || Number(result.code) >= 300) {
  var code = result && result.code;
  var body = result && result.body;
  throw new Error(operation + ' failed. HTTP ' + code + ': ' + JSON.stringify(body));
}
return result;
}

function extractTeachingGoogleFileId_(url) {
if (!url) return null;
var match = String(url).match(/\/d\/([a-zA-Z0-9_-]+)/);
return match ? match[1] : null;
}

/**
* Inspect-first trigger installer.
* Existing triggers are never deleted or modified.
*/
function installTeachingArtifactSyncTrigger() {
var handler = 'processTeachingArtifactSyncQueue';
var existing = ScriptApp.getProjectTriggers().filter(function(trigger) {
  return trigger.getHandlerFunction() === handler;
});

if (existing.length) {
  return {
    installed: false,
    already_present: true,
    handler: handler,
    existing_count: existing.length
  };
}

ScriptApp.newTrigger(handler).timeBased().everyHours(1).create();
return {
  installed: true,
  already_present: false,
  handler: handler,
  cadence: 'hourly'
};
}

/** TASK-0076: reuse the shared transport with server-only worker credentials. */
function teachingSyncRequest_(table, method, payload, query) {
var key = PropertiesService.getScriptProperties().getProperty('SUPABASE_SERVICE_ROLE_KEY');
if (!key) throw new Error('Missing Script Property SUPABASE_SERVICE_ROLE_KEY for teaching queue worker.');
return supabaseRequest_(table, method, payload, query, {
  url: DIMS_CONFIG.supabase.projectUrl,
  key: key
});
}
