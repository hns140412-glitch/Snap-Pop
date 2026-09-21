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
assert.equal(d.app_version,'REV_12');

const sw=fs.readFileSync(path.join(__dirname,'..','sw.js'),'utf8');
const index=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const app=fs.readFileSync(path.join(__dirname,'..','app.js'),'utf8');
const bridge=fs.readFileSync(path.join(__dirname,'..','snap-bridge.js'),'utf8');

assert(sw.includes("const C='snap-pop:'+RELEASE.release_id"));
assert(!sw.includes(".then(()=>self.skipWaiting())"));
assert(sw.includes("e.data?.type==='APPLY_UPDATE'"));
assert(index.includes('vendor/taky/release-contract.js'));
assert(index.includes('vendor/taky/pwa-update-state.js'));
assert(index.includes('vendor/taky/event-envelope.js'));
assert(index.includes('snap-release-v01.js'));
assert(index.includes('snap-pwa-update-v01.js'));
assert(app.includes('globalThis.SnapPopPwaSafePoint=()=>!snapActiveExploration'));
assert(!app.includes('navigator.serviceWorker.register("sw.js")'));

let s='IDLE';
for(const [event,ctx,expected] of [
  ['DETECT',{},'UPDATE_DETECTED'],
  ['DOWNLOAD_COMPLETE',{},'DOWNLOADED_WAITING'],
  ['EVALUATE_SAFE_POINT',{safe_point:false},'DOWNLOADED_WAITING'],
  ['EVALUATE_SAFE_POINT',{safe_point:true},'SAFE_TO_ACTIVATE'],
  ['ACTIVATE',{safe_point:true},'ACTIVATING']
]){
  const r=pwa.transition(s,event,ctx);
  assert.equal(r.ok,true);
  assert.equal(r.state,expected);
  s=r.state;
}
console.log('PASS: Snap consumes TAKY shared release/PWA mechanisms while retaining Snap exploration semantics');


const ev1=eventEnvelope.create({source:'snap-pop',event_type:'TASK_PROGRESS',payload:{x:1}});
const ev2=eventEnvelope.create({source:'snap-pop',event_type:'TASK_PROGRESS',payload:{x:1}});
assert.notEqual(ev1.event_id,ev2.event_id);
assert.equal(ev1.payload_digest,ev2.payload_digest);
assert(bridge.includes("EventEnvelope.create"));
assert(!bridge.includes("const eventId = () =>"));
console.log('PASS: Snap bridge event identity uses TAKY immutable event envelope');
