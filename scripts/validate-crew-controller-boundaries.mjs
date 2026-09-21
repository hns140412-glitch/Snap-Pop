import fs from "node:fs";
const app=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
const index=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const crew=fs.readFileSync(new URL("../crew-controller.js",import.meta.url),"utf8");
function assert(name,condition){if(!condition)throw new Error("FAIL "+name);console.log("PASS",name)}
assert("crew-controller-loads-before-app",index.indexOf('src="crew-controller.js"')<index.indexOf('src="app.js"'));
assert("crew-controller-contract-present",crew.includes("SNAP_POP_CREW_CONTROLLER_V1"));
for(const fn of ["normalizeCrewType","normalizeIdentity","crewMemberRule","crewReaction","crewMemberName","crewPerformance","crewSnippet","showCrewReaction","hideCrewReaction","renderSpecialInvite"]){assert("app-delegates-"+fn,app.includes("function "+fn)||app.includes("async function "+fn))}
assert("crew-controller-owns-reaction-overlay",crew.includes('q("#crewReactionOverlay")')&&crew.includes("reactionMotif"));
assert("crew-controller-preserves-special-invite-copy",crew.includes("특별 탐험 초대장"));
assert("crew-controller-does-not-own-indexeddb",!crew.includes("indexedDB"));
assert("crew-role-rule-source-remains-canonical",crew.includes("definedCharacterLineages")&&crew.includes("legacyCharacterLineages"));
console.log("CREW_CONTROLLER_BOUNDARY_PASS");
