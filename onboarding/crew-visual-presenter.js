(function(root,factory){
 'use strict';
 const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root)root.CompanionCrewVisualPresenter=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 // Only original approved static cutout for an ID explicitly staged into the isolated visual registry.
 // A text/behavior reaction state is NOT a generated emotion sprite or owner approval.
 const STATES=Object.freeze(['WAIT_CHILD','SHORT_REACTION','ONE_REQUESTED_HINT']);
 function present({visualId,interactionState='WAIT_CHILD'}={},registry){
  if(typeof visualId!=='string'||!STATES.includes(interactionState)||!registry||
    !Array.isArray(registry.memberIds)||!registry.memberIds.includes(visualId)||
    typeof registry.member!=='function'||typeof registry.asset!=='function'||typeof registry.renderPlan!=='function')return null;
  let record,plan,src;
  try{record=registry.member(visualId);plan=registry.renderPlan(visualId);src=registry.asset(visualId,'cutout');}catch{return null}
  if(record?.id!==visualId||!plan?.staticPreviewReady||plan.id!==visualId||record.cutout!==src||
    typeof src!=='string'||!src.startsWith('characters/')||!src.endsWith('.png')||
    src.split('/').some(part=>!part||part==='.'||part==='..'||part.includes('\\')||part.includes(':')))return null;
  return Object.freeze({id:visualId,src,interactionState,
   assetStatus:'APPROVED_ORIGINAL_STATIC_CUTOUT_ONLY',scene:'ISOLATED_HOME_RADIO',
   frameReady:false,independentReactionArtReady:false,motionReady:false,
   rootRegistryActivation:false,owner:'SNAP_ONBOARDING_CANDIDATE'});
 }
 return Object.freeze({version:'VISUAL_ID_APPROVED_STATIC_SCENE_PRESENTER_V1',states:STATES,present,
  automaticArtGeneration:false,rootRegistryActivation:false,readyHideImport:false});
});
