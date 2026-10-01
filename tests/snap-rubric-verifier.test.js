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



const growthReq=R.createGrowthReviewRequest({
  event_id:'sg1',
  member_id:'A',
  subject:'영어',
  concept_skill_target:'sentence_production',
  rubric_ref:'rubric:snap-growth-v1',
  reviewer_role:'TEACHER',
  dimensions:['GRAMMAR','EXPRESSION','THINKING'],
  production_summary:{child_authored:true}
});
assert.equal(growthReq.ok,true);
assert.equal(growthReq.review_request.verifier_type,'HUMAN_GROWTH_RUBRIC');
assert.equal(growthReq.review_request.global_correctness_claim,false);
assert.deepEqual(growthReq.review_request.requested_dimensions,['GRAMMAR','EXPRESSION','THINKING']);

const growthInput=R.toGrowthVerificationInput(
  growthReq.review_request,
  [
    {dimension:'GRAMMAR',outcome:'PARTIAL',target_id:'writing:1'},
    {dimension:'EXPRESSION',outcome:'SUCCESS',transfer:true,depth:4,target_id:'writing:1'},
    {dimension:'THINKING',outcome:'SUCCESS',transfer:true,depth:4,target_id:'writing:1'}
  ],
  'vr-growth-1','2026-10-02T10:00:00.000Z'
);
assert.equal(growthInput.ok,true);
assert.equal(growthInput.verification_input.outcome,null);
assert.equal(growthInput.verification_input.verifier_type,'HUMAN_GROWTH_RUBRIC');
assert.equal(growthInput.verification_input.growth_dimensions[0].outcome,'PARTIAL');

const unrequested=R.toGrowthVerificationInput(
  growthReq.review_request,
  [{dimension:'VOCABULARY',outcome:'SUCCESS'}],
  'vr-growth-2','2026-10-02T10:00:00.000Z'
);
assert.equal(unrequested.ok,false);
assert.equal(unrequested.reason,'UNREQUESTED_GROWTH_DIMENSION');

console.log('SNAP_RUBRIC_VERIFIER_PASS');
