import fs from "node:fs";
import vm from "node:vm";

const runtime=fs.readFileSync(new URL("../crew-core6-runtime.js",import.meta.url),"utf8");
const rules=JSON.parse(fs.readFileSync(new URL("../data/exploration-crew-rules.json",import.meta.url),"utf8"));
const app=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");

const window={};
vm.runInNewContext(runtime,{window,Object,Array,String,Number,Math,Error});
const core=window.SnapPopCrewCore6;

function assert(name,condition){
  if(!condition) throw new Error("FAIL "+name);
  console.log("PASS",name);
}

const baseline=core.baseline(rules);

assert("exact-core6-count",
  baseline.memberCount===6&&baseline.memberIds.length===6
);
assert("core6-members-match-current-working-set",
  baseline.memberIds.join(",")==="dooby,lori,ink,nova,take,zero"
);
assert("starter-reference-only",
  baseline.scope==="STARTER_REFERENCE_ONLY"&&baseline.globalAuthority===false
);
assert("future-expansion-remains-open",
  baseline.futureExpansionAllowed===true&&
  baseline.rosterLock===false&&
  baseline.specialRosterIndependent===true&&
  baseline.worldRosterIndependent===true
);

let globalBlocked=false;
try{core.assertNotGlobalized({globalAuthority:true,rosterLock:false,futureExpansionAllowed:true})}
catch(error){globalBlocked=error?.message==="CREW_CORE6_GLOBAL_AUTHORITY_FORBIDDEN"}
assert("global-authority-blocked",globalBlocked);

let lockBlocked=false;
try{core.assertNotGlobalized({globalAuthority:false,rosterLock:true,futureExpansionAllowed:true})}
catch(error){lockBlocked=error?.message==="CREW_CORE6_ROSTER_LOCK_FORBIDDEN"}
assert("roster-lock-blocked",lockBlocked);

assert("app-renders-baseline-boundary-copy",
  app.includes("시작 기준점 6명")&&
  app.includes("전체 탐험대 고정 아님")&&
  app.includes("미래 확장 허용")
);
assert("starter-selection-uses-core6-guard",
  app.includes("SnapPopCrewCore6?.isCore6?.(id)")
);

console.log("CREW_CORE6_STARTER_BASELINE_PASS");
