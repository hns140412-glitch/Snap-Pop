import fs from "node:fs";

const scorecard=JSON.parse(fs.readFileSync(new URL("../data/snap-pop-implementation-scorecard.json",import.meta.url),"utf8"));
const matrix=JSON.parse(fs.readFileSync(new URL("../data/snap-pop-requirement-matrix.json",import.meta.url),"utf8"));

function assert(name,condition){
  if(!condition) throw new Error("FAIL "+name);
  console.log("PASS",name);
}

const expectedOpen=[
  "SP-BRIDGE-001","SP-BRIDGE-002","SP-WRITE-007","SP-WRITE-009","SP-BADGE-003",
  "SP-UNIV-003","SP-UNIV-004","SP-UNIV-005","SP-IMAGINE-004","SP-TRUTH-002","SP-WRITE-005"
].sort();

const rows=Array.isArray(matrix)?matrix:(matrix.requirements||matrix.items||[]);
const open=rows.filter(x=>x.runtimeVerified!==true).map(x=>x.id).sort();

assert("all-requirements-coded-before-predeploy",scorecard.evidence?.coded?.count===80&&scorecard.evidence?.coded?.total===80);
assert("all-requirements-static-verified-before-predeploy",scorecard.evidence?.staticVerified?.count===80&&scorecard.evidence?.staticVerified?.total===80);
assert("runtime-evidence-remains-separated",scorecard.evidence?.runtimeVerified?.count===69&&scorecard.evidence?.runtimeVerified?.total===80);
assert("device-evidence-not-overclaimed",scorecard.evidence?.deviceVerified?.count===0);
assert("architecture-surgery-closed",scorecard.architectureSurgery==="CLOSED");
assert("integrated-ui-structural-rewrite-closed",scorecard.integratedUiStructuralRewrite==="CLOSED");
assert("deployment-not-run",scorecard.deployment==="NOT_RUN"&&scorecard.netlifyMutation==="NOT_RUN"&&scorecard.mainMerge==="NOT_RUN");
assert("runtime-open-count-is-explicit",scorecard.runtimeOpenCount===11);
assert("runtime-open-set-is-stable",JSON.stringify(open)===JSON.stringify(expectedOpen));
assert("scorecard-open-set-matches-matrix",
  JSON.stringify((scorecard.runtimeOpenRequirements||[]).map(x=>x.id).sort())===JSON.stringify(expectedOpen)
);
assert("final-visual-direction-remains-explicit-open",scorecard.finalVisualArtDirection==="OPEN");

console.log("SNAP_POP_PREDEPLOY_READINESS_CONTRACT_PASS");
