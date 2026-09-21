(() => {
  "use strict";

  const VERSION="2026.09.21-a";
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
    return (catalog?.items||[]).filter(x=>x&&x.active===true&&x.status!=="WORKING_DRAFT");
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
    const index=Math.min(TIER_ORDER.length-1,Math.floor((n-1)/5));
    const stars=Math.min(5,((n-1)%5)+1);
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
    progressFromCount,
    nextProgress
  });
})();