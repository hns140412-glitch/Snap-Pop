(() => {
  "use strict";

  const VERSION="2026.09.21-a";
  const CONTRACT="TAKY_BADGE_EXPERIENCE_EVENT_V1";
  const ALLOWED_APPS=new Set(["SNAP_POP","READY_SET","HIDE_SEEK","EXTERNAL_APP"]);

  function clean(value,max=160){
    return typeof value==="string"?value.trim().slice(0,max):"";
  }

  function normalize(event={}){
    const appId=clean(event.app_id||event.appId,80).toUpperCase();
    const eventFamily=clean(event.event_family||event.eventFamily,80).toUpperCase();
    const eventId=clean(event.event_id||event.eventId,160);
    if(!eventId) throw new Error("BADGE_SHARED_EVENT_ID_REQUIRED");
    if(!eventFamily) throw new Error("BADGE_SHARED_EVENT_FAMILY_REQUIRED");
    if(!ALLOWED_APPS.has(appId)) throw new Error("BADGE_SHARED_APP_ID_INVALID");

    const provenance=event.provenance&&typeof event.provenance==="object"
      ? {
          source_event_id:clean(event.provenance.source_event_id||event.provenance.sourceEventId,160)||null,
          source_contract:clean(event.provenance.source_contract||event.provenance.sourceContract,120)||null,
          source_ref:clean(event.provenance.source_ref||event.provenance.sourceRef,240)||null
        }
      : {source_event_id:null,source_contract:null,source_ref:null};

    return Object.freeze({
      contract_version:CONTRACT,
      event_id:eventId,
      app_id:appId,
      event_family:eventFamily,
      occurred_at:clean(event.occurred_at||event.occurredAt,80)||new Date().toISOString(),
      provenance,
      payload:event.payload&&typeof event.payload==="object"&&!Array.isArray(event.payload)?event.payload:{},
      identity_scope:"APP_OWNED_NOT_SHARED",
      role_scope:"APP_OWNED_NOT_SHARED",
      permission_scope:"APP_OWNED_NOT_SHARED",
      badge_award_authorized:false,
      economy_mutation_authorized:false
    });
  }

  function fromSnapObservation(observation={}){
    if(observation?.contract_version!=="SNAP_POP_BADGE_BEHAVIOR_OBSERVATION_V1"){
      throw new Error("BADGE_SHARED_SOURCE_CONTRACT_INVALID");
    }
    return normalize({
      event_id:observation.eventId,
      app_id:"SNAP_POP",
      event_family:observation.family,
      occurred_at:observation.at,
      provenance:{
        source_event_id:observation.eventId,
        source_contract:observation.contract_version
      },
      payload:observation.payload||{}
    });
  }

  window.TakyBadgeExperienceContract=Object.freeze({
    version:VERSION,
    contract:CONTRACT,
    normalize,
    fromSnapObservation
  });
})();