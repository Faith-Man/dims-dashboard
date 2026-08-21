import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const html = await readFile('prototypes/dome-eight-module-shell/index.html', 'utf8');
const css = await readFile('prototypes/dome-eight-module-shell/styles.css', 'utf8');

const modules = ['GEGRAPTAI™','NESHAMAH™','TETELESTAI™','OrEl™','YARATHĒKĒ™','SHAMAR™','OIKONOMOS™','EKKLĒSIA™'];

test('preview exposes exactly the eight governed first-class module identities', () => {
  for (const moduleName of modules) assert.match(html, new RegExp(moduleName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  const cards = html.match(/class="module-card"/g) || [];
  assert.equal(cards.length, 8);
});

test('supporting classifications do not become extra module cards', () => {
  assert.match(html, /RUARĒ!™ lives here/);
  assert.match(html, /MARTUREŌ™ is deorbited, not deleted/);
  assert.match(html, /EKPOREUMA™ remains historical provenance only/);
  assert.match(html, /Persistent cross-module intelligence layer\. Not a ninth module/);
  assert.match(html, /Governance, steering and orchestration\. Not a module/);
});

test('OrEl and YARATHĒKĒ have independent routes', () => {
  assert.match(html, /href="\.\.\/\.\.\/orel\/index\.html"/);
  assert.match(html, /href="\.\.\/\.\.\/yaratheke\/index\.html"/);
});

test('preview carries approved identity banner and responsive layout', () => {
  assert.match(css, /\.dome-header\{background:linear-gradient/);
  assert.match(css, /color:var\(--white\)/);
  assert.match(css, /@media\(max-width:580px\)/);
});
