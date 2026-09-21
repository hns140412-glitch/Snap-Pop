(() => {
"use strict";
const STEPS=["초안 잡기","이어 쓰기","다듬어 완성"];
const QUESTION_BANK={
 idea:{
  ko:[["무엇이 먼저 떠올랐어?","작은 소재 하나만 잡아보자."],["그 아이디어에서 더 궁금한 건 뭐야?","이유나 다음 장면 하나를 붙여봐."],["이제 네 아이디어를 한 문장으로 묶어볼까?","네 말투 그대로 끝내면 돼."]],
  en:[["What idea came to mind first?","A word or tiny idea is enough."],["What else could happen or connect to it?","Add one reason, detail, or next scene."],["Can you finish it in your own sentence?","Use your own words."]]
 },
 emotion:{
  ko:[["지금 떠오르는 마음은 뭐야?","감정 이름이 아니어도 괜찮아."],["왜 그런 마음이 들었을까?","사건이나 이유 하나만 이어봐."],["그 마음을 네 문장으로 표현해볼까?","평가 말고 네 느낌을 그대로 적어봐."]],
  en:[["What feeling comes to mind?","You do not need the perfect emotion word."],["What made you feel that way?","Add one event or reason."],["Can you express that feeling in your own sentence?","Keep it in your voice."]]
 },
 description:{
  ko:[["무엇이 가장 먼저 보였어?","색·모양·소리 중 하나만 골라도 돼."],["가까이 가면 무엇이 더 느껴질까?","보이는 것 말고 소리·냄새·촉감도 떠올려봐."],["그 장면이 보이게 한 문장으로 써볼까?","네가 실제로 느낀 단서를 넣어봐."]],
  en:[["What did you notice first?","Pick a color, shape, sound, or texture."],["What else would you notice up close?","Try a sound, smell, or feeling."],["Can you describe the scene in your own sentence?","Use details you noticed."]]
 },
 viewpoint:{
  ko:[["나는 이 일을 어떻게 보고 있어?","먼저 내 생각 하나를 잡아보자."],["다른 사람은 어떻게 볼 수 있을까?","반대일 필요는 없어. 다른 시선이면 돼."],["두 시선을 보고 네 생각을 정리해볼까?","이유 하나와 함께 네 입장을 써봐."]],
  en:[["How do you see this?","Start with your own view."],["How might someone else see it?","It can simply be a different view."],["Can you explain your view with one reason?","Write it in your own words."]]
 },
 final:{
  ko:[["지금 글에서 가장 살리고 싶은 부분은 뭐야?","핵심 하나를 골라보자."],["더 분명하게 고칠 곳이 있을까?","제목·순서·끝맺음 중 하나만 봐도 돼."],["이제 마지막 문장으로 마무리해볼까?","네 글의 느낌이 남도록 끝내봐."]],
  en:[["What part do you want to keep strongest?","Choose one key idea."],["What could be clearer?","Check the order, wording, or ending."],["Can you finish with your final sentence?","Make it sound like you."]]
 }
};

let singleton=null;
function create(deps){
const q=deps.query;
function promptFor(landmark,step,language="ko",draft=""){
  if(window.SnapPopWriting?.move){
    const m=window.SnapPopWriting.move({landmark,step,language,draft});
    return [m.question,m.hint,m];
  }
  const bank=QUESTION_BANK[landmark]||QUESTION_BANK.idea;
  return [...(bank[language]||bank.ko)[Math.min(2,step)],null];
}
function ensureWritingState(s){
  if(!s)return s;
  s.answers=Array.isArray(s.answers)?s.answers:["","",""];
  s.snapshots=Array.isArray(s.snapshots)?s.snapshots:[...s.answers];
  if(typeof s.draft!=="string"){
    const current=s.answers[Math.min(2,s.step||0)];
    s.draft=current||[...s.answers].reverse().find(x=>(x||"").trim())||"";
  }
  return s;
}
function setModeButtons(language){q("#modeKo")?.classList.toggle("on",language!=="en");q("#modeEn")?.classList.toggle("on",language==="en")}
function focusGuide(focus,language='ko'){
  const ko={START:'첫 생각 하나면 돼.',CONNECT:'이제 이유나 연결 하나만 붙이면 돼.',NEXT_SCENE:'다음 장면 하나만 이어보자.',SHAPE:'중심 문장을 살려보자.',FEELING:'마음의 단서 하나만 더 잡아보자.',WHY_FEEL:'그 마음이 생긴 장면 하나만 붙여보자.',CHANGE:'마음이 어떻게 달라졌는지 보면 돼.',SENSORY:'감각 단서 하나만 더 있으면 장면이 살아나.',SPECIFIC:'지금 단서 하나만 더 구체적으로 해보자.',OWN_VIEW:'네 생각 한 줄이 중심이야.',OTHER_VIEW:'다른 시선 하나만 더 보면 돼.',REASON:'이유 하나만 붙이면 생각이 선명해져.',POSITION:'네 입장이 보이는 한 문장을 남겨보자.',ENDING:'끝에 남길 생각 하나만 잡아보자.',REVISE:'전체 말고 한 곳만 다듬자.'};
  const en={START:'One small thought is enough.',CONNECT:'Add just one reason or connection.',NEXT_SCENE:'Add one next scene.',SHAPE:'Keep the central sentence strong.',FEELING:'Add one clue about the feeling.',WHY_FEEL:'Add one small moment that caused the feeling.',CHANGE:'Notice whether the feeling changed.',SENSORY:'One sensory clue will bring the scene closer.',SPECIFIC:'Make just one detail more specific.',OWN_VIEW:'Your own view is the center.',OTHER_VIEW:'Add one other point of view.',REASON:'One reason will make the idea clearer.',POSITION:'Leave one sentence that shows your position.',ENDING:'Choose one thought to leave at the end.',REVISE:'Revise one spot, not the whole piece.'};
  return (language==='en'?en:ko)[focus]||(language==='en'?'Keep your own words.':'네 말은 그대로 두고 한 가지만 더 보자.');
}
function stepSpecificReaction(text,language='ko',move=null){
  const sn=deps.crewSnippet(text);
  if(!sn)return language==='en'?'I’m listening. One small piece is enough.':'듣고 있어. 작은 조각 하나면 충분해.';
  const guide=focusGuide(move?.focus,language);
  return language==='en'?'“'+sn+'” — I’m following. '+guide:'“'+sn+'” 여기까지 이어졌어. '+guide;
}
function writingLensLabel(id,language='ko'){
  const ko={idea:'아이디어 동굴',emotion:'감정 호수',description:'묘사 숲',viewpoint:'관점 전망대',final:'마무리 캠프'};
  const en={idea:'Idea Cave',emotion:'Emotion Lake',description:'Description Forest',viewpoint:'Viewpoint Lookout',final:'Finishing Camp'};
  return (language==='en'?en:ko)[id]||'';
}
function renderWritingBridge(result,language='ko'){
  const el=q('#writingBridge');if(!el)return;
  const lens=result?.suggestedLens;
  if(!lens){el.hidden=true;el.textContent='';return}
  const name=writingLensLabel(lens,language);
  el.textContent=language==='en'?`Optional lens · ${name}`:`필요하면 ${name} 관점으로도 한 번 볼 수 있어.`;
  el.hidden=false;
}
function setExpressionBridgeButton(language='ko',draft=''){
  const btn=q("#expressionBridgeBtn");if(!btn)return;
  btn.textContent=language==="en"?"한국어 표현 도움":"English 표현 도움";
  btn.disabled=!(draft||"").trim();
}
function renderExpressionBridge(result,sourceLanguage,targetLanguage){
  const panel=q("#expressionBridgePanel");if(!panel)return;
  if(!result){panel.hidden=true;panel.innerHTML="";return}
  const targetLabel=targetLanguage==="en"?"English":"한국어";
  const fragments=Array.isArray(result.phraseFragments)?result.phraseFragments.slice(0,4):[];
  panel.innerHTML=
    `<span class="kicker">뜻 유지 · ${window.SnapPopUIShell.escapeHtml(targetLabel)} 표현 조각</span>`+
    (result.meaningAnchor?`<p>${window.SnapPopUIShell.escapeHtml(result.meaningAnchor)}</p>`:"")+
    (fragments.length?`<div class="expressionFragments">${fragments.map(x=>`<span>${window.SnapPopUIShell.escapeHtml(x)}</span>`).join("")}</div>`:"")+
    `<p class="expressionAssembly">${window.SnapPopUIShell.escapeHtml(result.assemblyPrompt||"")}</p>`+
    `<span class="kicker">문장은 직접 조립해. 초안은 바뀌지 않아.</span>`;
  panel.dataset.sourceLanguage=sourceLanguage;
  panel.dataset.targetLanguage=targetLanguage;
  panel.hidden=false;
}
function renderExplore(s){ensureWritingState(s);const marks=deps.getLandmarks(),m=marks.find(x=>x.id===s.landmark)||marks[0],i=Math.min(2,s.step||0),language=s.language||"ko",p=promptFor(s.landmark,i,language,s.draft);renderExpressionBridge(null,language,language==="en"?"ko":"en");deps.renderExpressionIntentNote(s);setExpressionBridgeButton(language,s.draft);q("#exploreTitle").textContent="탐험 진행 · "+m.title;q("#question").textContent=p[0];q("#hint").textContent=p[1];q("#hint").hidden=!(s.crewState?.hintLevel>0);q("#hintBtn").disabled=!!(s.crewState?.hintLevel>0);q("#answer").value=s.draft||"";setModeButtons(language);renderWritingBridge(null,language);deps.hideCrewReaction();deps.resolveIdentity().then(identity=>{const name=deps.crewMemberName(identity),base=deps.crewReaction(identity,s.landmark),stepLine=language==="en"?["Start small. One idea is enough.","Add one more piece.","Finish it in your own words."][i]:["작은 조각 하나부터 잡아보자.","좋아, 하나만 더 붙여보자.","이제 네 말로 마무리해보자."][i];q(".crewMemberLine b").textContent=`탐험대원 ${name}`;q("#crewMemberLine").textContent=`${base} ${stepLine}`});q("#nextBtn").textContent=i===2?(language==="en"?"Finish exploration":"탐험 완료"):(language==="en"?"Next step":"다음 단계");q("#steps").innerHTML=STEPS.map((x,n)=>`<span class="${n===i?"on":n<i?"done":""}">${n+1}. ${x}</span>`).join("")}
return Object.freeze({contract:"SNAP_POP_WRITING_CONTROLLER_V1",promptFor,ensureWritingState,setModeButtons,focusGuide,stepSpecificReaction,writingLensLabel,renderWritingBridge,setExpressionBridgeButton,renderExpressionBridge,renderExplore});
}
window.SnapPopWritingController=Object.freeze({instance(deps){if(!singleton)singleton=create(deps);return singleton}});
})();
