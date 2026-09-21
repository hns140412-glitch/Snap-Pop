import fs from "node:fs";
import vm from "node:vm";

const guardSource=fs.readFileSync(new URL("../crew-role-guard-runtime.js",import.meta.url),"utf8");
const appSource=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
const crewRuntimeSource=fs.readFileSync(new URL("../crew-runtime-controller.js",import.meta.url),"utf8");
const specialSource=fs.readFileSync(new URL("../special-controller.js",import.meta.url),"utf8");

const window={};
vm.runInNewContext(guardSource,{window,Object,Array,String,Number,Math,Error,Set});
const guard=window.SnapPopCrewRoleGuard;

function assert(name,condition){
  if(!condition) throw new Error("FAIL "+name);
  console.log("PASS",name);
}

const special=guard.assertRoleContract({
  role:"SPECIAL",
  functionalAdvantage:false,
  powerBoost:false,
  rewardMultiplier:1,
  expMultiplier:1
});

assert("special-role-means-encounter-style",
  special.role==="SPECIAL"&&special.roleMeaning==="ENCOUNTER_STYLE_ONLY"
);
assert("special-functional-ability-equal",
  special.functionalAbility==="EQUAL"
);
assert("special-no-power-or-reward-multiplier",
  special.powerBoost===false&&special.rewardMultiplier===1&&special.expMultiplier===1
);

let powerBlocked=false;
try{guard.assertRoleContract({role:"SPECIAL",powerBoost:true})}
catch(error){powerBlocked=error?.message==="CREW_ROLE_POWER_ADVANTAGE_FORBIDDEN"}
assert("special-power-boost-blocked",powerBlocked);

let rewardBlocked=false;
try{guard.assertRoleContract({role:"SPECIAL",rewardMultiplier:2})}
catch(error){rewardBlocked=error?.message==="CREW_ROLE_POWER_ADVANTAGE_FORBIDDEN"}
assert("special-reward-multiplier-blocked",rewardBlocked);

assert("guest-selection-runs-role-guard",
  crewRuntimeSource.includes("SnapPopCrewRoleGuard?.assertRoleContract")
);
assert("special-roster-says-encounter-not-power",
  appSource.includes("만나는 방식만 특별해요")&&
  appSource.includes("능력의 우열은 없어요")
);
assert("special-scene-repeats-child-authorship-not-power",
  specialSource.includes("스페셜은 더 강한 대원이 아니라 만나는 방식만 달라.")
);

console.log("CREW_SPECIAL_ROLE_NOT_POWER_PASS");
