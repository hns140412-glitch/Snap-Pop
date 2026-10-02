import fs from 'node:fs';
import vm from 'node:vm';

const fail=(m)=>{throw new Error(m)};
const assert=(c,m)=>{if(!c)fail(m)};

const interaction=fs.readFileSync('interaction-support-controller.js','utf8');
const writing=fs.readFileSync('writing-flow-controller.js','utf8');
const sourceRuntime=fs.readFileSync('badge-source-observation-runtime.js','utf8');

assert(interaction.includes('source:"CHILD_EXPLICIT_REFLECTION"'),'missing explicit child reflection artifact');
assert(interaction.includes('badgeEvidence.deepThinkingRefs'),'reflection is not bound into active badge evidence');
assert(interaction.includes('SNAP_POP_CHILD_REFLECTION_ARTIFACT_V1'),'missing reflection source contract');

assert(writing.includes('const deepThinkingRefs=Array.isArray(s.badgeEvidence?.deepThinkingRefs)'),'completion does not require bound reflection refs');
assert(writing.includes('if(deepThinkingRefs.length&&deps.recordBadgeSourceObservation)'),'persistence source must require explicit reflection refs');
assert(writing.includes('event_family:"DEEP_THINKING"'),'wrong event family');
assert(writing.includes('behavior_code:"DEEP_THINKING_PERSISTENCE"'),'wrong behavior code');
assert(writing.includes('source_contract_id:"SNAP_POP_REFLECTION_TO_COMPLETION_V1"'),'wrong source contract');
assert(writing.includes('reflectionArtifactRefs:deepThinkingRefs'),'completion source lacks reflection refs');
assert(writing.includes('completionEventId'),'completion source lacks completion evidence');
assert(writing.includes('recordId:record.id'),'completion source lacks verified record link');

const sandbox={window:{},console,Date};
sandbox.globalThis=sandbox;
vm.runInNewContext(sourceRuntime,sandbox,{filename:'badge-source-observation-runtime.js'});
const api=sandbox.window.TakyBadgeSourceObservation;
assert(api?.contract==='TAKY_BADGE_SOURCE_OBSERVATION_V1','source observation runtime missing');
const obs=api.normalize({
  event_id:'deep-test',
  app_id:'SNAP_POP',
  event_family:'DEEP_THINKING',
  behavior_code:'DEEP_THINKING_PERSISTENCE',
  occurred_at:'2026-10-02T07:00:00.000Z',
  source_contract_id:'SNAP_POP_REFLECTION_TO_COMPLETION_V1',
  evidence_ref:'completion:test',
  explicit_child_action:true,
  payload:{
    reflectionArtifactRefs:['writingReflection:r1'],
    completionEventId:'completion_test',
    recordId:'record_test',
    landmark:'test'
  }
});
assert(obs.disposition==='OBSERVATION_ONLY','must remain observation-only');
assert(obs.badge_award_authorized===false,'must not authorize badge award');
assert(obs.economy_mutation_authorized===false,'must not authorize economy mutation');
assert(obs.catalog_activation_allowed===false,'must not activate catalog');

let weakBlocked=false;
try{
  api.normalize({
    event_id:'weak',
    app_id:'SNAP_POP',
    event_family:'DEEP_THINKING',
    behavior_code:'DEEP_THINKING_PERSISTENCE',
    source_contract_id:'SNAP_POP_REFLECTION_TO_COMPLETION_V1',
    evidence_ref:'weak',
    explicit_child_action:true,
    payload:{elapsedMs:999999}
  });
}catch{weakBlocked=true}
assert(weakBlocked,'elapsed-time weak proxy must be blocked');

console.log('SNAP_BADGE_DEEP_THINKING_PERSISTENCE_PASS');
