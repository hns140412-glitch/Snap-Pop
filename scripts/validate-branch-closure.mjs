import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here=path.dirname(fileURLToPath(import.meta.url));

const validators=[
  "validate-semantic-writing-runtime.mjs",
  "validate-truth-guard-runtime.mjs",
  "validate-knowledge-runtime.mjs",
  "validate-knowledge-search-boundary.mjs",
  "validate-curiosity-scaffold.mjs",
  "validate-question-lens-routing.mjs",
  "validate-mental-model.mjs",
  "validate-imagination-pressure-return.mjs",
  "validate-crew-presentation-ownership.mjs",
  "validate-voice-ownership.mjs",
  "validate-voice-quality-policy.mjs",
  "validate-stt-session-ownership.mjs",
  "validate-p1-p5-integrated.mjs",
  "validate-p6-app-boundaries.mjs",
  "validate-crew-guest-orchestration.mjs"
];

let passed=0;
for(const file of validators){
  const full=path.join(here,file);
  const run=spawnSync(process.execPath,[full],{
    encoding:"utf8",
    env:{...process.env}
  });

  process.stdout.write("\n=== "+file+" ===\n");
  if(run.stdout) process.stdout.write(run.stdout);
  if(run.stderr) process.stderr.write(run.stderr);

  if(run.status!==0){
    console.error("BRANCH_CLOSURE_VALIDATOR_FAIL",file,"status",run.status);
    process.exit(run.status||1);
  }
  passed++;
}

console.log("\nBRANCH_CLOSURE_VALIDATOR_PASS",passed+"/"+validators.length);
