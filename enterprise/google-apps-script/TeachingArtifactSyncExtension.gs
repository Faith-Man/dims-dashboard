/**
 * ==========================================================
 * TeachingArtifactSyncExtension.gs
 * Dominion1st Integrated Management System (DIMS-v3)
 * TASK-0076 — Restore automatic teaching artifact persistence
 * ==========================================================
 *
 * EXTENDS: SynchronizationEngine.gs (GS-0002)
 * GOVERNANCE: ECCOM / ADR-0009 / DIMS-STD-0005 / EBYC
 *
 * Purpose
 * -------
 * Consume teaching synchronization jobs queued by the Supabase
 * trigger `trg_teachings_enqueue_artifact_sync` and persist the
 * teaching into the governed YARATHĒKĒ Google Drive repository,
 * reconcile asset_registry, optionally publish source-controlled
 * Markdown, and write verification evidence back to sync_log.
 *
 * Required Script Properties
 * --------------------------
 * SUPABASE_URL
 * SUPABASE_SERVICE_ROLE_KEY
 * YARATHEKE_FOLDER_ID
 *
 * Optional Script Properties
 * --------------------------
 * TEACHING_GITHUB_REPO       e.g. Faith-Man/dims-dashboard
 * TEACHING_GITHUB_BASE_PATH  e.g. docs/teachings
 *
 * Security
 * --------
 * Service role credentials MUST remain in Script Properties.
 * Never hard-code secrets into source control.
 */

function processTeachingArtifactSyncQueue(limit) {
  limit = Number(limit || 10);
  var jobs = supabaseSelect_(
    'sync_log',
    'id,asset_code,asset_name,sync_status,message,source,created_at',
    'sync_status=eq.queued&source=eq.TeachingArtifactSyncTrigger&order=created_at.asc&limit=' + limit
  );

  if (!jobs || !jobs.length) {
    return { processed: 0, message: 'No queued teaching synchronization jobs.' };
  }

  var results = [];
  jobs.forEach(function(job) {
    results.push(processOneTeachingArtifactSync_(job));
  });
  return { processed: results.length, results: results };
}

function processOneTeachingArtifactSync_(job) {
  markSyncJob_(job.id, 'processing', 'Teaching artifact synchronization started.');

  try {
    var teachingRows = supabaseSelect_(
      'teachings',
      '*',
      'id=eq.' + encodeURIComponent(job.asset_code) + '&limit=1'
    );
    if (!teachingRows || !teachingRows.length) {
      throw new Error('Teaching not found: ' + job.asset_code);
    }

    var teaching = teachingRows[0];
    if (!teaching.content_md) {
      throw new Error('Teaching has no content_md: ' + teaching.id);
    }

    var registryRows = supabaseSelect_(
      'asset_registry',
      '*',
      'asset_code=eq.' + encodeURIComponent(teaching.id) + '&limit=1'
    );
    var registry = registryRows && registryRows.length ? registryRows[0] : null;

    var driveResult = persistTeachingToDrive_(teaching, registry);
    var registryResult = reconcileTeachingAssetRegistry_(teaching, driveResult, registry);
    var githubResult = publishTeachingMarkdownIfConfigured_(teaching);
    var verifyResult = verifyTeachingPersistence_(teaching, driveResult, registryResult);

    var evidence = {
      event: 'teaching_artifact_sync_complete',
      teaching_id: teaching.id,
      drive: driveResult,
      asset_registry: registryResult,
      github: githubResult,
      verification: verifyResult,
      completed_at: new Date().toISOString()
    };

    markSyncJob_(job.id, 'complete', JSON.stringify(evidence));
    return { job_id: job.id, status: 'complete', evidence: evidence };
  } catch (err) {
    var failure = {
      event: 'teaching_artifact_sync_failed',
      error: String(err && err.stack ? err.stack : err),
      failed_at: new Date().toISOString()
    };
    markSyncJob_(job.id, 'failed', JSON.stringify(failure));
    return { job_id: job.id, status: 'failed', error: failure.error };
  }
}

