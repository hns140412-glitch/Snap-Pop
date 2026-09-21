import fs from "node:fs";

const matrix=JSON.parse(fs.readFileSync(new URL("../data/snap-pop-requirement-matrix.json",import.meta.url),"utf8"));
const rows=Array.isArray(matrix)?matrix:(matrix.requirements||matrix.items||[]);
const byId=Object.fromEntries(rows.map(x=>[x.id,x]));

function assert(name,condition){
  if(!condition) throw new Error("FAIL "+name);
  console.log("PASS",name);
}

const reconciled=[
  "SP-UNIV-003","SP-UNIV-004","SP-UNIV-005",
  "SP-IMAGINE-002","SP-IMAGINE-003","SP-IMAGINE-004","SP-IMAGINE-007","SP-IMAGINE-008",
  "SP-TRUTH-001","SP-TRUTH-002","SP-TRUTH-003"
];

assert("all-reconciled-items-exist",reconciled.every(id=>!!byId[id]));
assert("all-reconciled-items-coded",reconciled.every(id=>byId[id].coded===true));
assert("all-reconciled-items-static-verified",reconciled.every(id=>byId[id].staticVerified===true));
assert("runtime-not-overclaimed",reconciled.every(id=>byId[id].runtimeVerified===false));
assert("device-not-overclaimed",reconciled.every(id=>byId[id].deviceVerified===false));

assert("truth-source-quality-gap-remains-open",
  /source-quality|folk-etymology/i.test(byId["SP-TRUTH-002"].gap||"")
);
assert("openai-live-runtime-remains-open",
  /live|OPENAI_RUNTIME_CONNECTED/i.test(byId["SP-IMAGINE-004"].gap||"")
);
assert("broad-domain-code-evidence-present",
  (byId["SP-UNIV-004"].codeEvidence||[]).some(x=>/snap-pop-knowledge/.test(x))
);
assert("mental-model-evidence-present",
  (byId["SP-IMAGINE-008"].codeEvidence||[]).some(x=>/mental-model-runtime/.test(x))
);

console.log("REQUIREMENT_MATRIX_RECONCILIATION_PASS");
