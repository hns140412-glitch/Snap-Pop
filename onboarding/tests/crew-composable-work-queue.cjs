'use strict';
const assert=require('node:assert/strict');
const {build}=require('../crew-composable-work-queue.js');
const manifest=require('../crew-composable-asset-manifest.v1.json');
const q=build(manifest);
assert.equal(q.schema,'TAKY_CREW_COMPOSABLE_WORK_QUEUE_V1');
assert.equal(q.summary.registered_members,6);
assert.equal(q.summary.pending_members,18);
assert.equal(q.summary.P0_member_tasks,18);
assert.equal(q.summary.P1_member_tasks,60);
assert.equal(q.summary.P2_member_tasks,6);
assert.equal(q.summary.P1_shared_tasks,8);
for(const m of q.members){
 assert.equal(m.counts.P0,3);
 assert.equal(m.counts.P1,10);
 assert.equal(m.counts.P2,1);
 assert.deepEqual(m.tasks.filter(t=>t.priority==='P0').map(t=>t.group+':'+t.key),[
  'PUPPET_BODY:FIELD_NEUTRAL','FACE_STATES:neutral','DEPTH_SHADOW:field_default'
 ]);
 assert.equal(m.runtime_fallback_eligible,false);
}
assert.equal(q.pending_members[17].code,'VIVI');
assert.equal(q.pending_members[17].status,'BLOCKED_BEFORE_COMPOSABLE_ART');
console.log('COMPOSABLE_WORK_QUEUE_PASS: Core6 P0=18, P1=60, P2=6; shared P1=8; GUIDE pending=18');
