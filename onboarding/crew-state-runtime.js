(function(root,factory){
  'use strict';
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root)root.CompanionCrewState=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const VERSION='COMPANION_CREW_LOCAL_STATE_V1';
  const CORE6=Object.freeze([['dubi','두비'],['lori','로리'],['ink','잉크'],['nova','노바'],['take','테이크'],['zero','제로']]);
  const ids=Object.freeze(CORE6.map(x=>x[0])),names=Object.freeze(Object.fromEntries(CORE6));
  const validId=id=>ids.includes(id);
  const clean=(s,max=18)=>typeof s==='string'?s.trim().slice(0,max):'';
  const iso=v=>typeof v==='string'&&/^\d{4}-\d\d-\d\dT/.test(v)&&!Number.isNaN(Date.parse(v))?v:null;
  const now=()=>new Date().toISOString();
  const nameEntry=x=>x&&typeof x==='object'&&clean(x.from)&&clean(x.to)&&iso(x.at)?{from:clean(x.from),to:clean(x.to),at:iso(x.at)}:null;
  const primaryEntry=x=>x&&typeof x==='object'&&(!x.from||validId(x.from))&&(!x.to||validId(x.to))&&iso(x.at)&&['SELECTED','CHANGED','CLEARED'].includes(x.reason)?{from:x.from||null,to:x.to||null,reason:x.reason,at:iso(x.at)}:null;
  const candidateEntry=x=>x&&typeof x==='object'&&clean(x.eventId,100)&&validId(x.memberId)&&['EXPLORATION_COMPLETE','SHARED_EPISODE'].includes(x.type)&&clean(x.sessionId,100)&&clean(x.taskId,100)&&clean(x.evidenceRef,180)&&iso(x.at)&&x.source==='SNAP_POP_LOCAL_TASK_RESULT'&&x.childAuthored===true?{
    eventId:clean(x.eventId,100),memberId:x.memberId,type:x.type,sessionId:clean(x.sessionId,100),taskId:clean(x.taskId,100),evidenceRef:clean(x.evidenceRef,180),source:'SNAP_POP_LOCAL_TASK_RESULT',childAuthored:true,at:iso(x.at),authority:'LOCAL_CANDIDATE_NOT_CROSS_APP_VERIFIED'
  }:null;
  function initial(){return {version:VERSION,members:Object.fromEntries(CORE6.map(([id,name])=>[id,{id,firstName:name,currentName:name,nameHistory:[],firstMetAt:null,experienceCandidates:[]}])),primaryHistory:[]};}
  function restore(raw){
    const out=initial();
    if(!raw||typeof raw!=='object'||Array.isArray(raw))return out;
    for(const id of ids){
      const x=raw.members?.[id];if(!x||typeof x!=='object'||Array.isArray(x))continue;
      const member=out.members[id];member.currentName=clean(x.currentName)||member.firstName;
      member.nameHistory=Array.isArray(x.nameHistory)?x.nameHistory.map(nameEntry).filter(Boolean):[];
      member.firstMetAt=iso(x.firstMetAt);
      const seen=new Set();
      member.experienceCandidates=Array.isArray(x.experienceCandidates)?x.experienceCandidates.map(candidateEntry).filter(e=>{
        if(!e||e.memberId!==id||seen.has(e.eventId))return false;seen.add(e.eventId);return true;
      }):[];
    }
    out.primaryHistory=Array.isArray(raw.primaryHistory)?raw.primaryHistory.map(primaryEntry).filter(Boolean):[];
    return out;
  }
  const member=(ledger,id)=>{if(!validId(id))throw Error('CREW_UNKNOWN_MEMBER');return restore(ledger).members[id];};
  const displayName=(ledger,id)=>validId(id)?member(ledger,id).currentName:'';
  function firstMeeting(ledger,at=now()){
    const tick=iso(at);if(!tick)throw Error('CREW_DATE_REQUIRED');
    const result=restore(ledger);
    for(const id of ids)if(!result.members[id].firstMetAt)result.members[id].firstMetAt=tick;
    return result;
  }
  function rename(ledger,id,requested,at=now()){
    if(!validId(id))throw Error('CREW_UNKNOWN_MEMBER');
    const next=clean(requested),tick=iso(at);if(!next||!tick)throw Error('CREW_VALID_NAME_AND_DATE_REQUIRED');
    const result=restore(ledger),m=result.members[id];
    if(!m.firstMetAt)throw Error('CREW_FIRST_MEETING_REQUIRED');
    if(m.currentName===next)return result;
    m.nameHistory.push({from:m.currentName,to:next,at:tick});
    m.currentName=next;return result;
  }
  function choosePrimary(ledger,selected,id,currentId='',at=now()){
    if(!Array.isArray(selected)||selected.length<5||selected.length>6||new Set(selected).size!==selected.length||selected.some(x=>!validId(x)))throw Error('CREW_MEMBERSHIP_REQUIRED');
    if(!validId(id)||!selected.includes(id))throw Error('PRIMARY_MUST_BE_SELECTED_MEMBER');
    if(currentId&&(!validId(currentId)))throw Error('INVALID_PREVIOUS_PRIMARY');
    const result=restore(ledger),tick=iso(at);if(!tick)throw Error('CREW_DATE_REQUIRED');
    if(currentId!==id)result.primaryHistory.push({from:currentId||null,to:id,reason:currentId?'CHANGED':'SELECTED',at:tick});
    return result;
  }
  function clearPrimary(ledger,currentId='',at=now()){
    const result=restore(ledger),tick=iso(at);if(!tick)throw Error('CREW_DATE_REQUIRED');
    if(currentId&&validId(currentId))result.primaryHistory.push({from:currentId,to:null,reason:'CLEARED',at:tick});
    return result;
  }
  function appendLocalExperienceCandidate(ledger,input={}){
    // Local child-authored Snap task evidence only. This is NOT central Learning Engine
    // verification, affinity, reward, a fabricated event, or cross-app ingestion.
    const entry=candidateEntry({...input,at:input.at||now()});
    if(!entry)throw Error('VERIFIABLE_LOCAL_SNAP_TASK_EVIDENCE_REQUIRED');
    const result=restore(ledger),m=result.members[entry.memberId];
    if(!m.firstMetAt)throw Error('CREW_FIRST_MEETING_REQUIRED');
    if(ids.some(id=>result.members[id].experienceCandidates.some(x=>x.eventId===entry.eventId)))return result;
    m.experienceCandidates.push(entry);return result;
  }
  function view(ledger,selected=[],primary=''){
    const state=restore(ledger);
    return ids.map(id=>({
      id,originalName:state.members[id].firstName,currentName:state.members[id].currentName,
      firstMetAt:state.members[id].firstMetAt,
      role:primary===id&&selected.includes(id)?'MAIN_COMPANION':selected.includes(id)?'CHOSEN_CREW':'KNOWN_FRIEND',
      nameHistoryCount:state.members[id].nameHistory.length,
      localExperienceCandidateCount:state.members[id].experienceCandidates.length,
      functionalAbility:'EQUAL',powerBoost:false,affinityAutoAward:false
    }));
  }
  return Object.freeze({VERSION,CORE6,ids,initial,restore,displayName,firstMeeting,rename,choosePrimary,clearPrimary,appendLocalExperienceCandidate,view,
    crossAppAuthority:'NONE_LOCAL_CANDIDATE',automaticAffinity:false,automaticReward:false});
});
