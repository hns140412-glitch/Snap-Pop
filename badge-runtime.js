(() => {
  "use strict";

  const VERSION="2026.10.02-b";
  const TIER_ORDER=["GREEN","BLUE","RED","GOLD","PLATINUM"];

  let config=null, catalog=null;

  async function load(){
    if(config&&catalog)return {config,catalog};
    const [cfgRes,catRes]=await Promise.all([
      fetch("data/badge-system.json"),
      fetch("data/badge-catalog-working.json")
    ]);
    if(!cfgRes.ok||!catRes.ok)throw new Error("BADGE_CONFIG_LOAD_FAILED");
    config=await cfgRes.json();
    catalog=await catRes.json();
    const guard=window.SnapPopBadgeCatalogGuard;
    if(guard&&typeof guard.validateCatalog==="function") guard.validateCatalog(catalog);
    return {config,catalog};
  }

  function normalizeEvent(event={}){
    return {
      eventId:String(event.eventId||"").slice(0,160),
      family:String(event.family||"").slice(0,80),
      source:String(event.source||"").slice(0,80),
      at:event.at||new Date().toISOString(),
      payload:event.payload&&typeof event.payload==="object"?event.payload:{}
    };
  }

  function activeItems(){
    const guard=window.SnapPopBadgeCatalogGuard;
    return (catalog?.items||[]).filter(x=>{
      if(guard&&typeof guard.canActivate==="function") return guard.canActivate(x,catalog||{});
      return x&&x.active===true&&x.status!=="WORKING_DRAFT"&&catalog?.status!=="WORKING_DRAFT_NOT_ACTIVE";
    });
  }

  function sourceMatchesItem(item={},observation={}){
    if(!item||typeof item!=="object"||!observation||typeof observation!=="object")return false;
    if(observation.contract_version!=="TAKY_BADGE_SOURCE_OBSERVATION_V1")return false;
    if(!Array.isArray(item.eventFamilies)||!item.eventFamilies.includes(observation.event_family))return false;
    if(!item.matcher||typeof item.matcher!=="object"||Array.isArray(item.matcher))return false;
    if(String(item.matcher.behaviorCode||"")!==String(observation.behavior_code||""))return false;
    if(String(item.sourceContractId||"")!==String(observation.source_contract_id||""))return false;
    return observation.explicit_child_action===true;
  }

  function matchSourceObservation(observation={}){
    return activeItems().filter(item=>sourceMatchesItem(item,observation));
  }

  function matchEvent(event){
    const e=normalizeEvent(event);
    if(!e.eventId||!e.family)return [];
    return activeItems().filter(item=>{
      if(Array.isArray(item.eventFamilies)&&!item.eventFamilies.includes(e.family))return false;
      if(typeof item.matcher!=="object"||!item.matcher)return false;
      return Object.entries(item.matcher).every(([k,v])=>e.payload?.[k]===v);
    });
  }

  function progressFromCount(count=0){
    const n=Math.max(0,Math.floor(Number(count)||0));
    if(n===0)return {tier:null,stars:0,complete:false};
    const reawards=Math.max(0,n-1);
    const index=Math.min(TIER_ORDER.length-1,Math.floor(reawards/5));
    const stars=index<TIER_ORDER.length-1
      ? reawards%5
      : Math.min(5,reawards-(TIER_ORDER.length-1)*5);
    return {tier:TIER_ORDER[index],stars,complete:index===TIER_ORDER.length-1&&stars===5};
  }

  function nextProgress(currentCount=0){
    return progressFromCount(Math.max(0,Number(currentCount)||0)+1);
  }

  window.SnapPopBadges=Object.freeze({
    version:VERSION,
    load,
    normalizeEvent,
    activeItems,
    matchEvent,
    sourceMatchesItem,
    matchSourceObservation,
    progressFromCount,
    nextProgress
  });
})();