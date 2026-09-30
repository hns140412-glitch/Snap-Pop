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
  let asset=out.trace.find(x=>x[0]==='ASSET')[1];
  let render=out.trace.find(x=>x[0]==='RENDER')[1];
  assert.equal(asset.asset_status,'READY_WITH_FALLBACK');
  assert.equal(asset.static_asset,'characters/ui_cutouts/dubi.png');
  assert.equal(asset.generated,false);
  assert.equal(render.plan_ready,true);
  assert.equal(render.static_fallback,true);

  out=await rt.cycle({
    app_id:'TEST',
    scene_id:'FIRST_ENCOUNTER_SEQUENCE',
    character_pool:['dubi','guide-07'],
    active_crew:['guide-07'],
    current_main_character_id:'guide-07',
    delivery_mode:'TEXT',
    interaction_result:{
      relation_event:{character_id:'guide-07',type:'FIRST_MET',at:'2026-09-30T13:00:00.000Z'}
    }
  });
  asset=out.trace.find(x=>x[0]==='ASSET')[1];
  render=out.trace.find(x=>x[0]==='RENDER')[1];
  assert.equal(asset.asset_status,'BLOCKED_BY_SHA');
  assert.equal(render.blocked,true);
  assert.equal(rt.getState().relation.members['guide-07'].relation_state,'KNOWN');

  console.log(JSON.stringify({
    gate:'EXPLORER_CREW_ASSET_RENDER_WIRED_V1',
    canonical_asset_hook:'PASS',
    core6_real_static_fallback:'PASS',
    static_render_plan_ready:'PASS',
    expansion_visual_blocked:'PASS',
    relation_preserved_when_visual_blocked:'PASS'
  },null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
