#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const behavior=require('../crew-behavior-runtime.js');
const semantic=require('../crew-semantic-behavior.js');
const policy=require('../crew-runtime-policy.js');
const members=['dubi','lori','ink','nova','take','zero'],selected=members.slice(0,5);
assert.deepEqual([...behavior.memberIds],members);
assert.equal(behavior.scenes.length,6);assert.equal(behavior.version,'COMPANION_CORE6_BEHAVIOR_PROJECTION_V2');
const expected=['와! 해보자!','괜찮아, 천천히 해도 돼!','음... 다른 방법도 있지.','가보자! 하면 되지!','차근차근 같이 해보자.','언제나, 네 이야기를 응원해!'];
for(let i=0;i<6;i++){
  const current=i===5?members: selected;
  const cue=behavior.preview({primaryId:members[i],selectedIds:current,scene:'home'});
  assert.equal(cue.memberId,members[i]);assert.equal(cue.text,expected[i]);assert.equal(cue.scene,'home');
  assert.equal(cue.grade,false);assert.equal(cue.reward,false);assert.equal(cue.affinity,false);assert.equal(cue.autoHint,false);assert.equal(cue.autoWrite,false);assert.equal(cue.voicePlayback,false);
  assert.ok(Object.isFrozen(cue));
  for(const scene of behavior.scenes.filter(x=>x!=='home'))assert.ok(behavior.preview({primaryId:members[i],selectedIds:current,scene}).text.length>5);
}
for(const q of [
 {primaryId:'zero',selectedIds:selected},{primaryId:'unknown',selectedIds:selected},
 {primaryId:'lori',selectedIds:selected.slice(0,4)},{primaryId:'lori',selectedIds:['dubi','lori','lori','nova','take']},
 {primaryId:'lori',selectedIds:selected,scene:'answer'},{primaryId:'lori',selectedIds:selected,scene:'grading'}
])assert.equal(behavior.preview(q),null);
assert.equal(behavior.rootRegistryActivation,false);assert.equal(behavior.readyHideAuthority,false);
assert.equal(behavior.autoWrite,false);assert.equal(behavior.autoReward,false);assert.equal(behavior.autoAffinity,false);
const commands=behavior.sceneCommands({primaryId:'lori',selectedIds:members,scene:'description'},semantic);
assert.equal(commands.length,6);assert.equal(commands[0].character_id,'lori');assert.equal(commands[0].role,'MAIN');assert.equal(commands[0].behavior_state,'OBSERVE');
assert(commands.slice(1).every(x=>x.role==='AMBIENT'));
assert(commands.slice(1).every(x=>behavior.ambientByScene.description.includes(x.ambient_action)));
const allocated=policy.allocateScene({commands});
assert.equal(allocated.accepted.length,3);assert.equal(allocated.rejected.length,3);
assert.equal(allocated.accepted[0].command.character_id,'lori');assert.equal(allocated.accepted.filter(x=>x.command.role==='AMBIENT').length,2);
assert.equal(new Set(allocated.occupied_slots).size,allocated.occupied_slots.length);
const recent=['dubi:'+behavior.ambientByScene.home[0]];
assert.notEqual(behavior.chooseAmbientAction('home','dubi',recent),behavior.ambientByScene.home[0]);
console.log(JSON.stringify({gate:'CORE6_BEHAVIOR_PROJECTION',source:'RECOVERED_SIGNED_CORE6_LINEAGE',members:6,scenes:6,explicit_primary_guard:'PASS',wrong_identity_guard:'PASS',no_grade_reward_affinity:'PASS',owner_scope:'ISOLATED_NO_ROOT_OR_READY_HIDE_PROMOTION'},null,2));
