#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const testPolicy=({member,event})=>{const delta={REENCOUNTERED:1,SHARED_ACTIVITY:2,HELP_REQUEST_COMPLETED:2,STORY_EVENT_SHARED:2,CHAPTER_SHARED:2,SPECIAL_EVENT_SHARED:3}[event.type]||0;const ready=(member?.affinity||0)+delta>=6;return{affinity_requirement_met:ready,story_unlocked:true,character_approved:true,manifest_ready:true}};
const path=require('node:path');
const runtimeApi=require(path.resolve(__dirname,'..','..','vendor','taky','explorer-crew','canonical-runtime-v1.js'));
const handoff=require(path.resolve(__dirname,'..','..','vendor','taky','explorer-crew','handoff-v1.js'));

const snapMem=new Map(),hideMem=new Map(),readyMem=new Map();
const storage=m=>({getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v)});

(async()=>{
  const snap=runtimeApi.createRuntime({characterIds:['dubi','lori','ink','nova','take','zero'],storage:storage(snapMem),source_app:'SNAP',companionGatePolicy:testPolicy});

  const order=['dubi','lori','ink','nova','take','zero'];
  for(let i=0;i<order.length;i++){
    const id=order[i],at=`2026-09-30T00:0${i}:00.000Z`;
    await snap.cycle({
      app_id:'SNAP',scene_id:'FIRST_ENCOUNTER_SEQUENCE',character_pool:order,active_crew:[id],current_main_character_id:id,
      interaction_result:{
        relation_event:{character_id:id,type:'FIRST_MET',at},
        memory_event:{memory_id:'first_'+id,character_id:id,event_type:'FIRST_ENCOUNTER',source_app:'SNAP',scene_id:'FIRST_ENCOUNTER_SEQUENCE',timestamp:at,participants:[id],factual_summary:'첫 만남'}
      }
    });
  }
  let s=snap.getState();
  assert.equal(order.every(id=>s.relation.members[id].relation_state==='KNOWN'),true);
  assert.equal(order.every(id=>s.relation.members[id].affinity===0),true);
  assert.equal(s.relation.main_character_id,null);

  const hide=runtimeApi.createRuntime({characterIds:order,storage:storage(hideMem),source_app:'HIDE',companionGatePolicy:testPolicy});
  const seedEvent={
    relation_event:{character_id:'dubi',type:'FIRST_MET',at:'2026-09-30T01:00:00.000Z'},
    memory_event:{memory_id:'handoff_first_dubi',character_id:'dubi',event_type:'FIRST_ENCOUNTER',source_app:'SNAP',scene_id:'APP_HANDOFF',timestamp:'2026-09-30T01:00:00.000Z',participants:['dubi'],factual_summary:'두비와 만났다.'}
  };
  const token=handoff.pack(seedEvent);
  const unpacked=handoff.unpack(token);
  assert.equal(unpacked.event.relation_event.character_id,'dubi');
  await hide.cycle({app_id:'HIDE',scene_id:'APP_HANDOFF',character_pool:order,active_crew:['dubi'],current_main_character_id:'dubi',interaction_result:unpacked.event});

  const acts=[
    ['SHARED_ACTIVITY','h1','2026-09-30T01:01:00.000Z'],
    ['SPECIAL_EVENT_SHARED','h2','2026-09-30T01:02:00.000Z'],
    ['REENCOUNTERED','h3','2026-09-30T01:03:00.000Z']
  ];
  for(const [type,event_id,at] of acts){
    await hide.cycle({app_id:'HIDE',scene_id:'LEARNING',character_pool:order,active_crew:['dubi'],current_main_character_id:'dubi',
      interaction_result:{relation_event:{character_id:'dubi',type,event_id,at}}});
  }
  s=hide.getState();
  assert.equal(s.relation.members.dubi.affinity,6);
  assert.equal(s.relation.members.dubi.relation_state,'COMPANION_AVAILABLE');

  const ready=runtimeApi.createRuntime({characterIds:order,storage:storage(readyMem),source_app:'READY',companionGatePolicy:testPolicy});
  const promoteEvent={
    relation_event:{character_id:'dubi',type:'FIRST_MET',at:'2026-09-30T02:00:00.000Z'},
    memory_event:{memory_id:'ready_seed',character_id:'dubi',event_type:'FIRST_ENCOUNTER',source_app:'SNAP',scene_id:'APP_HANDOFF',timestamp:'2026-09-30T02:00:00.000Z',participants:['dubi'],factual_summary:'두비와 만났다.'}
  };
  await ready.cycle({app_id:'READY',scene_id:'APP_HANDOFF',character_pool:order,active_crew:['dubi'],current_main_character_id:'dubi',interaction_result:promoteEvent});
  for(const [type,event_id,at] of acts){
    await ready.cycle({app_id:'READY',scene_id:'SYNC_REPLAY',character_pool:order,active_crew:['dubi'],current_main_character_id:'dubi',
      interaction_result:{relation_event:{character_id:'dubi',type,event_id:'r_'+event_id,at}}});
  }
  await ready.cycle({app_id:'READY',scene_id:'COMPANION_SELECTION',character_pool:order,active_crew:['dubi'],current_main_character_id:'dubi',
    interaction_result:{relation_event:{character_id:'dubi',type:'MAIN_SELECTED',at:'2026-09-30T02:10:00.000Z'}}});
  s=ready.getState();
  assert.equal(s.relation.main_character_id,'dubi');
  assert.equal(s.relation.members.dubi.relation_state,'MAIN_COMPANION');

  console.log(JSON.stringify({
    gate:'EXPLORER_CREW_E2E_CORE_FLOW_V1',
    sequential_first_encounter:'PASS',
    no_affinity_on_first_meet:'PASS',
    hide_affinity_build:'PASS',
    companion_available_gate:'PASS',
    main_selection_after_gate:'PASS',
    event_handoff_roundtrip:'PASS'
  },null,2));
})().catch(err=>{console.error(err);process.exitCode=1});
