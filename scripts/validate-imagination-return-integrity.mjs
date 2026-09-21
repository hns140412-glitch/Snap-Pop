import fs from "node:fs";
import vm from "node:vm";

const source=fs.readFileSync(new URL("../imagination-return-runtime.js",import.meta.url),"utf8");
const app=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
const imagination=fs.readFileSync(new URL("../imagination-controller.js",import.meta.url),"utf8");

const window={};
vm.runInNewContext(source,{window,Object,Array,String,Number,Math,Date});
const g=window.SnapPopImaginationReturnGuard;

function assert(name,condition){
  if(!condition) throw new Error("FAIL "+name);
  console.log("PASS",name);
}

const snapshot=g.capture({id:"a1",landmark:"idea",step:1,language:"ko",draft:"처음 초안"});
assert("snapshot-captures-context",
  snapshot.activeId==="a1"&&snapshot.landmark==="idea"&&snapshot.step===1&&snapshot.language==="ko"&&snapshot.draft==="처음 초안"
);

assert("same-context-validates",
  g.validate({id:"a1",landmark:"idea",step:1,language:"ko",draft:"최신 초안"},snapshot).ok===true
);
assert("session-change-blocked",
  g.validate({id:"a2",landmark:"idea",step:1,language:"ko",draft:"x"},snapshot).reason==="ACTIVE_SESSION_CHANGED"
);
assert("landmark-change-blocked",
  g.validate({id:"a1",landmark:"emotion",step:1,language:"ko",draft:"x"},snapshot).reason==="LANDMARK_CHANGED"
);
assert("step-change-blocked",
  g.validate({id:"a1",landmark:"idea",step:2,language:"ko",draft:"x"},snapshot).reason==="STEP_CHANGED"
);
assert("language-change-blocked",
  g.validate({id:"a1",landmark:"idea",step:1,language:"en",draft:"x"},snapshot).reason==="LANGUAGE_CHANGED"
);

const latest=g.returnDraft({id:"a1",landmark:"idea",step:1,language:"ko",draft:"최신 초안"},snapshot);
assert("newer-current-draft-wins",
  latest.ok===true&&latest.draft==="최신 초안"&&latest.snapshotDraftPreserved===false
);

const fallback=g.returnDraft({id:"a1",landmark:"idea",step:1,language:"ko"},snapshot);
assert("snapshot-used-only-as-fallback",
  fallback.ok===true&&fallback.draft==="처음 초안"&&fallback.snapshotDraftPreserved===true
);

assert("app-uses-guard-for-writing-return",
  imagination.includes("SnapPopImaginationReturnGuard")&&
  imagination.includes("guard.returnDraft(current||{},writingReturn)")
);

console.log("IMAGINATION_RETURN_INTEGRITY_PASS");
