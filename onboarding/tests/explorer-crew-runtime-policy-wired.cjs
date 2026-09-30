#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const runtimeApi=require(path.resolve(__dirname,'..','..','vendor','taky','explorer-crew','canonical-runtime-v1.js'));

(async()=>{
  const rt=runtimeApi.createRuntime({characterIds:['dubi'],source_app:'TEST'});

  let out=await rt.cycle({
    app_id:'TEST',
    scene_id:'HOME',
    character_pool:['dubi'],
    active_crew:['dubi'],
    current_main_character_id:'dubi',
    focus_state:'FOCUS_ACTIVE'
  });
  let a=out.trace.find(x=>x[0]==='ARBITRATION')[1];
  assert.equal(a.runtime_policy.status,'APPLIED');
  assert.equal(a.runtime_policy.semantic_interaction_mode,'SILENT');
  assert.equal(a.runtime_policy.delivery_mode,'NONE');
  assert.equal(a.runtime_policy.scene_slot,'FG_LEFT');

  out=await rt.cycle({
    app_id:'TEST',
    scene_id:'HOME',
    character_pool:['dubi'],
    active_crew:['dubi'],
    current_main_character_id:'dubi',
    child_state:'PAUSED',
    delivery_mode:'TEXT'
  });
  a=out.trace.find(x=>x[0]==='ARBITRATION')[1];
  assert.equal(a.behavior_state,'PEEK');
  assert.equal(a.interaction_mode,'TALK');
  assert.equal(a.runtime_policy.status,'APPLIED');
  assert.equal(a.runtime_policy.delivery_mode,'TEXT');
  assert.equal(a.runtime_policy.semantic_interaction_mode,'TALK');

  out=await rt.cycle({
    app_id:'TEST',
    scene_id:'HOME',
    character_pool:['dubi'],
    active_crew:['dubi'],
    current_main_character_id:'dubi',
    help_requested:true,
    delivery_mode:'TEXT'
  });
  a=out.trace.find(x=>x[0]==='ARBITRATION')[1];
  assert.equal(a.behavior_state,'GUIDE');
  assert.equal(a.interaction_mode,'GUIDE');
  assert.equal(a.runtime_policy.status,'APPLIED');

  console.log(JSON.stringify({
    gate:'EXPLORER_CREW_RUNTIME_POLICY_WIRED_V1',
    canonical_arbitration_hook:'PASS',
    focus_policy_applied:'PASS',
    talk_semantics_preserved:'PASS',
    guide_semantics_preserved:'PASS',
    delivery_mode_separate:'PASS'
  },null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
