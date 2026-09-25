'use strict';
const assert=require('node:assert/strict');
const R=require('../snap-rubric-verifier.js');

const req=R.createReviewRequest({
  event_id:'s1',
  member_id:'A',
  subject:'영어',
  concept_skill_target:'sentence_production',
  rubric_ref:'rubric:snap-writing-v1',
  reviewer_role:'TEACHER',
  production_summary:{child_authored:true}
});
assert.equal(req.ok,true);
assert.equal(req.review_request.auto_verification,false);
assert.equal(req.review_request.verifier_type,'HUMAN_RUBRIC_BINARY');

const input=R.toVerificationInput(req.review_request,1,'vr-s1','2026-09-25T10:00:00.000Z');
assert.equal(input.ok,true);
assert.equal(input.verification_input.outcome,1);
assert.equal(input.verification_input.reviewer_role,'TEACHER');

const auto=R.createReviewRequest({
  event_id:'s2',
  member_id:'A',
  subject:'영어',
  concept_skill_target:'sentence_production',
  rubric_ref:'rubric:snap-writing-v1',
  reviewer_role:'CHILD'
});
assert.equal(auto.ok,false);
assert.equal(auto.issues.includes('REVIEWER_ROLE_INVALID'),true);

const badOutcome=R.toVerificationInput(req.review_request,2,'vr-s1','2026-09-25T10:00:00.000Z');
assert.equal(badOutcome.ok,false);

console.log('SNAP_RUBRIC_VERIFIER_PASS');
