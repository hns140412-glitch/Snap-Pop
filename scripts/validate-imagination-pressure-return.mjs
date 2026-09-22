import fs from "node:fs";
import vm from "node:vm";

const mentalSource=fs.readFileSync(new URL("../mental-model-runtime.js",import.meta.url),"utf8");
const scaffoldSource=fs.readFileSync(new URL("../curiosity-scaffold-runtime.js",import.meta.url),"utf8");
const appSource=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
const imaginationSource=fs.readFileSync(new URL("../imagination-controller.js",import.meta.url),"utf8");

const window={};
vm.runInNewContext(mentalSource,{window,Object,Array,String,Number,Math});
vm.runInNewContext(scaffoldSource,{window,Object,Array,String,Number,Math,Set});
const s=window.SnapPopCuriosityScaffold;

function assert(name,condition){
  if(!condition) throw new Error("FAIL "+name);
  console.log("PASS",name);
}

const full={
  verified:true,
  verification:{
    coverage:"FULL_FACTUAL_CONTENT",
    verifiedClaimCount:2,
    claims:[
      {claim:"A",status:"VERIFIED",evidence:[{source_type:"WEB",source_url:"https://a"}]},
      {claim:"B",status:"VERIFIED",evidence:[{source_type:"WEB",source_url:"https://b"}]}
    ]
  }
};

const partial={
  verified:false,
  verification:{
    coverage:"CLAIM_SET_ONLY",
    verifiedClaimCount:1,
    claims:[{claim:"A",status:"VERIFIED",evidence:[{source_type:"WEB",source_url:"https://a"}]}]
  }
};

assert("global-full-can-offer-optional-followup",
  s.followUpPolicy(full,"GLOBAL").available===true
);
assert("partial-answer-suppresses-followup",
  s.followUpPolicy(partial,"GLOBAL").available===false
);
assert("writing-flow-suppresses-followup",
  s.followUpPolicy(full,"WRITING_FLOW").available===false
);
assert("home-radio-full-can-offer-optional-followup",
  s.followUpPolicy(full,"HOME_RADIO").available===true
);

const fullScaffold=s.scaffoldKnowledge(full,"왜 비가 내려?","ko","GLOBAL");
assert("global-full-has-one-next-curiosity",
  typeof fullScaffold.understanding.nextCuriosity==="string"&&
  fullScaffold.understanding.nextCuriosity.length>0
);

const writingScaffold=s.scaffoldKnowledge(full,"왜 비가 내려?","ko","WRITING_FLOW");
assert("writing-flow-has-no-next-curiosity",
  writingScaffold.understanding.nextCuriosity===null&&
  writingScaffold.understanding.followUpReason==="WRITING_FLOW_RETURN_PRIORITY"
);

const partialScaffold=s.scaffoldKnowledge(partial,"왜 비가 내려?","ko","GLOBAL");
assert("partial-has-no-next-curiosity",
  partialScaffold.understanding.nextCuriosity===null&&
  partialScaffold.understanding.followUpReason==="VERIFICATION_INCOMPLETE"
);

const saveIndex=imaginationSource.indexOf('s.draft=draft;');
const persistIndex=imaginationSource.indexOf('await store.set("active",s);',saveIndex);
const openIndex=imaginationSource.indexOf('openImagination({',persistIndex);
assert("draft-persists-before-cloud-open",
  saveIndex>=0&&persistIndex>saveIndex&&openIndex>persistIndex
);

assert("return-uses-central-integrity-guard",
  imaginationSource.includes("SnapPopImaginationReturnGuard")&&
  imaginationSource.includes('guard.returnDraft(current||{},writingReturn)')
);

assert("return-context-captures-session-landmark-step-language",
  imaginationSource.includes('writingReturn:{id:s.id,landmark:s.landmark,step,language:s.language||"ko",draft}')
);

assert("return-restores-current-or-snapshot-draft-with-integrity-marker",
  imaginationSource.includes('q("#answer").value=returned.draft||"";')&&
  imaginationSource.includes('returnIntegrity:"MATCH"')&&
  imaginationSource.includes('draftPreserved:true')
);

assert("context-change-blocks-writing-return",
  imaginationSource.includes('returnIntegrity:"BLOCKED"')&&
  imaginationSource.includes('reason:returned.reason||"CONTEXT_CHANGED"')
);

assert("stale-imagination-responses-are-invalidated-on-open-close",
  imaginationSource.includes("imaginationRequestSeq++")&&
  imaginationSource.includes("requestSeq=++imaginationRequestSeq")&&
  imaginationSource.includes('if(requestSeq!==imaginationRequestSeq||q("#imaginationLayer")?.hidden)return;')&&
  imaginationSource.includes('if(requestSeq===imaginationRequestSeq){btn.disabled=false;btn.textContent="도움 받기"}')
);

assert("followup-is-hidden-until-child-reveals",
  imaginationSource.includes('class="soft cloudFollowUpReveal"')&&
  imaginationSource.includes('cloudFollowUpText" hidden')&&
  imaginationSource.includes('follow.hidden=false;reveal.remove()')
);

const closeStart=imaginationSource.indexOf("async function closeImagination()");
const closeEnd=imaginationSource.indexOf("function renderImaginationResponse",closeStart);
const closeBlock=imaginationSource.slice(closeStart,closeEnd);
assert("return-acknowledgement-is-non-driving",
  closeBlock.includes("쓰던 글은 그대로 있어. 준비되면 이어서 쓰면 돼.")&&
  !closeBlock.includes("analyzeWritingMove(")&&
  !closeBlock.includes("runImagination(")&&
  !closeBlock.includes("nextBtn")&&
  !closeBlock.includes("step=")
);

console.log("IMAGINATION_PRESSURE_RETURN_CONTRACT_PASS");
