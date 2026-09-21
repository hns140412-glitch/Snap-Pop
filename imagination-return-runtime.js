(() => {
  "use strict";
  const VERSION="2026.09.21-a";

  function clean(value,max=6000){
    return typeof value==="string"?value.slice(0,max):"";
  }

  function capture(active={}){
    if(!active?.id) return null;
    return Object.freeze({
      contract_version:"SNAP_POP_IMAGINATION_RETURN_V1",
      activeId:String(active.id),
      landmark:String(active.landmark||""),
      step:Math.min(2,Math.max(0,Number(active.step)||0)),
      language:active.language==="en"?"en":"ko",
      draft:clean(active.draft||"",6000),
      capturedAt:new Date().toISOString()
    });
  }

  function validate(current={},snapshot=null){
    if(!snapshot||snapshot.contract_version!=="SNAP_POP_IMAGINATION_RETURN_V1"){
      return {ok:false,reason:"SNAPSHOT_MISSING"};
    }
    if(current?.id!==snapshot.activeId) return {ok:false,reason:"ACTIVE_SESSION_CHANGED"};
    if(String(current?.landmark||"")!==snapshot.landmark) return {ok:false,reason:"LANDMARK_CHANGED"};
    if(Math.min(2,Math.max(0,Number(current?.step)||0))!==snapshot.step) return {ok:false,reason:"STEP_CHANGED"};
    const language=current?.language==="en"?"en":"ko";
    if(language!==snapshot.language) return {ok:false,reason:"LANGUAGE_CHANGED"};
    return {ok:true,reason:"MATCH"};
  }

  function returnDraft(current={},snapshot=null){
    const check=validate(current,snapshot);
    if(!check.ok) return {...check,draft:null};
    // Never overwrite a newer current draft. Snapshot is fallback only.
    const currentDraft=typeof current.draft==="string"?current.draft:null;
    return {
      ok:true,
      reason:"MATCH",
      draft:currentDraft===null?snapshot.draft:currentDraft,
      snapshotDraftPreserved:currentDraft===null
    };
  }

  window.SnapPopImaginationReturnGuard=Object.freeze({
    version:VERSION,
    capture,
    validate,
    returnDraft
  });
})();