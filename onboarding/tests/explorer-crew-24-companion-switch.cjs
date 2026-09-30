#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const runtimeApi=require(path.resolve(__dirname,'..','..','vendor','taky','explorer-crew','canonical-runtime-v1.js'));
const stateStore=require(path.resolve(__dirname,'..','..','vendor','taky','explorer-crew','state-store-v1.js'));
const host=require(path.resolve(__dirname,'..','..','vendor','taky','explorer-crew','browser-host-v1.js'));

const CORE6=['dubi','lori','ink','nova','take','zero'];
const ALL=[...CORE6,...Array.from({length:18},(_,i)=>'guide-'+String(i+7).padStart(2,'0'))];
assert.equal(host.CORE6.length,6);
assert.equal(host.ALL_CREW.length,24);
assert.deepEqual(host.ALL_CREW,ALL);

const mem=new Map();
const storage={getItem:k=>mem.get(k)||null,setItem:(k,v)=>mem.set(k,v)};
const oldState=runtimeApi.createState(CORE6);
const saved=stateStore.save(storage,oldState,{source_app:'LEGACY_CORE6'});
assert.equal(saved.ok,true);

const rt=runtimeApi.createRuntime({
  characterIds:ALL,
  storage,
  source_app:'TEST',
  companionGatePolicy:()=>({affinity_requirement_met:true,story_unlocked:true})
});

let s=rt.getState();
assert.equal(Object.keys(s.relation.members).length,24);
assert.equal(s.relation.members['guide-07'].relation_state,'UNSEEN');
assert.equal(s.relation.members['guide-24'].relation_state,'UNSEEN');

async function makeMain(id,stamp){
  await rt.cycle({
    app_id:'TEST',scene_id:'FIRST_ENCOUNTER_SEQUENCE',character_pool:ALL,active_crew:[id],current_main_character_id:id,
    interaction_result:{relation_event:{character_id:id,type:'FIRST_MET',at:stamp+'00.000Z'}}
  });
  await rt.cycle({
    app_id:'TEST',scene_id:'SHARED_ACTIVITY',character_pool:ALL,active_crew:[id],current_main_character_id:id,
    companion_gate:{affinity_requirement_met:true,story_unlocked:true},
    interaction_result:{relation_event:{character_id:id,type:'SHARED_ACTIVITY',event_id:'shared_'+id,at:stamp+'10.000Z'}}
  });
  await rt.cycle({
    app_id:'TEST',scene_id:'COMPANION_SELECTION',character_pool:ALL,active_crew:[id],current_main_character_id:id,
    interaction_result:{relation_event:{character_id:id,type:s.relation.main_character_id?'MAIN_CHANGED':'MAIN_SELECTED',at:stamp+'20.000Z'}}
  });
  s=rt.getState();
}

(async()=>{
  await makeMain('guide-07','2026-09-30T11:00:');
  assert.equal(s.relation.main_character_id,'guide-07');
  assert.equal(s.relation.members['guide-07'].relation_state,'MAIN_COMPANION');

  await makeMain('guide-19','2026-09-30T12:00:');
  assert.equal(s.relation.main_character_id,'guide-19');
  assert.equal(s.relation.members['guide-19'].relation_state,'MAIN_COMPANION');
  assert.equal(s.relation.members['guide-07'].relation_state,'COMPANION');
  assert.equal(s.relation.members['guide-07'].affinity>0,true);

  console.log(JSON.stringify({
    gate:'EXPLORER_CREW_24_COMPANION_SWITCH_V1',
    first_encounter_core6_only_contract_preserved:host.CORE6.length===6?'PASS':'FAIL',
    runtime_roster_24:'PASS',
    legacy_core6_state_migrated_to_24:'PASS',
    expansion_can_be_main:'PASS',
    main_switch_preserves_previous_relation:'PASS'
  },null,2));
})().catch(err=>{console.error(err);process.exitCode=1});
