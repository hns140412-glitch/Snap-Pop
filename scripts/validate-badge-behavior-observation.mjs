import fs from "node:fs";
import vm from "node:vm";

const runtimeSource=fs.readFileSync(new URL("../badge-behavior-runtime.js",import.meta.url),"utf8");
const appSource=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
const flowSource=fs.readFileSync(new URL("../writing-flow-controller.js",import.meta.url),"utf8");
const catalog=JSON.parse(fs.readFileSync(new URL("../data/badge-catalog-working.json",import.meta.url),"utf8"));

const window={};
vm.runInNewContext(runtimeSource,{window,Object,Array,String,Number,Math,Error,RegExp,Set,Date});
const badge=window.SnapPopBadgeBehavior;

function assert(name,condition){
  if(!condition) throw new Error("FAIL "+name);
  console.log("PASS",name);
}

const help=badge.normalize({
  eventId:"evt-1",
  family:"HELP_REQUEST",
  source:"SNAP_POP",
  payload:{explicitAction:true,landmark:"idea",step:0}
});

assert("help-request-normalizes-as-observation-only",
  help.family==="HELP_REQUEST"&&
  help.disposition==="OBSERVATION_ONLY"
);
assert("observation-never-authorizes-award",
  help.badgeAwardAuthorized===false&&
  help.catalogActivationAllowed===false
);
assert("observation-never-infers-child-ability",
  help.childAbilityInferenceAllowed===false&&
  help.penaltyAllowed===false
);

let labelBlocked=false;
try{
  badge.normalize({
    eventId:"evt-2",
    family:"ERROR_DISCOVERY",
    payload:{abilityLabel:"weak writer"}
  });
}catch(error){
  labelBlocked=error?.message==="BADGE_BEHAVIOR_LABELING_FORBIDDEN";
}
assert("ability-labeling-payload-blocked",labelBlocked);

let scoreBlocked=false;
try{
  badge.normalize({
    eventId:"evt-3",
    family:"FOCUS",
    payload:{performanceScore:92}
  });
}catch(error){
  scoreBlocked=error?.message==="BADGE_BEHAVIOR_LABELING_FORBIDDEN";
}
assert("performance-score-payload-blocked",scoreBlocked);

assert("taxonomy-covers-recovery-retry-help-error-thinking-special",
  ["RETURN_RECOVERY","RETRY","HELP_REQUEST","ERROR_DISCOVERY","DEEP_THINKING","SPECIAL_BEHAVIOR"]
    .every(x=>badge.families.includes(x))
);

assert("working-catalog-stays-inactive",
  catalog.status==="WORKING_DRAFT_NOT_ACTIVE"&&
  catalog.items.every(x=>x.active===false&&x.status==="WORKING_DRAFT")
);

assert("app-records-explicit-help-signal",
  appSource.includes('recordBadgeBehaviorObservation("HELP_REQUEST"')&&
  appSource.includes("explicitAction:true")
);
assert("app-records-writing-completion-as-fact-event",
  flowSource.includes('deps.recordBadgeBehaviorObservation("WRITING_EXPLORATION"')&&
  flowSource.includes("explicitCompletion:true")
);
assert("app-records-optional-extra-task-completion",
  appSource.includes('recordBadgeBehaviorObservation("EXTRA_TASK"')&&
  appSource.includes("explicitChoice:true")&&
  appSource.includes("completed:true")
);
assert("app-does-not-infer-deep-thinking-from-empty-attempts",
  !appSource.includes('recordBadgeBehaviorObservation("DEEP_THINKING"')
);
assert("app-records-retry-only-from-explicit-revision",
  appSource.includes('recordBadgeBehaviorObservation("RETRY"')&&
  appSource.includes("explicitRevision:true")&&
  appSource.includes("originalPreserved:true")&&
  appSource.includes("rewardChanged:false")
);
assert("app-still-does-not-infer-error-or-special-without-source-contract",
  !appSource.includes('recordBadgeBehaviorObservation("ERROR_DISCOVERY"')&&
  !appSource.includes('recordBadgeBehaviorObservation("SPECIAL_BEHAVIOR"')
);

console.log("BADGE_BEHAVIOR_OBSERVATION_PASS");
