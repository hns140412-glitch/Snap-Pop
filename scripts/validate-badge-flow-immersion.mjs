import fs from 'node:fs';
import vm from 'node:vm';

const fail=(m)=>{throw new Error(m)};
const assert=(c,m)=>{if(!c)fail(m)};

const writing=fs.readFileSync('writing-flow-controller.js','utf8');
const sourceRuntime=fs.readFileSync('badge-source-observation-runtime.js','utf8');

assert(writing.includes('flowContinueRefs'),'flow continuation action refs are not persisted');
assert(writing.includes('snap-writing-flow-continue:'),'missing explicit writing continue action identity');
assert(writing.includes('if(flowContinueRefs.length&&deps.recordBadgeSourceObservation)'),'flow immersion must require explicit continue evidence');
assert(writing.includes('event_family:"FOCUS"'),'wrong event family');
assert(writing.includes('behavior_code:"FLOW_IMMERSION"'),'wrong behavior code');
assert(writing.includes('source_contract_id:"SNAP_POP_CHILD_FLOW_IMMERSION_V1"'),'wrong source contract');
assert(writing.includes('flowContinueActionRefs:flowContinueRefs'),'completion source lacks explicit continue refs');
assert(writing.includes('completionEventId'),'completion source lacks completion evidence');
assert(writing.includes('recordId:record.id'),'completion source lacks verified record link');

const sandbox={window:{},console,Date};
sandbox.globalThis=sandbox;
vm.runInNewContext(sourceRuntime,sandbox,{filename:'badge-source-observation-runtime.js'});
const api=sandbox.window.TakyBadgeSourceObservation;
assert(api?.contract==='TAKY_BADGE_SOURCE_OBSERVATION_V1','source observation runtime missing');
const obs=api.normalize({
  event_id:'flow-test',
  app_id:'SNAP_POP',
  event_family:'FOCUS',
  behavior_code:'FLOW_IMMERSION',
  occurred_at:'2026-10-02T09:00:00.000Z',
  source_contract_id:'SNAP_POP_CHILD_FLOW_IMMERSION_V1',
  evidence_ref:'completion:test',
  explicit_child_action:true,
  payload:{
    flowContinueActionRefs:['snap-writing-flow-continue:explore1:0:1'],
    completionEventId:'completion_test',
    recordId:'record_test',
    landmark:'test'
  }
});
assert(obs.disposition==='OBSERVATION_ONLY','must remain observation-only');
assert(obs.badge_award_authorized===false,'must not authorize badge award');
assert(obs.economy_mutation_authorized===false,'must not authorize economy mutation');
assert(obs.catalog_activation_allowed===false,'must not activate catalog');

for(const weakPayload of [{elapsedMs:999999},{silenceMs:999999}]){
  let weakBlocked=false;
  try{
    api.normalize({
      event_id:'weak-'+Object.keys(weakPayload)[0],
      app_id:'SNAP_POP',
      event_family:'FOCUS',
      behavior_code:'FLOW_IMMERSION',
      source_contract_id:'SNAP_POP_CHILD_FLOW_IMMERSION_V1',
      evidence_ref:'weak',
      explicit_child_action:true,
      payload:weakPayload
    });
  }catch{weakBlocked=true}
  assert(weakBlocked,'time/silence weak proxy must be blocked');
}

console.log('SNAP_BADGE_FLOW_IMMERSION_PASS');
