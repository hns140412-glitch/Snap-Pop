(() => {
  "use strict";

  const VERSION="2026.09.21-c";
  const ENDPOINT="/api/snap-pop-semantic-writing";
  const TIMEOUT_MS=18000;
  const LENSES=new Set(["idea","emotion","description","viewpoint","final"]);

  function cleanText(value,max){
    return typeof value==="string" ? value.trim().slice(0,max) : "";
  }

  function cleanVocabularyMaterial(material){
    if(!material||typeof material!=="object") return null;
    const word=cleanText(material.word,120);
    if(!word) return null;
    return {
      contract_version:"SNAP_POP_VOCABULARY_MATERIAL_V1",
      sourceOwner:cleanText(material.sourceOwner,40)||"EXTERNAL_HANDOFF",
      role:"EXPRESSION_MATERIAL_ONLY",
      word,
      context:cleanText(material.context,360)||null,
      optional:true,
      autoInsertAllowed:false,
      masteryMutationAllowed:false,
      vocabularyOwnershipTransferred:false,
      doNotInferMastery:true
    };
  }

  function cleanContext(ctx){
    if(!ctx||typeof ctx!=="object") return null;
    const list=v=>Array.isArray(v)?v.filter(x=>typeof x==="string").slice(0,8):[];
    return {
      source:cleanText(ctx.source,80),
      subject:cleanText(ctx.subject,80),
      concept_skill_target:cleanText(ctx.concept_skill_target,180),
      activity_types:list(ctx.activity_types),
      cognitive_load_profile:list(ctx.cognitive_load_profile),
      confidence:Number.isFinite(ctx.confidence)?Math.max(0,Math.min(1,ctx.confidence)):null,
      unresolved_flags:list(ctx.unresolved_flags)
    };
  }

  async function analyzeWriting(payload={}){
    const draft=cleanText(payload.draft,6000);
    if(!draft) throw new Error("OPENAI_SEMANTIC_EMPTY_DRAFT");

    const controller=new AbortController();
    const outerSignal=payload.signal;
    const relay=()=>controller.abort("outer-abort");
    if(outerSignal){
      if(outerSignal.aborted)controller.abort("outer-abort");
      else outerSignal.addEventListener("abort",relay,{once:true});
    }
    const timer=setTimeout(()=>controller.abort("timeout"),TIMEOUT_MS);
    try{
      const response=await fetch(ENDPOINT,{
        method:"POST",
        headers:{"content-type":"application/json","accept":"application/json"},
        credentials:"same-origin",
        signal:controller.signal,
        body:JSON.stringify({
          contract_version:"SNAP_POP_SEMANTIC_WRITING_V1",
          draft,
          previousSnapshot:cleanText(payload.previousSnapshot,6000),
          landmark:LENSES.has(payload.landmark)?payload.landmark:"idea",
          step:Math.max(0,Math.min(2,Number(payload.step)||0)),
          language:payload.language==="en"?"en":"ko",
          learnerContext:cleanContext(payload.learnerContext),
          vocabularyMaterial:cleanVocabularyMaterial(payload.vocabularyMaterial)
        })
      });
      const data=await response.json().catch(()=>null);
      if(!response.ok) throw new Error(data?.error||`OPENAI_SEMANTIC_HTTP_${response.status}`);
      if(!data||typeof data.analysis!=="object") throw new Error("OPENAI_SEMANTIC_INVALID_RESPONSE");
      return {...data.analysis,provider:"openai-semantic-writing-secure"};
    } finally {
      clearTimeout(timer);
      if(outerSignal)outerSignal.removeEventListener("abort",relay);
    }
  }

  window.SnapPopOpenAIProvider=Object.freeze({
    version:VERSION,
    endpoint:ENDPOINT,
    analyzeWriting
  });
})();