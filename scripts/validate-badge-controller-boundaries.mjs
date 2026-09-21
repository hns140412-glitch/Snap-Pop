import fs from "node:fs";
const app=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
const index=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const ctl=fs.readFileSync(new URL("../badge-controller.js",import.meta.url),"utf8");
function assert(name,condition){if(!condition)throw new Error("FAIL "+name);console.log("PASS",name)}
assert("badge-controller-loads-before-app",index.indexOf('src="badge-controller.js"')<index.indexOf('src="app.js"'));
assert("badge-controller-contract-present",ctl.includes("SNAP_POP_BADGE_CONTROLLER_V1"));
assert("badge-observation-owned-by-controller",ctl.includes("badgeBehaviorObservations")&&ctl.includes("badgeSharedExperienceEvents"));
assert("badge-evidence-keeps-explicit-only-contract",ctl.includes("explicitChildAction:true")&&ctl.includes("inferenceAllowed:false")&&ctl.includes("elapsedTimeEvidenceAllowed:false")&&ctl.includes("scoreEvidenceAllowed:false"));
assert("badge-candidates-remain-review-only",ctl.includes("badgeCandidateReviews")&&!ctl.includes("ACTIVE_CATALOG_INSERT"));
assert("badge-preview-is-not-award-copy",ctl.includes("획득/수여 아님"));
assert("badge-controller-does-not-own-economy",!ctl.includes("gemLedger")&&!ctl.includes("expLedger"));
assert("app-delegates-badge-owner",app.includes("function badgeController()")&&app.includes("return badgeController().recordBadgeEvent"));
console.log("BADGE_CONTROLLER_BOUNDARY_PASS");
