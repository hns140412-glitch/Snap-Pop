(() => {
  "use strict";

  const VERSION="2026.09.21-a";
  const FORBIDDEN_KEYS=new Set([
    "finalDraft","final_draft","rewrite","rewrittenText","rewritten_text",
    "suggestedSentence","suggested_sentence","completedText","completed_text",
    "fullAnswer","full_answer","modelDraft","model_draft"
  ]);

  function clean(value,max=600){
    return typeof value==="string"?value.trim().slice(0,max):"";
  }

  function hasForbiddenKeyDeep(value,depth=0){
    if(depth>5||value===null||typeof value!=="object") return false;
    if(Array.isArray(value)) return value.some(x=>hasForbiddenKeyDeep(x,depth+1));
    for(const [key,item] of Object.entries(value)){
      if(FORBIDDEN_KEYS.has(key)) return true;
      if(hasForbiddenKeyDeep(item,depth+1)) return true;
    }
    return false;
  }

  function assertWritingAssist(raw={}){
    if(!raw||typeof raw!=="object") throw new Error("AUTHORSHIP_INVALID_OUTPUT");
    if(hasForbiddenKeyDeep(raw)) throw new Error("AUTHORSHIP_FINAL_TEXT_FORBIDDEN");
    const q=clean(raw.question,180);
    if(!q) throw new Error("AUTHORSHIP_NEXT_MOVE_REQUIRED");
    const marks=(q.match(/[?？]/g)||[]).length;
    if(marks!==1||!/[?？]$/.test(q)||/\r|\n/.test(q)) throw new Error("AUTHORSHIP_ONE_NEXT_MOVE_ONLY");
    const h=clean(raw.hint,180);
    if(/[?？]/.test(h)) throw new Error("AUTHORSHIP_HINT_MUST_NOT_ASK");
    return true;
  }

  function assertExpressionBridge(raw={}){
    if(!raw||typeof raw!=="object") throw new Error("AUTHORSHIP_INVALID_OUTPUT");
    if(hasForbiddenKeyDeep(raw)) throw new Error("AUTHORSHIP_FINAL_TEXT_FORBIDDEN");
    const fragments=Array.isArray(raw.phraseFragments)?raw.phraseFragments:[];
    if(!fragments.length||fragments.length>4) throw new Error("AUTHORSHIP_FRAGMENT_COUNT_INVALID");
    for(const fragment of fragments){
      const text=clean(fragment,90);
      if(!text) throw new Error("AUTHORSHIP_EMPTY_FRAGMENT");
      if(/[.!?。！？]\s*$/.test(text)) throw new Error("AUTHORSHIP_COMPLETE_SENTENCE_FORBIDDEN");
      if(text.split(/\s+/).filter(Boolean).length>8) throw new Error("AUTHORSHIP_FRAGMENT_TOO_LONG");
    }
    return true;
  }

  function transitionPayload({question="",language="ko",coverage=""}={}){
    const q=clean(question,1200);
    if(!q) throw new Error("AUTHORSHIP_TRANSITION_QUESTION_REQUIRED");
    return Object.freeze({
      source:"VERIFIED_ASK",
      question:q,
      language:language==="en"?"en":"ko",
      answerTransferred:false,
      draftTransferred:false,
      verifiedCoverage:clean(coverage,80)||null
    });
  }

  window.SnapPopAuthorshipGuard=Object.freeze({
    version:VERSION,
    hasForbiddenKeyDeep,
    assertWritingAssist,
    assertExpressionBridge,
    transitionPayload
  });
})();