(() => {
"use strict";

const VERSION="2026.10.02-a";
let queue=[];
let current=null;
let installed=false;

function progress(count=0){
  if(!window.SnapPopBadges) throw new Error("BADGE_RUNTIME_REQUIRED");
  return window.SnapPopBadges.progressFromCount(count);
}

function classifyTransition(previousCount=0,nextCount=0){
  const prev=Math.max(0,Math.floor(Number(previousCount)||0));
  const next=Math.max(0,Math.floor(Number(nextCount)||0));
  if(next<=prev) throw new Error("BADGE_PRESENTATION_NON_FORWARD_TRANSITION");
  const before=progress(prev);
  const after=progress(next);
  let kind="REACQUIRE";
  if(prev===0&&next===1) kind="FIRST_EARN";
  else if(after.complete&&!before.complete) kind="MASTER_COMPLETE";
  else if(before.tier&&after.tier&&before.tier!==after.tier) kind="TIER_UP";
  return Object.freeze({
    kind,
    previousCount:prev,
    nextCount:next,
    before,
    after,
    awardAuthority:false,
    economyAuthority:false,
    presentationOnly:true
  });
}

function tierLabel(tier){
  return ({GREEN:"그린",BLUE:"블루",RED:"레드",GOLD:"골드",PLATINUM:"플래티넘"})[tier]||"";
}

function starsMarkup(count=0){
  const n=Math.max(0,Math.min(5,Number(count)||0));
  return '<span class="badgeAcquisitionStars" aria-label="재획득 별 '+n+'개">'+[0,1,2,3,4].map(i=>'<i class="'+(i<n?"on":"")+'"></i>').join("")+'</span>';
}

function labelFor(kind){
  return ({
    FIRST_EARN:{kicker:"NEW BADGE",title:"새 배지 발견",body:"새로운 탐험 기록이 도감에 추가됐어요."},
    REACQUIRE:{kicker:"BADGE GROWTH",title:"다시 빛난 배지",body:"같은 좋은 행동이 한 번 더 기록됐어요."},
    TIER_UP:{kicker:"TIER UP",title:"배지 성장",body:"반복한 기록이 쌓여 배지 단계가 올라갔어요."},
    MASTER_COMPLETE:{kicker:"BADGE COMPLETE",title:"배지 완성",body:"이 배지의 성장 기록을 끝까지 채웠어요."}
  })[kind]||{kicker:"BADGE",title:"배지 기록",body:"탐험 기록이 도감에 반영됐어요."};
}

async function resolveItem(badgeId,nextCount,at){
  const vm=await window.SnapPopBadgeCatalogUI.load();
  const base=vm.items.find(x=>x.badge_id===badgeId||x.draftId===badgeId||x.id===badgeId);
  if(!base) throw new Error("BADGE_PRESENTATION_ITEM_NOT_FOUND");
  return window.SnapPopBadgeCatalogUI.composeItem(base,{count:nextCount,lastAt:at||new Date().toISOString()});
}

function ensureInstalled(){
  if(installed)return;
  installed=true;
  const close=document.querySelector("#badgeAcquisitionClose");
  const continueBtn=document.querySelector("#badgeAcquisitionContinue");
  const catalogBtn=document.querySelector("#badgeAcquisitionCatalog");
  const backdrop=document.querySelector("#badgeAcquisitionBackdrop");
  close?.addEventListener("click",()=>dismiss(false));
  continueBtn?.addEventListener("click",()=>dismiss(false));
  backdrop?.addEventListener("click",()=>dismiss(false));
  catalogBtn?.addEventListener("click",()=>dismiss(true));
}

async function render(entry){
  ensureInstalled();
  const layer=document.querySelector("#badgeAcquisitionLayer");
  const art=document.querySelector("#badgeAcquisitionArt");
  if(!layer||!art) throw new Error("BADGE_PRESENTATION_DOM_MISSING");
  const item=await resolveItem(entry.badgeId,entry.transition.nextCount,entry.at);
  const text=labelFor(entry.transition.kind);
  const src=item.asset_runtime_url||item.asset_repo_path||"";
  const afterTier=item.tier||entry.transition.after.tier||"GREEN";
  const beforeTier=entry.transition.before.tier||null;

  layer.dataset.kind=entry.transition.kind;
  layer.dataset.tier=String(afterTier).toLowerCase();
  layer.classList.remove("badgeAcquisitionReplay");
  document.querySelector("#badgeAcquisitionKicker").textContent=text.kicker;
  document.querySelector("#badgeAcquisitionHeading").textContent=text.title;
  document.querySelector("#badgeAcquisitionTitle").textContent=item.display_title||"";
  document.querySelector("#badgeAcquisitionBody").textContent=text.body;
  document.querySelector("#badgeAcquisitionNo").textContent="No."+String(item.slot||0).padStart(3,"0");
  document.querySelector("#badgeAcquisitionNature").textContent=item.nature_label_ko||"";
  document.querySelector("#badgeAcquisitionTier").textContent=tierLabel(afterTier);
  document.querySelector("#badgeAcquisitionStars").innerHTML=starsMarkup(item.reacquire_stars);
  const tierChange=document.querySelector("#badgeAcquisitionTierChange");
  if(entry.transition.kind==="TIER_UP"){
    tierChange.hidden=false;
    tierChange.textContent=tierLabel(beforeTier)+" → "+tierLabel(afterTier);
  }else{
    tierChange.hidden=true;
    tierChange.textContent="";
  }
  art.innerHTML='<div class="badgeAcquisitionHalo" aria-hidden="true"></div><img src="'+src+'" alt="">';
  layer.hidden=false;
  layer.setAttribute("aria-hidden","false");
  requestAnimationFrame(()=>layer.classList.add("badgeAcquisitionReplay"));
  document.querySelector("#badgeAcquisitionContinue")?.focus({preventScroll:true});
  return item;
}

function pump(){
  if(current||!queue.length)return;
  current=queue.shift();
  render(current).catch(()=>{
    current=null;
    const layer=document.querySelector("#badgeAcquisitionLayer");
    if(layer){layer.hidden=true;layer.setAttribute("aria-hidden","true");}
    pump();
  });
}

function present({badgeId,previousCount=0,nextCount=0,at=null}={}){
  const id=String(badgeId||"").trim();
  if(!id) throw new Error("BADGE_PRESENTATION_BADGE_ID_REQUIRED");
  const transition=classifyTransition(previousCount,nextCount);
  const entry=Object.freeze({badgeId:id,at:at||new Date().toISOString(),transition});
  queue.push(entry);
  pump();
  return transition;
}

function dismiss(openCatalog=false){
  const active=current;
  const layer=document.querySelector("#badgeAcquisitionLayer");
  if(layer){
    layer.hidden=true;
    layer.setAttribute("aria-hidden","true");
    layer.classList.remove("badgeAcquisitionReplay");
  }
  current=null;
  if(openCatalog&&active){
    window.dispatchEvent(new CustomEvent("snap-pop:badge-open-catalog",{detail:{badgeId:active.badgeId}}));
  }
  pump();
}

function clearQueue(){
  queue=[];
  dismiss(false);
}

window.SnapPopBadgeAcquisition=Object.freeze({
  version:VERSION,
  contract:"SNAP_POP_BADGE_ACQUISITION_PRESENTATION_V1",
  classifyTransition,
  present,
  dismiss,
  clearQueue,
  getState:()=>Object.freeze({open:!!current,queued:queue.length,currentBadgeId:current?.badgeId||null}),
  presentationOnly:true,
  awardAuthority:false,
  economyAuthority:false
});
})();