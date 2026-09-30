#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex');
const cfg=JSON.parse(fs.readFileSync(path.join(root,'assets/world/snap-living-background.v5.json'),'utf8'));
assert.equal(cfg.visual_id,'TAKY-LAF-SNAP-HOME-COAST-20260927-A');
assert.equal(sha(cfg.master.path),cfg.master.sha256,'APPROVED_SNAP_MASTER_SHA_MISMATCH');
assert.equal(sha(cfg.motion.path),cfg.motion.sha256,'SNAP_V5_MOTION_SHA_MISMATCH');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'styles.css'),'utf8');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
for(const p of [cfg.master.path,cfg.motion.path]){assert(html.includes(p),'RUNTIME_PATH_NOT_BOUND:'+p);assert(sw.includes(p),'OFFLINE_CACHE_MISSING:'+p)}
assert(html.includes('id="snapLivingMotion"'));
assert(css.includes('data-snap-living-motion="off"'));
assert(app.includes('syncLivingMotion'));
assert(app.includes('prefers-reduced-motion'));
assert.equal(cfg.runtime.remote_fetch,false);
assert.equal(cfg.gates.main_merge,'HOLD');
assert.equal(cfg.gates.netlify,'HOLD');
console.log(JSON.stringify({gate:'SNAP_LIVING_BACKGROUND_V5',master:'PASS',motion:'PASS',runtimeBinding:'PASS',offlineCache:'PASS',visualSignoff:'OPEN',mainMerge:'HOLD',netlify:'HOLD'},null,2));
