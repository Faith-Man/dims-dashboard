import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const source = await readFile(new URL('../netlify/functions/orai.js', import.meta.url), 'utf8');
const { handler } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

const event = (body, overrides = {}) => ({
  httpMethod: 'POST',
  headers: { 'content-type': 'application/json', 'x-nf-request-id': 'test-request' },
  body: JSON.stringify(body),
  ...overrides
});

test('rejects non-POST methods', async () => {
  const result = await handler(event({}, { httpMethod: 'GET' }));
  assert.equal(result.statusCode, 405);
  assert.equal(result.headers.Allow, 'POST');
});

test('rejects malformed and oversized payloads', async () => {
  assert.equal((await handler(event({}, { body: '{' }))).statusCode, 400);
  assert.equal((await handler(event({}, { body: JSON.stringify({ mode: 'dims_brief', input: 'x'.repeat(17_000) }) }))).statusCode, 413);
});

test('rejects prophetic generation mode', async () => {
  const result = await handler(event({ mode: 'prophesy_flow', input: 'generate prophecy' }));
  assert.equal(result.statusCode, 422);
  assert.equal(JSON.parse(result.body).error, 'Unsupported mode');
});

test('validates closed payload shape', async () => {
  const result = await handler(event({ mode: 'dims_brief', extra: true }));
  assert.equal(result.statusCode, 422);
});

test('accepts base64 JSON but returns unavailable without an API key', async () => {
  const body = Buffer.from(JSON.stringify({ mode: 'dims_brief' })).toString('base64');
  const result = await handler(event({}, { body, isBase64Encoded: true }));
  assert.equal(result.statusCode, 503);
  assert.equal(JSON.parse(result.body).code, 'ORAI_NOT_CONFIGURED');
});
