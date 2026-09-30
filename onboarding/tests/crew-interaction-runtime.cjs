#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),behavior=require('../crew-behavior-runtime.js'),r=require('../crew-interaction-runtime.js');
const ids=['dubi','lori','ink','nova','take','zero'];let paths=0;
for(const id of ids)for(const scene of r.scenes){
 const session=r.open({primaryId:id,selectedIds:ids,scene},behavior);
 assert.equal(session.kind,'WAIT_CHILD');assert.equal(session.memberId,id);assert.equal(session.childText,null);assert.equal(session.answer,null);
 assert.equal(r.submit(session,'   '),null);assert.equal(r.submit(session,'x'.repeat(181)),null);
 const literal='내 생각 <script>alert(1)</script>',turn=r.submit(session,' '+literal+' ');
 assert.equal(turn.childText,literal);assert.equal(turn.reply,behavior.preview({primaryId:id,selectedIds:ids,scene}).text);
 for(const key of ['grade','reward','affinity','voicePlayback','autoCompletion'])assert.equal(turn[key],false,key);
 assert.equal(turn.childAuthorshipPreserved,true);assert.equal(turn.hintUsed,false);assert.equal(r.hint(session),null);
 const asked=r.hint(turn);assert.equal(asked.kind,'ONE_REQUESTED_HINT');assert.equal(asked.childText,literal);
 assert.equal(asked.hintUsed,true);assert.equal(r.hint(asked),null);assert.equal(r.submit(turn,'new answer'),null);paths++;
}
for(const bad of [{primaryId:'dubi',selectedIds:ids.slice(1),scene:'idea'},{primaryId:'dubi',selectedIds:['dubi'],scene:'idea'},{primaryId:'invented',selectedIds:ids,scene:'idea'},{primaryId:'dubi',selectedIds:ids,scene:'invalid'}])assert.equal(r.open(bad,behavior),null);
for(const key of ['autoAnswer','autoHint','crossAppAuthority','autoGrade','autoReward','autoAffinity','voicePlayback'])assert.equal(r[key],false);
console.log(JSON.stringify({gate:'EXPLICIT_CHILD_AUTHORSHIP_CREW_INTERACTION',members:6,scenes:5,paths_tested:paths,submit_requires_child_input:true,original_text_preserved:true,hint_only_on_explicit_request:true,second_hint_blocked:true,autoAnswer:false,grade:false,reward:false,affinity:false,voicePlayback:false},null,2));
