#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),path=require('node:path');
const systemApi=require(path.resolve(__dirname,'..','..','vendor','taky','explorer-crew','system-v2.js'));
const mem=new Map(),storage={getItem:k=>mem.has(k)?mem.get(k):null,setItem:(k,v)=>mem.set(k,v),removeItem:k=>mem.delete(k)};
(async()=>{
 const sys=systemApi.create({app_id:'PRIMARY_SELECTION_V2_TEST',storage});const t='2026-10-01T00:00:00.000Z';
 await sys.dispatch({character_id:'lori',scene_id:'FIRST_ENCOUNTER_SEQUENCE',interaction_result:{relation_event:{character_id:'lori',type:'FIRST_MET',at:t}}});
 assert.equal(sys.snapshot().relation.main_character_id,null);assert.equal(sys.snapshot().relation.members.lori.relation_state,'KNOWN');
 let blocked=false;try{await sys.dispatch({character_id:'lori',scene_id:'COMPANION_SELECTION',interaction_result:{relation_event:{character_id:'lori',type:'MAIN_SELECTED',at:'2026-10-01T00:00:01.000Z'}}})}catch(e){blocked=/RELATION_COMPANION_GATE_NOT_MET/.test(String(e.message))}
 assert.equal(blocked,true,'Main cannot be selected before companion gate');
 sys.unlockStoryGate({character_id:'lori',story_gate_id:'PRIMARY_V2',evidence_ref:'test:primary-selection-v2',at:'2026-10-01T00:00:02.000Z'});
 await sys.dispatch({character_id:'lori',scene_id:'SHARED_ACTIVITY',companion_gate:{affinity_requirement_met:true},interaction_result:{relation_event:{character_id:'lori',type:'SHARED_ACTIVITY',event_id:'lori_shared_1',at:'2026-10-01T00:00:03.000Z'}}});
 assert.equal(sys.snapshot().relation.members.lori.relation_state,'COMPANION_AVAILABLE');
 await sys.dispatch({character_id:'lori',scene_id:'COMPANION_SELECTION',interaction_result:{relation_event:{character_id:'lori',type:'MAIN_SELECTED',at:'2026-10-01T00:00:04.000Z'}}});
 assert.equal(sys.snapshot().relation.main_character_id,'lori');assert.equal(sys.snapshot().relation.members.lori.relation_state,'MAIN_COMPANION');
 await sys.dispatch({character_id:'ink',scene_id:'FIRST_ENCOUNTER_SEQUENCE',interaction_result:{relation_event:{character_id:'ink',type:'FIRST_MET',at:'2026-10-01T00:00:05.000Z'}}});
 sys.unlockStoryGate({character_id:'ink',story_gate_id:'PRIMARY_V2',evidence_ref:'test:primary-selection-v2-ink',at:'2026-10-01T00:00:06.000Z'});
 await sys.dispatch({character_id:'ink',scene_id:'SHARED_ACTIVITY',companion_gate:{affinity_requirement_met:true},interaction_result:{relation_event:{character_id:'ink',type:'SHARED_ACTIVITY',event_id:'ink_shared_1',at:'2026-10-01T00:00:07.000Z'}}});
 await sys.dispatch({character_id:'ink',scene_id:'COMPANION_SELECTION',interaction_result:{relation_event:{character_id:'ink',type:'MAIN_CHANGED',at:'2026-10-01T00:00:08.000Z'}}});
 const s=sys.snapshot();assert.equal(s.relation.main_character_id,'ink');assert.equal(s.relation.members.ink.relation_state,'MAIN_COMPANION');assert.equal(s.relation.members.lori.relation_state,'COMPANION');
 console.log(JSON.stringify({gate:'PRIMARY_COMPANION_CANONICAL_V2',no_default_main:'PASS',pre_gate_selection_blocked:'PASS',explicit_main_after_gate:'PASS',main_change_preserves_previous_companion:'PASS',legacy_5_to_6_selection:'RETIRED'},null,2));
})().catch(e=>{console.error(e);process.exitCode=1});