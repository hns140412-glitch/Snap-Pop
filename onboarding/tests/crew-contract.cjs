#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),repo=path.resolve(root,'..');
const gate=JSON.parse(fs.readFileSync(path.join(root,'asset-gate-v2.json'),'utf8'));
const legacy=JSON.parse(fs.readFileSync(path.join(root,gate.legacy_manifest),'utf8'));
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const visual=require('../visual-id-runtime.js');
const system=require(path.join(repo,'vendor','taky','explorer-crew','system-v2.js'));
const promotion=require(path.join(repo,'vendor','taky','explorer-crew','composable-promotion-gate-v1.js'));
const approved=['dubi','lori','ink','nova','take','zero'];
assert.deepEqual(visual.memberIds,approved);assert.equal(system.ALL_CREW.length,24);assert.deepEqual(system.ALL_CREW.slice(0,6),approved);
for(const id of approved){for(const rel of [visual.asset(id,'source'),visual.asset(id,'cutout'),visual.firstMeetingSource]){assert.match(legacy.required_assets[rel]||'',/^[a-f0-9]{64}$/);assert.equal(fs.existsSync(path.join(root,rel)),true);}}
assert.match(html,/explorer-crew\/system-v2\.js/);assert.match(html,/explorer-crew\/app-consumer-v2\.js/);assert.match(html,/render-plan-dom-consumer-v1\.js/);
assert.doesNotMatch(html,/snap-explorer-crew-adapter-v1\.js/);assert.doesNotMatch(html,/snap-explorer-crew-ui-bridge-v1\.js/);
assert.equal(/crew\.length\s*<\s*5/.test(html),false);assert.equal(/toggleCrew\s*\(/.test(html),false);assert.equal(html.includes('5명 이상'),false);
const reference=html.match(/const referenceOrder\s*=\s*\[([^\]]+)\]/);assert.ok(reference);assert.deepEqual([...reference[1].matchAll(/'([a-z]+)'/g)].map(x=>x[1]),approved);
assert.match(html,/function companionEligibleIds\(\)/);assert.match(html,/async function selectCanonicalMain\(id\)/);assert.match(html,/MAIN_CHANGED/);
assert.match(html,/readiness='STATIC_ONLY'/);assert.match(html,/readiness='COMPOSABLE_APPROVED'/);assert.match(html,/crewRenderConsumer\.projectComposable/);
const audit=promotion.audit();assert.equal(audit.total,24);assert.equal(audit.static_ready,6);assert.equal(audit.base_composable_ready,0);assert.equal(audit.release_pass,0);
assert.equal(gate.runtime.owner,'EXPLORER_CREW_SYSTEM_V2');assert.equal(gate.release_boundary.root_activation,false);assert.equal(gate.release_boundary.main_merge_allowed,false);assert.equal(gate.release_boundary.netlify,'HOLD');assert.equal(gate.release_boundary.image_generation,'HOLD');
console.log(JSON.stringify({gate:'COMPANION_CREW_IDENTITY_AND_SCOPE_V2',roster_24:'PASS',core6_identity_assets:'PASS',forced_5_to_6_removed:'PASS',canonical_main_selection:'PASS',static_composable_dual_route:'PASS',real_composable_ready:0,root_activation:false,main_merge_allowed:false,netlify:'HOLD'},null,2));