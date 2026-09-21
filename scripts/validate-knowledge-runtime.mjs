import fs from "node:fs";
import vm from "node:vm";

const truthSource=fs.readFileSync(new URL("../truth-guard-runtime.js",import.meta.url),"utf8");
const knowledgeSource=fs.readFileSync(new URL("../knowledge-runtime.js",import.meta.url),"utf8");
const intelligenceSource=fs.readFileSync(new URL("../intelligence-runtime.js",import.meta.url),"utf8");

function makeWindow(backend){
  const window={};
  if(backend) window.SnapPopKnowledgeBackend=backend;
  const context={
    window,console,Object,Array,String,Number,Math,Error,Set,
    AbortController,clearTimeout,setTimeout
  };
  vm.runInNewContext(truthSource,context);
  vm.runInNewContext(knowledgeSource,context);
  vm.runInNewContext(intelligenceSource,context);
  return window;
}

function assert(name,condition){
  if(!condition) throw new Error("FAIL "+name);
  console.log("PASS",name);
}

const noBackend=makeWindow();
const fallback=await noBackend.SnapPopIntelligence.ask({input:"세종대왕은 언제 태어났어?",language:"ko"});
assert("no-backend-does-not-guess",fallback.verified===false&&fallback.requiresKnowledgeProvider===true);

const lyingBackend=makeWindow({
  ask:async()=>({
    kind:"ASK_UNDERSTAND",
    verified:true,
    title:"답",
    core:"근거 없는 답",
    verification:{mode:"CLAIM_EVIDENCE",claims:[{claim:"근거 없는 주장",status:"VERIFIED",evidence:[]}],unresolved:[]}
  })
});
const blocked=await lyingBackend.SnapPopIntelligence.ask({input:"사실 질문?",language:"ko"});
assert("backend-cannot-self-verify",blocked.verified===false);

const evidenceBackend=makeWindow({
  ask:async()=>({
    kind:"ASK_UNDERSTAND",
    title:"부분 확인 답",
    core:"근거 있는 설명",
    verification:{
      mode:"CLAIM_EVIDENCE",
      coverage:"CLAIM_SET_ONLY",
      claims:[{
        claim:"근거 있는 주장",
        status:"VERIFIED",
        evidence:[{source_type:"WEB",source_url:"https://example.com/evidence"}]
      }],
      unresolved:[]
    }
  })
});
const partial=await evidenceBackend.SnapPopIntelligence.ask({input:"사실 질문?",language:"ko"});
assert("claim-evidence-does-not-overstate-full-answer",partial.verified===false&&partial.verification.verifiedClaimCount===1);

const fullCoverageBackend=makeWindow({
  ask:async()=>({
    kind:"ASK_UNDERSTAND",
    title:"확인된 답",
    core:"근거 있는 설명",
    verification:{
      mode:"CLAIM_EVIDENCE",
      coverage:"FULL_FACTUAL_CONTENT",
      claims:[{
        claim:"근거 있는 주장",
        status:"VERIFIED",
        evidence:[{source_type:"WEB",source_url:"https://example.com/evidence"}]
      }],
      unresolved:[]
    }
  })
});
const passed=await fullCoverageBackend.SnapPopIntelligence.ask({input:"사실 질문?",language:"ko"});
assert("full-covered-evidence-backend-can-pass",passed.verified===true);

console.log("KNOWLEDGE_RUNTIME_STATIC_CONTRACT_PASS");
