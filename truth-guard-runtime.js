(() => {
  "use strict";

  const VERSION="2026.09.21-b";
  const MAX_CLAIMS=12;
  const MAX_EVIDENCE=6;

  function text(value,max=500){
    return typeof value==="string" ? value.trim().slice(0,max) : "";
  }

  function list(value,max){
    return Array.isArray(value)?value.slice(0,max):[];
  }

  function normalizeEvidence(item={}){
    if(!item||typeof item!=="object") return null;
    const sourceType=text(item.source_type||item.sourceType,40);
    const sourceId=text(item.source_id||item.sourceId,240);
    const sourceUrl=text(item.source_url||item.sourceUrl,1000);
    const excerpt=text(item.excerpt,500);
    const checkedAt=text(item.checked_at||item.checkedAt,80);
    const title=text(item.title,240);
    if(!sourceType||(!sourceId&&!sourceUrl)) return null;
    return {source_type:sourceType,source_id:sourceId||null,source_url:sourceUrl||null,title:title||null,excerpt:excerpt||null,checked_at:checkedAt||null};
  }

  function normalizeClaim(item={}){
    if(!item||typeof item!=="object") return null;
    const claim=text(item.claim,500);
    if(!claim) return null;
    const evidence=list(item.evidence,MAX_EVIDENCE).map(normalizeEvidence).filter(Boolean);
    const status=item.status==="VERIFIED"&&evidence.length>0?"VERIFIED":"UNVERIFIED";
    return {claim,status,evidence};
  }

  function assess(raw={}){
    const verification=raw?.verification&&typeof raw.verification==="object"?raw.verification:{};
    const claims=list(verification.claims,MAX_CLAIMS).map(normalizeClaim).filter(Boolean);
    const unresolved=list(verification.unresolved,MAX_CLAIMS).map(x=>text(x,300)).filter(Boolean);
    const mode=text(verification.mode,60);
    const coverage=text(verification.coverage,60);
    const claimEvidenceVerified=claims.length>0&&claims.every(x=>x.status==="VERIFIED");
    const verified=mode==="CLAIM_EVIDENCE"&&coverage==="FULL_FACTUAL_CONTENT"&&claimEvidenceVerified&&unresolved.length===0;
    return Object.freeze({
      version:VERSION,
      verified,
      mode:verified?"CLAIM_EVIDENCE":"UNVERIFIED",
      coverage:coverage||"UNKNOWN",
      claimEvidenceVerified,
      verifiedClaimCount:claims.filter(x=>x.status==="VERIFIED").length,
      claims,
      unresolved,
      reason:verified
        ?"ALL_FACTUAL_CONTENT_EVIDENCE_BACKED"
        :claims.length===0
          ?"NO_CLAIM_EVIDENCE"
          :claimEvidenceVerified&&coverage!=="FULL_FACTUAL_CONTENT"
            ?"CLAIM_SET_VERIFIED_COVERAGE_OPEN"
            :"CLAIM_VERIFICATION_INCOMPLETE"
    });
  }

  function guardKnowledge(raw={}){
    const assessment=assess(raw);
    return {
      ...raw,
      verified:assessment.verified,
      verification:assessment,
      truthGuardVersion:VERSION
    };
  }

  window.SnapPopTruthGuard=Object.freeze({version:VERSION,assess,guardKnowledge});
})();