'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {analyze,GROUPS}=require('../crew-composable-readiness.js');
const manifest=require('../crew-composable-asset-manifest.v1.json');
const r=analyze(manifest,{verifyFiles:true});
assert.equal(r.schema,'TAKY_CREW_COMPOSABLE_READINESS_V1');
assert.equal(r.summary.registered_members,6);
assert.equal(r.summary.pending_members,18);
assert.equal(r.summary.production_ready_members,0);
assert.equal(r.summary.runtime_fallback_ready_members,0);
assert.equal(r.summary.approved_group_instances,12);
assert.equal(r.summary.open_group_instances,30);
assert.equal(r.summary.pending_group_instances,126);
for(const id of ['dubi','lori','ink','nova','take','zero']){
  assert.deepEqual(r.members[id].approved_groups,['MASTER_FULL','PROFILE']);
  assert.deepEqual(r.members[id].open_groups,['PUPPET_BODY','FACE_STATES','ACTION_PARTS','PEEK_MASK','DEPTH_SHADOW']);
  assert.equal(r.members[id].production_ready,false);
  assert.equal(r.members[id].runtime_fallback_ready,false);
  assert.deepEqual(r.members[id].runtime_blockers,['PUPPET_BODY:FIELD_NEUTRAL','FACE_STATES:neutral','DEPTH_SHADOW:field_default']);
}
for(let n=7;n<=24;n++){
 const id='guide-'+String(n).padStart(2,'0');
 assert.equal(r.pending[id].production_ready,false);
 assert.equal(r.pending[id].runtime_fallback_ready,false);
 assert.ok(r.pending[id].blockers.includes('INDIVIDUAL_SOURCE_SHA'));
 assert.ok(r.pending[id].blockers.includes('CUTOUT_SHA'));
 assert.ok(r.pending[id].blockers.includes('MASK_SPEC_SHA'));
 assert.equal(r.pending[id].blockers.filter(x=>x.startsWith('GROUP:')).length,7);
}
assert.equal(r.pending['guide-24'].code,'VIVI');
console.log('COMPOSABLE_CREW_READINESS_PASS: Core6=2/7 evidence groups each, 07-24 pending source identity, production/runtime ready=0');
