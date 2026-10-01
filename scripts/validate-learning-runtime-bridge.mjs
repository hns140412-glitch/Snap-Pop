import fs from 'node:fs';
const s=fs.readFileSync('snap-bridge.js','utf8');
const required=[
  'expression_reuse:',
  'story_structure:',
  'reasoning_evidence:',
  'expression_expansion:',
  'vocabulary_used:',
  'production_texts:',
  "'child_id','subject','concept_skill_target','learning_target_id'",
  'function emitLearningOutcome',
  'function requestLearningGrowthDecision',
  "'LEARNING_ENGINE_GROWTH_INTENT_ONLY'",
  'function growthPrompt',
  "'PENDING_DIMENSION_REVIEW'",
  "'GROWTH_REVIEW_REQUIRED'",
  'child_completion_is_not_growth_verification',
  'growth_signals:',
  'evidence_source_refs',
  'evidence_provenance',
  'contextual_evidence_only: true',
  'global_mastery_claim: false',
  'emitLearningOutcome,'
];
for(const token of required){if(!s.includes(token))throw new Error('MISSING:'+token);}
console.log('SNAP_LEARNING_RUNTIME_BRIDGE_PASS');