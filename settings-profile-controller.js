(() => {
"use strict";
let singleton=null;
function create(deps){
const q=deps.query,qa=deps.queryAll,store=window.SnapPopStorage,esc=window.SnapPopUIShell.escapeHtml;
let sharedIdentity=null;
async function migrateIdentityFallback(){
  const existing=await store.get("identityFallback");
  if(existing){const normalized=deps.normalizeIdentity(existing);if(existing.guide||!existing.crewMember||existing.explorationCrewRulesVersion!==deps.getRules()?.version)await store.set("identityFallback",normalized);return normalized}
  const s=await store.get("settings")||{},asset=await store.get("characterSourceAsset");
  const migrated=deps.normalizeIdentity({profile:{name:s.characterName||"",photo:asset?.originalProfilePhoto||"",style:"editorial",shareAvatar:false},crewMember:{type:s.guideType||"maltipoo",name:s.guideName||"두비",voice:s.guideVoice||"warm"}});
  await store.set("identityFallback",migrated);
  return migrated;
}
async function resolvedIdentity(){const local=deps.normalizeIdentity(await store.get("identityFallback")||await migrateIdentityFallback());if(!sharedIdentity)return local;const shared=deps.normalizeIdentity(sharedIdentity);return {profile:shared.profile,crewMember:local.crewMember,explorationCrewRulesVersion:deps.getRules()?.version||local.explorationCrewRulesVersion}}
async function applySharedIdentity(identity){sharedIdentity=deps.normalizeIdentity({profile:identity?.profile||identity,crewMember:deps.IDENTITY_DEFAULT.crewMember});await renderIdentityPresence();return sharedIdentity}
async function selectCrewMember(memberId){
  const pool={...deps.getRules()?.legacyCharacterLineages,...deps.getRules()?.definedCharacterLineages},rule=pool[memberId];if(!rule)return;
  const registry=await deps.ensureCrewRegistry(),entry=registry[memberId];
  const identity=await resolvedIdentity();
  identity.crewMember={...identity.crewMember,type:memberId,name:entry.currentName||entry.firstName||rule.defaultName||"두비"};
  identity.explorationCrewRulesVersion=deps.getRules().version;
  await store.setMany([["identityFallback",identity],["crewRegistry",registry]]);
  return identity;
}
async function renameCurrentCrewMember(nextName){
  const identity=await resolvedIdentity(),memberId=identity.crewMember.type,registry=await deps.ensureCrewRegistry(),entry=registry[memberId];
  if(!entry)return identity;
  const next=(nextName||"").trim()||entry.currentName||entry.firstName||deps.crewMemberRule(identity).defaultName||"두비";
  if(next!==entry.currentName){
    entry.nameHistory=entry.nameHistory||[];
    entry.nameHistory.push({from:entry.currentName||entry.firstName||"",to:next,at:new Date().toISOString()});
    entry.currentName=next;
  }
  identity.crewMember.name=next;identity.explorationCrewRulesVersion=deps.getRules().version;
  await store.setMany([["crewRegistry",registry],["identityFallback",identity]]);
  return identity;
}
async function loadSettings(){const s=await store.get("settings")||{},asset=await store.get("characterSourceAsset"),identity=await resolvedIdentity();q("#autoRead").checked=!!s.autoRead;q("#reduceMotion").checked=!!s.reduceMotion;document.documentElement.classList.toggle("reduceMotion",!!s.reduceMotion);q("#characterSummary").textContent=identity.profile.name?`탐험가 · ${identity.profile.name}`:"Ready & Set 프로필 연동 대기";q("#crewMemberSummary").textContent=`${deps.crewMemberRule(identity).label} · ${deps.crewMemberName(identity)}`;q("#characterName").value=identity.profile.name||"";q("#crewMemberName").value=identity.crewMember.name||"두비";$q("[data-crew-member-type]").forEach(b=>b.classList.toggle("on",b.dataset.crewMemberType===identity.crewMember.type));if(asset?.originalProfilePhoto||identity.profile.photo){q("#profilePhotoPreview").hidden=false;q("#profilePhotoImage").src=asset?.originalProfilePhoto||identity.profile.photo;q("#profilePhotoStatus").textContent=sharedIdentity?"Ready & Set 공유 프로필 사용 중":asset?.characterMasterId?"Character Master 연결됨":"로컬 인트로 프로필 · 통합 시 Ready & Set 우선"}else{q("#profilePhotoPreview").hidden=true;q("#profilePhotoStatus").textContent=sharedIdentity?"Ready & Set 공유 프로필 사용 중":"로컬 인트로 프로필 없음"}}
async function renderCrewRoster(){
  if(!deps.getRules()?.roster)return;
  const identity=await resolvedIdentity(),roster=deps.getRules().roster,encounters=await store.get("crewEncounters")||{},board=deps.getRules().designBoard20||[],pool=deps.getRules().definedCharacterLineages||{};
  const starter=q("#starterCrewRoster"),world=q("#worldCrewRoster"),special=q("#specialCrewRoster");
  const card=x=>`<div class="crewRosterCard ${x.locked?"locked":x.unassigned?"unassigned":""}"><b>${esc(x.title)}</b><span>${esc(x.meta||"")}</span></div>`;

  if(starter){
    const baseline=window.SnapPopCrewCore6?.baseline?.(deps.getRules())||{memberIds:deps.getRules().recoveredStarterSix?.order||Object.keys(pool),scope:"STARTER_REFERENCE_ONLY",globalAuthority:false,futureExpansionAllowed:true};
    const order=baseline.memberIds;
    starter.innerHTML=`<div class="crewRosterNote"><b>시작 기준점 6명</b><span>Starter reference only · 전체 탐험대 고정 아님 · 미래 확장 허용</span></div>`+
      order.map(id=>{const m=pool[id];if(!m)return "";const on=identity.crewMember.type===id;const meta=[m.species,m.personality,m.visualStatus==="REFERENCE_APPEARANCE_LOCKED"?"Reference 외형 계보":"Visual ID 검증 필요"].filter(Boolean).join(" · ");return `<button type="button" class="crewRosterCard ${on?"on":""}" data-crew-member-id="${id}"><b>${esc(m.label)}</b><span>${esc(meta)}</span></button>`}).join("");
    starter.onclick=async e=>{const b=e.target.closest("[data-crew-member-id]");if(!b)return;const id=b.dataset.crewMemberId,rule=pool[id];if(!rule||!window.SnapPopCrewCore6?.isCore6?.(id))return;const next=await selectCrewMember(id);q("#crewMemberName").value=next.crewMember.name;q("#crewMemberPersonalityPreview").textContent=`${rule.label} · ${rule.personality||""}`;await renderIdentityPresence();await renderCrewRoster()};
  }

  if(world){
    const slots=board.filter(x=>x.role==="WORLD");
    world.innerHTML=slots.map(x=>card({title:`${String(x.slot).padStart(2,"0")} · ${x.core}`,meta:`${x.worldFlavor} · ${x.visualCue} · 앞으로 만날 탐험대원`,unassigned:true})).join("")+
      card({title:"거점에서 만나는 친구들",meta:"탐험 지역에 따라 새로운 친구를 차근차근 만나게 돼요.",unassigned:true});
  }

  if(special){
    const slots=board.filter(x=>x.role==="SPECIAL"),max=roster.special?.hardMaximum||12;
    special.innerHTML=slots.map(x=>{
      const state=encounters[`slot-${x.slot}`]?.status||"UNDISCOVERED";
      const roleContract=window.SnapPopCrewRoleGuard?.assertRoleContract?.({role:"SPECIAL",functionalAdvantage:false,powerBoost:false,rewardMultiplier:1,expMultiplier:1})||{roleMeaning:"ENCOUNTER_STYLE_ONLY",functionalAbility:"EQUAL"};
      return card({title:`${String(x.slot).padStart(2,"0")} · ${x.core}`,meta:`${x.encounterGimmick||x.worldFlavor} · ${state==="UNDISCOVERED"?"아직 만나지 못한 친구":"만난 친구"} · 만나는 방식만 특별해요`,locked:state==="UNDISCOVERED"});
    }).join("")+card({title:`스페셜 탐험대 · 최대 ${max}명`,meta:"새로운 친구는 탐험 속 특별한 만남으로 이어져요. 능력의 우열은 없어요.",unassigned:true});
  }
}
async function renderIdentityPresence(){if(!window.SnapPopStorage.isOpen())return;const identity=await resolvedIdentity(),visual=q("#homeCharacterVisual"),rule=deps.crewMemberRule(identity),name=deps.crewMemberName(identity);q("#homeCharacterName").textContent=identity.profile.name||"나의 탐험가";q("#homeCrewMemberName").textContent=name;const registry0=await deps.ensureCrewRegistry(),entry0=registry0[identity.crewMember.type],ws=entry0?.worldState?.state;const worldLabel={AT_HUB:"거점에 있음",EXPEDITION:"탐험 파견 중",SUPPORTING_OTHER_HUB:"다른 거점 지원 중",VACATION:"휴가 중",RESTING:"쉬는 중",FREE_EXPLORING:"자유 탐험 중",SPECIAL_EVENT:"작은 사건 중",MAIN_COMPANION:"함께 탐험 중"}[ws]||"";q("#homeCrewMemberLine").textContent=[rule.home||"",worldLabel].filter(Boolean).join(" · ");const memberVisual=q("#homeCrewMember .crewMemberPlaceholder");if(memberVisual)memberVisual.textContent=rule.label;if(identity.profile.photo){visual.innerHTML=`<img src="${identity.profile.photo}" alt="">`}else visual.textContent=(identity.profile.name||"탐험가").slice(0,2);const registry=await deps.ensureCrewRegistry(),entry=registry[identity.crewMember.type],tier=deps.affinityTier(entry?.affinity?.scoreInternal||0);q("#growthCompanion").textContent=`${identity.profile.name||"탐험가"} · ${name} · ${tier.label}`;q("#crewMemberPersonalityPreview").textContent=`${rule.label} · ${rule.personality||""} · 관계 ${tier.label}`}
async function clearSharedIdentity(){sharedIdentity=null;await renderIdentityPresence()}
function hasSharedIdentity(){return !!sharedIdentity}
function install(){
 q("#settingsBtn").onclick=()=>deps.show("settings");
 q("#settingsBack").onclick=()=>deps.show(deps.getLastMain());
 q("#characterBtn").onclick=()=>{q("#characterPanel").hidden=!q("#characterPanel").hidden};
 q("#crewMemberBtn").onclick=async()=>{q("#crewMemberPanel").hidden=!q("#crewMemberPanel").hidden;if(!q("#crewMemberPanel").hidden)await renderCrewRoster()};
 q("#profilePhotoInput").onchange=async e=>{const file=e.target.files?.[0];if(!file)return;if(!file.type.startsWith("image/"))return deps.toast("이미지 파일만 사용할 수 있어요.");const reader=new FileReader();reader.onload=async()=>{const data=String(reader.result||""),previous=await store.get("characterSourceAsset"),history=await store.get("characterSourceHistory")||[];if(previous?.originalProfilePhoto)history.push({...previous,archivedAt:new Date().toISOString()});const asset={assetId:deps.uid("profile_source"),originalProfilePhoto:data,processedProfilePhoto:null,characterMasterId:previous?.characterMasterId||null,status:"SOURCE_READY",createdAt:new Date().toISOString(),sourceName:file.name||"camera"};const identity=await resolvedIdentity();identity.profile.photo=data;await store.setMany([["characterSourceAsset",asset],["characterSourceHistory",history],["identityFallback",identity]]);q("#profilePhotoPreview").hidden=false;q("#profilePhotoImage").src=data;q("#profilePhotoStatus").textContent="로컬 인트로 프로필 · 통합 시 Ready & Set 우선";await renderIdentityPresence();deps.toast("인트로용 로컬 프로필 사진을 보존했어요. 통합 시 Ready & Set 프로필이 우선합니다.")};reader.onerror=()=>deps.toast("사진을 읽지 못했어요.");reader.readAsDataURL(file)};
 q("#characterSave").onclick=async()=>{const name=q("#characterName").value.trim(),identity=await resolvedIdentity();identity.profile.name=name;await store.set("identityFallback",identity);q("#characterSummary").textContent=name?`탐험가 · ${name}`:"Ready & Set 프로필 연동 대기";q("#characterPanel").hidden=true;await renderIdentityPresence();deps.toast(sharedIdentity?"공유 프로필은 Ready & Set 기준을 유지합니다. 로컬 fallback만 저장했어요.":"인트로용 로컬 프로필을 저장했어요. 통합 시 Ready & Set 기준이 우선합니다.")};
 q("#crewMemberSuggest").onclick=async()=>{const identity=await resolvedIdentity(),suggestions={maltipoo:["모카","토리","콩"],cat:["루루","모노","살짝"],redpanda:["포포","단추","뒤적"],buddy:["하루","담이","솔"]},arr=suggestions[identity.crewMember.type]||[deps.crewMemberRule(identity).defaultName||"두비"];q("#crewMemberName").value=arr[Math.floor(Date.now()/1000)%arr.length]};
 q("#crewMemberSave").onclick=async()=>{const identity=await renameCurrentCrewMember(q("#crewMemberName").value);const name=identity.crewMember.name;q("#crewMemberSummary").textContent=`${deps.crewMemberRule(identity).label} · ${name}`;qa(".crewMemberLine b").forEach(el=>el.textContent=`탐험대원 ${name}`);q("#crewMemberPanel").hidden=true;await renderIdentityPresence();deps.toast("탐험대원 이름과 이력을 저장했어요.")};
 const savePrefs=async()=>{const s=await store.get("settings")||{};s.autoRead=q("#autoRead").checked;s.reduceMotion=q("#reduceMotion").checked;await store.set("settings",s);document.documentElement.classList.toggle("reduceMotion",s.reduceMotion)};
 q("#autoRead").onchange=savePrefs;q("#reduceMotion").onchange=savePrefs;
}
window.SnapPopIdentity=Object.freeze({applyShared:applySharedIdentity,clearShared:clearSharedIdentity,getResolved:resolvedIdentity});
return Object.freeze({contract:"SNAP_POP_SETTINGS_PROFILE_CONTROLLER_V1",install,migrateIdentityFallback,resolvedIdentity,applySharedIdentity,clearSharedIdentity,hasSharedIdentity,selectCrewMember,renameCurrentCrewMember,loadSettings,renderCrewRoster,renderIdentityPresence});
}
window.SnapPopSettingsProfileController=Object.freeze({instance(deps){if(!singleton)singleton=create(deps);return singleton}});
})();
