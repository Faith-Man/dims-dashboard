import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const guardedPages = [
  ['projects-tasks.html', ['saveProject', 'saveTask']],
  ['enterprise-forms.html', ['saveAsset']],
  ['orel-studio.html', ['saveTeaching', 'deleteTeaching']],
  ['neshamah.html', ['saveNeshamah']]
];

test('shared auth module owns the interim Supabase configuration and session guard', async () => {
  const source = await readFile('dims-auth.js', 'utf8');
  assert.match(source, /export const supabase = createClient/);
  assert.match(source, /export async function requireSession/);
  assert.match(source, /signInWithOtp/);
  assert.match(source, /signOut/);
  assert.match(source, /onAuthStateChange/);
});

for (const [page, mutations] of guardedPages) {
  test(`${page} disables write controls and guards mutations`, async () => {
    const source = await readFile(page, 'utf8');
    assert.match(source, /data-dims-auth/);
    assert.match(source, /data-auth-write disabled/);
    assert.match(source, /from '\.\/dims-auth\.js'/);
    for (const mutation of mutations) {
      const declaration = new RegExp(`(?:async function ${mutation}|\\.${mutation}\\s*=\\s*async function)\\([^)]*\\)\\s*\\{[\\s\\S]{0,160}requireSession`);
      assert.match(source, declaration, `${mutation} must guard before mutation`);
    }
  });
}

test('admin reuses the shared client and defensively guards teaching writes', async () => {
  const source = await readFile('admin.js', 'utf8');
  assert.match(source, /import \{ requireSession, supabase \} from '\.\/dims-auth\.js'/);
  assert.match(source, /async function upsertTeaching[\s\S]{0,120}requireSession/);
  assert.doesNotMatch(source, /createClient/);
});
