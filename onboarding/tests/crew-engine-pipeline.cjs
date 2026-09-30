'use strict';
const assert=require('node:assert/strict');
const behavior=require('../crew-semantic-behavior.js');
const asset=require('../crew-asset-engine.js');
const renderer=require('../crew-ui-renderer.js');
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

console.log('Crew Behavior/Asset/Integration gates: PASS');