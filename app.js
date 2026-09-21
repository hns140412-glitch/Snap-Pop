const $=q=>document.querySelector(q), $$=q=>[...document.querySelectorAll(q)];
let db, marks=[], selected=null, lastMain="map", calendarCursor=new Date(), wishBusy=false, SNAP_RULES=null, writingAnalysisSeq=0;
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
const LEVEL_NEEDS=[0,80,100,120,150,180,220,260,300,340,380,430,480,540,600,670,740,820,900,990,1080,1180,1280,1390,1500];
const LEVEL_THRESHOLDS=LEVEL_NEEDS.reduce((a,n,i)=>{a.push(i===0?0:a[i-1]+n);return a},[]);
const uid=p=>`${p}_${Date.now()}_${Math.random().toString(36).slice(2,9)}`;
const IDENTITY_DEFAULT={profile:{name:"",photo:"",style:"editorial",shareAvatar:false},crewMember:{type:"dooby",name:"두비",voice:"warm"}};
let sharedIdentity=null;
function normalizeCrewType(type){return ({lumi:"maltipoo",pico:"redpanda",mori:"buddy"}[type]||type||"dooby")}
function normalizeIdentity(x={}){
  const p=x.profile||{},legacy=x.guide||{},member=x.crewMember||legacy,type=normalizeCrewType(member.type);
  return {profile:{...IDENTITY_DEFAULT.profile,...p},crewMember:{...IDENTITY_DEFAULT.crewMember,...member,type},explorationCrewRulesVersion:SNAP_RULES?.version||x.explorationCrewRulesVersion||"PENDING"};
}
function crewMemberRule(identity){const type=normalizeCrewType(identity?.crewMember?.type),pool=SNAP_RULES?.definedCharacterLineages||{},legacy=SNAP_RULES?.legacyCharacterLineages||{};return pool[type]||legacy[type]||pool.dooby||{label:"탐험대원",defaultName:"두비",home:"같이 가자.",reactions:{},behavior:{}}}
function crewReaction(identity,landmark){return crewMemberRule(identity).reactions?.[landmark]||"한 조각씩 같이 찾아보자."}
function crewMemberName(identity){return identity?.crewMember?.name||crewMemberRule(identity).defaultName||"두비"}

function stableHash(s=""){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function affinityTier(score=0){const tiers=SNAP_RULES?.affinityEngine?.tiers||[];let t=tiers[0]||{key:"KNOWN",label:"아는 친구",min:0};for(const x of tiers)if(score>=x.min)t=x;return t}
async function recordBadgeBehaviorObservation(family,payload={},source="SNAP_POP"){
  if(!window.SnapPopBadgeBehavior)return null;
  try{
    const event=window.SnapPopBadgeBehavior.normalize({
      eventId:uid("badgeobs"),
      family,
      source,
      at:new Date().toISOString(),
      payload
    });
    const ledger=await get("badgeBehaviorObservations")||[];
    if(ledger.some(x=>x.eventId===event.eventId))return event;
    ledger.unshift(event);
    await set("badgeBehaviorObservations",ledger.slice(0,1000));
    return event;
  }catch{return null}
}

async function recordBadgeEvent(family,payload={},source="SNAP_POP"){
  if(!window.SnapPopBadges)return null;
  try{
    await window.SnapPopBadges.load();
    const event=window.SnapPopBadges.normalizeEvent({eventId:uid("badgeevt"),family,source,payload,at:new Date().toISOString()});
    const ledger=await get("badgeEvents")||[];
    if(ledger.some(x=>x.eventId===event.eventId))return event;
    ledger.unshift(event);
    await set("badgeEvents",ledger.slice(0,1000));
    const matches=window.SnapPopBadges.matchEvent(event);
    if(matches.length){
      const owned=await get("badgeProgress")||{};
      for(const item of matches){
        const key=item.id||item.draftId;
        const prev=owned[key]||{count:0};
        owned[key]={count:(prev.count||0)+1,...window.SnapPopBadges.nextProgress(prev.count||0),lastAt:event.at};
      }
      await set("badgeProgress",owned);
    }
    return event;
  }catch{return null}
}
async function recordCrewMemberExperience(memberId,type,meta={}){
  const registry=await ensureCrewRegistry();if(!memberId||!registry[memberId])return null;
  const entry=registry[memberId],eventId=meta.eventId||uid("crewmem");
  entry.memories=entry.memories||[];
  if(entry.memories.some(x=>x.eventId===eventId))return entry;
  const weight={EXPLORATION_COMPLETE:2,SPECIAL_MEMORY:2,SHARED_MICRO_EPISODE:1,REUNION:0,VOICE_EXPRESSION:0}[type]??0;
  entry.memories.push({eventId,type,at:new Date().toISOString(),...meta});
  entry.affinity=entry.affinity||{levelKey:"KNOWN",scoreInternal:0};
  entry.affinity.scoreInternal=(entry.affinity.scoreInternal||0)+weight;
  const tier=affinityTier(entry.affinity.scoreInternal);entry.affinity.levelKey=tier.key;entry.lastMetAt=new Date().toISOString();
  await set("crewRegistry",registry);return entry;
}
async function recordCrewExperience(type,meta={}){
  const identity=await resolvedIdentity(),id=identity.crewMember?.type;
  return recordCrewMemberExperience(id,type,meta);
}
function crewPerformance(identity,kind="observe"){
  const r=crewMemberRule(identity),gesture=r.gestures?.[kind]||r.gestures?.observe||"",motifs=r.reactionMotifs||[];
  return {gesture,motif:motifs.length?motifs[stableHash((identity.crewMember?.type||"")+"|"+kind)%motifs.length]:""};
}
async function chooseSceneGuest(sceneKey,{sceneMood=null}={}){
  if(!window.SnapPopCrewOrchestration||!SNAP_RULES?.crewInteractionOrchestration?.guestSelection?.enabled)return null;
  const identity=await resolvedIdentity(),registry=await ensureCrewRegistry(),recent=await get("crewGuestAppearances")||[];
  const members={...SNAP_RULES?.legacyCharacterLineages,...SNAP_RULES?.definedCharacterLineages};
  const picked=window.SnapPopCrewOrchestration.chooseGuest({
    mainId:identity.crewMember?.type,
    registry,
    members,
    recentAppearances:recent,
    sceneMood,
    sceneKey
  });
  if(!picked)return null;
  const nextLedger=window.SnapPopCrewOrchestration.recordAppearance(recent,picked.memberId,sceneKey);
  await set("crewGuestAppearances",nextLedger);
  const entry=registry[picked.memberId]||{};
  const rule=members[picked.memberId]||{};
  return {
    ...picked,
    name:entry.currentName||entry.firstName||rule.defaultName||rule.label||"탐험대원",
    label:rule.label||entry.currentName||picked.memberId,
    personality:rule.personality||""
  };
}

async function synthesizeCrewWorldState(){
  const identity=await resolvedIdentity(),registry=await ensureCrewRegistry(),mainId=identity.crewMember?.type,now=new Date();
  const background=(SNAP_RULES?.worldStateEngine?.states||["AT_HUB"]).filter(x=>x!=="MAIN_COMPANION");
  let mainState=null;
  for(const [id,entry] of Object.entries(registry)){
    const last=entry.lastMetAt?new Date(entry.lastMetAt):null,days=last?Math.max(0,Math.floor((now-last)/86400000)):0,previous=entry.worldState?.state;
    const seed=stableHash([id,last?.toISOString()?.slice(0,10)||"first",now.toISOString().slice(0,10),entry.memories?.length||0].join("|"));
    const state=id===mainId?"MAIN_COMPANION":background[seed%background.length];
    entry.worldState={state,generatedAt:now.toISOString(),daysSinceSeen:days,synthetic:true};
    if(id===mainId){mainState=entry.worldState;if(days>=2){const evId=`reunion_${id}_${now.toISOString().slice(0,10)}`;entry.memories=entry.memories||[];if(!entry.memories.some(x=>x.eventId===evId))entry.memories.push({eventId:evId,type:"REUNION",at:now.toISOString(),daysAway:days,fromState:previous,toState:state})}}
  }
  await set("crewRegistry",registry);return mainState;
}

async function migrateLegacyState(){
  const marker=await get("migration_20260920_state_v1");
  if(marker)return;
  const entries=[],records=await get("records")||[],events=await get("completionEvents")||{},expLedger=await get("expLedger")||[],legacyExp=Number(await get("exp")||0),active=await get("active");
  let changedRecords=false;
  records.forEach((r,i)=>{
    if(!r.id){r.id=uid("record");changedRecords=true}
    if(!r.completionEventId){r.completionEventId=`legacy_completion_${r.id}`;changedRecords=true}
    if(!r.language){r.language="ko";changedRecords=true}
    if(r.completionEventId&&!events[r.completionEventId])events[r.completionEventId]={at:r.date||new Date(0).toISOString(),recordId:r.id,legacy:true};
  });
  if(changedRecords)entries.push(["records",records]);
  entries.push(["completionEvents",events]);
  const ledgerTotal=expLedger.reduce((s,e)=>s+(Number(e.amount)||0),0);
  if(legacyExp>ledgerTotal){
    expLedger.unshift({eventId:"legacy_exp_baseline_20260920",type:"LEGACY_EXP_BASELINE",amount:legacyExp-ledgerTotal,at:new Date().toISOString(),legacy:true});
    entries.push(["expLedger",expLedger],["exp",legacyExp]);
  }else if(ledgerTotal>legacyExp){
    entries.push(["exp",ledgerTotal]);
  }
  if(active&&!active.id){active.id=uid("explore_legacy");active.language=active.language||"ko";entries.push(["active",active])}
  entries.push(["migration_20260920_state_v1",{at:new Date().toISOString(),records:records.length,legacyExp,ledgerTotalBefore:ledgerTotal}]);
  await setMany(entries);
}
async function migrateIdentityFallback(){
  const existing=await get("identityFallback");
  if(existing){const normalized=normalizeIdentity(existing);if(existing.guide||!existing.crewMember||existing.explorationCrewRulesVersion!==SNAP_RULES?.version)await set("identityFallback",normalized);return normalized}
  const s=await get("settings")||{},asset=await get("characterSourceAsset");
  const migrated=normalizeIdentity({profile:{name:s.characterName||"",photo:asset?.originalProfilePhoto||"",style:"editorial",shareAvatar:false},crewMember:{type:s.guideType||"maltipoo",name:s.guideName||"두비",voice:s.guideVoice||"warm"}});
  await set("identityFallback",migrated);
  return migrated;
}
async function resolvedIdentity(){const local=normalizeIdentity(await get("identityFallback")||await migrateIdentityFallback());if(!sharedIdentity)return local;const shared=normalizeIdentity(sharedIdentity);return {profile:shared.profile,crewMember:local.crewMember,explorationCrewRulesVersion:SNAP_RULES?.version||local.explorationCrewRulesVersion}}
async function applySharedIdentity(identity){sharedIdentity=normalizeIdentity({profile:identity?.profile||identity,crewMember:IDENTITY_DEFAULT.crewMember});await renderIdentityPresence();return sharedIdentity}
window.SnapPopIdentity=Object.freeze({applyShared:applySharedIdentity,clearShared:async()=>{sharedIdentity=null;await renderIdentityPresence()},getResolved:resolvedIdentity});

function openDB(){return new Promise((ok,no)=>{const r=indexedDB.open("snap_pop_rev10",1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains("state"))r.result.createObjectStore("state")};r.onsuccess=()=>{db=r.result;ok()};r.onerror=()=>no(r.error)})}
function get(k){return new Promise(ok=>{const r=db.transaction("state").objectStore("state").get(k);r.onsuccess=()=>ok(r.result)})}
function set(k,v){return new Promise((ok,no)=>{const r=db.transaction("state","readwrite").objectStore("state").put(v,k);r.onsuccess=()=>ok();r.onerror=()=>no(r.error)})}
function setMany(entries){return new Promise((ok,no)=>{const tx=db.transaction("state","readwrite"),store=tx.objectStore("state");entries.forEach(([k,v])=>store.put(v,k));tx.oncomplete=()=>ok();tx.onerror=()=>no(tx.error);tx.onabort=()=>no(tx.error)})}
async function ensureCrewRegistry(){
  const registry=await get("crewRegistry")||{},identity=await resolvedIdentity();
  for(const [id,rule] of Object.entries({...SNAP_RULES?.legacyCharacterLineages,...SNAP_RULES?.definedCharacterLineages})){
    registry[id]=registry[id]||{memberId:id,firstName:rule.defaultName||"",currentName:rule.defaultName||"",nameHistory:[],affinity:{levelKey:"OPEN",scoreInternal:0},memories:[],firstMetAt:null,lastMetAt:null,encounterStatus:"STARTER_AVAILABLE"};
  }
  const current=identity.crewMember?.type;
  if(current&&registry[current]){
    if(identity.crewMember.name&&identity.crewMember.name!==registry[current].currentName){
      registry[current].currentName=identity.crewMember.name;
      if(!registry[current].firstName)registry[current].firstName=identity.crewMember.name;
    }
  }
  await set("crewRegistry",registry);
  return registry;
}
async function selectCrewMember(memberId){
  const pool={...SNAP_RULES?.legacyCharacterLineages,...SNAP_RULES?.definedCharacterLineages},rule=pool[memberId];if(!rule)return;
  const registry=await ensureCrewRegistry(),entry=registry[memberId];
  const identity=await resolvedIdentity();
  identity.crewMember={...identity.crewMember,type:memberId,name:entry.currentName||entry.firstName||rule.defaultName||"두비"};
  identity.explorationCrewRulesVersion=SNAP_RULES.version;
  await setMany([["identityFallback",identity],["crewRegistry",registry]]);
  return identity;
}
async function renameCurrentCrewMember(nextName){
  const identity=await resolvedIdentity(),memberId=identity.crewMember.type,registry=await ensureCrewRegistry(),entry=registry[memberId];
  if(!entry)return identity;
  const next=(nextName||"").trim()||entry.currentName||entry.firstName||crewMemberRule(identity).defaultName||"두비";
  if(next!==entry.currentName){
    entry.nameHistory=entry.nameHistory||[];
    entry.nameHistory.push({from:entry.currentName||entry.firstName||"",to:next,at:new Date().toISOString()});
    entry.currentName=next;
  }
  identity.crewMember.name=next;identity.explorationCrewRulesVersion=SNAP_RULES.version;
  await setMany([["crewRegistry",registry],["identityFallback",identity]]);
  return identity;
}

