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
  "serviceWorker.register",
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
