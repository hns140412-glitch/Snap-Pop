(() => {
  "use strict";

  const VERSION="2026.09.21-b";
  const TIMEOUT_MS=18000;

  function cleanText(value,max=1200){
    return typeof value==="string" ? value.trim().slice(0,max) : "";
  }

  async function askVerified(payload={}){
    const input=cleanText(payload.input,1200);
    if(!input) throw new Error("KNOWLEDGE_EMPTY_INPUT");

    const backend=
      (window.SnapPopKnowledgeBackend && typeof window.SnapPopKnowledgeBackend.ask==="function")
        ? window.SnapPopKnowledgeBackend
        : null;

    if(!backend) throw new Error("KNOWLEDGE_BACKEND_UNAVAILABLE");

    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort("timeout"),TIMEOUT_MS);
    try{
      const raw=await backend.ask({
        input,
        language:payload.language==="en"?"en":"ko",
        questionLens:typeof payload.questionLens==="string"?payload.questionLens:"CONCEPT",
        context:payload.context||null,
        signal:controller.signal,
        contract:{
          version:"SNAP_POP_KNOWLEDGE_V1",
          responseOwner:"EXPLORATION_CREW",
          truthFirst:true,
          noGuessing:true,
          claimEvidenceRequired:true,
          verifiedRequiresEvidence:true
        }
      });

      const guard=window.SnapPopTruthGuard;
      if(!guard||typeof guard.guardKnowledge!=="function"){
        return {
          ...(raw||{}),
          verified:false,
          verification:{mode:"UNVERIFIED",reason:"TRUTH_GUARD_UNAVAILABLE"},
          provider:raw?.provider||"knowledge-backend"
        };
      }
      return guard.guardKnowledge({
        ...(raw||{}),
        provider:raw?.provider||"knowledge-backend"
      });
    } finally {
      clearTimeout(timer);
    }
  }

  window.SnapPopKnowledge=Object.freeze({
    version:VERSION,
    askVerified
  });
})();