#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const presenter=require('../crew-visual-presenter.js'),visual=require('../visual-id-runtime.js'),policy=require('../crew-runtime-policy.js'),semantic=require('../crew-semantic-behavior.js');
const assetEngine=require('../crew-asset-engine.js'),renderer=require('../crew-ui-renderer.js'),manifestRegistry=require('../crew-manifest-registry.js');
const manifest=require('../crew-composable-asset-manifest.v1.json');
const gate=JSON.parse(fs.readFileSync(path.join(__dirname,'..','asset-and-release-gate.json'),'utf8'));
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const expected=['dubi','lori','ink','nova','take','zero'];
assert.deepEqual(visual.memberIds,expected);assert.equal(presenter.automaticArtGeneration,false);
assert.equal(presenter.rootRegistryActivation,false);assert.equal(presenter.readyHideImport,false);assert.equal(presenter.version,'VISUAL_ID_APPROVED_STATIC_SCENE_PRESENTER_V3');
let passed=0;
for(const id of expected)for(const state of presenter.states){
 const art=presenter.present({visualId:id,interactionState:state},visual);
 assert.equal(art.id,id);assert.equal(art.interactionState,state);
 assert.equal(art.src,visual.asset(id,'cutout'));
 assert.equal(gate.required_assets[art.src]!==undefined,true);
 assert.equal(fs.existsSync(path.join(__dirname,'..',art.src)),true);
 assert.equal(art.frameReady,false);assert.equal(art.motionReady,false);
 assert.equal(art.independentReactionArtReady,false);assert.equal(art.rootRegistryActivation,false);
 passed++;
}
assert.equal(presenter.present({visualId:'unapproved'},visual),null);
assert.equal(presenter.present({visualId:'dubi',interactionState:'EXPRESSIVE_ILLUSTRATION'},visual),null);
assert.equal(presenter.present({visualId:'__proto__'},visual),null);
const command=semantic.command({character_id:'dubi',role:'MAIN',relation_state:'KNOWN',behavior_state:'LISTEN',interaction_mode:'TEXT'});
const decision=policy.evaluate({command,preferred_slot:'FG_RIGHT',occupied_slots:[],usage:{foreground_reactions:0,ambient_active:0,spoken_dialogue:0,overlay:0}});
const policyArt=presenter.present({visualId:'dubi',interactionState:'WAIT_CHILD',runtimeDecision:decision},visual);
assert.equal(policyArt.sceneSlot,'FG_RIGHT');assert.equal(policyArt.interruptibility,'PROTECTED');
assert.equal(policyArt.runtimePolicyVersion,'CREW_RUNTIME_POLICY_V1');
assert.equal(presenter.present({visualId:'dubi',runtimeDecision:{ok:false,scene_slot:'FG_RIGHT'}},visual),null);
const ambient=semantic.ambient({character_id:'dubi',relation_state:'KNOWN',ambient_action:'READ_BOOK'});
const ambientDecision=policy.evaluate({command:ambient,preferred_slot:'MID_LEFT',occupied_slots:[],usage:{foreground_reactions:0,ambient_active:0,spoken_dialogue:0,overlay:0}});
const currentComposableRegistry=manifestRegistry.create(manifest);
assert.ok(currentComposableRegistry);
assert.equal(presenter.promoteComposable({command:ambient,runtimeDecision:ambientDecision},currentComposableRegistry,assetEngine,renderer),null,
 'Current real manifest must stay fail-closed until approved composable action assets exist');
