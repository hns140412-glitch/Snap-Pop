import fs from "node:fs";
import vm from "node:vm";

const source=fs.readFileSync(new URL("../semantic-writing-runtime.js",import.meta.url),"utf8");

function runtimeWith(raw){
  const window={
    SnapPopOpenAIProvider:{
      analyzeWriting:async()=>structuredClone(raw)
    }
  };
  vm.runInNewContext(source,{window,console,Set,Object,Array,Number,Math,Error});
  return window.SnapPopSemanticWritingProvider;
}

async function expectPass(name,raw,check){
  const provider=runtimeWith(raw);
  const out=await provider.analyzeWriting({draft:"나는 오늘 비 오는 길을 천천히 걸었다.",landmark:"idea",step:1,language:"ko"});
  if(check&&!check(out)) throw new Error("FAIL "+name);
  console.log("PASS",name);
}

async function expectReject(name,raw,code){
  const provider=runtimeWith(raw);
  try{
    await provider.analyzeWriting({draft:"나는 오늘 비 오는 길을 천천히 걸었다.",landmark:"idea",step:1,language:"ko"});
  }catch(error){
    if(String(error?.message||error)!==code) throw new Error("FAIL "+name+" expected "+code+" got "+String(error?.message||error));
    console.log("PASS",name);
    return;
  }
  throw new Error("FAIL "+name+" expected rejection");
}

const base={
  focus:"CONNECT",
  question:"이 장면에서 가장 마음에 남은 한 가지가 뭐야?",
  hint:"한 조각만 붙여봐.",
  suggestedLens:"emotion",
  rationale:"현재 초안의 중심을 조금 더 선명하게 만든다.",
  confidence:0.8,
  semanticSignals:{present:["scene"],missing:["reason"]},
  grounded:true
};

await expectPass("valid-single-next-move",base,out=>out.factVerified===false&&out.question===base.question);
await expectReject("nested-forbidden-output",{...base,semanticSignals:{present:["scene"],missing:[],meta:{finalDraft:"대필"}}},"SEMANTIC_FORBIDDEN_OUTPUT");
await expectReject("multi-question",{...base,question:"무슨 일이 있었어? 그때 어떤 마음이었어?"},"SEMANTIC_MULTI_PROMPT");
await expectReject("missing-question",{...base,question:""},"SEMANTIC_MISSING_NEXT_MOVE");
await expectReject("hint-question",{...base,hint:"왜 그랬을까?"},"SEMANTIC_HINT_MUST_NOT_ASK");

console.log("SEMANTIC_WRITING_RUNTIME_STATIC_CONTRACT_PASS");
