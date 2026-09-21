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

const strong=guard.guardKnowledge({
  verification:{
    mode:"CLAIM_EVIDENCE",
    claims:[{
      claim:"사실 주장",
      status:"VERIFIED",
      evidence:[{source_type:"WEB",source_url:"https://example.com/source",checked_at:"2026-09-21T12:00:00+09:00"}]
    }],
    unresolved:[]
  }
});
assert("evidence-backed-contract-can-pass",strong.verified===true);

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
