import test from 'node:test';
import assert from 'node:assert/strict';
import { kjvCheck, kjvParseRefs, kjvReportText } from '../src/kjv-check.js';

const KJV = new Map([
  ['Psalms|107|1', 'O give thanks unto the LORD, for he is good: for his mercy endureth for ever.'],
  ['James|1|12', 'Blessed is the man that endureth temptation: for when he is tried, he shall receive the crown of life, which the Lord hath promised to them that love him.'],
  ['Philippians|4|6', 'Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.'],
  ['Philippians|4|7', 'And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.'],
  ['2 Thessalonians|1|10', 'When he shall come to be glorified in his saints, and to be admired in all them that believe (because our testimony among you was believed) in that day.'],
  ['John|3|16', 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.'],
]);
const fetch = async () => KJV;

test('references parse, including numbered books, abbreviations and ranges', () => {
  const r = kjvParseRefs('Psalm 107:1, 1 John 4:8, II Cor 5:17, Phil 4:6‑7 and John 3:16; Hezekiah 3:4 is not a book');
  assert.deepEqual(r.map(x => x.label), ['Psalms 107:1', '1 John 4:8', '2 Corinthians 5:17', 'Philippians 4:6–7', 'John 3:16']);
});

test('wrong punctuation and wording are corrected to exact KJV', async () => {
  const { markdown, report } = await kjvCheck('“O give thanks unto the LORD; for he is good: for his mercy endureth for ever.” — *Psalm 107:1*\n\n**James 1:12** – *“Blessed is the man that endureth the trial: for when he is tried, he shall receive the crown of life, which the Lord hath promised to them that love him.”*', fetch);
  assert.equal(report.corrected.length, 2);
  assert.match(markdown, /unto the LORD, for he is good/);
  assert.match(markdown, /endureth temptation/);
});

test('exact quotes and faithful partial quotes are left alone', async () => {
  const src = '*“Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God. And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.”* — **Philippians 4:6‑7**\n\n> “For God so loved the world” — John 3:16';
  const { markdown, report } = await kjvCheck(src, fetch);
  assert.equal(report.exact, 2);
  assert.equal(markdown, src);
});

test('a quote that does not belong to its reference is flagged, not swapped', async () => {
  const src = '“Now the God of peace, that brought up Jesus from the dead, shall bring up us also by his glorious power.” — 2 Thessalonians 1:10';
  const { markdown, report } = await kjvCheck(src, fetch);
  assert.equal(markdown, src);
  assert.equal(report.mismatched.length, 1);
  assert.match(kjvReportText(report), /not this verse/);
});

test('references to verses that do not exist are flagged', async () => {
  const { report } = await kjvCheck('“Some words here today” — James 1:99', fetch);
  assert.deepEqual(report.missing, ['James 1:99']);
});
