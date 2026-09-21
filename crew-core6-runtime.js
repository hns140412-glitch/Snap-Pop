(() => {
  "use strict";

  const VERSION="2026.09.21-a";
  const CORE6=Object.freeze(["dooby","lori","ink","nova","take","zero"]);

  function baseline(rules={}){
    const defined=rules?.definedCharacterLineages||{};
    const missing=CORE6.filter(id=>!defined[id]);
    if(missing.length) throw new Error("CREW_CORE6_MEMBER_MISSING");

    return Object.freeze({
      contract_version:"SNAP_POP_CREW_CORE6_BASELINE_V1",
      status:"WORKING_STARTER_BASELINE",
      memberIds:Object.freeze([...CORE6]),
      memberCount:CORE6.length,
      scope:"STARTER_REFERENCE_ONLY",
      globalAuthority:false,
      rosterLock:false,
      futureExpansionAllowed:true,
      specialRosterIndependent:true,
      worldRosterIndependent:true
    });
  }

  function isCore6(memberId=""){
    return CORE6.includes(String(memberId));
  }

  function assertNotGlobalized(candidate={}){
    if(candidate.globalAuthority===true) throw new Error("CREW_CORE6_GLOBAL_AUTHORITY_FORBIDDEN");
    if(candidate.rosterLock===true) throw new Error("CREW_CORE6_ROSTER_LOCK_FORBIDDEN");
    if(candidate.futureExpansionAllowed===false) throw new Error("CREW_CORE6_EXPANSION_BLOCK_FORBIDDEN");
    return true;
  }

  window.SnapPopCrewCore6=Object.freeze({
    version:VERSION,
    memberIds:CORE6,
    baseline,
    isCore6,
    assertNotGlobalized
  });
})();