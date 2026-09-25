(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports) module.exports=api;
  if(root) root.SnapCrewAssetRegistry=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const VERSION='SNAP_CREW_ASSET_APPROVAL_GATE_V1';
  const OWNER='snap-pop';
  const ACTIVE=Object.freeze([]);
  const FORBIDDEN_LINEAGE_ONLY=Object.freeze([
    'assets/character/character_master_hd.jpg',
    'assets/guide/maltipoo_guide_hd.jpg',
    'assets/reference/approved_visual_source.png'
  ]);

  const clean=v=>String(v??'').trim();
  function normalizePath(value=''){
    return clean(value).replace(/^\.\//,'').replace(/^\//,'');
  }

  function validateCandidate(input={}){
    const asset_path=normalizePath(input.asset_path);
    const evidence_refs=Array.isArray(input.review_evidence_refs)?input.review_evidence_refs.map(clean).filter(Boolean):[];
    if(clean(input.owner)!==OWNER)return {ok:false,reason:'OWNER_SCOPE_MISMATCH'};
    if(clean(input.review_status)!=='APPROVED_RUNTIME_ASSET')return {ok:false,reason:'REVIEW_APPROVAL_REQUIRED'};
    if(input.user_confirmed!==true)return {ok:false,reason:'USER_CONFIRMATION_REQUIRED'};
    if(!clean(input.visual_id))return {ok:false,reason:'VISUAL_ID_REQUIRED'};
    if(!asset_path)return {ok:false,reason:'ASSET_PATH_REQUIRED'};
    if(FORBIDDEN_LINEAGE_ONLY.includes(asset_path))return {ok:false,reason:'LINEAGE_ONLY_ASSET_CANNOT_BE_PROMOTED'};
    if(!asset_path.startsWith('assets/crew-approved/'))return {ok:false,reason:'APPROVED_CREW_ASSET_NAMESPACE_REQUIRED'};
    if(evidence_refs.length===0)return {ok:false,reason:'REVIEW_EVIDENCE_REQUIRED'};
    return {
      ok:true,
      record:{
        owner:OWNER,
        visual_id:clean(input.visual_id),
        asset_path,
        review_status:'APPROVED_RUNTIME_ASSET',
        user_confirmed:true,
        review_evidence_refs:evidence_refs,
        approved_at:clean(input.approved_at)||null
      }
    };
  }

  function getActive(visualId){
    const id=clean(visualId);
    return ACTIVE.find(x=>x.visual_id===id)||null;
  }

  function runtimeBinding(visualId){
    const row=getActive(visualId);
    if(!row)return {
      ok:false,
      reason:'NO_APPROVED_CREW_ASSET',
      state:'CONTENT_APPROVAL_HOLD',
      implementation_ready:true
    };
    const checked=validateCandidate(row);
    return checked.ok
      ?{ok:true,state:'APPROVED_RUNTIME_BINDING',asset_path:checked.record.asset_path,record:checked.record}
      :checked;
  }

  return Object.freeze({
    VERSION,
    OWNER,
    ACTIVE,
    FORBIDDEN_LINEAGE_ONLY,
    validateCandidate,
    getActive,
    runtimeBinding
  });
});
