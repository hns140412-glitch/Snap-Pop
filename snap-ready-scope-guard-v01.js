(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root)root.SnapReadyScopeGuardV01=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  // The host must explicitly provision the exact Ready page URL before this
  // module loads. An incoming return_target, referrer, child_id or URL origin
  // is NEVER allowed to configure its own trust. No production host is guessed.
  const clean=v=>String(v??'').trim();
  const LOOPBACK=new Set(['localhost','127.0.0.1','[::1]']);
  const FIELDS=['session_id','goal_id','task_id','lap_id','return_target','from_app',
    'word','word_context','child_id','subject','concept_skill_target','learning_target_id'];
  function safeBaseUrl(raw){
    try{
      const u=new URL(clean(raw));
      if((u.protocol!=='https:'&&!(u.protocol==='http:'&&LOOPBACK.has(u.hostname)))||
         u.username||u.password||u.search||u.hash)return null;
      return u;
    }catch{return null;}
  }
  function allowedTargets(raw){
    if(!Array.isArray(raw))return Object.freeze([]);
    return Object.freeze([...new Set(raw.map(v=>safeBaseUrl(v)?.href).filter(Boolean))]);
  }
  function trustedTarget(value,allowed){
    const url=safeBaseUrl(value);
    if(!url)return null;
    return Array.isArray(allowed)&&allowed.includes(url.href)
      ?{href:url.href,origin:url.origin}:null;
  }
  function pick(raw){
    const out={};
    for(const key of FIELDS){
      const v=clean(raw?.[key]);
      if(v)out[key]=v;
    }
    return out;
  }
  function prepareContext(raw,previous,allowed,{incoming=false,now=null}={}){
    const candidate=pick(incoming?raw:previous);
    if(!incoming&&!Object.keys(candidate).length)
      return {ok:true,linked:false,context:{}};
    const attempted=!!(candidate.session_id||candidate.task_id||
      candidate.lap_id||candidate.return_target||candidate.from_app);
    if(attempted){
      if(!candidate.session_id||!candidate.task_id||!candidate.lap_id||
         !candidate.return_target||candidate.from_app!=='ready-set')
        return {ok:false,linked:false,context:{},reason:'LINKED_RUN_FIELDS_REQUIRED'};
      const ready=trustedTarget(candidate.return_target,allowed);
      if(!ready)return {ok:false,linked:false,context:{},reason:'UNTRUSTED_READY_TARGET'};
      return {ok:true,linked:true,context:{
        ...candidate,return_target:ready.href,linked_context_valid:true,
        scope_is_continuity_only:true,
        received_at:incoming?(now||new Date().toISOString()):clean(previous?.received_at)||null,
        task_completed:incoming?false:previous?.task_completed===true
      }};
    }
    // Standalone handoff word is allowed, but cannot inherit the old run.
    return {ok:true,linked:false,context:{
      ...(candidate.word?{word:candidate.word}:{}),
      ...(candidate.word_context?{word_context:candidate.word_context}:{}),
      ...(incoming?{received_at:now||new Date().toISOString()}:{}),
      linked_context_valid:false
    }};
  }
  function boundScope(context,input,{targetRequired=true}={}){
    const c=context||{},i=input||{};
    if(!c.linked_context_valid||!c.session_id||!c.task_id)
      return {ok:false,reason:'LINKED_RUN_REQUIRED'};
    const required=['child_id','subject','concept_skill_target',
      ...(targetRequired?['learning_target_id']:[])];
    for(const key of required)if(!clean(c[key]))
      return {ok:false,reason:'BOUND_'+key.toUpperCase()+'_MISSING'};
    for(const [requested,bound] of [
      ['member_id','child_id'],['child_id','child_id'],['subject','subject'],
      ['skill_id','concept_skill_target'],['concept_skill_target','concept_skill_target'],
      ['learning_target_id','learning_target_id']
    ]){
      const v=clean(i[requested]),b=clean(c[bound]);
      if(v&&(!b||(requested==='member_id'||requested==='child_id'||bound==='learning_target_id'
          ?v!==b:v.toLowerCase()!==b.toLowerCase())))
        return {ok:false,reason:'BOUND_'+bound.toUpperCase()+'_MISMATCH'};
    }
    return {ok:true,scope:{
      member_id:clean(c.child_id),subject:clean(c.subject),
      concept_skill_target:clean(c.concept_skill_target),
      learning_target_id:clean(c.learning_target_id)||null
    },continuity_only:true,authenticated:false};
  }
  return Object.freeze({VERSION:'SNAP_READY_SCOPE_GUARD_V01',
    FIELDS:Object.freeze([...FIELDS]),allowedTargets,trustedTarget,prepareContext,boundScope});
});
