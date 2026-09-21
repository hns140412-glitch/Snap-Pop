(() => {
  "use strict";

  const VERSION="2026.09.21-a";
  const FORBIDDEN_IDENTITY=/\b(openai|chatgpt|gpt[-_ ]?\d*|assistant|system|developer|provider|model|api)\b/ig;

  function cleanText(value,max=1600){
    return typeof value==="string"?value.trim().slice(0,max):"";
  }

  function stripIdentity(value,max=1600){
    const text=cleanText(value,max);
    if(!text) return "";
    return text
      .replace(FORBIDDEN_IDENTITY,"")
      .replace(/\s{2,}/g," ")
      .replace(/^[\s:·\-]+|[\s:·\-]+$/g,"")
      .trim();
  }

  function sanitizeNode(node={}){
    if(!node||typeof node!=="object") return null;
    const label=stripIdentity(node.label,80);
    const value=stripIdentity(node.value,500);
    if(!label&&!value) return null;
    return {label,value};
  }

  function sanitizeUserFacing(result={}){
    const next={...result};

    next.title=stripIdentity(result.title,160)||"상상 구름";
    next.core=stripIdentity(result.core,1800);
    next.example=stripIdentity(result.example,700)||null;
    next.speakable=stripIdentity(result.speakable||result.core,1400);

    if(Array.isArray(result.nodes)){
      next.nodes=result.nodes.slice(0,8).map(sanitizeNode).filter(Boolean);
    }

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

    next.responseOwner="EXPLORATION_CREW";
    next.presentationGuardVersion=VERSION;

    return next;
  }

  function publicHistoryEntry(result={}){
    return {
      intent:result.intent||result.kind||null,
      verified:result.verified!==false,
      title:stripIdentity(result.title,160),
      core:stripIdentity(result.core,1800),
      nodes:Array.isArray(result.nodes)
        ? result.nodes.slice(0,8).map(sanitizeNode).filter(Boolean)
        : [],
      example:stripIdentity(result.example,700)
    };
  }

  window.SnapPopCrewPresentationGuard=Object.freeze({
    version:VERSION,
    sanitizeUserFacing,
    publicHistoryEntry
  });
})();