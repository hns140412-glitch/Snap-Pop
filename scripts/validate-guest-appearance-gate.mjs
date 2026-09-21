import fs from "node:fs";

const app=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
const crewRuntime=fs.readFileSync(new URL("../crew-runtime-controller.js",import.meta.url),"utf8");

function assert(name,condition){
  if(!condition) throw new Error("FAIL "+name);
  console.log("PASS",name);
}

assert("guest-selection-default-deny",
  crewRuntime.includes("if(!appearanceAuthorized)return null;")
);
assert("special-scene-reads-explicit-trigger",
  app.includes('const guestTrigger=await get("activeCrewGuestTrigger")')
);
assert("special-scene-requires-authorized-true",
  app.includes('guestTrigger?.scene==="SPECIAL_EXPLORATION"&&guestTrigger?.authorized===true')
);
assert("trigger-is-one-shot-consumed",
  app.includes('await set("activeCrewGuestTrigger",null)')
);
assert("no-automatic-100-percent-guest-call",
  !app.includes('chooseSceneGuest("SPECIAL_EXPLORATION");')
);
assert("weighted-selection-engine-retained",
  crewRuntime.includes("window.SnapPopCrewOrchestration.chooseGuest")
);
assert("shared-memory-only-if-guest-exists",
  app.includes('if(guestMemberId)await recordCrewMemberExperience')
);

console.log("GUEST_APPEARANCE_GATE_PASS");
