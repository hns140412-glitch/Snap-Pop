import fs from "node:fs";
import vm from "node:vm";

const source=fs.readFileSync(new URL("../badge-candidate-runtime.js",import.meta.url),"utf8");
const app=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");

const window={};
vm.runInNewContext(source,{window,Object,Array,String,Number,Math,Error,Set,Date});
const c=window.SnapPopBadgeCandidate;

function assert(name,condition){
  if(!condition) throw new Error("FAIL "+name);
  console.log("PASS",name);
}

const observations=[
  {eventId:"e1",family:"HELP_REQUEST"},
  {eventId:"e2",family:"HELP_REQUEST"},
  {eventId:"e3",family:"EXTRA_TASK"}
];

const candidate=c.fromObservationCluster(observations,{
  id:"candidate-help-pattern",
  title:"도움 요청 경험 후보",
  families:["HELP_REQUEST"],
  reason:"명시적 도움 요청 경험이 반복해서 관찰됨"
});

assert("candidate-requires-evidence",
  candidate.evidenceEventIds.length===2
);
assert("candidate-stays-review-only",
  candidate.status==="REVIEW_REQUIRED"&&candidate.active===false
);
assert("candidate-has-no-award-or-auto-activation-authority",
  candidate.awardAuthorized===false&&
  candidate.autoCatalogInsertAllowed===false&&
  candidate.autoTriggerActivationAllowed===false
);

let noEvidenceBlocked=false;
try{
  c.fromObservationCluster(observations,{
    id:"candidate-missing",
    title:"근거 없음",
    families:["RETRY"]
  });
}catch(error){
  noEvidenceBlocked=error?.message==="BADGE_CANDIDATE_EVIDENCE_REQUIRED";
}
assert("no-evidence-candidate-blocked",noEvidenceBlocked);

assert("app-persists-candidate-in-review-ledger",
  app.includes("async function proposeBadgeCandidateFromObservations")&&
  app.includes('badgeCandidateReviews')
);
assert("app-does-not-auto-call-candidate-proposal",
  (app.match(/proposeBadgeCandidateFromObservations(/g)||[]).length===1
);

console.log("BADGE_CANDIDATE_REVIEW_ONLY_PASS");
