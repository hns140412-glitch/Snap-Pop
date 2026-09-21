import fs from "node:fs";
import vm from "node:vm";

const source=fs.readFileSync(new URL("../authorship-guard-runtime.js",import.meta.url),"utf8");
const semantic=fs.readFileSync(new URL("../semantic-writing-runtime.js",import.meta.url),"utf8");
const expression=fs.readFileSync(new URL("../expression-bridge-runtime.js",import.meta.url),"utf8");
const app=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
const imagination=fs.readFileSync(new URL("../imagination-controller.js",import.meta.url),"utf8");

const window={};
vm.runInNewContext(source,{window,Object,Array,String,Number,Math,Error,RegExp,Set});
const guard=window.SnapPopAuthorshipGuard;

function assert(name,condition){
  if(!condition) throw new Error("FAIL "+name);
  console.log("PASS",name);
}

assert("writing-assist-valid-one-next-move",
  guard.assertWritingAssist({question:"한 가지 이유를 더 붙여볼까?",hint:"이유 하나면 돼."})===true
);

let finalBlocked=false;
try{guard.assertWritingAssist({question:"한 가지 더 볼까?",finalDraft:"완성문"})}
catch(e){finalBlocked=e.message==="AUTHORSHIP_FINAL_TEXT_FORBIDDEN"}
assert("writing-final-draft-blocked",finalBlocked);

let multiBlocked=false;
try{guard.assertWritingAssist({question:"이건 어때? 저건 어때?",hint:""})}
catch(e){multiBlocked=e.message==="AUTHORSHIP_ONE_NEXT_MOVE_ONLY"}
assert("writing-question-flooding-blocked",multiBlocked);

assert("expression-valid-fragments",
  guard.assertExpressionBridge({phraseFragments:["want to explore","with my friend"]})===true
);

let sentenceBlocked=false;
try{guard.assertExpressionBridge({phraseFragments:["I want to explore."]})}
catch(e){sentenceBlocked=e.message==="AUTHORSHIP_COMPLETE_SENTENCE_FORBIDDEN"}
assert("expression-full-sentence-blocked",sentenceBlocked);

const transition=guard.transitionPayload({
  question:"왜 하늘은 파랄까?",
  language:"ko",
  coverage:"FULL_FACTUAL_CONTENT"
});
assert("verified-transition-does-not-transfer-answer-or-draft",
  transition.answerTransferred===false&&
  transition.draftTransferred===false&&
  !("answer" in transition)&&
  !("draft" in transition)
);

assert("semantic-runtime-uses-central-guard",
  semantic.includes("SnapPopAuthorshipGuard")&&
  semantic.includes("assertWritingAssist")
);
assert("expression-runtime-uses-central-guard",
  expression.includes("SnapPopAuthorshipGuard")&&
  expression.includes("assertExpressionBridge")
);
assert("app-transition-uses-central-guard",
  imagination.includes("SnapPopAuthorshipGuard?.transitionPayload")
);

console.log("CENTRAL_AUTHORSHIP_GUARD_PASS");
