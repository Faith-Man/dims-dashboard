import test from 'node:test';
import assert from 'node:assert/strict';
import { diSource, diKeywords, diTeachingScore, diTeachingCompare, diRecordIds, diRecordWords, diSearchRecords, diTaskFacts } from '../src/shamar-worker.js';

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

test('record identifiers take precedence over every source', () => {
  for (const q of ['What is the status of PROJ-0049?', 'Show TASK-0149 in DMI', 'Read DIMS-TEACH-0082', 'Find DIMS-0001']) assert.equal(diSource(q),'records',q);
  assert.deepEqual(diRecordIds('Compare PROJ-0049 and TASK-0149'),['PROJ-0049','TASK-0149']);
});
test('tasks and projects override DMI module name, but inbox wording routes email', () => {
  assert.equal(diSource('What tasks are open for DMI?'),'tasks');
  assert.equal(diSource('Show DMI projects'),'tasks');
  assert.equal(diSource('DMI inbox messages'),'email');
  assert.equal(diSource('What emails arrived for DMI?'),'email');
  assert.equal(diSource('Find DMI'), 'both');
});
test('combined search filters out unrelated DEA records', () => {
  const records=[
    {record_type:'task',task_number:'TASK-0149',title:'DMI email integration',next_action:'Verify mail sync'},
    {record_type:'project',project_number:'PROJ-0049',title:'DMI mail service'},
    {record_type:'task',task_number:'TASK-0001',title:'Home Renovation',next_action:'Install flooring'},
    {record_type:'task',task_number:'TASK-0002',title:'Healing teaching search',next_action:'Review series'}
  ];
  assert.deepEqual(diSearchRecords('Tell me about healing',records).map(x=>x.task_number),['TASK-0002']);
  assert.deepEqual(diSearchRecords('DMI',records).map(x=>x.task_number||x.project_number),['TASK-0149','PROJ-0049']);
  assert.deepEqual(diTaskFacts('What tasks are open for DMI?',records).items.map(x=>x.task_number),['TASK-0149']);
  assert.deepEqual(diRecordWords('Tell me about healing'),['healing']);
});
test('messages in the same series sort numerically after relevance ranking', () => {
  const records=[6,2,5,1,4,3].map(n=>({title:`The Secret to Divine Healing Message ${n}`,series:'The Secret to Divine Healing',score:2610}));
  records.sort(diTeachingCompare);
  assert.deepEqual(records.map(x=>x.title.match(/Message (\d+)/)[1]),['1','2','3','4','5','6']);
});
