(() => {
  "use strict";

  const VERSION="2026.09.21-a";
  const ENDPOINT="/api/snap-pop-knowledge";
  const TIMEOUT_MS=18000;

  function cleanText(value,max=1200){
    return typeof value==="string"?value.trim().slice(0,max):"";
  }

  async function ask(payload={}){
    const input=cleanText(payload.input,1200);
    if(!input) throw new Error("OPENAI_KNOWLEDGE_EMPTY_INPUT");

    const controller=new AbortController();
    const outerSignal=payload.signal;
    const relay=()=>controller.abort("outer-abort");
    if(outerSignal){
      if(outerSignal.aborted) controller.abort("outer-abort");
      else outerSignal.addEventListener("abort",relay,{once:true});
    }

    const timer=setTimeout(()=>controller.abort("timeout"),TIMEOUT_MS);
    try{
      const response=await fetch(ENDPOINT,{
        method:"POST",
        headers:{
          "content-type":"application/json",
          "accept":"application/json"
        },
        credentials:"same-origin",
        signal:controller.signal,
        body:JSON.stringify({
          contract_version:"SNAP_POP_KNOWLEDGE_V1",
          input,
          language:payload.language==="en"?"en":"ko"
        })
      });

      const data=await response.json().catch(()=>null);
      if(!response.ok) throw new Error(data?.error||`OPENAI_KNOWLEDGE_HTTP_${response.status}`);
      if(!data||data.contract_version!=="SNAP_POP_KNOWLEDGE_V1"||typeof data.answer!=="object"){
        throw new Error("OPENAI_KNOWLEDGE_INVALID_RESPONSE");
      }
      return data.answer;
    } finally {
      clearTimeout(timer);
      if(outerSignal) outerSignal.removeEventListener("abort",relay);
    }
  }

  window.SnapPopKnowledgeBackend=Object.freeze({
    version:VERSION,
    endpoint:ENDPOINT,
    ask
  });
})();