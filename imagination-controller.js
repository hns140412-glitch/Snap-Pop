(() => {
"use strict";
let singleton=null;
function create(deps){
const q=deps.query,qa=deps.queryAll,store=window.SnapPopStorage,esc=window.SnapPopUIShell.escapeHtml;
let imaginationLanguage="ko",imaginationReturnFocus=null,imaginationSource="GLOBAL",imaginationWritingReturn=null,imaginationRequestSeq=0;
function setImaginationLanguage(language="ko"){
  imaginationLanguage=language==="en"?"en":"ko";
  q("#imaginationModeKo")?.classList.toggle("on",imaginationLanguage==="ko");
  q("#imaginationModeEn")?.classList.toggle("on",imaginationLanguage==="en");
}
async function openImagination({input="",language="ko",source="GLOBAL",writingReturn=null}={}){
  const layer=q("#imaginationLayer"),identity=await deps.resolvedIdentity(); if(!layer)return;
  imaginationRequestSeq++;
  imaginationReturnFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;
  imaginationSource=source;
  imaginationWritingReturn=source==="WRITING_FLOW"&&writingReturn
    ? (window.SnapPopImaginationReturnGuard?.capture?.(writingReturn)||writingReturn)
    : null;
  setImaginationLanguage(language);
  q("#imaginationCrewName").textContent=`탐험대원 ${deps.crewMemberName(identity)}`;
  q("#imaginationCrewLine").textContent=source==="WRITING_FLOW"?"쓰던 글은 그대로 있어. 필요한 만큼만 같이 생각해보자.":"필요한 만큼만 같이 생각해보자.";
  q("#imaginationInput").value=(input||"").trim();
  q("#imaginationAnswer").hidden=true; q("#imaginationAnswer").innerHTML="";
  layer.hidden=false; layer.setAttribute("aria-hidden","false"); document.documentElement.classList.add("imaginationOpen");
  setTimeout(()=>q("#imaginationInput")?.focus(),0);
}
async function closeImagination(){
  const layer=q("#imaginationLayer"); if(!layer)return;
  imaginationRequestSeq++;
  window.SnapPopVoice?.stopListening?.();
  layer.hidden=true; layer.setAttribute("aria-hidden","true"); document.documentElement.classList.remove("imaginationOpen");

  const writingReturn=imaginationWritingReturn;
  imaginationWritingReturn=null;
  if(imaginationSource==="WRITING_FLOW"&&writingReturn){
    const current=await store.get("active");
    const guard=window.SnapPopImaginationReturnGuard;
    const returned=guard&&typeof guard.returnDraft==="function"
      ? guard.returnDraft(current||{},writingReturn)
      : {ok:!!current&&current.id===writingReturn.activeId&&Math.min(2,current.step||0)===writingReturn.step,draft:current?.draft??writingReturn.draft,reason:"LEGACY_FALLBACK"};
    if(returned.ok&&current){
      deps.ensureWritingState(current);
      q("#answer").value=returned.draft||"";
      current.crewState=current.crewState||{};
      current.crewState.cloudReturn={
        activeId:current.id,
        landmark:current.landmark,
        step:Math.min(2,current.step||0),
        language:current.language==="en"?"en":"ko",
        draftPreserved:true,
        returnIntegrity:"MATCH",
        returnedAt:new Date().toISOString()
      };
      await store.set("active",current);
      const identity=await deps.resolvedIdentity();
      await deps.showCrewReaction(
        (current.language||"ko")==="en"
          ? `${deps.crewMemberName(identity)}: Your draft is still here. Keep going when you’re ready.`
          : `${deps.crewMemberName(identity)}: 쓰던 글은 그대로 있어. 준비되면 이어서 쓰면 돼.`,
        {persist:false,kind:"observe"}
      );
    }else if(current){
      current.crewState=current.crewState||{};
      current.crewState.cloudReturn={
        activeId:current.id,
        returnIntegrity:"BLOCKED",
        reason:returned.reason||"CONTEXT_CHANGED",
        returnedAt:new Date().toISOString()
      };
      await store.set("active",current);
    }
  }

  imaginationSource="GLOBAL";
  const target=imaginationReturnFocus; imaginationReturnFocus=null;
  if(target?.isConnected)setTimeout(()=>target.focus(),0);
}
function renderImaginationResponse(result,identity){
  const host=q("#imaginationAnswer"); if(!host)return;
  const nodes=Array.isArray(result?.nodes)?result.nodes:[];
  const claims=Array.isArray(result?.verification?.claims)?result.verification.claims:[];
  const verifiedClaims=claims.filter(x=>x?.status==="VERIFIED");
  const evidenceLinks=[...new Map(verifiedClaims.flatMap(x=>Array.isArray(x?.evidence)?x.evidence:[]).map(e=>{try{const u=new URL(e?.source_url||"");if(!["http:","https:"].includes(u.protocol))return null;return [u.href,{url:u.href,label:(e?.title||u.hostname.replace(/^www\./,"")).slice(0,80)}]}catch{return null}}).filter(Boolean)).values()].slice(0,4);
  const badge=result?.kind==="ASK_UNDERSTAND"
    ? result?.verified===true
      ?"확인 완료"
      : verifiedClaims.length
        ?"일부 근거 확인"
        :"확인 필요"
    :"생각 도움";
  const understanding=result?.understanding&&typeof result.understanding==="object"?result.understanding:null;
  const mentalModel=result?.mentalModel&&Array.isArray(result.mentalModel.items)?result.mentalModel:null;
  const canExpress=imaginationSource!=="WRITING_FLOW"&&result?.kind==="ASK_UNDERSTAND"&&result?.verified===true&&result?.verification?.coverage==="FULL_FACTUAL_CONTENT";
  host.innerHTML=`<div class="cloudAnswerHead"><b>${esc(deps.crewMemberName(identity))} · ${esc(result?.title||"상상 구름")}</b><span>${esc(badge)}</span></div>`+
    `<p class="cloudCore">${esc(result?.core||"")}</p>`+
    (nodes.length?`<div class="mindMap">${nodes.map(n=>`<div class="mindNode"><b>${esc(n.label||"")}</b><span>${esc(n.value||"")}</span></div>`).join("")}</div>`:"")+
    (understanding?`<p class="kicker">이렇게 보면 쉬워 · ${esc(understanding.label||"")}</p>`:"")+
    (mentalModel?.items?.length?`<div class="mentalModel mentalModel${esc(mentalModel.type||"STACK")}">${mentalModel.items.map((item,i)=>`<div class="mentalStep"><b>${esc(item.label||String(i+1))}</b><span>${esc(item.text||"")}</span></div>`).join(mentalModel.type==="FLOW"?'<i class="mentalArrow">→</i>':"")}</div>`:"")+
    (verifiedClaims.length?`<p class="kicker">확인된 주장 ${verifiedClaims.length}개${evidenceLinks.length?` · 근거 ${evidenceLinks.map(x=>`<a href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">${esc(x.label)}</a>`).join(" · ")}`:""}</p>`:"")+
    (understanding?.nextCuriosity?`<button class="soft cloudFollowUpReveal" type="button">더 궁금하면 한 가지 더</button><p class="cloudExample cloudFollowUpText" hidden>다음 궁금증 · ${esc(understanding.nextCuriosity)}</p>`:"")+
    (canExpress?`<button class="soft cloudExpressBtn" type="button">이걸 내 말로 표현해보기</button>`:"")+
    (result?.example?`<p class="cloudExample">${esc(result.example)}</p>`:"");
  const reveal=host.querySelector(".cloudFollowUpReveal"),follow=host.querySelector(".cloudFollowUpText");
  if(reveal&&follow)reveal.onclick=()=>{follow.hidden=false;reveal.remove()};
  const express=host.querySelector(".cloudExpressBtn");
  if(express)express.onclick=async()=>{
    const question=(q("#imaginationInput")?.value||"").trim();
    if(!question)return;
    const authorshipPayload=window.SnapPopAuthorshipGuard?.transitionPayload?.({question,language:imaginationLanguage,coverage:"FULL_FACTUAL_CONTENT"})||{source:"VERIFIED_ASK",question,language:imaginationLanguage,answerTransferred:false,draftTransferred:false,verifiedCoverage:"FULL_FACTUAL_CONTENT"};
    await store.set("pendingExpressionIntent",{...authorshipPayload,createdAt:new Date().toISOString()});
    await deps.recordExpressionTrace("VERIFIED_ASK_EXPRESSION_SELECTED",{
      source:"VERIFIED_ASK",
      questionLanguage:imaginationLanguage,
      verifiedCoverage:"FULL_FACTUAL_CONTENT",
      questionChars:question.length
    });
    await closeImagination();
    deps.show("map");
    await deps.renderPendingExpressionIntent();
    deps.toast("답을 옮기지 않았어. 이제 네 말로 표현해볼 수 있어.");
  };
  host.hidden=false; host.dataset.speakable=result?.speakable||result?.core||"";
}
async function runImagination(inputOverride){
  const input=(inputOverride??q("#imaginationInput")?.value??"").trim(),identity=await deps.resolvedIdentity();
  if(!input)return deps.toast("막힌 생각이나 궁금한 걸 한 조각만 남겨줘.");
  if(!window.SnapPopIntelligence)return deps.toast("상상 구름 엔진을 불러오지 못했어요.");
  const btn=q("#imaginationAskBtn"),requestSeq=++imaginationRequestSeq; btn.disabled=true; btn.textContent="생각 중…";
  try{
    const active=await store.get("active");
    const rawResult=await window.SnapPopIntelligence.ask({input,language:imaginationLanguage,context:imaginationSource,landmark:active?.landmark||null,step:active?.step||0,crewMember:{type:identity.crewMember?.type,name:deps.crewMemberName(identity)}});
    if(requestSeq!==imaginationRequestSeq||q("#imaginationLayer")?.hidden)return;
    const presentation=window.SnapPopCrewPresentationGuard;
    const result=presentation&&typeof presentation.sanitizeUserFacing==="function"
      ? presentation.sanitizeUserFacing(rawResult)
      : rawResult;
    renderImaginationResponse(result,identity);
    const history=await store.get("cloudHistory")||[];
    const publicEntry=presentation&&typeof presentation.publicHistoryEntry==="function"
      ? presentation.publicHistoryEntry(result)
      : {intent:result.intent||result.kind,verificationStatus:(result.intent||result.kind)==="ASK_UNDERSTAND"?(result.verified===true?"FACT_VERIFIED":"FACT_NEEDS_CHECK"):"NOT_APPLICABLE",verified:(result.intent||result.kind)==="ASK_UNDERSTAND"?result.verified===true:null,title:result.title||"",core:result.core||"",nodes:Array.isArray(result.nodes)?result.nodes.slice(0,8):[],example:result.example||""};
    history.unshift({id:deps.uid("cloud"),input,...publicEntry,provider:rawResult.provider||"unknown",language:imaginationLanguage,source:imaginationSource,at:new Date().toISOString()});
    await store.set("cloudHistory",history.slice(0,100));
    if(active&&imaginationSource==="WRITING_FLOW"){active.crewState=active.crewState||{};active.crewState.cloudLast={input,intent:result.intent||result.kind,verificationStatus:(result.intent||result.kind)==="ASK_UNDERSTAND"?(result.verified===true?"FACT_VERIFIED":"FACT_NEEDS_CHECK"):"NOT_APPLICABLE",verified:(result.intent||result.kind)==="ASK_UNDERSTAND"?result.verified===true:null,provider:result.provider||"unknown",at:new Date().toISOString()};await store.set("active",active)}
    if(result.verified===false){
      const verifiedClaimCount=Number(result?.verification?.verifiedClaimCount)||0;
      await deps.showCrewReaction(
        verifiedClaimCount>0
          ?`${deps.crewMemberName(identity)}: 근거가 확인된 부분과 아직 확인이 필요한 부분을 나눠서 볼게.`
          :`${deps.crewMemberName(identity)}: 확인이 필요한 건 지어내지 않고 확인부터 할게.`,
        {persist:false,kind:"observe"}
      );
    }
  }catch{
    if(requestSeq===imaginationRequestSeq)await deps.showCrewReaction(`${deps.crewMemberName(identity)}: 지금 연결이 매끄럽지 않네. 질문은 그대로 남겨둘게.`,{persist:false});
  }finally{
    if(requestSeq===imaginationRequestSeq){btn.disabled=false;btn.textContent="도움 받기"}
  }
}
async function listenVoice(){
  const identity=await deps.resolvedIdentity(); if(!window.SnapPopVoice)return deps.toast("지금은 음성 입력을 사용할 수 없어요.");
  try{await window.SnapPopVoice.listen({language:imaginationLanguage,source:"USER_MIC",
    onStart:()=>{q("#imaginationVoiceBtn").textContent=imaginationLanguage==="en"?"Listening…":"듣고 있어요…";deps.showCrewReaction(`${deps.crewMemberName(identity)}: 천천히 말해도 돼.`,{persist:false})},
    onText:t=>{q("#imaginationInput").value=t;runImagination(t)},
    onError:()=>deps.showCrewReaction(`${deps.crewMemberName(identity)}: 잘 못 들었어. 다시 말하거나 직접 적어도 돼.`,{persist:false}),
    onEnd:()=>{q("#imaginationVoiceBtn").textContent="말로 묻기"}})}catch{deps.toast("이 기기에서는 지금 음성 입력을 사용할 수 없어요.")}
}
async function openFromWriting(){
  const s=await store.get("active");if(!s)return;
  deps.ensureWritingState(s);
  const step=Math.min(2,s.step||0),draft=q("#answer").value;
  s.draft=draft;
  s.answers[step]=draft;
  s.updatedAt=new Date().toISOString();
  s.crewState=s.crewState||{};
  s.crewState.cloudReturn={activeId:s.id,step,draftPreserved:true,openedAt:new Date().toISOString()};
  await store.set("active",s);
  openImagination({
    input:draft,
    language:s.language||"ko",
    source:"WRITING_FLOW",
    writingReturn:{id:s.id,landmark:s.landmark,step,language:s.language||"ko",draft}
  });
}
async function speakLast(){const t=q("#imaginationAnswer")?.dataset.speakable||"";if(!t)return deps.toast("먼저 도움을 받아봐.");await deps.speak(t,imaginationLanguage)}
function install(){
 q("#imaginationModeKo").onclick=()=>setImaginationLanguage("ko");
 q("#imaginationModeEn").onclick=()=>setImaginationLanguage("en");
 q("#imaginationAskBtn").onclick=()=>runImagination();
 q("#imaginationSpeakLast").onclick=speakLast;
 q("#imaginationVoiceBtn").onclick=listenVoice;
 q("#imaginationClose").onclick=()=>closeImagination();
 q("#imaginationBackdrop").onclick=()=>closeImagination();
 addEventListener("keydown",e=>{if(e.key==="Escape"&&!q("#imaginationLayer")?.hidden)closeImagination()});
 q("#cloudBtn").onclick=openFromWriting;
 q("#homeRadio").onclick=()=>openImagination({language:"ko",source:"HOME_RADIO"});
}
return Object.freeze({contract:"SNAP_POP_IMAGINATION_CONTROLLER_V1",install,setImaginationLanguage,openImagination,closeImagination,renderImaginationResponse,runImagination,openFromWriting});
}
window.SnapPopImaginationController=Object.freeze({instance(deps){if(!singleton)singleton=create(deps);return singleton}});
})();
