import fs from "node:fs";
import vm from "node:vm";

const source=fs.readFileSync(new URL("../intelligence-runtime.js",import.meta.url),"utf8");

function assert(name,condition){
  if(!condition) throw new Error("FAIL "+name);
  console.log("PASS",name);
}

const window={
  SnapPopCrewPresentationGuard:{
    sanitizeUserFacing(result){
      return {...result,responseOwner:"EXPLORATION_CREW"};
    }
  }
};
vm.runInNewContext(source,{window,Object,Array,String,Number,Math,RegExp,Promise});

const i=window.SnapPopIntelligence;

assert("local-think-classifies",
  i.classifyIntent("비 오는 날 창문을 보면 어떤 느낌일까") === "THINK_EXPRESS"
);

const local=await i.ask({
  input:"비 오는 날 창문을 보면 어떤 느낌일까",
  language:"ko",
  intent:"THINK_EXPRESS"
});
assert("local-think-verification-not-applicable",
  local.verified===null&&local.verification?.mode==="NOT_APPLICABLE"
);
assert("local-think-owner-is-crew",
  local.responseOwner==="EXPLORATION_CREW"
);

window.SnapPopOpenAIProvider={
  async ask(){
    return {
      kind:"THINK_EXPRESS",
      verified:true,
      verification:{mode:"CLAIM_EVIDENCE"},
      title:"provider",
      core:"생각 조각",
      nodes:[]
    };
  }
};
const external=await i.ask({
  input:"이 장면을 다른 시선으로 생각해보고 싶어",
  language:"ko",
  intent:"THINK_EXPRESS"
});
assert("external-think-cannot-claim-factual-verification",
  external.verified===null&&external.verification?.mode==="NOT_APPLICABLE"
);
assert("external-think-owner-remains-crew",
  external.responseOwner==="EXPLORATION_CREW"
);

console.log("THINK_EXPRESS_VERIFICATION_SEPARATION_PASS");
