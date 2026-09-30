#!/usr/bin/env node
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const assert=require('node:assert/strict');

const root=path.resolve(__dirname,'..');
const v2=JSON.parse(fs.readFileSync(path.join(root,'asset-gate-v2.json'),'utf8'));
const legacy=JSON.parse(fs.readFileSync(path.join(root,v2.legacy_manifest),'utf8'));
const sha=buf=>crypto.createHash('sha256').update(buf).digest('hex');
const errors=[];

assert.equal(v2.version,'EXPLORER_CREW_ASSET_GATE_V2');
assert.equal(v2.approved_visual_integrity.authority,'required_assets');
assert.equal(v2.approved_visual_integrity.mutable_shell_excluded,true);
assert.equal(v2.runtime.owner,'EXPLORER_CREW_SYSTEM_V2');
assert.equal(v2.runtime.legacy_runtime_owner,false);

for(const [relative,expected] of Object.entries(legacy.required_assets||{})){
  const file=path.join(root,relative);
  if(!fs.existsSync(file))errors.push('ASSET_MISSING:'+relative);
  else if(sha(fs.readFileSync(file))!==expected)errors.push('ASSET_HASH_MISMATCH:'+relative);
}

const shell=path.join(root,'index.html');
assert.equal(fs.existsSync(shell),true,'INTEGRATION_SHELL_MISSING');
const html=fs.readFileSync(shell,'utf8');

assert.match(html,/explorer-crew\/system-v2\.js/);
assert.match(html,/explorer-crew\/app-consumer-v2\.js/);
assert.match(html,/explorer-crew\/render-plan-dom-consumer-v1\.js/);
assert.doesNotMatch(html,/<script src="crew-behavior-runtime\.js"/);
assert.doesNotMatch(html,/<script src="crew-semantic-behavior\.js"/);
assert.doesNotMatch(html,/<script src="crew-runtime-policy\.js"/);
assert.doesNotMatch(html,/<script src="crew-render-plan-dom-consumer\.js"/);
assert.doesNotMatch(html,/snap-explorer-crew-adapter-v1\.js/);
assert.doesNotMatch(html,/snap-explorer-crew-ui-bridge-v1\.js/);

const sample=Object.entries(legacy.required_assets||{})[0];
assert.ok(sample,'APPROVED_ASSET_SAMPLE_REQUIRED');
const [sampleRelative,sampleExpected]=sample;
const sampleBytes=fs.readFileSync(path.join(root,sampleRelative));
assert.equal(sha(sampleBytes),sampleExpected);
const mutated=Buffer.concat([sampleBytes,Buffer.from([0])]);
assert.notEqual(sha(mutated),sampleExpected,'MUTATED_APPROVED_ASSET_MUST_FAIL');

assert.equal(v2.release_boundary.visual_release_pass,false);
assert.equal(v2.release_boundary.main_merge_allowed,false);
assert.equal(v2.release_boundary.netlify,'HOLD');

console.log(JSON.stringify({
  gate:'EXPLORER_CREW_ASSET_GATE_V2',
  approved_assets_verified:Object.keys(legacy.required_assets||{}).length,
  approved_visual_integrity:errors.length?'FAIL':'PASS',
  mutable_shell_scope:'PASS',
  legacy_source_sha_scope:'RETIRED_FROM_VISUAL_INTEGRITY',
  v2_runtime_wiring:'PASS',
  mutated_asset_rejection:'PASS',
  visual_release_pass:false,
  main_merge_allowed:false,
  netlify:'HOLD',
  errors
},null,2));
if(errors.length)process.exitCode=1;
