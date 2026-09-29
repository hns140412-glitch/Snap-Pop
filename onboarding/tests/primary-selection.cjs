#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const raw=html.split('<script>')[1]?.split('</script>')[0];
assert.ok(raw,'Inline runtime unavailable');
const script=raw.replace(/render\(\);\s*$/,'');assert.notEqual(script,raw,'Boot render anchor missing');
const crewSource=fs.readFileSync(path.join(root,'crew-state-runtime.js'),'utf8');
const behaviorSource=fs.readFileSync(path.join(root,'crew-behavior-runtime.js'),'utf8');
const draft=new Map();const view={innerHTML:'',contains(){return false},querySelector(){return null}},app={style:{setProperty(){}},dataset:{}};
function context(){const ctx=vm.createContext({
 console,localStorage:{getItem:k=>draft.has(k)?draft.get(k):null,setItem:(k,v)=>draft.set(k,v)},
 document:{getElementById:id=>id==='app'?app:view,querySelectorAll:()=>[]},URL:{revokeObjectURL(){}}
 });ctx.window=ctx;vm.runInContext(crewSource,ctx,{timeout:2000});vm.runInContext(behaviorSource,ctx,{timeout:2000});vm.runInContext(script,ctx,{timeout:2000});return ctx;}
let ctx=context();const call=expr=>vm.runInContext(expr,ctx,{timeout:2000});
const snap=()=>JSON.parse(call('JSON.stringify(state)'));
call('go(1)');call('next()');assert.equal(snap().selectionPhase,'crew');assert.ok(snap().crewLedger.members.lori.firstMetAt);
for(const id of ['dubi','lori','ink','nova'])call("toggleCrew('"+id+"')");
call('next()');assert.equal(snap().step,2);assert.equal(snap().selectionPhase,'crew','Four must not advance');
call("toggleCrew('take')");call('next()');assert.equal(snap().step,2);assert.equal(snap().selectionPhase,'primary');
assert.equal(snap().primaryCompanionId,'');assert.match(view.innerHTML,/주 동행 한 명/);
call('next()');assert.equal(snap().step,2,'No default primary');
call("pickPrimaryCompanion('zero')");assert.equal(snap().primaryCompanionId,'','Excluded member cannot become primary');
call("pickPrimaryCompanion('lori')");assert.equal(snap().primaryCompanionId,'lori');assert.equal(snap().crewLedger.primaryHistory.length,1);assert.match(view.innerHTML,/주 동행: 로리/);
call('next()');assert.equal(snap().step,3);
ctx=context();assert.equal(JSON.parse(vm.runInContext('JSON.stringify(state)',ctx)).primaryCompanionId,'lori','Local reload preserves explicit primary');
const edit=expr=>vm.runInContext(expr,ctx,{timeout:2000}),state=()=>JSON.parse(edit('JSON.stringify(state)'));
edit('go(10)');assert.match(view.innerHTML,/괜찮아, 천천히 해도 돼!/,'HOME reflects Lori with existing line, no new bubble');edit("editFromHome(2,'primary')");assert.equal(state().selectionPhase,'primary');
edit("pickPrimaryCompanion('ink')");edit('next()');assert.equal(state().step,10);assert.equal(state().primaryCompanionId,'ink');assert.match(view.innerHTML,/음\.\.\. 다른 방법도 있지\./,'Primary change updates read-only HOME behavior');assert.equal(state().crewLedger.primaryHistory.at(-1).reason,'CHANGED');
edit("beginCrewRename('lori')");assert.equal(state().renameEditingId,'lori');view.querySelector=()=>({value:'새로리'});edit("commitCrewRename('lori')");view.querySelector=()=>null;assert.equal(state().crewLedger.members.lori.currentName,'새로리');assert.equal(state().crewLedger.members.lori.id,'lori');
edit('editFromHome(2)');assert.equal(state().selectionPhase,'crew');
edit("toggleCrew('ink')");assert.equal(state().primaryCompanionId,'','Removing the primary clears it');assert.equal(state().crewLedger.primaryHistory.at(-1).reason,'CLEARED');assert.equal(state().crewLedger.members.lori.currentName,'새로리');
edit('next()');assert.equal(state().selectionPhase,'crew','Four selected cannot proceed');
edit("toggleCrew('zero')");edit('next()');assert.equal(state().selectionPhase,'primary');edit('next()');assert.equal(state().step,2,'Must explicitly select a new primary');
const changed=JSON.parse(draft.get('expedition_ui_draft'));changed.step=10;changed.primaryCompanionId='ink';draft.set('expedition_ui_draft',JSON.stringify(changed));
const invalid=context();const repaired=JSON.parse(vm.runInContext('JSON.stringify(state)',invalid));assert.equal(repaired.crewLedger.members.lori.currentName,'새로리');assert.equal(repaired.primaryCompanionId,'');assert.equal(repaired.step,2);assert.equal(repaired.selectionPhase,'primary','Invalid primary must not bypass selection');
const legacyDraft={step:10,crew:['dubi','lori','ink','nova','take'],primaryCompanionId:'lori',selectionPhase:'crew',name:'기존아이',items:['map'],travel:'cloud',island:'기존섬',camp:'기존캠프',tab:'탐험대'};
draft.set('expedition_ui_draft',JSON.stringify(legacyDraft));
const legacyCtx=context(),legacyEval=x=>vm.runInContext(x,legacyCtx,{timeout:2000});
let migrated=JSON.parse(legacyEval('JSON.stringify(state)'));
assert.equal(migrated.step,10);assert.equal(migrated.primaryCompanionId,'lori');
assert.equal(migrated.crewLedger.members.lori.firstMetAt,null,'Legacy date must be unknown, not generated');
assert.equal(migrated.crewLedger.members.lori.meetingEvidence,'LEGACY_DRAFT_STEP_REACHED_TIME_UNKNOWN');
legacyEval('go(10)');legacyEval("beginCrewRename('lori')");
view.querySelector=()=>({value:'이어로리'});legacyEval("commitCrewRename('lori')");view.querySelector=()=>null;
migrated=JSON.parse(legacyEval('JSON.stringify(state)'));assert.equal(migrated.crewLedger.members.lori.currentName,'이어로리');
assert.equal(migrated.crewLedger.members.lori.firstMetAt,null);
console.log(JSON.stringify({gate:'PRIMARY_COMPANION_STATE',five_member_gate:'PASS',explicit_choice:'PASS',nonmember_rejection:'PASS',draft_reload:'PASS',home_reselection:'PASS',removal_recovery:'PASS',corrupt_draft:'PASS',crew_name_and_history:'PASS',first_meeting_record:'PASS',legacy_draft_rename_without_fake_date:'PASS',new_art_created:false},null,2));
