import fs from "node:fs";
const index=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const css=fs.readFileSync(new URL("../styles.css",import.meta.url),"utf8");
function assert(name,condition){if(!condition) throw new Error("FAIL "+name); console.log("PASS",name)}
assert("settings-separate-identity-group",index.includes('id="identitySettingsTitle"')&&index.includes("나와 탐험대원"));
assert("settings-separate-family-group",index.includes('id="familySettingsTitle"')&&index.includes("가족과 함께 쓰기"));
assert("settings-separate-accessibility-group",index.includes('id="accessibilitySettingsTitle"')&&index.includes("읽기와 움직임"));
assert("family-entry-remains-explicit",index.includes('id="familyExpansionBtn">가족 공간 열기'));
assert("family-copy-preserves-child-isolation",index.includes("아이별 기록은 서로 섞이지 않게 따로 보관"));
assert("accessibility-controls-preserved",index.includes('id="autoRead"')&&index.includes('id="reduceMotion"'));
assert("settings-group-hierarchy-styled",css.includes(".settingsGroup{display:grid")&&css.includes(".familySettingsGroup{padding-top:10px"));
console.log("INTEGRATED_SETTINGS_FAMILY_FLOW_PASS");
