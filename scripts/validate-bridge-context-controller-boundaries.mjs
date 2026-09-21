import fs from "node:fs";
const app=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
const index=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const ctl=fs.readFileSync(new URL("../bridge-context-controller.js",import.meta.url),"utf8");
function assert(name,condition){if(!condition)throw new Error("FAIL "+name);console.log("PASS",name)}
assert("bridge-controller-loads-before-app",index.indexOf('src="bridge-context-controller.js"')<index.indexOf('src="app.js"'));
assert("bridge-controller-contract-present",ctl.includes("SNAP_POP_BRIDGE_CONTEXT_CONTROLLER_V1"));
assert("hide-seek-material-remains-reference-only",ctl.includes("SnapPopBridge?.vocabularyMaterial")&&ctl.includes("SnapPopVocabularyMaterial?.writingContext"));
assert("ready-learning-context-is-read-only-provider",ctl.includes("SnapPopLearningContextProvider?.context?.()"));
assert("incoming-handoff-shows-source-owner",ctl.includes('sourceOwner==="HIDE_SEEK"?"Hide & Seek":"연결 앱"')&&ctl.includes("원하면 참고"));
assert("expression-trace-metadata-only",ctl.includes("questionChars")&&ctl.includes("fragmentCount")&&!ctl.includes("draft:meta")&&!ctl.includes("answer:meta"));
assert("bridge-does-not-overwrite-draft",!ctl.includes('q("#answer").value='));
assert("bridge-stale-draft-guard",ctl.includes('q("#answer").value.trim()!==draft'));
assert("optional-expression-banner-owned-here",ctl.includes("표현하고 싶다면 탐험지를 골라봐")&&ctl.includes("표현해볼 주제"));
assert("legacy-bridge-binding-removed",!app.includes('$("#expressionBridgeBtn").onclick=runExpressionBridge')&&!app.includes('window.addEventListener("snap-pop:bridge-ready",renderIncomingHandoff)'));
assert("app-delegates-bridge-context",app.includes("function bridgeContextController()")&&app.includes("bridgeContextController().recordExpressionTrace"));
assert("bridge-controller-does-not-own-indexeddb",!ctl.includes("indexedDB"));
console.log("BRIDGE_CONTEXT_CONTROLLER_BOUNDARY_PASS");
