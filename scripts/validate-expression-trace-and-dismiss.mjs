import fs from "node:fs";

const app=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
const flow=fs.readFileSync(new URL("../writing-flow-controller.js",import.meta.url),"utf8");
const imagination=fs.readFileSync(new URL("../imagination-controller.js",import.meta.url),"utf8");

function assert(name,condition){
  if(!condition) throw new Error("FAIL "+name);
  console.log("PASS",name);
}

const traceStart=app.indexOf("async function recordExpressionTrace");
const traceEnd=app.indexOf("async function dismissPendingExpressionIntent",traceStart);
const traceBlock=app.slice(traceStart,traceEnd);

assert("trace-stores-metadata-only",
  traceBlock.includes("questionChars")&&
  traceBlock.includes("fragmentCount")&&
  traceBlock.includes("provider")&&
  !traceBlock.includes("draft:")&&
  !traceBlock.includes("answer:")&&
  !traceBlock.includes("phraseFragments")
);

assert("trace-ledger-is-bounded",
  traceBlock.includes('ledger.slice(0,200)')
);

const dismissStart=app.indexOf("async function dismissPendingExpressionIntent");
const dismissEnd=app.indexOf("async function renderPendingExpressionIntent",dismissStart);
const dismissBlock=app.slice(dismissStart,dismissEnd);

assert("dismiss-clears-pending-intent",
  dismissBlock.includes('await set("pendingExpressionIntent",null)')
);
assert("dismiss-records-metadata-event",
  dismissBlock.includes('VERIFIED_ASK_EXPRESSION_DISMISSED')
);

const renderStart=app.indexOf("async function renderPendingExpressionIntent");
const renderEnd=app.indexOf("function renderExpressionIntentNote",renderStart);
const renderBlock=app.slice(renderStart,renderEnd);

assert("banner-has-explicit-dismiss",
  renderBlock.includes("expressionIntentDismiss")&&
  renderBlock.includes("그만두기")&&
  renderBlock.includes("dismissPendingExpressionIntent")
);

assert("selection-trace-keeps-answer-out",
  imagination.includes('deps.recordExpressionTrace("VERIFIED_ASK_EXPRESSION_SELECTED"')&&
  !imagination.includes('recordExpressionTrace("VERIFIED_ASK_EXPRESSION_SELECTED",{answer:')&&
  !imagination.includes('deps.recordExpressionTrace("VERIFIED_ASK_EXPRESSION_SELECTED",{answer:')
);

assert("attach-trace-is-new-session-only",
  flow.includes('if(created){const pending=await store.get("pendingExpressionIntent")')&&
  flow.includes('deps.recordExpressionTrace("VERIFIED_ASK_EXPRESSION_ATTACHED"')
);

assert("bilingual-trace-has-no-fragment-content",
  app.includes('recordExpressionTrace("BILINGUAL_EXPRESSION_BRIDGE_SHOWN"')&&
  app.includes("fragmentCount:Array.isArray(result.phraseFragments)?result.phraseFragments.length:0")&&
  !app.includes('recordExpressionTrace("BILINGUAL_EXPRESSION_BRIDGE_SHOWN",{phraseFragments')
);

console.log("EXPRESSION_TRACE_AND_DISMISS_PASS");
