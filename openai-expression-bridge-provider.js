(() => {
  "use strict";

  const VERSION="2026.09.21-a";
  const ENDPOINT="/api/snap-pop-expression-bridge";
  const TIMEOUT_MS=18000;

  function clean(value,max=240){
    return typeof value==="string"?value.trim().slice(0,max):"";
  }

  function cleanVocabulary(material){
    if(!material||typeof material!=="object") return null;
    const word=clean(material.word,120);
    if(!word) return null;
    return {
      contract_version:"SNAP_POP_VOCABULARY_MATERIAL_V1",
      sourceOwner:clean(material.sourceOwner,40)||"EXTERNAL_HANDOFF",
      role:"EXPRESSION_MATERIAL_ONLY",
      word,
      context:clean(material.context,360)||null,
      optional:true,
      autoInsertAllowed:false,
      masteryMutationAllowed:false,
      vocabularyOwnershipTransferred:false,
      doNotInferMastery:true
    };
  }

  async function bridge(payload={}){
    const draft=clean(payload.draft,6000);
    if(!draft) throw new Error("EXPRESSION_BRIDGE_EMPTY_DRAFT");

    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort("timeout"),TIMEOUT_MS);
    try{
      const response=await fetch(ENDPOINT,{
        method:"POST",
        headers:{"content-type":"application/json","accept":"application/json"},
        credentials:"same-origin",
        signal:controller.signal,
        body:JSON.stringify({
          contract_version:"SNAP_POP_EXPRESSION_BRIDGE_V1",
          draft,
          source_language:payload.sourceLanguage==="en"?"en":"ko",
          target_language:payload.targetLanguage==="ko"?"ko":"en",
          vocabulary_material:cleanVocabulary(payload.vocabularyMaterial)
        })
      });
      const data=await response.json().catch(()=>null);
      if(!response.ok) throw new Error(data?.error||`EXPRESSION_BRIDGE_HTTP_${response.status}`);
      if(!data||typeof data.bridge!=="object") throw new Error("EXPRESSION_BRIDGE_INVALID_RESPONSE");
      return {...data.bridge,provider:"openai-expression-bridge-secure"};
    } finally {
      clearTimeout(timer);
    }
  }

  window.SnapPopExpressionBridgeBackend=Object.freeze({
    version:VERSION,
    endpoint:ENDPOINT,
    bridge
  });
})();