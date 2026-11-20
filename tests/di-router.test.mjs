import test from 'node:test';
import assert from 'node:assert/strict';
import { diSource, diKeywords, diTeachingScore } from '../src/shamar-worker.js';

test('teaching intent routes to YARATHĒKĒ', () => {
  for (const q of ['What have I taught about divine healing?', 'What did I teach about healing?', 'What did I preach?', 'What have I preached?', 'Find my sermon', 'Find my message', 'Find my lesson', 'Find my series', 'what did I say about healing', 'my word on healing']) {
    assert.equal(diSource(q),'teachings',q);
  }
});
test('unclear intent searches both sources', () => {
  assert.equal(diSource('divine healing'),'both');
  assert.equal(diSource('What is happening with healing?'),'both');
});
test('explicit email and Drive intent retains routing', () => {
  assert.equal(diSource('find my inbox'),'email');
  assert.equal(diSource('find Drive folders'),'drive');
});
test('healing query extracts the topic, not the intent', () => {
  assert.deepEqual(diKeywords('What have I taught about divine healing?'),['divine','healing']);
});
test('exact title/series matches outrank single-word content', () => {
  const words=['divine','healing'];
  const series=Array.from({length:6},(_,i)=>({title:`The Secret to Divine Healing Message ${i+1}`,series:'The Secret to Divine Healing',content_md:'Faith and restoration'}));
  const noise={title:'General health notes',series:'Other',content_md:'divine '.repeat(100)+'healing '.repeat(100)};
  const results=[noise,...series].sort((a,b)=>diTeachingScore(b,words)-diTeachingScore(a,words));
  assert.deepEqual(results.slice(0,6).map(x=>x.title),series.map(x=>x.title));
});
