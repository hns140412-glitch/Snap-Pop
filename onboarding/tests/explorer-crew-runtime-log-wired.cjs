#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const runtimeApi=require(path.resolve(__dirname,'..','..','vendor','taky','explorer-crew','canonical-runtime-v1.js'));

(async()=>{
  const rt=runtimeApi.createRuntime({characterIds:['dubi','guide-07'],source_app:'TEST'});

  let out=await rt.cycle({
    app_id:'TEST',
    scene_id:'HOME',
    character_pool:['dubi','guide-07'],
    active_crew:['dubi'],
    current_main_character_id:'dubi',
    focus_state:'FOCUS_ACTIVE'
  });
  let summary=out.output.summary;
  assert.equal(summary.schema,'EXPLORER_CREW_RUNTIME_TRACE_V2');
  assert.equal(summary.status,'PASS');
  assert.equal(summary.runtime_policy.status,'APPLIED');
  assert.equal(summary.asset.status,'READY_WITH_FALLBACK');
  assert.equal(summary.asset.static_asset,'characters/ui_cutouts/dubi.png');
  assert.equal(summary.renderer.plan_ready,true);
  assert.equal(summary.invariants.runtime_policy_not_behavior_owner,true);
  assert.equal(summary.invariants.motion_ready_does_not_imply_release,true);
  assert.equal(summary.pr10_compat.ok,true);
  assert.equal(summary.pr10_trace.schema,'CREW_RUNTIME_TRACE_V1');

  out=await rt.cycle({
    app_id:'TEST',
    scene_id:'FIRST_ENCOUNTER_SEQUENCE',
    character_pool:['dubi','guide-07'],
    active_crew:['guide-07'],
    current_main_character_id:'guide-07',
    interaction_result:{
      relation_event:{character_id:'guide-07',type:'FIRST_MET',at:'2026-09-30T14:00:00.000Z'}
    }
  });
  summary=out.output.summary;
  assert.equal(summary.asset.status,'BLOCKED_BY_SHA');
  assert.equal(summary.renderer.blocked,true);
  assert.equal(summary.state_update.relation_changed,true);
  assert.equal(rt.getState().relation.members['guide-07'].relation_state,'KNOWN');

  console.log(JSON.stringify({
    gate:'EXPLORER_CREW_RUNTIME_LOG_WIRED_V1',
    unified_trace:'PASS',
    pr10_trace_embedded:'PASS',
    policy_asset_render_recorded:'PASS',
    blocked_visual_relation_update_recorded:'PASS',
    motion_release_invariant:'PASS'
  },null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
