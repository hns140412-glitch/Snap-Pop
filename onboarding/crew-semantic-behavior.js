(function(root,factory){
'use strict';const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;
if(root)root.CrewSemanticBehavior=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const ROLES=Object.freeze(['MAIN','GUEST','AMBIENT','CHAPTER_OWNER','ACTING_CREW']);
const STATES=Object.freeze(['AMBIENT','OBSERVE','THINK','LISTEN','GUIDE','REACTION','COMPLETE','PEEK','HIDE']);
const MODES=Object.freeze(['SILENT','TEXT','VOICE','TEXT_AND_VOICE']);
const AMBIENT=Object.freeze(['READ_BOOK','READ_MAP','WRITE_NOTE','CHECK_COMPASS','ORGANIZE_BAG','USE_MAGNIFIER','USE_RADIO','REST']);
const ALLOWED=new Set(['character_id','role','relation_state','behavior_state','interaction_mode','ambient_action','dialogue_intent','hint_level','target','gesture_intent','equipment_intent','enter_style','exit_style','priority','duration','cooldown_after']);
function command(input={}){
  const out={character_id:input.character_id,role:input.role,relation_state:input.relation_state,behavior_state:input.behavior_state,interaction_mode:input.interaction_mode};
  for(const k of ['ambient_action','dialogue_intent','hint_level','target','gesture_intent','equipment_intent','enter_style','exit_style','priority','duration','cooldown_after']){
    if(input[k]!==undefined)out[k]=input[k];
  }
  if(typeof out.character_id!=='string'||!out.character_id)return null;
  if(!ROLES.includes(out.role)||typeof out.relation_state!=='string'||!out.relation_state||!STATES.includes(out.behavior_state)||!MODES.includes(out.interaction_mode))return null;
  if(out.behavior_state==='AMBIENT'){
    if(!AMBIENT.includes(out.ambient_action))return null;
  }else if(out.ambient_action!==undefined)return null;
  if(Object.keys(input).some(k=>!ALLOWED.has(k)))return null;
  if(['asset_path','png','src','source_sha','visual_id'].some(k=>k in input))return null;
  return Object.freeze(out);
}
function ambient({character_id,relation_state='KNOWN',ambient_action='REST',role='AMBIENT',interaction_mode='SILENT'}={}){
  return command({character_id,role,relation_state,behavior_state:'AMBIENT',interaction_mode,ambient_action});
}
return Object.freeze({version:'CREW_SEMANTIC_BEHAVIOR_V1',roles:ROLES,states:STATES,modes:MODES,ambientActions:AMBIENT,command,ambient,assetSelection:false,imageGeneration:false});
});