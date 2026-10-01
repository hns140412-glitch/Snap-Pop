(() => {
  "use strict";

  const VERSION="2026.10.01-a";
  let viewModel=null;

  async function load(){
    if(viewModel) return viewModel;
    const res=await fetch("data/badge-catalog-ui-current.json");
    if(!res.ok) throw new Error("BADGE_CATALOG_UI_MODEL_LOAD_FAILED");
    const raw=await res.json();
    if(!raw||raw.total!==60||!Array.isArray(raw.items)||raw.items.length!==60){
      throw new Error("BADGE_CATALOG_UI_MODEL_INVALID");
    }
    const ids=new Set(), slots=new Set();
    for(const item of raw.items){
      if(!item.badge_id||!item.visual_id||!item.asset_slot_id) throw new Error("BADGE_CATALOG_UI_IDENTITY_REQUIRED");
      if(ids.has(item.badge_id)||slots.has(item.asset_slot_id)) throw new Error("BADGE_CATALOG_UI_IDENTITY_DUPLICATE");
      ids.add(item.badge_id); slots.add(item.asset_slot_id);
    }
    viewModel=Object.freeze(raw);
    return viewModel;
  }

  function normalizeFilter(value="ALL"){
    const v=String(value||"ALL").toUpperCase();
    return ["ALL","EARNED","IN_PROGRESS","UNEARNED"].includes(v)?v:"ALL";
  }
  function normalizeCategory(value="ALL"){
    const v=String(value||"ALL").toUpperCase();
    return ["ALL","POCKET","FIELD","EXPEDITION","SECRET"].includes(v)?v:"ALL";
  }
  function ownershipFor(progressEntry){
    if(!progressEntry||!Number(progressEntry.count)) return "UNEARNED";
    return "EARNED";
  }
  function progressForCount(count=0){
    const n=Math.max(0,Math.floor(Number(count)||0));
    if(n===0) return {ownership:"UNEARNED",tier:null,reacquireStars:0,complete:false};
    const reawards=Math.max(0,n-1);
    const tiers=["GREEN","BLUE","RED","GOLD","PLATINUM"];
    const tierIndex=Math.min(tiers.length-1,Math.floor(reawards/5));
    const stars=tierIndex<tiers.length-1
      ? reawards%5
      : Math.min(5,reawards-(tiers.length-1)*5);
    return {ownership:"EARNED",tier:tiers[tierIndex],reacquireStars:stars,complete:tierIndex===4&&stars===5};
  }
  function composeItem(item,progressEntry){
    const p=progressForCount(progressEntry?.count||0);
    return Object.freeze({
      ...item,
      ownership_state:p.ownership,
      tier:p.tier,
      reacquire_stars:p.reacquireStars,
      complete:p.complete,
      last_at:progressEntry?.lastAt||null,
      art_available:item.asset_delivery_state==="SYNCED"
    });
  }
  function select(items,{filter="ALL",category="ALL"}={}){
    const f=normalizeFilter(filter), c=normalizeCategory(category);
    return items.filter(item=>{
      if(c!=="ALL"&&item.category!==c)return false;
      if(f==="ALL")return true;
      if(f==="EARNED")return item.ownership_state==="EARNED";
      if(f==="UNEARNED")return item.ownership_state==="UNEARNED";
      return item.ownership_state==="IN_PROGRESS";
    });
  }

  window.SnapPopBadgeCatalogUI=Object.freeze({
    version:VERSION,
    load,
    composeItem,
    progressForCount,
    select,
    normalizeFilter,
    normalizeCategory
  });
})();