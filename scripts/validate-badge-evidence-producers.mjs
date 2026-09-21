import fs from "node:fs";

const appSource=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
const indexSource=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");

function assert(name,condition){
  if(!condition) throw new Error("FAIL "+name);
  console.log("PASS",name);
}

assert("error-discovery-ui-is-explicit",
  indexSource.includes('id="recordEditErrorFound"')&&
  appSource.includes('explicitErrorFound=$("#recordEditErrorFound")?.checked===true')
);
assert("error-discovery-has-before-after-artifact-evidence",
  appSource.includes('sourceContractId:"SNAP_POP_CHILD_SELF_CORRECTION_V1"')&&
  appSource.includes("beforeArtifactRef:previousArtifactRef")&&
  appSource.includes("afterArtifactRef:`record:${recordId}:revision:${revisionId}`")
);
assert("deep-thinking-requires-explicit-child-reflection",
  indexSource.includes('id="deepThinkOpen"')&&
  indexSource.includes('id="deepThinkText"')&&
  indexSource.includes('id="deepThinkSave"')&&
  appSource.includes('source:"CHILD_EXPLICIT_REFLECTION"')&&
  appSource.includes('sourceContractId:"SNAP_POP_CHILD_REFLECTION_ARTIFACT_V1"')
);
assert("deep-thinking-not-based-on-empty-advance-or-time",
  !appSource.includes('recordBadgeBehaviorEvidence("DEEP_THINKING",{elapsed')&&
  !appSource.includes('recordBadgeBehaviorEvidence("DEEP_THINKING",{emptyAdvanceAttempts')
);
assert("special-behavior-is-declared-feature-action",
  appSource.includes('sourceContractId:"SNAP_POP_DECLARED_SPECIAL_ACTION_V1"')&&
  appSource.includes('featureContractId:"SNAP_POP_SPECIAL_EXPLORATION_V1"')&&
  appSource.includes('behaviorCode:"SPECIAL_EXPLORATION_COMPLETED"')&&
  appSource.includes('allowedFeatureContracts:["SNAP_POP_SPECIAL_EXPLORATION_V1"]')&&
  appSource.includes('allowedSpecialBehaviorCodes:["SPECIAL_EXPLORATION_COMPLETED"]')
);
assert("three-strong-families-route-through-evidence-gate",
  ["ERROR_DISCOVERY","DEEP_THINKING","SPECIAL_BEHAVIOR"].every(function(f){return appSource.includes('recordBadgeBehaviorEvidence("'+f+'"')})
);
assert("no-three-family-direct-observation-bypass",
  ["ERROR_DISCOVERY","DEEP_THINKING","SPECIAL_BEHAVIOR"].every(function(f){return !appSource.includes('recordBadgeBehaviorObservation("'+f+'"')})
);

console.log("BADGE_EVIDENCE_PRODUCER_WIRING_PASS");
