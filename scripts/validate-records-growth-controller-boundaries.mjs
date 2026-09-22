import fs from "node:fs";
const app=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
const index=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const ctl=fs.readFileSync(new URL("../records-growth-controller.js",import.meta.url),"utf8");
function assert(name,condition){if(!condition)throw new Error("FAIL "+name);console.log("PASS",name)}
assert("records-controller-loads-before-app",index.indexOf('src="records-growth-controller.js"')<index.indexOf('src="app.js"'));
assert("records-controller-contract-present",ctl.includes("SNAP_POP_RECORDS_GROWTH_CONTROLLER_V1"));
for(const fn of ["renderRecords","renderGrowth","renderGrowthTimeline","renderLastResult","updateStatus","openRecordEdit"]){assert("app-delegates-"+fn,app.includes("function "+fn)||app.includes("async function "+fn))}
assert("records-preserve-original-and-revisions",ctl.includes("수정본")&&ctl.includes("원문 보존")&&ctl.includes("recordRevisions"));
assert("record-edit-does-not-alter-reward-copy",ctl.includes("EXP/보상은 수정되지 않음"));
assert("growth-keeps-cloud-no-farming-copy",ctl.includes("EXP·보석 파밍에는 사용하지 않아요"));
assert("special-memory-remains-no-reward",ctl.includes("선택 기록 · 보상/실패 없음"));
assert("records-controller-does-not-own-indexeddb",!ctl.includes("indexedDB"));
assert("records-controller-has-no-legacy-html-helper-reference",!ctl.includes(".map(html)"));
assert("records-growth-does-not-own-wish-economy",!ctl.includes("renderWishHistory")&&!ctl.includes("wishTransactions")&&!ctl.includes("WISH_BLESSING"));
console.log("RECORDS_GROWTH_CONTROLLER_BOUNDARY_PASS");
