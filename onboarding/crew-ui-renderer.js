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
return Object.freeze({version:'CREW_UI_RENDERER_PLAN_V1',renderPlan});
});