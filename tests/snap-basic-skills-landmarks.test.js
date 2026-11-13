'use strict';
// node tests/snap-basic-skills-landmarks.test.js — BSP-20261113 landmarks (SP-1 비율 장터, SP-2 낱말 정원)
const assert = require('assert');
const marks = require('../data/landmarks.json');
const want = { 'ratio-market': 2, 'word-garden': 1 };
for (const [id, floor] of Object.entries(want)) {
  const m = marks.find(x => x.id === id);
  assert.ok(m, id + ' exists');
  assert.strictEqual(m.sourceRef, 'BSP-20261113');
  assert.strictEqual(m.floorLevel, floor);
  assert.ok(m.unitPath && m.unitPath.includes('>'), id + ' unitPath');
  assert.strictEqual(m.steps.length, 3, id + ' has 3 steps (app stepsFor contract)');
  for (const s of m.steps) assert.ok(s.length >= 3 && s.slice(0, 3).every(v => String(v).trim()), id + ' step text');
  // keep labels apart on the map (no two landmarks within 8% in both axes)
  for (const o of marks) if (o !== m) assert.ok(Math.abs(o.x - m.x) >= 8 || Math.abs(o.y - m.y) >= 8, id + ' too close to ' + o.id);
}
const ratio = marks.find(x => x.id === 'ratio-market');
assert.ok(/에 대한/.test(ratio.steps[1][1]) && /기준량/.test(ratio.steps[1][2]), 'SP-1 step 2 asks for the 기준량 frame');
console.log('SNAP_BASIC_SKILLS_LANDMARKS_TEST: PASS');
