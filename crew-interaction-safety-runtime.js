(() => {
  "use strict";

  const VERSION="2026.09.21-a";

  const DIRECTED_HARM=[
    /(너는|넌|네가)\s*(바보|멍청|한심|형편없)/i,
    /왜\s*(이것도|그것도)\s*못/i,
    /(또|계속)\s*틀렸/i,
    /you\s+(are|'re)\s+(stupid|dumb|pathetic|terrible)/i,
    /you\s+can't\s+even/i,
    /wrong\s+again/i
  ];

  const WRITING_GRADING=[
    /(몇\s*점|100점|백점|A\+|등급|채점)/i,
    /\b(score|grade|a\+)\b/i
  ];

  const OVERPRAISE=[
    /(너|넌|네가).*(천재|완벽|최고)/i,
    /(천재야|완벽해|최고야|역시\s*천재)/i,
    /you('re| are).*(a genius|perfect|the best)/i,
    /\bgenius!+|perfect!+|best ever\b/i
  ];

  function clean(value,max=800){
    return typeof value==="string"?value.trim().slice(0,max):"";
  }

  function firstMatch(text,patterns){
    return patterns.find(re=>re.test(text))||null;
  }

  function inspect(text,{mode="GENERAL"}={}){
    const value=clean(text);
    if(!value) return {safe:true,reason:null};

    if(firstMatch(value,DIRECTED_HARM)){
      return {safe:false,reason:"CHILD_DIRECTED_MOCK_OR_DEFICIT"};
    }

    if(mode==="WRITING_PROMPT"||mode==="CHILD_REACTION"){
      if(firstMatch(value,WRITING_GRADING)){
        return {safe:false,reason:"GRADING_LANGUAGE"};
      }
      if(firstMatch(value,OVERPRAISE)){
        return {safe:false,reason:"OVERPRAISE_LANGUAGE"};
      }
    }

    return {safe:true,reason:null};
  }

  function assertSafe(text,options={}){
    const result=inspect(text,options);
    if(!result.safe){
      const error=new Error("CREW_INTERACTION_UNSAFE_"+result.reason);
      error.reason=result.reason;
      throw error;
    }
    return clean(text);
  }

  function safeReaction(text,{language="ko"}={}){
    const result=inspect(text,{mode:"CHILD_REACTION"});
    if(result.safe) return clean(text);
    return language==="en"
      ?"Let’s look at just one small piece together."
      :"작은 한 조각만 같이 보자.";
  }

  window.SnapPopCrewInteractionSafety=Object.freeze({
    version:VERSION,
    inspect,
    assertSafe,
    safeReaction
  });
})();