(() => {
  "use strict";

  const VERSION="2026.09.21-a";
  const STRONG_FAMILIES=new Set(["ERROR_DISCOVERY","DEEP_THINKING","SPECIAL_BEHAVIOR"]);
  const WEAK_PROXY_KEYS=new Set([
    "elapsedMs","elapsed_ms","idleMs","idle_ms","silenceMs","silence_ms",
    "attemptCount","attempt_count","emptyAttemptCount","empty_attempt_count",
    "retryCount","retry_count","editCount","edit_count","score","confidence",
    "aiInference","ai_inference","modelInference","model_inference"
  ]);

  function clean(value,max=160){
    return typeof value==="string"?value.trim().slice(0,max):"";
  }
  function requireTrue(obj,key,code){
    if(obj?.[key]!==true) throw new Error(code);
  }
  function requireString(obj,key,code){
    const value=clean(obj?.[key],180);
    if(!value) throw new Error(code);
    return value;
  }
  function hasWeakProxy(value,depth=0){
    if(depth>4||value===null||typeof value!=="object") return false;
    if(Array.isArray(value)) return value.some(x=>hasWeakProxy(x,depth+1));
    for(const [key,item] of Object.entries(value)){
      if(WEAK_PROXY_KEYS.has(key)) return true;
      if(hasWeakProxy(item,depth+1)) return true;
    }
    return false;
  }
  function base(family,evidence){
    if(!STRONG_FAMILIES.has(family)) throw new Error("BADGE_EVIDENCE_FAMILY_UNSUPPORTED");
    if(!evidence||typeof evidence!=="object"||Array.isArray(evidence)) throw new Error("BADGE_EVIDENCE_OBJECT_REQUIRED");
    if(hasWeakProxy(evidence)) throw new Error("BADGE_EVIDENCE_WEAK_PROXY_FORBIDDEN");
    requireTrue(evidence,"explicitChildAction","BADGE_EVIDENCE_EXPLICIT_CHILD_ACTION_REQUIRED");
    return {
      contract_version:"SNAP_POP_BADGE_EXPLICIT_EVIDENCE_V1",
      family,
      evidenceRef:requireString(evidence,"evidenceRef","BADGE_EVIDENCE_REF_REQUIRED"),
      sourceContractId:requireString(evidence,"sourceContractId","BADGE_EVIDENCE_SOURCE_CONTRACT_REQUIRED"),
      explicitChildAction:true,
      inferenceAllowed:false,
      elapsedTimeEvidenceAllowed:false,
      scoreEvidenceAllowed:false
    };
  }
  function verifyErrorDiscovery(evidence){
    const out=base("ERROR_DISCOVERY",evidence);
    if(out.sourceContractId!=="SNAP_POP_CHILD_SELF_CORRECTION_V1") throw new Error("BADGE_ERROR_DISCOVERY_SOURCE_CONTRACT_INVALID");
    requireTrue(evidence,"errorMarkedByChild","BADGE_ERROR_DISCOVERY_CHILD_MARK_REQUIRED");
    return Object.freeze({...out,
      beforeArtifactRef:requireString(evidence,"beforeArtifactRef","BADGE_ERROR_DISCOVERY_BEFORE_REQUIRED"),
      afterArtifactRef:requireString(evidence,"afterArtifactRef","BADGE_ERROR_DISCOVERY_AFTER_REQUIRED"),
      errorMarkedByChild:true
    });
  }
  function verifyDeepThinking(evidence){
    const out=base("DEEP_THINKING",evidence);
    if(out.sourceContractId!=="SNAP_POP_CHILD_REFLECTION_ARTIFACT_V1") throw new Error("BADGE_DEEP_THINKING_SOURCE_CONTRACT_INVALID");
    requireTrue(evidence,"childChoseToReflect","BADGE_DEEP_THINKING_EXPLICIT_REFLECTION_REQUIRED");
    return Object.freeze({...out,
      reflectionArtifactRef:requireString(evidence,"reflectionArtifactRef","BADGE_DEEP_THINKING_ARTIFACT_REQUIRED"),
      childChoseToReflect:true
    });
  }
  function verifySpecialBehavior(evidence,options={}){
    const out=base("SPECIAL_BEHAVIOR",evidence);
    if(out.sourceContractId!=="SNAP_POP_DECLARED_SPECIAL_ACTION_V1") throw new Error("BADGE_SPECIAL_BEHAVIOR_SOURCE_CONTRACT_INVALID");
    requireTrue(evidence,"declaredByFeature","BADGE_SPECIAL_BEHAVIOR_FEATURE_DECLARATION_REQUIRED");
    const featureContractId=requireString(evidence,"featureContractId","BADGE_SPECIAL_BEHAVIOR_FEATURE_CONTRACT_REQUIRED");
    const behaviorCode=requireString(evidence,"behaviorCode","BADGE_SPECIAL_BEHAVIOR_CODE_REQUIRED");
    const allowedFeatureContracts=Array.isArray(options.allowedFeatureContracts)?options.allowedFeatureContracts:[];
    const allowedSpecialBehaviorCodes=Array.isArray(options.allowedSpecialBehaviorCodes)?options.allowedSpecialBehaviorCodes:[];
    if(!allowedFeatureContracts.includes(featureContractId)) throw new Error("BADGE_SPECIAL_BEHAVIOR_FEATURE_NOT_ALLOWLISTED");
    if(!allowedSpecialBehaviorCodes.includes(behaviorCode)) throw new Error("BADGE_SPECIAL_BEHAVIOR_CODE_NOT_ALLOWLISTED");
    return Object.freeze({...out,featureContractId,behaviorCode,declaredByFeature:true});
  }
  function verify(family,evidence,options={}){
    if(family==="ERROR_DISCOVERY") return verifyErrorDiscovery(evidence);
    if(family==="DEEP_THINKING") return verifyDeepThinking(evidence);
    if(family==="SPECIAL_BEHAVIOR") return verifySpecialBehavior(evidence,options);
    throw new Error("BADGE_EVIDENCE_FAMILY_UNSUPPORTED");
  }

  window.SnapPopBadgeEvidenceContract=Object.freeze({
    version:VERSION,
    families:Object.freeze([...STRONG_FAMILIES]),
    weakProxyKeys:Object.freeze([...WEAK_PROXY_KEYS]),
    verify,
    hasWeakProxy
  });
})();