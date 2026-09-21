(() => {
"use strict";
let singleton=null;
function create(deps){
const q=deps.query;
const store=window.SnapPopStorage;
function normalizeCrewType(type){return ({lumi:"maltipoo",pico:"redpanda",mori:"buddy"}[type]||type||"dooby")}
function normalizeIdentity(x={}){
  const p=x.profile||{},legacy=x.guide||{},member=x.crewMember||legacy,type=normalizeCrewType(member.type);
  return {profile:{...deps.IDENTITY_DEFAULT.profile,...p},crewMember:{...deps.IDENTITY_DEFAULT.crewMember,...member,type},explorationCrewRulesVersion:deps.getRules()?.version||x.explorationCrewRulesVersion||"PENDING"};
}
function crewMemberRule(identity){const type=normalizeCrewType(identity?.crewMember?.type),pool=deps.getRules()?.definedCharacterLineages||{},legacy=deps.getRules()?.legacyCharacterLineages||{};return pool[type]||legacy[type]||pool.dooby||{label:"탐험대원",defaultName:"두비",home:"같이 가자.",reactions:{},behavior:{}}}
function crewReaction(identity,landmark){return crewMemberRule(identity).reactions?.[landmark]||"한 조각씩 같이 찾아보자."}
function crewMemberName(identity){return identity?.crewMember?.name||crewMemberRule(identity).defaultName||"두비"}
function crewPerformance(identity,kind="observe"){
  const r=crewMemberRule(identity),gesture=r.gestures?.[kind]||r.gestures?.observe||"",motifs=r.reactionMotifs||[];
  return {gesture,motif:motifs.length?motifs[deps.stableHash((identity.crewMember?.type||"")+"|"+kind)%motifs.length]:""};
}
function crewSnippet(text){const clean=(text||"").trim().replace(/\s+/g," ");return clean.length>18?clean.slice(0,18)+"…":clean}
async function showCrewReaction(message,{persist=true,kind="observe"}={}){const box=q("#crewReactionOverlay");if(!box||!message)return;const identity=await deps.resolvedIdentity(),perf=crewPerformance(identity,kind),language=(await store.get("active"))?.language||"ko",safety=window.SnapPopCrewInteractionSafety,safeMessage=safety&&typeof safety.safeReaction==="function"?safety.safeReaction(message,{language}):message;box.innerHTML=`<span class="reactionMotif">${window.SnapPopUIShell.escapeHtml(perf.motif)}</span><b>${window.SnapPopUIShell.escapeHtml(perf.gesture)}</b><span>${window.SnapPopUIShell.escapeHtml(safeMessage)}</span>`;box.hidden=false;box.classList.add("show");box.dataset.kind=kind;if(persist){const s=await store.get("active");if(s){s.crewState=s.crewState||{};s.crewState.lastReaction=safeMessage;s.crewState.reactionAt=new Date().toISOString();await store.set("active",s)}}if(!document.documentElement.classList.contains("reduceMotion")){clearTimeout(window.crewReactionTimer);window.crewReactionTimer=setTimeout(()=>{box.classList.remove("show")},2200)}}
function hideCrewReaction(){const box=q("#crewReactionOverlay");if(box){box.hidden=true;box.classList.remove("show")}}
async function renderSpecialInvite(){const invite=q("#specialInvite");if(!invite)return;invite.hidden=!deps.isWeekend();if(!invite.hidden){const identity=await deps.resolvedIdentity();invite.textContent=`${crewMemberName(identity)}의 특별 탐험 초대장`}}
return Object.freeze({contract:"SNAP_POP_CREW_CONTROLLER_V1",normalizeCrewType,normalizeIdentity,crewMemberRule,crewReaction,crewMemberName,crewPerformance,crewSnippet,showCrewReaction,hideCrewReaction,renderSpecialInvite});
}
window.SnapPopCrewController=Object.freeze({instance(deps){if(!singleton)singleton=create(deps);return singleton}});
})();
