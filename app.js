if(window.__SNAP_RUNTIME_STATUS)window.__SNAP_RUNTIME_STATUS.appScript="STARTED";
const $=q=>document.querySelector(q), $$=q=>[...document.querySelectorAll(q)];
let marks=[], selected=null, lastMain="map", calendarCursor=new Date(), SNAP_RULES=null, writingAnalysisSeq=0;
const LEVEL_NEEDS=[0,80,100,120,150,180,220,260,300,340,380,430,480,540,600,670,740,820,900,990,1080,1180,1280,1390,1500];
const LEVEL_THRESHOLDS=LEVEL_NEEDS.reduce((a,n,i)=>{a.push(i===0?0:a[i-1]+n);return a},[]);
const uid=p=>`${p}_${Date.now()}_${Math.random().toString(36).slice(2,9)}`;
const IDENTITY_DEFAULT={profile:{name:"",photo:"",style:"editorial",shareAvatar:false},crewMember:{type:"dooby",name:"두비",voice:"warm"}};
let sharedIdentity=null;






function stableHash(s=""){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function affinityTier(score=0){const tiers=SNAP_RULES?.affinityEngine?.tiers||[];let t=tiers[0]||{key:"KNOWN",label:"아는 친구",min:0};for(const x of tiers)if(score>=x.min)t=x;return t}
async function proposeBadgeCandidateFromObservations({id,title,families=[],reason=""}={}){
  if(!window.SnapPopBadgeCandidate) throw new Error("BADGE_CANDIDATE_RUNTIME_UNAVAILABLE");
  const observations=await get("badgeBehaviorObservations")||[];
  const candidate=window.SnapPopBadgeCandidate.fromObservationCluster(observations,{id,title,families,reason});
  const ledger=await get("badgeCandidateReviews")||[];
  const existing=ledger.find(x=>x.id===candidate.id);
  if(existing) return existing;
  ledger.unshift(candidate);
  await set("badgeCandidateReviews",ledger.slice(0,200));
  return candidate;
}

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
    const writes=[["badgeBehaviorObservations",ledger.slice(0,1000)]];
    const shared=window.TakyBadgeExperienceContract?.fromSnapObservation?.(event)||null;
    if(shared){
      const sharedLedger=await get("badgeSharedExperienceEvents")||[];
      if(!sharedLedger.some(x=>x.event_id===shared.event_id)){
        sharedLedger.unshift(shared);
        writes.push(["badgeSharedExperienceEvents",sharedLedger.slice(0,1000)]);
      }
    }
    await setMany(writes);
    return event;
  }catch{return null}
}

