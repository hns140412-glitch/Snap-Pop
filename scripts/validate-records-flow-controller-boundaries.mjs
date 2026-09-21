import fs from "node:fs";
const app=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
const index=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const flow=fs.readFileSync(new URL("../records-flow-controller.js",import.meta.url),"utf8");
function assert(name,condition){if(!condition)throw new Error("FAIL "+name);console.log("PASS",name)}
assert("records-flow-loads-before-app",index.indexOf('src="records-flow-controller.js"')<index.indexOf('src="app.js"'));
assert("records-flow-contract-present",flow.includes("SNAP_POP_RECORDS_FLOW_CONTROLLER_V1"));
assert("legacy-record-edit-binding-removed",!app.includes('$("#recordEditSave").onclick=async()=>'));
assert("legacy-bonus-bindings-removed",!app.includes('$("#bonusStart").onclick=async()=>')&&!app.includes('$("#bonusSave").onclick=async()=>'));
assert("legacy-wish-transaction-removed",!app.includes('$("#confirmBlessing").onclick=async()=>'));
assert("revision-preserves-original",flow.includes("originalPreserved:true")&&flow.includes("rewardChanged:false"));
assert("revision-reward-not-recomputed",!flow.includes("calcExp(")&&!flow.includes("EXP_EARNED"));
assert("bonus-is-idempotent",flow.includes("bonusEvents[bonusEventId]")&&flow.includes("이미 완료한 추가 연습이에요."));
assert("bonus-has-no-extra-exp",flow.includes("EXP 추가 없음")&&!flow.includes("expLedger"));
assert("wish-spend-ledgered",flow.includes('type:"GEM_SPENT"')&&flow.includes('reason:"WISH_BLESSING"'));
assert("records-flow-does-not-own-indexeddb",!flow.includes("indexedDB"));
console.log("RECORDS_FLOW_CONTROLLER_BOUNDARY_PASS");
