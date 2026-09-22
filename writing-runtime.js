(() => {
  "use strict";
  const VERSION="2026.09.21-c";
  const ko={
    reason:/왜|이유|때문|그래서|그러니까|느낌|생각|마음/,
    sensory:/보이|봤|색|빛|소리|들리|냄새|향|맛|촉감|따뜻|차갑|거칠|부드럽|밝|어둡|풍경|장면/,
    emotion:/기쁘|슬프|속상|화나|무섭|걱정|설레|신나|답답|편안|긴장|놀라|마음|기분/,
    perspective:/나는|내가|친구|엄마|아빠|선생님|그 사람|다른 사람|상대|입장/,
    ending:/결국|그래서|마지막|끝|앞으로|나는 .*생각|나는 .*느꼈/
  };
  const en={
    reason:/because|so |reason|think|feel|why/i,
    sensory:/see|saw|look|color|light|hear|heard|sound|smell|taste|touch|warm|cold|rough|soft|bright|dark|scene/i,
    emotion:/happy|sad|angry|afraid|scared|worried|excited|nervous|surprised|feel|felt/i,
    perspective:/\bi\b|my |friend|mother|father|teacher|someone|other person|point of view/i,
    ending:/finally|in the end|so |next time|i think|i learned|i felt/i
  };
  function features(text="",language="ko"){const r=language==="en"?en:ko;return Object.fromEntries(Object.entries(r).map(([k,re])=>[k,re.test(text)]));}
  function sentenceCount(text=""){return (text.match(/[.!?。！？]|\n/g)||[]).length+(text.trim()?1:0)}
  function move({landmark="idea",step=0,draft="",language="ko"}={}){
    const t=(draft||"").trim(),f=features(t,language),n=sentenceCount(t),isEn=language==="en";
    if(!t)return isEn?
      {focus:"START",question:"What is the one thing you most want to say?",hint:"A word or one short sentence is enough."}:
      {focus:"START",question:"지금 제일 먼저 쓰고 싶은 한 가지가 뭐야?",hint:"단어나 짧은 한 문장이어도 충분해."};
    const koMove={
      idea:()=>!f.reason?{focus:"CONNECT",question:"지금 쓴 생각 뒤에 ‘왜 이게 떠올랐는지’ 한 가지만 붙여볼까?",hint:"설명 전체 말고 이유 하나만 붙여봐."}:n<3?{focus:"NEXT_SCENE",question:"이 다음에 이어질 장면이나 생각 하나만 붙여볼까?",hint:"다음에 일어난 일, 떠오른 생각 중 하나면 돼."}:{focus:"SHAPE",question:"지금 글에서 가장 살리고 싶은 한 문장을 중심으로 이어가볼까?",hint:"새 내용을 많이 넣기보다 중심을 잡아봐."},
      emotion:()=>!f.emotion?{focus:"FEELING",question:"이 장면에서 네 마음에 가장 가까운 느낌 하나만 넣어볼까?",hint:"감정 이름이 어려우면 몸의 느낌이나 행동으로 써도 돼."}:!f.reason?{focus:"WHY_FEEL",question:"그 마음이 생긴 이유를 한 장면으로 붙여볼까?",hint:"‘왜냐하면’이라고 쓰지 않아도 돼. 무슨 일이 있었는지만 적어도 돼."}:{focus:"CHANGE",question:"처음과 지금 마음이 달라졌다면 그 변화를 한 줄만 붙여볼까?",hint:"달라지지 않았다면 그대로인 이유를 써도 돼."},
      description:()=>!f.sensory?{focus:"SENSORY",question:"지금 장면에 눈·귀·코·손 중 하나의 단서만 더 넣어볼까?",hint:"오감을 다 쓰지 말고 가장 선명한 하나만 골라봐."}:{focus:"SPECIFIC",question:"지금 쓴 단서에서 더 구체적으로 보이는 한 부분만 붙여볼까?",hint:"색, 크기, 움직임, 소리의 느낌 중 하나면 돼."},
      viewpoint:()=>!f.perspective?{focus:"OWN_VIEW",question:"이 일에 대한 네 생각을 한 문장으로 먼저 넣어볼까?",hint:"맞고 틀림보다 ‘나는 이렇게 봤어’가 먼저야."}:step<2?{focus:"OTHER_VIEW",question:"같은 일을 다른 사람은 어떻게 봤을지 한 줄만 붙여볼까?",hint:"반대 의견일 필요는 없어. 다른 위치에서 본 모습이면 돼."}:!f.reason?{focus:"REASON",question:"두 시선을 보고도 네 생각이 남는 이유 하나를 붙여볼까?",hint:"근거 하나면 충분해."}:{focus:"POSITION",question:"이제 네 입장이 가장 잘 보이는 문장을 남겨볼까?",hint:"새 설명보다 네 생각을 선명하게 해봐."},
      final:()=>!f.ending?{focus:"ENDING",question:"이 글을 읽은 뒤 가장 남았으면 하는 생각으로 끝내볼까?",hint:"교훈을 억지로 만들지 말고 네가 실제로 남기고 싶은 말을 써봐."}:{focus:"REVISE",question:"지금 글에서 겹치거나 흐린 한 곳만 골라 더 분명하게 바꿔볼까?",hint:"전체를 다시 쓰지 말고 한 곳만 손봐."}
    };
    const enMove={
      idea:()=>!f.reason?{focus:"CONNECT",question:"Can you add one reason why this idea matters or came to mind?",hint:"One reason is enough."}:n<3?{focus:"NEXT_SCENE",question:"What is one thing that could come next?",hint:"Add one next event or thought."}:{focus:"SHAPE",question:"Which sentence is the heart of your idea? Build around that one.",hint:"Keep the center clear instead of adding lots more."},
      emotion:()=>!f.emotion?{focus:"FEELING",question:"Can you add one feeling that belongs in this moment?",hint:"You can show it through your body or action instead of naming it."}:!f.reason?{focus:"WHY_FEEL",question:"What happened that made you feel that way?",hint:"Add one small event, not a full explanation."}:{focus:"CHANGE",question:"Did the feeling change? Add one small change if it did.",hint:"If it stayed the same, say why."},
      description:()=>!f.sensory?{focus:"SENSORY",question:"Add just one sensory clue: something seen, heard, smelled, or felt.",hint:"Choose the clearest one. You do not need all five senses."}:{focus:"SPECIFIC",question:"Can you make one detail more specific?",hint:"Try color, size, movement, or the quality of a sound."},
      viewpoint:()=>!f.perspective?{focus:"OWN_VIEW",question:"What is your own view of this?",hint:"Start with what you think, not whether it is correct."}:step<2?{focus:"OTHER_VIEW",question:"How might one other person see the same thing?",hint:"It does not have to be the opposite view."}:!f.reason?{focus:"REASON",question:"What is one reason you still hold your view?",hint:"One reason is enough."}:{focus:"POSITION",question:"Can you leave one sentence that makes your position clear?",hint:"Make your view clear instead of adding more information."},
      final:()=>!f.ending?{focus:"ENDING",question:"What do you want the reader to remember at the end?",hint:"Use what you really want to leave behind, not a forced lesson."}:{focus:"REVISE",question:"Choose one unclear or repeated part and make only that part sharper.",hint:"Do not rewrite everything."}
    };
    const fn=(isEn?enMove:koMove)[landmark]||(isEn?enMove.idea:koMove.idea);
    return {...fn(),features:f,sentenceCount:n};
  }
  const LENS=["idea","emotion","description","viewpoint","final"];
  function suggestedLens({landmark="idea",draft="",language="ko",step=0}={}){
    const f=features(draft,language),n=sentenceCount(draft);
    if(!draft.trim()) return null;
    if(landmark!=="emotion"&&!f.emotion&&n>=2) return "emotion";
    if(landmark!=="description"&&!f.sensory&&n>=2) return "description";
    if(landmark!=="viewpoint"&&!f.perspective&&n>=3) return "viewpoint";
    if(step>=2&&landmark!=="final"&&!f.ending) return "final";
    return null;
  }
  function contextPolicy(payload={}){
    const ctx=payload.learnerContext;
    if(!ctx||ctx.source!=="READY_SET_LEARNING_MASTER") return {used:false,allowCrossLens:true,goal:null,reason:null};
    const loads=Array.isArray(ctx.cognitive_load_profile)?ctx.cognitive_load_profile:[];
    const unresolved=Array.isArray(ctx.unresolved_flags)?ctx.unresolved_flags:[];
    const confidence=Number.isFinite(ctx.confidence)?ctx.confidence:null;
    const languageHeavy=loads.includes("LANGUAGE_PRODUCTION")||loads.includes("LANGUAGE_INTEGRATION");
    const lowTrust=(confidence!==null&&confidence<0.5)||unresolved.length>2;
    return {
      used:true,
      allowCrossLens:!(languageHeavy && Number(payload.step||0)===0) && !lowTrust,
      goal:ctx.concept_skill_target||null,
      subject:ctx.subject||null,
      activity_types:Array.isArray(ctx.activity_types)?ctx.activity_types.slice(0,8):[],
      cognitive_load_profile:loads.slice(0,8),
      confidence,
      unresolved_flags:unresolved.slice(0,8),
      reason:lowTrust?"LOW_CONTEXT_CONFIDENCE":languageHeavy?"LANGUAGE_LOAD_BOUND":"READY_CONTEXT"
    };
  }

  function normalizeAnalysis(raw,fallback){
    if(!raw||typeof raw!=="object")return {...fallback,provider:"local-writing-fallback",providerError:true};
    const safeFocus=typeof raw.focus==="string"&&raw.focus.length<48?raw.focus:fallback.focus;
    const safeQuestion=typeof raw.question==="string"&&raw.question.trim().length<=180?raw.question.trim():fallback.question;
    const safeHint=typeof raw.hint==="string"&&raw.hint.trim().length<=180?raw.hint.trim():fallback.hint;
    const safeLens=LENS.includes(raw.suggestedLens)?raw.suggestedLens:null;
    return {
      ...fallback,
      focus:safeFocus,
      question:safeQuestion,
      hint:safeHint,
      suggestedLens:safeLens,
      rationale:typeof raw.rationale==="string"?raw.rationale.slice(0,180):"",
      confidence:Number.isFinite(raw.confidence)?Math.max(0,Math.min(1,raw.confidence)):null,
      provider:typeof raw.provider==="string"&&raw.provider.trim()?raw.provider.trim().slice(0,80):"semantic-writing-provider",
      semanticSignals:raw.semanticSignals&&typeof raw.semanticSignals==="object"?raw.semanticSignals:null,
      grounded:raw.grounded!==false,
      factVerified:false
    };
  }
  async function analyze(payload={}){
    const local=move(payload);
    const policy=contextPolicy(payload);
    const fallback={...local,suggestedLens:policy.allowCrossLens?suggestedLens(payload):null,provider:"local-writing-fallback",grounded:true,factVerified:false,learningContextUsed:policy.used,learningGoal:policy.goal,learningContextPolicy:policy};
    const provider=window.SnapPopSemanticWritingProvider;
    if(!provider||typeof provider.analyzeWriting!=="function")return fallback;
    try{
      const raw=await provider.analyzeWriting({
        draft:(payload.draft||"").slice(0,6000),
        previousSnapshot:(payload.previousSnapshot||"").slice(0,6000),
        landmark:payload.landmark||"idea",
        step:Number(payload.step)||0,
        language:payload.language==="en"?"en":"ko",
        learnerContext:payload.learnerContext||null,
        vocabularyMaterial:payload.vocabularyMaterial||null,
        signal:payload.signal||null,
        contract:{
          childAuthorship:true,
          oneNextMoveOnly:true,
          noFinalAnswerAuthoring:true,
          noGrading:true,
          noQuestionFlooding:true,
          preserveDraft:true,
          vocabularyMaterialPolicy:{
            optional:true,
            noAutoInsert:true,
            noMasteryMutation:true,
            sourceOwnerPreserved:true
          }
        }
      });
      return normalizeAnalysis(raw,fallback);
    }catch{
      return {...fallback,provider:"local-writing-fallback",providerError:true};
    }
  }
  window.SnapPopWriting=Object.freeze({version:VERSION,features,move,analyze,suggestedLens,contextPolicy});
})();