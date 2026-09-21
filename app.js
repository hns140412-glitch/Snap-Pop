if(window.__SNAP_RUNTIME_STATUS)window.__SNAP_RUNTIME_STATUS.appScript="STARTED";
const $=q=>document.querySelector(q), $$=q=>[...document.querySelectorAll(q)];
let marks=[], lastMain="map", SNAP_RULES=null;
const LEVEL_NEEDS=[0,80,100,120,150,180,220,260,300,340,380,430,480,540,600,670,740,820,900,990,1080,1180,1280,1390,1500];
const LEVEL_THRESHOLDS=LEVEL_NEEDS.reduce((a,n,i)=>{a.push(i===0?0:a[i-1]+n);return a},[]);
const uid=p=>`${p}_${Date.now()}_${Math.random().toString(36).slice(2,9)}`;
const IDENTITY_DEFAULT={profile:{name:"",photo:"",style:"editorial",shareAvatar:false},crewMember:{type:"dooby",name:"두비",voice:"warm"}};






function stableHash(s=""){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function affinityTier(score=0){const tiers=SNAP_RULES?.affinityEngine?.tiers||[];let t=tiers[0]||{key:"KNOWN",label:"아는 친구",min:0};for(const x of tiers)if(score>=x.min)t=x;return t}



















function openDB(){return window.SnapPopStorage.open()}
function get(k){return window.SnapPopStorage.get(k)}
function set(k,v){return window.SnapPopStorage.set(k,v)}
function setMany(entries){return window.SnapPopStorage.setMany(entries)}




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
  getSelected:()=>interactionSupportController().getSelected(),
  uid,ensureWritingState,renderExplore,show,analyzeWritingMove,recordExpressionTrace,renderPendingExpressionIntent,promptFor,speak,toast,
  resolvedIdentity,crewMemberName,showCrewReaction,calcExp,learnerContext,vocabularyMaterial,updateStatus,recordCrewExperience,crewSnippet,
  recordBadgeBehaviorObservation,recordBadgeEvent,setExpressionBridgeButton,refreshWritingMove,stepSpecificReaction,
  bumpWritingAnalysisSeq:()=>interactionSupportController().bumpWritingAnalysisSeq()
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
function settingsProfileController(){return window.SnapPopSettingsProfileController.instance({query:$,queryAll:$$,IDENTITY_DEFAULT,getRules:()=>SNAP_RULES,normalizeIdentity,ensureCrewRegistry,crewMemberRule,crewMemberName,affinityTier,show,toast,uid,getLastMain:()=>lastMain})}
async function migrateIdentityFallback(){return settingsProfileController().migrateIdentityFallback()}
async function resolvedIdentity(){return settingsProfileController().resolvedIdentity()}
async function applySharedIdentity(identity){return settingsProfileController().applySharedIdentity(identity)}
async function selectCrewMember(memberId){return settingsProfileController().selectCrewMember(memberId)}
async function renameCurrentCrewMember(nextName){return settingsProfileController().renameCurrentCrewMember(nextName)}
async function loadSettings(){return settingsProfileController().loadSettings()}
async function renderCrewRoster(){return settingsProfileController().renderCrewRoster()}
async function renderIdentityPresence(){return settingsProfileController().renderIdentityPresence()}
function badgeController(){return window.SnapPopBadgeController.instance({query:$,uid,resolvedIdentity})}
async function proposeBadgeCandidateFromObservations(args={}){return badgeController().proposeBadgeCandidateFromObservations(args)}
async function recordBadgeBehaviorObservation(family,payload={},source="SNAP_POP"){return badgeController().recordBadgeBehaviorObservation(family,payload,source)}
async function recordBadgeBehaviorEvidence(family,evidence={},options={}){return badgeController().recordBadgeBehaviorEvidence(family,evidence,options)}
async function recordBadgeEvent(family,payload={},source="SNAP_POP"){return badgeController().recordBadgeEvent(family,payload,source)}
async function renderBadgePreview(){return badgeController().renderBadgePreview()}
function bridgeContextController(){return window.SnapPopBridgeContextController.instance({query:$,ensureWritingState,toast,renderExpressionBridge,setExpressionBridgeButton,uid})}
function learnerContext(){return bridgeContextController().learnerContext()}
function vocabularyMaterial(){return bridgeContextController().vocabularyMaterial()}
async function runExpressionBridge(){return bridgeContextController().runExpressionBridge()}
function currentBridgeContext(){return bridgeContextController().currentBridgeContext()}
async function renderIncomingHandoff(){return bridgeContextController().renderIncomingHandoff()}
async function recordExpressionTrace(type,meta={}){return bridgeContextController().recordExpressionTrace(type,meta)}
async function dismissPendingExpressionIntent(){return bridgeContextController().dismissPendingExpressionIntent()}
async function renderPendingExpressionIntent(){return bridgeContextController().renderPendingExpressionIntent()}
function renderExpressionIntentNote(s){return bridgeContextController().renderExpressionIntentNote(s)}



function interactionSupportController(){return window.SnapPopInteractionSupportController.instance({query:$,queryAll:$$,getLandmarks:()=>marks,promptFor,ensureWritingState,recordBadgeBehaviorObservation,recordBadgeBehaviorEvidence,resolvedIdentity,showCrewReaction,crewMemberName,crewReaction,learnerContext,vocabularyMaterial,renderWritingBridge,toast,recordCrewExperience,uid,renderGrowthTimeline,show,renderRecords})}
function renderLandmarks(){return interactionSupportController().renderLandmarks()}
async function revealHint(){return interactionSupportController().revealHint()}
async function resetStepCrewState(s){return interactionSupportController().resetStepCrewState(s)}
async function analyzeWritingMove(s){return interactionSupportController().analyzeWritingMove(s)}
function refreshWritingMove(s){return interactionSupportController().refreshWritingMove(s)}
async function speak(t,language="ko",source="USER_TAP"){return interactionSupportController().speak(t,language,source)}
async function renderCloudHistory(){return interactionSupportController().renderCloudHistory()}
function renderCalendar(records,special=[]){return interactionSupportController().renderCalendar(records,special)}
function isWeekend(d=new Date()){return interactionSupportController().isWeekend(d)}
function bootstrapController(){return window.SnapPopBootstrapController.instance({
  uid,
  setRules:v=>{SNAP_RULES=v},
  setLandmarks:v=>{marks=v},
  migrateIdentityFallback,ensureCrewRegistry,synthesizeCrewWorldState,renderLandmarks,renderPendingExpressionIntent,loadSettings,renderIdentityPresence,updateStatus,renderRecords,renderGems,renderGrowth,renderIncomingHandoff,renderSpecialInvite,renderExplore
})}
async function migrateLegacyState(){return bootstrapController().migrateLegacyState()}
function runtimePhase(phase){return bootstrapController().runtimePhase(phase)}
async function init(){return bootstrapController().init()}



















writingFlowController().install();
recordsFlowController().install();
specialController().install();
imaginationController().install();































bridgeContextController().install();
$$("[data-back]").forEach(b=>b.onclick=()=>show(b.dataset.back));
interactionSupportController().install();
settingsProfileController().install();
$("#nav").onclick=async e=>{const b=e.target.closest("button[data-view]");if(!b)return;const view=b.dataset.view;if(view==="explore"){const active=await get("active");if(active){renderExplore(active);show("explore")}else{show("map");toast("글쓰기 탐험지를 하나 골라 시작해봐.")}}else show(view)}
if("serviceWorker"in navigator)addEventListener("load",()=>navigator.serviceWorker.register("sw.js"));
init().then(()=>{if(window.__SNAP_RUNTIME_STATUS)window.__SNAP_RUNTIME_STATUS.init="PASS"}).catch(e=>{if(window.__SNAP_RUNTIME_STATUS){window.__SNAP_RUNTIME_STATUS.init="FAIL";window.__SNAP_RUNTIME_STATUS.errors.push({type:"init",message:String(e?.message||e)})}console.error(e);toast("앱 데이터를 준비하지 못했어요.")});
