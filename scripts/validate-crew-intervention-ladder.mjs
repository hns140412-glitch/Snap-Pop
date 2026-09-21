import fs from "node:fs";
import vm from "node:vm";

const runtimeSource=fs.readFileSync(new URL("../crew-intervention-runtime.js",import.meta.url),"utf8");
const appSource=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
const flowSource=fs.readFileSync(new URL("../writing-flow-controller.js",import.meta.url),"utf8");

const window={};
vm.runInNewContext(runtimeSource,{window,Object,Array,String,Number,Math});
const intervention=window.SnapPopCrewIntervention;

function assert(name,condition){
  if(!condition) throw new Error("FAIL "+name);
  console.log("PASS",name);
}

const first=intervention.state({emptyAdvanceAttempts:1,hintLevel:0,language:"ko"});
const second=intervention.state({emptyAdvanceAttempts:2,hintLevel:0,language:"ko"});
const third=intervention.state({emptyAdvanceAttempts:3,hintLevel:0,language:"ko"});
const afterHint=intervention.state({emptyAdvanceAttempts:5,hintLevel:1,language:"ko"});

assert("first-empty-attempt-waits",first.stage==="WAIT");
assert("second-empty-attempt-offers-one-hint",second.stage==="HINT_OFFER");
assert("third-empty-attempt-minimal-reask",third.stage==="MINIMAL_REASK");
assert("hint-never-auto-revealed",[first,second,third,afterHint].every(x=>x.autoRevealHint===false));
assert("crew-never-auto-writes",[first,second,third,afterHint].every(x=>x.autoWrite===false));
assert("after-hint-returns-to-wait",afterHint.stage==="WAIT_AFTER_HINT");

const emptyBlockStart=flowSource.indexOf("if(!s.draft)");
const emptyBlockEnd=flowSource.indexOf("if(i<2)",emptyBlockStart);
const emptyBlock=flowSource.slice(emptyBlockStart,emptyBlockEnd);
assert("flow-uses-intervention-runtime",
  emptyBlock.includes("SnapPopCrewIntervention")&&
  emptyBlock.includes("interventionStage")
);
assert("flow-does-not-auto-click-hint",
  !emptyBlock.includes('$("#hintBtn").click')&&
  !emptyBlock.includes("revealHint()")
);
assert("flow-does-not-write-draft-in-intervention",
  !emptyBlock.includes('$("#answer").value=')&&
  !emptyBlock.includes("s.draft=")
);

console.log("CREW_INTERVENTION_LADDER_PASS");
