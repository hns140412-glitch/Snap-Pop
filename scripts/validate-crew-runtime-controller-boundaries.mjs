import fs from "node:fs";
const app=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
const index=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const runtime=fs.readFileSync(new URL("../crew-runtime-controller.js",import.meta.url),"utf8");
function assert(name,condition){if(!condition)throw new Error("FAIL "+name);console.log("PASS",name)}
assert("crew-runtime-loads-before-app",index.indexOf('src="crew-runtime-controller.js"')<index.indexOf('src="app.js"'));
assert("crew-runtime-contract-present",runtime.includes("SNAP_POP_CREW_RUNTIME_CONTROLLER_V1"));
for(const fn of ["ensureCrewRegistry","recordCrewMemberExperience","recordCrewExperience","chooseSceneGuest","synthesizeCrewWorldState"]){assert("app-delegates-"+fn,app.includes("function "+fn)||app.includes("async function "+fn))}
assert("registry-owned-by-crew-runtime",runtime.includes('store.get("crewRegistry")')&&runtime.includes('store.set("crewRegistry",registry)'));
assert("guest-selection-remains-explicitly-authorized",runtime.includes("if(!appearanceAuthorized)return null"));
assert("special-role-remains-no-power",runtime.includes("functionalAdvantage:false")&&runtime.includes("powerBoost:false")&&runtime.includes("rewardMultiplier:1")&&runtime.includes("expMultiplier:1"));
assert("world-state-remains-synthetic",runtime.includes("synthetic:true")&&runtime.includes("MAIN_COMPANION"));
assert("crew-runtime-does-not-own-dom",!runtime.includes("document.querySelector")&&!runtime.includes('q("#'));
console.log("CREW_RUNTIME_CONTROLLER_BOUNDARY_PASS");
