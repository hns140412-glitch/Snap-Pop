import fs from "node:fs";
const app=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
const index=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const controller=fs.readFileSync(new URL("../writing-controller.js",import.meta.url),"utf8");
function assert(name,condition){if(!condition)throw new Error("FAIL "+name);console.log("PASS",name)}
assert("writing-controller-loads-before-app",index.indexOf('src="writing-controller.js"')<index.indexOf('src="app.js"'));
assert("writing-controller-contract-present",controller.includes("SNAP_POP_WRITING_CONTROLLER_V1"));
assert("question-bank-owned-by-controller",controller.includes("const QUESTION_BANK=")&&!app.includes("const QUESTION_BANK="));
assert("writing-steps-owned-by-controller",controller.includes("const STEPS=")&&!app.includes("const STEPS="));
for(const fn of ["promptFor","ensureWritingState","setModeButtons","focusGuide","stepSpecificReaction","writingLensLabel","renderWritingBridge","setExpressionBridgeButton","renderExpressionBridge","renderExplore"]){assert("app-delegates-"+fn,app.includes("function "+fn)&&app.includes("writingController()"))}
assert("render-explore-owned-by-controller",controller.includes("function renderExplore(s)")&&controller.includes('q("#nextBtn").textContent'));
assert("writing-controller-does-not-own-persistence",!controller.includes("indexedDB")&&!controller.includes("SnapPopStorage.set("));
console.log("WRITING_CONTROLLER_BOUNDARY_PASS");
