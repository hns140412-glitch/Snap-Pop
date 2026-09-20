(() => {
  "use strict";
  const VERSION = "2026.09.21-a";
  function classifyIntent(input="") {
    const text = input.trim();
    if (!text) return "EMPTY";
    const questionLike = /[?？]$|^(왜|어떻게|뭐|무엇|누가|언제|어디|어느|몇|무슨|what|why|how|who|when|where|which|is |are |do |does |did )/i.test(text);
    const knowledgeCue = /(역사|조선|고려|신라|문화|사회|과학|우주|지구|나라|국가|전쟁|왕|대통령|경제|원리|어원|뜻|의미|유래|history|culture|science|society|etymology|meaning)/i.test(text);
    if (questionLike || knowledgeCue) return "ASK_UNDERSTAND";
    return "THINK_EXPRESS";
  }
  function localThinkScaffold(input="", language="ko") {
    const t=input.trim();
    if (language==="en") {
      return {kind:"THINK_EXPRESS",verified:true,provider:"local-scaffold",title:"Let’s shape the thought",core:t ? "Your starting thought: “"+t.slice(0,80)+(t.length>80?"…":"")+"”" : "Start with one small thought.",nodes:[
        {label:"Scene",value:"Where or when is it happening?"},
        {label:"Feeling",value:"What feeling is closest?"},
        {label:"Detail",value:"What can you see, hear, smell, touch, or notice?"},
        {label:"Connection",value:"Why does this matter to you?"}
      ],example:"Pick just one branch. You do not need to use all of them.",speakable:"Let’s catch one branch first. A scene, a feeling, a detail, or a reason—just one is enough."};
    }
    return {kind:"THINK_EXPRESS",verified:true,provider:"local-scaffold",title:"생각을 펼쳐보자",core:t ? "출발 생각 · “"+t.slice(0,80)+(t.length>80?"…":"")+"”" : "작은 생각 하나부터 잡아보자.",nodes:[
      {label:"장면",value:"언제·어디에서 일어난 걸까?"},
      {label:"마음",value:"가장 가까운 느낌은 뭐야?"},
      {label:"단서",value:"보이거나 들리거나 느껴지는 건 뭐야?"},
      {label:"연결",value:"왜 이 생각이 마음에 남았을까?"}
    ],example:"네 가지를 다 할 필요 없어. 지금 떠오르는 가지 하나만 잡으면 돼.",speakable:"장면, 마음, 단서, 이유 중에서 하나만 먼저 잡아보자."};
  }
  function unverifiedKnowledgeResponse(input="", language="ko") {
    if (language==="en") return {kind:"ASK_UNDERSTAND",verified:false,requiresKnowledgeProvider:true,provider:"none",title:"I should verify this before answering",core:"This looks like a factual question. I won’t guess.",nodes:[{label:"Question",value:input.trim()},{label:"Next",value:"Connect the verified knowledge/search provider, then explain the concept and evidence."}],example:"We can still keep your question here without inventing an answer.",speakable:"That needs a fact check. I won’t make up an answer."};
    return {kind:"ASK_UNDERSTAND",verified:false,requiresKnowledgeProvider:true,provider:"none",title:"확인하고 답해야 하는 질문이야",core:"사실이 필요한 질문으로 보여. 지금은 추측해서 답하지 않을게.",nodes:[{label:"궁금한 것",value:input.trim()},{label:"다음 단계",value:"검증 가능한 지식·검색 provider를 연결한 뒤 개념과 근거를 설명"}],example:"질문은 그대로 보존하고, 확인되지 않은 답은 만들지 않아.",speakable:"이건 사실 확인이 먼저 필요해. 모르는 걸 지어내서 답하지 않을게."};
  }
  async function ask(payload={}) {
    const input=(payload.input||"").trim();
    const language=payload.language==="en"?"en":"ko";
    const intent=payload.intent||classifyIntent(input);
    const external=window.SnapPopOpenAIProvider;
    if (external && typeof external.ask==="function") {
      const raw=await external.ask({...payload,input,language,intent,contract:{responseOwner:"EXPLORATION_CREW",truthFirst:true,noGuessing:true,conceptFirst:true,scaffoldPreferred:true}});
      return {...raw,provider:raw?.provider||"external",intent,external:true};
    }
    if (intent==="ASK_UNDERSTAND") return {...unverifiedKnowledgeResponse(input,language),intent};
    if (intent==="EMPTY") return localThinkScaffold("",language);
    return {...localThinkScaffold(input,language),intent};
  }
  window.SnapPopIntelligence=Object.freeze({version:VERSION,classifyIntent,ask});
})();