const assert=require('node:assert/strict');
const rel=require('../../vendor/taky/explorer-crew/relation-affinity-v1.js');
const pol=require('../../vendor/taky/explorer-crew/companion-gate-policy-v1.js');
const g=pol.evaluate({context:{companion_gate:{affinity_requirement_met:true,story_unlocked:true}},event:{character_id:'dubi'}});
assert.equal(rel.gateResult(g).ok,true);
assert.equal(g.expression_status.manifest_ready,false);
console.log('RELATION_ASSET_SEPARATION=PASS');
