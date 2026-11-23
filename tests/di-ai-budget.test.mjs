import test from 'node:test';
import assert from 'node:assert/strict';
import { diAI } from '../src/shamar-worker.js';

// A fake Workers AI binding: each model answers after its own delay, or never.
function fakeAI(plan) {
  const calls = [];
  return {
    calls,
    AI: {
      run(model) {
        calls.push(model);
        const step = plan[model];
        if (!step || step.hang) return new Promise(() => {});
        return new Promise(resolve => setTimeout(() => resolve({ response: step.text }), step.ms || 0));
      }
    }
  };
}
const msgs = [{ role: 'user', content: 'Tell me about healing?' }];

test('a fast first model answers normally', async () => {
  const env = fakeAI({ '@cf/openai/gpt-oss-120b': { text: 'Healing answer', ms: 5 } });
  const out = await diAI(env, msgs, 1200, 5000);
  assert.equal(out.text, 'Healing answer');
  assert.equal(out.model, '@cf/openai/gpt-oss-120b');
});

test('a hanging first model is abandoned and the next model answers within the budget', async () => {
  const env = fakeAI({ '@cf/openai/gpt-oss-120b': { hang: true }, '@cf/meta/llama-4-scout-17b-16e-instruct': { text: 'Scout answer', ms: 5 } });
  const started = Date.now();
  const out = await diAI(env, msgs, 1200, 12000);
  assert.equal(out.text, 'Scout answer');
  assert.ok(Date.now() - started < 12500, 'stayed within the budget');
});

test('when every model hangs, DI² returns no AI text once the budget is spent (callers then show the plain list)', async () => {
  const env = fakeAI({});
  const started = Date.now();
  const out = await diAI(env, msgs, 1200, 9000);
  const took = Date.now() - started;
  assert.deepEqual(out, { text: '', model: null });
  assert.ok(took < 9500, `gave up within the 9 s budget (${took} ms)`);
  assert.ok(env.calls.length >= 2, 'tried a fallback model before giving up');
});

test('short answers default to a 30 s budget and long drafts to 90 s', () => {
  // Defaults are read from the function's parameter list so the budgets stay documented in one place.
  const src = diAI.toString();
  assert.match(src, /maxTokens > 2500 \? DI_AI_DRAFT_BUDGET_MS : DI_AI_BUDGET_MS/);
});
