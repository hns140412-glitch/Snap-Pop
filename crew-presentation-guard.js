(() => {
  "use strict";

  const VERSION="2026.09.21-c";
  const SELF_IDENTITY_PATTERNS=[
    /\b(as an? ai|i am an? ai|i'm an? ai|as chatgpt|i am chatgpt|i'm chatgpt|openai assistant|system message|developer message)\b/i,
    /(저는|나는)\s*(AI|인공지능|ChatGPT|OpenAI)/i,
    /(시스템|개발자)\s*(메시지|지침)/i
  ];

  function cleanText(value,max=1800){
    return typeof value==="string"?value.trim().slice(0,max):"";
  }

  function hasSelfIdentityLeak(value){
    const text=cleanText(value,2400);
    return !!text&&SELF_IDENTITY_PATTERNS.some(re=>re.test(text));
  }

  function cleanNode(node={}){
    if(!node||typeof node!=="object") return null;
    const label=cleanText(node.label,80);
    const value=cleanText(node.value,500);
    if(!label&&!value) return null;
    if(hasSelfIdentityLeak(label)||hasSelfIdentityLeak(value)) throw new Error("CREW_PRESENTATION_IDENTITY_LEAK");
    return {label,value};
  }

  function genericTitle(result={},language="ko"){
    const en=language==="en";
    if(result.kind==="ASK_UNDERSTAND"){
      if(result.verified===true) return en?"I checked this for you":"확인해서 정리했어";
      return en?"Let’s start with what is confirmed":"확인된 부분부터 볼게";
    }
    return en?"Let’s think about it together":"같이 생각해보자";
  }

  function sanitizeUserFacing(result={},options={}){
    if(!result||typeof result!=="object") throw new Error("CREW_PRESENTATION_INVALID_RESULT");

    const language=options.language==="en"||result.presentationLanguage==="en"?"en":"ko";
    const core=cleanText(result.core,1800);
    const example=cleanText(result.example,700);
    const speakable=cleanText(result.speakable||result.core,1400);

    if(hasSelfIdentityLeak(core)||hasSelfIdentityLeak(example)||hasSelfIdentityLeak(speakable)){
      throw new Error("CREW_PRESENTATION_IDENTITY_LEAK");
    }

    const nodes=Array.isArray(result.nodes)
      ? result.nodes.slice(0,8).map(cleanNode).filter(Boolean)
      : [];

    const next={
      ...result,
      title:genericTitle(result,language),
      presentationLanguage:language,
      core,
      example:example||null,
      speakable,
      nodes,
      responseOwner:"EXPLORATION_CREW",
      presentationGuardVersion:VERSION
    };

    delete next.system;
    delete next.system_message;
    delete next.developer;
    delete next.developer_message;
    delete next.model;
    delete next.model_name;
    delete next.provider_label;
    delete next.raw;
    delete next.raw_response;
    delete next.tool_output;

    return next;
  }

  function publicHistoryEntry(result={},options={}){
    const safe=sanitizeUserFacing(result,options);
    return {
      intent:safe.intent||safe.kind||null,
      verified:safe.verified!==false,
      title:safe.title,
      core:safe.core,
      nodes:safe.nodes,
      example:safe.example
    };
  }

  window.SnapPopCrewPresentationGuard=Object.freeze({
    version:VERSION,
    sanitizeUserFacing,
    publicHistoryEntry,
    hasSelfIdentityLeak
  });
})();