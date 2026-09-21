if(window.__SNAP_RUNTIME_STATUS)window.__SNAP_RUNTIME_STATUS.appScript="STARTED";
const $=q=>document.querySelector(q), $$=q=>[...document.querySelectorAll(q)];
let marks=[], lastMain="map", SNAP_RULES=null;
const uid=p=>`${p}_${Date.now()}_${Math.random().toString(36).slice(2,9)}`;





























function toast(t){return window.SnapPopUIShell.toast(t)}
function show(id){const view=window.SnapPopUIShell.activateView(id);if(view.isMain)lastMain=id;if(id==="records")renderRecords();if(id==="gems")renderGems();if(id==="growth")renderGrowth();if(id==="result")renderLastResult()}





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
  resolvedIdentity,crewMemberName,showCrewReaction,learnerContext,vocabularyMaterial,updateStatus,recordCrewExperience,crewSnippet,
  recordBadgeBehaviorObservation,recordBadgeEvent,setExpressionBridgeButton,refreshWritingMove,stepSpecificReaction,
  bumpWritingAnalysisSeq:()=>interactionSupportController().bumpWritingAnalysisSeq()
})}
function crewController(){return window.SnapPopCrewController.instance({query:$,getRules:()=>SNAP_RULES,resolvedIdentity,isWeekend})}
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
function crewRuntimeController(){return window.SnapPopCrewRuntimeController.instance({getRules:()=>SNAP_RULES,resolvedIdentity,uid})}
async function ensureCrewRegistry(){return crewRuntimeController().ensureCrewRegistry()}
async function recordCrewMemberExperience(memberId,type,meta={}){return crewRuntimeController().recordCrewMemberExperience(memberId,type,meta)}
async function recordCrewExperience(type,meta={}){return crewRuntimeController().recordCrewExperience(type,meta)}
async function chooseSceneGuest(sceneKey,options={}){return crewRuntimeController().chooseSceneGuest(sceneKey,options)}
async function synthesizeCrewWorldState(){return crewRuntimeController().synthesizeCrewWorldState()}
function recordsGrowthController(){return window.SnapPopRecordsGrowthController.instance({query:$,queryAll:$$,getLandmarks:()=>marks,ensureCrewRegistry,getRules:()=>SNAP_RULES,renderCalendar,renderCloudHistory,renderBadgePreview,renderIdentityPresence,resolvedIdentity,crewSnippet,crewMemberName,show,toast})}
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
function settingsProfileController(){return window.SnapPopSettingsProfileController.instance({query:$,queryAll:$$,getRules:()=>SNAP_RULES,normalizeIdentity,ensureCrewRegistry,crewMemberRule,crewMemberName,show,toast,uid,getLastMain:()=>lastMain})}
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
$("#nav").onclick=async e=>{const b=e.target.closest("button[data-view]");if(!b)return;const view=b.dataset.view;if(view==="explore"){const active=await window.SnapPopStorage.get("active");if(active){renderExplore(active);show("explore")}else{show("map");toast("글쓰기 탐험지를 하나 골라 시작해봐.")}}else show(view)}
if("serviceWorker"in navigator)addEventListener("load",()=>navigator.serviceWorker.register("sw.js"));
init().then(()=>{if(window.__SNAP_RUNTIME_STATUS)window.__SNAP_RUNTIME_STATUS.init="PASS"}).catch(e=>{if(window.__SNAP_RUNTIME_STATUS){window.__SNAP_RUNTIME_STATUS.init="FAIL";window.__SNAP_RUNTIME_STATUS.errors.push({type:"init",message:String(e?.message||e)})}console.error(e);toast("앱 데이터를 준비하지 못했어요.")});
