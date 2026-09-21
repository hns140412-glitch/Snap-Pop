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
      behaviorCode:verifiedEvidence.behaviorCode||""
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
    ledger.unshift(event);
    await store.set("badgeEvents",ledger.slice(0,1000));
    const matches=window.SnapPopBadges.matchEvent(event);
    if(matches.length){
      const owned=await store.get("badgeProgress")||{};
      for(const item of matches){
        const key=item.id||item.draftId;
        const prev=owned[key]||{count:0};
        owned[key]={count:(prev.count||0)+1,...window.SnapPopBadges.nextProgress(prev.count||0),lastAt:event.at};
      }
      await store.set("badgeProgress",owned);
    }
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
    stars:progress.stars||1,
    identity
  });
  const slots=window.SnapPopBadgeVisual.starSlots(model.stars);
  host.innerHTML=`<div class="badgeMedallion" data-tier="${esc(model.tier)}">
    <div class="badgeGemArc">${slots.map(x=>`<i class="${x.active?"on":""}" aria-hidden="true"></i>`).join("")}</div>
    <div class="badgeIdentity">${model.identity.photo?`<img src="${esc(model.identity.photo)}" alt="">`:`<span>${esc(model.identity.name.slice(0,4))}</span>`}</div>
  </div>
  <div class="badgePreviewMeta"><b>${esc(model.title)}</b><span>${esc(model.tier)} · 별 ${model.stars}/5 · 획득/수여 아님</span><span>${model.themeExpression?.assetState==="UNRESOLVED"?"테마 표현 자산 검토 전":"검토된 테마 표현 자산"}</span></div>`;
}
return Object.freeze({contract:"SNAP_POP_BADGE_CONTROLLER_V1",proposeBadgeCandidateFromObservations,recordBadgeBehaviorObservation,recordBadgeBehaviorEvidence,recordBadgeEvent,renderBadgePreview});
}
window.SnapPopBadgeController=Object.freeze({instance(deps){if(!singleton)singleton=create(deps);return singleton}});
})();
