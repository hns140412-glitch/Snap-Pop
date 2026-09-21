import fs from "node:fs";

const bridge=fs.readFileSync(new URL("../snap-bridge.js",import.meta.url),"utf8");
const provider=fs.readFileSync(new URL("../learning-context-runtime.js",import.meta.url),"utf8");

function assert(name,ok){
  if(!ok) throw new Error("FAIL "+name);
  console.log("PASS",name);
}

assert("contract-version-gate",bridge.includes("value.contract_version!=='READY_LEARNING_CONTEXT_V1'"));
assert("required-lineage-gate",bridge.includes("required=['learning_unit_id','analysis_id','assignment_id']"));
for(const field of [
  "learning_unit_id","analysis_id","assignment_id","subject","concept_skill_target",
  "activity_types","cognitive_load_profile","confidence","unresolved_flags"
]) assert("field-"+field,bridge.includes(field)&&provider.includes(field));

for(const field of [
  "'role'","'permission'","'permissions'","'planner_authority'","'allocation_authority'",
  "'family_id'","'child_id'","'hanja_grade'","'hanja_level'","'grade_inference'"
]) assert("forbidden-gate-"+field,bridge.includes(field));

assert("provider-remains-advisory",provider.includes('source:"READY_SET_LEARNING_MASTER"'));
assert("vocabulary-contract-separate",!provider.includes("vocabularyOwnershipTransferred"));
console.log("SNAP_READY_LEARNING_CONTEXT_CONTRACT_PASS");
