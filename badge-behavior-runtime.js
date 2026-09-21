(() => {
  "use strict";

  const VERSION="2026.09.21-a";
  const FAMILIES=new Set([
    "SELF_START","TIME_CREATION","EXTRA_TASK","FOCUS","RETURN_RECOVERY",
    "HELP_REQUEST","ERROR_DISCOVERY","RETRY","DEEP_THINKING","ISSUE_DURATION",
    "SELF_EXPLANATION","PLAN_ADAPTATION","SPECIAL_BEHAVIOR","WRITING_EXPLORATION"
  ]);
  const FORBIDDEN_KEYS=new Set([
    "score","performanceScore","performance_score","grade","ability","abilityLabel","ability_label",
    "intelligence","trait","characterTrait","character_trait","failureLabel","failure_label",
    "mastery","masteryLevel","mastery_level","rank","level","penalty","rewardAmount","reward_amount"
  ]);

  function clean(value,max=160){
    return typeof value==="string"?value.trim().slice(0,max):"";
  }

  function hasForbiddenKeyDeep(value,depth=0){
    if(depth>4||value===null||typeof value!=="object") return false;
    if(Array.isArray(value)) return value.some(x=>hasForbiddenKeyDeep(x,depth+1));
    for(const [key,item] of Object.entries(value)){
      if(FORBIDDEN_KEYS.has(key)) return true;
      if(hasForbiddenKeyDeep(item,depth+1)) return true;
    }
    return false;
  }

  function cleanPayload(payload={}){
    if(!payload||typeof payload!=="object"||Array.isArray(payload)) return {};
    if(hasForbiddenKeyDeep(payload)) throw new Error("BADGE_BEHAVIOR_LABELING_FORBIDDEN");
    const out={};
    for(const [key,value] of Object.entries(payload).slice(0,24)){
      if(value===null||typeof value==="boolean"||Number.isFinite(value)) out[key]=value;
      else if(typeof value==="string") out[key]=clean(value,180);
      else if(Array.isArray(value)) out[key]=value.filter(x=>typeof x==="string").map(x=>clean(x,80)).slice(0,8);
    }
    return out;
  }

  function normalize(observation={}){
    const family=clean(observation.family,80);
    if(!FAMILIES.has(family)) throw new Error("BADGE_BEHAVIOR_UNKNOWN_FAMILY");
    const eventId=clean(observation.eventId,160);
    if(!eventId) throw new Error("BADGE_BEHAVIOR_EVENT_ID_REQUIRED");
    return Object.freeze({
      contract_version:"SNAP_POP_BADGE_BEHAVIOR_OBSERVATION_V1",
      eventId,
      family,
      source:clean(observation.source,80)||"SNAP_POP",
      at:clean(observation.at,80)||new Date().toISOString(),
      payload:cleanPayload(observation.payload),
      disposition:"OBSERVATION_ONLY",
      badgeAwardAuthorized:false,
      catalogActivationAllowed:false,
      childAbilityInferenceAllowed:false,
      penaltyAllowed:false
    });
  }

  window.SnapPopBadgeBehavior=Object.freeze({
    version:VERSION,
    families:Object.freeze([...FAMILIES]),
    normalize,
    hasForbiddenKeyDeep
  });
})();