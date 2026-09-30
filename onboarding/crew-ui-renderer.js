(function(root,factory){
'use strict';const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;
if(root)root.CrewUIRenderer=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
function renderPlan(command,assets){
 if(!command||!assets||assets.visual_id!==command.character_id||assets.generated!==false)return null;
 const all=[assets.body,assets.face,assets.depth,...(assets.action_parts||[]),...(assets.equipment||[])].filter(Boolean);
 if(all.some(x=>x.approved!==true||typeof x.src!=='string'))return null;
 return Object.freeze({
   character_id:command.character_id,role:command.role,relation_state:command.relation_state,
   behavior_state:command.behavior_state,interaction_mode:command.interaction_mode,
   ambient_action:command.ambient_action||null,assets:Object.freeze(all.map(x=>x.src)),
   fallback:assets.fallback===true,semantic_preserved:true,relation_mutation:false,affinity_mutation:false
 });
}
const MOTION_SCHEMA='CREW_MOTION_SPEC_V1';
const ENTER=new Set(['NONE','FADE','FADE_SLIDE','SCALE_IN']);
const EXIT=new Set(['NONE','FADE','FADE_SLIDE','SCALE_OUT']);
function finiteInt(v,min,max){return Number.isInteger(v)&&v>=min&&v<=max}
function motionPlan(actionPresentation,spec,{prefersReducedMotion=false}={}){
 if(!actionPresentation||actionPresentation.assetStatus!=='COMPOSABLE_ACTION_APPROVED'||actionPresentation.actionReady!==true||actionPresentation.generated!==false)return null;
 if(!spec||spec.schema!==MOTION_SCHEMA||spec.approved!==true||typeof spec.approval_ref!=='string'||!spec.approval_ref)return null;
 if(spec.visual_id!==actionPresentation.id||spec.ambient_action!==actionPresentation.ambientAction)return null;
 const anchors=spec.anchors;
 if(!anchors||typeof anchors.body!=='string'||!anchors.body||typeof anchors.action_part!=='string'||!anchors.action_part||typeof anchors.equipment!=='string'||!anchors.equipment)return null;
 const t=spec.transition;
 if(!t||!ENTER.has(t.enter)||!EXIT.has(t.exit)||!finiteInt(t.enter_ms,0,800)||!finiteInt(t.exit_ms,0,800))return null;
 const timing=spec.timing;
 if(!timing||!finiteInt(timing.action_ms,250,10000)||!finiteInt(timing.hold_ms,0,10000)||!finiteInt(timing.cooldown_ms,0,30000))return null;
 const reduced=spec.reduced_motion;
 if(!reduced||reduced.mode!=='STATIC_COMPOSABLE'||reduced.preserves_information!==true)return null;
 return Object.freeze({
   schema:'CREW_MOTION_RENDER_PLAN_V1',
   character_id:actionPresentation.id,
   ambient_action:actionPresentation.ambientAction,
   scene_slot:actionPresentation.sceneSlot,
   assets:actionPresentation.assets,
   anchors:Object.freeze({...anchors}),
   transition:Object.freeze({...t}),
   timing:Object.freeze({...timing}),
   prefers_reduced_motion:prefersReducedMotion===true,
   motion_active:prefersReducedMotion!==true,
   reduced_motion_mode:prefersReducedMotion===true?'STATIC_COMPOSABLE':null,
   motionReady:true,
   semantic_preserved:true,
   relation_mutation:false,
   affinity_mutation:false
 });
}
return Object.freeze({version:'CREW_UI_RENDERER_PLAN_V2',motionSchema:MOTION_SCHEMA,renderPlan,motionPlan});
});