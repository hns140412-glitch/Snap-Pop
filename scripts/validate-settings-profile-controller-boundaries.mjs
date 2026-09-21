import fs from "node:fs";
const app=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
const index=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const ctl=fs.readFileSync(new URL("../settings-profile-controller.js",import.meta.url),"utf8");
function assert(name,condition){if(!condition)throw new Error("FAIL "+name);console.log("PASS",name)}
assert("settings-profile-loads-before-app",index.indexOf('src="settings-profile-controller.js"')<index.indexOf('src="app.js"'));
assert("settings-profile-contract-present",ctl.includes("SNAP_POP_SETTINGS_PROFILE_CONTROLLER_V1"));
assert("shared-identity-owned-by-settings-controller",ctl.includes("let sharedIdentity=null")&&!app.includes("let sharedIdentity=null"));
assert("ready-profile-remains-priority",ctl.includes("Ready & Set 공유 프로필 사용 중")&&ctl.includes("통합 시 Ready & Set 우선"));
assert("local-profile-remains-fallback",ctl.includes("identityFallback")&&ctl.includes("characterSourceAsset"));
assert("crew-name-history-preserved",ctl.includes("nameHistory.push")&&ctl.includes("crewRegistry"));
assert("settings-events-owned-by-controller",ctl.includes('q("#characterSave").onclick')&&ctl.includes('q("#reduceMotion").onchange=savePrefs'));
assert("legacy-settings-bindings-removed",!app.includes('$("#characterSave").onclick=')&&!app.includes('$("#profilePhotoInput").onchange='));
assert("settings-controller-does-not-own-indexeddb",!ctl.includes("indexedDB"));
assert("app-installs-settings-controller",app.includes("settingsProfileController().install()"));
console.log("SETTINGS_PROFILE_CONTROLLER_BOUNDARY_PASS");
