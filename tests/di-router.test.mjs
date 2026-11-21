import test from 'node:test';
import assert from 'node:assert/strict';
import { diSource, diKeywords, diTeachingScore, diTeachingCompare, diRecordIds, diRecordWords, diSearchRecords, diTaskFacts, diRoute, diParseRoute, diFindRecords, diOrderTeachings, diTeachingTotals, DI_MESSAGE_ONLY_RE, DI_ANSWER_RE } from '../src/shamar-worker.js';

test('teaching intent routes to YARATHĒKĒ', () => {
  for (const q of ['What have I taught about divine healing?', 'What did I teach about healing?', 'What did I preach?', 'What have I preached?', 'Find my sermon', 'Find my message', 'Find my lesson', 'Find my series', 'what did I say about healing', 'my word on healing']) {
    assert.equal(diSource(q),'teachings',q);
  }
});
test('unclear intent searches both sources', () => {
  assert.equal(diSource('divine healing'),'both');
  assert.equal(diSource('What is happening with healing?'),'both');
});
test('conversational questions request an AI synthesis instead of only a result list', () => {
  for (const q of ['Tell me about healing','What is the Holy Spirit?','How does faith work?','Explain divine healing']) assert.equal(DI_ANSWER_RE.test(q),true,q);
  assert.equal(DI_ANSWER_RE.test('Find my sermon about healing'),false);
});
test('short message requests use the conversational message draft path', () => {
  for (const q of ['Write a message about the Holy Spirit','Draft a message on healing']) assert.equal(DI_MESSAGE_ONLY_RE.test(q),true,q);
  assert.equal(DI_MESSAGE_ONLY_RE.test('Write a sermon about healing'),false);
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

// ---- TASK-0286 Workers AI routing (env.AI mocked; no network) ----
const aiReturning=(reply)=>{ const env={calls:0,AI:{run:async()=>{env.calls++; return typeof reply==='function'?reply():{response:reply};}}}; return env; };
const routeJson=(sources,terms='',kind='list')=>JSON.stringify({sources,search_terms:terms,kind});

test('record IDs are looked up first and never reach the model', async () => {
  const env=aiReturning(routeJson(['email']));
  for (const q of ['What is the status of PROJ-0049?','Show TASK-0149','Where is RB-001?','Read DIMS-TEACH-0082']) {
    const r=await diRoute(env,q);
    assert.equal(r.kind,'records',q); assert.equal(r.by,'record-id',q);
  }
  assert.equal(env.calls,0);
  assert.deepEqual(diRecordIds('Status of RB-001 and RB-001-04?'),['RB-001','RB-001-04']);
});
test('RB-### matches its whole task family; exact numbers match exactly', () => {
  const all=['RB-001-01','RB-001-11','RB-0010-01','TASK-0098','PROJ-0049'].map(n=>({task_number:n.startsWith('PROJ')?null:n,project_number:n.startsWith('PROJ')?n:null}));
  assert.deepEqual(diFindRecords(all,['RB-001']).map(x=>x.task_number),['RB-001-01','RB-001-11']);
  assert.deepEqual(diFindRecords(all,['RB-001-11']).map(x=>x.task_number),['RB-001-11']);
  assert.deepEqual(diFindRecords(all,['PROJ-0049']).map(x=>x.project_number),['PROJ-0049']);
});
test('AI choice is used for unclear questions, with validated search terms', async () => {
  const r=await diRoute(aiReturning('Here you go: '+routeJson(['teachings','tetelestai'],'healing','summary')),'Tell me about healing');
  assert.equal(r.kind,'both'); assert.equal(r.by,'ai'); assert.deepEqual(r.terms,['healing']);
  const t=await diRoute(aiReturning(routeJson(['teachings'],'Dominion Revolution')),'What did I preach about the Dominion Revolution?');
  assert.equal(t.kind,'teachings'); assert.deepEqual(t.terms,['dominion','revolution']);
});
test('tasks/projects wording goes to TETELESTAI even if the model says email', async () => {
  const r=await diRoute(aiReturning(routeJson(['email'],'DMI')),'What tasks are open for DMI?');
  assert.equal(r.kind,'tasks'); assert.equal(r.by,'ai+rules'); assert.deepEqual(r.terms,['dmi']);
});
test('email only with email wording; inbox wording stays email', async () => {
  assert.equal((await diRoute(aiReturning(routeJson(['email'])),'Tell me about healing')).kind,'both');
  assert.equal((await diRoute(aiReturning(routeJson(['tetelestai'])),'DMI inbox messages')).kind,'email');
  assert.equal((await diRoute(aiReturning(routeJson(['email'],'NSPM-7')),'What did I say about NSPM-7?')).kind,'teachings');
});
test('teaching intent cannot be routed away from teachings', async () => {
  for (const q of ['What have I taught about divine healing?','Which sermon did I give on renewing the mind?']) {
    const r=await diRoute(aiReturning(routeJson(['tetelestai'])),q);
    assert.equal(r.kind,'teachings',q);
  }
});
test('model terms not present in the question are discarded', async () => {
  const r=await diRoute(aiReturning(routeJson(['teachings','tetelestai'],'prosperity wealth')),'Tell me about healing');
  assert.equal(r.kind,'both'); assert.equal(r.terms,null);
});
test('AI failure, invalid JSON, bad sources, timeout or no binding fall back to the keyword router', async () => {
  const q='What tasks are open for DMI?';
  const cases=[
    aiReturning(()=>{throw new Error('AI down');}),
    aiReturning('not json at all'),
    aiReturning(JSON.stringify({sources:['calendar'],search_terms:'x'})),
    aiReturning(JSON.stringify({sources:['teachings','email','drive']})),
    aiReturning(JSON.stringify({sources:'teachings'})),
    {}
  ];
  for (const env of cases) { const r=await diRoute(env,q); assert.equal(r.kind,diSource(q)); assert.equal(r.by,'keywords'); }
  const slow={AI:{run:()=>new Promise(()=>{})}};
  const r=await diRoute(slow,'Tell me about healing');
  assert.equal(r.kind,'both'); assert.equal(r.by,'keywords'); assert.equal(r.reason,'ai-error');
});
test('route JSON parser accepts exactly the allowed shapes', () => {
  assert.deepEqual(diParseRoute(routeJson(['tetelestai'],'dmi')),{kind:'tasks',terms:'dmi'});
  assert.deepEqual(diParseRoute(routeJson(['drive'])),{kind:'drive',terms:''});
  assert.equal(diParseRoute(routeJson(['email','drive'])),null);
  assert.equal(diParseRoute(routeJson([])),null);
});
test('combined mode filters TETELESTAI by the routed search terms, never the DEA list', () => {
  const records=[
    {record_type:'project',project_number:'PROJ-0049',title:'The Secret to Divine Healing — Companion Materials'},
    {record_type:'project',project_number:'PROJ-0050',title:'Paradigms & Concepts Concerning Healing'},
    {record_type:'task',task_number:'TASK-0001',title:'Home Renovation',next_action:'Install flooring'}
  ];
  assert.deepEqual(diSearchRecords('Tell me about healing',records,['healing']).map(x=>x.project_number),['PROJ-0050','PROJ-0049']);
  assert.deepEqual(diSearchRecords('Tell me about healing',records,null).map(x=>x.project_number),['PROJ-0050','PROJ-0049']);
});
test('a top-ranked series is listed in message order even when scores differ', () => {
  const series='The Secret to Divine Healing';
  const scored=[[2,2640],[3,2633],[5,2630],[1,2622],[6,2618],[4,2611]].map(([n,score])=>({title:`${series} Message ${n}`,series,score}));
  scored.push({title:'Faith that heals',series:'Other',score:2000});
  const ordered=diOrderTeachings(scored);
  assert.deepEqual(ordered.slice(0,6).map(x=>x.title.match(/Message (\d+)/)[1]),['1','2','3','4','5','6']);
  assert.equal(ordered[6].title,'Faith that heals');
  const lone=[{title:'A',series:'S',score:9},{title:'B',series:'T',score:8}];
  assert.deepEqual(diOrderTeachings(lone),lone);
});
test('header counts report all-word matches, or say plainly that only some words matched', () => {
  const rows=[
    {title:'The Secret to Divine Healing Message 1',content_md:'...'},
    {title:'Divine order',content_md:'nothing about the other word'},
    {title:'Healing in the atonement',content_md:'...'}
  ];
  assert.deepEqual(diTeachingTotals(rows,['divine','healing']),{total:1,label:'teaching mentions all of: divine, healing'});
  assert.deepEqual(diTeachingTotals(rows,['healing']),{total:2,label:'teachings mention healing'});
  assert.deepEqual(diTeachingTotals(rows,['zion','grace']),{total:3,label:'teachings mention any of: zion, grace (none mention all)'});
  assert.deepEqual(diTeachingTotals(rows,[]),{total:3,label:'most recently updated teachings'});
});
test('operational questions go to the TETELESTAI/DEA queue, topic questions stay combined', () => {
  for (const q of ['What requires my attention?','What can DI work on now?','What is blocked?','What is overdue?','What should I do next?']) assert.equal(diSource(q),'tasks',q);
  assert.equal(diSource('Tell me about healing'),'both');
  assert.equal(diSource('What is the status of my healing series?'),'teachings');
});

