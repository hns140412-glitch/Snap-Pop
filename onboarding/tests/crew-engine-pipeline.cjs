'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const behavior=require('../crew-semantic-behavior.js');
const asset=require('../crew-asset-engine.js');
const renderer=require('../crew-ui-renderer.js');
const runtimeLog=require('../crew-runtime-log.js');
const contract=require('../crew-engine-contract.v1.json');
const manifest=require('../crew-composable-asset-manifest.v1.json');
const legacyProduction=require('../visual-id-production-contract.json');
const legacyBatch=require('../visual-id-batch-production.v1.json');
const A=(visual_id,src,extra={})=>({visual_id,src,approved:true,...extra});
const belo={
 visual_id:'belo',source_sha:'sha-belo',source_sha_verified:true,approval_ref:'APPROVED-BELO',
 body:{FIELD_NEUTRAL:A('belo','belo/body-neutral.png')},
 faces:{neutral:A('belo','belo/face-neutral.png'),listen:A('belo','belo/face-listen.png'),think:A('belo','belo/face-think.png'),observe:A('belo','belo/face-observe.png')},
 action_parts:{book_hand:A('belo','belo/book-hand.png'),radio_hand:A('belo','belo/radio-hand.png')},
 depth:{field_default:A('belo','belo/depth.json')}
};
const eq={BOOK:A('shared','shared/book.png',{shared:true}),RADIO:A('shared','shared/radio.png',{shared:true})};
const registry={member:id=>id==='belo'?belo:null,sharedEquipment:k=>eq[k]||null};

const cmd=behavior.ambient({character_id:'belo',relation_state:'KNOWN',ambient_action:'READ_BOOK'});
assert.equal(cmd.behavior_state,'AMBIENT');assert.equal(cmd.interaction_mode,'SILENT');
assert.equal(cmd.asset_path,undefined);
const plan=asset.resolve(cmd,registry);assert.equal(plan.fallback,false);
assert.equal(plan.body.src,'belo/body-neutral.png');assert.equal(plan.face.src,'belo/face-neutral.png');
assert.equal(plan.action_parts[0].src,'belo/book-hand.png');assert.equal(plan.equipment[0].src,'shared/book.png');
const ui=renderer.renderPlan(cmd,plan);assert.equal(ui.semantic_preserved,true);assert.equal(ui.ambient_action,'READ_BOOK');
assert.equal(ui.relation_mutation,false);assert.equal(ui.affinity_mutation,false);
const trace=runtimeLog.record({command:cmd,assetPlan:plan,renderPlan:ui});
assert.equal(trace.semantic_action_command.ambient_action,'READ_BOOK');
assert.equal(trace.selected_asset_composition.fallback,false);
assert.equal(trace.renderer_result.semantic_preserved,true);
assert.deepEqual(trace.gate_verdicts,{behavior_gate:true,asset_gate:true,integration_gate:true});
assert.equal(trace.invariants.relation_mutated,false);assert.equal(trace.invariants.affinity_mutated,false);

// missing approved book hand => safe same-character neutral fallback, never new art
const missing={...belo,action_parts:{}};
const fallbackRegistry={member:id=>id==='belo'?missing:null,sharedEquipment:k=>eq[k]||null};
const fb=asset.resolve(cmd,fallbackRegistry);assert.equal(fb.fallback,true);
assert.equal(fb.visual_id,'belo');assert.deepEqual(fb.action_parts,[]);assert.deepEqual(fb.equipment,[]);assert.equal(fb.generated,false);

// wrong-character part cannot be used
const poisoned={...belo,action_parts:{book_hand:A('dubi','dubi/book-hand.png')}};
const poisonRegistry={member:id=>id==='belo'?poisoned:null,sharedEquipment:k=>eq[k]||null};
assert.equal(asset.resolve(cmd,poisonRegistry).fallback,true);

// source SHA verification is mandatory
assert.equal(asset.resolve(cmd,{member:()=>({...belo,source_sha_verified:false}),sharedEquipment:k=>eq[k]||null}),null);

