import fs from "node:fs";
const closure=fs.readFileSync(new URL("../scripts/validate-branch-closure.mjs",import.meta.url),"utf8");
const index=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const requiredValidators=[
 "validate-integrated-child-writing-flow.mjs",
 "validate-integrated-home-map-flow.mjs",
 "validate-integrated-result-records-growth.mjs",
 "validate-integrated-imagination-special-flow.mjs",
 "validate-integrated-settings-family-flow.mjs"
];
function assert(name,condition){if(!condition) throw new Error("FAIL "+name); console.log("PASS",name)}
assert("all-integrated-surface-validators-gated",requiredValidators.every(x=>closure.includes('"'+x+'"')));
assert("primary-child-surfaces-present",["map","explore","result","records","growth"].every(id=>index.includes('id="'+id+'"')));
assert("optional-world-surfaces-present",index.includes('id="special"')&&index.includes('id="imaginationLayer"'));
assert("settings-and-family-surfaces-present",index.includes('id="settings"')&&index.includes('id="familyExpansion"'));
assert("navigation-does-not-replace-child-authorship",index.includes('id="answer"')&&index.includes('id="resultDraft"'));
console.log("INTEGRATED_UI_CLOSURE_PASS");
