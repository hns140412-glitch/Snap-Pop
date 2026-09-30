(function(root,factory){
 'use strict';
 const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root)root.CompanionCrewVisualPresenter=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 // Only original approved static cutout for an ID explicitly staged into the isolated visual registry.
 // A text/behavior reaction state is NOT a generated emotion sprite or owner approval.
 const STATES=Object.freeze(['WAIT_CHILD','SHORT_REACTION','ONE_REQUESTED_HINT']);
 function present({visualId,interactionState='WAIT_CHILD',runtimeDecision=null}={},registry){
  if(typeof visualId!=='string'||!STATES.includes(interactionState)||!registry||
    !Array.isArray(registry.memberIds)||!registry.memberIds.includes(visualId)||
    typeof registry.member!=='function'||typeof registry.asset!=='function'||typeof registry.renderPlan!=='function')return null;
  if(runtimeDecision!==null&&(runtimeDecision?.ok!==true||typeof runtimeDecision.scene_slot!=='string'||!runtimeDecision.scene_slot))return null;
  let record,plan,src;
  try{record=registry.member(visualId);plan=registry.renderPlan(visualId);src=registry.asset(visualId,'cutout');}catch{return null}
  if(record?.id!==visualId||!plan?.staticPreviewReady||plan.id!==visualId||record.cutout!==src||
    typeof src!=='string'||!src.startsWith('characters/')||!src.endsWith('.png')||
    src.split('/').some(part=>!part||part==='.'||part==='..'||part.includes('\\')||part.includes(':')))return null;
  return Object.freeze({id:visualId,src,interactionState,
   assetStatus:'APPROVED_ORIGINAL_STATIC_CUTOUT_ONLY',scene:'ISOLATED_HOME_RADIO',
   sceneSlot:runtimeDecision?.scene_slot||'FG_RIGHT',
   dialogueIntent:runtimeDecision?.dialogue_intent||null,
   interruptibility:runtimeDecision?.interruptibility||null,
   runtimePolicyVersion:runtimeDecision?'CREW_RUNTIME_POLICY_V1':null,
   frameReady:false,independentReactionArtReady:false,motionReady:false,
   rootRegistryActivation:false,owner:'SNAP_ONBOARDING_CANDIDATE'});
 }
 function promoteComposable({command,runtimeDecision=null}={},registry,assetEngine,renderer){
  if(!command||command.behavior_state!=='AMBIENT'||!command.ambient_action)return null;
  if(runtimeDecision!==null&&(runtimeDecision?.ok!==true||typeof runtimeDecision.scene_slot!=='string'||!runtimeDecision.scene_slot))return null;
  if(!registry||typeof registry.member!=='function'||!assetEngine||typeof assetEngine.resolve!=='function'||!renderer||typeof renderer.renderPlan!=='function')return null;
  const assets=assetEngine.resolve(command,registry);
  if(!assets||assets.fallback===true||assets.generated!==false)return null;
  const render=renderer.renderPlan(command,assets);
  if(!render||render.semantic_preserved!==true||render.relation_mutation!==false||render.affinity_mutation!==false)return null;
  return Object.freeze({
    id:command.character_id,
    interactionState:'AMBIENT_ACTION',
    assetStatus:'COMPOSABLE_ACTION_APPROVED',
    scene:'POLICY_ALLOCATED_WORLD_SCENE',
    sceneSlot:runtimeDecision?.scene_slot||null,
    ambientAction:command.ambient_action,
    assets:Object.freeze([...(render.assets||[])]),
    actionReady:true,
    motionReady:false,
    generated:false,
    semanticPreserved:true,
    relationMutation:false,
    affinityMutation:false,
    rootRegistryActivation:false,
    owner:'SNAP_ONBOARDING_CANDIDATE'
  });
 }
 return Object.freeze({version:'VISUAL_ID_APPROVED_STATIC_SCENE_PRESENTER_V3',states:STATES,present,promoteComposable,
  automaticArtGeneration:false,rootRegistryActivation:false,readyHideImport:false});
});
