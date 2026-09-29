#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),repo=path.resolve(root,'..');
const api=require('../visual-id-runtime.js');
const state=require('../crew-state-runtime.js'),behavior=require('../crew-behavior-runtime.js');
const scope=JSON.parse(fs.readFileSync(path.join(root,'crew-scope-contract.json'),'utf8'));
const gate=JSON.parse(fs.readFileSync(path.join(root,'asset-and-release-gate.json'),'utf8'));
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const original=['dubi','lori','ink','nova','take','zero'];
assert.deepEqual(api.memberIds,original);
assert.deepEqual(api.memberIds,scope.roster.original_ids);
assert.deepEqual(api.memberIds,state.ids);
assert.deepEqual(api.memberIds,behavior.memberIds);
assert.equal(api.rootRegistryActivation,false);assert.equal(api.readyHideImport,false);assert.equal(api.automaticArtGeneration,false);
assert.deepEqual(api.roleKeys,['IDENTITY_BODY','PERSONALITY_PROP','THEME_GEAR']);
assert.deepEqual(api.reactionKeys,['OBSERVE','LISTEN','IDEA','REACT','WAIT','COMPLETE']);
assert.deepEqual(api.viewKeys,['FIRST_MEETING','CHOICE','PRIMARY','HOME','ACTIVE_SCENE']);
for(const id of original){
  const m=api.member(id),p=api.renderPlan(id);assert.equal(m.id,id);assert.equal(m.localIdentityOnly,true);
  for(const field of ['source','cutout','firstMeetingSource']){assert.match(gate.required_assets[m[field]]||'',/^[a-f0-9]{64}$/);assert.ok(fs.existsSync(path.join(root,m[field])));}
  assert.equal(api.asset(id,'source'),scope.identity.original_assets[id]);
  assert.equal(api.asset(id,'cutout'),scope.identity.ui_cutouts[id]);
  assert.equal(api.member(id).firstMeetingSource,api.firstMeetingSource);
  for(const key of ['hero','portrait','slot']){
    const rect=api.hotspot(id,key);assert.equal(rect.length,key==='slot'?2:4);
    assert.ok(rect.every(x=>typeof x==='number'&&Number.isFinite(x)&&x>=0&&x<=100));
    if(key!=='slot')assert.ok(rect[0]+rect[2]<=101&&rect[1]+rect[3]<=101);
  }
  assert.equal(p.staticPreviewReady,true);assert.equal(p.actionReady,false);assert.equal(p.releaseReady,false);
  assert.equal(p.missing.filter(x=>x.startsWith('LAYER:')).length,3);
  assert.equal(p.missing.filter(x=>x.startsWith('REACTION:')).length,6);
  assert.ok(p.missing.includes('VERIFICATION:pixelParity'));assert.ok(p.missing.includes('VERIFICATION:rootOwnerApproval'));
}
const rootRegistry=require(path.join(repo,'snap-crew-asset-registry-v1.js'));
assert.equal(rootRegistry.ACTIVE.length,0,'No silent Snap root promotion');
assert.match(html,/const visualID=window\.CompanionVisualAssets/);
assert.match(html,/visualID\.asset\(id,'cutout'\)/);
assert.match(html,/visualID\.hotspot\(id,kind\)/);
assert.match(html,/visualID\.hotspot\(id,'slot'\)/);
assert.match(html,/visualID\.firstMeetingSource/);
assert.doesNotMatch(html,/const approvedCrewLocations=/);
assert.throws(()=>api.member('new_character'),/UNREGISTERED_ONBOARDING_VISUAL_ID/);
assert.throws(()=>api.asset('dubi','PERSONALITY_PROP'),/UNAPPROVED_ASSET_SLOT/);
const fakeNew=api.auditNewIdentity({id:'new_character',userVisualApproval:true,visualEvidenceRef:'board-ref'},gate.required_assets);
assert.equal(fakeNew.ready,false);
for(const reason of ['HASH_GUARDED_ASSET:source','LAYER:IDENTITY_BODY','LAYER:PERSONALITY_PROP','LAYER:THEME_GEAR','REACTION:OBSERVE','REACTION:COMPLETE','SCENE_CONTRACT:FIRST_MEETING','SCENE_CONTRACT:ACTIVE_SCENE','FOUR_VIEWPORT_RENDER_INTERACTION','SCREEN_REFERENCE_1TO1','SNAP_ROOT_RELEASE_APPROVAL'])assert.ok(fakeNew.missing.includes(reason),reason);
assert.equal(api.auditNewIdentity({id:'dubi'},gate.required_assets).ready,false,'Existing ID cannot be registered anew');
console.log(JSON.stringify({gate:'VISUAL_ID_TO_LAYERED_ASSET_AND_UI_CONTRACT',original_member_count:original.length,originals_and_cutouts_and_first_meeting_hashes:'PASS',scene_and_static_ui_binding:'PASS_EXISTING_APPROVED_ART',reaction_layers:'OPEN_6_BY_6',identity_body_prop_gear_independent_layers:'OPEN_3_BY_6',new_visual_id_missing_assets_fail_closed:'PASS',existing_core6_release:false,snap_root_activated:false,ready_hide_activated:false,main_merge_or_netlify_allowed:false},null,2));