function persistTeachingToDrive_(teaching, registry) {
  var props = PropertiesService.getScriptProperties();
  var folderId = props.getProperty('YARATHEKE_FOLDER_ID');
  if (!folderId) throw new Error('Missing Script Property YARATHEKE_FOLDER_ID');

  var doc = null;
  var existingId = extractGoogleFileId_(registry && registry.url);

  if (existingId) {
    try {
      doc = DocumentApp.openById(existingId);
    } catch (e) {
      doc = null;
    }
  }

  if (!doc) {
    doc = DocumentApp.create(teaching.title);
    var file = DriveApp.getFileById(doc.getId());
    var target = DriveApp.getFolderById(folderId);
    file.moveTo(target);
  }

  writeDominion1stTeachingDocument_(doc, teaching);
  doc.saveAndClose();

  return {
    file_id: doc.getId(),
    url: 'https://docs.google.com/document/d/' + doc.getId() + '/edit',
    title: teaching.title,
    platform: 'Google Drive',
    location: 'DOME / YARATHĒKĒ'
  };
}

function writeDominion1stTeachingDocument_(doc, teaching) {
  var body = doc.getBody();
  body.clear();

  // Dominion1st teaching baseline palette.
  var ROYAL = '#14258F';
  var ELECTRIC = '#55C7FF';
  var GOLD = '#9C7A2E';
  var DARK = '#1A1A1A';

  var title = body.appendParagraph(teaching.title || 'Dominion1st Teaching');
  title.setHeading(DocumentApp.ParagraphHeading.TITLE)
       .setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  title.editAsText().setForegroundColor(ROYAL).setBold(true);

  var meta = body.appendParagraph([
    teaching.series ? 'Series: ' + teaching.series : null,
    teaching.category ? 'Category: ' + teaching.category : null,
    teaching.id ? 'Artifact: ' + teaching.id : null
  ].filter(Boolean).join('  •  '));
  meta.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  meta.editAsText().setForegroundColor(ELECTRIC).setBold(true);

  if (teaching.summary) {
    var summary = body.appendParagraph(teaching.summary);
    summary.editAsText().setForegroundColor(DARK).setItalic(true);
  }

  appendMarkdownAsTeaching_(body, teaching.content_md, ROYAL, GOLD, DARK);
}

