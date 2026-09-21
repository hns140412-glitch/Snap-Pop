import fs from "node:fs";
const index=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const css=fs.readFileSync(new URL("../styles.css",import.meta.url),"utf8");
function assert(name,condition){if(!condition) throw new Error("FAIL "+name); console.log("PASS",name)}
assert("special-is-explicitly-optional",index.includes("원할 때만 여는 초대")&&index.includes("아무 손해가 없어"));
assert("special-has-child-owned-input",index.includes('for="specialAnswer">내가 떠올린 것')&&index.includes('id="specialAnswer"'));
assert("special-actions-include-skip",index.includes('class="specialActions"')&&index.includes('id="specialLater">오늘은 지나가기'));
assert("imagination-is-framed-as-optional-support",index.includes("필요할 때만 여는 보조 세계")&&index.includes("막힌 생각이나 궁금한 것 하나만"));
assert("imagination-has-single-question-input",index.includes('for="imaginationInput">지금 궁금한 것')&&index.includes("궁금한 것 또는 막힌 생각 한 가지"));
assert("imagination-primary-action-is-thinking",index.includes('id="imaginationAskBtn" type="button">같이 생각해보기'));
assert("listen-last-is-secondary-collapsed",index.includes('class="imaginationListenMore"')&&index.includes('id="imaginationSpeakLast"'));
assert("special-hierarchy-styled",css.includes(".specialPromptCard{display:grid")&&css.includes(".specialActions{display:grid"));
console.log("INTEGRATED_IMAGINATION_SPECIAL_FLOW_PASS");
