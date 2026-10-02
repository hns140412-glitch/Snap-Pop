import fs from "node:fs";

function read(path){return fs.readFileSync(new URL("../"+path,import.meta.url),"utf8")}
function assert(name,condition){if(!condition)throw new Error("FAIL "+name);console.log("PASS",name)}

const controller=read("badge-controller.js");
const runtime=read("badge-runtime.js");
const source=read("badge-source-observation-runtime.js");
const catalog=JSON.parse(read("data/badge-catalog-working.json"));

const legacyStart=controller.indexOf("async function recordBadgeEvent(");
const legacyEnd=controller.indexOf("async function renderBadgePreview",legacyStart);
const legacyBlock=legacyStart>=0&&legacyEnd>legacyStart?controller.slice(legacyStart,legacyEnd):"";

assert("source-observation-contract-present",source.includes('const CONTRACT="TAKY_BADGE_SOURCE_OBSERVATION_V1"'));
assert("source-observation-has-no-award-authority",source.includes("badge_award_authorized:false")&&source.includes("economy_mutation_authorized:false"));
assert("source-award-path-uses-source-matcher",controller.includes("matchSourceObservation(observation)"));
assert("legacy-event-path-does-not-call-award-matcher",legacyBlock&&!legacyBlock.includes("matchEvent(")&&!legacyBlock.includes("matchSourceObservation("));
assert("source-matcher-supports-approved-multi-source-tuples",runtime.includes("item.sourceMatchers")&&runtime.includes("x.appId")&&runtime.includes("x.eventFamily")&&runtime.includes("x.behaviorCode")&&runtime.includes("x.sourceContractId"));
assert("source-matcher-requires-exact-behavior-code",runtime.includes('observation.behavior_code'));
assert("source-matcher-requires-exact-source-contract",runtime.includes('observation.source_contract_id'));
assert("source-matcher-requires-exact-source-app",runtime.includes('observation.app_id'));
assert("source-matcher-requires-explicit-child-action",runtime.includes("observation.explicit_child_action===true"));
assert("working-catalog-remains-inactive",catalog.status==="WORKING_DRAFT_NOT_ACTIVE"&&catalog.items.every(x=>x.active===false));

console.log("BADGE_SOURCE_AWARD_BOUNDARY_PASS");
