(function(root,factory){
 'use strict';
 const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root)root.CompanionCrewVisualPresenter=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const VERSION='CANONICAL_RENDER_PLAN_COMPATIBILITY_CONSUMER_V2';
 const STATES=Object.freeze(['WAIT_CHILD','SHORT_REACTION','ONE_REQUESTED_HINT']);
 const safePath=src=>typeof src==='string'&&src.startsWith('characters/')&&src.endsWith('.png')&&!src.split('/').some(p=>!p||p==='.'||p==='..'||p.includes('\\')||p.includes(':'));
 function present({renderPlan,interactionState='WAIT_CHILD',runtimeDecision=null}={}){
  if(!STATES.includes(interactionState)||!renderPlan||renderPlan.kind!=='STATIC_APPROVED_COMPAT')return null;
  if(runtimeDecision!==null&&(runtimeDecision?.ok!==true||typeof runtimeDecision.scene_slot!=='string'||!runtimeDecision.scene_slot))return null;
  const id=renderPlan.character_id,src=renderPlan.asset,sha=renderPlan.asset_sha;
  if(typeof id!=='string'||!id||!safePath(src)||typeof sha!=='string'||!/^[a-f0-9]{64}$/i.test(sha)||
    renderPlan.semantic_preserved!==true||renderPlan.relation_mutation!==false||renderPlan.affinity_mutation!==false)return null;
  return Object.freeze({id,src,assetSha:sha,interactionState,
   assetStatus:'CANONICAL_STATIC_RENDER_PLAN',scene:'ISOLATED_HOME_RADIO',
   sceneSlot:runtimeDecision?.scene_slot||null,dialogueIntent:runtimeDecision?.dialogue_intent||null,
   interruptibility:runtimeDecision?.interruptibility||null,runtimePolicyVersion:runtimeDecision?'CREW_RUNTIME_POLICY_V1':null,
   frameReady:false,independentReactionArtReady:false,motionReady:false,
   rootRegistryActivation:false,renderOwnership:'CANONICAL_UI_RENDER_PLAN'});
 }
 return Object.freeze({version:VERSION,states:STATES,present,
  behaviorOwner:false,assetResolver:false,semanticOwner:false,
  automaticArtGeneration:false,rootRegistryActivation:false,readyHideImport:false});
});
