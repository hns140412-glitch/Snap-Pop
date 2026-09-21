import fs from "node:fs";
const app=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
const index=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const ctl=fs.readFileSync(new URL("../special-controller.js",import.meta.url),"utf8");
function assert(name,condition){if(!condition)throw new Error("FAIL "+name);console.log("PASS",name)}
assert("special-controller-loads-before-app",index.indexOf('src="special-controller.js"')<index.indexOf('src="app.js"'));
assert("special-contract-present",ctl.includes("SNAP_POP_SPECIAL_CONTROLLER_V1"));
assert("legacy-special-bindings-removed",!app.includes('$("#specialSave").onclick=async()=>')&&!app.includes('$("#specialInvite").onclick=openSpecial'));
assert("special-guest-remains-explicit-authorized",ctl.includes('appearanceAuthorized:guestTrigger?.scene==="SPECIAL_EXPLORATION"&&guestTrigger?.authorized===true'));
assert("special-trigger-consumed-one-shot",ctl.includes('store.set("activeCrewGuestTrigger",null)'));
assert("special-memory-is-no-reward-flow",!ctl.includes("expLedger")&&!ctl.includes("gemLedger"));
assert("special-evidence-explicit",ctl.includes('sourceContractId:"SNAP_POP_DECLARED_SPECIAL_ACTION_V1"')&&ctl.includes('behaviorCode:"SPECIAL_EXPLORATION_COMPLETED"'));
assert("guest-shared-memory-linked",ctl.includes('eventId:`${id}_guest`')&&ctl.includes("sourceEventId:id"));
console.log("SPECIAL_CONTROLLER_BOUNDARY_PASS");
