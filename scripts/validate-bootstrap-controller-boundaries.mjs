import fs from "node:fs";
const app=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
const index=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const ctl=fs.readFileSync(new URL("../bootstrap-controller.js",import.meta.url),"utf8");
function assert(name,condition){if(!condition)throw new Error("FAIL "+name);console.log("PASS",name)}
assert("bootstrap-loads-before-app",index.indexOf('src="bootstrap-controller.js"')<index.indexOf('src="app.js"'));
assert("bootstrap-contract-present",ctl.includes("SNAP_POP_BOOTSTRAP_CONTROLLER_V1"));
assert("bootstrap-owns-legacy-migration",ctl.includes("migration_20260920_state_v1")&&ctl.includes("LEGACY_EXP_BASELINE"));
assert("bootstrap-preserves-init-order",ctl.indexOf('runtimePhase("OPEN_DB")')<ctl.indexOf('runtimePhase("LOAD_CREW_RULES")')&&ctl.indexOf('runtimePhase("LOAD_CREW_RULES")')<ctl.indexOf('runtimePhase("LOAD_LANDMARKS")')&&ctl.indexOf('runtimePhase("LOAD_LANDMARKS")')<ctl.indexOf('runtimePhase("MIGRATE_IDENTITY")')&&ctl.indexOf('runtimePhase("ACTIVE")')<ctl.indexOf('runtimePhase("DONE")'));
assert("bootstrap-uses-owner-apis",ctl.includes("deps.ensureCrewRegistry()")&&ctl.includes("deps.renderRecords()")&&ctl.includes("deps.renderIncomingHandoff()"));
assert("bootstrap-does-not-own-feature-dom",!ctl.includes("document.querySelector")&&!ctl.includes('q("#'));
assert("app-delegates-bootstrap",app.includes("function bootstrapController()")&&app.includes("bootstrapController().init()"));
assert("legacy-init-body-removed-from-app",!app.includes('runtimePhase("OPEN_DB");await openDB()')&&!app.includes("migration_20260920_state_v1"));
console.log("BOOTSTRAP_CONTROLLER_BOUNDARY_PASS");
