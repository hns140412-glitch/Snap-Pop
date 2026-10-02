(() => {
  "use strict";

  const VERSION="2026.10.02-a";

  function activationContractComplete(item={}){
    if(!item||typeof item!=="object") return false;
    if(item.active!==true) return false;
    if(item.activationApproved!==true) return false;
    if(typeof item.activationEvidenceRef!=="string"||!item.activationEvidenceRef.trim()) return false;
    if(!Array.isArray(item.eventFamilies)||!item.eventFamilies.length) return false;
    if(!item.matcher||typeof item.matcher!=="object"||Array.isArray(item.matcher)||!Object.keys(item.matcher).length) return false;
    if(typeof item.sourceContractId!=="string"||!item.sourceContractId.trim()) return false;
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
    activationContractComplete
  });
})();