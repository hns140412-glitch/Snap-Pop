import fs from "node:fs";

const writing=fs.readFileSync(new URL("../writing-runtime.js",import.meta.url),"utf8");
const semantic=fs.readFileSync(new URL("../semantic-writing-runtime.js",import.meta.url),"utf8");
const server=fs.readFileSync(new URL("../netlify/functions/snap-pop-semantic-writing.mjs",import.meta.url),"utf8");
const app=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
const controller=fs.readFileSync(new URL("../writing-controller.js",import.meta.url),"utf8");
const flow=fs.readFileSync(new URL("../writing-flow-controller.js",import.meta.url),"utf8");
const support=fs.readFileSync(new URL("../interaction-support-controller.js",import.meta.url),"utf8");

function assert(name,condition){
  if(!condition) throw new Error("FAIL "+name);
  console.log("PASS",name);
}

assert("semantic-analysis-requires-current-draft",
  semantic.includes('const draft=cleanText(payload.draft,6000)')&&
  semantic.includes('if(!draft) throw new Error("SEMANTIC_EMPTY_DRAFT")')
);

assert("provider-receives-current-and-previous-draft-state",
  writing.includes('draft:(payload.draft||"").slice(0,6000)')&&
  writing.includes('previousSnapshot:(payload.previousSnapshot||"").slice(0,6000)')
);

assert("semantic-cancellation-signal-reaches-provider",
  support.includes("signal:controller.signal")&&
  writing.includes("signal:payload.signal||null")&&
  semantic.includes("signal:payload.signal||null")
);

assert("server-explicitly-analyzes-current-draft-semantically",
  server.includes("Analyze the CURRENT draft semantically")&&
  server.includes("Choose the single most useful next move")
);

assert("five-landmarks-are-lenses-not-minigames",
  server.includes("Treat the five landmarks as writing lenses, not mini-games.")&&
  writing.includes('const LENS=["idea","emotion","description","viewpoint","final"]')
);

assert("cross-lens-suggestion-is-optional-one-lens",
  writing.includes("suggestedLens")&&
  semantic.includes('suggestedLens:"optional one lens"')&&
  controller.includes("필요하면")&&controller.includes("관점으로도 한 번 볼 수 있어")
);

assert("one-next-move-is-enforced-client-side",
  semantic.includes("assertSingleNextMove")&&
  semantic.includes("SEMANTIC_HINT_MUST_NOT_ASK")
);

assert("one-next-move-is-enforced-server-side",
  server.includes("Return exactly one next-move prompt and at most one tiny hint.")&&
  server.includes("OPENAI_SEMANTIC_MULTI_PROMPT_REJECTED")&&
  server.includes("OPENAI_SEMANTIC_HINT_QUESTION_REJECTED")
);

assert("semantic-upstream-has-bounded-timeout-and-fail-closed-errors",
  server.includes("UPSTREAM_TIMEOUT_MS=15000")&&
  server.includes("controller.abort()")&&
  server.includes("OPENAI_SEMANTIC_UPSTREAM_TIMEOUT")&&
  server.includes("OPENAI_SEMANTIC_UPSTREAM_UNAVAILABLE")
);

assert("live-result-applies-only-if-draft-step-and-dom-still-match",
  support.includes("if(cur.draft!==draft||Math.min(2,cur.step||0)!==step)return null")&&
  support.includes("if(q('#answer').value!==draft)return null")
);

assert("crew-reaction-is-derived-from-current-analysis",
  flow.includes("const move=await deps.analyzeWritingMove(cur);if(!move)return;")&&
  flow.includes("deps.stepSpecificReaction(cur.draft")
);

assert("authorship-guard-prevents-draft-rewrite",
  semantic.includes("SnapPopAuthorshipGuard")&&
  server.includes("do not rewrite the draft")&&
  server.includes("do not supply a completed sentence")
);

console.log("WRITING_SEMANTIC_CONTRACT_PASS");
