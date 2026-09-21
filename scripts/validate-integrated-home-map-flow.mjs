import fs from "node:fs";
const index=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const css=fs.readFileSync(new URL("../styles.css",import.meta.url),"utf8");
function assert(name,condition){if(!condition) throw new Error("FAIL "+name); console.log("PASS",name)}
assert("home-map-has-single-guidance-prompt",index.includes('class="mapPrompt"')&&index.includes("어디부터 둘러볼까?"));
assert("home-map-guidance-does-not-block-input",css.includes(".mapPrompt{")&&css.includes("pointer-events:none"));
assert("home-radio-remains-secondary-action",index.includes('id="homeRadio"')&&index.includes('aria-label="상상 구름 무전 열기"'));
assert("selection-remains-explicit-before-start",index.includes('id="selection" hidden')&&index.includes('id="startBtn">이곳에서 시작'));
assert("landmark-layer-remains-primary-map-target",index.includes('id="landmarks" class="landmarks"'));
console.log("INTEGRATED_HOME_MAP_FLOW_PASS");
