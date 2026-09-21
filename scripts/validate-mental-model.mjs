import fs from "node:fs";
import vm from "node:vm";

const source=fs.readFileSync(new URL("../mental-model-runtime.js",import.meta.url),"utf8");
const window={};
vm.runInNewContext(source,{window,Object,Array,String,Number,Math});
const m=window.SnapPopMentalModel;

function assert(name,condition){
  if(!condition) throw new Error("FAIL "+name);
  console.log("PASS",name);
}

const result={
  verification:{
    coverage:"FULL_FACTUAL_CONTENT",
    claims:[
      {claim:"검증 문장 A",status:"VERIFIED",evidence:[{source_type:"WEB",source_url:"https://a"}]},
      {claim:"검증 문장 B",status:"VERIFIED",evidence:[{source_type:"WEB",source_url:"https://b"}]},
      {claim:"미검증 문장 C",status:"UNVERIFIED",evidence:[]},
      {claim:"검증 문장 D",status:"VERIFIED",evidence:[{source_type:"WEB",source_url:"https://d"}]}
    ]
  }
};

const flow=m.build(result,"CAUSE_EFFECT","ko");
assert("verified-only",flow.items.map(x=>x.text).join("|")==="검증 문장 A|검증 문장 B|검증 문장 D");
assert("flow-type",flow.type==="FLOW");
assert("verbatim-source",flow.items.every(x=>x.source==="VERIFIED_CLAIM_VERBATIM"));
assert("no-fact-transform",flow.transformsFacts===false);

const compare=m.build(result,"COMPARE","ko");
assert("compare-type",compare.type==="COMPARE");

const empty=m.build({verification:{claims:[{claim:"미검증",status:"UNVERIFIED",evidence:[]}]}},"CONCEPT","ko");
assert("no-verified-claim-no-model",empty===null);

const partialFlow=m.build({verification:{coverage:"CLAIM_SET_ONLY",claims:[
  {claim:"검증 A",status:"VERIFIED",evidence:[{source_type:"WEB",source_url:"https://a"}]},
  {claim:"검증 B",status:"VERIFIED",evidence:[{source_type:"WEB",source_url:"https://b"}]}
]}},"CAUSE_EFFECT","ko");
assert("partial-coverage-no-structural-flow",partialFlow===null);

const singleFlow=m.build({verification:{coverage:"FULL_FACTUAL_CONTENT",claims:[
  {claim:"검증 하나",status:"VERIFIED",evidence:[{source_type:"WEB",source_url:"https://a"}]}
]}},"TIME_FLOW","ko");
assert("single-claim-no-structural-flow",singleFlow===null);

const singleMeaning=m.build({verification:{coverage:"CLAIM_SET_ONLY",claims:[
  {claim:"뜻 문장",status:"VERIFIED",evidence:[{source_type:"WEB",source_url:"https://a"}]}
]}},"MEANING","ko");
assert("single-stack-can-render",singleMeaning?.type==="STACK"&&singleMeaning.items.length===1);

const bounded=m.build({verification:{coverage:"FULL_FACTUAL_CONTENT",claims:Array.from({length:8},(_,i)=>({claim:`V${i+1}`,status:"VERIFIED",evidence:[{source_type:"WEB",source_url:`https://e/${i}`}]}))}},"TIME_FLOW","ko");
assert("max-four-items",bounded.items.length===4);

console.log("MENTAL_MODEL_VERIFIED_CLAIM_CONTRACT_PASS");
