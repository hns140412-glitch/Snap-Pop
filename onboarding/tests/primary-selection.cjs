#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const raw=html.split('<script>')[1]?.split('</script>')[0];
assert.ok(raw,'Inline runtime unavailable');
const script=raw.replace(/render\(\);\s*$/,'');assert.notEqual(script,raw,'Boot render anchor missing');
const draft=new Map();const view={innerHTML:'',contains(){return false},querySelector(){return null}},app={style:{setProperty(){}},dataset:{}};
function context(){const ctx=vm.createContext({
 console,localStorage:{getItem:k=>draft.has(k)?draft.get(k):null,setItem:(k,v)=>draft.set(k,v)},
 document:{getElementById:id=>id==='app'?app:view,querySelectorAll:()=>[]},URL:{revokeObjectURL(){}}
 });vm.runInContext(script,ctx,{timeout:2000});return ctx;}
let ctx=context();const call=expr=>vm.runInContext(expr,ctx,{timeout:2000});
const snap=()=>JSON.parse(call('JSON.stringify(state)'));
call('go(2)');assert.equal(snap().selectionPhase,'crew');
for(const id of ['dubi','lori','ink','nova'])call("toggleCrew('"+id+"')");
call('next()');assert.equal(snap().step,2);assert.equal(snap().selectionPhase,'crew','Four must not advance');
call("toggleCrew('take')");call('next()');assert.equal(snap().step,2);assert.equal(snap().selectionPhase,'primary');
assert.equal(snap().primaryCompanionId,'');assert.match(view.innerHTML,/주 동행 한 명/);
call('next()');assert.equal(snap().step,2,'No default primary');
call("pickPrimaryCompanion('zero')");assert.equal(snap().primaryCompanionId,'','Excluded member cannot become primary');
call("pickPrimaryCompanion('lori')");assert.equal(snap().primaryCompanionId,'lori');assert.match(view.innerHTML,/주 동행: 로리/);
call('next()');assert.equal(snap().step,3);
ctx=context();assert.equal(JSON.parse(vm.runInContext('JSON.stringify(state)',ctx)).primaryCompanionId,'lori','Local reload preserves explicit primary');
const edit=expr=>vm.runInContext(expr,ctx,{timeout:2000}),state=()=>JSON.parse(edit('JSON.stringify(state)'));
edit('go(10)');edit("editFromHome(2,'primary')");assert.equal(state().selectionPhase,'primary');
edit("pickPrimaryCompanion('ink')");edit('next()');assert.equal(state().step,10);assert.equal(state().primaryCompanionId,'ink');
edit('editFromHome(2)');assert.equal(state().selectionPhase,'crew');
edit("toggleCrew('ink')");assert.equal(state().primaryCompanionId,'','Removing the primary clears it');
edit('next()');assert.equal(state().selectionPhase,'crew','Four selected cannot proceed');
edit("toggleCrew('zero')");edit('next()');assert.equal(state().selectionPhase,'primary');edit('next()');assert.equal(state().step,2,'Must explicitly select a new primary');
const changed=JSON.parse(draft.get('expedition_ui_draft'));changed.step=10;changed.primaryCompanionId='ink';draft.set('expedition_ui_draft',JSON.stringify(changed));
const invalid=context();const repaired=JSON.parse(vm.runInContext('JSON.stringify(state)',invalid));assert.equal(repaired.primaryCompanionId,'');assert.equal(repaired.step,2);assert.equal(repaired.selectionPhase,'primary','Invalid primary must not bypass selection');
console.log(JSON.stringify({gate:'PRIMARY_COMPANION_STATE',five_member_gate:'PASS',explicit_choice:'PASS',nonmember_rejection:'PASS',draft_reload:'PASS',home_reselection:'PASS',removal_recovery:'PASS',corrupt_draft:'PASS',new_art_created:false},null,2));
