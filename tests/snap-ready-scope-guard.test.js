const assert=require('node:assert/strict');
const Guard=require('../snap-ready-scope-guard-v01.js');
const trusted=Guard.allowedTargets(['https://ready.example.test/','https://ready.example.test/',
  'https://user:password@ready.example.test/','http://evil.example.test/',
  'http://127.0.0.1:4173/']);
assert.deepEqual(trusted,['https://ready.example.test/','http://127.0.0.1:4173/']);
assert.equal(Guard.trustedTarget('https://evil.example.test/',trusted),null);
assert.equal(Guard.trustedTarget('https://ready.example.test/path',trusted),null);
assert.equal(Guard.trustedTarget('https://ready.example.test/?other=1',trusted),null);
assert.equal(Guard.trustedTarget('https://ready.example.test/',[]),null);
assert.equal(Guard.trustedTarget('https://ready.example.test/',trusted).origin,
  'https://ready.example.test');

const incoming={
 session_id:'SESSION_1',task_id:'TASK_1',lap_id:'LAP_1',goal_id:'GOAL_1',
 from_app:'ready-set',return_target:'https://ready.example.test/',
 child_id:'CHILD_A',subject:'english',concept_skill_target:'vocabulary',
 learning_target_id:'word:1',word:'apple'
};
const one=Guard.prepareContext(incoming,{},trusted,{incoming:true,now:'2026-09-28T00:00:00Z'});
assert.equal(one.ok,true);
assert.equal(one.context.linked_context_valid,true);
assert.equal(one.context.scope_is_continuity_only,true);
assert.equal(Guard.boundScope(one.context,{},{}).ok,true);
assert.equal(Guard.boundScope(one.context,{member_id:'CHILD_B'}).reason,'BOUND_CHILD_ID_MISMATCH');
assert.equal(Guard.boundScope(one.context,{subject:'math'}).reason,'BOUND_SUBJECT_MISMATCH');
assert.equal(Guard.boundScope(one.context,{skill_id:'grammar'}).reason,
 'BOUND_CONCEPT_SKILL_TARGET_MISMATCH');
assert.equal(Guard.boundScope(one.context,{learning_target_id:'word:2'}).reason,
 'BOUND_LEARNING_TARGET_ID_MISMATCH');
assert.equal(Guard.boundScope(one.context,{subject:'ENGLISH'}).ok,true);

const two=Guard.prepareContext({
 session_id:'SESSION_2',task_id:'TASK_2',lap_id:'LAP_2',from_app:'ready-set',
 return_target:'https://ready.example.test/',word:'banana'
},one.context,trusted,{incoming:true});
assert.equal(two.ok,true);
assert.equal(two.context.child_id,undefined);
assert.equal(two.context.subject,undefined);
assert.equal(two.context.learning_target_id,undefined);
assert.equal(two.context.task_id,'TASK_2');
assert.equal(Guard.boundScope(two.context,{}).reason,'BOUND_CHILD_ID_MISSING');

const orphan=Guard.prepareContext({word:'standalone'},one.context,trusted,{incoming:true});
assert.equal(orphan.ok,true);
assert.equal(orphan.context.session_id,undefined);
assert.equal(orphan.context.word,'standalone');
assert.equal(Guard.boundScope(orphan.context,{}).reason,'LINKED_RUN_REQUIRED');

for(const bad of [
 {...incoming,return_target:'https://evil.example.test/'},
 {...incoming,return_target:'https://ready.example.test/?go=evil'},
 {...incoming,lap_id:undefined},
 {...incoming,from_app:'evil'}
]){
 const r=Guard.prepareContext(bad,one.context,trusted,{incoming:true});
 assert.equal(r.ok,false);
 assert.deepEqual(r.context,{});
}
const noProvision=Guard.prepareContext(incoming,one.context,[],{incoming:true});
assert.equal(noProvision.ok,false);
assert.equal(noProvision.reason,'UNTRUSTED_READY_TARGET');
console.log('PASS: exact Ready URL, no old-run carry, member/skill/target fail-closed (continuity != auth)');
