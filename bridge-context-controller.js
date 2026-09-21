(() => {
"use strict";
let singleton=null;
function create(deps){
const q=deps.query,store=window.SnapPopStorage,esc=window.SnapPopUIShell.escapeHtml;
function learnerContext(){
  try{return window.SnapPopLearningContextProvider?.context?.()||null}catch{return null}
}
function vocabularyMaterial(){
  try{
    const material=window.SnapPopBridge?.vocabularyMaterial?.()||null;
    return window.SnapPopVocabularyMaterial?.writingContext?.(material)||material;
  }catch{return null}
}
async function runExpressionBridge(){
  const s=await store.get("active");if(!s)return;
  deps.ensureWritingState(s);
  const draft=q("#answer").value.trim();
  if(!draft)return deps.toast("먼저 네 생각을 한 조각 적어줘.");
  if(!window.SnapPopExpressionBridge)return deps.toast("지금은 표현 도움을 사용할 수 없어요.");
  const sourceLanguage=s.language==="en"?"en":"ko",targetLanguage=sourceLanguage==="en"?"ko":"en";
  const btn=q("#expressionBridgeBtn");if(btn){btn.disabled=true;btn.textContent=targetLanguage==="en"?"표현 조각 찾는 중…":"표현 조각 찾는 중…"}
  try{
    const result=await window.SnapPopExpressionBridge.bridge({
      draft,
      sourceLanguage,
      targetLanguage,
      vocabularyMaterial:vocabularyMaterial()
    });
    const cur=await store.get("active");
    if(!cur||cur.id!==s.id||q("#answer").value.trim()!==draft)return;
    deps.renderExpressionBridge(result,sourceLanguage,targetLanguage);
    cur.crewState=cur.crewState||{};
    cur.crewState.expressionBridge={
      sourceLanguage,
      targetLanguage,
      provider:result.provider||"unknown",
      fragmentCount:Array.isArray(result.phraseFragments)?result.phraseFragments.length:0,
      at:new Date().toISOString()
    };
    await store.set("active",cur);
    await recordExpressionTrace("BILINGUAL_EXPRESSION_BRIDGE_SHOWN",{
      source:"WRITING_FLOW",
      sourceLanguage,
      targetLanguage,
      fragmentCount:Array.isArray(result.phraseFragments)?result.phraseFragments.length:0,
      provider:result.provider||"unknown"
    });
  }catch{
    deps.renderExpressionBridge(null,sourceLanguage,targetLanguage);
    deps.toast("지금은 표현 조각을 불러오기 어려워요. 초안은 그대로 있어요.");
  }finally{
    const cur=await store.get("active");
    deps.setExpressionBridgeButton(cur?.language||sourceLanguage,q("#answer").value);
  }
}
function currentBridgeContext(){try{return window.SnapPopBridge?.context?.()||{}}catch{return {}}}
async function renderIncomingHandoff(){const box=q("#handoffWord");if(!box)return;const material=vocabularyMaterial();if(material?.word){box.hidden=false;const owner=material.sourceOwner==="HIDE_SEEK"?"Hide & Seek":"연결 앱";box.textContent=`${owner} 표현 재료 · ${material.word}${material.context?" · "+material.context:""} · 원하면 참고`;box.dataset.sourceOwner=material.sourceOwner;box.dataset.role=material.role}else{box.hidden=true;box.textContent="";delete box.dataset.sourceOwner;delete box.dataset.role}}
async function recordExpressionTrace(type,meta={}){
  const allowed={
    eventId:meta.eventId||deps.uid("exprtrace"),
    type,
    at:new Date().toISOString(),
    source:meta.source||null,
    sourceLanguage:meta.sourceLanguage||null,
    targetLanguage:meta.targetLanguage||null,
    questionLanguage:meta.questionLanguage||null,
    verifiedCoverage:meta.verifiedCoverage||null,
    questionChars:Number.isFinite(meta.questionChars)?meta.questionChars:null,
    fragmentCount:Number.isFinite(meta.fragmentCount)?meta.fragmentCount:null,
    provider:typeof meta.provider==="string"?meta.provider.slice(0,80):null,
    landmark:meta.landmark||null
  };
  const ledger=await store.get("expressionTrace")||[];
  ledger.unshift(allowed);
  await store.set("expressionTrace",ledger.slice(0,200));
  return allowed;
}
async function dismissPendingExpressionIntent(){
  const pending=await store.get("pendingExpressionIntent");
  if(pending?.question){
    await recordExpressionTrace("VERIFIED_ASK_EXPRESSION_DISMISSED",{
      source:pending.source||"VERIFIED_ASK",
      questionLanguage:pending.language||"ko",
      verifiedCoverage:pending.verifiedCoverage||null,
      questionChars:pending.question.length
    });
  }
  await store.set("pendingExpressionIntent",null);
  await renderPendingExpressionIntent();
}
async function renderPendingExpressionIntent(){
  const banner=q("#expressionIntentBanner");if(!banner)return;
  const pending=await store.get("pendingExpressionIntent");
  if(!pending?.question){banner.hidden=true;banner.innerHTML="";return}
  banner.innerHTML=`<span>방금 이해한 주제 · ${esc(pending.question)} · 표현하고 싶다면 탐험지를 골라봐.</span><button type="button" class="soft mini expressionIntentDismiss">그만두기</button>`;
  const dismiss=banner.querySelector(".expressionIntentDismiss");
  if(dismiss)dismiss.onclick=dismissPendingExpressionIntent;
  banner.hidden=false;
}
function renderExpressionIntentNote(s){
  const note=q("#expressionIntentNote");if(!note)return;
  const intent=s?.expressionIntent;
  if(intent?.question){
    note.textContent=`표현해볼 주제 · ${intent.question} · 먼저 네 말로 시작해봐.`;
    note.hidden=false;
  }else{
    note.hidden=true;
    note.textContent="";
  }
}
function install(){
  window.addEventListener("snap-pop:bridge-ready",renderIncomingHandoff);
  const btn=q("#expressionBridgeBtn");if(btn)btn.onclick=runExpressionBridge;
}
return Object.freeze({contract:"SNAP_POP_BRIDGE_CONTEXT_CONTROLLER_V1",install,learnerContext,vocabularyMaterial,runExpressionBridge,currentBridgeContext,renderIncomingHandoff,recordExpressionTrace,dismissPendingExpressionIntent,renderPendingExpressionIntent,renderExpressionIntentNote});
}
window.SnapPopBridgeContextController=Object.freeze({instance(deps){if(!singleton)singleton=create(deps);return singleton}});
})();
