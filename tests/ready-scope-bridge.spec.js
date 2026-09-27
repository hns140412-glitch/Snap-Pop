const {test,expect}=require('@playwright/test');
const BASE='http://127.0.0.1:4173/';
const READY='https://ready.example.test/';

function launch(fields={}){
 const p=new URLSearchParams({
  session_id:'SESSION_A',task_id:'TASK_A',lap_id:'LAP_A',goal_id:'GOAL_A',
  from_app:'ready-set',return_target:READY,child_id:'CHILD_A',
  subject:'english',concept_skill_target:'vocabulary',
  learning_target_id:'word:1',...fields
 });
 return BASE+'?'+p.toString();
}

test('Untrusted/unconfigured return target cannot restore linked session or emit scoped observation',async({page})=>{
 await page.goto(launch(),{waitUntil:'load'}); // no host-owned Ready allowlist
 const noConfig=await page.evaluate(()=>({
  status:window.SnapPopBridge.handoffStatus(),
  context:window.SnapPopBridge.context(),
  observation:window.SnapPopBridge.emitLearningOutcome({member_id:'CHILD_A',completed:true}),
  chip:!!document.querySelector('#snapBaseCampChip')
 }));
 expect(noConfig.status.ok).toBe(false);
 expect(noConfig.status.reason).toBe('UNTRUSTED_READY_TARGET');
 expect(noConfig.context.session_id).toBeUndefined();
 expect(noConfig.observation.reason).toBe('LINKED_RUN_REQUIRED');
 expect(noConfig.chip).toBe(false);
 await page.addInitScript(()=>{globalThis.SnapPopTrustedReadyTargets=['https://ready.example.test/'];});
 await page.goto(launch({return_target:'https://evil.example.test/'}),{waitUntil:'load'});
 const untrusted=await page.evaluate(()=>({
  status:window.SnapPopBridge.handoffStatus(),
  context:window.SnapPopBridge.context(),
  query:location.search
 }));
 expect(untrusted.status.reason).toBe('UNTRUSTED_READY_TARGET');
 expect(untrusted.context.session_id).toBeUndefined();
 expect(untrusted.context.return_target).toBeUndefined();
 expect(untrusted.query).not.toContain('return_target');
});

test('Linked Snap observation and human review stay bound to selected child, subject, skill and target',async({page})=>{
 await page.addInitScript(()=>{globalThis.SnapPopTrustedReadyTargets=['https://ready.example.test/'];});
 await page.goto(launch(),{waitUntil:'load'});
 const proof=await page.evaluate(()=>{
  const b=window.SnapPopBridge;
  const outbox=()=>JSON.parse(sessionStorage.getItem('snap_pop_shared_outbox_v1')||'[]');
  const before=outbox().length;
  const mismatch=b.emitLearningOutcome({member_id:'CHILD_B',completed:true});
  const wrongSubject=b.emitLearningOutcome({subject:'math',completed:true});
  const wrongSkill=b.emitLearningOutcome({skill_id:'writing',completed:true});
  const wrongTarget=b.emitLearningOutcome({learning_target_id:'word:2',completed:true});
  const wrongReview=b.requestRubricReview({
   event_id:'production-1',member_id:'CHILD_B',rubric_ref:'rubric:1',reviewer_role:'PARENT'
  });
  const noFalseEvents=outbox().length===before;
  const good=b.emitLearningOutcome({member_id:'CHILD_A',subject:'ENGLISH',
    concept_skill_target:'vocabulary',learning_target_id:'word:1',
    completed:true,source_refs:['src-1'],provenance:['child-authored']});
  const review=b.requestRubricReview({event_id:good.event_id,
   rubric_ref:'rubric:1',reviewer_role:'PARENT'});
  return {status:b.handoffStatus(),mismatch:mismatch.reason,
   wrongSubject:wrongSubject.reason,wrongSkill:wrongSkill.reason,
   wrongTarget:wrongTarget.reason,wrongReview:wrongReview.reason,
   noFalseEvents,good:good.payload,review:review.review_request};
 });
 expect(proof.status.linked_context_valid).toBe(true);
 expect(proof.status.authenticated).toBe(false);
 expect(proof.mismatch).toBe('BOUND_CHILD_ID_MISMATCH');
 expect(proof.wrongSubject).toBe('BOUND_SUBJECT_MISMATCH');
 expect(proof.wrongSkill).toBe('BOUND_CONCEPT_SKILL_TARGET_MISMATCH');
 expect(proof.wrongTarget).toBe('BOUND_LEARNING_TARGET_ID_MISMATCH');
 expect(proof.wrongReview).toBe('BOUND_CHILD_ID_MISMATCH');
 expect(proof.noFalseEvents).toBe(true);
 expect(proof.good.member_id).toBe('CHILD_A');
 expect(proof.good.learning_target_id).toBe('word:1');
 expect(proof.good.contextual_evidence_only).toBe(true);
 expect(proof.good.global_mastery_claim).toBe(false);
 expect(proof.review.member_id).toBe('CHILD_A');
 expect(proof.review.auto_verification).toBe(false);
});

test('New Ready run with omitted scope must not inherit prior child from same browser tab',async({page})=>{
 await page.addInitScript(()=>{globalThis.SnapPopTrustedReadyTargets=['https://ready.example.test/'];});
 await page.goto(launch(),{waitUntil:'load'});
 await expect.poll(()=>page.evaluate(()=>window.SnapPopBridge.context().child_id)).toBe('CHILD_A');
 await page.goto(launch({session_id:'SESSION_B',task_id:'TASK_B',lap_id:'LAP_B',
   child_id:'',subject:'',concept_skill_target:'',learning_target_id:''}),{waitUntil:'load'});
 const result=await page.evaluate(()=>({
  context:window.SnapPopBridge.context(),
  attempted:window.SnapPopBridge.emitLearningOutcome({member_id:'CHILD_A',completed:true})
 }));
 expect(result.context.session_id).toBe('SESSION_B');
 expect(result.context.task_id).toBe('TASK_B');
 expect(result.context.child_id).toBeUndefined();
 expect(result.context.subject).toBeUndefined();
 expect(result.context.learning_target_id).toBeUndefined();
 expect(result.attempted.reason).toBe('BOUND_CHILD_ID_MISSING');
 await page.goto(BASE+'?word=standalone',{waitUntil:'load'});
 const standalone=await page.evaluate(()=>window.SnapPopBridge.context());
 expect(standalone.word).toBe('standalone');
 expect(standalone.session_id).toBeUndefined();
 expect(standalone.return_target).toBeUndefined();
});
