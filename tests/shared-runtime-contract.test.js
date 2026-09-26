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

const snapIndex=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const snapRubric=fs.readFileSync(path.join(__dirname,'..','snap-rubric-verifier.js'),'utf8');
const snapBridgeSource=fs.readFileSync(path.join(__dirname,'..','snap-bridge.js'),'utf8');
assert(snapIndex.includes('snap-rubric-verifier.js'));
assert(snapRubric.includes('SnapRubricVerifier'));
assert(snapRubric.includes('HUMAN_RUBRIC_BINARY'));
assert(snapBridgeSource.includes('requestRubricReview'));
assert(!snapRubric.includes('auto_verification:true'));
console.log('PASS: Snap exposes human-rubric review requests and forbids automatic production verification');

const visualBinding=require('../snap-reviewed-visual-binding-v1.js');
assert.equal(visualBinding.WORLD_BINDING.runtime_asset,'assets/world/golden_world_scene.jpg');
assert.equal(visualBinding.WORLD_BINDING.review_status,'REVIEWED_RUNTIME_CANDIDATE');
assert.equal(visualBinding.WORLD_BINDING.release_pass,false);
assert.equal(visualBinding.CREW_BINDING.review_status,'HOLD_NO_APPROVED_INDIVIDUAL_ASSET');
assert.equal(visualBinding.CREW_BINDING.dynamic_binding_allowed,false);
assert(visualBinding.FORBIDDEN_DIRECT_RUNTIME_ASSETS.includes('assets/reference/approved_visual_source.png'));
assert(visualBinding.FORBIDDEN_DIRECT_RUNTIME_ASSETS.includes('assets/character/character_master_hd.jpg'));
assert(visualBinding.FORBIDDEN_DIRECT_RUNTIME_ASSETS.includes('assets/guide/maltipoo_guide_hd.jpg'));
assert.equal(visualBinding.CROSS_APP_VISUAL_IMPORT_POLICY.ready_core6_auto_import,false);
assert(snapIndex.includes('snap-reviewed-visual-binding-v1.js'));
assert(snapIndex.includes('assets/world/golden_world_scene.jpg'));
assert(!snapIndex.includes('src="assets/reference/approved_visual_source.png"'));
const resolved=visualBinding.resolve({world_state:'BASE_WORLD',theme_expression:'GOLDEN_WORLD',crew_visual:'STATIC_REFERENCE_LINEAGE_ONLY'});
assert.equal(resolved.ok,true);
assert.equal(resolved.guards.auto_asset_promotion,false);
assert.equal(resolved.guards.auto_release_pass,false);
assert.equal(visualBinding.resolve({crew_visual:'AUTO_GENERATED_CREW'}).ok,false);
const crewRegistry=require('../snap-crew-asset-registry-v1.js');
assert.equal(crewRegistry.runtimeBinding('unknown').state,'CONTENT_APPROVAL_HOLD');
assert.equal(crewRegistry.runtimeBinding('unknown').implementation_ready,true);
assert.equal(crewRegistry.validateCandidate({
  owner:'snap-pop',
  visual_id:'crew-x',
  asset_path:'assets/character/character_master_hd.jpg',
  review_status:'APPROVED_RUNTIME_ASSET',
  user_confirmed:true,
  review_evidence_refs:['fake']
}).ok,false);
assert.equal(crewRegistry.validateCandidate({
  owner:'ready-set',
  visual_id:'core6-x',
  asset_path:'assets/crew-approved/core6-x.webp',
  review_status:'APPROVED_RUNTIME_ASSET',
  user_confirmed:true,
  review_evidence_refs:['ready-evidence']
}).reason,'OWNER_SCOPE_MISMATCH');
assert.equal(crewRegistry.validateCandidate({
  owner:'snap-pop',
  visual_id:'crew-approved-x',
  asset_path:'assets/crew-approved/crew-approved-x.webp',
  review_status:'APPROVED_RUNTIME_ASSET',
  user_confirmed:false,
  review_evidence_refs:['review-1']
}).reason,'USER_CONFIRMATION_REQUIRED');
const crewHold=visualBinding.resolve({world_state:'BASE_WORLD',theme_expression:'GOLDEN_WORLD',crew_visual:'STATIC_REFERENCE_LINEAGE_ONLY'});
assert.equal(crewHold.ok,true);
assert.equal(crewHold.crew.implementation_ready,true);
assert.equal(crewHold.crew.content_state,'CONTENT_APPROVAL_HOLD');
console.log('PASS: SP-BADGE-008 binds only reviewed runtime world visual and holds unreviewed crew assets');
