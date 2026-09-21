import fs from "node:fs";
import vm from "node:vm";

const source=fs.readFileSync(new URL("../badge-evidence-contract-runtime.js",import.meta.url),"utf8");
const appSource=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
const window={};
vm.runInNewContext(source,{window,Object,Array,String,Number,Math,Error,RegExp,Set});
const evidence=window.SnapPopBadgeEvidenceContract;

function assert(name,condition){
  if(!condition) throw new Error("FAIL "+name);
  console.log("PASS",name);
}
function blocked(name,fn,code){
  let ok=false;
  try{fn()}catch(error){ok=error?.message===code}
  assert(name,ok);
}

const errorDiscovery=evidence.verify("ERROR_DISCOVERY",{
  explicitChildAction:true,
  evidenceRef:"evt:self-correction:1",
  sourceContractId:"SNAP_POP_CHILD_SELF_CORRECTION_V1",
  errorMarkedByChild:true,
  beforeArtifactRef:"record:1:v1",
  afterArtifactRef:"record:1:v2"
});
assert("error-discovery-requires-child-marked-before-after",errorDiscovery.errorMarkedByChild===true&&!!errorDiscovery.beforeArtifactRef&&!!errorDiscovery.afterArtifactRef);

const deep=evidence.verify("DEEP_THINKING",{
  explicitChildAction:true,
  evidenceRef:"evt:reflection:1",
  sourceContractId:"SNAP_POP_CHILD_REFLECTION_ARTIFACT_V1",
  childChoseToReflect:true,
  reflectionArtifactRef:"reflection:1"
});
assert("deep-thinking-requires-explicit-reflection-artifact",deep.childChoseToReflect===true&&deep.reflectionArtifactRef==="reflection:1");

blocked("elapsed-time-cannot-prove-deep-thinking",()=>evidence.verify("DEEP_THINKING",{
  explicitChildAction:true,
  evidenceRef:"evt:reflection:2",
  sourceContractId:"SNAP_POP_CHILD_REFLECTION_ARTIFACT_V1",
  childChoseToReflect:true,
  reflectionArtifactRef:"reflection:2",
  elapsedMs:60000
}),"BADGE_EVIDENCE_WEAK_PROXY_FORBIDDEN");

blocked("retry-count-cannot-prove-error-discovery",()=>evidence.verify("ERROR_DISCOVERY",{
  explicitChildAction:true,
  evidenceRef:"evt:error:2",
  sourceContractId:"SNAP_POP_CHILD_SELF_CORRECTION_V1",
  errorMarkedByChild:true,
  beforeArtifactRef:"a",
  afterArtifactRef:"b",
  retryCount:3
}),"BADGE_EVIDENCE_WEAK_PROXY_FORBIDDEN");

blocked("special-behavior-default-deny-without-allowlist",()=>evidence.verify("SPECIAL_BEHAVIOR",{
  explicitChildAction:true,
  evidenceRef:"evt:special:1",
  sourceContractId:"SNAP_POP_DECLARED_SPECIAL_ACTION_V1",
  declaredByFeature:true,
  featureContractId:"FEATURE_X_V1",
  behaviorCode:"SPECIAL_X"
}),"BADGE_SPECIAL_BEHAVIOR_FEATURE_NOT_ALLOWLISTED");

const special=evidence.verify("SPECIAL_BEHAVIOR",{
  explicitChildAction:true,
  evidenceRef:"evt:special:2",
  sourceContractId:"SNAP_POP_DECLARED_SPECIAL_ACTION_V1",
  declaredByFeature:true,
  featureContractId:"FEATURE_X_V1",
  behaviorCode:"SPECIAL_X"
},{
  allowedFeatureContracts:["FEATURE_X_V1"],
  allowedSpecialBehaviorCodes:["SPECIAL_X"]
});
assert("special-behavior-requires-double-allowlist",special.featureContractId==="FEATURE_X_V1"&&special.behaviorCode==="SPECIAL_X");

blocked("ai-inference-key-forbidden",()=>evidence.verify("DEEP_THINKING",{
  explicitChildAction:true,
  evidenceRef:"evt:reflection:3",
  sourceContractId:"SNAP_POP_CHILD_REFLECTION_ARTIFACT_V1",
  childChoseToReflect:true,
  reflectionArtifactRef:"reflection:3",
  aiInference:true
}),"BADGE_EVIDENCE_WEAK_PROXY_FORBIDDEN");

assert("app-has-evidence-gated-recorder",
  appSource.includes("recordBadgeBehaviorEvidence")&&
  appSource.includes("SnapPopBadgeEvidenceContract.verify")
);
assert("app-still-has-no-direct-weak-detector-wiring",
  !appSource.includes('recordBadgeBehaviorObservation("ERROR_DISCOVERY"')&&
  !appSource.includes('recordBadgeBehaviorObservation("DEEP_THINKING"')&&
  !appSource.includes('recordBadgeBehaviorObservation("SPECIAL_BEHAVIOR"')
);

console.log("BADGE_EXPLICIT_EVIDENCE_CONTRACT_PASS");