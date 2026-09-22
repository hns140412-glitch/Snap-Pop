import fs from "node:fs";

const matrix=JSON.parse(fs.readFileSync(new URL("../data/snap-pop-requirement-matrix.json",import.meta.url),"utf8"));
const rows=Array.isArray(matrix)?matrix:(matrix.requirements||matrix.items||[]);
const byId=Object.fromEntries(rows.map(x=>[x.id,x]));
const scorecard=JSON.parse(fs.readFileSync(new URL("../data/snap-pop-implementation-scorecard.json",import.meta.url),"utf8"));

function assert(name,condition){
  if(!condition) throw new Error("FAIL "+name);
  console.log("PASS",name);
}

const reconciled=[
  "SP-UNIV-003","SP-UNIV-004","SP-UNIV-005",
  "SP-IMAGINE-002","SP-IMAGINE-003","SP-IMAGINE-004","SP-IMAGINE-007","SP-IMAGINE-008",
  "SP-TRUTH-001","SP-TRUTH-002","SP-TRUTH-003"
];
const liveRuntimeStillOpen=reconciled.filter(id=>!["SP-TRUTH-001","SP-TRUTH-003","SP-IMAGINE-002","SP-IMAGINE-003","SP-IMAGINE-005","SP-IMAGINE-007","SP-IMAGINE-008"].includes(id));

const count=field=>rows.filter(x=>x[field]===true).length;
assert("scorecard-derived-from-current-matrix",
  scorecard.sourceMatrixVersion===matrix.version&&
  scorecard.totalRequirements===rows.length&&
  scorecard.evidence?.coded?.count===count("coded")&&
  scorecard.evidence?.staticVerified?.count===count("staticVerified")&&
  scorecard.evidence?.runtimeVerified?.count===count("runtimeVerified")&&
  scorecard.evidence?.deviceVerified?.count===count("deviceVerified")
);
assert("scorecard-keeps-evidence-axes-separate",
  scorecard.statusModel==="EVIDENCE_INDEX"&&
  Array.isArray(scorecard.invariants)&&
  scorecard.invariants.some(x=>/No composite percentage/i.test(x))
);

assert("all-reconciled-items-exist",reconciled.every(id=>!!byId[id]));
assert("all-reconciled-items-coded",reconciled.every(id=>byId[id].coded===true));
assert("all-reconciled-items-static-verified",reconciled.every(id=>byId[id].staticVerified===true));
assert("runtime-not-overclaimed",liveRuntimeStillOpen.every(id=>byId[id].runtimeVerified===false));
assert("truth-003-browser-no-guess-runtime-verified",byId["SP-TRUTH-003"].runtimeVerified===true&&byId["SP-TRUTH-003"].deviceVerified===false);
assert("truth-001-browser-gate-runtime-verified",byId["SP-TRUTH-001"].runtimeVerified===true&&byId["SP-TRUTH-001"].deviceVerified===false);
assert("imagine-005-browser-crew-guard-runtime-verified",byId["SP-IMAGINE-005"].runtimeVerified===true&&byId["SP-IMAGINE-005"].deviceVerified===false);
assert("imagine-007-browser-scaffold-runtime-verified",byId["SP-IMAGINE-007"].runtimeVerified===true&&byId["SP-IMAGINE-007"].deviceVerified===false);
assert("imagine-008-browser-mental-model-runtime-verified",byId["SP-IMAGINE-008"].runtimeVerified===true&&byId["SP-IMAGINE-008"].deviceVerified===false);
assert("imagine-002-browser-gateway-runtime-verified",byId["SP-IMAGINE-002"].runtimeVerified===true&&byId["SP-IMAGINE-002"].deviceVerified===false);
assert("imagine-003-browser-intent-routing-runtime-verified",byId["SP-IMAGINE-003"].runtimeVerified===true&&byId["SP-IMAGINE-003"].deviceVerified===false);
assert("univ-006-browser-optional-expression-runtime-verified",byId["SP-UNIV-006"].runtimeVerified===true&&byId["SP-UNIV-006"].deviceVerified===false);
assert("device-not-overclaimed",reconciled.every(id=>byId[id].deviceVerified===false));

assert("truth-source-quality-gap-remains-open",
  /source-quality|folk-etymology|authority ranking|live runtime quality/i.test(byId["SP-TRUTH-002"].gap||"")
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
