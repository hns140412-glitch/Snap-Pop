#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const systemApi=require(path.resolve(__dirname,'..','..','vendor','taky','explorer-crew','system-v2.js'));
const consumerApi=require(path.resolve(__dirname,'..','..','vendor','taky','explorer-crew','app-consumer-v2.js'));

const mem=new Map();
const storage={
  getItem:key=>mem.has(key)?mem.get(key):null,
  setItem:(key,value)=>mem.set(key,value),
  removeItem:key=>mem.delete(key)
};

(async()=>{
  assert.equal(systemApi.VERSION,'EXPLORER_CREW_SYSTEM_V2');
  assert.equal(systemApi.ALL_CREW.length,24);
  assert.deepEqual(systemApi.ALL_CREW.slice(0,6),['dubi','lori','ink','nova','take','zero']);

  const system=systemApi.create({app_id:'SNAP',storage});
  assert.equal(system.ownership.runtime,'CANONICAL_ONLY');
  assert.equal(system.ownership.legacy,'INPUT_MIGRATION_ONLY');
  assert.equal(system.snapshot().relation.members.dubi.relation_state,'UNSEEN');

  const at='2026-10-01T00:00:00.000Z';
  await system.dispatch({
    character_id:'dubi',
    scene_id:'FIRST_ENCOUNTER_SEQUENCE',
    interaction_result:{relation_event:{character_id:'dubi',type:'FIRST_MET',at}}
  });
  assert.equal(system.snapshot().relation.members.dubi.relation_state,'KNOWN');

  const visual=await system.renderPlan({
    character_id:'dubi',
    scene_id:'HOME_RADIO',
    delivery_mode:'TEXT'
  });
  assert.equal(visual.ok,true);
  assert.equal(visual.render_plan.kind,'STATIC_APPROVED_COMPAT');
  assert.equal(visual.render_plan.character_id,'dubi');

  const host={dataset:{}};
  const consumer=consumerApi.create({app_id:'SNAP',storage});
  const before=JSON.stringify(consumer.system.snapshot());
  const synced=await consumer.sync({host,character_id:'dubi',scene_id:'HOME',render:true});
  const after=JSON.stringify(consumer.system.snapshot());
  assert.equal(synced.ok,true);
  assert.equal(host.dataset.explorerCrewRuntime,'CANONICAL_ONLY');
  assert.equal(host.dataset.explorerCrewConsumer,'EXPLORER_CREW_APP_CONSUMER_V2');
  assert.equal(synced.relationWrite,false);
  assert.equal(synced.memoryWrite,false);
  assert.equal(host.dataset.explorerCrewRenderPlan,'STATIC_APPROVED_COMPAT');
  await consumer.sync({host,character_id:'dubi',scene_id:'HOME',render:false});
  assert.equal(host.dataset.explorerCrewRenderPlan,'STATIC_APPROVED_COMPAT');
  assert.equal(before,after);

  console.log(JSON.stringify({
    gate:'EXPLORER_CREW_SYSTEM_V2',
    roster_24:'PASS',
    single_runtime_owner:'PASS',
    explicit_relation_event:'PASS',
    canonical_static_render_plan:'PASS',
    consumer_read_only_sync:'PASS',
    legacy_owner:'INPUT_MIGRATION_ONLY',
    root_activation:false,
    netlify:'HOLD'
  },null,2));
})().catch(err=>{console.error(err);process.exitCode=1});
