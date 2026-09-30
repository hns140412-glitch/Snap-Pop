(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root)root.SnapBlessingGate=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const VERSION='SNAP_BLESSING_GATE_V1';

  function uniq(values){return [...new Set((values||[]).map(String).filter(Boolean))]}

  function normalizeAwardSnapshot(snapshot={}){
    return {
      badge_ids:uniq(snapshot.badge_ids||snapshot.awarded_badge_ids||[]),
      authority:String(snapshot.authority||'UNAVAILABLE'),
      verified:snapshot.verified===true
    };
  }

  function normalizeApprovedBindings(bindings=[]){
    return uniq((bindings||[])
      .filter(x=>x&&x.runtime_active===true&&x.approved===true)
      .map(x=>x.badge_id));
  }

  function evaluate(blessing,context={}){
    const gate=blessing?.gate||{type:'NONE'};
    if(gate.type==='NONE')return {ok:true,state:'UNLOCKED',reason:'NO_BADGE_GATE',matched_badge_ids:[]};

    if(gate.type!=='ANY_OF_APPROVED_AWARDED_BADGES'){
      return {ok:false,state:'LOCKED',reason:'UNKNOWN_GATE_TYPE',matched_badge_ids:[]};
    }

    const award=normalizeAwardSnapshot(context.award_snapshot);
    if(!award.verified){
      return {ok:false,state:'LOCKED',reason:'AWARD_LEDGER_NOT_VERIFIED',matched_badge_ids:[]};
    }

    const approved=new Set(normalizeApprovedBindings(context.approved_badge_bindings));
    if(!approved.size){
      return {ok:false,state:'LOCKED',reason:'NO_APPROVED_RUNTIME_BADGE_BINDING',matched_badge_ids:[]};
    }

    const candidateIds=uniq((gate.candidate_badges||[]).map(x=>x.badge_id));
    const awarded=new Set(award.badge_ids);
    const matched=candidateIds.filter(id=>approved.has(id)&&awarded.has(id));
    if(!matched.length){
      return {ok:false,state:'LOCKED',reason:'REQUIRED_BADGE_NOT_AWARDED',matched_badge_ids:[]};
    }

    return {ok:true,state:'UNLOCKED',reason:'APPROVED_AWARDED_BADGE_MATCH',matched_badge_ids:matched};
  }

  function lockMessage(blessing,result){
    if(result?.ok)return '사용 가능';
    const candidates=blessing?.gate?.candidate_badges||[];
    const label=candidates[0]?.stable_name||'관련 뱃지';
    if(result?.reason==='NO_APPROVED_RUNTIME_BADGE_BINDING')return '관련 뱃지 승인 후 열려요';
    if(result?.reason==='AWARD_LEDGER_NOT_VERIFIED')return '획득 기록을 확인하면 열려요';
    return label+' 뱃지를 얻으면 열려요';
  }

  return {VERSION,evaluate,lockMessage,normalizeAwardSnapshot,normalizeApprovedBindings};
});