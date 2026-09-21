(() => {
"use strict";
let singleton=null;
function create(deps){
const store=window.SnapPopStorage;
function stableHash(s=""){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function affinityTier(score=0){const tiers=deps.getRules()?.affinityEngine?.tiers||[];let t=tiers[0]||{key:"KNOWN",label:"아는 친구",min:0};for(const x of tiers)if(score>=x.min)t=x;return t}
async function ensureCrewRegistry(){
  const registry=await store.get("crewRegistry")||{},identity=await deps.resolvedIdentity();
  for(const [id,rule] of Object.entries({...deps.getRules()?.legacyCharacterLineages,...deps.getRules()?.definedCharacterLineages})){
    registry[id]=registry[id]||{memberId:id,firstName:rule.defaultName||"",currentName:rule.defaultName||"",nameHistory:[],affinity:{levelKey:"OPEN",scoreInternal:0},memories:[],firstMetAt:null,lastMetAt:null,encounterStatus:"STARTER_AVAILABLE"};
  }
  const current=identity.crewMember?.type;
  if(current&&registry[current]){
    if(identity.crewMember.name&&identity.crewMember.name!==registry[current].currentName){
      registry[current].currentName=identity.crewMember.name;
      if(!registry[current].firstName)registry[current].firstName=identity.crewMember.name;
    }
  }
  await store.set("crewRegistry",registry);
  return registry;
}
async function recordCrewMemberExperience(memberId,type,meta={}){
  const registry=await ensureCrewRegistry();if(!memberId||!registry[memberId])return null;
  const entry=registry[memberId],eventId=meta.eventId||deps.uid("crewmem");
  entry.memories=entry.memories||[];
  if(entry.memories.some(x=>x.eventId===eventId))return entry;
  const weight={EXPLORATION_COMPLETE:2,SPECIAL_MEMORY:2,SHARED_MICRO_EPISODE:1,REUNION:0,VOICE_EXPRESSION:0}[type]??0;
  entry.memories.push({eventId,type,at:new Date().toISOString(),...meta});
  entry.affinity=entry.affinity||{levelKey:"KNOWN",scoreInternal:0};
  entry.affinity.scoreInternal=(entry.affinity.scoreInternal||0)+weight;
  const tier=affinityTier(entry.affinity.scoreInternal);entry.affinity.levelKey=tier.key;entry.lastMetAt=new Date().toISOString();
  await store.set("crewRegistry",registry);return entry;
}
async function recordCrewExperience(type,meta={}){
  const identity=await deps.resolvedIdentity(),id=identity.crewMember?.type;
  return recordCrewMemberExperience(id,type,meta);
}
async function chooseSceneGuest(sceneKey,{sceneMood=null,appearanceAuthorized=false}={}){
  if(!appearanceAuthorized)return null;
  if(!window.SnapPopCrewOrchestration||!deps.getRules()?.crewInteractionOrchestration?.guestSelection?.enabled)return null;
  const identity=await deps.resolvedIdentity(),registry=await ensureCrewRegistry(),recent=await store.get("crewGuestAppearances")||[];
  const members={...deps.getRules()?.legacyCharacterLineages,...deps.getRules()?.definedCharacterLineages};
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
  await store.set("crewGuestAppearances",nextLedger);
  const entry=registry[picked.memberId]||{};
  const rule=members[picked.memberId]||{};
  const roleContract=window.SnapPopCrewRoleGuard?.assertRoleContract?.({role:rule.role||"SPECIAL",functionalAdvantage:false,powerBoost:false,rewardMultiplier:1,expMultiplier:1})||{role:"SPECIAL",roleMeaning:"ENCOUNTER_STYLE_ONLY",functionalAbility:"EQUAL"};
  return {
    ...picked,
    roleContract,
    name:entry.currentName||entry.firstName||rule.defaultName||rule.label||"탐험대원",
    label:rule.label||entry.currentName||picked.memberId,
    personality:rule.personality||""
  };
}
async function synthesizeCrewWorldState(){
  const identity=await deps.resolvedIdentity(),registry=await ensureCrewRegistry(),mainId=identity.crewMember?.type,now=new Date();
  const background=(deps.getRules()?.worldStateEngine?.states||["AT_HUB"]).filter(x=>x!=="MAIN_COMPANION");
  let mainState=null;
  for(const [id,entry] of Object.entries(registry)){
    const last=entry.lastMetAt?new Date(entry.lastMetAt):null,days=last?Math.max(0,Math.floor((now-last)/86400000)):0,previous=entry.worldState?.state;
    const seed=stableHash([id,last?.toISOString()?.slice(0,10)||"first",now.toISOString().slice(0,10),entry.memories?.length||0].join("|"));
    const state=id===mainId?"MAIN_COMPANION":background[seed%background.length];
    entry.worldState={state,generatedAt:now.toISOString(),daysSinceSeen:days,synthetic:true};
    if(id===mainId){mainState=entry.worldState;if(days>=2){const evId=`reunion_${id}_${now.toISOString().slice(0,10)}`;entry.memories=entry.memories||[];if(!entry.memories.some(x=>x.eventId===evId))entry.memories.push({eventId:evId,type:"REUNION",at:now.toISOString(),daysAway:days,fromState:previous,toState:state})}}
  }
  await store.set("crewRegistry",registry);return mainState;
}
return Object.freeze({contract:"SNAP_POP_CREW_RUNTIME_CONTROLLER_V1",ensureCrewRegistry,recordCrewMemberExperience,recordCrewExperience,chooseSceneGuest,synthesizeCrewWorldState});
}
window.SnapPopCrewRuntimeController=Object.freeze({instance(deps){if(!singleton)singleton=create(deps);return singleton}});
})();
