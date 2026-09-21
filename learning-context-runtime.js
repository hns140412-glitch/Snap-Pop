(() => {
  "use strict";

  function context(){
    try{
      const ready=window.SnapPopBridge?.learningContext?.();
      if(!ready) return null;
      return Object.freeze({
        source:"READY_SET_LEARNING_MASTER",
        contract_version:ready.contract_version,
        learning_unit_id:ready.learning_unit_id,
        analysis_id:ready.analysis_id,
        assignment_id:ready.assignment_id,
        subject:ready.subject,
        concept_skill_target:ready.concept_skill_target,
        activity_types:[...(ready.activity_types||[])],
        cognitive_load_profile:[...(ready.cognitive_load_profile||[])],
        confidence:ready.confidence,
        unresolved_flags:[...(ready.unresolved_flags||[])],
      });
    }catch{return null}
  }

  window.SnapPopLearningContextProvider=Object.freeze({
    version:"2026.09.21-a",
    context
  });
})();