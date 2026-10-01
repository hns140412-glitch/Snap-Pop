(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root)root.SnapRubricVerifier=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

const clean=v=>String(v??'').trim();
const GROWTH_DIMENSIONS=new Set(['VOCABULARY','GRAMMAR','EXPRESSION','THINKING','ENGLISH_THINKING']);
const GROWTH_OUTCOMES=new Set(['SUCCESS','PARTIAL','FAIL']);

function normalizeDimensions(rows=[]){
  if(!Array.isArray(rows))return [];
  return rows.slice(0,10).map(raw=>{
    const x=raw&&typeof raw==='object'?raw:{};
    const dimension=clean(x.dimension).toUpperCase();
    const outcome=clean(x.outcome).toUpperCase();
    const depth=Number.isFinite(Number(x.depth))?Math.max(0,Math.min(5,Number(x.depth))):null;
    if(!GROWTH_DIMENSIONS.has(dimension)||!GROWTH_OUTCOMES.has(outcome))return null;
    return {
      dimension,outcome,
      assisted:x.assisted===true,
      transfer:x.transfer===true,
      direct_english:x.direct_english===true?true:x.direct_english===false?false:null,
      depth,
      target_id:clean(x.target_id)||null,
      note:clean(x.note)||null
    };
  }).filter(Boolean);
}

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


function createGrowthReviewRequest({
  event_id,
  member_id,
  subject,
  concept_skill_target,
  rubric_ref,
  reviewer_role,
  rubric_version='SNAP_GROWTH_RUBRIC_V1',
  dimensions=['GRAMMAR','EXPRESSION','THINKING','ENGLISH_THINKING'],
  production_summary=null
}={}){
  const issues=[];
  for(const [k,v] of Object.entries({event_id,member_id,subject,concept_skill_target,rubric_ref,reviewer_role})){
    if(!clean(v))issues.push('MISSING_'+k.toUpperCase());
  }
  if(!['PARENT','TEACHER','QUALIFIED_REVIEWER'].includes(clean(reviewer_role)))
    issues.push('REVIEWER_ROLE_INVALID');
  const requested=[...new Set((Array.isArray(dimensions)?dimensions:[])
    .map(x=>clean(x).toUpperCase()).filter(x=>GROWTH_DIMENSIONS.has(x)))];
  if(!requested.length)issues.push('GROWTH_DIMENSIONS_REQUIRED');
  if(issues.length)return {ok:false,reason:'GROWTH_RUBRIC_REVIEW_REQUEST_INVALID',issues};

  return {
    ok:true,
    review_request:{
      authority:'SNAP_HUMAN_GROWTH_RUBRIC_REVIEW_REQUEST',
      target_event_id:clean(event_id),
      member_id:clean(member_id),
      subject:clean(subject).toLowerCase(),
      concept_skill_target:clean(concept_skill_target).toLowerCase(),
      verifier_type:'HUMAN_GROWTH_RUBRIC',
      verifier_version:clean(rubric_version),
      reference_id:clean(rubric_ref),
      reviewer_role:clean(reviewer_role),
      requested_dimensions:requested,
      auto_verification:false,
      global_correctness_claim:false,
      production_summary:production_summary||null
    }
  };
}

function toGrowthVerificationInput(review_request={},dimension_results=[],receipt_id,verified_at){
  if(review_request?.authority!=='SNAP_HUMAN_GROWTH_RUBRIC_REVIEW_REQUEST')
    return {ok:false,reason:'GROWTH_REVIEW_REQUEST_AUTHORITY_INVALID'};
  if(!clean(receipt_id)||!clean(verified_at))
    return {ok:false,reason:'RECEIPT_METADATA_REQUIRED'};
  const normalized=normalizeDimensions(dimension_results);
  const requested=new Set(review_request.requested_dimensions||[]);
  if(!normalized.length||normalized.length!==dimension_results.length)
    return {ok:false,reason:'GROWTH_DIMENSION_RESULTS_INVALID'};
  if(normalized.some(x=>!requested.has(x.dimension)))
    return {ok:false,reason:'UNREQUESTED_GROWTH_DIMENSION'};
  return {
    ok:true,
    verification_input:{
      receipt_id:clean(receipt_id),
      target_event_id:clean(review_request.target_event_id),
      verified_at:clean(verified_at),
      verifier_type:'HUMAN_GROWTH_RUBRIC',
      verifier_version:clean(review_request.verifier_version),
      outcome:null,
      member_id:clean(review_request.member_id),
      subject:clean(review_request.subject),
      concept_skill_target:clean(review_request.concept_skill_target),
      reference_id:clean(review_request.reference_id),
      reviewer_role:clean(review_request.reviewer_role),
      growth_dimensions:normalized
    }
  };
}

  return Object.freeze({createReviewRequest,toVerificationInput,createGrowthReviewRequest,toGrowthVerificationInput});
});