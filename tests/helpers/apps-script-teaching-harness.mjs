// In-memory Apps Script + Supabase stand-in for the teaching sync workers.
// Loads the real .gs sources into a VM context and counts every URL fetch,
// so request-volume and control-flow claims can be checked offline.
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import vm from 'node:vm';

const GAS_DIR = new URL('../../enterprise/google-apps-script/', import.meta.url);
export const TEACHING_SOURCES = [
  'TeachingArtifactSyncExtension.gs',
  'TeachingTwoWaySyncExtension.gs',
  'TeachingTwoWaySyncAutomation.gs'
];

export function readGas(name) {
  return readFileSync(new URL(name, GAS_DIR), 'utf8');
}

const SUPABASE_URL = 'https://example.supabase.co';
const AREA = 'Teaching / YARATHĒKĒ';

function parseFilters(query) {
  const filters = [];
  const meta = {};
  for (const part of String(query || '').split('&')) {
    if (!part) continue;
    const eq = part.indexOf('=');
    const key = decodeURIComponent(part.slice(0, eq));
    const raw = part.slice(eq + 1);
    if (['order', 'limit', 'select'].includes(key)) { meta[key] = decodeURIComponent(raw); continue; }
    if (raw.startsWith('eq.')) filters.push(r => String(r[key]) === decodeURIComponent(raw.slice(3)));
    else if (raw.startsWith('neq.')) filters.push(r => String(r[key]) !== decodeURIComponent(raw.slice(4)));
    else if (raw.startsWith('in.(')) {
      const values = raw.slice(4, -1).split(',').map(v => decodeURIComponent(v).replace(/^"|"$/g, ''));
      filters.push(r => values.includes(String(r[key])));
    } else throw new Error('Unsupported filter in fake PostgREST: ' + part);
  }
  return { match: r => filters.every(f => f(r)), meta };
}

