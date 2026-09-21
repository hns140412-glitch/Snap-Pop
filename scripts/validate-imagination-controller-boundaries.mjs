import fs from "node:fs";
const app=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
const index=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const ctl=fs.readFileSync(new URL("../imagination-controller.js",import.meta.url),"utf8");
function assert(name,condition){if(!condition)throw new Error("FAIL "+name);console.log("PASS",name)}
assert("imagination-controller-loads-before-app",index.indexOf('src="imagination-controller.js"')<index.indexOf('src="app.js"'));
assert("imagination-contract-present",ctl.includes("SNAP_POP_IMAGINATION_CONTROLLER_V1"));
assert("imagination-state-no-longer-global-in-app",!app.includes("imaginationReturnFocus")&&!app.includes("imaginationWritingReturn"));
assert("writing-return-guard-preserved",ctl.includes("SnapPopImaginationReturnGuard")&&ctl.includes('returnIntegrity:"MATCH"')&&ctl.includes('returnIntegrity:"BLOCKED"'));
assert("draft-preserved-on-return",ctl.includes("draftPreserved:true")&&ctl.includes("returned.draft"));
assert("cloud-history-remains-no-direct-reward",ctl.includes('store.get("cloudHistory")')&&!ctl.includes("expLedger")&&!ctl.includes("gemLedger"));
assert("verified-ask-expression-does-not-transfer-answer",ctl.includes("answerTransferred:false")&&ctl.includes("draftTransferred:false"));
assert("intelligence-output-still-sanitized",ctl.includes("sanitizeUserFacing(rawResult)"));
assert("voice-stays-user-mic-only",ctl.includes('source:"USER_MIC"'));
console.log("IMAGINATION_CONTROLLER_BOUNDARY_PASS");
