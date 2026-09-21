(() => {
"use strict";
let singleton=null;
function create(deps){
const q=deps.query,store=window.SnapPopStorage;let wishBusy=false;
async function startBonus(){const r=await store.get("lastResult");if(!r)return;const bonusEvents=await store.get("bonusEvents")||{},bonusEventId=`bonus_${r.completionEventId}`;if(bonusEvents[bonusEventId])return deps.toast("이미 완료한 추가 연습이에요.");const prompts={idea:"같은 아이디어로 다른 시작 문장 하나를 만들어볼까?",emotion:"같은 마음을 다른 말로 한 문장 표현해볼까?",description:"오감 하나를 더 넣어 장면을 한 문장 늘려볼까?",viewpoint:"다른 시선에서 한 문장만 더 써볼까?",final:"제목이나 마지막 문장 중 하나를 새로 다듬어볼까?"};q("#bonusQuestion").textContent=prompts[r.landmark]||"한 문장 더 만들어볼까?";q("#bonusAnswer").value="";q("#bonusPanel").hidden=false}
async function saveBonus(){const r=await store.get("lastResult");if(!r)return;const text=q("#bonusAnswer").value.trim();if(!text)return deps.toast("한 문장만 더 남겨볼까?");const bonusEvents=await store.get("bonusEvents")||{},bonusEventId=`bonus_${r.completionEventId}`;if(bonusEvents[bonusEventId])return deps.toast("이미 완료한 추가 연습이에요.");const gems=await store.get("gems")||{},gemLedger=await store.get("gemLedger")||[],beforeShard=gems[r.landmark]||0,at=new Date().toISOString();gems[r.landmark]=beforeShard+1;gemLedger.push({eventId:bonusEventId,type:"BONUS_SHARD_EARNED",landmark:r.landmark,amount:1,at});if(Math.floor((beforeShard+1)/6)>Math.floor(beforeShard/6))gemLedger.push({eventId:bonusEventId,type:"COMPLETE_GEM_CONVERTED",landmark:r.landmark,completedGemDelta:1,sourceShards:6,at});bonusEvents[bonusEventId]={at,landmark:r.landmark,text};await store.setMany([["gems",gems],["gemLedger",gemLedger],["bonusEvents",bonusEvents]]);await deps.recordBadgeBehaviorObservation("EXTRA_TASK",{explicitChoice:true,completed:true,landmark:r.landmark,bonusEventId},"SNAP_POP");await deps.updateStatus();q("#bonusPanel").hidden=true;q("#bonusStart").disabled=true;q("#bonusStart").textContent="추가 연습 완료됨";deps.toast("추가 연습 완료! 보석 조각 +1 · EXP 추가 없음")}
async function saveRecordRevision(){const recordId=q("#recordEdit").dataset.recordId,text=q("#recordEditText").value.trim();if(!recordId||!text)return deps.toast("수정할 내용을 남겨줘.");const records=await store.get("records")||[],r=records.find(x=>x.id===recordId);if(!r)return deps.toast("기록을 찾지 못했어요.");const revisions=await store.get("recordRevisions")||{},list=revisions[recordId]||[],current=list.length?list[list.length-1].text:r.answers.join(" ");if(text===current)return deps.toast("바뀐 내용이 없어요.");const explicitErrorFound=q("#recordEditErrorFound")?.checked===true;const previousArtifactRef=list.length?`record:${recordId}:revision:${list[list.length-1].id}`:`record:${recordId}:original`;const revisionId=deps.uid("revision"),revisionAt=new Date().toISOString();list.push({id:revisionId,at:revisionAt,text,source:"CHILD_EDIT",originalPreserved:true});revisions[recordId]=list;await store.set("recordRevisions",revisions);await deps.recordBadgeBehaviorObservation("RETRY",{explicitRevision:true,recordId,revisionId,revisionNumber:list.length,originalPreserved:true,rewardChanged:false},"SNAP_POP");if(explicitErrorFound){await deps.recordBadgeBehaviorEvidence("ERROR_DISCOVERY",{explicitChildAction:true,evidenceRef:`error_${revisionId}`,sourceContractId:"SNAP_POP_CHILD_SELF_CORRECTION_V1",errorMarkedByChild:true,beforeArtifactRef:previousArtifactRef,afterArtifactRef:`record:${recordId}:revision:${revisionId}`});}deps.toast("수정본을 저장했어요. 원문은 그대로 보존돼요.");deps.openRecordEdit(recordId)}
async function confirmBlessing(){
  if(wishBusy)return deps.toast("소원을 처리하고 있어요.");
  wishBusy=true;q("#confirmBlessing").disabled=true;
  try{
    const txns=await store.get("wishTransactions")||[];
    const g={...(await store.get("gems")||{})},gemLedger=await store.get("gemLedger")||[];let needCompleted=2;const spend={};
    for(const m of deps.getLandmarks()){const complete=Math.floor((g[m.id]||0)/6);const take=Math.min(complete,needCompleted);if(take){spend[m.id]=take;g[m.id]-=take*6;needCompleted-=take}if(!needCompleted)break}
    if(needCompleted){deps.toast("완성 보석 2개가 필요해요.");return}
    const id=deps.uid("wish_tx"),at=new Date().toISOString();
    Object.entries(spend).forEach(([landmark,count])=>gemLedger.push({eventId:id,type:"GEM_SPENT",landmark,completedGemDelta:-count,sourceShards:-count*6,at,reason:"WISH_BLESSING"}));
    txns.push({id,status:"COMPLETED",wish:"가족과 주말 영화 보기",spend,completedGemCount:2,at});
    await store.setMany([["gems",g],["gemLedger",gemLedger],["wishTransactions",txns]]);await deps.updateStatus();deps.renderGems();q("#blessing").hidden=true;if(!q("#wishHistoryList").hidden)deps.renderWishHistory();deps.toast("축복을 사용했어요. 소원 사용 내역에 기록됐어요.")
  }finally{wishBusy=false;q("#confirmBlessing").disabled=false}
}
function install(){
 q("#shopBtn").onclick=()=>deps.show("shop");
 q("#useWish").onclick=()=>{q("#blessing").hidden=false};
 q("#confirmBlessing").onclick=confirmBlessing;
 q("#bonusStart").onclick=startBonus;
 q("#bonusSave").onclick=saveBonus;
 q("#recordEditBack").onclick=()=>deps.show("records");
 q("#recordEditSave").onclick=saveRecordRevision;
 q("#wishHistoryBtn").onclick=deps.renderWishHistory;
}
return Object.freeze({contract:"SNAP_POP_RECORDS_FLOW_CONTROLLER_V1",install,startBonus,saveBonus,saveRecordRevision,confirmBlessing});
}
window.SnapPopRecordsFlowController=Object.freeze({instance(deps){if(!singleton)singleton=create(deps);return singleton}});
})();
