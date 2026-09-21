(() => {
  "use strict";

  const VERSION="2026.09.21-b";
  const MAX_ITEMS=4;

  const LABELS={
    ko:{
      MEANING:["뜻","예·연결"],
      ETYMOLOGY:["뿌리","의미 변화","이어진 말"],
      CAUSE_EFFECT:["원인","과정","결과"],
      MECHANISM:["시작","작동","이어짐","결과"],
      COMPARE:["공통","차이","왜 중요해?"],
      TIME_FLOW:["이전","사건·변화","이후"],
      PERSON_EVENT:["누구","한 일","영향"],
      PLACE_CONTEXT:["어디","특징","왜 중요해?"],
      CONCEPT:["핵심","연결","예"]
    },
    en:{
      MEANING:["Meaning","Example / connection"],
      ETYMOLOGY:["Root","Meaning change","Related word"],
      CAUSE_EFFECT:["Cause","Process","Result"],
      MECHANISM:["Start","How it works","Connection","Result"],
      COMPARE:["Shared","Different","Why it matters"],
      TIME_FLOW:["Before","Event / change","After"],
      PERSON_EVENT:["Who","Action","Impact"],
      PLACE_CONTEXT:["Where","Feature","Why it matters"],
      CONCEPT:["Core","Connection","Example"]
    }
  };

  function verifiedClaims(result={}){
    const claims=Array.isArray(result?.verification?.claims)?result.verification.claims:[];
    return claims
      .filter(x=>x&&x.status==="VERIFIED"&&typeof x.claim==="string"&&x.claim.trim())
      .slice(0,MAX_ITEMS)
      .map(x=>x.claim.trim());
  }

  function typeFor(lens){
    if(["CAUSE_EFFECT","MECHANISM","TIME_FLOW","PERSON_EVENT","PLACE_CONTEXT","ETYMOLOGY"].includes(lens)) return "FLOW";
    if(lens==="COMPARE") return "COMPARE";
    return "STACK";
  }

  function eligible(result={},lens="CONCEPT",claims=[]){
    if(!claims.length) return false;
    const type=typeFor(lens);
    if(type==="STACK") return true;
    const coverage=result?.verification?.coverage||"UNKNOWN";
    if(coverage!=="FULL_FACTUAL_CONTENT") return false;
    return claims.length>=2;
  }

  function build(result={},lens="CONCEPT",language="ko"){
    const claims=verifiedClaims(result);
    if(!eligible(result,lens,claims)) return null;

    const lang=language==="en"?"en":"ko";
    const labels=LABELS[lang][lens]||LABELS[lang].CONCEPT;
    const items=claims.map((claim,index)=>({
      label:labels[index]||labels[labels.length-1]||"",
      text:claim,
      source:"VERIFIED_CLAIM_VERBATIM"
    }));

    return Object.freeze({
      version:VERSION,
      type:typeFor(lens),
      lens,
      items,
      source:"VERIFIED_CLAIMS_ONLY",
      transformsFacts:false
    });
  }

  window.SnapPopMentalModel=Object.freeze({
    version:VERSION,
    build,
    eligible
  });
})();