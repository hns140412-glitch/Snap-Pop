#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const hostApi=require(path.resolve(__dirname,'..','..','vendor','taky','explorer-crew','browser-host-v1.js'));

const mem=()=>{const m=new Map();return {getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)}};

(async()=>{
  const snapStorage=mem();
  const snap=hostApi.create({app_id:'SNAP',storage:snapStorage});
  assert.equal(snap.storyStatus('guide-07').state,'LOCKED');

  await snap.runtime.cycle({
    app_id:'SNAP',scene_id:'FIRST_ENCOUNTER_SEQUENCE',
    character_pool:hostApi.ALL_CREW,active_crew:['guide-07'],current_main_character_id:'guide-07',
    interaction_result:{relation_event:{character_id:'guide-07',type:'FIRST_MET',at:'2026-09-30T13:00:00.000Z'}}
  });

  await snap.runtime.cycle({
    app_id:'SNAP',scene_id:'SHARED_ACTIVITY',
    character_pool:hostApi.ALL_CREW,active_crew:['guide-07'],current_main_character_id:'guide-07',
    companion_gate:{affinity_requirement_met:true},
    interaction_result:{relation_event:{character_id:'guide-07',type:'SHARED_ACTIVITY',event_id:'s1',at:'2026-09-30T13:01:00.000Z'}}
  });
  let state=snap.snapshot();
  assert.equal(state.relation.members['guide-07'].relation_state,'AFFINITY_BUILDING');

  snap.unlockStoryGate({
    character_id:'guide-07',
    story_gate_id:'STORY_GATE_TEST',
    evidence_ref:'episode:story-001',
    at:'2026-09-30T13:02:00.000Z'
  });
  assert.equal(snap.storyStatus('guide-07').state,'UNLOCKED');

  await snap.runtime.cycle({
    app_id:'SNAP',scene_id:'REENCOUNTER',
    character_pool:hostApi.ALL_CREW,active_crew:['guide-07'],current_main_character_id:'guide-07',
    companion_gate:{affinity_requirement_met:true},
    interaction_result:{relation_event:{character_id:'guide-07',type:'REENCOUNTERED',event_id:'s2',at:'2026-09-30T13:03:00.000Z'}}
  });
  state=snap.snapshot();
  assert.equal(state.relation.members['guide-07'].relation_state,'COMPANION_AVAILABLE');

  const hideStorage=mem();
  const hide=hostApi.create({app_id:'HIDE',storage:hideStorage});
  const url=snap.encodeEventForUrl('https://example.test/hide',{
    story_gate_event:{
      type:'UNLOCK',
      character_id:'guide-08',
      story_gate_id:'CROSS_APP_STORY',
      evidence_ref:'episode:cross-app-001',
      at:'2026-09-30T13:04:00.000Z'
    },
    relation_event:{character_id:'guide-08',type:'FIRST_MET',at:'2026-09-30T13:04:00.000Z'}
  });
  const consumed=await hide.consumeUrl(url);
  assert.equal(consumed.ok,true);
  assert.equal(consumed.consumed,true);
  assert.equal(hide.storyStatus('guide-08').state,'UNLOCKED');
  assert.equal(hide.snapshot().relation.members['guide-08'].relation_state,'KNOWN');

  console.log(JSON.stringify({
    gate:'EXPLORER_CREW_STORY_GATE_WIRED_V1',
    default_locked:'PASS',
    affinity_without_story_stays_locked:'PASS',
    evidence_unlock:'PASS',
    companion_available_after_both_conditions:'PASS',
    cross_app_story_gate_handoff:'PASS'
  },null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
