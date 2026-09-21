(() => {
  "use strict";

  const VERSION="2026.09.21-a";
  const LENSES=new Set(["idea","emotion","description","viewpoint","final"]);
  const FORBIDDEN_KEYS=new Set([
    "finalDraft","final_draft","rewrite","rewrittenText","rewritten_text",
    "suggestedSentence","suggested_sentence","completedText","completed_text",
    "answer","fullAnswer","full_answer"
  ]);

  function cleanText(value,max=180){
    return typeof value==="string" ? value.trim().slice(0,max) : "";
  }

  function sanitizeSignals(value){
    if(!value||typeof value!=="object") return null;
    const present=Array.isArray(value.present)?value.present.filter(x=>typeof x==="string").slice(0,8):[];
    const missing=Array.isArray(value.missing)?value.missing.filter(x=>typeof x==="string").slice(0,8):[];
    return {present,missing};
  }

  function sanitize(raw={}){
    for(const key of Object.keys(raw||{})){
      if(FORBIDDEN_KEYS.has(key)) delete raw[key];
    }
    const out={
      focus:cleanText(raw.focus,48)||null,
      question:cleanText(raw.question,180)||null,
      hint:cleanText(raw.hint,180)||null,
      suggestedLens:LENSES.has(raw.suggestedLens)?raw.suggestedLens:null,
      rationale:cleanText(raw.rationale,180)||null,
      confidence:Number.isFinite(raw.confidence)?Math.max(0,Math.min(1,raw.confidence)):null,
      semanticSignals:sanitizeSignals(raw.semanticSignals||raw.semantic_signals),
      grounded:raw.grounded!==false,
      factVerified:false,
      provider:cleanText(raw.provider,80)||"openai-semantic-writing"
    };
    return out;
  }

  async function analyzeWriting(payload={}){
    const draft=cleanText(payload.draft,6000);
    if(!draft) throw new Error("SEMANTIC_EMPTY_DRAFT");

    const backend=
      (window.SnapPopOpenAIProvider && typeof window.SnapPopOpenAIProvider.analyzeWriting==="function")
        ? window.SnapPopOpenAIProvider
        : (window.SnapPopSemanticBackend && typeof window.SnapPopSemanticBackend.analyzeWriting==="function")
          ? window.SnapPopSemanticBackend
          : null;

    if(!backend) throw new Error("SEMANTIC_PROVIDER_UNAVAILABLE");

    const raw=await backend.analyzeWriting({
      draft,
      previousSnapshot:cleanText(payload.previousSnapshot,6000),
      landmark:LENSES.has(payload.landmark)?payload.landmark:"idea",
      step:Math.max(0,Math.min(2,Number(payload.step)||0)),
      language:payload.language==="en"?"en":"ko",
      learnerContext:payload.learnerContext||null,
      contract:{
        mode:"ANALYSIS_ONLY",
        childAuthorship:true,
        preserveChildWording:true,
        oneNextMoveOnly:true,
        noFinalAnswerAuthoring:true,
        noRewrite:true,
        noSuggestedSentence:true,
        noGrading:true,
        noQuestionFlooding:true,
        returnShape:{
          focus:"short label",
          question:"one next-move prompt",
          hint:"one small hint",
          suggestedLens:"optional one lens",
          semanticSignals:{present:"array",missing:"array"},
          rationale:"short internal rationale",
          confidence:"0..1"
        }
      }
    });

    return sanitize(raw||{});
  }

  window.SnapPopSemanticWritingProvider=Object.freeze({
    version:VERSION,
    analyzeWriting
  });
})();