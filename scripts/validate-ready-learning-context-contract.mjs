import fs from "node:fs";

const bridge=fs.readFileSync(new URL("../snap-bridge.js",import.meta.url),"utf8");
const provider=fs.readFileSync(new URL("../learning-context-runtime.js",import.meta.url),"utf8");

function assert(name,condition){
  if(!condition) throw new Error("FAIL "+name);
  console.log("PASS",name);
}

assert("contract-version",bridge.includes("READY_LEARNING_CONTEXT_V1"));
assert("required-lineage",bridge.includes("requiredIds=['learning_unit_id','analysis_id','assignment_id']"));

for(const field of [
  "learning_unit_id","analysis_id","assignment_id","subject","concept_skill_target",
  "activity_types","cognitive_load_profile","confidence","unresolved_flags"
]){
  assert("field-"+field,bridge.includes(field)&&provider.includes(field));
}

const decoder=bridge.slice(
  bridge.indexOf("function decodeLearningContext"),
  bridge.indexOf("function readStoredContext")
);

for(const forbidden of [
  "role","permission","plannerAuthority","allocationAuthority","family_id","child_id",
  "hanja_grade","hanja_level","grade_inference","masteryMutation"
]){
  assert("forbidden-"+forbidden,!decoder.includes("value."+forbidden));
}

assert("semantic-light-provider",
  !provider.includes("divisible_boundary") &&
  !provider.includes("provenance:")
);

console.log("SNAP_READY_LEARNING_CONTEXT_CONTRACT_PASS");
