#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const presenter=require('../crew-visual-presenter.js'),visual=require('../visual-id-runtime.js');
const gate=JSON.parse(fs.readFileSync(path.join(__dirname,'..','asset-and-release-gate.json'),'utf8'));
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const expected=['dubi','lori','ink','nova','take','zero'];
assert.deepEqual(visual.memberIds,expected);
assert.equal(presenter.behaviorOwner,false);assert.equal(presenter.assetResolver,false);
assert.equal(presenter.automaticArtGeneration,false);assert.equal(presenter.rootRegistryActivation,false);
let passed=0;
for(const id of expected)for(const state of presenter.states){
 const src=visual.asset(id,'cutout'),sha=gate.required_assets[src];
 const plan={kind:'STATIC_APPROVED_COMPAT',character_id:id,asset:src,asset_sha:sha,
  semantic_preserved:true,relation_mutation:false,affinity_mutation:false};
 const art=presenter.present({renderPlan:plan,interactionState:state});
 assert.equal(art.id,id);assert.equal(art.interactionState,state);assert.equal(art.src,src);
 assert.equal(art.assetSha,sha);assert.equal(art.renderOwnership,'CANONICAL_UI_RENDER_PLAN');
 assert.equal(fs.existsSync(path.join(__dirname,'..',art.src)),true);
 assert.equal(art.motionReady,false);assert.equal(art.rootRegistryActivation,false);passed++;
}
const fake={kind:'STATIC_APPROVED_COMPAT',character_id:'future_approved',
 asset:'characters/produced/future_approved/static-cutout.png',asset_sha:'a'.repeat(64),
 semantic_preserved:true,relation_mutation:false,affinity_mutation:false};
assert.equal(presenter.present({renderPlan:fake}).id,'future_approved');
assert.equal(presenter.present({renderPlan:{...fake,kind:'COMPOSABLE_ACTION'}}),null);
assert.equal(presenter.present({renderPlan:{...fake,asset:'../unsafe.png'}}),null);
assert.equal(presenter.present({renderPlan:{...fake,asset_sha:'pending'}}),null);
assert.equal(presenter.present({renderPlan:{...fake,semantic_preserved:false}}),null);
assert.equal(presenter.present({renderPlan:fake,interactionState:'EXPRESSIVE_ILLUSTRATION'}),null);
assert.match(html,/refreshCrewRadioRenderPlan\(\)/);
assert.match(html,/explorerCrewCanonicalHost\.renderPlan\(/);
assert.match(html,/crewVisual\.present\(\{renderPlan:radioRenderPlan/);
assert.doesNotMatch(html,/crewVisual\.present\(\{visualId:/);
assert.match(html,/TakyExplorerCrewDialoguePersonality/);
assert.match(html,/canonicalDialogueProjection/);
assert.doesNotMatch(html,/crewBehavior\.preview/);
assert.match(html,/data-approved-crew-art/);
assert.match(html,/readiness='STATIC_ONLY'/);
assert.match(html,/readiness='COMPOSABLE_APPROVED'/);
assert.match(html,/crewRenderConsumer\.projectComposable/);
assert.match(html,/mountCrewRadioComposable/);
assert.match(html,/data-composable-host/);
console.log(JSON.stringify({gate:'CANONICAL_RENDER_PLAN_DOM_CONSUMER_V2',
 canonical_members:6,states_per_member:3,verified_bindings:passed,
 presenter_behavior_owner:false,presenter_asset_resolver:false,
 static_render_plan_consumer:'PASS',composable_plan_route:'PASS',unknown_or_invalid_plan:'FAIL_CLOSED',
 independent_expression_art_ready:false,root_promotion:false},null,2));
