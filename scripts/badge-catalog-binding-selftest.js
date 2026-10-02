(() => {
"use strict";
if(!new URLSearchParams(location.search).has("runtime-smoke"))return;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function waitFor(check,timeout=12000){const s=Date.now();while(Date.now()-s<timeout){try{if(check())return true}catch{}await wait(80)}return false}
async function run(){
  const host=document.createElement("pre");
  host.id="badgeCatalogBindingSelfTest";
  host.hidden=true;
  document.body.appendChild(host);
  const pass=n=>{host.textContent+="\nPASS "+n};
  const assert=(n,v)=>{if(!v)throw new Error("FAIL "+n);pass(n)};
  try{
    assert("badge-catalog-runtime-present",await waitFor(()=>!!window.SnapPopBadgeCatalogUI));
    const vm=await window.SnapPopBadgeCatalogUI.load();
    const artStatus=window.SnapPopBadgeArtPack?.status?.();
    assert("badge-art-pack-loaded",artStatus?.loaded===true&&artStatus?.count===60);
    assert("badge-art-runtime-urls-complete",vm.items.every(x=>typeof x.asset_runtime_url==="string"&&x.asset_runtime_url.startsWith("blob:")));
    assert("badge-art-shard-entry-meta-complete",vm.items.every(x=>window.SnapPopBadgeArtPack.inspect(x.asset_slot_id)?.sha256===x.runtime_sha256));
    assert("badge-catalog-has-60",vm.total===60&&vm.items.length===60);
    assert("badge-id-unique",new Set(vm.items.map(x=>x.badge_id)).size===60);
    assert("visual-id-unique",new Set(vm.items.map(x=>x.visual_id)).size===60);
    assert("asset-slot-id-unique",new Set(vm.items.map(x=>x.asset_slot_id)).size===60);
    assert("category-counts",vm.counts_by_category.POCKET===20&&vm.counts_by_category.FIELD===20&&vm.counts_by_category.EXPEDITION===14&&vm.counts_by_category.SECRET===6);
    const p=window.SnapPopBadgeCatalogUI.progressForCount;
    assert("first-award-zero-stars",p(1).tier==="GREEN"&&p(1).reacquireStars===0);
    assert("five-reawards-promote-blue",p(6).tier==="BLUE"&&p(6).reacquireStars===0);
    assert("platinum-can-reach-five-stars",p(26).tier==="PLATINUM"&&p(26).reacquireStars===5&&p(26).complete===true);
    assert("catalog-screen-present",!!document.querySelector("#badgeCatalog")&&!!document.querySelector("#badgeCatalogGrid"));
    assert("game-codex-progress-present",!!document.querySelector("#badgeCatalogProgressBar")&&!!document.querySelector("#badgeCatalogPercent"));
    assert("game-codex-category-progress-present",document.querySelectorAll(".badgeCategoryProgress [data-badge-category-progress]").length===4);
    assert("game-codex-sort-present",!!document.querySelector("#badgeCatalogSort"));
    assert("nature-taxonomy-present",!!vm.nature_taxonomy&&Object.keys(vm.nature_taxonomy).length===8);
    assert("nature-primary-complete",vm.items.every(x=>typeof x.primary_nature==="string"&&x.primary_nature.length>0));
    assert("nature-filter-present",document.querySelectorAll("#badgeNatureFilters [data-badge-nature]").length===9);
    assert("nature-sort-option-present",[...document.querySelectorAll("#badgeCatalogSort option")].some(x=>x.value==="NATURE"));
    assert("group-view-selector-present",!!document.querySelector("#badgeCatalogView"));
    assert("group-view-modes-present",["GRID","NATURE","CATEGORY","OWNERSHIP"].every(v=>[...document.querySelectorAll("#badgeCatalogView option")].some(x=>x.value===v)));
    assert("nature-progress-counts-present",document.querySelectorAll("[data-badge-nature-progress]").length===9);
    assert("detail-acquisition-record-present",!!document.querySelector("#badgeDetailCount")&&!!document.querySelector("#badgeDetailLast"));
    const codexCss=await fetch("styles.css").then(r=>r.text());
    assert("codex-visual-state-contract-present",
      codexCss.includes(".badgeTierHalo")&&
      codexCss.includes(".badgeCatalogTile.recentEarned")&&
      codexCss.includes(".badgeCatalogTile.inProgress")&&
      codexCss.includes('[data-tier="GREEN"]')&&
      codexCss.includes(".badgeCatalogTile.locked")
    );
    assert("game-codex-detail-sheet-present",!!document.querySelector("#badgeDetailLayer")&&!!document.querySelector("#badgeDetailPrev")&&!!document.querySelector("#badgeDetailNext"));
    assert("badge-acquisition-runtime-present",!!window.SnapPopBadgeAcquisition&&window.SnapPopBadgeAcquisition.presentationOnly===true&&window.SnapPopBadgeAcquisition.awardAuthority===false);
    assert("badge-acquisition-layer-present",!!document.querySelector("#badgeAcquisitionLayer")&&!!document.querySelector("#badgeAcquisitionArt")&&!!document.querySelector("#badgeAcquisitionCatalog"));
    const classify=window.SnapPopBadgeAcquisition.classifyTransition;
    const first=classify(0,1),tierUp=classify(5,6),reacquire=classify(6,7),complete=classify(25,26);
    assert("badge-acquisition-first-earned-kind",first.kind==="FIRST_EARN"&&first.after.tier==="GREEN"&&first.after.stars===0);
    assert("badge-acquisition-tier-up-kind",tierUp.kind==="TIER_UP"&&tierUp.before.tier==="GREEN"&&tierUp.after.tier==="BLUE"&&tierUp.after.stars===0);
    assert("badge-acquisition-reacquire-kind",reacquire.kind==="REACQUIRE"&&reacquire.after.tier==="BLUE"&&reacquire.after.stars===1);
    assert("badge-acquisition-master-complete-kind",complete.kind==="MASTER_COMPLETE"&&complete.after.tier==="PLATINUM"&&complete.after.stars===5&&complete.after.complete===true);
    assert("badge-acquisition-presentation-has-no-authority",first.presentationOnly===true&&first.awardAuthority===false&&first.economyAuthority===false);
    host.dataset.status="PASS";
  }catch(e){
    host.dataset.status="FAIL";
    host.textContent+="\n"+String(e?.message||e);
    throw e;
  }
}
run();
})();