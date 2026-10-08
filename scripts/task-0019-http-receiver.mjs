// TASK-0019 isolated HTTP receiver. Do not deploy publicly without
// durable shared storage, TLS termination, rate limiting, and governance approval.
import { createServer } from 'node:http';
import { DurableEvidenceInbox } from './task-0019-durable-inbox.mjs';

const MAX_BODY = 1024 * 1024;
export function createEvidenceServer({ secret, directory }) {
  if (typeof secret !== 'string' || !secret) throw new Error('Webhook secret required');
  const inbox = new DurableEvidenceInbox(directory);
  return createServer(async (req, res) => {
    const respond = (status, message) => {
      res.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store' });
      res.end(JSON.stringify({ message }));
    };
    if (req.url !== '/webhooks/github' || req.method !== 'POST') {
      respond(404, 'Not found'); return;
    }
    if (Number(req.headers['content-length'] || 0) > MAX_BODY) {
      respond(413, 'Payload too large'); return;
    }
    const chunks = [];
    let size = 0;
    try {
      for await (const chunk of req) {
        size += chunk.length;
        if (size > MAX_BODY) { respond(413, 'Payload too large'); return; }
        chunks.push(chunk);
      }
      const result = await inbox.receiveGithub({
        rawBody: Buffer.concat(chunks), headers: req.headers, secret
      });
      respond(result.duplicate ? 200 : 202, result.duplicate ? 'Duplicate acknowledged' : 'Evidence queued for review');
    } catch (error) {
      if (/signature|secret|delivery ID|Unsupported event|Unexpected repository/i.test(error.message)) {
        respond(401, 'Rejected'); return;
      }
      if (/Payload too large/.test(error.message)) { respond(413, 'Payload too large'); return; }
      if (error instanceof SyntaxError) { respond(400, 'Invalid payload'); return; }
      respond(500, 'Internal error');
    }
  });
}
