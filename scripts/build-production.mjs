import { cp, mkdir, rm } from 'node:fs/promises';

// Explicit runtime allowlist: archives, audits, docs, tests, enterprise exports,
// backups, and superseded HTML variants never enter the deployable artifact.
const runtimeFiles = [
  '_redirects', 'index.html', 'admin.html', 'admin.js', 'ai-buttons-injector.js',
  'orai.js', 'dims-shared.css', 'dims-glossary-tooltips.js',
  'command-alerts.html', 'enterprise-forms.html', 'executive-dashboard.html',
  'institutional-queue.html', 'intelligence-briefing.html', 'mission-control.html',
  'neshamah.html', 'orel-studio.html', 'orel-teaching-studio.html',
  'peace-safety-intelligence.html', 'projects-tasks.html', 'system-status.html',
  'teaching-library-v3.html', 'vault-architecture.html', 'glossary', 'teachings'
];

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
for (const source of runtimeFiles) {
  await cp(source, `dist/${source}`, { recursive: true });
}
console.log(`Built dist/ from ${runtimeFiles.length} explicitly allowed runtime paths.`);
