'use strict';

const VERSION='SNAP_LEARNING_DATA_POLICY_ADAPTER_V1';

function apply({decision,truthVerified=false,childAuthored=false,evidence=null}={}){
  if(!decision||typeof decision!=='object') throw new Error('POLICY_DECISION_REQUIRED');
  if(!decision.policy_version||!decision.function_id) throw new Error('POLICY_IDENTITY_REQUIRED');
  if(decision.consumer_app&&decision.consumer_app!=='SNAP_POP') throw new Error('POLICY_CONSUMER_MISMATCH');
  if(decision.decision==='DENY') throw new Error(decision.reason||'POLICY_DENIED');
  if(!['ALLOW','ALLOW_CONDITIONAL'].includes(decision.decision)) throw new Error('POLICY_DECISION_INVALID');
  if(!truthVerified) throw new Error('SNAP_TRUTH_GUARD_REQUIRED');
  if(!childAuthored) throw new Error('SNAP_CHILD_AUTHORSHIP_REQUIRED');
  return Object.freeze({
    authority:'SNAP_POLICY_CONSUMER_ONLY',
    child_authored:true,
    truth_verified:true,
    policy:Object.freeze({
      policy_version:decision.policy_version,
      policy_id:decision.policy_id||null,
      function_id:decision.function_id,
      authorization_class:decision.authorization_class||null,
      decision:decision.decision,
      cannot_claim:Object.freeze(Array.isArray(decision.cannot_claim)?[...decision.cannot_claim]:[])
    }),
    evidence:evidence||null
  });
}

module.exports=Object.freeze({version:VERSION,apply});