function appendMarkdownAsTeaching_(body, markdown, royal, gold, dark) {
  String(markdown || '').split(/\r?\n/).forEach(function(raw) {
    var line = raw.trim();
    if (!line) {
      body.appendParagraph('');
      return;
    }

    var p;
    if (/^###\s+/.test(line)) {
      p = body.appendParagraph(line.replace(/^###\s+/, ''));
      p.setHeading(DocumentApp.ParagraphHeading.HEADING3);
      p.editAsText().setForegroundColor(royal).setBold(true);
    } else if (/^##\s+/.test(line)) {
      p = body.appendParagraph(line.replace(/^##\s+/, ''));
      p.setHeading(DocumentApp.ParagraphHeading.HEADING2);
      p.editAsText().setForegroundColor(royal).setBold(true);
    } else if (/^#\s+/.test(line)) {
      p = body.appendParagraph(line.replace(/^#\s+/, ''));
      p.setHeading(DocumentApp.ParagraphHeading.HEADING1);
      p.editAsText().setForegroundColor(royal).setBold(true);
    } else if (/^[-*]\s+/.test(line)) {
      p = body.appendListItem(line.replace(/^[-*]\s+/, ''));
      p.editAsText().setForegroundColor(dark);
    } else if (/^>\s*/.test(line)) {
      p = body.appendParagraph(line.replace(/^>\s*/, ''));
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

  if (registry) {
    supabasePatch_('asset_registry', 'asset_code=eq.' + encodeURIComponent(teaching.id), payload);
    return { action: 'updated', asset_code: teaching.id, url: driveResult.url };
  }

  supabaseInsert_('asset_registry', payload);
  return { action: 'created', asset_code: teaching.id, url: driveResult.url };
}

function publishTeachingMarkdownIfConfigured_(teaching) {
  var props = PropertiesService.getScriptProperties();
  var repo = props.getProperty('TEACHING_GITHUB_REPO');
  var base = props.getProperty('TEACHING_GITHUB_BASE_PATH');
  if (!repo || !base) return { status: 'not_applicable_or_not_configured' };

  // Reuse the governed GitHub publish service when present.
  if (typeof githubPutFile !== 'function') {
    return { status: 'blocked', reason: 'githubPutFile helper not available in Apps Script project.' };
  }

  var slug = teaching.slug || teaching.id.toLowerCase();
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

function verifyTeachingPersistence_(teaching, driveResult, registryResult) {
  var driveFile = DriveApp.getFileById(driveResult.file_id);
  var registryRows = supabaseSelect_(
    'asset_registry',
    'asset_code,asset_name,status,url,platform,location',
    'asset_code=eq.' + encodeURIComponent(teaching.id) + '&limit=1'
  );
  var teachingRows = supabaseSelect_(
    'teachings',
    'id,title,status,slug,updated_at',
    'id=eq.' + encodeURIComponent(teaching.id) + '&limit=1'
  );

  var ok = !!driveFile && !!registryRows.length && !!teachingRows.length;
  if (!ok) throw new Error('Read-back verification failed for ' + teaching.id);

  return {
    verified: true,
    drive_file_id: driveResult.file_id,
    registry_asset_code: registryRows[0].asset_code,
    teaching_id: teachingRows[0].id,
    verified_at: new Date().toISOString()
  };
}

function markSyncJob_(jobId, status, message) {
  supabasePatch_('sync_log', 'id=eq.' + encodeURIComponent(jobId), {
    sync_status: status,
    message: message,
    source: 'TeachingArtifactSyncExtension.gs'
  });
}

function supabaseSelect_(table, select, query) {
  var response = supabaseRequest_('GET', table + '?select=' + encodeURIComponent(select) + '&' + query, null);
  return JSON.parse(response.getContentText() || '[]');
}

function supabaseInsert_(table, payload) {
  return supabaseRequest_('POST', table, payload, { Prefer: 'return=representation' });
}

function supabasePatch_(table, filterQuery, payload) {
  return supabaseRequest_('PATCH', table + '?' + filterQuery, payload, { Prefer: 'return=representation' });
}

function supabaseRequest_(method, path, payload, extraHeaders) {
  var props = PropertiesService.getScriptProperties();
  var base = props.getProperty('SUPABASE_URL');
  var key = props.getProperty('SUPABASE_SERVICE_ROLE_KEY');
  if (!base || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY Script Property.');

  var headers = {
    apikey: key,
    Authorization: 'Bearer ' + key,
    'Content-Type': 'application/json'
  };
  Object.keys(extraHeaders || {}).forEach(function(k) { headers[k] = extraHeaders[k]; });

  var options = {
    method: method,
    headers: headers,
    muteHttpExceptions: true
  };
  if (payload !== null && payload !== undefined) options.payload = JSON.stringify(payload);

  var response = UrlFetchApp.fetch(String(base).replace(/\/$/, '') + '/rest/v1/' + path, options);
  var code = response.getResponseCode();
  if (code < 200 || code >= 300) {
    throw new Error('Supabase HTTP ' + code + ': ' + response.getContentText());
  }
  return response;
}

function extractGoogleFileId_(url) {
  if (!url) return null;
  var m = String(url).match(/\/d\/([a-zA-Z0-9_-]+)/);
  return m ? m[1] : null;
}

/**
 * Install an hourly trigger (the maximum cadence needed here is typically
 * much lower; change only through governed configuration).
 */
function installTeachingArtifactSyncTrigger() {
  var handler = 'processTeachingArtifactSyncQueue';
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === handler) ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger(handler).timeBased().everyHours(1).create();
  return { installed: true, handler: handler, cadence: 'hourly' };
}
