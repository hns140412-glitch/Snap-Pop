(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports) module.exports=api;
  if(root) root.SnapBlessingLockV1=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  function normalizeIds(v){return Array.isArray(v)?[...new Set(v.filter(Boolean).map(String))]:[]}
  function evaluate(rule={},earned=[]){
    const required=normalizeIds(rule.required_badge_ids||rule.required_badge_id?[...(rule.required_badge_ids||[]),...(rule.required_badge_id?[rule.required_badge_id]:[])]:[]);
    const owned=new Set(normalizeIds(earned));
    const missing=required.filter(id=>!owned.has(id));
    return Object.freeze({
      pass:true,
      blessing_id:rule.blessing_id||null,
      required_badge_ids:Object.freeze(required),
      missing_badge_ids:Object.freeze(missing),
      unlocked:missing.length===0,
      use_allowed:missing.length===0
    });
  }
  function evaluateApproved(rule={},earned=[]){
    if(rule.approved!==true||!String(rule.authority_ref||'').trim())return Object.freeze({
      pass:false,reason:'APPROVED_BLESSING_RULE_REQUIRED',blessing_id:rule.blessing_id||null,
      required_badge_ids:Object.freeze([]),missing_badge_ids:Object.freeze([]),unlocked:false,use_allowed:false
    });
    return evaluate(rule,earned);
  }
  return Object.freeze({evaluate,evaluateApproved,automaticUnlockFromUnapprovedData:false});
});
