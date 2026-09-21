(() => {
  "use strict";

  const VERSION="2026.09.21-a";

  function clean(value,max=240){
    return typeof value==="string"?value.trim().slice(0,max):"";
  }

  function assertFragment(value){
    const text=clean(value,90);
    if(!text) throw new Error("EXPRESSION_BRIDGE_EMPTY_FRAGMENT");
    if(/[.!?。！？]\s*$/.test(text)) throw new Error("EXPRESSION_BRIDGE_FULL_SENTENCE_FRAGMENT");
    const tokens=text.split(/\s+/).filter(Boolean);
    if(tokens.length>8) throw new Error("EXPRESSION_BRIDGE_FRAGMENT_TOO_LONG");
    return text;
  }

  function assertAssemblyPrompt(value){
    const text=clean(value,180);
    if(!text) throw new Error("EXPRESSION_BRIDGE_MISSING_PROMPT");
    if(/\r|\n/.test(text)) throw new Error("EXPRESSION_BRIDGE_MULTI_PROMPT");
    const marks=(text.match(/[?？]/g)||[]).length;
    if(marks!==1||!/[?？]$/.test(text)) throw new Error("EXPRESSION_BRIDGE_MULTI_PROMPT");
    return text;
  }

  function sanitize(raw={}){
    if(!raw||typeof raw!=="object") throw new Error("EXPRESSION_BRIDGE_INVALID_OUTPUT");
    const fragments=Array.isArray(raw.phraseFragments)
      ? raw.phraseFragments.slice(0,4).map(assertFragment)
      : [];
    if(!fragments.length) throw new Error("EXPRESSION_BRIDGE_NO_FRAGMENTS");
    return {
      kind:"MEANING_PRESERVING_EXPRESSION_BRIDGE",
      meaningAnchor:clean(raw.meaningAnchor,220)||null,
      phraseFragments:fragments,
      assemblyPrompt:assertAssemblyPrompt(raw.assemblyPrompt),
      sourceLanguage:raw.sourceLanguage==="en"?"en":"ko",
      targetLanguage:raw.targetLanguage==="ko"?"ko":"en",
      childAuthorship:true,
      autoInsertAllowed:false,
      finalSentenceProvided:false,
      provider:clean(raw.provider,80)||"expression-bridge"
    };
  }

  async function bridge(payload={}){
    const draft=clean(payload.draft,6000);
    if(!draft) throw new Error("EXPRESSION_BRIDGE_EMPTY_DRAFT");
    const sourceLanguage=payload.sourceLanguage==="en"?"en":"ko";
    const targetLanguage=payload.targetLanguage==="ko"?"ko":"en";
    if(sourceLanguage===targetLanguage) throw new Error("EXPRESSION_BRIDGE_SAME_LANGUAGE");

    const backend=window.SnapPopExpressionBridgeBackend;
    if(!backend||typeof backend.bridge!=="function") throw new Error("EXPRESSION_BRIDGE_PROVIDER_UNAVAILABLE");

    const raw=await backend.bridge({
      draft,
      sourceLanguage,
      targetLanguage,
      vocabularyMaterial:payload.vocabularyMaterial||null,
      contract:{
        mode:"MEANING_FIRST_PHRASE_HELP",
        childAuthorship:true,
        preserveMeaning:true,
        noDraftOverwrite:true,
        noFinalSentence:true,
        phraseFragmentsOnly:true,
        maxFragments:4,
        oneAssemblyPrompt:true
      }
    });
    return sanitize(raw);
  }

  window.SnapPopExpressionBridge=Object.freeze({
    version:VERSION,
    bridge,
    sanitize
  });
})();