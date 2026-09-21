(() => {
  "use strict";
  const R=window.SnapPopFamilyExpansion;
  if(!R)return;
  const q=s=>document.querySelector(s);
  const escape=s=>String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  async function state(){
    return {
      enabled:!!(await get("familyExpansionEnabled")),
      children:await get("familyChildren")||[],
      activeChildId:await get("familyActiveChildId")||null,
      artifacts:await get("familyArtifacts")||[]
    };
  }
  async function ensureActiveChild(s){
    if(s.activeChildId&&s.children.some(x=>x.childId===s.activeChildId))return s.activeChildId;
    const first=s.children.find(x=>x.active!==false);
    if(first){await set("familyActiveChildId",first.childId);return first.childId}
    return null;
  }
  function featureLabel(id){return ({DIARY:"일기",LETTER:"편지·쪽지",SHARED_SPECIAL:"가족 공동 특별탐험",FAMILY_TIMELINE:"가족 성장기록",MULTI_CHILD:"다자녀 프로필",FAMILY_GROUP:"가족 그룹·초대·권한",MAILBOX_DECOR:"숲길 우체통·편지 꾸미기",SUPPORT_CARD:"응원 카드",GEM_GIFT:"보석조각 선물",COMPOSITE_DIARY_ILLUSTRATION:"조합형 일기 일러스트"})[id]||id}
  async function render(){
    const s=await state(),active=await ensureActiveChild(s);
    q("#familyExpansionToggle").checked=s.enabled;
    q("#familyExpansionMode").textContent=s.enabled?"사용 중":"사용 안 함";
    q("#familyChildSelect").innerHTML=s.children.length?s.children.map(c=>'<option value="'+escape(c.childId)+'" '+(c.childId===active?"selected":"")+'>'+escape(c.displayName||c.childId)+'</option>').join(""):'<option value="">먼저 아이 프로필을 추가해요</option>';
    q("#familyFeatureGrid").innerHTML=Object.values(R.features).map(f=>{
      const stateLabel=f.state==="ACTIVE"?"사용 가능":"준비 중";
      return '<article class="card familyFeature '+(f.state==="ACTIVE"?"":"locked")+'"><b>'+escape(featureLabel(f.id))+'</b><span>'+stateLabel+'</span></article>';
    }).join("");
    const list=active?R.timeline(s.artifacts,active):[];
    q("#familyTimeline").innerHTML=list.length?list.map(x=>'<article class="card"><b>'+escape(featureLabel(x.type))+'</b><span>'+new Date(x.at).toLocaleDateString("ko-KR")+'</span><p>'+escape(x.text)+'</p></article>').join(""):'<article class="card"><b>아직 가족 확장 기록이 없어요.</b><p>일기·편지·응원 카드가 이 아이의 기록으로 분리 저장됩니다.</p></article>';
    const enabled=s.enabled&&!!active;
    ["familyDiaryText","familyLetterText","familySupportText","familySharedSpecialText"].forEach(id=>{const el=q("#"+id);if(el)el.disabled=!enabled});
    ["familyDiarySave","familyLetterSave","familySupportSave","familySharedSpecialSave"].forEach(id=>{const el=q("#"+id);if(el)el.disabled=!enabled});
  }
  async function saveArtifact(type,inputId){
    const s=await state(),childId=await ensureActiveChild(s);
    if(!s.enabled)return toast("가족 확장팩을 먼저 켜주세요.");
    if(!childId)return toast("아이 프로필을 먼저 추가해주세요.");
    const input=q("#"+inputId),text=(input?.value||"").trim();
    if(!text)return toast("기록할 내용을 적어주세요.");
    try{
      const artifact=R.createArtifact(type,{childId,text,source:"CHILD_OR_FAMILY_EXPLICIT_INPUT"});
      const next=[artifact,...s.artifacts].slice(0,1000);
      await set("familyArtifacts",next);
      input.value="";
      await render();
      toast("가족 확장 기록에 저장했어요.");
    }catch(e){toast("저장 조건을 확인해주세요.");}
  }
  q("#familyExpansionBtn")?.addEventListener("click",async()=>{show("familyExpansion");await render()});
  q("#familyExpansionBack")?.addEventListener("click",()=>show("settings"));
  q("#familyExpansionToggle")?.addEventListener("change",async e=>{await set("familyExpansionEnabled",!!e.target.checked);await render()});
  q("#familyChildAdd")?.addEventListener("click",async()=>{
    const name=(q("#familyChildName")?.value||"").trim();if(!name)return toast("아이 이름을 입력해주세요.");
    const s=await state(),childId="child_"+Date.now().toString(36);
    const child=R.normalizeChild({childId,displayName:name});
    await setMany([["familyChildren",[...s.children,child]],["familyActiveChildId",childId]]);
    q("#familyChildName").value="";await render();
  });
  q("#familyChildSelect")?.addEventListener("change",async e=>{if(e.target.value)await set("familyActiveChildId",e.target.value);await render()});
  q("#familyDiarySave")?.addEventListener("click",()=>saveArtifact("DIARY","familyDiaryText"));
  q("#familyLetterSave")?.addEventListener("click",()=>saveArtifact("LETTER","familyLetterText"));
  q("#familySupportSave")?.addEventListener("click",()=>saveArtifact("SUPPORT_CARD","familySupportText"));
  q("#familySharedSpecialSave")?.addEventListener("click",()=>saveArtifact("SHARED_SPECIAL","familySharedSpecialText"));
  window.SnapPopFamilyExpansionApp=Object.freeze({render});
})();