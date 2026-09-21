(() => {
  "use strict";

  const VERSION="2026.09.21-a";

  function validateCatalog(catalog={}){
    const items=Array.isArray(catalog.items)?catalog.items:[];
    for(const item of items){
      if(!item||typeof item!=="object") continue;
      const working=item.status==="WORKING_DRAFT"||catalog.status==="WORKING_DRAFT_NOT_ACTIVE";
      if(working&&item.active===true){
        throw new Error("BADGE_WORKING_DRAFT_ACTIVATION_FORBIDDEN");
      }
    }
    return true;
  }

  function canActivate(item={},catalog={}){
    if(!item||typeof item!=="object") return false;
    if(catalog.status==="WORKING_DRAFT_NOT_ACTIVE") return false;
    if(item.status==="WORKING_DRAFT") return false;
    return item.active===true;
  }

  window.SnapPopBadgeCatalogGuard=Object.freeze({
    version:VERSION,
    validateCatalog,
    canActivate
  });
})();