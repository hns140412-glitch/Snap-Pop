import fs from "node:fs";

const app=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
const crewRuntime=fs.readFileSync(new URL("../crew-runtime-controller.js",import.meta.url),"utf8");
const recordsCtl=fs.readFileSync(new URL("../records-growth-controller.js",import.meta.url),"utf8");

function assert(name,condition){
  if(!condition) throw new Error("FAIL "+name);
  console.log("PASS",name);
}

assert("member-specific-experience-helper-exists",
  crewRuntime.includes("async function recordCrewMemberExperience(memberId,type,meta={})")
);
assert("main-experience-wrapper-kept",
  crewRuntime.includes("return recordCrewMemberExperience(id,type,meta);")
);
assert("guest-memory-only-for-selected-guest",
  app.includes('if(guestMemberId)await recordCrewMemberExperience(guestMemberId,"SHARED_MICRO_EPISODE"')
);
assert("guest-memory-is-dedupable-and-linked",
  app.includes('eventId:`${id}_guest`')&&
  app.includes("sourceEventId:id")&&
  app.includes('scene:"SPECIAL_EXPLORATION"')
);
assert("main-companion-acknowledges-guest",
  app.includes('${crewMemberName(identity)} · ${guest.name}도 이번 장면에 잠깐 합류했네.')
);
assert("child-authorship-line-remains",
  app.includes("같이 보되, 네 생각은 네가 골라.")
);
assert("special-record-resolves-guest-name",
  recordsCtl.includes("x.guestMemberId?(registry[x.guestMemberId]?.currentName")
);
assert("special-record-shows-shared-companion",
  recordsCtl.includes("함께한 탐험대원 ·")
);

console.log("SPECIAL_GUEST_SHARED_MEMORY_AND_RECORD_PASS");
