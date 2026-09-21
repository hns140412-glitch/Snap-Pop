import fs from 'node:fs';

function assert(name, condition){
  if(!condition) throw new Error('FAIL '+name);
  console.log('PASS '+name);
}

const bridge=fs.readFileSync('snap-bridge.js','utf8');
const provider=fs.readFileSync('learning-context-runtime.js','utf8');

for(const field of [
  'learning_unit_id','analysis_id','assignment_id','subject','concept_skill_target',
  'activity_types','cognitive_load_profile','confidence','unresolved_flags'
]){
  assert('context-field-'+field, bridge.includes(field) && provider.includes(field));
}
assert('ready-context-version', bridge.includes("value.contract_version!=='READY_LEARNING_CONTEXT_V1'"));
assert('context-fail-closed', bridge.includes("if (!raw || typeof raw !== 'string' || raw.length > 6000) return null"));
assert('no-role-authority-transfer', !bridge.includes('value.role') && !bridge.includes('value.permission'));
assert('no-planner-authority-transfer', !bridge.includes('value.plannerAuthority') && !bridge.includes('value.allocationAuthority'));
assert('specialist-return-preserves-session-id', bridge.includes("url.searchParams.set('session_id', context.session_id)"));
assert('specialist-return-preserves-goal-id', bridge.includes("url.searchParams.set('goal_id', context.goal_id)"));
assert('specialist-return-preserves-task-id', bridge.includes("url.searchParams.set('task_id', context.task_id)"));
assert('specialist-return-preserves-lap-id', bridge.includes("url.searchParams.set('lap_id', context.lap_id)"));
assert('specialist-does-not-end-ready-session', !bridge.includes('SESSION_END') && !bridge.includes('SESSION_ENDED'));

console.log('SNAP_LEARNING_APP_FAMILY_CONTEXT_ALIGNMENT_PASS');
