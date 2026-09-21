import fs from "node:fs";
const app=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
const index=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const flow=fs.readFileSync(new URL("../writing-flow-controller.js",import.meta.url),"utf8");
function assert(name,condition){if(!condition)throw new Error("FAIL "+name);console.log("PASS",name)}
assert("writing-flow-controller-loads-before-app",index.indexOf('src="writing-flow-controller.js"')<index.indexOf('src="app.js"'));
assert("writing-flow-contract-present",flow.includes("SNAP_POP_WRITING_FLOW_CONTROLLER_V1"));
assert("legacy-start-binding-removed",!app.includes('$("#startBtn").onclick=async()=>'));
assert("legacy-next-binding-removed",!app.includes('$("#nextBtn").onclick=async()=>'));
assert("legacy-answer-input-binding-removed",!app.includes('$("#answer").addEventListener("input",async()=>'));
assert("legacy-language-bindings-removed",!app.includes('$("#modeKo").onclick=async()=>')&&!app.includes('$("#modeEn").onclick=async()=>'));
assert("flow-owns-completion-event",flow.includes('new CustomEvent("snap-pop:task-completed"')&&flow.includes("completionEventId"));
assert("flow-owns-record-gem-exp-transaction",flow.includes('store.setMany([["records",records],["gems",gems],["expLedger",expLedger],["gemLedger",gemLedger]'));
assert("flow-preserves-empty-draft-wait",flow.includes("emptyAdvanceAttempts")&&flow.includes("SnapPopCrewIntervention"));
assert("flow-uses-storage-contract",flow.includes("window.SnapPopStorage")&&!flow.includes("indexedDB"));
assert("app-installs-writing-flow-controller",app.includes("writingFlowController().install()"));
console.log("WRITING_FLOW_CONTROLLER_BOUNDARY_PASS");
