#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),{spawnSync}=require('node:child_process');
const p=require('../tools/visual-id-workflow.cjs'),cfg=require('../visual-id-production-contract.json');
const visual=require('../visual-id-runtime.js'),gate=require('../asset-and-release-gate.json');
assert.deepEqual(cfg.independentLayers,visual.roleKeys);assert.deepEqual(cfg.reactions,visual.reactionKeys);
assert.deepEqual(cfg.sceneKeys,visual.viewKeys);
const order={id:'new_explorer'},plan=p.plan(order.id),paths=p.pathsFor(order.id);
assert.equal(plan.registered,false);assert.equal(plan.independentAssetSlots.length,9);
assert.equal(plan.sceneWorkOrder.FIRST_MEETING.approvedState,'OPEN');
assert.equal(paths.scene,'ui/approved/new_explorer_first_meeting_scene.png');
assert.equal(p.inside('../unsafe'),null);assert.equal(p.inside('/etc/passwd'),null);assert.equal(p.inside('characters/../unsafe'),null);
const first=p.report();
assert.equal(first.existing.length,6);assert.equal(first.counts.independentLayerAssetsMissing,18);
assert.equal(first.counts.independentReactionAssetsMissing,36);
assert.equal(first.partitionPrototypes.length,2);
assert.deepEqual(first.partitionPrototypes.map(x=>x.visualId),['dubi','ink']);
for(const item of first.partitionPrototypes){assert.equal(item.sourceSHA256,gate.required_assets['characters/ui_cutouts/'+item.visualId+'.png']);assert.equal(item.actionReady,false);assert.equal(item.releaseReady,false);}
assert.equal(first.counts.sourcePartitionPrototypes,2);
assert.equal(first.counts.independentLayerAssetsMissing,18,'Prototype is NOT counted as approved motion-ready role art');
assert.equal(first.existing.every(x=>x.stage==='STATIC_PREVIEW'&&!x.actionReady&&!x.releaseReady),true);
for(const x of first.existing)assert.equal(gate.required_assets[x.source]!==undefined,true);
const partial=p.inspectCandidate({...order,schema:cfg.schema,visualApproval:{status:'LOCKED',reference:'approved-reference',sourcePath:'characters/originals/new_explorer_source.png',sha256:'0'.repeat(64)}});
assert.equal(partial.releaseReady,false);assert.ok(partial.open.includes('ORIGINAL_BYTE_HASH_AND_MANIFEST'));
for(const name of ['IDENTITY_BODY','PERSONALITY_PROP','THEME_GEAR','OBSERVE','LISTEN','IDEA','REACT','WAIT','COMPLETE'])assert.ok(partial.open.some(x=>x==='EXACT_INDEPENDENT_TRANSPARENT_ASSET:'+name));
for(const k of cfg.sceneKeys){assert.ok(partial.open.includes('SCENE_REFERENCE_AND_EXPLICIT_BINDING:'+k));assert.ok(partial.open.includes('SCENE_FOUR_VIEWPORT_EVIDENCE:'+k));}
assert.ok(partial.open.includes('ACTUAL_UI_REGISTRY_AND_LEDGER_BINDING'));
assert.equal(partial.technicalReady,false);
assert.equal(partial.releaseReady,false);
assert.throws(()=>p.inspectCandidate({...order,stage:'RELEASE_READY'}),/CANDIDATE_CLAIMED_READY_WITH_OPEN_PROOFS/);
assert.ok(!p.inspectCandidate({id:'dubi'}).open.includes('NEW_IMMUTABLE_VISUAL_ID_REQUIRED'),'Staged identity remains auditable after actual renderer binding');
assert.throws(()=>p.register('dubi','approval-evidence','characters/originals/dubi_source.jpeg'),/NEW_IMMUTABLE_VISUAL_ID_REQUIRED/);
assert.throws(()=>p.plan('../unsafe'),/VISUAL_ID_BAD_FORMAT/);
assert.throws(()=>p.register('new_explorer','approved-reference','../unsafe'),/SOURCE_PATH_IDENTITY_MISMATCH/);
const child=spawnSync(process.execPath,[path.join(__dirname,'..','tools','visual-id-workflow.cjs'),'report'],{encoding:'utf8'});
assert.equal(child.status,0,child.stderr);
assert.equal(JSON.parse(child.stdout).counts.staticBound,6);
assert.ok(!fs.existsSync(path.join(__dirname,'..','visual-id-candidates','new_explorer.json')),'Plan/audit shall never register ID');
console.log(JSON.stringify({gate:'VISUAL_ID_WORK_METHOD_EXECUTION',stages:cfg.stages.length,core6_static_bound:6,
 missing_independent_layers:18,missing_reaction_assets:36,
 future_new_id_plan:'PASS_DETERMINISTIC',registration:'EXPLICIT_APPROVED_SOURCE_ONLY',
 candidate_audit:'FAIL_CLOSED',source_path_traversal:'REJECTED',root_auto_activation:false},null,2));
