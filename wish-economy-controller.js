(() => {
"use strict";
let singleton=null;
function create(deps){
const q=deps.query,store=window.SnapPopStorage,esc=window.SnapPopUIShell.escapeHtml;
let wishBusy=false;
async function renderGems(){
  if(!window.SnapPopStorage.isOpen())return;
  const g=await store.get("gems")||{};
  q("#gemRows").innerHTML=deps.getLandmarks().map(m=>{
    const n=g[m.id]||0;
    return `<article class="gemRow"><div><b>${m.title}</b><span>보석 조각 ${n%6}/6</span></div><strong>완성 ${Math.floor(n/6)}</strong></article>`;
  }).join("");
}
async function renderWishHistory(){
  const txns=await store.get("wishTransactions")||[],host=q("#wishHistoryList");
  host.hidden=false;
  host.innerHTML=txns.length
    ?[...txns].reverse().map(x=>`<div class="timelineItem"><b>${esc(x.wish||"소원")} · 완성 보석 ${x.completedGemCount||0}개</b><span>${new Date(x.at).toLocaleString("ko-KR")} · ${x.status==="COMPLETED"?"사용 완료":esc(x.status)}</span></div>`).join("")
    :'<div class="timelineItem"><b>아직 사용한 소원이 없어요.</b><span>축복을 확정하면 여기에 사용 내역이 남아요.</span></div>';
}
async function confirmBlessing(){
  if(wishBusy)return deps.toast("소원을 처리하고 있어요.");
  wishBusy=true;q("#confirmBlessing").disabled=true;
  try{
    const txns=await store.get("wishTransactions")||[];
    const g={...(await store.get("gems")||{})},gemLedger=await store.get("gemLedger")||[];
    let needCompleted=2;const spend={};
    for(const m of deps.getLandmarks()){
      const complete=Math.floor((g[m.id]||0)/6);
      const take=Math.min(complete,needCompleted);
      if(take){spend[m.id]=take;g[m.id]-=take*6;needCompleted-=take}
      if(!needCompleted)break;
    }
    if(needCompleted){deps.toast("완성 보석 2개가 필요해요.");return}
    const id=deps.uid("wish_tx"),at=new Date().toISOString();
    Object.entries(spend).forEach(([landmark,count])=>gemLedger.push({eventId:id,type:"GEM_SPENT",landmark,completedGemDelta:-count,sourceShards:-count*6,at,reason:"WISH_BLESSING"}));
    txns.push({id,status:"COMPLETED",wish:"가족과 주말 영화 보기",spend,completedGemCount:2,at});
    await store.setMany([["gems",g],["gemLedger",gemLedger],["wishTransactions",txns]]);
    await deps.updateStatus();
    await renderGems();
    q("#blessing").hidden=true;
    if(!q("#wishHistoryList").hidden)await renderWishHistory();
    deps.toast("축복을 사용했어요. 소원 사용 내역에 기록됐어요.");
  }finally{
    wishBusy=false;q("#confirmBlessing").disabled=false;
  }
}
function install(){
  q("#shopBtn").onclick=()=>deps.show("shop");
  q("#useWish").onclick=()=>{q("#blessing").hidden=false};
  q("#confirmBlessing").onclick=confirmBlessing;
  q("#wishHistoryBtn").onclick=renderWishHistory;
}
return Object.freeze({contract:"SNAP_POP_WISH_ECONOMY_CONTROLLER_V1",install,renderGems,renderWishHistory,confirmBlessing});
}
window.SnapPopWishEconomyController=Object.freeze({instance(deps){if(!singleton)singleton=create(deps);return singleton}});
})();