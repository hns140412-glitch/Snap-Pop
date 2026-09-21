(() => {
"use strict";
let singleton=null;
function create(deps){
const store=window.SnapPopStorage;
async function migrateLegacyState(){
  const marker=await store.get("migration_20260920_state_v1");
  if(marker)return;
  const entries=[],records=await store.get("records")||[],events=await store.get("completionEvents")||{},expLedger=await store.get("expLedger")||[],legacyExp=Number(await store.get("exp")||0),active=await store.get("active");
  let changedRecords=false;
  records.forEach((r,i)=>{
    if(!r.id){r.id=deps.uid("record");changedRecords=true}
    if(!r.completionEventId){r.completionEventId=`legacy_completion_${r.id}`;changedRecords=true}
    if(!r.language){r.language="ko";changedRecords=true}
    if(r.completionEventId&&!events[r.completionEventId])events[r.completionEventId]={at:r.date||new Date(0).toISOString(),recordId:r.id,legacy:true};
  });
  if(changedRecords)entries.push(["records",records]);
  entries.push(["completionEvents",events]);
  const ledgerTotal=expLedger.reduce((s,e)=>s+(Number(e.amount)||0),0);
  if(legacyExp>ledgerTotal){
    expLedger.unshift({eventId:"legacy_exp_baseline_20260920",type:"LEGACY_EXP_BASELINE",amount:legacyExp-ledgerTotal,at:new Date().toISOString(),legacy:true});
    entries.push(["expLedger",expLedger],["exp",legacyExp]);
  }else if(ledgerTotal>legacyExp){
    entries.push(["exp",ledgerTotal]);
  }
  if(active&&!active.id){active.id=deps.uid("explore_legacy");active.language=active.language||"ko";entries.push(["active",active])}
  entries.push(["migration_20260920_state_v1",{at:new Date().toISOString(),records:records.length,legacyExp,ledgerTotalBefore:ledgerTotal}]);
  await store.setMany(entries);
}
function runtimePhase(phase){if(window.__SNAP_RUNTIME_STATUS)window.__SNAP_RUNTIME_STATUS.phase=phase}
async function init(){
  runtimePhase("OPEN_DB");await store.open();
  runtimePhase("MIGRATE_LEGACY");await migrateLegacyState();
  runtimePhase("LOAD_CREW_RULES");const rules=await fetch("data/exploration-crew-rules.json").then(r=>{if(!r.ok)throw new Error("CREW_RULES_HTTP_"+r.status);return r.json()});deps.setRules(rules);
  runtimePhase("LOAD_LANDMARKS");const landmarks=await fetch("data/landmarks.json").then(r=>{if(!r.ok)throw new Error("LANDMARKS_HTTP_"+r.status);return r.json()});deps.setLandmarks(landmarks);
  runtimePhase("MIGRATE_IDENTITY");await deps.migrateIdentityFallback();
  runtimePhase("ENSURE_CREW_REGISTRY");await deps.ensureCrewRegistry();
  runtimePhase("SYNTHESIZE_CREW_WORLD");await deps.synthesizeCrewWorldState();
  runtimePhase("RENDER_LANDMARKS");deps.renderLandmarks();
  runtimePhase("PENDING_EXPRESSION");await deps.renderPendingExpressionIntent();
  runtimePhase("LOAD_SETTINGS");await deps.loadSettings();
  runtimePhase("RENDER_IDENTITY");await deps.renderIdentityPresence();
  runtimePhase("UPDATE_STATUS");await deps.updateStatus();
  runtimePhase("RENDER_RECORDS");await deps.renderRecords();
  runtimePhase("RENDER_GEMS");deps.renderGems();
  runtimePhase("RENDER_GROWTH");deps.renderGrowth();
  runtimePhase("INCOMING_HANDOFF");await deps.renderIncomingHandoff();
  runtimePhase("SPECIAL_INVITE");deps.renderSpecialInvite();
  runtimePhase("ACTIVE");const active=await store.get("active");if(active)deps.renderExplore(active);
  runtimePhase("DONE");
}
return Object.freeze({contract:"SNAP_POP_BOOTSTRAP_CONTROLLER_V1",migrateLegacyState,runtimePhase,init});
}
window.SnapPopBootstrapController=Object.freeze({instance(deps){if(!singleton)singleton=create(deps);return singleton}});
})();