function toast(t){$("#toast").textContent=t;$("#toast").classList.add("show");clearTimeout(window.tt);window.tt=setTimeout(()=>$("#toast").classList.remove("show"),1800)}
function show(id){$(".view").forEach(v=>v.classList.remove("active"));$("#"+id).classList.add("active");const sub=["settings","shop","result","special","recordEdit"].includes(id);$("#nav").hidden=sub;if(!sub)lastMain=id;$(".nav button").forEach(b=>b.classList.toggle("on",b.dataset.view===id));scrollTo(0,0);if(id==="records")renderRecords();if(id==="gems")renderGems();if(id==="growth")renderGrowth();if(id==="result")renderLastResult()}
function html(s){return (s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function levelFromExp(exp){let level=1;for(let i=1;i<LEVEL_THRESHOLDS.length;i++){if(exp>=LEVEL_THRESHOLDS[i])level=i+1;else break}return Math.min(25,level)}
function levelProgress(exp){const level=levelFromExp(exp);if(level>=25)return {level,within:1,remaining:0};const floor=LEVEL_THRESHOLDS[level-1],ceil=LEVEL_THRESHOLDS[level];return {level,within:Math.max(0,Math.min(1,(exp-floor)/(ceil-floor))),remaining:Math.max(0,ceil-exp)}}
function calcExp(answers,completedCount,language="ko"){
  const text=answers.join(" ").trim(),len=text.length;
  const initial=completedCount<5?12:completedCount<15?7:3;
  const strengths=[];let mastery=0;
  if(len>=80){mastery+=3;strengths.push(language==="en"?"writing longer":"길게 이어 쓰기")}
  if(len>=150){mastery+=3;strengths.push(language==="en"?"expanding an idea":"생각 충분히 펼치기")}
  const reason=language==="en"?/because|think|feel|idea|reason|so/i:/왜|이유|때문|느낌|기분|생각|아이디어|마음/;
  const sensory=language==="en"?/see|saw|hear|heard|sound|smell|taste|touch|warm|cold|bright|dark|scene/i:/보이|들리|냄새|향|맛|촉감|따뜻|차갑|밝|어둡|장면|풍경|소리/;
  if(reason.test(text)){mastery+=3;strengths.push(language==="en"?"reason·feeling·idea":"이유·감정·아이디어")}
  if(sensory.test(text)){mastery+=3;strengths.push(language==="en"?"sensory detail":"감각·장면")}
  if(/[.!?。！？]/.test(text)){mastery+=2;strengths.push(language==="en"?"sentence control":"문장 나누기")}
  mastery=Math.min(14,mastery);
  return {total:34+initial+mastery,base:34,initial,mastery,strengths};
}
async function loadSettings(){const s=await get("settings")||{},asset=await get("characterSourceAsset"),identity=await resolvedIdentity();$("#autoRead").checked=!!s.autoRead;$("#reduceMotion").checked=!!s.reduceMotion;document.documentElement.classList.toggle("reduceMotion",!!s.reduceMotion);$("#characterSummary").textContent=identity.profile.name?`탐험가 · ${identity.profile.name}`:"Ready & Set 프로필 연동 대기";$("#crewMemberSummary").textContent=`${crewMemberRule(identity).label} · ${crewMemberName(identity)}`;$("#characterName").value=identity.profile.name||"";$("#crewMemberName").value=identity.crewMember.name||"두비";$$("[data-crew-member-type]").forEach(b=>b.classList.toggle("on",b.dataset.crewMemberType===identity.crewMember.type));if(asset?.originalProfilePhoto||identity.profile.photo){$("#profilePhotoPreview").hidden=false;$("#profilePhotoImage").src=asset?.originalProfilePhoto||identity.profile.photo;$("#profilePhotoStatus").textContent=sharedIdentity?"Ready & Set 공유 프로필 사용 중":asset?.characterMasterId?"Character Master 연결됨":"로컬 인트로 프로필 · 통합 시 Ready & Set 우선"}else{$("#profilePhotoPreview").hidden=true;$("#profilePhotoStatus").textContent=sharedIdentity?"Ready & Set 공유 프로필 사용 중":"로컬 인트로 프로필 없음"}}
async function renderCrewRoster(){
  if(!SNAP_RULES?.roster)return;
  const identity=await resolvedIdentity(),roster=SNAP_RULES.roster,encounters=await get("crewEncounters")||{},board=SNAP_RULES.designBoard20||[],pool=SNAP_RULES.definedCharacterLineages||{};
  const starter=$("#starterCrewRoster"),world=$("#worldCrewRoster"),special=$("#specialCrewRoster");
  const card=x=>`<div class="crewRosterCard ${x.locked?"locked":x.unassigned?"unassigned":""}"><b>${html(x.title)}</b><span>${html(x.meta||"")}</span></div>`;

  if(starter){
    const order=SNAP_RULES.recoveredStarterSix?.order||Object.keys(pool);
    starter.innerHTML=order.map(id=>{const m=pool[id];if(!m)return "";const on=identity.crewMember.type===id;const meta=[m.species,m.personality,m.visualStatus==="REFERENCE_APPEARANCE_LOCKED"?"Reference 외형 계보":"Visual ID 검증 필요"].filter(Boolean).join(" · ");return `<button type="button" class="crewRosterCard ${on?"on":""}" data-crew-member-id="${id}"><b>${html(m.label)}</b><span>${html(meta)}</span></button>`}).join("");
    starter.onclick=async e=>{const b=e.target.closest("[data-crew-member-id]");if(!b)return;const id=b.dataset.crewMemberId,rule=pool[id];if(!rule)return;const next=await selectCrewMember(id);$("#crewMemberName").value=next.crewMember.name;$("#crewMemberPersonalityPreview").textContent=`${rule.label} · ${rule.personality||""}`;await renderIdentityPresence();await renderCrewRoster()};
  }

  if(world){
    const slots=board.filter(x=>x.role==="WORLD");
    world.innerHTML=slots.map(x=>card({title:`${String(x.slot).padStart(2,"0")} · ${x.core}`,meta:`${x.worldFlavor} · ${x.visualCue} · WORKING ROLE SLOT`,unassigned:true})).join("")+
      card({title:"거점 인원 규칙",meta:"6명은 WORKING 설계판 · 실제 인원은 앱/거점 역할 계산 후 확정",unassigned:true});
  }

  if(special){
    const slots=board.filter(x=>x.role==="SPECIAL"),max=roster.special?.hardMaximum||12;
    special.innerHTML=slots.map(x=>{
      const state=encounters[`slot-${x.slot}`]?.status||"UNDISCOVERED";
      return card({title:`${String(x.slot).padStart(2,"0")} · ${x.core}`,meta:`${x.encounterGimmick||x.worldFlavor} · ${state==="UNDISCOVERED"?"미발견/설계 슬롯":state}`,locked:state==="UNDISCOVERED"});
    }).join("")+card({title:`확장 여유 · 최대 ${max}명 이하`,meta:"현재 8개 WORKING 스페셜 슬롯 + 추가 최대 4개 여유 · 실제 인원 OPEN",unassigned:true});
  }
}
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
function setModeButtons(language){$("#modeKo")?.classList.toggle("on",language!=="en");$("#modeEn")?.classList.toggle("on",language==="en")}
async function init(){await openDB();await migrateLegacyState();SNAP_RULES=await fetch("data/exploration-crew-rules.json").then(r=>r.json());marks=await fetch("data/landmarks.json").then(r=>r.json());await migrateIdentityFallback();await ensureCrewRegistry();await synthesizeCrewWorldState();renderLandmarks();await renderPendingExpressionIntent();await loadSettings();await renderIdentityPresence();await updateStatus();renderRecords();renderGems();renderGrowth();await renderIncomingHandoff();renderSpecialInvite();const active=await get("active");if(active)renderExplore(active)}

function renderLandmarks(){const host=$("#landmarks");host.innerHTML="";marks.forEach(m=>{const b=document.createElement("button");b.className="landmark";b.textContent=m.title;b.style.left=m.x+"%";b.style.top=m.y+"%";b.onclick=async()=>{selected=m;$$(".landmark").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");const a=await get("active"),g=await get("gems")||{};$("#selTitle").textContent=m.title;$("#selDesc").textContent=m.desc;const identity=await resolvedIdentity();$("#selCrewMemberReaction").textContent=`${crewMemberName(identity)} · ${crewReaction(identity,m.id)}`;$("#selProgress").textContent="진행 "+(a?.landmark===m.id?(Math.min(3,(a.step||0)+1)):0)+" / 3";$("#selShard").textContent="보석 조각 "+((g[m.id]||0)%6)+" / 6";$("#selection").hidden=false};host.appendChild(b)})}
$("#startBtn").onclick=async()=>{if(!selected)return;let s=await get("active"),created=false;if(!s||s.landmark!==selected.id){s={id:uid("explore"),landmark:selected.id,step:0,answers:["","",""],snapshots:["","",""],draft:"",language:"ko",startedAt:new Date().toISOString()};created=true}if(!s.language)s.language="ko";if(created){const pending=await get("pendingExpressionIntent");if(pending?.question){s.expressionIntent={source:"VERIFIED_ASK",question:pending.question,questionLanguage:pending.language||"ko",answerTransferred:false,createdAt:pending.createdAt||new Date().toISOString()};await recordExpressionTrace("VERIFIED_ASK_EXPRESSION_ATTACHED",{source:"VERIFIED_ASK",questionLanguage:pending.language||"ko",verifiedCoverage:pending.verifiedCoverage||null,questionChars:pending.question.length,landmark:selected.id});await set("pendingExpressionIntent",null);await renderPendingExpressionIntent()}}ensureWritingState(s);await set("active",s);renderExplore(s);show("explore");setTimeout(()=>analyzeWritingMove(s),0);if($("#autoRead").checked){const p=promptFor(s.landmark,s.step,s.language,s.draft);speak(p[0],s.language,"AUTO_READ")}}


function crewSnippet(text){const clean=(text||"").trim().replace(/\s+/g," ");return clean.length>18?clean.slice(0,18)+"…":clean}
function focusGuide(focus,language='ko'){
  const ko={START:'첫 생각 하나면 돼.',CONNECT:'이제 이유나 연결 하나만 붙이면 돼.',NEXT_SCENE:'다음 장면 하나만 이어보자.',SHAPE:'중심 문장을 살려보자.',FEELING:'마음의 단서 하나만 더 잡아보자.',WHY_FEEL:'그 마음이 생긴 장면 하나만 붙여보자.',CHANGE:'마음이 어떻게 달라졌는지 보면 돼.',SENSORY:'감각 단서 하나만 더 있으면 장면이 살아나.',SPECIFIC:'지금 단서 하나만 더 구체적으로 해보자.',OWN_VIEW:'네 생각 한 줄이 중심이야.',OTHER_VIEW:'다른 시선 하나만 더 보면 돼.',REASON:'이유 하나만 붙이면 생각이 선명해져.',POSITION:'네 입장이 보이는 한 문장을 남겨보자.',ENDING:'끝에 남길 생각 하나만 잡아보자.',REVISE:'전체 말고 한 곳만 다듬자.'};
  const en={START:'One small thought is enough.',CONNECT:'Add just one reason or connection.',NEXT_SCENE:'Add one next scene.',SHAPE:'Keep the central sentence strong.',FEELING:'Add one clue about the feeling.',WHY_FEEL:'Add one small moment that caused the feeling.',CHANGE:'Notice whether the feeling changed.',SENSORY:'One sensory clue will bring the scene closer.',SPECIFIC:'Make just one detail more specific.',OWN_VIEW:'Your own view is the center.',OTHER_VIEW:'Add one other point of view.',REASON:'One reason will make the idea clearer.',POSITION:'Leave one sentence that shows your position.',ENDING:'Choose one thought to leave at the end.',REVISE:'Revise one spot, not the whole piece.'};
  return (language==='en'?en:ko)[focus]||(language==='en'?'Keep your own words.':'네 말은 그대로 두고 한 가지만 더 보자.');
}
function stepSpecificReaction(text,language='ko',move=null){
  const sn=crewSnippet(text);
  if(!sn)return language==='en'?'I’m listening. One small piece is enough.':'듣고 있어. 작은 조각 하나면 충분해.';
  const guide=focusGuide(move?.focus,language);
  return language==='en'?'“'+sn+'” — I’m following. '+guide:'“'+sn+'” 여기까지 이어졌어. '+guide;
}
async function showCrewReaction(message,{persist=true,kind="observe"}={}){const box=$("#crewReactionOverlay");if(!box||!message)return;const identity=await resolvedIdentity(),perf=crewPerformance(identity,kind),language=(await get("active"))?.language||"ko",safety=window.SnapPopCrewInteractionSafety,safeMessage=safety&&typeof safety.safeReaction==="function"?safety.safeReaction(message,{language}):message;box.innerHTML=`<span class="reactionMotif">${html(perf.motif)}</span><b>${html(perf.gesture)}</b><span>${html(safeMessage)}</span>`;box.hidden=false;box.classList.add("show");box.dataset.kind=kind;if(persist){const s=await get("active");if(s){s.crewState=s.crewState||{};s.crewState.lastReaction=safeMessage;s.crewState.reactionAt=new Date().toISOString();await set("active",s)}}if(!document.documentElement.classList.contains("reduceMotion")){clearTimeout(window.crewReactionTimer);window.crewReactionTimer=setTimeout(()=>{box.classList.remove("show")},2200)}}
function hideCrewReaction(){const box=$("#crewReactionOverlay");if(box){box.hidden=true;box.classList.remove("show")}}
async function revealHint(){const s=await get("active");if(!s)return;const p=promptFor(s.landmark,s.step||0,s.language||"ko",ensureWritingState(s).draft);s.crewState=s.crewState||{};s.crewState.hintLevel=Math.max(1,s.crewState.hintLevel||0);s.crewState.lastHintAt=new Date().toISOString();await set("active",s);await recordBadgeBehaviorObservation("HELP_REQUEST",{explicitAction:true,landmark:s.landmark,step:Math.min(2,s.step||0),hintLevel:s.crewState.hintLevel},"SNAP_POP");$("#hint").textContent=p[1];$("#hint").hidden=false;$("#hintBtn").disabled=true;const identity=await resolvedIdentity();await showCrewReaction((s.language||"ko")==="en"?`${crewMemberName(identity)}: Just one hint. The rest is yours.`:`${crewMemberName(identity)}: 힌트는 하나만. 나머지는 네 생각으로 가보자.`)}
async function resetStepCrewState(s){s.crewState={hintLevel:0,lastReaction:"",cloudReturn:null,lastVoiceLength:0};await set("active",s)}
function writingLensLabel(id,language='ko'){
  const ko={idea:'아이디어 동굴',emotion:'감정 호수',description:'묘사 숲',viewpoint:'관점 전망대',final:'마무리 캠프'};
  const en={idea:'Idea Cave',emotion:'Emotion Lake',description:'Description Forest',viewpoint:'Viewpoint Lookout',final:'Finishing Camp'};
  return (language==='en'?en:ko)[id]||'';
}
function learnerContext(){
  try{return window.SnapPopLearningContextProvider?.context?.()||null}catch{return null}
}
function vocabularyMaterial(){
  try{
    const material=window.SnapPopBridge?.vocabularyMaterial?.()||null;
    return window.SnapPopVocabularyMaterial?.writingContext?.(material)||material;
  }catch{return null}
}
function renderWritingBridge(result,language='ko'){
  const el=$('#writingBridge');if(!el)return;
  const lens=result?.suggestedLens;
  if(!lens){el.hidden=true;el.textContent='';return}
  const name=writingLensLabel(lens,language);
  el.textContent=language==='en'?`Optional lens · ${name}`:`필요하면 ${name} 관점으로도 한 번 볼 수 있어.`;
  el.hidden=false;
}

function setExpressionBridgeButton(language='ko',draft=''){
  const btn=$("#expressionBridgeBtn");if(!btn)return;
  btn.textContent=language==="en"?"한국어 표현 도움":"English 표현 도움";
  btn.disabled=!(draft||"").trim();
}
function renderExpressionBridge(result,sourceLanguage,targetLanguage){
  const panel=$("#expressionBridgePanel");if(!panel)return;
  if(!result){panel.hidden=true;panel.innerHTML="";return}
  const targetLabel=targetLanguage==="en"?"English":"한국어";
  const fragments=Array.isArray(result.phraseFragments)?result.phraseFragments.slice(0,4):[];
  panel.innerHTML=
    `<span class="kicker">뜻 유지 · ${html(targetLabel)} 표현 조각</span>`+
    (result.meaningAnchor?`<p>${html(result.meaningAnchor)}</p>`:"")+
    (fragments.length?`<div class="expressionFragments">${fragments.map(x=>`<span>${html(x)}</span>`).join("")}</div>`:"")+
    `<p class="expressionAssembly">${html(result.assemblyPrompt||"")}</p>`+
    `<span class="kicker">문장은 직접 조립해. 초안은 바뀌지 않아.</span>`;
  panel.dataset.sourceLanguage=sourceLanguage;
  panel.dataset.targetLanguage=targetLanguage;
  panel.hidden=false;
}
async function runExpressionBridge(){
  const s=await get("active");if(!s)return;
  ensureWritingState(s);
  const draft=$("#answer").value.trim();
  if(!draft)return toast("먼저 네 생각을 한 조각 적어줘.");
  if(!window.SnapPopExpressionBridge)return toast("지금은 표현 도움을 사용할 수 없어요.");
  const sourceLanguage=s.language==="en"?"en":"ko",targetLanguage=sourceLanguage==="en"?"ko":"en";
  const btn=$("#expressionBridgeBtn");if(btn){btn.disabled=true;btn.textContent=targetLanguage==="en"?"표현 조각 찾는 중…":"표현 조각 찾는 중…"}
  try{
    const result=await window.SnapPopExpressionBridge.bridge({
      draft,
      sourceLanguage,
      targetLanguage,
      vocabularyMaterial:vocabularyMaterial()
    });
    const cur=await get("active");
    if(!cur||cur.id!==s.id||$("#answer").value.trim()!==draft)return;
    renderExpressionBridge(result,sourceLanguage,targetLanguage);
    cur.crewState=cur.crewState||{};
    cur.crewState.expressionBridge={
      sourceLanguage,
      targetLanguage,
      provider:result.provider||"unknown",
      fragmentCount:Array.isArray(result.phraseFragments)?result.phraseFragments.length:0,
      at:new Date().toISOString()
    };
    await set("active",cur);
    await recordExpressionTrace("BILINGUAL_EXPRESSION_BRIDGE_SHOWN",{
      source:"WRITING_FLOW",
      sourceLanguage,
      targetLanguage,
      fragmentCount:Array.isArray(result.phraseFragments)?result.phraseFragments.length:0,
      provider:result.provider||"unknown"
    });
  }catch{
    renderExpressionBridge(null,sourceLanguage,targetLanguage);
    toast("지금은 표현 조각을 불러오기 어려워요. 초안은 그대로 있어요.");
  }finally{
    const cur=await get("active");
    setExpressionBridgeButton(cur?.language||sourceLanguage,$("#answer").value);
  }
}
async function analyzeWritingMove(s){
  if(!s||!window.SnapPopWriting?.analyze)return refreshWritingMove(s);
  ensureWritingState(s);
  const seq=++writingAnalysisSeq,draft=s.draft,step=Math.min(2,s.step||0),language=s.language||'ko';
  const previousSnapshot=(s.snapshots||[])[Math.max(0,step-1)]||'';
  const result=await window.SnapPopWriting.analyze({landmark:s.landmark,step,draft,previousSnapshot,language,learnerContext:learnerContext(),vocabularyMaterial:vocabularyMaterial()});
  const cur=await get('active');
  if(seq!==writingAnalysisSeq||!cur||cur.id!==s.id)return null;
  ensureWritingState(cur);
  if(cur.draft!==draft||Math.min(2,cur.step||0)!==step)return null;
  $('#question').textContent=result.question;
  if(cur.crewState?.hintLevel>0)$('#hint').textContent=result.hint;
  renderWritingBridge(result,language);
  cur.crewState=cur.crewState||{};
  cur.crewState.currentFocus=result.focus||null;
  cur.crewState.writingAnalysis={focus:result.focus||null,suggestedLens:result.suggestedLens||null,provider:result.provider||'unknown',confidence:result.confidence??null,grounded:result.grounded!==false,factVerified:result.factVerified===true,learningContextUsed:!!result.learningContextUsed,learningGoal:result.learningGoal||null,semanticSignals:result.semanticSignals||null,at:new Date().toISOString()};
  await set('active',cur);
  return result;
}
function refreshWritingMove(s){
  if(!s)return null;
  ensureWritingState(s);
  const i=Math.min(2,s.step||0),language=s.language||'ko',p=promptFor(s.landmark,i,language,s.draft),move=p[2];
  $('#question').textContent=p[0];
  if(s.crewState?.hintLevel>0)$('#hint').textContent=p[1];
  if(move){s.crewState=s.crewState||{};s.crewState.currentFocus=move.focus;}
  return move;
}

function renderExplore(s){ensureWritingState(s);const m=marks.find(x=>x.id===s.landmark)||marks[0],i=Math.min(2,s.step||0),language=s.language||"ko",p=promptFor(s.landmark,i,language,s.draft);renderExpressionBridge(null,language,language==="en"?"ko":"en");renderExpressionIntentNote(s);setExpressionBridgeButton(language,s.draft);$("#exploreTitle").textContent="탐험 진행 · "+m.title;$("#question").textContent=p[0];$("#hint").textContent=p[1];$("#hint").hidden=!(s.crewState?.hintLevel>0);$("#hintBtn").disabled=!!(s.crewState?.hintLevel>0);$("#answer").value=s.draft||"";setModeButtons(language);renderWritingBridge(null,language);hideCrewReaction();resolvedIdentity().then(identity=>{const name=crewMemberName(identity),base=crewReaction(identity,s.landmark),stepLine=language==="en"?["Start small. One idea is enough.","Add one more piece.","Finish it in your own words."][i]:["작은 조각 하나부터 잡아보자.","좋아, 하나만 더 붙여보자.","이제 네 말로 마무리해보자."][i];$(".crewMemberLine b").textContent=`탐험대원 ${name}`;$("#crewMemberLine").textContent=`${base} ${stepLine}`});$("#nextBtn").textContent=i===2?(language==="en"?"Finish exploration":"탐험 완료"):(language==="en"?"Next step":"다음 단계");$("#steps").innerHTML=STEPS.map((x,n)=>`<span class="${n===i?"on":n<i?"done":""}">${n+1}. ${x}</span>`).join("")}

$("#nextBtn").onclick=async()=>{
  let s=await get("active");
  if(!s){toast("지도에서 탐험지를 먼저 골라줘.");show("map");return}
  ensureWritingState(s);const i=s.step||0;s.draft=$("#answer").value.trim();s.answers[i]=s.draft;s.snapshots[i]=s.draft;
  if(!s.draft){s.crewState=s.crewState||{};s.crewState.emptyAdvanceAttempts=(s.crewState.emptyAdvanceAttempts||0)+1;const intervention=window.SnapPopCrewIntervention?.state?.({emptyAdvanceAttempts:s.crewState.emptyAdvanceAttempts,hintLevel:s.crewState.hintLevel||0,language:s.language||"ko"})||{stage:"WAIT",message:(s.language||"ko")==="en"?"No rush. I’ll wait here.":"급할 건 없어. 여기서 기다릴게.",autoRevealHint:false,autoWrite:false};s.crewState.interventionStage=intervention.stage;await set("active",s);const identity=await resolvedIdentity();await showCrewReaction(`${crewMemberName(identity)}: ${intervention.message}`,{kind:"observe"});return}
  if(i<2){writingAnalysisSeq++;s.step=i+1;s.crewState={hintLevel:0,lastReaction:"",cloudReturn:null,lastVoiceLength:0};await set("active",s);renderExplore(s);setTimeout(()=>analyzeWritingMove(s),0);return}
  const events=await get("completionEvents")||{};
  const completionEventId=s.completionEventId||`completion_${s.id}`;
  if(events[completionEventId]){await set("active",null);toast("이미 기록된 탐험이에요.");show("growth");return}
  const records=await get("records")||[];
  const expAward=calcExp([s.draft],records.length,s.language||"ko");
  const now=new Date().toISOString();
  const learningCtx=learnerContext(),vocabMaterial=vocabularyMaterial(),vocabEvidence=window.SnapPopVocabularyMaterial?.usageEvidence?.(vocabMaterial,s.draft)||null;const record={id:uid("record"),completionEventId,landmark:s.landmark,language:s.language||"ko",answers:[...s.answers],snapshots:[...(s.snapshots||s.answers)],finalDraft:s.draft,date:now,expAward:expAward.total,strengths:expAward.strengths,learningRef:learningCtx?{learning_unit_id:learningCtx.learning_unit_id||null,analysis_id:learningCtx.analysis_id||null,assignment_id:learningCtx.assignment_id||null,subject:learningCtx.subject||null,context_source:learningCtx.source||null}:null,vocabularyRef:vocabEvidence};
  records.unshift(record);
  const gems=await get("gems")||{},beforeShard=gems[s.landmark]||0;gems[s.landmark]=beforeShard+1;
  const expLedger=await get("expLedger")||[];
  expLedger.push({eventId:completionEventId,type:"EXPLORATION_COMPLETE",amount:expAward.total,landmark:s.landmark,at:now,breakdown:expAward});
  const gemLedger=await get("gemLedger")||[];
  gemLedger.push({eventId:completionEventId,type:"SHARD_EARNED",landmark:s.landmark,amount:1,at:now});
  if(Math.floor((beforeShard+1)/6)>Math.floor(beforeShard/6))gemLedger.push({eventId:completionEventId,type:"COMPLETE_GEM_CONVERTED",landmark:s.landmark,completedGemDelta:1,sourceShards:6,at:now});
  events[completionEventId]={at:now,recordId:record.id};
  const totalExp=expLedger.reduce((sum,e)=>sum+(Number(e.amount)||0),0);
  await setMany([["records",records],["gems",gems],["expLedger",expLedger],["gemLedger",gemLedger],["completionEvents",events],["exp",totalExp],["lastResult",record],["active",null]]);
  await updateStatus();
  await recordCrewExperience("EXPLORATION_COMPLETE",{eventId:completionEventId,landmark:s.landmark,recordId:record.id,snippet:crewSnippet(s.answers.join(" "))});
  await recordBadgeBehaviorObservation("WRITING_EXPLORATION",{explicitCompletion:true,landmark:s.landmark,finalDraftChars:(s.draft||"").length,completionEventId},"SNAP_POP");
  await recordBadgeEvent("WRITING_EXPLORATION",{landmark:s.landmark,finalDraftChars:(s.draft||"").length,learningUnitId:learningCtx?.learning_unit_id||null,completionEventId},"SNAP_POP");
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
  toast(`탐험 완료! +${expAward.total} EXP · 보석 조각 +1`);show("result")
}

async function speak(t,language="ko",source="USER_TAP"){try{if(!window.SnapPopVoice)throw new Error("VOICE_RUNTIME_UNAVAILABLE");return await window.SnapPopVoice.speak(t,{language,voiceRole:"crew",source})}catch{return toast("지금은 음성으로 읽어주기 어려워요. 글로 계속 볼 수 있어요.")}}
$("#answer").addEventListener("input",async()=>{const s=await get("active");if(!s)return;const i=Math.min(2,s.step||0),text=$("#answer").value;setExpressionBridgeButton(s.language||"ko",text);ensureWritingState(s);s.draft=text;s.updatedAt=new Date().toISOString();await set("active",s);clearTimeout(window.crewInputTimer);if(text.trim().length>=8){window.crewInputTimer=setTimeout(async()=>{const cur=await get("active");if(!cur||Math.min(2,cur.step||0)!==i)return;ensureWritingState(cur);cur.draft=$("#answer").value;await set("active",cur);const move=await analyzeWritingMove(cur)||refreshWritingMove(cur);const msg=stepSpecificReaction(cur.draft,cur.language||"ko",move);if(msg&&msg!==cur.crewState?.lastReaction)await showCrewReaction(msg)},850)}});
function currentBridgeContext(){try{return window.SnapPopBridge?.context?.()||{}}catch{return {}}}
async function renderIncomingHandoff(){const box=$("#handoffWord");if(!box)return;const material=vocabularyMaterial();if(material?.word){box.hidden=false;const owner=material.sourceOwner==="HIDE_SEEK"?"Hide & Seek":"연결 앱";box.textContent=`${owner} 표현 재료 · ${material.word}${material.context?" · "+material.context:""} · 원하면 참고`;box.dataset.sourceOwner=material.sourceOwner;box.dataset.role=material.role}else{box.hidden=true;box.textContent="";delete box.dataset.sourceOwner;delete box.dataset.role}}
async function recordExpressionTrace(type,meta={}){
  const allowed={
    eventId:meta.eventId||uid("exprtrace"),
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
  const ledger=await get("expressionTrace")||[];
  ledger.unshift(allowed);
  await set("expressionTrace",ledger.slice(0,200));
  return allowed;
}
async function dismissPendingExpressionIntent(){
  const pending=await get("pendingExpressionIntent");
  if(pending?.question){
    await recordExpressionTrace("VERIFIED_ASK_EXPRESSION_DISMISSED",{
      source:pending.source||"VERIFIED_ASK",
      questionLanguage:pending.language||"ko",
      verifiedCoverage:pending.verifiedCoverage||null,
      questionChars:pending.question.length
    });
  }
  await set("pendingExpressionIntent",null);
  await renderPendingExpressionIntent();
}
async function renderPendingExpressionIntent(){
  const banner=$("#expressionIntentBanner");if(!banner)return;
  const pending=await get("pendingExpressionIntent");
  if(!pending?.question){banner.hidden=true;banner.innerHTML="";return}
  banner.innerHTML=`<span>방금 이해한 주제 · ${html(pending.question)} · 표현하고 싶다면 탐험지를 골라봐.</span><button type="button" class="soft mini expressionIntentDismiss">그만두기</button>`;
  const dismiss=banner.querySelector(".expressionIntentDismiss");
  if(dismiss)dismiss.onclick=dismissPendingExpressionIntent;
  banner.hidden=false;
}
function renderExpressionIntentNote(s){
  const note=$("#expressionIntentNote");if(!note)return;
  const intent=s?.expressionIntent;
  if(intent?.question){
    note.textContent=`표현해볼 주제 · ${intent.question} · 먼저 네 말로 시작해봐.`;
    note.hidden=false;
  }else{
    note.hidden=true;
    note.textContent="";
  }
}
window.addEventListener("snap-pop:bridge-ready",renderIncomingHandoff);
let imaginationLanguage="ko", imaginationReturnFocus=null, imaginationSource="GLOBAL", imaginationWritingReturn=null;
function setImaginationLanguage(language="ko"){
  imaginationLanguage=language==="en"?"en":"ko";
  $("#imaginationModeKo")?.classList.toggle("on",imaginationLanguage==="ko");
  $("#imaginationModeEn")?.classList.toggle("on",imaginationLanguage==="en");
}
async function openImagination({input="",language="ko",source="GLOBAL",writingReturn=null}={}){
  const layer=$("#imaginationLayer"),identity=await resolvedIdentity(); if(!layer)return;
  imaginationReturnFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;
  imaginationSource=source;
  imaginationWritingReturn=source==="WRITING_FLOW"&&writingReturn?writingReturn:null;
  setImaginationLanguage(language);
  $("#imaginationCrewName").textContent=`탐험대원 ${crewMemberName(identity)}`;
  $("#imaginationCrewLine").textContent=source==="WRITING_FLOW"?"쓰던 글은 그대로 있어. 필요한 만큼만 같이 생각해보자.":"필요한 만큼만 같이 생각해보자.";
  $("#imaginationInput").value=(input||"").trim();
  $("#imaginationAnswer").hidden=true; $("#imaginationAnswer").innerHTML="";
  layer.hidden=false; layer.setAttribute("aria-hidden","false"); document.documentElement.classList.add("imaginationOpen");
  setTimeout(()=>$("#imaginationInput")?.focus(),0);
}
async function closeImagination(){
  const layer=$("#imaginationLayer"); if(!layer)return;
  window.SnapPopVoice?.stopListening?.();
  layer.hidden=true; layer.setAttribute("aria-hidden","true"); document.documentElement.classList.remove("imaginationOpen");

  const writingReturn=imaginationWritingReturn;
  imaginationWritingReturn=null;
  if(imaginationSource==="WRITING_FLOW"&&writingReturn){
    const current=await get("active");
    if(current&&current.id===writingReturn.activeId&&Math.min(2,current.step||0)===writingReturn.step){
      ensureWritingState(current);
      const preserved=typeof current.draft==="string"?current.draft:writingReturn.draft;
      $("#answer").value=preserved;
      current.crewState=current.crewState||{};
      current.crewState.cloudReturn={
        activeId:current.id,
        step:writingReturn.step,
        draftPreserved:true,
        returnedAt:new Date().toISOString()
      };
      await set("active",current);
      const identity=await resolvedIdentity();
      await showCrewReaction(
        (current.language||"ko")==="en"
          ? `${crewMemberName(identity)}: Your draft is still here. Keep going when you’re ready.`
          : `${crewMemberName(identity)}: 쓰던 글은 그대로 있어. 준비되면 이어서 쓰면 돼.`,
        {persist:false,kind:"observe"}
      );
    }
  }

  imaginationSource="GLOBAL";
  const target=imaginationReturnFocus; imaginationReturnFocus=null;
  if(target?.isConnected)setTimeout(()=>target.focus(),0);
}
function renderImaginationResponse(result,identity){
  const host=$("#imaginationAnswer"); if(!host)return;
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
  const canExpress=imaginationSource==="GLOBAL"&&result?.kind==="ASK_UNDERSTAND"&&result?.verified===true&&result?.verification?.coverage==="FULL_FACTUAL_CONTENT";
  host.innerHTML=`<div class="cloudAnswerHead"><b>${html(crewMemberName(identity))} · ${html(result?.title||"상상 구름")}</b><span>${html(badge)}</span></div>`+
    `<p class="cloudCore">${html(result?.core||"")}</p>`+
    (nodes.length?`<div class="mindMap">${nodes.map(n=>`<div class="mindNode"><b>${html(n.label||"")}</b><span>${html(n.value||"")}</span></div>`).join("")}</div>`:"")+
    (understanding?`<p class="kicker">이렇게 보면 쉬워 · ${html(understanding.label||"")}</p>`:"")+
    (mentalModel?.items?.length?`<div class="mentalModel mentalModel${html(mentalModel.type||"STACK")}">${mentalModel.items.map((item,i)=>`<div class="mentalStep"><b>${html(item.label||String(i+1))}</b><span>${html(item.text||"")}</span></div>`).join(mentalModel.type==="FLOW"?'<i class="mentalArrow">→</i>':"")}</div>`:"")+
    (verifiedClaims.length?`<p class="kicker">확인된 주장 ${verifiedClaims.length}개${evidenceLinks.length?` · 근거 ${evidenceLinks.map(x=>`<a href="${html(x.url)}" target="_blank" rel="noopener noreferrer">${html(x.label)}</a>`).join(" · ")}`:""}</p>`:"")+
    (understanding?.nextCuriosity?`<button class="soft cloudFollowUpReveal" type="button">더 궁금하면 한 가지 더</button><p class="cloudExample cloudFollowUpText" hidden>다음 궁금증 · ${html(understanding.nextCuriosity)}</p>`:"")+
    (canExpress?`<button class="soft cloudExpressBtn" type="button">이걸 내 말로 표현해보기</button>`:"")+
    (result?.example?`<p class="cloudExample">${html(result.example)}</p>`:"");
  const reveal=host.querySelector(".cloudFollowUpReveal"),follow=host.querySelector(".cloudFollowUpText");
  if(reveal&&follow)reveal.onclick=()=>{follow.hidden=false;reveal.remove()};
  const express=host.querySelector(".cloudExpressBtn");
  if(express)express.onclick=async()=>{
    const question=($("#imaginationInput")?.value||"").trim();
    if(!question)return;
    await set("pendingExpressionIntent",{source:"VERIFIED_ASK",question,language:imaginationLanguage,answerTransferred:false,verifiedCoverage:"FULL_FACTUAL_CONTENT",createdAt:new Date().toISOString()});
    await recordExpressionTrace("VERIFIED_ASK_EXPRESSION_SELECTED",{
      source:"VERIFIED_ASK",
      questionLanguage:imaginationLanguage,
      verifiedCoverage:"FULL_FACTUAL_CONTENT",
      questionChars:question.length
    });
    await closeImagination();
    show("map");
    await renderPendingExpressionIntent();
    toast("답을 옮기지 않았어. 이제 네 말로 표현해볼 수 있어.");
  };
  host.hidden=false; host.dataset.speakable=result?.speakable||result?.core||"";
}
async function runImagination(inputOverride){
  const input=(inputOverride??$("#imaginationInput")?.value??"").trim(),identity=await resolvedIdentity();
  if(!input)return toast("막힌 생각이나 궁금한 걸 한 조각만 남겨줘.");
  if(!window.SnapPopIntelligence)return toast("상상 구름 엔진을 불러오지 못했어요.");
  const btn=$("#imaginationAskBtn"); btn.disabled=true; btn.textContent="생각 중…";
  try{
    const active=await get("active");
    const rawResult=await window.SnapPopIntelligence.ask({input,language:imaginationLanguage,context:imaginationSource,landmark:active?.landmark||null,step:active?.step||0,crewMember:{type:identity.crewMember?.type,name:crewMemberName(identity)}});
    const presentation=window.SnapPopCrewPresentationGuard;
    const result=presentation&&typeof presentation.sanitizeUserFacing==="function"
      ? presentation.sanitizeUserFacing(rawResult)
      : rawResult;
    renderImaginationResponse(result,identity);
    const history=await get("cloudHistory")||[];
    const publicEntry=presentation&&typeof presentation.publicHistoryEntry==="function"
      ? presentation.publicHistoryEntry(result)
      : {intent:result.intent||result.kind,verificationStatus:(result.intent||result.kind)==="ASK_UNDERSTAND"?(result.verified===true?"FACT_VERIFIED":"FACT_NEEDS_CHECK"):"NOT_APPLICABLE",verified:(result.intent||result.kind)==="ASK_UNDERSTAND"?result.verified===true:null,title:result.title||"",core:result.core||"",nodes:Array.isArray(result.nodes)?result.nodes.slice(0,8):[],example:result.example||""};
    history.unshift({id:uid("cloud"),input,...publicEntry,provider:rawResult.provider||"unknown",language:imaginationLanguage,source:imaginationSource,at:new Date().toISOString()});
    await set("cloudHistory",history.slice(0,100));
    if(active&&imaginationSource==="WRITING_FLOW"){active.crewState=active.crewState||{};active.crewState.cloudLast={input,intent:result.intent||result.kind,verificationStatus:(result.intent||result.kind)==="ASK_UNDERSTAND"?(result.verified===true?"FACT_VERIFIED":"FACT_NEEDS_CHECK"):"NOT_APPLICABLE",verified:(result.intent||result.kind)==="ASK_UNDERSTAND"?result.verified===true:null,provider:result.provider||"unknown",at:new Date().toISOString()};await set("active",active)}
    if(result.verified===false){
      const verifiedClaimCount=Number(result?.verification?.verifiedClaimCount)||0;
      await showCrewReaction(
        verifiedClaimCount>0
          ?`${crewMemberName(identity)}: 근거가 확인된 부분과 아직 확인이 필요한 부분을 나눠서 볼게.`
          :`${crewMemberName(identity)}: 확인이 필요한 건 지어내지 않고 확인부터 할게.`,
        {persist:false,kind:"observe"}
      );
    }
  }catch{
    await showCrewReaction(`${crewMemberName(identity)}: 지금 연결이 매끄럽지 않네. 질문은 그대로 남겨둘게.`,{persist:false});
  }finally{btn.disabled=false;btn.textContent="도움 받기"}
}
$("#imaginationModeKo").onclick=()=>setImaginationLanguage("ko");
$("#imaginationModeEn").onclick=()=>setImaginationLanguage("en");
$("#imaginationAskBtn").onclick=()=>runImagination();
$("#imaginationSpeakLast").onclick=async()=>{const t=$("#imaginationAnswer")?.dataset.speakable||"";if(!t)return toast("먼저 도움을 받아봐.");await speak(t,imaginationLanguage)};
$("#imaginationVoiceBtn").onclick=async()=>{
  const identity=await resolvedIdentity(); if(!window.SnapPopVoice)return toast("지금은 음성 입력을 사용할 수 없어요.");
  try{await window.SnapPopVoice.listen({language:imaginationLanguage,source:"USER_MIC",
    onStart:()=>{$("#imaginationVoiceBtn").textContent=imaginationLanguage==="en"?"Listening…":"듣고 있어요…";showCrewReaction(`${crewMemberName(identity)}: 천천히 말해도 돼.`,{persist:false})},
    onText:t=>{$("#imaginationInput").value=t;runImagination(t)},
    onError:()=>showCrewReaction(`${crewMemberName(identity)}: 잘 못 들었어. 다시 말하거나 직접 적어도 돼.`,{persist:false}),
    onEnd:()=>{$("#imaginationVoiceBtn").textContent="말로 묻기"}})}catch{toast("이 기기에서는 지금 음성 입력을 사용할 수 없어요.")}
};
$("#imaginationClose").onclick=()=>{closeImagination()};
$("#imaginationBackdrop").onclick=()=>{closeImagination()};
addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("#imaginationLayer")?.hidden)closeImagination()});
$("#expressionBridgeBtn").onclick=runExpressionBridge;
$("#cloudBtn").onclick=async()=>{
  const s=await get("active");if(!s)return;
  ensureWritingState(s);
  const step=Math.min(2,s.step||0),draft=$("#answer").value;
  s.draft=draft;
  s.answers[step]=draft;
  s.updatedAt=new Date().toISOString();
  s.crewState=s.crewState||{};
  s.crewState.cloudReturn={activeId:s.id,step,draftPreserved:true,openedAt:new Date().toISOString()};
  await set("active",s);
  openImagination({
    input:draft,
    language:s.language||"ko",
    source:"WRITING_FLOW",
    writingReturn:{activeId:s.id,step,draft}
  });
};
$("#modeKo").onclick=async()=>{const s=await get("active");if(!s)return;s.language="ko";await set("active",s);renderExplore(s)};
$("#modeEn").onclick=async()=>{const s=await get("active");if(!s)return;s.language="en";await set("active",s);renderExplore(s)};
$("#hintBtn").onclick=revealHint;
$("#listenBtn").onclick=async()=>{const s=await get("active");if(!s)return;const p=promptFor(s.landmark,s.step||0,s.language||"ko",ensureWritingState(s).draft);await speak(p[0]+" "+(s.crewState?.hintLevel?p[1]:""),s.language||"ko")};
$("#voiceBtn").onclick=async()=>{
  const s=await get("active"),identity=await resolvedIdentity();
  if(!window.SnapPopVoice)return toast("지금은 음성 입력을 사용할 수 없어요.");
  try{await window.SnapPopVoice.listen({language:s?.language||"ko",source:"USER_MIC",
    onStart:()=>{$("#voiceBtn").textContent=(s?.language||"ko")==="en"?"Listening":"듣고 있어요";showCrewReaction(`${crewMemberName(identity)}: 듣고 있어. 천천히 말해도 돼.`,{persist:false})},
    onText:async t=>{$("#answer").value+=(($("#answer").value?" ":"")+t);$("#answer").dispatchEvent(new Event("input"));const cur=await get("active");if(cur){cur.crewState=cur.crewState||{};cur.crewState.lastVoiceLength=t.length;await set("active",cur)}await recordCrewExperience("VOICE_EXPRESSION",{eventId:uid("voice"),length:t.length,landmark:s?.landmark||null});if(t.length>=40)await showCrewReaction(`${crewMemberName(identity)}: 길게 잘 들었어. 네 말투는 그대로 두자.`)},
    onError:()=>showCrewReaction(`${crewMemberName(identity)}: 잘 못 들었어. 다시 말하거나 직접 써도 돼.`),
    onEnd:()=>{$("#voiceBtn").innerHTML='<img src="assets/icons/radio.svg" alt="">말해서 쓰기'}})}catch{toast("이 기기에서는 지금 음성 입력을 사용할 수 없어요.")}
};
async function renderCloudHistory(){
  const host=$("#cloudHistoryList"); if(!host)return;
  const history=await get("cloudHistory")||[];
  host.innerHTML=history.length?history.map(x=>`<article class="card cloudHistoryCard"><b>${x.intent==="ASK_UNDERSTAND"?"궁금증":"생각"} · ${new Date(x.at).toLocaleDateString("ko-KR")}</b><p class="cloudHistoryQuestion">${html(x.input||"")}</p>${x.core?`<p class="cloudHistoryAnswer">${html(x.core)}</p>`:""}${Array.isArray(x.nodes)&&x.nodes.length?`<div class="cloudHistoryNodes">${x.nodes.slice(0,4).map(n=>`<span><b>${html(n.label||"")}</b> ${html(n.value||"")}</span>`).join("")}</div>`:""}<span class="kicker">${x.verificationStatus==="FACT_VERIFIED"?"확인 완료":x.verificationStatus==="FACT_NEEDS_CHECK"?"확인 필요":"생각 기록"} · ${x.language==="en"?"English":"한국어"}</span></article>`).join(""):'<article class="card"><b>아직 상상 구름 기록이 없어요.</b><p>궁금한 것과 떠오른 생각을 자유롭게 남겨봐요.</p></article>';
}
async function renderRecords(){
  if(!db)return;
  const r=await get("records")||[], special=await get("specialMemories")||[], revisions=await get("recordRevisions")||{},registry=await ensureCrewRegistry(),memberRules={...SNAP_RULES?.legacyCharacterLineages,...SNAP_RULES?.definedCharacterLineages};
  renderCalendar(r,special);
  await renderCloudHistory();
  const normalCards=r.map(x=>{const m=marks.find(z=>z.id===x.landmark),rev=(revisions[x.id]||[]),latest=rev.length?rev[rev.length-1].text:x.answers.join(" "),strengths=(x.strengths||[]).slice(0,3).map(html).join(" · ");return `<article class="card" data-record-date="${x.date}" data-record-id="${x.id}"><b>${m?.title||"탐험"}${x.language==="en"?" · English":""}</b><p>${html(latest)}</p>${rev.length?`<span class="kicker">수정본 ${rev.length}개 · 원문 보존</span><br>`:""}${strengths?`<span class="kicker">오늘 발견한 글쓰기 힘 · ${strengths}</span><br>`:""}<span class="kicker">${new Date(x.date).toLocaleDateString("ko-KR")} · +${x.expAward||0} EXP</span><div class="recordActions"><button class="soft recordEditBtn" data-record-id="${x.id}">기록 다듬기</button></div></article>`});
  const specialCards=special.map(x=>{const guest=x.guestMemberId?(registry[x.guestMemberId]?.currentName||registry[x.guestMemberId]?.firstName||memberRules[x.guestMemberId]?.defaultName||memberRules[x.guestMemberId]?.label||""):null;return `<article class="card specialMemory" data-record-date="${x.at}"><b>특별 탐험</b><p><strong>${html(x.prompt)}</strong><br>${html(x.text)}</p>${guest?`<span class="kicker">함께한 탐험대원 · ${html(guest)}</span><br>`:""}<span class="kicker">${new Date(x.at).toLocaleDateString("ko-KR")} · 선택 기록 · 보상/실패 없음</span></article>`});
  const all=[...normalCards,...specialCards];
  $("#recordList").innerHTML=all.length?all.join(""):'<article class="card"><b>첫 기록을 기다리고 있어요.</b><p>지도에서 탐험지를 골라 시작해봐요.</p></article>';
  $(".recordEditBtn").forEach(b=>b.onclick=()=>openRecordEdit(b.dataset.recordId));
}
function renderCalendar(records,special=[]){
  const y=calendarCursor.getFullYear(),m=calendarCursor.getMonth(),first=new Date(y,m,1),days=new Date(y,m+1,0).getDate(),offset=first.getDay();
  $("#calTitle").textContent=`${y}년 ${m+1}월`;
  const count={},specialCount={};records.forEach(r=>{const d=new Date(r.date);if(d.getFullYear()===y&&d.getMonth()===m)count[d.getDate()]=(count[d.getDate()]||0)+1});special.forEach(r=>{const d=new Date(r.at);if(d.getFullYear()===y&&d.getMonth()===m)specialCount[d.getDate()]=(specialCount[d.getDate()]||0)+1});
  const today=new Date();let cells="";
  for(let i=0;i<offset;i++)cells+='<button class="blank" tabindex="-1"></button>';
  for(let d=1;d<=days;d++){const has=(count[d]||0)+(specialCount[d]||0)>0,isToday=today.getFullYear()===y&&today.getMonth()===m&&today.getDate()===d;cells+=`<button data-day="${d}" class="${has?"hasRecord ":""}${isToday?"today":""}" aria-label="${m+1}월 ${d}일${has?", 기록 있음":""}">${d}</button>`;}
  $("#calendarGrid").innerHTML=cells;
  $("#calendarGrid").onclick=e=>{const b=e.target.closest("button[data-day]");if(!b)return;const d=Number(b.dataset.day);const hit=records.find(r=>{const x=new Date(r.date);return x.getFullYear()===y&&x.getMonth()===m&&x.getDate()===d}),specialHit=special.find(r=>{const x=new Date(r.at);return x.getFullYear()===y&&x.getMonth()===m&&x.getDate()===d}),target=hit?.date||specialHit?.at;if(target){const el=document.querySelector(`[data-record-date="${target}"]`);el?.scrollIntoView({behavior:document.documentElement.classList.contains("reduceMotion")?"auto":"smooth",block:"center"})}else toast("이날은 아직 탐험 기록이 없어요.")};
}
async function renderGems(){if(!db)return;const g=await get("gems")||{};$("#gemRows").innerHTML=marks.map(m=>{const n=g[m.id]||0;return `<article class="gemRow"><div><b>${m.title}</b><span>보석 조각 ${n%6}/6</span></div><strong>완성 ${Math.floor(n/6)}</strong></article>`}).join("")}
async function renderIdentityPresence(){if(!db)return;const identity=await resolvedIdentity(),visual=$("#homeCharacterVisual"),rule=crewMemberRule(identity),name=crewMemberName(identity);$("#homeCharacterName").textContent=identity.profile.name||"나의 탐험가";$("#homeCrewMemberName").textContent=name;const registry0=await ensureCrewRegistry(),entry0=registry0[identity.crewMember.type],ws=entry0?.worldState?.state;const worldLabel={AT_HUB:"거점에 있음",EXPEDITION:"탐험 파견 중",SUPPORTING_OTHER_HUB:"다른 거점 지원 중",VACATION:"휴가 중",RESTING:"쉬는 중",FREE_EXPLORING:"자유 탐험 중",SPECIAL_EVENT:"작은 사건 중",MAIN_COMPANION:"함께 탐험 중"}[ws]||"";$("#homeCrewMemberLine").textContent=[rule.home||"",worldLabel].filter(Boolean).join(" · ");const memberVisual=$("#homeCrewMember .crewMemberPlaceholder");if(memberVisual)memberVisual.textContent=rule.label;if(identity.profile.photo){visual.innerHTML=`<img src="${identity.profile.photo}" alt="">`}else visual.textContent=(identity.profile.name||"탐험가").slice(0,2);const registry=await ensureCrewRegistry(),entry=registry[identity.crewMember.type],tier=affinityTier(entry?.affinity?.scoreInternal||0);$("#growthCompanion").textContent=`${identity.profile.name||"탐험가"} · ${name} · ${tier.label}`;$("#crewMemberPersonalityPreview").textContent=`${rule.label} · ${rule.personality||""} · 관계 ${tier.label}`}
async function renderGrowth(){if(!db)return;const cfg=await fetch("data/growth.json").then(r=>r.json()),exp=await get("exp")||0,p=levelProgress(exp),records=await get("records")||[],cloud=await get("cloudHistory")||[],special=await get("specialMemories")||[];let stage=cfg[0];cfg.forEach(x=>{if(p.level>=x.min)stage=x});$("#growthLv").textContent="Lv."+p.level;$("#growthName").textContent=stage.name;$("#treeImage").src="assets/growth/"+stage.image;$("#expBar").style.width=(p.within*100)+"%";$("#expText").textContent=p.level>=25?`EXP ${exp} · 최고 성장 단계`:`EXP ${exp} · 다음 성장까지 ${p.remaining} EXP`;const ask=cloud.filter(x=>x.intent==="ASK_UNDERSTAND").length,think=cloud.filter(x=>x.intent!=="ASK_UNDERSTAND").length,summary=$("#growthActivitySummary");if(summary)summary.innerHTML=`<div><b>표현 탐험</b><strong>${records.length}</strong></div><div><b>궁금증</b><strong>${ask}</strong></div><div><b>생각 펼치기</b><strong>${think}</strong></div><div><b>특별 탐험</b><strong>${special.length}</strong></div><p>궁금증·상상구름 활동은 성장 흔적으로만 남고 EXP·보석 파밍에는 사용하지 않아요.</p>`;await renderIdentityPresence()}
async function renderGrowthTimeline(){const r=await get("records")||[],special=await get("specialMemories")||[],cloud=await get("cloudHistory")||[],host=$("#growthTimeline"),events=[...r.map(x=>({kind:"normal",at:x.date,data:x})),...special.map(x=>({kind:"special",at:x.at,data:x})),...cloud.map(x=>({kind:"cloud",at:x.at,data:x}))].sort((a,b)=>new Date(b.at)-new Date(a.at));host.hidden=false;host.innerHTML=events.length?events.slice(0,20).map(e=>{if(e.kind==="special")return `<div class="timelineItem"><b>특별 탐험 기억</b><span>${new Date(e.at).toLocaleString("ko-KR")} · 선택 참여 · 보상/실패 없음</span></div>`;if(e.kind==="cloud"){const x=e.data;return `<div class="timelineItem"><b>${x.intent==="ASK_UNDERSTAND"?"궁금증 해결":"생각 펼치기"}</b><span>${new Date(x.at).toLocaleString("ko-KR")} · EXP/보석 없음 · ${html((x.input||"").slice(0,60))}</span></div>`}const x=e.data,m=marks.find(z=>z.id===x.landmark);return `<div class="timelineItem"><b>${m?.title||"탐험"} · +${x.expAward||0} EXP</b><span>${new Date(x.date).toLocaleString("ko-KR")}${x.strengths?.length?" · "+x.strengths.slice(0,2).map(html).join(" · "):""}</span></div>`}).join(""):'<div class="timelineItem"><b>첫 성장 기록을 기다리고 있어요.</b><span>탐험을 완료하면 여기에 시간이 쌓여요.</span></div>'}
async function renderLastResult(){const r=await get("lastResult");if(!r){$("#resultTitle").textContent="아직 완료한 탐험이 없어요.";$("#resultDraft").textContent="지도에서 탐험을 시작해봐요.";$("#resultExp").textContent="+0 EXP";$("#resultGem").textContent="보석 조각 +0";$("#resultStrengths").innerHTML="";$("#resultCrewMemberLine").textContent="";$("#bonusStart").disabled=true;return}const m=marks.find(x=>x.id===r.landmark),bonusEvents=await get("bonusEvents")||{},identity=await resolvedIdentity();$("#resultTitle").textContent=m?.title||"오늘의 탐험";$("#resultDraft").textContent=r.finalDraft||r.answers.join(" ");$("#resultExp").textContent=`+${r.expAward||0} EXP`;$("#resultGem").textContent="보석 조각 +1";$("#resultStrengths").innerHTML=(r.strengths||[]).length?(r.strengths||[]).map(s=>`<span>${html(s)}</span>`).join(""):'<span>내 문장으로 끝까지 완성하기</span>';const sn=crewSnippet(r.answers.join(" "));$("#resultCrewMemberLine").textContent=r.language==="en"?`${crewMemberName(identity)} · “${sn}” stayed in your voice. That’s yours.`:`${crewMemberName(identity)} · “${sn}” 이 문장은 네 말투가 남아 있어. 네 글이야.`;const done=!!bonusEvents[`bonus_${r.completionEventId}`];$("#bonusStart").disabled=done;$("#bonusStart").textContent=done?"추가 연습 완료됨":"추가 연습";$("#bonusPanel").hidden=true}
async function updateStatus(){const exp=await get("exp")||0,g=await get("gems")||{},lv=levelFromExp(exp),complete=Object.values(g).reduce((a,n)=>a+Math.floor(n/6),0);$("#levelChip").textContent="Lv."+lv;$("#gemChip").textContent="보석 "+complete}
async function openRecordEdit(recordId){const records=await get("records")||[],revisions=await get("recordRevisions")||{},r=records.find(x=>x.id===recordId);if(!r)return toast("기록을 찾지 못했어요.");const list=revisions[recordId]||[],original=r.answers.join(" "),latest=list.length?list[list.length-1].text:original;$("#recordEdit").dataset.recordId=recordId;$("#recordEditMeta").textContent=`원문 ${new Date(r.date).toLocaleString("ko-KR")} · EXP/보상은 수정되지 않음`;$("#recordEditText").value=latest;$("#recordRevisionList").innerHTML=`<div class="timelineItem"><b>원문</b><span>${html(original)}</span></div>`+list.map((x,i)=>`<div class="timelineItem"><b>수정본 ${i+1}</b><span>${new Date(x.at).toLocaleString("ko-KR")} · ${html(x.text)}</span></div>`).join("");show("recordEdit")}
async function renderWishHistory(){const txns=await get("wishTransactions")||[],host=$("#wishHistoryList");host.hidden=false;host.innerHTML=txns.length?[...txns].reverse().map(x=>`<div class="timelineItem"><b>${html(x.wish||"소원")} · 완성 보석 ${x.completedGemCount||0}개</b><span>${new Date(x.at).toLocaleString("ko-KR")} · ${x.status==="COMPLETED"?"사용 완료":html(x.status)}</span></div>`).join(""):'<div class="timelineItem"><b>아직 사용한 소원이 없어요.</b><span>축복을 확정하면 여기에 사용 내역이 남아요.</span></div>'}

$("#shopBtn").onclick=()=>show("shop");$("#useWish").onclick=()=>$("#blessing").hidden=false;
$("#confirmBlessing").onclick=async()=>{
  if(wishBusy)return toast("소원을 처리하고 있어요.");
  wishBusy=true;$("#confirmBlessing").disabled=true;
  try{
    const txns=await get("wishTransactions")||[];
    const g={...(await get("gems")||{})},gemLedger=await get("gemLedger")||[];let needCompleted=2;const spend={};
    for(const m of marks){const complete=Math.floor((g[m.id]||0)/6);const take=Math.min(complete,needCompleted);if(take){spend[m.id]=take;g[m.id]-=take*6;needCompleted-=take}if(!needCompleted)break}
    if(needCompleted){toast("완성 보석 2개가 필요해요.");return}
    const id=uid("wish_tx"),at=new Date().toISOString();
    Object.entries(spend).forEach(([landmark,count])=>gemLedger.push({eventId:id,type:"GEM_SPENT",landmark,completedGemDelta:-count,sourceShards:-count*6,at,reason:"WISH_BLESSING"}));
    txns.push({id,status:"COMPLETED",wish:"가족과 주말 영화 보기",spend,completedGemCount:2,at});
    await setMany([["gems",g],["gemLedger",gemLedger],["wishTransactions",txns]]);await updateStatus();renderGems();$("#blessing").hidden=true;if(!$("#wishHistoryList").hidden)renderWishHistory();toast("축복을 사용했어요. 소원 사용 내역에 기록됐어요.")
  }finally{wishBusy=false;$("#confirmBlessing").disabled=false}
}
function isWeekend(d=new Date()){const day=d.getDay();return day===0||day===6}
function specialPromptFor(d=new Date()){const seed=(d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate())%4;return [
 {q:"오늘 본 것 중 하나를 완전히 다른 물건처럼 설명해볼까?",h:"정답은 없어요. 네가 본 장면을 바꿔 상상해봐요."},
 {q:"오늘 가장 기억나는 소리를 이야기 속 단서로 바꿔볼까?",h:"소리에서 시작해서 장면을 하나 만들어봐요."},
 {q:"누군가의 입장에서 오늘 하루를 다시 보면 뭐가 달라질까?",h:"다른 시선 하나만 골라도 충분해요."},
 {q:"평범한 장소에 비밀 하나가 숨어 있다면 무엇일까?",h:"작은 이상함 하나를 네 이야기로 키워봐요."}
 ][seed]}
async function renderSpecialInvite(){const invite=$("#specialInvite");if(!invite)return;invite.hidden=!isWeekend();if(!invite.hidden){const identity=await resolvedIdentity();invite.textContent=`${crewMemberName(identity)}의 특별 탐험 초대장`}}
async function openSpecial(){
  const p=specialPromptFor(),identity=await resolvedIdentity();
  const guest=await chooseSceneGuest("SPECIAL_EXPLORATION");
  $("#specialDate").textContent=new Date().toLocaleDateString("ko-KR");
  $("#specialPrompt").textContent=p.q;
  $("#specialHint").textContent=`${crewMemberName(identity)} · ${p.h}`;
  const presence=$("#specialCrewPresence");
  if(presence){
    presence.textContent=guest?`${crewMemberName(identity)} · ${guest.name}도 이번 장면에 잠깐 합류했네. 같이 보되, 네 생각은 네가 골라.`:"";
    presence.hidden=!guest;
    presence.dataset.memberId=guest?.memberId||"";
  }
  const draft=await get("specialDraft")||"";
  $("#specialAnswer").value=draft;
  show("special")
}
$("#specialInvite").onclick=openSpecial;$("#specialBack").onclick=()=>show("map");$("#specialLater").onclick=()=>show("map");
$("#specialAnswer").addEventListener("input",()=>set("specialDraft",$("#specialAnswer").value));
$("#specialSave").onclick=async()=>{const text=$("#specialAnswer").value.trim();if(!text)return toast("한 줄이라도 네 생각을 남겨볼까?");const memories=await get("specialMemories")||[];const id=uid("special"),at=new Date().toISOString(),p=specialPromptFor(new Date(at)),guestMemberId=$("#specialCrewPresence")?.dataset.memberId||null;memories.unshift({id,at,prompt:p.q,text,guestMemberId});await setMany([["specialMemories",memories],["specialDraft",""]]);await recordCrewExperience("SPECIAL_MEMORY",{eventId:id,prompt:p.q,snippet:crewSnippet(text),guestMemberId});if(guestMemberId)await recordCrewMemberExperience(guestMemberId,"SHARED_MICRO_EPISODE",{eventId:`${id}_guest`,sourceEventId:id,scene:"SPECIAL_EXPLORATION"});$("#specialAnswer").value="";toast("특별 탐험 기억을 남겼어요.");show("records")};
$("#bonusStart").onclick=async()=>{const r=await get("lastResult");if(!r)return;const bonusEvents=await get("bonusEvents")||{},bonusEventId=`bonus_${r.completionEventId}`;if(bonusEvents[bonusEventId])return toast("이미 완료한 추가 연습이에요.");const prompts={idea:"같은 아이디어로 다른 시작 문장 하나를 만들어볼까?",emotion:"같은 마음을 다른 말로 한 문장 표현해볼까?",description:"오감 하나를 더 넣어 장면을 한 문장 늘려볼까?",viewpoint:"다른 시선에서 한 문장만 더 써볼까?",final:"제목이나 마지막 문장 중 하나를 새로 다듬어볼까?"};$("#bonusQuestion").textContent=prompts[r.landmark]||"한 문장 더 만들어볼까?";$("#bonusAnswer").value="";$("#bonusPanel").hidden=false};
$("#bonusSave").onclick=async()=>{const r=await get("lastResult");if(!r)return;const text=$("#bonusAnswer").value.trim();if(!text)return toast("한 문장만 더 남겨볼까?");const bonusEvents=await get("bonusEvents")||{},bonusEventId=`bonus_${r.completionEventId}`;if(bonusEvents[bonusEventId])return toast("이미 완료한 추가 연습이에요.");const gems=await get("gems")||{},gemLedger=await get("gemLedger")||[],beforeShard=gems[r.landmark]||0,at=new Date().toISOString();gems[r.landmark]=beforeShard+1;gemLedger.push({eventId:bonusEventId,type:"BONUS_SHARD_EARNED",landmark:r.landmark,amount:1,at});if(Math.floor((beforeShard+1)/6)>Math.floor(beforeShard/6))gemLedger.push({eventId:bonusEventId,type:"COMPLETE_GEM_CONVERTED",landmark:r.landmark,completedGemDelta:1,sourceShards:6,at});bonusEvents[bonusEventId]={at,landmark:r.landmark,text};await setMany([["gems",gems],["gemLedger",gemLedger],["bonusEvents",bonusEvents]]);await recordBadgeBehaviorObservation("EXTRA_TASK",{explicitChoice:true,completed:true,landmark:r.landmark,bonusEventId},"SNAP_POP");await updateStatus();$("#bonusPanel").hidden=true;$("#bonusStart").disabled=true;$("#bonusStart").textContent="추가 연습 완료됨";toast("추가 연습 완료! 보석 조각 +1 · EXP 추가 없음")};
$("#recordEditBack").onclick=()=>show("records");
$("#recordEditSave").onclick=async()=>{const recordId=$("#recordEdit").dataset.recordId,text=$("#recordEditText").value.trim();if(!recordId||!text)return toast("수정할 내용을 남겨줘.");const records=await get("records")||[],r=records.find(x=>x.id===recordId);if(!r)return toast("기록을 찾지 못했어요.");const revisions=await get("recordRevisions")||{},list=revisions[recordId]||[],current=list.length?list[list.length-1].text:r.answers.join(" ");if(text===current)return toast("바뀐 내용이 없어요.");list.push({id:uid("revision"),at:new Date().toISOString(),text,source:"CHILD_EDIT",originalPreserved:true});revisions[recordId]=list;await set("recordRevisions",revisions);toast("수정본을 저장했어요. 원문은 그대로 보존돼요.");openRecordEdit(recordId)};
$("#wishHistoryBtn").onclick=renderWishHistory;
$("#historyBtn").onclick=renderGrowthTimeline;$("#resultBack").onclick=()=>show("map");$("#resultRecords").onclick=()=>show("records");$("#resultGrowth").onclick=()=>show("growth");$("#calPrev").onclick=()=>{calendarCursor=new Date(calendarCursor.getFullYear(),calendarCursor.getMonth()-1,1);renderRecords()};$("#calNext").onclick=()=>{calendarCursor=new Date(calendarCursor.getFullYear(),calendarCursor.getMonth()+1,1);renderRecords()};
$("#settingsBtn").onclick=()=>show("settings");$("#settingsBack").onclick=()=>show(lastMain);$$("[data-back]").forEach(b=>b.onclick=()=>show(b.dataset.back));
$("#characterBtn").onclick=()=>$("#characterPanel").hidden=!$("#characterPanel").hidden;
$("#crewMemberBtn").onclick=async()=>{$("#crewMemberPanel").hidden=!$("#crewMemberPanel").hidden;if(!$("#crewMemberPanel").hidden)await renderCrewRoster()};
$("#profilePhotoInput").onchange=async e=>{const file=e.target.files?.[0];if(!file)return;if(!file.type.startsWith("image/"))return toast("이미지 파일만 사용할 수 있어요.");const reader=new FileReader();reader.onload=async()=>{const data=String(reader.result||""),previous=await get("characterSourceAsset"),history=await get("characterSourceHistory")||[];if(previous?.originalProfilePhoto)history.push({...previous,archivedAt:new Date().toISOString()});const asset={assetId:uid("profile_source"),originalProfilePhoto:data,processedProfilePhoto:null,characterMasterId:previous?.characterMasterId||null,status:"SOURCE_READY",createdAt:new Date().toISOString(),sourceName:file.name||"camera"};const identity=await resolvedIdentity();identity.profile.photo=data;await setMany([["characterSourceAsset",asset],["characterSourceHistory",history],["identityFallback",identity]]);$("#profilePhotoPreview").hidden=false;$("#profilePhotoImage").src=data;$("#profilePhotoStatus").textContent="로컬 인트로 프로필 · 통합 시 Ready & Set 우선";await renderIdentityPresence();toast("인트로용 로컬 프로필 사진을 보존했어요. 통합 시 Ready & Set 프로필이 우선합니다.")};reader.onerror=()=>toast("사진을 읽지 못했어요.");reader.readAsDataURL(file)};
$("#characterSave").onclick=async()=>{const name=$("#characterName").value.trim(),identity=await resolvedIdentity();identity.profile.name=name;await set("identityFallback",identity);$("#characterSummary").textContent=name?`탐험가 · ${name}`:"Ready & Set 프로필 연동 대기";$("#characterPanel").hidden=true;await renderIdentityPresence();toast(sharedIdentity?"공유 프로필은 Ready & Set 기준을 유지합니다. 로컬 fallback만 저장했어요.":"인트로용 로컬 프로필을 저장했어요. 통합 시 Ready & Set 기준이 우선합니다.")};
$("#crewMemberSuggest").onclick=async()=>{const identity=await resolvedIdentity(),suggestions={maltipoo:["모카","토리","콩"],cat:["루루","모노","살짝"],redpanda:["포포","단추","뒤적"],buddy:["하루","담이","솔"]},arr=suggestions[identity.crewMember.type]||[crewMemberRule(identity).defaultName||"두비"];$("#crewMemberName").value=arr[Math.floor(Date.now()/1000)%arr.length]};
$("#crewMemberSave").onclick=async()=>{const identity=await renameCurrentCrewMember($("#crewMemberName").value);const name=identity.crewMember.name;$("#crewMemberSummary").textContent=`${crewMemberRule(identity).label} · ${name}`;$(".crewMemberLine b").forEach(el=>el.textContent=`탐험대원 ${name}`);$("#crewMemberPanel").hidden=true;await renderIdentityPresence();toast("탐험대원 이름과 이력을 저장했어요.")};
$("#homeRadio").onclick=()=>openImagination({language:"ko",source:"HOME_RADIO"});
$("#autoRead").onchange=$("#reduceMotion").onchange=async()=>{const s=await get("settings")||{};s.autoRead=$("#autoRead").checked;s.reduceMotion=$("#reduceMotion").checked;await set("settings",s);document.documentElement.classList.toggle("reduceMotion",s.reduceMotion)}
$("#nav").onclick=async e=>{const b=e.target.closest("button[data-view]");if(!b)return;const view=b.dataset.view;if(view==="explore"){const active=await get("active");if(active){renderExplore(active);show("explore")}else{show("map");toast("글쓰기 탐험지를 하나 골라 시작해봐.")}}else show(view)}
if("serviceWorker"in navigator)addEventListener("load",()=>navigator.serviceWorker.register("sw.js"));
init().catch(e=>{console.error(e);toast("앱 데이터를 준비하지 못했어요.")});
