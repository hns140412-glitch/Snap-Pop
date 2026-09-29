#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const presenter=require('../crew-visual-presenter.js'),visual=require('../visual-id-runtime.js');
const gate=JSON.parse(fs.readFileSync(path.join(__dirname,'..','asset-and-release-gate.json'),'utf8'));
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const expected=['dubi','lori','ink','nova','take','zero'];
assert.deepEqual(visual.memberIds,expected);assert.equal(presenter.automaticArtGeneration,false);
assert.equal(presenter.rootRegistryActivation,false);assert.equal(presenter.readyHideImport,false);
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
assert.doesNotMatch(html,/characters\/ui_cutouts\/'\+state\.primaryCompanionId/);
console.log(JSON.stringify({gate:'VISUAL_ID_REAL_HOME_RADIO_STATIC_ART_BINDING',
 canonical_members:6,states_per_member:3,verified_bindings:passed,real_approved_cutouts:true,
 future_approved_id_same_code:'PASS',unknown_or_unapproved_id:'FAIL_CLOSED',
 independent_expression_art_ready:false,root_promotion:false},null,2));
