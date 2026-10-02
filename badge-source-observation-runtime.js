(() => {
  "use strict";

  const VERSION="2026.10.02-a";
  const CONTRACT="TAKY_BADGE_SOURCE_OBSERVATION_V1";
  const ALLOWED_APPS=new Set(["READY_SET","SNAP_POP","HIDE_SEEK","EXTERNAL_APP"]);
  const ALLOWED_FAMILIES=new Set([
    "SELF_START","TIME_CREATION","EXTRA_TASK","FOCUS","RETURN_RECOVERY",
    "HELP_REQUEST","ERROR_DISCOVERY","RETRY","DEEP_THINKING","ISSUE_DURATION",
    "SELF_EXPLANATION","PLAN_ADAPTATION","SPECIAL_BEHAVIOR","WRITING_EXPLORATION",
    "GOAL_COMPLETE","SELF_CHOICE","SELF_PLANNING","HELP_USE","ERROR_CORRECTION",
    "ERROR_ANALYSIS","BREAKTHROUGH","CONCEPT_UNDERSTANDING","SELF_REGULATION",
    "STRATEGY_SWITCH","IMPROVEMENT"
  ]);
  const FORBIDDEN_KEYS=new Set([
    "score","grade","mastery","masteryLevel","mastery_level","ability","abilityLabel","ability_label",
    "intelligence","trait","characterTrait","character_trait","aiInference","ai_inference",
    "modelInference","model_inference","confidence","elapsedMs","elapsed_ms","silenceMs","silence_ms"
  ]);

  function clean(value,max=180){return typeof value==="string"?value.trim().slice(0,max):""}
  function hasForbiddenKeyDeep(value,depth=0){
    if(depth>4||value===null||typeof value!=="object")return false;
    if(Array.isArray(value))return value.some(x=>hasForbiddenKeyDeep(x,depth+1));
    for(const [key,item] of Object.entries(value)){
      if(FORBIDDEN_KEYS.has(key))return true;
      if(hasForbiddenKeyDeep(item,depth+1))return true;
    }
    return false;
  }
  function cleanPayload(payload={}){
    if(!payload||typeof payload!=="object"||Array.isArray(payload))return {};
    if(hasForbiddenKeyDeep(payload))throw new Error("BADGE_SOURCE_OBSERVATION_WEAK_PROXY_FORBIDDEN");
    const out={};
    for(const [key,value] of Object.entries(payload).slice(0,24)){
      if(value===null||typeof value==="boolean"||Number.isFinite(value))out[key]=value;
      else if(typeof value==="string")out[key]=clean(value,180);
      else if(Array.isArray(value))out[key]=value.filter(x=>typeof x==="string").map(x=>clean(x,100)).slice(0,12);
    }
    return out;
  }
  function normalize(input={}){
    const eventId=clean(input.event_id||input.eventId,160);
    const appId=clean(input.app_id||input.appId,80).toUpperCase();
    const eventFamily=clean(input.event_family||input.eventFamily||input.family,80).toUpperCase();
    const behaviorCode=clean(input.behavior_code||input.behaviorCode,120).toUpperCase();
    const sourceContractId=clean(input.source_contract_id||input.sourceContractId,140);
    const evidenceRef=clean(input.evidence_ref||input.evidenceRef,220);
    if(!eventId)throw new Error("BADGE_SOURCE_EVENT_ID_REQUIRED");
    if(!ALLOWED_APPS.has(appId))throw new Error("BADGE_SOURCE_APP_INVALID");
    if(!ALLOWED_FAMILIES.has(eventFamily))throw new Error("BADGE_SOURCE_FAMILY_INVALID");
    if(!behaviorCode)throw new Error("BADGE_SOURCE_BEHAVIOR_CODE_REQUIRED");
    if(!sourceContractId)throw new Error("BADGE_SOURCE_CONTRACT_REQUIRED");
    if(!evidenceRef)throw new Error("BADGE_SOURCE_EVIDENCE_REF_REQUIRED");
    if(input.explicit_child_action!==true&&input.explicitChildAction!==true)
      throw new Error("BADGE_SOURCE_EXPLICIT_CHILD_ACTION_REQUIRED");

    const payload=cleanPayload(input.payload||{});
    return Object.freeze({
      contract_version:CONTRACT,
      event_id:eventId,
      app_id:appId,
      event_family:eventFamily,
      behavior_code:behaviorCode,
      occurred_at:clean(input.occurred_at||input.occurredAt||input.at,80)||new Date().toISOString(),
      source_contract_id:sourceContractId,
      evidence_ref:evidenceRef,
      explicit_child_action:true,
      payload,
      disposition:"OBSERVATION_ONLY",
      badge_award_authorized:false,
      economy_mutation_authorized:false,
      catalog_activation_allowed:false
    });
  }

  window.TakyBadgeSourceObservation=Object.freeze({
    version:VERSION,
    contract:CONTRACT,
    families:Object.freeze([...ALLOWED_FAMILIES]),
    normalize,
    hasForbiddenKeyDeep
  });
})();