import fs from "node:fs";

const freeze=JSON.parse(fs.readFileSync(new URL("../VALIDATION/SNAP_POP_PREDEPLOY_FROZEN_CANDIDATE_2026-09-22.json",import.meta.url),"utf8"));
const closure=fs.readFileSync(new URL("../VALIDATION/SNAP_POP_REWRITE_CLOSURE_LATEST.txt",import.meta.url),"utf8");

function assert(name,condition){
  if(!condition) throw new Error("FAIL "+name);
  console.log("PASS",name);
}
function field(name){
  const m=closure.match(new RegExp("^"+name+"=(.+)$","m"));
  return m?m[1].trim():"";
}

assert("freeze-status",freeze.status==="PREDEPLOY_FROZEN_CANDIDATE");
assert("validated-code-sha-matches-latest-evidence",freeze.validatedCodeSha===field("validation_sha"));
assert("closure-is-green",field("closure_status")==="0"&&/^BRANCH_CLOSURE_VALIDATOR_PASS \d+\/\d+$/.test(field("closure_marker")));
assert("browser-runtime-is-green",field("browser_status")==="0"&&field("browser_marker")==="BROWSER_RUNTIME_CDP_PASS");
assert("viewport-is-mobile-target",field("viewport")==="390x844");
assert("evidence-head-is-not-confused-with-code-candidate",freeze.evidenceHeadSha!==freeze.validatedCodeSha);
assert("no-deployment-before-human-gate",freeze.validation.deployment==="NOT_RUN"&&freeze.validation.netlifyMutation==="NOT_RUN"&&freeze.validation.mainMerge==="NOT_RUN");
assert("device-remains-unclaimed",freeze.evidenceIndex.deviceVerified==="0/80"&&freeze.validation.deviceVerified==="NOT_RUN");
assert("runtime-open-count-stays-eleven",freeze.runtimeOpen.crossApp.length+freeze.runtimeOpen.liveProvider.length===11);
assert("wish-economy-ownership-locked",freeze.ownershipLocks.wishEconomyOwner==="SNAP_POP_WISH_ECONOMY"&&freeze.ownershipLocks.externalSpendAuthority===false);

console.log("SNAP_POP_FROZEN_CANDIDATE_CONTRACT_PASS");
