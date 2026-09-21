import fs from "node:fs";
import vm from "node:vm";

const source=fs.readFileSync(new URL("../badge-shared-contract-runtime.js",import.meta.url),"utf8");
const app=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");

const window={};
vm.runInNewContext(source,{window,Object,Array,String,Number,Math,Error,RegExp,Set,Date});
const c=window.TakyBadgeExperienceContract;

function assert(name,condition){
  if(!condition) throw new Error("FAIL "+name);
  console.log("PASS",name);
}

const shared=c.fromSnapObservation({
  contract_version:"SNAP_POP_BADGE_BEHAVIOR_OBSERVATION_V1",
  eventId:"obs-1",
  family:"HELP_REQUEST",
  at:"2026-09-21T05:40:00Z",
  payload:{explicitAction:true,landmark:"idea"}
});

assert("contract-version",shared.contract_version==="TAKY_BADGE_EXPERIENCE_EVENT_V1");
assert("app-id-preserved",shared.app_id==="SNAP_POP");
assert("event-family-preserved",shared.event_family==="HELP_REQUEST");
assert("source-provenance-preserved",
  shared.provenance.source_event_id==="obs-1"&&
  shared.provenance.source_contract==="SNAP_POP_BADGE_BEHAVIOR_OBSERVATION_V1"
);
assert("identity-not-shared",
  shared.identity_scope==="APP_OWNED_NOT_SHARED"&&
  !("user_id" in shared)&&!("family_id" in shared)&&!("organization_id" in shared)
);
assert("role-permission-not-shared",
  shared.role_scope==="APP_OWNED_NOT_SHARED"&&
  shared.permission_scope==="APP_OWNED_NOT_SHARED"
);
assert("no-award-or-economy-authority",
  shared.badge_award_authorized===false&&shared.economy_mutation_authorized===false
);
assert("app-mirrors-observation-without-replacing-local-ledger",
  app.includes('badgeBehaviorObservations')&&
  app.includes('badgeSharedExperienceEvents')&&
  app.includes('fromSnapObservation')
);

console.log("SHARED_BADGE_EVENT_CONTRACT_PASS");
