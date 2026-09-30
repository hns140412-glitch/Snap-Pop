#!/usr/bin/env node
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=process.env.COMPANION_ONBOARDING_ROOT
  ? path.resolve(process.env.COMPANION_ONBOARDING_ROOT)
  : path.resolve(__dirname,'..');
const contract=JSON.parse(fs.readFileSync(path.join(root,'asset-and-release-gate.json'),'utf8'));
const sourcePath=path.join(root,contract.source_file.replace(/^onboarding\//,''));
const errors=[];
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
if(!fs.existsSync(sourcePath))errors.push('SOURCE_MISSING');
else if(sha(sourcePath)!==contract.source_sha256)errors.push('SOURCE_SHA256_MISMATCH');
for(const [relative,expected] of Object.entries(contract.required_assets)){
  const file=path.join(root,relative);
  if(!fs.existsSync(file))errors.push('ASSET_MISSING:'+relative);
  else if(sha(file)!==expected)errors.push('ASSET_HASH_MISMATCH:'+relative);
}
for(const [relative,expected] of Object.entries(contract.required_runtime_scripts||{})){
  const file=path.join(root,relative);
  if(!fs.existsSync(file))errors.push('RUNTIME_MISSING:'+relative);
  else if(sha(file)!==expected)errors.push('RUNTIME_HASH_MISMATCH:'+relative);
}
const report={
  gate:'COMPANION_ONBOARDING_SOURCE_ASSET_GATE',
  files_expected:1+Object.keys(contract.required_assets).length+Object.keys(contract.required_runtime_scripts||{}).length,
  errors,
  technical_asset_pass:errors.length===0,
  visual_release_pass:false,
  main_merge_allowed:false,
  reason:errors.length?'Missing or modified approved source/asset':'Visual matching, secure-origin persistence and device tests remain pending'
};
console.log(JSON.stringify(report,null,2));
if(errors.length)process.exitCode=1;
