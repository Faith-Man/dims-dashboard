import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const home = await readFile('prototypes/dome-eight-module-home/index.html','utf8');
const oikonomos = await readFile('oikonomos/index.html','utf8');
const ekklesia = await readFile('ekklesia/index.html','utf8');
const modules = ['GEGRAPTAI™','NESHAMAH™','TETELESTAI™','OrEl™','YARATHĒKĒ™','SHAMAR™','OIKONOMOS™','EKKLĒSIA™'];

test('Home preview exposes all eight governing operational modules',()=>{
  for(const name of modules) assert.match(home,new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
});

test('DI and KUBERNESIS remain layers, not module cards',()=>{
  assert.match(home,/Persistent cross-module intelligence/);
  assert.match(home,/Governance \/ steering layer/);
  assert.doesNotMatch(home,/>DI<\/strong><span>[^<]*module/i);
});

test('TETELESTAI canonical route is preserved',()=>assert.match(home,/href="\.\.\/\.\.\/projects-tasks\.html"/));

test('minimum OIKONOMOS surface preserves stewardship boundary',()=>{
  assert.match(oikonomos,/Attention Now/); assert.match(oikonomos,/Resources &amp; Obligations/); assert.match(oikonomos,/Stewardship History/); assert.match(oikonomos,/TETELESTAI™ owns the action required/);
});

test('minimum EKKLESIA surface preserves people and discipleship boundary',()=>{
  assert.match(ekklesia,/People &amp; Relationships/); assert.match(ekklesia,/Discipleship \/ Pathways/); assert.match(ekklesia,/Groups \/ Ministries \/ Teams/); assert.match(ekklesia,/Needs Attention/); assert.match(ekklesia,/not a ninth module/);
});