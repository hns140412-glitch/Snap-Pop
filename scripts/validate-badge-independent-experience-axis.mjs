import fs from "node:fs";

const app=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
const behavior=fs.readFileSync(new URL("../badge-behavior-runtime.js",import.meta.url),"utf8");
const shared=fs.readFileSync(new URL("../badge-shared-contract-runtime.js",import.meta.url),"utf8");

function assert(name,condition){
  if(!condition) throw new Error("FAIL "+name);
  console.log("PASS",name);
}

const start=app.indexOf("async function recordBadgeBehaviorObservation");
const end=app.indexOf("async function recordBadgeEvent",start);
const block=app.slice(start,end);

assert("badge-observation-has-independent-local-ledger",
  block.includes('badgeBehaviorObservations')
);
assert("badge-observation-has-independent-shared-envelope-ledger",
  block.includes('badgeSharedExperienceEvents')
);
assert("badge-observation-does-not-write-exp-ledger",
  !block.includes('expLedger')&&!block.includes('["exp"')
);
assert("badge-observation-does-not-write-gem-ledger",
  !block.includes('gemLedger')&&!block.includes('["gems"')
);
assert("badge-observation-does-not-write-crew-affinity",
  !block.includes('crewRegistry')&&!block.includes('affinity')
);
assert("behavior-contract-does-not-authorize-award-or-penalty",
  behavior.includes("badgeAwardAuthorized:false")&&
  behavior.includes("penaltyAllowed:false")
);
assert("shared-contract-does-not-authorize-economy-mutation",
  shared.includes("badge_award_authorized:false")&&
  shared.includes("economy_mutation_authorized:false")
);
assert("catalog-activation-remains-separate-from-observation-axis",
  !block.includes("activeItems(")&&
  !block.includes("badgeAwarded")
);

console.log("BADGE_INDEPENDENT_EXPERIENCE_AXIS_PASS");
