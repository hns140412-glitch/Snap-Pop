import fs from "node:fs";
import vm from "node:vm";

const runtimeSource=fs.readFileSync(new URL("../expression-bridge-runtime.js",import.meta.url),"utf8");
const providerSource=fs.readFileSync(new URL("../openai-expression-bridge-provider.js",import.meta.url),"utf8");
const serverSource=fs.readFileSync(new URL("../netlify/functions/snap-pop-expression-bridge.mjs",import.meta.url),"utf8");
const appSource=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
const bridgeController=fs.readFileSync(new URL("../bridge-context-controller.js",import.meta.url),"utf8");
const indexSource=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const netlifySource=fs.readFileSync(new URL("../netlify.toml",import.meta.url),"utf8");

const window={};
vm.runInNewContext(runtimeSource,{window,Object,Array,String,Number,Math,Error,RegExp});
const b=window.SnapPopExpressionBridge;

function assert(name,condition){
  if(!condition) throw new Error("FAIL "+name);
  console.log("PASS",name);
}

const valid=b.sanitize({
  meaningAnchor:"친구와 새로운 곳을 찾아보고 싶은 마음",
  phraseFragments:["want to explore","with my friend","a new place"],
  assemblyPrompt:"이 조각들 중 네 뜻에 맞는 걸 골라 직접 이어볼까?",
  sourceLanguage:"ko",
  targetLanguage:"en"
});

assert("valid-fragments-pass",
  valid.phraseFragments.length===3&&valid.finalSentenceProvided===false&&valid.autoInsertAllowed===false
);

let sentenceBlocked=false;
try{
  b.sanitize({
    phraseFragments:["I want to explore."],
    assemblyPrompt:"직접 이어볼까?",
    sourceLanguage:"ko",
    targetLanguage:"en"
  });
}catch(error){
  sentenceBlocked=error?.message==="EXPRESSION_BRIDGE_FULL_SENTENCE_FRAGMENT";
}
assert("complete-sentence-fragment-blocked",sentenceBlocked);

let longBlocked=false;
try{
  b.sanitize({
    phraseFragments:["one two three four five six seven eight nine"],
    assemblyPrompt:"직접 이어볼까?",
    sourceLanguage:"ko",
    targetLanguage:"en"
  });
}catch(error){
  longBlocked=error?.message==="EXPRESSION_BRIDGE_FRAGMENT_TOO_LONG";
}
assert("long-fragment-blocked",longBlocked);

let promptBlocked=false;
try{
  b.sanitize({
    phraseFragments:["want to explore"],
    assemblyPrompt:"이걸 쓸까? 저걸 쓸까?",
    sourceLanguage:"ko",
    targetLanguage:"en"
  });
}catch(error){
  promptBlocked=error?.message==="EXPRESSION_BRIDGE_MULTI_PROMPT";
}
assert("question-flooding-blocked",promptBlocked);

assert("provider-is-same-origin",
  providerSource.includes('const ENDPOINT="/api/snap-pop-expression-bridge"')&&
  providerSource.includes('credentials:"same-origin"')
);
assert("server-forbids-final-sentence",
  serverSource.includes("Do not provide a final sentence")&&
  serverSource.includes("The child must assemble the final expression.")
);
assert("server-preserves-vocabulary-ownership",
  serverSource.includes("Never auto-insert it")&&
  serverSource.includes("never infer mastery")&&
  serverSource.includes("never transfer vocabulary ownership")
);
assert("route-is-configured",
  netlifySource.includes('/api/snap-pop-expression-bridge')&&
  netlifySource.includes('/.netlify/functions/snap-pop-expression-bridge')
);
assert("ui-requires-explicit-button",
  indexSource.includes('id="expressionBridgeBtn"')&&
  bridgeController.includes('btn.onclick=runExpressionBridge')
);

const start=bridgeController.indexOf("async function runExpressionBridge()");
const end=bridgeController.indexOf("function currentBridgeContext",start);
const block=bridgeController.slice(start,end);
assert("bridge-does-not-overwrite-draft",
  start>=0&&end>start&&!block.includes('q("#answer").value=')
);
assert("bridge-stale-draft-guard",
  block.includes('q("#answer").value.trim()!==draft')
);

console.log("EXPRESSION_BRIDGE_CONTRACT_PASS");
