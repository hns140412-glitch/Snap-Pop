(() => {
"use strict";
let singleton=null;
function create(deps){
const q=deps.query,store=window.SnapPopStorage,esc=window.SnapPopUIShell.escapeHtml;
async function proposeBadgeCandidateFromObservations({id,title,families=[],reason=""}={}){
  if(!window.SnapPopBadgeCandidate) throw new Error("BADGE_CANDIDATE_RUNTIME_UNAVAILABLE");
  const observations=await store.get("badgeBehaviorObservations")||[];
  const candidate=window.SnapPopBadgeCandidate.fromObservationCluster(observations,{id,title,families,reason});
  const ledger=await store.get("badgeCandidateReviews")||[];
  const existing=ledger.find(x=>x.id===candidate.id);
  if(existing) return existing;
  ledger.unshift(candidate);
  await store.set("badgeCandidateReviews",ledger.slice(0,200));
  return candidate;
}
async function recordBadgeSourceObservation(input={}){
  if(!window.TakyBadgeSourceObservation||!window.SnapPopBadges)return null;
  try{
    const observation=window.TakyBadgeSourceObservation.normalize(input);
    const ledger=await store.get("badgeSourceObservations")||[];
    const existing=ledger.find(x=>x.event_id===observation.event_id);
    if(existing)return existing;

    await window.SnapPopBadges.load();
    const matches=window.SnapPopBadges.matchSourceObservation(observation);
    ledger.unshift(observation);

    if(!matches.length){
      await store.set("badgeSourceObservations",ledger.slice(0,1000));
      return observation;
    }

    const applied=await store.get("badgeAwardSourceEvents")||[];
    if(applied.some(x=>x.event_id===observation.event_id)){
      await store.set("badgeSourceObservations",ledger.slice(0,1000));
      return observation;
    }

    const owned=await store.get("badgeProgress")||{};
    const presentation=[];
    const badgeIds=[];
    for(const item of matches){
      const key=item.id||item.draftId;
      if(!key)continue;
      const prev=owned[key]||{count:0};
      const previousCount=Math.max(0,Number(prev.count)||0);
      const nextCount=previousCount+1;
      owned[key]={count:nextCount,...window.SnapPopBadges.nextProgress(previousCount),lastAt:observation.occurred_at};
      badgeIds.push(key);
      presentation.push({badgeId:key,previousCount,nextCount,at:observation.occurred_at});
    }
    applied.unshift({
      event_id:observation.event_id,
      occurred_at:observation.occurred_at,
      badge_ids:badgeIds,
      source_contract_id:observation.source_contract_id
    });
    await store.setMany([
      ["badgeSourceObservations",ledger.slice(0,1000)],
      ["badgeProgress",owned],
      ["badgeAwardSourceEvents",applied.slice(0,1000)]
    ]);
    if(window.SnapPopBadgeAcquisition){
      for(const entry of presentation){
        try{window.SnapPopBadgeAcquisition.present(entry)}catch{}
      }
    }
    return observation;
  }catch{return null}
}
async function recordBadgeBehaviorObservation(family,payload={},source="SNAP_POP"){
  if(!window.SnapPopBadgeBehavior)return null;
  try{
    const event=window.SnapPopBadgeBehavior.normalize({
      eventId:deps.uid("badgeobs"),
      family,
      source,
      at:new Date().toISOString(),
      payload
    });
    const ledger=await store.get("badgeBehaviorObservations")||[];
    if(ledger.some(x=>x.eventId===event.eventId))return event;
    ledger.unshift(event);
    const writes=[["badgeBehaviorObservations",ledger.slice(0,1000)]];
    const shared=window.TakyBadgeExperienceContract?.fromSnapObservation?.(event)||null;
    if(shared){
      const sharedLedger=await store.get("badgeSharedExperienceEvents")||[];
      if(!sharedLedger.some(x=>x.event_id===shared.event_id)){
        sharedLedger.unshift(shared);
        writes.push(["badgeSharedExperienceEvents",sharedLedger.slice(0,1000)]);
      }
    }
    await store.setMany(writes);
    if(payload?.badgeBehaviorCode&&payload?.sourceContractId&&payload?.evidenceRef&&payload?.explicitChildAction===true){
      await recordBadgeSourceObservation({
        event_id:event.eventId,
        app_id:"SNAP_POP",
        event_family:event.family,
        behavior_code:payload.badgeBehaviorCode,
        occurred_at:event.at,
        source_contract_id:payload.sourceContractId,
        evidence_ref:payload.evidenceRef,
        explicit_child_action:true,
        payload:{
          source:event.source,
          behaviorCode:payload.badgeBehaviorCode,
          recordId:payload.recordId||"",
          revisionId:payload.revisionId||"",
          landmark:payload.landmark||"",
          step:Number.isFinite(payload.step)?payload.step:null
        }
      });
    }
    return event;
  }catch{return null}
}
async function recordBadgeBehaviorEvidence(family,evidence={},options={}){
  if(!window.SnapPopBadgeEvidenceContract)return null;
  try{
    const verifiedEvidence=window.SnapPopBadgeEvidenceContract.verify(family,evidence,options);
    return await recordBadgeBehaviorObservation(family,{
      evidenceContract:verifiedEvidence.contract_version,
      evidenceRef:verifiedEvidence.evidenceRef,
      sourceContractId:verifiedEvidence.sourceContractId,
      explicitChildAction:true,
      inferenceAllowed:false,
      elapsedTimeEvidenceAllowed:false,
      scoreEvidenceAllowed:false,
      beforeArtifactRef:verifiedEvidence.beforeArtifactRef||"",
      afterArtifactRef:verifiedEvidence.afterArtifactRef||"",
      reflectionArtifactRef:verifiedEvidence.reflectionArtifactRef||"",
      featureContractId:verifiedEvidence.featureContractId||"",
      behaviorCode:options.behaviorCode||verifiedEvidence.behaviorCode||"",
      badgeBehaviorCode:options.behaviorCode||verifiedEvidence.behaviorCode||""
    },"SNAP_POP_EXPLICIT_EVIDENCE");
  }catch{return null}
}
async function recordBadgeEvent(family,payload={},source="SNAP_POP"){
  if(!window.SnapPopBadges)return null;
  try{
    await window.SnapPopBadges.load();
    const event=window.SnapPopBadges.normalizeEvent({eventId:deps.uid("badgeevt"),family,source,payload,at:new Date().toISOString()});
    const ledger=await store.get("badgeEvents")||[];
    if(ledger.some(x=>x.eventId===event.eventId))return event;
    ledger.unshift({...event,disposition:"LEGACY_EVENT_ONLY",badgeAwardAuthorized:false});
    await store.set("badgeEvents",ledger.slice(0,1000));
    return event;
  }catch{return null}
}
async function renderBadgePreview(){
  const host=q("#badgePreviewVisual");if(!host||!window.SnapPopBadgeVisual||!window.SnapPopBadges)return;
  const identity=await deps.resolvedIdentity(),observations=await store.get("badgeBehaviorObservations")||[];
  const progress=window.SnapPopBadges.progressFromCount(Math.max(1,observations.length));
  const themeExpression=window.SnapPopBadgeThemeExpression?.normalize({
    themeId:"EXPLORATION",
    assetState:"UNRESOLVED"
  })||null;
  const model=window.SnapPopBadgeVisual.model({
    title:"경험 배지 미리보기",
    theme:"EXPLORATION",
    themeExpression,
    tier:progress.tier||"GREEN",
    stars:progress.stars??0,
    identity
  });
  const slots=window.SnapPopBadgeVisual.starSlots(model.stars);
  host.innerHTML=`<div class="badgeMedallion" data-tier="${esc(model.tier)}">
    <div class="badgeGemArc">${slots.map(x=>`<i class="${x.active?"on":""}" aria-hidden="true"></i>`).join("")}</div>
    <div class="badgeIdentity">${model.identity.photo?`<img src="${esc(model.identity.photo)}" alt="">`:`<span>${esc(model.identity.name.slice(0,4))}</span>`}</div>
  </div>
  <div class="badgePreviewMeta"><b>${esc(model.title)}</b><span>${esc(model.tier)} · 별 ${model.stars}/5 · 획득/수여 아님</span><span>${model.themeExpression?.assetState==="UNRESOLVED"?"테마 표현 자산 검토 전":"검토된 테마 표현 자산"}</span></div>`;
}
return Object.freeze({contract:"SNAP_POP_BADGE_CONTROLLER_V3_SOURCE_ONLY_AWARD",proposeBadgeCandidateFromObservations,recordBadgeSourceObservation,recordBadgeBehaviorObservation,recordBadgeBehaviorEvidence,recordBadgeEvent,renderBadgePreview});
}
window.SnapPopBadgeController=Object.freeze({instance(deps){if(!singleton)singleton=create(deps);return singleton}});
})();
