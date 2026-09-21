(() => {
"use strict";
let singleton=null;
function create(deps){
const q=deps.query;
const store=window.SnapPopStorage;
function calcExp(answers,completedCount,language="ko"){
  const text=answers.join(" ").trim(),len=text.length;
  const initial=completedCount<5?12:completedCount<15?7:3;
  const strengths=[];let mastery=0;
  if(len>=80){mastery+=3;strengths.push(language==="en"?"writing longer":"길게 이어 쓰기")}
  if(len>=150){mastery+=3;strengths.push(language==="en"?"expanding an idea":"생각 충분히 펼치기")}
  const reason=language==="en"?/because|think|feel|idea|reason|so\b/i:/왜|이유|때문|느낌|기분|생각|아이디어|마음/;
  const sensory=language==="en"?/see|saw|hear|heard|sound|smell|taste|touch|warm|cold|bright|dark|scene/i:/보이|들리|냄새|향|맛|촉감|따뜻|차갑|밝|어둡|장면|풍경|소리/;
  if(reason.test(text)){mastery+=3;strengths.push(language==="en"?"reason·feeling·idea":"이유·감정·아이디어")}
  if(sensory.test(text)){mastery+=3;strengths.push(language==="en"?"sensory detail":"감각·장면")}
  if(/[.!?。！？]/.test(text)){mastery+=2;strengths.push(language==="en"?"sentence control":"문장 나누기")}
  mastery=Math.min(14,mastery);
  return {total:34+initial+mastery,base:34,initial,mastery,strengths};
}
async function start(){const selected=deps.getSelected();if(!selected)return;let s=await store.get("active"),created=false;if(!s||s.landmark!==selected.id){s={id:deps.uid("explore"),landmark:selected.id,step:0,answers:["","",""],snapshots:["","",""],draft:"",language:"ko",startedAt:new Date().toISOString()};created=true}if(!s.language)s.language="ko";if(created){const pending=await store.get("pendingExpressionIntent");if(pending?.question){s.expressionIntent={source:"VERIFIED_ASK",question:pending.question,questionLanguage:pending.language||"ko",answerTransferred:false,createdAt:pending.createdAt||new Date().toISOString()};await deps.recordExpressionTrace("VERIFIED_ASK_EXPRESSION_ATTACHED",{source:"VERIFIED_ASK",questionLanguage:pending.language||"ko",verifiedCoverage:pending.verifiedCoverage||null,questionChars:pending.question.length,landmark:selected.id});await store.set("pendingExpressionIntent",null);await deps.renderPendingExpressionIntent()}}deps.ensureWritingState(s);await store.set("active",s);deps.renderExplore(s);deps.show("explore");setTimeout(()=>deps.analyzeWritingMove(s),0);if(q("#autoRead").checked){const p=deps.promptFor(s.landmark,s.step,s.language,s.draft);deps.speak(p[0],s.language,"AUTO_READ")}}
async function advance(){
  let s=await store.get("active");
  if(!s){deps.toast("지도에서 탐험지를 먼저 골라줘.");deps.show("map");return}
  deps.ensureWritingState(s);const i=s.step||0;s.draft=q("#answer").value.trim();s.answers[i]=s.draft;s.snapshots[i]=s.draft;
  if(!s.draft){s.crewState=s.crewState||{};s.crewState.emptyAdvanceAttempts=(s.crewState.emptyAdvanceAttempts||0)+1;const intervention=window.SnapPopCrewIntervention?.state?.({emptyAdvanceAttempts:s.crewState.emptyAdvanceAttempts,hintLevel:s.crewState.hintLevel||0,language:s.language||"ko"})||{stage:"WAIT",message:(s.language||"ko")==="en"?"No rush. I’ll wait here.":"급할 건 없어. 여기서 기다릴게.",autoRevealHint:false,autoWrite:false};s.crewState.interventionStage=intervention.stage;await store.set("active",s);const identity=await deps.resolvedIdentity();await deps.showCrewReaction(`${deps.crewMemberName(identity)}: ${intervention.message}`,{kind:"observe"});return}
  if(i<2){deps.bumpWritingAnalysisSeq();s.step=i+1;s.crewState={hintLevel:0,lastReaction:"",cloudReturn:null,lastVoiceLength:0};await store.set("active",s);deps.renderExplore(s);setTimeout(()=>deps.analyzeWritingMove(s),0);return}
  const events=await store.get("completionEvents")||{};
  const completionEventId=s.completionEventId||`completion_${s.id}`;
  if(events[completionEventId]){await store.set("active",null);deps.toast("이미 기록된 탐험이에요.");deps.show("growth");return}
  const records=await store.get("records")||[];
  const expAward=calcExp([s.draft],records.length,s.language||"ko");
  const now=new Date().toISOString();
  const learningCtx=deps.learnerContext(),vocabMaterial=deps.vocabularyMaterial(),vocabEvidence=window.SnapPopVocabularyMaterial?.usageEvidence?.(vocabMaterial,s.draft)||null;const record={id:deps.uid("record"),completionEventId,landmark:s.landmark,language:s.language||"ko",answers:[...s.answers],snapshots:[...(s.snapshots||s.answers)],finalDraft:s.draft,date:now,expAward:expAward.total,strengths:expAward.strengths,learningRef:learningCtx?{learning_unit_id:learningCtx.learning_unit_id||null,analysis_id:learningCtx.analysis_id||null,assignment_id:learningCtx.assignment_id||null,subject:learningCtx.subject||null,context_source:learningCtx.source||null}:null,vocabularyRef:vocabEvidence};
  records.unshift(record);
  const gems=await store.get("gems")||{},beforeShard=gems[s.landmark]||0;gems[s.landmark]=beforeShard+1;
  const expLedger=await store.get("expLedger")||[];
  expLedger.push({eventId:completionEventId,type:"EXPLORATION_COMPLETE",amount:expAward.total,landmark:s.landmark,at:now,breakdown:expAward});
  const gemLedger=await store.get("gemLedger")||[];
  gemLedger.push({eventId:completionEventId,type:"SHARD_EARNED",landmark:s.landmark,amount:1,at:now});
  if(Math.floor((beforeShard+1)/6)>Math.floor(beforeShard/6))gemLedger.push({eventId:completionEventId,type:"COMPLETE_GEM_CONVERTED",landmark:s.landmark,completedGemDelta:1,sourceShards:6,at:now});
  events[completionEventId]={at:now,recordId:record.id};
  const totalExp=expLedger.reduce((sum,e)=>sum+(Number(e.amount)||0),0);
  await store.setMany([["records",records],["gems",gems],["expLedger",expLedger],["gemLedger",gemLedger],["completionEvents",events],["exp",totalExp],["lastResult",record],["active",null]]);
  await deps.updateStatus();
  await deps.recordCrewExperience("EXPLORATION_COMPLETE",{eventId:completionEventId,landmark:s.landmark,recordId:record.id,snippet:deps.crewSnippet(s.answers.join(" "))});
  await deps.recordBadgeBehaviorObservation("WRITING_EXPLORATION",{explicitCompletion:true,landmark:s.landmark,finalDraftChars:(s.draft||"").length,completionEventId},"SNAP_POP");
  await deps.recordBadgeEvent("WRITING_EXPLORATION",{landmark:s.landmark,finalDraftChars:(s.draft||"").length,learningUnitId:learningCtx?.learning_unit_id||null,completionEventId},"SNAP_POP");
  window.dispatchEvent(new CustomEvent("snap-pop:task-completed",{detail:{
    completionEventId,
    landmark:s.landmark,
    exp:expAward.total,
    child_authored:true,
    learning_unit_id:learningCtx?.learning_unit_id||null,
    analysis_id:learningCtx?.analysis_id||null,
    subject:learningCtx?.subject||null,
    writing_focus:s.crewState?.writingAnalysis?.focus||null,
    writing_provider:s.crewState?.writingAnalysis?.provider||null,
    learning_context_used:!!s.crewState?.writingAnalysis?.learningContextUsed||!!learningCtx,
    vocabulary_material:vocabEvidence,
    final_draft_chars:(s.draft||"").length
  }}));
  deps.toast(`탐험 완료! +${expAward.total} EXP · 보석 조각 +1`);deps.show("result")
}
async function onInput(){deps.bumpWritingAnalysisSeq();const s=await store.get("active");if(!s)return;const i=Math.min(2,s.step||0),text=q("#answer").value;deps.setExpressionBridgeButton(s.language||"ko",text);deps.ensureWritingState(s);s.draft=text;s.updatedAt=new Date().toISOString();await store.set("active",s);clearTimeout(window.crewInputTimer);if(text.trim().length>=8){window.crewInputTimer=setTimeout(async()=>{const cur=await store.get("active");if(!cur||Math.min(2,cur.step||0)!==i)return;deps.ensureWritingState(cur);cur.draft=q("#answer").value;await store.set("active",cur);const move=await deps.analyzeWritingMove(cur);if(!move)return;const msg=deps.stepSpecificReaction(cur.draft,cur.language||"ko",move);if(msg&&msg!==cur.crewState?.lastReaction)await deps.showCrewReaction(msg)},850)}}
async function setLanguage(language){const s=await store.get("active");if(!s)return;s.language=language;await store.set("active",s);deps.renderExplore(s)}
function install(){
  q("#startBtn").onclick=start;
  q("#nextBtn").onclick=advance;
  q("#answer").addEventListener("input",onInput);
  q("#modeKo").onclick=()=>setLanguage("ko");
  q("#modeEn").onclick=()=>setLanguage("en");
}
return Object.freeze({contract:"SNAP_POP_WRITING_FLOW_CONTROLLER_V1",install,start,advance,onInput,setLanguage});
}
window.SnapPopWritingFlowController=Object.freeze({instance(deps){if(!singleton)singleton=create(deps);return singleton}});
})();
