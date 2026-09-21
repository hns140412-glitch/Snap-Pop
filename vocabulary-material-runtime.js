(() => {
  "use strict";

  const VERSION="2026.09.21-b";

  function clean(value,max=240){
    return typeof value==="string"?value.trim().slice(0,max):"";
  }

  function normalizeSource(fromApp=""){
    const key=clean(fromApp,80).toLowerCase().replace(/[_\s]+/g,"-");
    if(key.includes("hide")&&key.includes("seek")) return "HIDE_SEEK";
    return "EXTERNAL_HANDOFF";
  }

  function normalize(input={}){
    const word=clean(input.word,120);
    if(!word) return null;
    const sourceOwner=normalizeSource(input.from_app||input.fromApp||"");
    return Object.freeze({
      contract_version:"SNAP_POP_VOCABULARY_MATERIAL_V1",
      sourceOwner,
      role:"EXPRESSION_MATERIAL_ONLY",
      word,
      context:clean(input.word_context||input.wordContext,360)||null,
      optional:true,
      autoInsertAllowed:false,
      masteryMutationAllowed:false,
      vocabularyOwnershipTransferred:false,
      doNotInferMastery:true
    });
  }

  function escapeRegExp(value=""){
    return value.replace(/[.*+?^$()|[\]\\]/g,"\\$&");
  }

  function usedInText(material,text=""){
    if(!material?.word||typeof text!=="string") return false;
    const word=material.word;
    if(/^[A-Za-z0-9'’-]+$/.test(word)){
      const re=new RegExp("(^|[^A-Za-z0-9'’-])"+escapeRegExp(word)+"(?=$|[^A-Za-z0-9'’-])","i");
      return re.test(text);
    }
    return text.includes(word);
  }

  function usageEvidence(material,text=""){
    if(!material) return null;
    return {
      sourceOwner:material.sourceOwner,
      role:"EXPRESSION_MATERIAL_ONLY",
      offeredWord:material.word,
      usedInDraft:usedInText(material,text),
      masteryInferred:false,
      vocabularyOwnershipTransferred:false
    };
  }

  function writingContext(material){
    if(!material||material.contract_version!=="SNAP_POP_VOCABULARY_MATERIAL_V1") return null;
    return {
      contract_version:material.contract_version,
      sourceOwner:material.sourceOwner,
      role:"EXPRESSION_MATERIAL_ONLY",
      word:clean(material.word,120),
      context:clean(material.context,360)||null,
      optional:true,
      autoInsertAllowed:false,
      masteryMutationAllowed:false,
      vocabularyOwnershipTransferred:false,
      doNotInferMastery:true
    };
  }

  window.SnapPopVocabularyMaterial=Object.freeze({
    version:VERSION,
    normalize,
    writingContext,
    usedInText,
    usageEvidence
  });
})();