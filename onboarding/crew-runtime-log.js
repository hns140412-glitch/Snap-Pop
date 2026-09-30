(function(root,factory){
'use strict';const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;
if(root)root.CrewRuntimeLog=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const VERSION='CREW_RUNTIME_TRACE_V1';
const CONTRACT_VERSION='CREW_PIPELINE_V1';
const MANIFEST_VERSION='CREW_COMPOSABLE_MANIFEST_V1';
function clone(v){return v==null?v:JSON.parse(JSON.stringify(v));}
function verdicts({command,assetPlan,renderPlan}={}){
  return Object.freeze({
    behavior_gate:!!command,
    asset_gate:!!assetPlan&&assetPlan.generated===false,
    integration_gate:!!renderPlan&&renderPlan.semantic_preserved===true&&renderPlan.relation_mutation===false&&renderPlan.affinity_mutation===false
  });
}
function record({command,assetPlan,renderPlan,fallback_reason=null}={}){
  if(!command)return null;
  const gates=verdicts({command,assetPlan,renderPlan});
  const trace={
    schema:VERSION,
    contract_version:CONTRACT_VERSION,
    manifest_version:MANIFEST_VERSION,
    runtime_schema_version:VERSION,    semantic_action_command:clone(command),
    selected_asset_composition:assetPlan?{
      visual_id:assetPlan.visual_id,
      body:assetPlan.body?.src||null,
      face:assetPlan.face?.src||null,
      action_parts:(assetPlan.action_parts||[]).map(x=>x.src),
      equipment:(assetPlan.equipment||[]).map(x=>x.src),
      mask:assetPlan.mask?.src||null,
      depth:assetPlan.depth?.src||null,
      fallback:assetPlan.fallback===true,
      generated:assetPlan.generated===true
    }:null,
    fallback_reason:assetPlan?.fallback===true?(fallback_reason||'MISSING_OR_UNAPPROVED_REQUIRED_PART'):null,
    renderer_result:renderPlan?{
      character_id:renderPlan.character_id,
      assets:[...(renderPlan.assets||[])],
      fallback:renderPlan.fallback===true,
      semantic_preserved:renderPlan.semantic_preserved===true
    }:null,
    gate_verdicts:gates,
    invariants:{
      relation_state_after:command.relation_state,
      relation_mutated:false,
      affinity_mutated:false
    }
  };  return Object.freeze(trace);
}
return Object.freeze({
  version:VERSION,
  contractVersion:CONTRACT_VERSION,
  manifestVersion:MANIFEST_VERSION,
  verdicts,
  record
});
});