async function recordBadgeBehaviorEvidence(family,evidence={},options={}){
  if(!window.SnapPopBadgeEvidenceContract)return null;
  try{
    const verifiedEvidence=window.SnapPopBadgeEvidenceContract.verify(family,evidence,options);
    return await recordBadgeBehaviorObservation(family,{
      evidenceContract:verifiedEvidence.contract_version,
      evidenceRef:verifiedEvidence.evidenceRef,
      sourceContractId:verifiedEvidence.sourceContractId,
      explicitChildAction:true,
      inferenceAllowed:false,
      elapsedTimeEvidenceAllowed:false,
      scoreEvidenceAllowed:false,
      beforeArtifactRef:verifiedEvidence.beforeArtifactRef||"",
      afterArtifactRef:verifiedEvidence.afterArtifactRef||"",
      reflectionArtifactRef:verifiedEvidence.reflectionArtifactRef||"",
      featureContractId:verifiedEvidence.featureContractId||"",
      behaviorCode:verifiedEvidence.behaviorCode||""
    },"SNAP_POP_EXPLICIT_EVIDENCE");
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

function openDB(){return window.SnapPopStorage.open()}
function get(k){return window.SnapPopStorage.get(k)}
function set(k,v){return window.SnapPopStorage.set(k,v)}
function setMany(entries){return window.SnapPopStorage.setMany(entries)}

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

function toast(t){return window.SnapPopUIShell.toast(t)}
function show(id){const view=window.SnapPopUIShell.activateView(id);if(view.isMain)lastMain=id;if(id==="records")renderRecords();if(id==="gems")renderGems();if(id==="growth")renderGrowth();if(id==="result")renderLastResult()}
function html(s){return window.SnapPopUIShell.escapeHtml(s)}
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
    const baseline=window.SnapPopCrewCore6?.baseline?.(SNAP_RULES)||{memberIds:SNAP_RULES.recoveredStarterSix?.order||Object.keys(pool),scope:"STARTER_REFERENCE_ONLY",globalAuthority:false,futureExpansionAllowed:true};
    const order=baseline.memberIds;
    starter.innerHTML=`<div class="crewRosterNote"><b>시작 기준점 6명</b><span>Starter reference only · 전체 탐험대 고정 아님 · 미래 확장 허용</span></div>`+
      order.map(id=>{const m=pool[id];if(!m)return "";const on=identity.crewMember.type===id;const meta=[m.species,m.personality,m.visualStatus==="REFERENCE_APPEARANCE_LOCKED"?"Reference 외형 계보":"Visual ID 검증 필요"].filter(Boolean).join(" · ");return `<button type="button" class="crewRosterCard ${on?"on":""}" data-crew-member-id="${id}"><b>${html(m.label)}</b><span>${html(meta)}</span></button>`}).join("");
    starter.onclick=async e=>{const b=e.target.closest("[data-crew-member-id]");if(!b)return;const id=b.dataset.crewMemberId,rule=pool[id];if(!rule||!window.SnapPopCrewCore6?.isCore6?.(id))return;const next=await selectCrewMember(id);$("#crewMemberName").value=next.crewMember.name;$("#crewMemberPersonalityPreview").textContent=`${rule.label} · ${rule.personality||""}`;await renderIdentityPresence();await renderCrewRoster()};
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



function writingController(){return window.SnapPopWritingController.instance({query:$,getLandmarks:()=>marks,resolveIdentity:resolvedIdentity,crewMemberName,crewReaction,crewSnippet,hideCrewReaction,renderExpressionIntentNote})}
function promptFor(landmark,step,language="ko",draft=""){return writingController().promptFor(landmark,step,language,draft)}
function ensureWritingState(s){return writingController().ensureWritingState(s)}
function setModeButtons(language){return writingController().setModeButtons(language)}
function focusGuide(focus,language="ko"){return writingController().focusGuide(focus,language)}
function stepSpecificReaction(text,language="ko",move=null){return writingController().stepSpecificReaction(text,language,move)}
function writingLensLabel(id,language="ko"){return writingController().writingLensLabel(id,language)}
function renderWritingBridge(result,language="ko"){return writingController().renderWritingBridge(result,language)}
function setExpressionBridgeButton(language="ko",draft=""){return writingController().setExpressionBridgeButton(language,draft)}
function renderExpressionBridge(result,sourceLanguage,targetLanguage){return writingController().renderExpressionBridge(result,sourceLanguage,targetLanguage)}
function renderExplore(s){return writingController().renderExplore(s)}
function writingFlowController(){return window.SnapPopWritingFlowController.instance({
  query:$,
  getSelected:()=>selected,
  uid,ensureWritingState,renderExplore,show,analyzeWritingMove,recordExpressionTrace,renderPendingExpressionIntent,promptFor,speak,toast,
  resolvedIdentity,crewMemberName,showCrewReaction,calcExp,learnerContext,vocabularyMaterial,updateStatus,recordCrewExperience,crewSnippet,
  recordBadgeBehaviorObservation,recordBadgeEvent,setExpressionBridgeButton,refreshWritingMove,stepSpecificReaction,
  bumpWritingAnalysisSeq:()=>{writingAnalysisSeq++;return writingAnalysisSeq}
})}
function crewController(){return window.SnapPopCrewController.instance({query:$,IDENTITY_DEFAULT,getRules:()=>SNAP_RULES,stableHash,resolvedIdentity,isWeekend})}
function normalizeCrewType(type){return crewController().normalizeCrewType(type)}
function normalizeIdentity(x={}){return crewController().normalizeIdentity(x)}
function crewMemberRule(identity){return crewController().crewMemberRule(identity)}
function crewReaction(identity,landmark){return crewController().crewReaction(identity,landmark)}
function crewMemberName(identity){return crewController().crewMemberName(identity)}
function crewPerformance(identity,kind="observe"){return crewController().crewPerformance(identity,kind)}
function crewSnippet(text){return crewController().crewSnippet(text)}
async function showCrewReaction(message,options={}){return crewController().showCrewReaction(message,options)}
function hideCrewReaction(){return crewController().hideCrewReaction()}
async function renderSpecialInvite(){return crewController().renderSpecialInvite()}
function crewRuntimeController(){return window.SnapPopCrewRuntimeController.instance({getRules:()=>SNAP_RULES,resolvedIdentity,stableHash,affinityTier,uid})}
async function ensureCrewRegistry(){return crewRuntimeController().ensureCrewRegistry()}
async function recordCrewMemberExperience(memberId,type,meta={}){return crewRuntimeController().recordCrewMemberExperience(memberId,type,meta)}
async function recordCrewExperience(type,meta={}){return crewRuntimeController().recordCrewExperience(type,meta)}
async function chooseSceneGuest(sceneKey,options={}){return crewRuntimeController().chooseSceneGuest(sceneKey,options)}
async function synthesizeCrewWorldState(){return crewRuntimeController().synthesizeCrewWorldState()}
function recordsGrowthController(){return window.SnapPopRecordsGrowthController.instance({query:$,queryAll:$$,getLandmarks:()=>marks,ensureCrewRegistry,getRules:()=>SNAP_RULES,renderCalendar,renderCloudHistory,renderBadgePreview,renderIdentityPresence,levelProgress,levelFromExp,resolvedIdentity,crewSnippet,crewMemberName,show,toast})}
async function renderRecords(){return recordsGrowthController().renderRecords()}
async function renderGems(){return recordsGrowthController().renderGems()}
async function renderGrowth(){return recordsGrowthController().renderGrowth()}
async function renderGrowthTimeline(){return recordsGrowthController().renderGrowthTimeline()}
async function renderLastResult(){return recordsGrowthController().renderLastResult()}
async function updateStatus(){return recordsGrowthController().updateStatus()}
async function openRecordEdit(recordId){return recordsGrowthController().openRecordEdit(recordId)}
async function renderWishHistory(){return recordsGrowthController().renderWishHistory()}
function recordsFlowController(){return window.SnapPopRecordsFlowController.instance({query:$,getLandmarks:()=>marks,toast,recordBadgeBehaviorObservation,recordBadgeBehaviorEvidence,updateStatus,renderGems,renderWishHistory,openRecordEdit,uid,show})}
function specialController(){return window.SnapPopSpecialController.instance({query:$,resolvedIdentity,chooseSceneGuest,crewMemberName,recordCrewExperience,recordCrewMemberExperience,recordBadgeBehaviorEvidence,crewSnippet,uid,toast,show})}
function specialPromptFor(d=new Date()){return specialController().specialPromptFor(d)}
async function openSpecial(){return specialController().openSpecial()}
function imaginationController(){return window.SnapPopImaginationController.instance({query:$,queryAll:$$,resolvedIdentity,crewMemberName,ensureWritingState,showCrewReaction,recordExpressionTrace,renderPendingExpressionIntent,show,toast,uid,speak})}
function setImaginationLanguage(language="ko"){return imaginationController().setImaginationLanguage(language)}
async function openImagination(options={}){return imaginationController().openImagination(options)}
async function closeImagination(){return imaginationController().closeImagination()}
function renderImaginationResponse(result,identity){return imaginationController().renderImaginationResponse(result,identity)}
async function runImagination(inputOverride){return imaginationController().runImagination(inputOverride)}
function runtimePhase(phase){if(window.__SNAP_RUNTIME_STATUS)window.__SNAP_RUNTIME_STATUS.phase=phase}
async function init(){
  runtimePhase("OPEN_DB");await openDB();
  runtimePhase("MIGRATE_LEGACY");await migrateLegacyState();
  runtimePhase("LOAD_CREW_RULES");SNAP_RULES=await fetch("data/exploration-crew-rules.json").then(r=>{if(!r.ok)throw new Error("CREW_RULES_HTTP_"+r.status);return r.json()});
  runtimePhase("LOAD_LANDMARKS");marks=await fetch("data/landmarks.json").then(r=>{if(!r.ok)throw new Error("LANDMARKS_HTTP_"+r.status);return r.json()});
  runtimePhase("MIGRATE_IDENTITY");await migrateIdentityFallback();
  runtimePhase("ENSURE_CREW_REGISTRY");await ensureCrewRegistry();
  runtimePhase("SYNTHESIZE_CREW_WORLD");await synthesizeCrewWorldState();
  runtimePhase("RENDER_LANDMARKS");renderLandmarks();
  runtimePhase("PENDING_EXPRESSION");await renderPendingExpressionIntent();
  runtimePhase("LOAD_SETTINGS");await loadSettings();
  runtimePhase("RENDER_IDENTITY");await renderIdentityPresence();
  runtimePhase("UPDATE_STATUS");await updateStatus();
  runtimePhase("RENDER_RECORDS");await renderRecords();
  runtimePhase("RENDER_GEMS");renderGems();
  runtimePhase("RENDER_GROWTH");renderGrowth();
  runtimePhase("INCOMING_HANDOFF");await renderIncomingHandoff();
  runtimePhase("SPECIAL_INVITE");renderSpecialInvite();
  runtimePhase("ACTIVE");const active=await get("active");if(active)renderExplore(active);
  runtimePhase("DONE");
}

function renderLandmarks(){const host=$("#landmarks");host.innerHTML="";marks.forEach(m=>{const b=document.createElement("button");b.className="landmark";b.textContent=m.title;b.style.left=m.x+"%";b.style.top=m.y+"%";b.onclick=async()=>{selected=m;$$(".landmark").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");const a=await get("active"),g=await get("gems")||{};$("#selTitle").textContent=m.title;$("#selDesc").textContent=m.desc;const identity=await resolvedIdentity();$("#selCrewMemberReaction").textContent=`${crewMemberName(identity)} · ${crewReaction(identity,m.id)}`;$("#selProgress").textContent="진행 "+(a?.landmark===m.id?(Math.min(3,(a.step||0)+1)):0)+" / 3";$("#selShard").textContent="보석 조각 "+((g[m.id]||0)%6)+" / 6";$("#selection").hidden=false};host.appendChild(b)})}






async function revealHint(){const s=await get("active");if(!s)return;const p=promptFor(s.landmark,s.step||0,s.language||"ko",ensureWritingState(s).draft);s.crewState=s.crewState||{};s.crewState.hintLevel=Math.max(1,s.crewState.hintLevel||0);s.crewState.lastHintAt=new Date().toISOString();await set("active",s);await recordBadgeBehaviorObservation("HELP_REQUEST",{explicitAction:true,landmark:s.landmark,step:Math.min(2,s.step||0),hintLevel:s.crewState.hintLevel},"SNAP_POP");$("#hint").textContent=p[1];$("#hint").hidden=false;$("#hintBtn").disabled=true;const identity=await resolvedIdentity();await showCrewReaction((s.language||"ko")==="en"?`${crewMemberName(identity)}: Just one hint. The rest is yours.`:`${crewMemberName(identity)}: 힌트는 하나만. 나머지는 네 생각으로 가보자.`)}
async function resetStepCrewState(s){s.crewState={hintLevel:0,lastReaction:"",cloudReturn:null,lastVoiceLength:0};await set("active",s)}

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
writingFlowController().install();
recordsFlowController().install();
specialController().install();
imaginationController().install();






async function speak(t,language="ko",source="USER_TAP"){try{if(!window.SnapPopVoice)throw new Error("VOICE_RUNTIME_UNAVAILABLE");return await window.SnapPopVoice.speak(t,{language,voiceRole:"crew",source})}catch{return toast("지금은 음성으로 읽어주기 어려워요. 글로 계속 볼 수 있어요.")}}

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














$("#expressionBridgeBtn").onclick=runExpressionBridge;



$("#deepThinkOpen").onclick=()=>{const panel=$("#deepThinkPanel");if(panel){panel.hidden=!panel.hidden;if(!panel.hidden)$("#deepThinkText")?.focus()}};
$("#deepThinkSave").onclick=async()=>{const s=await get("active");if(!s)return;const text=$("#deepThinkText").value.trim();if(!text)return toast("생각을 한 줄만 남겨줘.");const reflectionId=uid("reflection"),at=new Date().toISOString(),ledger=await get("writingReflections")||[];ledger.unshift({id:reflectionId,at,activeId:s.id,landmark:s.landmark,step:Math.min(2,s.step||0),language:s.language||"ko",text,source:"CHILD_EXPLICIT_REFLECTION"});await set("writingReflections",ledger.slice(0,500));await recordBadgeBehaviorEvidence("DEEP_THINKING",{explicitChildAction:true,evidenceRef:`reflection_event_${reflectionId}`,sourceContractId:"SNAP_POP_CHILD_REFLECTION_ARTIFACT_V1",childChoseToReflect:true,reflectionArtifactRef:`writingReflection:${reflectionId}`});$("#deepThinkText").value="";$("#deepThinkPanel").hidden=true;toast("생각 기록을 남겼어요.")};
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

async function renderIdentityPresence(){if(!window.SnapPopStorage.isOpen())return;const identity=await resolvedIdentity(),visual=$("#homeCharacterVisual"),rule=crewMemberRule(identity),name=crewMemberName(identity);$("#homeCharacterName").textContent=identity.profile.name||"나의 탐험가";$("#homeCrewMemberName").textContent=name;const registry0=await ensureCrewRegistry(),entry0=registry0[identity.crewMember.type],ws=entry0?.worldState?.state;const worldLabel={AT_HUB:"거점에 있음",EXPEDITION:"탐험 파견 중",SUPPORTING_OTHER_HUB:"다른 거점 지원 중",VACATION:"휴가 중",RESTING:"쉬는 중",FREE_EXPLORING:"자유 탐험 중",SPECIAL_EVENT:"작은 사건 중",MAIN_COMPANION:"함께 탐험 중"}[ws]||"";$("#homeCrewMemberLine").textContent=[rule.home||"",worldLabel].filter(Boolean).join(" · ");const memberVisual=$("#homeCrewMember .crewMemberPlaceholder");if(memberVisual)memberVisual.textContent=rule.label;if(identity.profile.photo){visual.innerHTML=`<img src="${identity.profile.photo}" alt="">`}else visual.textContent=(identity.profile.name||"탐험가").slice(0,2);const registry=await ensureCrewRegistry(),entry=registry[identity.crewMember.type],tier=affinityTier(entry?.affinity?.scoreInternal||0);$("#growthCompanion").textContent=`${identity.profile.name||"탐험가"} · ${name} · ${tier.label}`;$("#crewMemberPersonalityPreview").textContent=`${rule.label} · ${rule.personality||""} · 관계 ${tier.label}`}
async function renderBadgePreview(){
  const host=$("#badgePreviewVisual");if(!host||!window.SnapPopBadgeVisual||!window.SnapPopBadges)return;
  const identity=await resolvedIdentity(),observations=await get("badgeBehaviorObservations")||[];
  const progress=window.SnapPopBadges.progressFromCount(Math.max(1,observations.length));
  const themeExpression=window.SnapPopBadgeThemeExpression?.normalize({
    themeId:"EXPLORATION",
    assetState:"UNRESOLVED"
  })||null;
  const model=window.SnapPopBadgeVisual.model({
    title:"경험 배지 미리보기",
    theme:"EXPLORATION",
    themeExpression,
    tier:progress.tier||"GREEN",
    stars:progress.stars||1,
    identity
  });
  const slots=window.SnapPopBadgeVisual.starSlots(model.stars);
  host.innerHTML=`<div class="badgeMedallion" data-tier="${html(model.tier)}">
    <div class="badgeGemArc">${slots.map(x=>`<i class="${x.active?"on":""}" aria-hidden="true"></i>`).join("")}</div>
    <div class="badgeIdentity">${model.identity.photo?`<img src="${html(model.identity.photo)}" alt="">`:`<span>${html(model.identity.name.slice(0,4))}</span>`}</div>
  </div>
  <div class="badgePreviewMeta"><b>${html(model.title)}</b><span>${html(model.tier)} · 별 ${model.stars}/5 · 획득/수여 아님</span><span>${model.themeExpression?.assetState==="UNRESOLVED"?"테마 표현 자산 검토 전":"검토된 테마 표현 자산"}</span></div>`;
}










function isWeekend(d=new Date()){const day=d.getDay();return day===0||day===6}










$("#historyBtn").onclick=renderGrowthTimeline;$("#resultBack").onclick=()=>show("map");$("#resultRecords").onclick=()=>show("records");$("#resultGrowth").onclick=()=>show("growth");$("#calPrev").onclick=()=>{calendarCursor=new Date(calendarCursor.getFullYear(),calendarCursor.getMonth()-1,1);renderRecords()};$("#calNext").onclick=()=>{calendarCursor=new Date(calendarCursor.getFullYear(),calendarCursor.getMonth()+1,1);renderRecords()};
$("#settingsBtn").onclick=()=>show("settings");$("#settingsBack").onclick=()=>show(lastMain);$$("[data-back]").forEach(b=>b.onclick=()=>show(b.dataset.back));
$("#characterBtn").onclick=()=>$("#characterPanel").hidden=!$("#characterPanel").hidden;
$("#crewMemberBtn").onclick=async()=>{$("#crewMemberPanel").hidden=!$("#crewMemberPanel").hidden;if(!$("#crewMemberPanel").hidden)await renderCrewRoster()};
$("#profilePhotoInput").onchange=async e=>{const file=e.target.files?.[0];if(!file)return;if(!file.type.startsWith("image/"))return toast("이미지 파일만 사용할 수 있어요.");const reader=new FileReader();reader.onload=async()=>{const data=String(reader.result||""),previous=await get("characterSourceAsset"),history=await get("characterSourceHistory")||[];if(previous?.originalProfilePhoto)history.push({...previous,archivedAt:new Date().toISOString()});const asset={assetId:uid("profile_source"),originalProfilePhoto:data,processedProfilePhoto:null,characterMasterId:previous?.characterMasterId||null,status:"SOURCE_READY",createdAt:new Date().toISOString(),sourceName:file.name||"camera"};const identity=await resolvedIdentity();identity.profile.photo=data;await setMany([["characterSourceAsset",asset],["characterSourceHistory",history],["identityFallback",identity]]);$("#profilePhotoPreview").hidden=false;$("#profilePhotoImage").src=data;$("#profilePhotoStatus").textContent="로컬 인트로 프로필 · 통합 시 Ready & Set 우선";await renderIdentityPresence();toast("인트로용 로컬 프로필 사진을 보존했어요. 통합 시 Ready & Set 프로필이 우선합니다.")};reader.onerror=()=>toast("사진을 읽지 못했어요.");reader.readAsDataURL(file)};
$("#characterSave").onclick=async()=>{const name=$("#characterName").value.trim(),identity=await resolvedIdentity();identity.profile.name=name;await set("identityFallback",identity);$("#characterSummary").textContent=name?`탐험가 · ${name}`:"Ready & Set 프로필 연동 대기";$("#characterPanel").hidden=true;await renderIdentityPresence();toast(sharedIdentity?"공유 프로필은 Ready & Set 기준을 유지합니다. 로컬 fallback만 저장했어요.":"인트로용 로컬 프로필을 저장했어요. 통합 시 Ready & Set 기준이 우선합니다.")};
$("#crewMemberSuggest").onclick=async()=>{const identity=await resolvedIdentity(),suggestions={maltipoo:["모카","토리","콩"],cat:["루루","모노","살짝"],redpanda:["포포","단추","뒤적"],buddy:["하루","담이","솔"]},arr=suggestions[identity.crewMember.type]||[crewMemberRule(identity).defaultName||"두비"];$("#crewMemberName").value=arr[Math.floor(Date.now()/1000)%arr.length]};
$("#crewMemberSave").onclick=async()=>{const identity=await renameCurrentCrewMember($("#crewMemberName").value);const name=identity.crewMember.name;$("#crewMemberSummary").textContent=`${crewMemberRule(identity).label} · ${name}`;$$(".crewMemberLine b").forEach(el=>el.textContent=`탐험대원 ${name}`);$("#crewMemberPanel").hidden=true;await renderIdentityPresence();toast("탐험대원 이름과 이력을 저장했어요.")};

$("#autoRead").onchange=$("#reduceMotion").onchange=async()=>{const s=await get("settings")||{};s.autoRead=$("#autoRead").checked;s.reduceMotion=$("#reduceMotion").checked;await set("settings",s);document.documentElement.classList.toggle("reduceMotion",s.reduceMotion)}
$("#nav").onclick=async e=>{const b=e.target.closest("button[data-view]");if(!b)return;const view=b.dataset.view;if(view==="explore"){const active=await get("active");if(active){renderExplore(active);show("explore")}else{show("map");toast("글쓰기 탐험지를 하나 골라 시작해봐.")}}else show(view)}
if("serviceWorker"in navigator)addEventListener("load",()=>navigator.serviceWorker.register("sw.js"));
init().then(()=>{if(window.__SNAP_RUNTIME_STATUS)window.__SNAP_RUNTIME_STATUS.init="PASS"}).catch(e=>{if(window.__SNAP_RUNTIME_STATUS){window.__SNAP_RUNTIME_STATUS.init="FAIL";window.__SNAP_RUNTIME_STATUS.errors.push({type:"init",message:String(e?.message||e)})}console.error(e);toast("앱 데이터를 준비하지 못했어요.")});
