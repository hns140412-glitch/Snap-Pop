import fs from "node:fs";
import vm from "node:vm";

const source=fs.readFileSync(new URL("../curiosity-scaffold-runtime.js",import.meta.url),"utf8");
const window={};
vm.runInNewContext(source,{window,Object,Array,String,Number,Math,Set});
const s=window.SnapPopCuriosityScaffold;

function assert(name,condition){
  if(!condition) throw new Error("FAIL "+name);
  console.log("PASS",name);
}

const cases=[
  ["ko-etymology","이 단어의 어원이 뭐야?","ETYMOLOGY"],
  ["ko-meaning","민주주의 뜻이 뭐야?","MEANING"],
  ["ko-cause","비가 왜 내려?","CAUSE_EFFECT"],
  ["ko-mechanism","냉장고는 어떻게 작동해?","MECHANISM"],
  ["ko-compare","고려와 조선의 차이는 뭐야?","COMPARE"],
  ["ko-time","훈민정음은 언제 만들어졌어?","TIME_FLOW"],
  ["ko-person","세종대왕은 누가 도왔어?","PERSON_EVENT"],
  ["ko-place","경주는 어디에 있어?","PLACE_CONTEXT"],
  ["en-etymology","What is the etymology of democracy?","ETYMOLOGY"],
  ["en-compare","Compare planets and stars.","COMPARE"],
  ["en-cause","Why does rain fall?","CAUSE_EFFECT"],
  ["en-time","When was Hangul created?","TIME_FLOW"]
];

for(const [name,input,expected] of cases){
  assert(name,s.classifyQuestion(input)===expected);
}

const original={
  kind:"ASK_UNDERSTAND",
  core:"검증된 사실 문장.",
  verification:{coverage:"FULL_FACTUAL_CONTENT",verifiedClaimCount:1}
};
const shaped=s.scaffoldKnowledge(original,"왜 비가 내려?","ko");
assert("preserve-core",shaped.core===original.core);
assert("question-structure-only",shaped.understanding.source==="QUESTION_STRUCTURE_ONLY");
assert("single-next-curiosity",typeof shaped.understanding.nextCuriosity==="string"&&shaped.understanding.nextCuriosity.length>0);
assert("does-not-mutate-verification",shaped.verification===original.verification);

console.log("CURIOSITY_SCAFFOLD_STATIC_CONTRACT_PASS");
