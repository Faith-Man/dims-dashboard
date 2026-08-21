import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const app = await readFile('yaratheke/app.js', 'utf8');
const index = await readFile('yaratheke/index.html', 'utf8');
const styles = await readFile('yaratheke/styles.css', 'utf8');
const redirect = await readFile('teaching-library-v3.html', 'utf8');
const orel = await readFile('orel/index.html', 'utf8');

test('KEEP THE GARDEN Reader contains the proven full-body landmarks', () => {
  for (const landmark of [
    'Introduction — Go Back to the Beginning',
    '18. Responsibility and Accountability',
    'Closing Exhortation',
    'DRESS IT. KEEP IT. CULTIVATE IT. GUARD IT.'
  ]) assert.match(app, new RegExp(landmark.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});

test('SHAMAR Reader contains the proven complete teaching landmarks', () => {
  for (const landmark of [
    'Central Truth',
    'V. The SHAMAR Operating Sequence',
    'VIII. Dominion1st Declaration',
    'SHAMAR™ — WATCH • GUARD • DISCERN • PRAY • PREPARE'
  ]) assert.match(app, new RegExp(landmark.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});

test('Reader retains portability actions', () => {
  assert.match(app, /Copy Full Teaching/);
  assert.match(app, /data-act="download"/);
  assert.match(app, /data-act="share"/);
  assert.match(app, /data-act="print"/);
});

test('YARATHĒKĒ is presented as independent Reader module', () => {
  assert.match(index, /DOMINION1ST KNOWLEDGE LIBRARY/);
  assert.match(index, /Open OrEl™ Writer/);
  assert.doesNotMatch(index, /data-view="writer"/);
  assert.doesNotMatch(index, /data-view="editor"/);
  assert.match(redirect, /url=yaratheke\/index\.html/);
});

test('OrEl is presented as independent Writer module', () => {
  assert.match(orel, /Writer \/ Creator Environment/);
  assert.match(orel, /Open YARATHĒKĒ Reader/);
  assert.match(orel, /TETELESTAI/);
});

test('Reader uses dark module header and proportional publication typography', () => {
  assert.match(styles, /\.topbar\{[^}]*background:linear-gradient\([^}]*#050b3d[^}]*#0c1475/s);
  assert.match(styles, /\.topbar p\{[^}]*color:#fff/s);
  assert.match(styles, /\.reader-content\{font-family:Merriweather,Georgia,serif/s);
  assert.doesNotMatch(styles, /\.reader-content\{[^}]*monospace/s);
});
