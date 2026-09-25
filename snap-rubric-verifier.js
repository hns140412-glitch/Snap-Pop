(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root)root.SnapRubricVerifier=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

const clean=v=>String(v??'').trim();

function createReviewRequest({
  event_id,
  member_id,
  subject,
  concept_skill_target,
  rubric_ref,
  reviewer_role,
  rubric_version='SNAP_RUBRIC_V1',
  production_summary=null
}={}){
  const issues=[];
  for(const [k,v] of Object.entries({event_id,member_id,subject,concept_skill_target,rubric_ref,reviewer_role})){
    if(!clean(v))issues.push('MISSING_'+k.toUpperCase());
  }
  if(!['PARENT','TEACHER','QUALIFIED_REVIEWER'].includes(clean(reviewer_role)))issues.push('REVIEWER_ROLE_INVALID');
  if(issues.length)return {ok:false,reason:'RUBRIC_REVIEW_REQUEST_INVALID',issues};

  return {
    ok:true,
    review_request:{
      authority:'SNAP_HUMAN_RUBRIC_REVIEW_REQUEST',
      target_event_id:clean(event_id),
      member_id:clean(member_id),
      subject:clean(subject).toLowerCase(),
      concept_skill_target:clean(concept_skill_target).toLowerCase(),
      verifier_type:'HUMAN_RUBRIC_BINARY',
      verifier_version:clean(rubric_version),
      reference_id:clean(rubric_ref),
      reviewer_role:clean(reviewer_role),
      auto_verification:false,
      production_summary:production_summary||null
    }
  };
}

function toVerificationInput(review_request={},outcome,receipt_id,verified_at){
  if(review_request?.authority!=='SNAP_HUMAN_RUBRIC_REVIEW_REQUEST')return {ok:false,reason:'REVIEW_REQUEST_AUTHORITY_INVALID'};
  if(outcome!==0&&outcome!==1)return {ok:false,reason:'OUTCOME_INVALID'};
  if(!clean(receipt_id)||!clean(verified_at))return {ok:false,reason:'RECEIPT_METADATA_REQUIRED'};
  return {
    ok:true,
    verification_input:{
      receipt_id:clean(receipt_id),
      target_event_id:clean(review_request.target_event_id),
      verified_at:clean(verified_at),
      verifier_type:'HUMAN_RUBRIC_BINARY',
      verifier_version:clean(review_request.verifier_version),
      outcome,
      member_id:clean(review_request.member_id),
      subject:clean(review_request.subject),
      concept_skill_target:clean(review_request.concept_skill_target),
      reference_id:clean(review_request.reference_id),
      reviewer_role:clean(review_request.reviewer_role)
    }
  };
}

  return Object.freeze({createReviewRequest,toVerificationInput});
});