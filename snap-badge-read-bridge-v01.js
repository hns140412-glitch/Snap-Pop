(function(root,factory){
  const api=factory(root);
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root)root.SnapBadgeReadBridge=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
  'use strict';
  const VERSION='SNAP_BADGE_READ_BRIDGE_V1';
  const ADAPTER='TAKY_AUTHENTICATED_BADGE_READ_ADAPTER_V1';
  const PROGRESS='TAKY_FAMILY_BADGE_READ_V1';
  const BINDINGS='TAKY_APPROVED_BADGE_GATE_BINDINGS_V1';
  let adapter=null;

  const clean=v=>typeof v==='string'?v.trim():'';
  const uniq=xs=>[...new Set((xs||[]).map(clean).filter(Boolean))];
  const blocked=(reason)=>({
    award_snapshot:{verified:false,badge_ids:[],authority:'UNAVAILABLE',reason},
    approved_badge_bindings:[]
  });

  function connectReadAdapter(input){
    if(!input||input.contract!==ADAPTER||
       typeof input.getProgress!=='function'||
       typeof input.getApprovedBindings!=='function')
      return {ok:false,reason:'AUTHENTICATED_BADGE_READ_ADAPTER_REQUIRED'};
    adapter=input;
    return {ok:true,contract:ADAPTER};
  }
  function disconnect(){adapter=null;return {ok:true};}

  function validateProgress(raw,badgeId,childHint){
    if(!raw||raw.ok!==true||raw.contract!==PROGRESS||
       raw.badge_id!==badgeId||!clean(raw.family_id)||!clean(raw.child_id)||
       !clean(raw.checkpoint)||!Number.isSafeInteger(raw.verified_awards)||
       raw.verified_awards<0||!['LOCKED','EARNED'].includes(raw.ownership_state))
      return null;
    if(childHint&&raw.child_id!==childHint)return null;
    if(raw.ownership_state==='LOCKED'&&(raw.verified_awards!==0||raw.state!=null))
      return null;
    if(raw.ownership_state==='EARNED'&&(raw.verified_awards<1||!raw.state))
      return null;
    return raw;
  }

  function validateBindings(raw,requested){
    if(!raw||raw.ok!==true||raw.contract!==BINDINGS||!Array.isArray(raw.bindings))
      return null;
    const requestSet=new Set(requested),seen=new Set,bindings=[];
    for(const item of raw.bindings){
      if(!item||!clean(item.badge_id)||seen.has(item.badge_id)||!requestSet.has(item.badge_id)||
         typeof item.approved!=='boolean'||typeof item.runtime_active!=='boolean')
        return null;
      seen.add(item.badge_id);
      bindings.push({
        badge_id:item.badge_id,
        approved:item.approved===true,
        runtime_active:item.runtime_active===true
      });
    }
    if(seen.size!==requestSet.size)return null;
    return bindings;
  }

  async function resolveGateContext({candidate_badge_ids=[]}={}){
    const ids=uniq(candidate_badge_ids);
    if(!ids.length)return {
      award_snapshot:{verified:true,badge_ids:[],authority:'AWARD_LEDGER'},
      approved_badge_bindings:[]
    };
    if(!adapter)return blocked('BADGE_READ_ADAPTER_NOT_CONNECTED');

    const hint=clean(root?.SnapPopBridge?.context?.()?.child_id);
    let progressRows,bindingsRaw;
    try{
      [progressRows,bindingsRaw]=await Promise.all([
        Promise.all(ids.map(badge_id=>adapter.getProgress({badge_id}))),
        adapter.getApprovedBindings({badge_ids:[...ids]})
      ]);
    }catch{return blocked('AUTHENTICATED_BADGE_READ_FAILED')}

    const progress=progressRows.map((raw,i)=>validateProgress(raw,ids[i],hint));
    if(progress.some(x=>!x))return blocked('VERIFIED_BADGE_PROGRESS_CONTRACT_REQUIRED');
    const familyIds=new Set(progress.map(x=>x.family_id));
    const childIds=new Set(progress.map(x=>x.child_id));
    if(familyIds.size!==1||childIds.size!==1)
      return blocked('VERIFIED_BADGE_SCOPE_MISMATCH');

    const bindings=validateBindings(bindingsRaw,ids);
    if(!bindings)return blocked('APPROVED_BADGE_BINDING_CONTRACT_REQUIRED');
    if(clean(bindingsRaw.family_id)&&!familyIds.has(bindingsRaw.family_id))
      return blocked('APPROVED_BADGE_BINDING_SCOPE_MISMATCH');
    if(clean(bindingsRaw.child_id)&&!childIds.has(bindingsRaw.child_id))
      return blocked('APPROVED_BADGE_BINDING_SCOPE_MISMATCH');

    const earned=progress.filter(x=>x.ownership_state==='EARNED').map(x=>x.badge_id);
    return {
      award_snapshot:{
        verified:true,badge_ids:earned,authority:'AWARD_LEDGER',
        family_id:[...familyIds][0],child_id:[...childIds][0],
        checkpoints:Object.fromEntries(progress.map(x=>[x.badge_id,x.checkpoint]))
      },
      approved_badge_bindings:bindings
    };
  }

  if(root){
    root.SnapPopBadgeGateContextProvider=async ({candidate_badge_ids=[]}={})=>
      resolveGateContext({candidate_badge_ids});
  }

  return Object.freeze({VERSION,ADAPTER,PROGRESS,BINDINGS,connectReadAdapter,disconnect,resolveGateContext});
});