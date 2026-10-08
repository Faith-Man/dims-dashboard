// TASK-0019 — LOCAL-ONLY runner for authenticated webhook receiver.
// This is deliberately not a deployment entrypoint. No public binding.
import { createEvidenceServer } from './task-0019-http-receiver.mjs';

const secret = process.env.TASK0019_GITHUB_WEBHOOK_SECRET;
const directory = process.env.TASK0019_PRIVATE_EVIDENCE_DIR;
if (!secret || secret.length < 24) throw new Error('Set a strong TASK0019_GITHUB_WEBHOOK_SECRET');
if (!directory || !directory.startsWith('/')) throw new Error('Set an absolute private evidence directory');
const port = Number(process.env.TASK0019_PORT || '8789');
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Invalid local port');

const server = createEvidenceServer({ secret, directory });
server.listen(port, '127.0.0.1', () => {
  console.log('TASK-0019 local-only receiver ready on 127.0.0.1:' + port);
});
for (const signal of ['SIGTERM','SIGINT']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