export function createHarness({ sources = TEACHING_SOURCES.map(readGas) } = {}) {
  const db = { teachings: [], asset_registry: [], sync_log: [], teaching_sync_conflicts: [] };
  const docs = new Map(); // fileId -> { text, rev, mtime }
  const props = new Map([['SUPABASE_SERVICE_ROLE_KEY', 'test-key']]);
  const counters = { supabase: 0, docsApi: 0, driveMeta: 0, docOpen: 0, byTable: {} };
  const faults = { quotaAfter: Infinity, transient: [] }; // transient: [{ method, code, times }]
  let clock = Date.parse('2026-10-08T12:00:00Z');
  let lockHeld = false;

  const tick = () => (clock += 1000);
  const quotaError = () => new Error('Exception: Service invoked too many times for one day: urlfetch.');

  function fetch(url, options = {}) {
    const total = counters.supabase + counters.docsApi;
    if (total >= faults.quotaAfter) throw quotaError();
    const method = String(options.method || 'get').toLowerCase();

    if (url.startsWith('https://docs.googleapis.com/')) {
      counters.docsApi++;
      const id = decodeURIComponent(url.split('/documents/')[1].split('?')[0]);
      const doc = docs.get(id);
      return response(doc ? 200 : 404, doc ? { revisionId: doc.rev } : { error: 'not found' });
    }

    counters.supabase++;
    const [path, query] = url.slice((SUPABASE_URL + '/rest/v1/').length).split('?');
    counters.byTable[path + ':' + method] = (counters.byTable[path + ':' + method] || 0) + 1;

    const fault = faults.transient.find(f => f.method === method && f.times > 0);
    if (fault) { fault.times--; return response(fault.code, { message: 'transient' }); }

    const rows = db[path];
    if (!rows) return response(404, { message: 'no table ' + path });
    const { match, meta } = parseFilters(query);
    const payload = options.payload ? JSON.parse(options.payload) : null;

    if (method === 'get') {
      let out = rows.filter(match);
      if (meta.order) {
        const [col, dir] = meta.order.split('.');
        out = out.slice().sort((a, b) => String(a[col]).localeCompare(String(b[col])) * (dir === 'desc' ? -1 : 1));
      }
      if (meta.limit) out = out.slice(0, Number(meta.limit));
      return response(200, out.map(r => ({ ...r })));
    }
    if (method === 'patch') {
      const hit = rows.filter(match);
      hit.forEach(r => Object.assign(r, payload));
      return response(200, hit.map(r => ({ ...r })));
    }
    if (method === 'post') {
      const row = { id: 'row-' + (rows.length + 1), ...payload };
      rows.push(row);
      return response(201, [{ ...row }]);
    }
    throw new Error('Unsupported method ' + method);
  }

  function response(code, body) {
    return { getResponseCode: () => code, getContentText: () => JSON.stringify(body) };
  }

  function docFor(id) {
    const doc = docs.get(id);
    if (!doc) throw new Error('No item with the given ID could be found: ' + id);
    return doc;
  }

  function touch(doc) {
    doc.rev = 'rev-' + Math.random().toString(36).slice(2);
    doc.mtime = tick();
  }

  function paragraph(text) {
    const p = {
      getType: () => 'PARAGRAPH',
      asParagraph: () => p,
      getText: () => text,
      getHeading: () => 'NORMAL',
      editAsText: () => ({ isItalic: () => false, getForegroundColor: () => '#1A1A1A' })
    };
    return p;
  }

  const DocumentApp = {
    ElementType: { PARAGRAPH: 'PARAGRAPH', LIST_ITEM: 'LIST_ITEM' },
    ParagraphHeading: { HEADING1: 'H1', HEADING2: 'H2', HEADING3: 'H3' },
    openById(id) {
      counters.docOpen++;
      const doc = docFor(id);
      const body = {
        getText: () => doc.text,
        getNumChildren: () => doc.text.split('\n').length,
        getChild: i => paragraph(doc.text.split('\n')[i]),
        editAsText: () => ({
          getText: () => doc.text,
          deleteText(start, end) { doc.text = doc.text.slice(0, start) + doc.text.slice(end + 1); touch(doc); },
          insertText(at, str) { doc.text = doc.text.slice(0, at) + str + doc.text.slice(at); touch(doc); }
        })
      };
      return { getId: () => id, getBody: () => body, saveAndClose() {} };
    }
  };

  const context = {
    console: { log() {}, warn() {}, error() {} },
    Logger: { log() {} },
    JSON, Math, Number, String, Object, Array, Error, RegExp, isFinite, encodeURIComponent, decodeURIComponent,
    Date: class extends Date {
      constructor(...a) { super(...(a.length ? a : [clock])); }
      static now() { return clock; }
    },
    DIMS_CONFIG: { supabase: { projectUrl: SUPABASE_URL } },
    UrlFetchApp: { fetch },
    ScriptApp: { getOAuthToken: () => 'oauth', getProjectTriggers: () => [] },
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: k => (props.has(k) ? props.get(k) : null),
        setProperty: (k, v) => props.set(k, String(v)),
        deleteProperty: k => props.delete(k),
        getProperties: () => Object.fromEntries(props)
      })
    },
    LockService: {
      getScriptLock: () => ({
        tryLock: () => (lockHeld ? false : (lockHeld = true)),
        releaseLock: () => { lockHeld = false; }
      })
    },
    Utilities: {
      DigestAlgorithm: { SHA_256: 'sha256' },
      Charset: { UTF_8: 'utf8' },
      computeDigest: (_alg, value) => [...createHash('sha256').update(value, 'utf8').digest()].map(b => (b > 127 ? b - 256 : b)),
      sleep: () => {}
    },
    DriveApp: {
      getFileById(id) {
        counters.driveMeta++;
        const doc = docFor(id);
        return { getLastUpdated: () => new Date(doc.mtime) };
      }
    },
    DocumentApp,
    // Shared transport from EnterpriseWorkRegistry.gs (same contract).
    supabaseRequest_(table, method, payload, query, cfg) {
      let url = cfg.url + '/rest/v1/' + table + (query ? '?' + query : '');
      const res = fetch(url, { method, payload: payload ? JSON.stringify(payload) : undefined });
      const text = res.getContentText();
      return { code: res.getResponseCode(), body: text ? JSON.parse(text) : null };
    }
  };
  vm.createContext(context);
  for (const src of sources) vm.runInContext(src, context);

  const envelope = t => [t.title, context.teachingSyncMetaText_(t)].join('\n');
  const hashBody = md => context.teachingTwoWayHash_(context.teachingTwoWayExpectedBodyText_({ content_md: md }));

  return {
    gas: context, db, docs, props, counters, faults,
    fetchCount: () => counters.supabase + counters.docsApi,
    resetCounters() { Object.assign(counters, { supabase: 0, docsApi: 0, driveMeta: 0, docOpen: 0, byTable: {} }); },
    advance(ms) { clock += ms; },
    /** A teaching whose Drive Doc and Supabase body agree. */
    addTeaching(code, { mode = 'two_way', driveBody, supabaseBody = 'Line one\nLine two ' + code } = {}) {
      const teaching = { id: code, title: 'Teaching ' + code, series: 'S', category: 'C', content_md: supabaseBody, summary: null };
      db.teachings.push(teaching);
      const fileId = 'doc-' + code;
      docs.set(fileId, { text: envelope(teaching) + '\n' + (driveBody ?? supabaseBody), rev: 'rev-0-' + code, mtime: tick() });
      const enrolled = mode !== 'unenrolled';
      db.asset_registry.push({
        asset_code: code, system_area: AREA, status: 'institutionalized', sync_mode: mode, conflict_status: 'none',
        url: 'https://docs.google.com/document/d/' + fileId + '/edit',
        updated_at: new Date(clock).toISOString(),
        drive_revision_id: enrolled ? 'rev-0-' + code : null,
        drive_body_hash: enrolled ? hashBody(supabaseBody) : null,
        supabase_content_hash: enrolled ? hashBody(supabaseBody) : null
      });
    },
    driveBody(code) {
      const t = db.teachings.find(x => x.id === code);
      return docs.get('doc-' + code).text.slice(envelope(t).length + 1);
    },
    editDrive(code, newBody) {
      const t = db.teachings.find(x => x.id === code);
      const doc = docs.get('doc-' + code);
      doc.text = envelope(t) + '\n' + newBody;
      touch(doc);
    },
    hashBody
  };
}