const A=(visual_id,src,extra={})=>({visual_id,src,approved:true,...extra});
const fullRegistry={
 member:id=>id==='dubi'?{
   visual_id:'dubi',source_sha:'sha-dubi',source_sha_verified:true,approval_ref:'APPROVED-DUBI',
   body:{FIELD_NEUTRAL:A('dubi','dubi/body-neutral.png')},
   faces:{neutral:A('dubi','dubi/face-neutral.png')},
   action_parts:{book_hand:A('dubi','dubi/book-hand.png')},
   depth:{field_default:A('dubi','dubi/depth.png')}
 }:null,
 sharedEquipment:key=>key==='BOOK'?A('shared','shared/book.png',{shared:true}):null
};
const promoted=presenter.promoteComposable({command:ambient,runtimeDecision:ambientDecision},fullRegistry,assetEngine,renderer);
assert.ok(promoted);assert.equal(promoted.assetStatus,'COMPOSABLE_ACTION_APPROVED');
assert.equal(promoted.sceneSlot,'MID_LEFT');assert.equal(promoted.ambientAction,'READ_BOOK');
assert.equal(promoted.actionReady,true);assert.equal(promoted.motionReady,false);assert.equal(promoted.generated,false);
assert.equal(promoted.semanticPreserved,true);assert.equal(promoted.relationMutation,false);assert.equal(promoted.affinityMutation,false);
assert.equal(presenter.promoteComposable({command:ambient,runtimeDecision:{ok:false,scene_slot:'MID_LEFT'}},fullRegistry,assetEngine,renderer),null);
const motionSpec={
 schema:'CREW_MOTION_SPEC_V1',approved:true,approval_ref:'MOTION_APPROVED_DUBI_READ_BOOK',
 visual_id:'dubi',ambient_action:'READ_BOOK',
 anchors:{body:'body_center',action_part:'hand',equipment:'hand'},
 transition:{enter:'FADE_SLIDE',exit:'FADE',enter_ms:220,exit_ms:180},
 timing:{action_ms:2400,hold_ms:800,cooldown_ms:2200},
 reduced_motion:{mode:'STATIC_COMPOSABLE',preserves_information:true}
};
const motion=renderer.motionPlan(promoted,motionSpec,{prefersReducedMotion:false});
assert.ok(motion);assert.equal(motion.motionReady,true);assert.equal(motion.motion_active,true);assert.equal(motion.releasePass,false);assert.equal(motion.rootRegistryActivation,false);
assert.equal(motion.semantic_preserved,true);assert.equal(motion.relation_mutation,false);assert.equal(motion.affinity_mutation,false);
const reducedMotion=renderer.motionPlan(promoted,motionSpec,{prefersReducedMotion:true});
assert.ok(reducedMotion);assert.equal(reducedMotion.motionReady,true);assert.equal(reducedMotion.motion_active,false);
assert.equal(reducedMotion.reduced_motion_mode,'STATIC_COMPOSABLE');
assert.equal(renderer.motionPlan(promoted,{...motionSpec,visual_id:'lori'}),null);
assert.equal(renderer.motionPlan(promoted,{...motionSpec,ambient_action:'REST'}),null);
assert.equal(renderer.motionPlan(promoted,{...motionSpec,reduced_motion:{mode:'NONE',preserves_information:false}}),null);
assert.equal(renderer.motionPlan({...promoted,actionReady:false},motionSpec),null);
const fakeId='future_approved',future={
 memberIds:[fakeId],
 member:id=>({id,cutout:'characters/produced/'+id+'/static-cutout.png'}),
 renderPlan:id=>({id,staticPreviewReady:true}),
 asset:(id,slot)=>slot==='cutout'?'characters/produced/'+id+'/static-cutout.png':null
};
assert.equal(presenter.present({visualId:fakeId},future).src,future.asset(fakeId,'cutout'),
 'Future approved Visual ID reuses same presenter without a hardcoded Core6 switch');
assert.equal(presenter.present({visualId:fakeId}, {...future,renderPlan:id=>({id,staticPreviewReady:false})}),null);
assert.equal(presenter.present({visualId:fakeId}, {...future,asset:()=> '../unapproved.png'}),null);
assert.match(html,/crewVisual\.present\(\{visualId:state\.primaryCompanionId/);
assert.match(html,/data-approved-crew-art/);
assert.match(html,/data-art-readiness="STATIC_ONLY"/);
assert.match(html,/data-runtime-policy/);assert.match(html,/data-scene-slot/);assert.match(html,/CrewRuntimePolicy/);
assert.doesNotMatch(html,/characters\/ui_cutouts\/'\+state\.primaryCompanionId/);
console.log(JSON.stringify({gate:'VISUAL_ID_REAL_HOME_RADIO_STATIC_ART_BINDING',
 canonical_members:6,states_per_member:3,verified_bindings:passed,real_approved_cutouts:true,
 future_approved_id_same_code:'PASS',unknown_or_unapproved_id:'FAIL_CLOSED',
 independent_expression_art_ready:false,composable_action_promotion_gate:'PASS_FAIL_CLOSED_CURRENT_MANIFEST',motion_gate:'PASS_APPROVED_SPEC_AND_REDUCED_MOTION',root_promotion:false},null,2));
