const assert=require('assert');
const fs=require('fs');
const path=require('path');
const release=require('../vendor/taky/release-contract.js');
const pwa=require('../vendor/taky/pwa-update-state.js');
const eventEnvelope=require('../vendor/taky/event-envelope.js');

delete globalThis.SnapPopReleaseDescriptor;
require('../snap-release-v01.js');
const d=globalThis.SnapPopReleaseDescriptor;
assert.equal(release.validateDescriptor(d).ok,true);
assert.equal(d.app_id,'snap-pop');

const index=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const app=fs.readFileSync(path.join(__dirname,'..','app.js'),'utf8');
const storage=fs.readFileSync(path.join(__dirname,'..','app-storage-runtime.js'),'utf8');
const sw=fs.readFileSync(path.join(__dirname,'..','sw.js'),'utf8');
const bridge=fs.readFileSync(path.join(__dirname,'..','snap-bridge.js'),'utf8');

for(const p of ['vendor/taky/release-contract.js','vendor/taky/pwa-update-state.js','vendor/taky/event-envelope.js','snap-release-v01.js','snap-pwa-update-v01.js']) {
  assert(index.includes(p),p);
}
assert(app.includes('SnapPopReleaseDescriptor'));
assert(app.includes('SnapPopPwaSafePoint'));
assert(!app.includes('navigator.serviceWorker.register("sw.js")'));
assert(storage.includes('snap-pop-safe-point'));
assert(sw.includes("const C='snap-pop:'+RELEASE.release_id"));
assert(!sw.includes(".then(()=>self.skipWaiting())"));
assert(sw.includes("e.data?.type==='APPLY_UPDATE'"));
assert(bridge.includes('EventEnvelope.create'));
assert(!bridge.includes('const eventId = () =>'));

let s='IDLE';
for(const [event,ctx,expected] of [
 ['DETECT',{},'UPDATE_DETECTED'],
 ['DOWNLOAD_COMPLETE',{},'DOWNLOADED_WAITING'],
 ['EVALUATE_SAFE_POINT',{safe_point:false},'DOWNLOADED_WAITING'],
 ['EVALUATE_SAFE_POINT',{safe_point:true},'SAFE_TO_ACTIVATE'],
 ['ACTIVATE',{safe_point:true},'ACTIVATING']
]){
 const r=pwa.transition(s,event,ctx);
 assert.equal(r.ok,true,event);
 assert.equal(r.state,expected,event);
 s=r.state;
}
const a=eventEnvelope.create({source:'snap-pop',event_type:'TASK_PROGRESS',payload:{x:1}});
const b=eventEnvelope.create({source:'snap-pop',event_type:'TASK_PROGRESS',payload:{x:1}});
assert.notEqual(a.event_id,b.event_id);
assert.equal(a.payload_digest,b.payload_digest);
console.log('SNAP_SHARED_RUNTIME_RECONCILIATION_PASS');
