(() => {
  "use strict";

  const VERSION="2026.09.21-a";
  const ASSET_STATES=new Set(["UNRESOLVED","REVIEWED_ASSET_SET"]);
  const FORBIDDEN_KEYS=new Set([
    "identity","profile","name","photo","hair","glasses","face","userId","user_id",
    "tier","stars","level","rank","power","ability","score","exp","gem","gems",
    "reward","rewardAmount","reward_amount","badgeAwarded","awardState","catalogItemId"
  ]);

  function clean(value,max=160){
    return typeof value==="string"?value.trim().slice(0,max):"";
  }
  function containsForbidden(value,depth=0){
    if(depth>4||value===null||typeof value!=="object") return false;
    if(Array.isArray(value)) return value.some(x=>containsForbidden(x,depth+1));
    for(const [key,item] of Object.entries(value)){
      if(FORBIDDEN_KEYS.has(key)) return true;
      if(containsForbidden(item,depth+1)) return true;
    }
    return false;
  }
  function cleanRefs(value,maxItems=8){
    if(!Array.isArray(value)) return [];
    return value.filter(x=>typeof x==="string").map(x=>clean(x,220)).filter(Boolean).slice(0,maxItems);
  }
  function normalize(input={}){
    if(!input||typeof input!=="object"||Array.isArray(input)) throw new Error("BADGE_THEME_EXPRESSION_OBJECT_REQUIRED");
    if(containsForbidden(input)) throw new Error("BADGE_THEME_EXPRESSION_AUTHORITY_VIOLATION");
    const themeId=clean(input.themeId,80);
    if(!themeId) throw new Error("BADGE_THEME_EXPRESSION_ID_REQUIRED");
    const assetState=clean(input.assetState,40).toUpperCase()||"UNRESOLVED";
    if(!ASSET_STATES.has(assetState)) throw new Error("BADGE_THEME_EXPRESSION_ASSET_STATE_INVALID");
    const assetRefs=cleanRefs(input.assetRefs,12);
    if(assetState==="REVIEWED_ASSET_SET"&&!assetRefs.length) throw new Error("BADGE_THEME_EXPRESSION_REVIEWED_ASSET_REQUIRED");
    return Object.freeze({
      contract_version:"SNAP_POP_BADGE_THEME_EXPRESSION_V1",
      themeId,
      assetState,
      assetRefs:Object.freeze(assetRefs),
      poseRef:clean(input.poseRef,220)||null,
      backdropRef:clean(input.backdropRef,220)||null,
      propRefs:Object.freeze(cleanRefs(input.propRefs,8)),
      effectRefs:Object.freeze(cleanRefs(input.effectRefs,8)),
      expressionCue:clean(input.expressionCue,120)||null,
      identityMutationAllowed:false,
      growthMutationAllowed:false,
      economyMutationAllowed:false,
      awardMutationAllowed:false,
      powerMutationAllowed:false,
      cosmeticOnly:true
    });
  }
  function compose(identity={},themeExpression={}){
    const theme=normalize(themeExpression);
    return Object.freeze({
      identity,
      themeExpression:theme,
      identityStable:true,
      cosmeticOnly:true,
      powerEffect:null,
      rewardEffect:null,
      economyEffect:null
    });
  }

  window.SnapPopBadgeThemeExpression=Object.freeze({
    version:VERSION,
    assetStates:Object.freeze([...ASSET_STATES]),
    normalize,
    compose,
    containsForbidden
  });
})();