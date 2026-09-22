import fs from "node:fs";
import vm from "node:vm";

const source=fs.readFileSync(new URL("../truth-guard-runtime.js",import.meta.url),"utf8");
const window={};
vm.runInNewContext(source,{window,Object,Array,String,Number,Math});
const guard=window.SnapPopTruthGuard;

function assert(name,condition){
  if(!condition) throw new Error("FAIL "+name);
  console.log("PASS",name);
}

const unsupported=guard.guardKnowledge({verified:true,core:"세종대왕은 1397년에 태어났다."});
assert("raw-verified-does-not-bypass",unsupported.verified===false);
assert("no-evidence-is-unverified",unsupported.verification.reason==="NO_CLAIM_EVIDENCE");

const weak=guard.guardKnowledge({
  verification:{
    mode:"CLAIM_EVIDENCE",
    claims:[{claim:"사실 주장",status:"VERIFIED",evidence:[]}],
    unresolved:[]
  }
});
assert("verified-claim-needs-evidence",weak.verified===false);

const claimSetOnly=guard.guardKnowledge({
  verification:{
    mode:"CLAIM_EVIDENCE",
    coverage:"CLAIM_SET_ONLY",
    claims:[{
      claim:"사실 주장",
      status:"VERIFIED",
      evidence:[{source_type:"WEB",source_url:"https://example.com/source",checked_at:"2026-09-21T12:00:00+09:00"}]
    }],
    unresolved:[]
  }
});
assert("claim-set-evidence-does-not-imply-full-answer",claimSetOnly.verified===false);
assert("claim-set-evidence-is-preserved",claimSetOnly.verification.claimEvidenceVerified===true&&claimSetOnly.verification.verifiedClaimCount===1);

const strong=guard.guardKnowledge({
  verification:{
    mode:"CLAIM_EVIDENCE",
    coverage:"FULL_FACTUAL_CONTENT",
    claims:[{
      claim:"사실 주장",
      status:"VERIFIED",
      evidence:[{source_type:"WEB",source_url:"https://example.com/source",checked_at:"2026-09-21T12:00:00+09:00"}]
    }],
    unresolved:[]
  }
});
assert("full-covered-evidence-contract-can-pass",strong.verified===true);

const communityOnly=guard.guardKnowledge({
  verification:{
    mode:"CLAIM_EVIDENCE",
    coverage:"FULL_FACTUAL_CONTENT",
    sourceQualityEnforced:true,
    eligibleSourceQualities:["INSTITUTIONAL","STANDARD"],
    claims:[{
      claim:"사실 주장",
      status:"VERIFIED",
      evidence:[{source_type:"WEB",source_url:"https://reddit.com/r/example",source_quality:"COMMUNITY"}]
    }],
    unresolved:[]
  }
});
assert("community-only-source-quality-is-fail-closed",communityOnly.verified===false&&communityOnly.verification.reason==="LOW_AUTHORITY_ONLY");
assert("source-quality-is-preserved",communityOnly.verification.claims[0].evidence[0].source_quality==="COMMUNITY");

const etymologyOneHost=guard.guardKnowledge({
  verification:{
    mode:"CLAIM_EVIDENCE",
    coverage:"FULL_FACTUAL_CONTENT",
    sourceQualityEnforced:true,
    eligibleSourceQualities:["INSTITUTIONAL","STANDARD"],
    etymologySourceDiversityRequired:true,
    claims:[{
      claim:"어원 주장",
      status:"VERIFIED",
      evidence:[
        {source_type:"WEB",source_url:"https://dictionary.example/a",source_quality:"STANDARD"},
        {source_type:"WEB",source_url:"https://dictionary.example/b",source_quality:"STANDARD"}
      ]
    }],
    unresolved:[]
  }
});
assert("etymology-one-host-is-fail-closed",etymologyOneHost.verified===false&&etymologyOneHost.verification.reason==="ETYMOLOGY_SOURCE_DIVERSITY_INSUFFICIENT");

const etymologyTwoHosts=guard.guardKnowledge({
  verification:{
    mode:"CLAIM_EVIDENCE",
    coverage:"FULL_FACTUAL_CONTENT",
    sourceQualityEnforced:true,
    eligibleSourceQualities:["INSTITUTIONAL","STANDARD"],
    etymologySourceDiversityRequired:true,
    claims:[{
      claim:"어원 주장",
      status:"VERIFIED",
      evidence:[
        {source_type:"WEB",source_url:"https://dictionary-a.example/root",source_quality:"STANDARD"},
        {source_type:"WEB",source_url:"https://linguistics.example.edu/root",source_quality:"INSTITUTIONAL"}
      ]
    }],
    unresolved:[]
  }
});
assert("etymology-two-independent-hosts-can-pass-client-guard",etymologyTwoHosts.verified===true&&etymologyTwoHosts.verification.eligibleSourceHostCount===2);

const unresolved=guard.guardKnowledge({
  verification:{
    mode:"CLAIM_EVIDENCE",
    claims:[{
      claim:"사실 주장",
      status:"VERIFIED",
      evidence:[{source_type:"WEB",source_id:"source-1"}]
    }],
    unresolved:["date conflict"]
  }
});
assert("unresolved-blocks-verified",unresolved.verified===false);

console.log("TRUTH_GUARD_STATIC_CONTRACT_PASS");
