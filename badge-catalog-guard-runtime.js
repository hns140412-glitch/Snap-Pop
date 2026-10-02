(() => {
  "use strict";

  const VERSION="2026.10.02-b";

  function validSourceMatcher(x={}){
    return !!(x&&typeof x==="object"&&!Array.isArray(x)&&
      typeof x.appId==="string"&&x.appId.trim()&&
      typeof x.eventFamily==="string"&&x.eventFamily.trim()&&
      typeof x.behaviorCode==="string"&&x.behaviorCode.trim()&&
      typeof x.sourceContractId==="string"&&x.sourceContractId.trim());
  }

  function activationContractComplete(item={}){
    if(!item||typeof item!=="object") return false;
    if(item.active!==true) return false;
    if(item.activationApproved!==true) return false;
    if(typeof item.activationEvidenceRef!=="string"||!item.activationEvidenceRef.trim()) return false;
    const multi=Array.isArray(item.sourceMatchers)&&item.sourceMatchers.length>0&&item.sourceMatchers.every(validSourceMatcher);
    const legacy=Array.isArray(item.eventFamilies)&&item.eventFamilies.length&&
      item.matcher&&typeof item.matcher==="object"&&!Array.isArray(item.matcher)&&Object.keys(item.matcher).length&&
      typeof item.sourceContractId==="string"&&item.sourceContractId.trim();
    if(!multi&&!legacy) return false;
    if(typeof item.dedupePolicy!=="string"||!item.dedupePolicy.trim()) return false;
    if(typeof item.reawardPolicy!=="string"||!item.reawardPolicy.trim()) return false;
    return true;
  }

  function validateCatalog(catalog={}){
    const items=Array.isArray(catalog.items)?catalog.items:[];
    for(const item of items){
      if(!item||typeof item!=="object") continue;
      const working=item.status==="WORKING_DRAFT"||catalog.status==="WORKING_DRAFT_NOT_ACTIVE";
      if(working&&item.active===true){
        throw new Error("BADGE_WORKING_DRAFT_ACTIVATION_FORBIDDEN");
      }
      if(item.active===true&&!activationContractComplete(item)){
        throw new Error("BADGE_ACTIVATION_CONTRACT_INCOMPLETE");
      }
    }
    return true;
  }

  function canActivate(item={},catalog={}){
    if(!item||typeof item!=="object") return false;
    if(catalog.status==="WORKING_DRAFT_NOT_ACTIVE") return false;
    if(item.status==="WORKING_DRAFT") return false;
    return activationContractComplete(item);
  }

  window.SnapPopBadgeCatalogGuard=Object.freeze({
    version:VERSION,
    validateCatalog,
    canActivate,
    activationContractComplete,
    validSourceMatcher
  });
})();