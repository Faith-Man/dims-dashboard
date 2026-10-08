// TASK-0019 — local durable evidence inbox for isolated server-side testing.
// Not suitable for distributed production without a transactional database.
import { mkdir, writeFile, readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { intakeGithubWebhook } from './task-0019-github-webhook.mjs';

export class DurableEvidenceInbox {
  constructor(directory) {
    if (!directory || typeof directory !== 'string') throw new Error('Private directory required');
    this.directory = directory;
  }
  async receiveGithub(args) {
    const evidence = intakeGithubWebhook(args);
    await mkdir(this.directory, { recursive: true, mode: 0o700 });
    const name = createHash('sha256').update(evidence.dedupeKey).digest('hex') + '.json';
    const path = join(this.directory, name);
    const record = { ...evidence, reviewState: 'unreviewed' };
    try {
      await writeFile(path, JSON.stringify(record) + '\n', { flag: 'wx', mode: 0o600 });
      return { accepted: true, duplicate: false, evidence: record };
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      const previous = JSON.parse(await readFile(path, 'utf8'));
      return { accepted: false, duplicate: true, evidence: previous };
    }
  }
  async list() {
    try {
      const names = (await readdir(this.directory)).filter(x => /^[a-f0-9]{64}\.json$/.test(x)).sort();
      return Promise.all(names.map(async name => JSON.parse(await readFile(join(this.directory, name), 'utf8'))));
    } catch (error) {
      if (error.code === 'ENOENT') return [];
      throw error;
    }
  }
}
