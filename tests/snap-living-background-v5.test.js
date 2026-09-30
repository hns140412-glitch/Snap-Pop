#!/usr/bin/env node
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const asset=path.join(root,'assets/world/snap_pop_beach_asset.png');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'styles.css'),'utf8');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
assert(fs.existsSync(asset),'APPROVED_COAST_ASSET_MISSING');
const sha=crypto.createHash('sha256').update(fs.readFileSync(asset)).digest('hex');
assert.equal(sha,'f15af01680e2db44ef8af1dff749169f1082ddd15b3760a96da7ff2211eb8259','APPROVED_COAST_SHA256_MISMATCH');
assert(index.includes('TAKY-LAF-SNAP-HOME-COAST-20260927-A'),'VISUAL_ID_NOT_BOUND');
assert(index.includes('assets/world/snap_pop_beach_asset.png'),'APPROVED_COAST_PATH_NOT_BOUND');
assert(!index.includes('assets/world/golden_world_scene.jpg'),'LEGACY_WORLD_SCENE_STILL_BOUND_TO_SNAP_HOME');
assert(index.includes('class="coastFx"'),'LIVING_COAST_FX_LAYER_MISSING');
for(const token of ['@keyframes coastFoamNormal','@keyframes coastWaterLight','html.reduce-motion .coastFx','prefers-reduced-motion:reduce']){
  assert(css.includes(token),'LIVING_FX_CONTRACT_MISSING:'+token);
}
assert(app.includes('document.documentElement.classList.toggle("reduce-motion"'),'APP_REDUCE_MOTION_NOT_WIRED');
console.log(JSON.stringify({gate:'SNAP_APPROVED_COAST_LIVING_BACKGROUND_V5',asset_sha256:sha,visual_id:'TAKY-LAF-SNAP-HOME-COAST-20260927-A',foam:true,water_light:true,legacy_world_replaced:true,reduced_motion:true,release:false,netlify:'HOLD'},null,2));