// behavior engine rejects asset fields and invalid ambient combinations
assert.equal(behavior.command({...cmd,asset_path:'x.png'}),null);
assert.equal(behavior.command({character_id:'belo',role:'MAIN',relation_state:'KNOWN',behavior_state:'OBSERVE',interaction_mode:'SILENT',ambient_action:'READ_BOOK'}),null);

// contract / manifest / runtime pointer agreement
assert.equal(contract.contract_version,manifest.contract_version);
assert.equal(contract.manifest_version,manifest.manifest_version);
assert.equal(contract.runtime_schema_version,manifest.runtime_schema_version);
assert.equal(runtimeLog.contractVersion,manifest.contract_version);
assert.equal(runtimeLog.manifestVersion,manifest.manifest_version);
assert.equal(runtimeLog.version,manifest.runtime_schema_version);
assert.deepEqual(contract.asset_engine.groups,manifest.asset_groups);
assert.deepEqual(contract.asset_engine.shared_equipment,manifest.shared_equipment);
assert.deepEqual(contract.behavior_engine.ambient_actions,manifest.ambient_actions);
assert.equal(manifest.authority.central_canonical_status,'ACTIVE_IN_TAKY_MAIN');
assert.equal(manifest.authority.central_canonical_path,'OS/EXPLORATION_CREW_CANONICAL.md');
assert.equal(manifest.authority.central_canonical_main_sha,'55547a7c4c859a1aae700405fdba4a302a2c20d3');
assert.equal(legacyProduction.productionAuthority,false);
assert.equal(legacyBatch.productionAuthority,false);
assert.equal(legacyProduction.legacyContractState,manifest.legacy_3_plus_6.state);
assert.equal(legacyBatch.legacyContractState,manifest.legacy_3_plus_6.state);

// Core6 composable registration is evidence-only: 2 approved groups, 5 OPEN, no runtime promotion.
const core6=['dubi','lori','ink','nova','take','zero'];
const groups=['MASTER_FULL','PROFILE','PUPPET_BODY','FACE_STATES','ACTION_PARTS','PEEK_MASK','DEPTH_SHADOW'];
const root=path.resolve(__dirname,'..');
assert.deepEqual(Object.keys(manifest.members).sort(),[...core6].sort());
assert.equal(manifest.registration_summary.core6_members_registered,6);
assert.equal(manifest.registration_summary.approved_group_instances,12);
assert.equal(manifest.registration_summary.open_group_instances,30);
assert.equal(manifest.registration_summary.runtime_fallback_eligible_members,0);
for(const id of core6){
 const m=manifest.members[id];
 assert.equal(m.visual_id,id);assert.equal(m.source_sha_verified,true);
 assert.equal(m.production_eligible,false);assert.equal(m.runtime_fallback_eligible,false);
 assert.equal(m.approved_group_count,2);assert.equal(m.open_group_count,5);
 assert.deepEqual(Object.keys(m.groups),groups);
 for(const g of ['MASTER_FULL','PROFILE']){
  assert.equal(m.groups[g].assets.length,1);
  const rec=m.groups[g].assets[0];
  assert.equal(rec.approved,true);assert.equal(rec.visual_id,id);assert.equal(rec.group,g);
  const bytes=fs.readFileSync(path.join(root,rec.path));
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),rec.sha256);
  assert.equal(rec.source_sha256,m.source_sha256);
 }
 for(const g of ['PUPPET_BODY','FACE_STATES','ACTION_PARTS','PEEK_MASK','DEPTH_SHADOW']) assert.equal(m.groups[g].assets.length,0);
}

const fbUi=renderer.renderPlan(cmd,fb);
const fbTrace=runtimeLog.record({command:cmd,assetPlan:fb,renderPlan:fbUi,fallback_reason:'BOOK_HAND_NOT_APPROVED'});
assert.equal(fbTrace.fallback_reason,'BOOK_HAND_NOT_APPROVED');
assert.equal(fbTrace.selected_asset_composition.visual_id,'belo');
assert.deepEqual(fbTrace.gate_verdicts,{behavior_gate:true,asset_gate:true,integration_gate:true});

console.log('Crew Behavior/Asset/Integration + Manifest/Runtime version gates: PASS');