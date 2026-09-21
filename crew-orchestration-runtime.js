(() => {
  "use strict";

  const VERSION="2026.09.21-a";
  const ELIGIBLE_STATUS=new Set([
    "STARTER_AVAILABLE",
    "KNOWN_FRIEND",
    "SELECTABLE_COMPANION",
    "RELATIONSHIP_MEMORY",
    "REUNION"
  ]);

  function normalizeRecent(ledger=[]){
    return Array.isArray(ledger)
      ? ledger.filter(x=>x&&typeof x.memberId==="string"&&x.memberId)
      : [];
  }

  function recentCount(memberId,ledger=[],windowSize=8){
    return normalizeRecent(ledger)
      .slice(0,Math.max(1,windowSize))
      .filter(x=>x.memberId===memberId)
      .length;
  }

  function moodConflict(member={},sceneMood=null){
    if(!sceneMood) return false;
    const avoid=Array.isArray(member.avoidMoodStates)?member.avoidMoodStates:[];
    return avoid.includes(sceneMood);
  }

  function eligibleGuest(memberId,{mainId,registry={},members={}}={}){
    if(!memberId||memberId===mainId) return false;
    const entry=registry[memberId]||{};
    if(entry.worldState?.state==="MAIN_COMPANION") return false;
    const status=entry.encounterStatus||"STARTER_AVAILABLE";
    if(!ELIGIBLE_STATUS.has(status)) return false;
    return !!members[memberId];
  }

  function chooseGuest({
    mainId,
    registry={},
    members={},
    recentAppearances=[],
    sceneMood=null,
    sceneKey=""
  }={}){
    const candidates=Object.keys(members)
      .filter(id=>eligibleGuest(id,{mainId,registry,members}))
      .map(id=>{
        const recent=recentCount(id,recentAppearances);
        const conflict=moodConflict(members[id],sceneMood);
        return {
          memberId:id,
          recent,
          conflict,
          score:(conflict?100:0)+(recent*10),
          tie:stableHash(id+"|"+sceneKey)
        };
      })
      .sort((a,b)=>a.score-b.score||a.tie-b.tie);

    if(!candidates.length) return null;
    const chosen=candidates[0];
    return Object.freeze({
      memberId:chosen.memberId,
      reason:chosen.conflict?"FALLBACK_MIN_CONFLICT":"LOW_RECENT_APPEARANCE",
      functionalAdvantage:false,
      mainContinuityPreserved:true
    });
  }

  function recordAppearance(ledger=[],memberId,sceneKey=""){
    if(!memberId) return normalizeRecent(ledger);
    return [
      {memberId,sceneKey,at:new Date().toISOString()},
      ...normalizeRecent(ledger)
    ].slice(0,40);
  }

  function stableHash(s=""){
    let h=2166136261;
    for(let i=0;i<s.length;i++){
      h^=s.charCodeAt(i);
      h=Math.imul(h,16777619);
    }
    return h>>>0;
  }

  window.SnapPopCrewOrchestration=Object.freeze({
    version:VERSION,
    chooseGuest,
    recordAppearance,
    recentCount,
    eligibleGuest
  });
})();