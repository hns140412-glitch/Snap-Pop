import fs from 'node:fs';
const s=fs.readFileSync('snap-bridge.js','utf8');
const required=[
  "'child_id','subject','concept_skill_target','learning_target_id'",
  'function emitLearningOutcome',
  'evidence_source_refs',
  'evidence_provenance',
  'contextual_evidence_only: true',
  'global_mastery_claim: false',
  'emitLearningOutcome,'
];
for(const token of required){if(!s.includes(token))throw new Error('MISSING:'+token);}
console.log('SNAP_LEARNING_RUNTIME_BRIDGE_PASS');