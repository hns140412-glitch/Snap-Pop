(() => {
"use strict";
let singleton=null;
function create(deps){
const q=deps.query,qa=deps.queryAll,store=window.SnapPopStorage,esc=window.SnapPopUIShell.escapeHtml;
let selected=null,calendarCursor=new Date(),analysisSeq=0,analysisAbortController=null;
function renderLandmarks(){const host=q("#landmarks");host.innerHTML="";deps.getLandmarks().forEach(m=>{const b=document.createElement("button");b.className="landmark";b.textContent=m.title;b.style.left=m.x+"%";b.style.top=m.y+"%";b.onclick=async()=>{selected=m;qa(".landmark").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");const a=await store.get("active"),g=await store.get("gems")||{};q("#selTitle").textContent=m.title;q("#selDesc").textContent=m.desc;const identity=await deps.resolvedIdentity();q("#selCrewMemberReaction").textContent=`${deps.crewMemberName(identity)} · ${deps.crewReaction(identity,m.id)}`;q("#selProgress").textContent="진행 "+(a?.landmark===m.id?(Math.min(3,(a.step||0)+1)):0)+" / 3";q("#selShard").textContent="보석 조각 "+((g[m.id]||0)%6)+" / 6";q("#selection").hidden=false};host.appendChild(b)})}
async function revealHint(){const s=await store.get("active");if(!s)return;const p=deps.promptFor(s.landmark,s.step||0,s.language||"ko",deps.ensureWritingState(s).draft);s.crewState=s.crewState||{};s.crewState.hintLevel=Math.max(1,s.crewState.hintLevel||0);s.crewState.lastHintAt=new Date().toISOString();await store.set("active",s);await deps.recordBadgeBehaviorObservation("HELP_REQUEST",{explicitAction:true,landmark:s.landmark,step:Math.min(2,s.step||0),hintLevel:s.crewState.hintLevel},"SNAP_POP");q("#hint").textContent=p[1];q("#hint").hidden=false;q("#hintBtn").disabled=true;const identity=await deps.resolvedIdentity();await deps.showCrewReaction((s.language||"ko")==="en"?`${deps.crewMemberName(identity)}: Just one hint. The rest is yours.`:`${deps.crewMemberName(identity)}: 힌트는 하나만. 나머지는 네 생각으로 가보자.`)}
async function resetStepCrewState(s){s.crewState={hintLevel:0,lastReaction:"",cloudReturn:null,lastVoiceLength:0};await store.set("active",s)}
async function analyzeWritingMove(s){
  if(!s||!window.SnapPopWriting?.analyze)return refreshWritingMove(s);
  deps.ensureWritingState(s);
  analysisAbortController?.abort("superseded");
  const controller=new AbortController();analysisAbortController=controller;
  const seq=++analysisSeq,draft=s.draft,step=Math.min(2,s.step||0),language=s.language||'ko';
  const previousSnapshot=(s.snapshots||[])[Math.max(0,step-1)]||'';
  const result=await window.SnapPopWriting.analyze({landmark:s.landmark,step,draft,previousSnapshot,language,learnerContext:deps.learnerContext(),vocabularyMaterial:deps.vocabularyMaterial(),signal:controller.signal});
  if(analysisAbortController===controller)analysisAbortController=null;
  const cur=await store.get('active');
  if(seq!==analysisSeq||!cur||cur.id!==s.id)return null;
  deps.ensureWritingState(cur);
  if(cur.draft!==draft||Math.min(2,cur.step||0)!==step)return null;
  if(q('#answer').value!==draft)return null;
  q('#question').textContent=result.question;
  if(cur.crewState?.hintLevel>0)q('#hint').textContent=result.hint;
  deps.renderWritingBridge(result,language);
  cur.crewState=cur.crewState||{};
  cur.crewState.currentFocus=result.focus||null;
  cur.crewState.writingAnalysis={focus:result.focus||null,suggestedLens:result.suggestedLens||null,provider:result.provider||'unknown',confidence:result.confidence??null,grounded:result.grounded!==false,factVerified:result.factVerified===true,learningContextUsed:!!result.learningContextUsed,learningGoal:result.learningGoal||null,semanticSignals:result.semanticSignals||null,at:new Date().toISOString()};
  await store.set('active',cur);
  return result;
}
function refreshWritingMove(s){
  if(!s)return null;
  deps.ensureWritingState(s);
  const i=Math.min(2,s.step||0),language=s.language||'ko',p=deps.promptFor(s.landmark,i,language,s.draft),move=p[2];
  q('#question').textContent=p[0];
  if(s.crewState?.hintLevel>0)q('#hint').textContent=p[1];
  if(move){s.crewState=s.crewState||{};s.crewState.currentFocus=move.focus;}
  return move;
}
async function speak(t,language="ko",source="USER_TAP"){try{if(!window.SnapPopVoice)throw new Error("VOICE_RUNTIME_UNAVAILABLE");return await window.SnapPopVoice.speak(t,{language,voiceRole:"crew",source})}catch{return deps.toast("지금은 음성으로 읽어주기 어려워요. 글로 계속 볼 수 있어요.")}}
async function renderCloudHistory(){
  const host=q("#cloudHistoryList"); if(!host)return;
  const history=await store.get("cloudHistory")||[];
  host.innerHTML=history.length?history.map(x=>`<article class="card cloudHistoryCard"><b>${x.intent==="ASK_UNDERSTAND"?"궁금증":"생각"} · ${new Date(x.at).toLocaleDateString("ko-KR")}</b><p class="cloudHistoryQuestion">${esc(x.input||"")}</p>${x.core?`<p class="cloudHistoryAnswer">${esc(x.core)}</p>`:""}${Array.isArray(x.nodes)&&x.nodes.length?`<div class="cloudHistoryNodes">${x.nodes.slice(0,4).map(n=>`<span><b>${esc(n.label||"")}</b> ${esc(n.value||"")}</span>`).join("")}</div>`:""}<span class="kicker">${x.verificationStatus==="FACT_VERIFIED"?"확인 완료":x.verificationStatus==="FACT_NEEDS_CHECK"?"확인 필요":"생각 기록"} · ${x.language==="en"?"English":"한국어"}</span></article>`).join(""):'<article class="card"><b>아직 상상 구름 기록이 없어요.</b><p>궁금한 것과 떠오른 생각을 자유롭게 남겨봐요.</p></article>';
}
function renderCalendar(records,special=[]){
  const y=calendarCursor.getFullYear(),m=calendarCursor.getMonth(),first=new Date(y,m,1),days=new Date(y,m+1,0).getDate(),offset=first.getDay();
  q("#calTitle").textContent=`${y}년 ${m+1}월`;
  const count={},specialCount={};records.forEach(r=>{const d=new Date(r.date);if(d.getFullYear()===y&&d.getMonth()===m)count[d.getDate()]=(count[d.getDate()]||0)+1});special.forEach(r=>{const d=new Date(r.at);if(d.getFullYear()===y&&d.getMonth()===m)specialCount[d.getDate()]=(specialCount[d.getDate()]||0)+1});
  const today=new Date();let cells="";
  for(let i=0;i<offset;i++)cells+='<button class="blank" tabindex="-1"></button>';
  for(let d=1;d<=days;d++){const has=(count[d]||0)+(specialCount[d]||0)>0,isToday=today.getFullYear()===y&&today.getMonth()===m&&today.getDate()===d;cells+=`<button data-day="${d}" class="${has?"hasRecord ":""}${isToday?"today":""}" aria-label="${m+1}월 ${d}일${has?", 기록 있음":""}">${d}</button>`;}
  q("#calendarGrid").innerHTML=cells;
  q("#calendarGrid").onclick=e=>{const b=e.target.closest("button[data-day]");if(!b)return;const d=Number(b.dataset.day);const hit=records.find(r=>{const x=new Date(r.date);return x.getFullYear()===y&&x.getMonth()===m&&x.getDate()===d}),specialHit=special.find(r=>{const x=new Date(r.at);return x.getFullYear()===y&&x.getMonth()===m&&x.getDate()===d}),target=hit?.date||specialHit?.at;if(target){const el=document.querySelector(`[data-record-date="${target}"]`);el?.scrollIntoView({behavior:document.documentElement.classList.contains("reduceMotion")?"auto":"smooth",block:"center"})}else deps.toast("이날은 아직 탐험 기록이 없어요.")};
}
function isWeekend(d=new Date()){const day=d.getDay();return day===0||day===6}
function getSelected(){return selected}
function bumpWritingAnalysisSeq(){analysisAbortController?.abort("invalidated");analysisAbortController=null;analysisSeq++;return analysisSeq}
function install(){
 q("#deepThinkOpen").onclick=()=>{const panel=q("#deepThinkPanel");if(panel){panel.hidden=!panel.hidden;if(!panel.hidden)q("#deepThinkText")?.focus()}};
 q("#deepThinkSave").onclick=async()=>{const s=await store.get("active");if(!s)return;const text=q("#deepThinkText").value.trim();if(!text)return deps.toast("생각을 한 줄만 남겨줘.");const reflectionId=deps.uid("reflection"),at=new Date().toISOString(),ledger=await store.get("writingReflections")||[];ledger.unshift({id:reflectionId,at,activeId:s.id,landmark:s.landmark,step:Math.min(2,s.step||0),language:s.language||"ko",text,source:"CHILD_EXPLICIT_REFLECTION"});await store.set("writingReflections",ledger.slice(0,500));await deps.recordBadgeBehaviorEvidence("DEEP_THINKING",{explicitChildAction:true,evidenceRef:`reflection_event_${reflectionId}`,sourceContractId:"SNAP_POP_CHILD_REFLECTION_ARTIFACT_V1",childChoseToReflect:true,reflectionArtifactRef:`writingReflection:${reflectionId}`});q("#deepThinkText").value="";q("#deepThinkPanel").hidden=true;deps.toast("생각 기록을 남겼어요.")};
 q("#hintBtn").onclick=revealHint;
 q("#listenBtn").onclick=async()=>{const s=await store.get("active");if(!s)return;const p=deps.promptFor(s.landmark,s.step||0,s.language||"ko",deps.ensureWritingState(s).draft);await speak(p[0]+" "+(s.crewState?.hintLevel?p[1]:""),s.language||"ko")};
 q("#voiceBtn").onclick=async()=>{const s=await store.get("active"),identity=await deps.resolvedIdentity();if(!window.SnapPopVoice)return deps.toast("지금은 음성 입력을 사용할 수 없어요.");try{await window.SnapPopVoice.listen({language:s?.language||"ko",source:"USER_MIC",onStart:()=>{q("#voiceBtn").textContent=(s?.language||"ko")==="en"?"Listening":"듣고 있어요";deps.showCrewReaction(`${deps.crewMemberName(identity)}: 듣고 있어. 천천히 말해도 돼.`,{persist:false})},onText:async t=>{q("#answer").value+=((q("#answer").value?" ":"")+t);q("#answer").dispatchEvent(new Event("input"));const cur=await store.get("active");if(cur){cur.crewState=cur.crewState||{};cur.crewState.lastVoiceLength=t.length;await store.set("active",cur)}await deps.recordCrewExperience("VOICE_EXPRESSION",{eventId:deps.uid("voice"),length:t.length,landmark:s?.landmark||null});if(t.length>=40)await deps.showCrewReaction(`${deps.crewMemberName(identity)}: 길게 잘 들었어. 네 말투는 그대로 두자.`)},onError:()=>deps.showCrewReaction(`${deps.crewMemberName(identity)}: 잘 못 들었어. 다시 말하거나 직접 써도 돼.`),onEnd:()=>{q("#voiceBtn").innerHTML='<img src="assets/icons/radio.svg" alt="">말해서 쓰기'}})}catch{deps.toast("이 기기에서는 지금 음성 입력을 사용할 수 없어요.")}};
 q("#historyBtn").onclick=deps.renderGrowthTimeline;
 q("#resultBack").onclick=()=>deps.show("map");
 q("#resultRecords").onclick=()=>deps.show("records");
 q("#resultGrowth").onclick=()=>deps.show("growth");
 q("#calPrev").onclick=()=>{calendarCursor=new Date(calendarCursor.getFullYear(),calendarCursor.getMonth()-1,1);deps.renderRecords()};
 q("#calNext").onclick=()=>{calendarCursor=new Date(calendarCursor.getFullYear(),calendarCursor.getMonth()+1,1);deps.renderRecords()};
}
return Object.freeze({contract:"SNAP_POP_INTERACTION_SUPPORT_CONTROLLER_V1",install,getSelected,bumpWritingAnalysisSeq,renderLandmarks,revealHint,resetStepCrewState,analyzeWritingMove,refreshWritingMove,speak,renderCloudHistory,renderCalendar,isWeekend});
}
window.SnapPopInteractionSupportController=Object.freeze({instance(deps){if(!singleton)singleton=create(deps);return singleton}});
})();
