import fs from "node:fs";
import vm from "node:vm";

const runtimeSource=fs.readFileSync(new URL("../crew-orchestration-runtime.js",import.meta.url),"utf8");
const appSource=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
const specialSource=fs.readFileSync(new URL("../special-controller.js",import.meta.url),"utf8");
const indexSource=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");

const window={};
vm.runInNewContext(runtimeSource,{window,Object,Array,String,Number,Math,Set,Date});
const o=window.SnapPopCrewOrchestration;

function assert(name,condition){
  if(!condition) throw new Error("FAIL "+name);
  console.log("PASS",name);
}

const members={
  dooby:{defaultName:"두비"},
  lori:{defaultName:"로리"},
  ink:{defaultName:"잉크"},
  nova:{defaultName:"노바",avoidMoodStates:["CALM"]}
};
const registry={
  dooby:{encounterStatus:"STARTER_AVAILABLE",worldState:{state:"MAIN_COMPANION"}},
  lori:{encounterStatus:"STARTER_AVAILABLE",worldState:{state:"AT_HUB"}},
  ink:{encounterStatus:"STARTER_AVAILABLE",worldState:{state:"AT_HUB"}},
  nova:{encounterStatus:"STARTER_AVAILABLE",worldState:{state:"AT_HUB"}}
};

const recent=[
  {memberId:"lori",sceneKey:"A"},
  {memberId:"lori",sceneKey:"B"},
  {memberId:"ink",sceneKey:"C"}
];

const chosen=o.chooseGuest({
  mainId:"dooby",
  registry,
  members,
  recentAppearances:recent,
  sceneKey:"SPECIAL_EXPLORATION"
});

assert("main-never-selected-as-guest",chosen?.memberId!=="dooby");
assert("least-recently-seen-is-preferred",chosen?.memberId==="nova");
assert("guest-has-no-functional-advantage",chosen?.functionalAdvantage===false);
assert("main-continuity-preserved",chosen?.mainContinuityPreserved===true);

const calm=o.chooseGuest({
  mainId:"dooby",
  registry,
  members,
  recentAppearances:[],
  sceneMood:"CALM",
  sceneKey:"CALM_SPECIAL"
});
assert("mood-conflict-avoided-when-alternative-exists",calm?.memberId!=="nova");

const ledger=o.recordAppearance(recent,"ink","SPECIAL_EXPLORATION");
assert("guest-appearance-ledger-recorded",
  ledger[0].memberId==="ink"&&ledger[0].sceneKey==="SPECIAL_EXPLORATION"
);

assert("app-connects-guest-only-to-special-scene",
  specialSource.includes('deps.chooseSceneGuest("SPECIAL_EXPLORATION",{appearanceAuthorized:')&&
  specialSource.includes('guestTrigger?.scene==="SPECIAL_EXPLORATION"')&&
  specialSource.includes('guestTrigger?.authorized===true')&&
  specialSource.includes('q("#specialCrewPresence")')
);

assert("special-memory-preserves-guest-id",
  specialSource.includes("guestMemberId")&&
  specialSource.includes("memories.unshift({id,at,prompt:p.q,text,guestMemberId})")
);

assert("special-presence-is-lightweight",
  indexSource.includes('id="specialCrewPresence" hidden')&&
  indexSource.includes('class="kicker"')
);

console.log("CREW_GUEST_ORCHESTRATION_PASS");
