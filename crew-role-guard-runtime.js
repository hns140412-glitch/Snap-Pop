(() => {
  "use strict";

  const VERSION="2026.09.21-a";
  const ROLES=new Set(["STARTER","WORLD","SPECIAL"]);

  function clean(value,max=80){
    return typeof value==="string"?value.trim().slice(0,max):"";
  }

  function normalizeRole(value="WORLD"){
    const role=clean(value,24).toUpperCase();
    return ROLES.has(role)?role:"WORLD";
  }

  function assertRoleContract(member={}){
    const role=normalizeRole(member.role||member.memberRole||"WORLD");
    const forbidden=[
      "powerBoost","powerLevel","functionalAdvantage","rewardMultiplier",
      "expMultiplier","privilegedAbility","exclusiveCapability"
    ];
    for(const key of forbidden){
      if(member[key]===true || (typeof member[key]==="number"&&member[key]>1)){
        throw new Error("CREW_ROLE_POWER_ADVANTAGE_FORBIDDEN");
      }
    }
    return Object.freeze({
      role,
      roleMeaning:role==="SPECIAL"?"ENCOUNTER_STYLE_ONLY":"ROSTER_ROLE",
      functionalAbility:"EQUAL",
      powerBoost:false,
      rewardMultiplier:1,
      expMultiplier:1
    });
  }

  window.SnapPopCrewRoleGuard=Object.freeze({
    version:VERSION,
    normalizeRole,
    assertRoleContract
  });
})();