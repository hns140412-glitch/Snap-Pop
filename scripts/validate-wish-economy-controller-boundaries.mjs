import fs from "node:fs";
const app=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
const index=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const ctl=fs.readFileSync(new URL("../wish-economy-controller.js",import.meta.url),"utf8");
const recordsFlow=fs.readFileSync(new URL("../records-flow-controller.js",import.meta.url),"utf8");
const recordsGrowth=fs.readFileSync(new URL("../records-growth-controller.js",import.meta.url),"utf8");
function assert(name,condition){if(!condition)throw new Error("FAIL "+name);console.log("PASS",name)}
assert("wish-economy-loads-before-app",index.indexOf('src="wish-economy-controller.js"')<index.indexOf('src="app.js"'));
assert("wish-economy-contract-present",ctl.includes("SNAP_POP_WISH_ECONOMY_CONTROLLER_V1"));
assert("wish-economy-owns-gem-render",ctl.includes("async function renderGems()"));
assert("wish-economy-owns-wish-history",ctl.includes("async function renderWishHistory()"));
assert("wish-economy-owns-blessing-transaction",ctl.includes("async function confirmBlessing()")&&ctl.includes('reason:"WISH_BLESSING"'));
assert("wish-spends-exactly-two-complete-gems",ctl.includes("let needCompleted=2")&&ctl.includes("completedGemCount:2"));
assert("wish-economy-ledgers-spend",ctl.includes('type:"GEM_SPENT"')&&ctl.includes("wishTransactions"));
assert("app-delegates-wish-economy",app.includes("SnapPopWishEconomyController.instance")&&app.includes("wishEconomyController().install()"));
assert("records-flow-no-wish-ownership",!recordsFlow.includes("confirmBlessing")&&!recordsFlow.includes("wishTransactions"));
assert("records-growth-no-wish-ownership",!recordsGrowth.includes("renderWishHistory")&&!recordsGrowth.includes("wishTransactions"));
assert("wish-economy-does-not-own-indexeddb",!ctl.includes("indexedDB"));
console.log("WISH_ECONOMY_CONTROLLER_BOUNDARY_PASS");
