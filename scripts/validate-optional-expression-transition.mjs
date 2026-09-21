import fs from "node:fs";

const app=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
const index=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const flow=fs.readFileSync(new URL("../writing-flow-controller.js",import.meta.url),"utf8");

function assert(name,condition){
  if(!condition) throw new Error("FAIL "+name);
  console.log("PASS",name);
}

assert("express-action-requires-full-verified-global-ask",
  app.includes('const canExpress=imaginationSource==="GLOBAL"&&result?.kind==="ASK_UNDERSTAND"&&result?.verified===true&&result?.verification?.coverage==="FULL_FACTUAL_CONTENT"')
);

assert("express-action-is-explicit-button",
  app.includes('class="soft cloudExpressBtn"')&&
  app.includes('이걸 내 말로 표현해보기')
);

const renderStart=app.indexOf("function renderImaginationResponse");
const renderEnd=app.indexOf("async function runImagination",renderStart);
const renderBlock=app.slice(renderStart,renderEnd);
assert("transition-does-not-transfer-ai-answer",
  renderBlock.includes('answerTransferred:false')&&
  !renderBlock.includes('pendingExpressionIntent",{source:"VERIFIED_ASK",question,result')&&
  !renderBlock.includes('answer:result.core')
);

assert("transition-returns-to-map-not-writing-auto-start",
  renderBlock.includes('show("map")')&&
  !renderBlock.includes('$("#startBtn").click')&&
  !renderBlock.includes('selected=')
);

const startBlockStart=flow.indexOf("async function start()");
const startBlockEnd=flow.indexOf("async function advance()",startBlockStart);
const startBlock=flow.slice(startBlockStart,startBlockEnd);
assert("pending-intent-attaches-only-to-new-session",
  startBlock.includes("created=false")&&
  startBlock.includes("if(created)")&&
  startBlock.includes('source:"VERIFIED_ASK"')
);
assert("pending-intent-clears-after-attach",
  startBlock.includes('await store.set("pendingExpressionIntent",null)')
);
assert("expression-intent-carries-question-not-answer",
  startBlock.includes("question:pending.question")&&
  startBlock.includes("answerTransferred:false")&&
  !startBlock.includes("pending.answer")
);

assert("writing-screen-shows-topic-as-note-only",
  app.includes("표현해볼 주제")&&
  index.includes('id="expressionIntentNote"')
);
assert("map-shows-optional-topic-banner",
  app.includes("표현하고 싶다면 탐험지를 골라봐")&&
  index.includes('id="expressionIntentBanner"')
);

console.log("OPTIONAL_VERIFIED_EXPRESSION_TRANSITION_PASS");
