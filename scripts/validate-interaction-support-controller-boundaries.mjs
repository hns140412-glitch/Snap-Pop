import fs from "node:fs";
const app=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
const index=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const ctl=fs.readFileSync(new URL("../interaction-support-controller.js",import.meta.url),"utf8");
function assert(name,condition){if(!condition)throw new Error("FAIL "+name);console.log("PASS",name)}
assert("interaction-support-loads-before-app",index.indexOf('src="interaction-support-controller.js"')<index.indexOf('src="app.js"'));
assert("interaction-support-contract-present",ctl.includes("SNAP_POP_INTERACTION_SUPPORT_CONTROLLER_V1"));
assert("selected-state-owned-by-support",ctl.includes("let selected=null")&&!app.includes("selected=null"));
assert("analysis-sequence-owned-by-support",ctl.includes("analysisSeq=0")&&!app.includes("writingAnalysisSeq=0"));
assert("analysis-result-checks-current-dom-draft",ctl.includes("if(q(\'#answer\').value!==draft)return null;"));
assert("superseded-semantic-analysis-is-aborted",
  ctl.includes('analysisAbortController?.abort("superseded")')&&
  ctl.includes("signal:controller.signal")&&
  ctl.includes('analysisAbortController?.abort("invalidated")')
);
assert("calendar-cursor-owned-by-support",ctl.includes("calendarCursor=new Date()")&&!app.includes("calendarCursor=new Date()"));
assert("hint-and-voice-owned-by-support",ctl.includes('q("#hintBtn").onclick=revealHint')&&ctl.includes('q("#voiceBtn").onclick=async()=>'));
assert("reflection-remains-explicit-child-evidence",ctl.includes("CHILD_EXPLICIT_REFLECTION")&&ctl.includes("SNAP_POP_CHILD_REFLECTION_ARTIFACT_V1"));
assert("voice-remains-user-mic-one-shot-entry",ctl.includes('source:"USER_MIC"')&&ctl.includes("SnapPopVoice.listen"));
assert("calendar-reduce-motion-scroll-preserved",ctl.includes('classList.contains("reduceMotion")?"auto":"smooth"'));
assert("support-does-not-own-indexeddb",!ctl.includes("indexedDB"));
assert("app-installs-support-controller",app.includes("interactionSupportController().install()"));
console.log("INTERACTION_SUPPORT_CONTROLLER_BOUNDARY_PASS");
