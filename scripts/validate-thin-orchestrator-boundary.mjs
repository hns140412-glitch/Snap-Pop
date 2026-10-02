import fs from "node:fs";

const app=fs.readFileSync("app.js","utf8");
const bytes=Buffer.byteLength(app,"utf8");

const forbidden=[
  "LEVEL_NEEDS",
  "LEVEL_THRESHOLDS",
  "IDENTITY_DEFAULT",
  "function stableHash",
  "function affinityTier",
  "function levelFromExp",
  "function levelProgress",
  "function calcExp",
  "function openDB",
  "function get(k)",
  "function set(k,v)",
  "function setMany",
  "function html(s)"
];

for(const token of forbidden){
  if(app.includes(token)){
    console.error("THIN_ORCHESTRATOR_BOUNDARY_FAIL residual owner logic:",token);
    process.exit(1);
  }
}

if(app.includes("queryAll:$,")){
  console.error("THIN_ORCHESTRATOR_BOUNDARY_FAIL queryAll must use collection selector");
  process.exit(1);
}

const required=[
  "SnapPopWritingController.instance",
  "SnapPopWritingFlowController.instance",
  "SnapPopCrewController.instance",
  "SnapPopCrewRuntimeController.instance",
  "SnapPopRecordsGrowthController.instance",
  "SnapPopRecordsFlowController.instance",
  "SnapPopSpecialController.instance",
  "SnapPopImaginationController.instance",
  "SnapPopSettingsProfileController.instance",
  "SnapPopBadgeController.instance",
  "SnapPopBridgeContextController.instance",
  "SnapPopInteractionSupportController.instance",
  "SnapPopBootstrapController.instance",
  ".install();",
  "init().then"
];

for(const token of required){
  if(!app.includes(token)){
    console.error("THIN_ORCHESTRATOR_BOUNDARY_FAIL missing orchestration contract:",token);
    process.exit(1);
  }
}

if(bytes>13000){
  console.error("THIN_ORCHESTRATOR_BOUNDARY_FAIL app.js bytes",bytes,"> 13000");
  process.exit(1);
}

console.log("THIN_ORCHESTRATOR_BOUNDARY_PASS",{bytes,maxBytes:13000});


const pwaAdapter=fs.readFileSync("snap-pwa-update-v01.js","utf8");
if(app.includes("serviceWorker.register")){
  console.error("THIN_ORCHESTRATOR_BOUNDARY_FAIL app must not own service worker registration");
  process.exit(1);
}
if(!pwaAdapter.includes("navigator.serviceWorker.register('./sw.js')")){
  console.error("THIN_ORCHESTRATOR_BOUNDARY_FAIL shared PWA adapter must own service worker registration");
  process.exit(1);
}
