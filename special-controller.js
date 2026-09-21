(() => {
"use strict";
let singleton=null;
function create(deps){
const q=deps.query,store=window.SnapPopStorage;
function specialPromptFor(d=new Date()){const seed=(d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate())%4;return [
 {q:"오늘 본 것 중 하나를 완전히 다른 물건처럼 설명해볼까?",h:"정답은 없어요. 네가 본 장면을 바꿔 상상해봐요."},
 {q:"오늘 가장 기억나는 소리를 이야기 속 단서로 바꿔볼까?",h:"소리에서 시작해서 장면을 하나 만들어봐요."},
 {q:"누군가의 입장에서 오늘 하루를 다시 보면 뭐가 달라질까?",h:"다른 시선 하나만 골라도 충분해요."},
 {q:"평범한 장소에 비밀 하나가 숨어 있다면 무엇일까?",h:"작은 이상함 하나를 네 이야기로 키워봐요."}
 ][seed]}
async function openSpecial(){
  const p=specialPromptFor(),identity=await deps.resolvedIdentity();
  const guestTrigger=await store.get("activeCrewGuestTrigger");
  const guest=await deps.chooseSceneGuest("SPECIAL_EXPLORATION",{appearanceAuthorized:guestTrigger?.scene==="SPECIAL_EXPLORATION"&&guestTrigger?.authorized===true});
  if(guestTrigger?.scene==="SPECIAL_EXPLORATION")await store.set("activeCrewGuestTrigger",null);
  q("#specialDate").textContent=new Date().toLocaleDateString("ko-KR");
  q("#specialPrompt").textContent=p.q;
  q("#specialHint").textContent=`${deps.crewMemberName(identity)} · ${p.h}`;
  const presence=q("#specialCrewPresence");
  if(presence){
    presence.textContent=guest?`${deps.crewMemberName(identity)} · ${guest.name}도 이번 장면에 잠깐 합류했네. 스페셜은 더 강한 대원이 아니라 만나는 방식만 달라. 같이 보되, 네 생각은 네가 골라.`:"";
    presence.hidden=!guest;
    presence.dataset.memberId=guest?.memberId||"";
  }
  const draft=await store.get("specialDraft")||"";
  q("#specialAnswer").value=draft;
  deps.show("special")
}
async function saveSpecial(){const text=q("#specialAnswer").value.trim();if(!text)return deps.toast("한 줄이라도 네 생각을 남겨볼까?");const memories=await store.get("specialMemories")||[];const id=deps.uid("special"),at=new Date().toISOString(),p=specialPromptFor(new Date(at)),guestMemberId=q("#specialCrewPresence")?.dataset.memberId||null;memories.unshift({id,at,prompt:p.q,text,guestMemberId});await store.setMany([["specialMemories",memories],["specialDraft",""]]);await deps.recordCrewExperience("SPECIAL_MEMORY",{eventId:id,prompt:p.q,snippet:deps.crewSnippet(text),guestMemberId});if(guestMemberId)await deps.recordCrewMemberExperience(guestMemberId,"SHARED_MICRO_EPISODE",{eventId:`${id}_guest`,sourceEventId:id,scene:"SPECIAL_EXPLORATION"});await deps.recordBadgeBehaviorEvidence("SPECIAL_BEHAVIOR",{explicitChildAction:true,evidenceRef:`special_event_${id}`,sourceContractId:"SNAP_POP_DECLARED_SPECIAL_ACTION_V1",declaredByFeature:true,featureContractId:"SNAP_POP_SPECIAL_EXPLORATION_V1",behaviorCode:"SPECIAL_EXPLORATION_COMPLETED"},{allowedFeatureContracts:["SNAP_POP_SPECIAL_EXPLORATION_V1"],allowedSpecialBehaviorCodes:["SPECIAL_EXPLORATION_COMPLETED"]});q("#specialAnswer").value="";deps.toast("특별 탐험 기억을 남겼어요.");deps.show("records")}
function install(){
 q("#specialInvite").onclick=openSpecial;
 q("#specialBack").onclick=()=>deps.show("map");
 q("#specialLater").onclick=()=>deps.show("map");
 q("#specialAnswer").addEventListener("input",()=>store.set("specialDraft",q("#specialAnswer").value));
 q("#specialSave").onclick=saveSpecial;
}
return Object.freeze({contract:"SNAP_POP_SPECIAL_CONTROLLER_V1",install,specialPromptFor,openSpecial,saveSpecial});
}
window.SnapPopSpecialController=Object.freeze({instance(deps){if(!singleton)singleton=create(deps);return singleton}});
})();
