(() => {
  "use strict";

  const VERSION="2026.09.21-a";
  const CONTRACT="SNAP_POP_BADGE_CANDIDATE_V1";

  function clean(value,max=160){
    return typeof value==="string"?value.trim().slice(0,max):"";
  }

  function normalizeFamilies(families=[]){
    return [...new Set((Array.isArray(families)?families:[])
      .map(x=>clean(x,80).toUpperCase())
      .filter(Boolean))].slice(0,8);
  }

  function propose({id="",title="",families=[],evidenceEventIds=[],reason=""}={}){
    const candidateId=clean(id,120);
    const candidateTitle=clean(title,80);
    const normalizedFamilies=normalizeFamilies(families);
    const evidence=[...new Set((Array.isArray(evidenceEventIds)?evidenceEventIds:[])
      .map(x=>clean(x,160)).filter(Boolean))].slice(0,50);

    if(!candidateId) throw new Error("BADGE_CANDIDATE_ID_REQUIRED");
    if(!candidateTitle) throw new Error("BADGE_CANDIDATE_TITLE_REQUIRED");
    if(!normalizedFamilies.length) throw new Error("BADGE_CANDIDATE_FAMILY_REQUIRED");
    if(!evidence.length) throw new Error("BADGE_CANDIDATE_EVIDENCE_REQUIRED");

    return Object.freeze({
      contract_version:CONTRACT,
      id:candidateId,
      title:candidateTitle,
      families:Object.freeze(normalizedFamilies),
      evidenceEventIds:Object.freeze(evidence),
      reason:clean(reason,240)||null,
      status:"REVIEW_REQUIRED",
      active:false,
      awardAuthorized:false,
      autoCatalogInsertAllowed:false,
      autoTriggerActivationAllowed:false,
      createdAt:new Date().toISOString()
    });
  }

  function fromObservationCluster(observations=[],{
    id,
    title,
    families,
    reason
  }={}){
    const list=Array.isArray(observations)?observations:[];
    const selectedFamilies=normalizeFamilies(families);
    const evidence=list
      .filter(x=>x&&selectedFamilies.includes(String(x.family||"").toUpperCase()))
      .map(x=>x.eventId)
      .filter(Boolean);
    return propose({id,title,families:selectedFamilies,evidenceEventIds:evidence,reason});
  }

  window.SnapPopBadgeCandidate=Object.freeze({
    version:VERSION,
    contract:CONTRACT,
    propose,
    fromObservationCluster
  });
})();