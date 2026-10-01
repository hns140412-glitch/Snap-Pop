(() => {
"use strict";
let singleton=null;

function create(deps){
  const q=deps.query, qa=deps.queryAll, store=window.SnapPopStorage, esc=window.SnapPopUIShell.escapeHtml;
  let filter="ALL", category="ALL", cache=[];

  function artMarkup(item,cls=""){
    const path=esc(item.asset_repo_path||"");
    return `<div class="badgeCatalogArt ${cls}">
      <img src="${path}" alt="" loading="lazy" onerror="this.hidden=true;this.nextElementSibling.hidden=false">
      <span class="badgeCatalogArtFallback" hidden aria-hidden="true"></span>
    </div>`;
  }

  function starsMarkup(count=0){
    const n=Math.max(0,Math.min(5,Number(count)||0));
    return `<span class="badgeCatalogStars" aria-label="재획득 별 ${n}개">${[0,1,2,3,4].map(i=>`<i class="${i<n?"on":""}"></i>`).join("")}</span>`;
  }

  function tierLabel(tier){
    return ({GREEN:"그린",BLUE:"블루",RED:"레드",GOLD:"골드",PLATINUM:"플래티넘"})[tier]||"미획득";
  }

  function renderFilters(){
    qa("#badgeCatalogFilters [data-badge-filter]").forEach(b=>b.classList.toggle("on",b.dataset.badgeFilter===filter));
    qa("#badgeCategoryFilters [data-badge-category]").forEach(b=>b.classList.toggle("on",b.dataset.badgeCategory===category));
  }

  function renderGrid(){
    const selected=window.SnapPopBadgeCatalogUI.select(cache,{filter,category});
    const host=q("#badgeCatalogGrid");
    if(!host)return;
    host.innerHTML=selected.length?selected.map(item=>{
      const locked=item.ownership_state!=="EARNED";
      return `<button class="badgeCatalogTile ${locked?"locked":"earned"}" data-badge-id="${esc(item.badge_id)}" type="button">
        <div class="badgeCatalogArtWrap">${artMarkup(item)}${locked?'<span class="badgeCatalogLock" aria-hidden="true">⌁</span>':""}</div>
        <b>${esc(item.display_title)}</b>
        <span>${esc(item.category)}</span>
        ${item.ownership_state==="EARNED"?starsMarkup(item.reacquire_stars):'<small>미획득</small>'}
      </button>`;
    }).join(""):`<div class="badgeCatalogEmpty">해당 조건의 배지가 아직 없어요.</div>`;
    qa(".badgeCatalogTile").forEach(b=>b.onclick=()=>openDetail(b.dataset.badgeId));
  }

  async function render(){
    if(!window.SnapPopStorage.isOpen())return;
    const vm=await window.SnapPopBadgeCatalogUI.load();
    const progress=await store.get("badgeProgress")||{};
    cache=vm.items.map(item=>window.SnapPopBadgeCatalogUI.composeItem(item,progress[item.badge_id]||progress[item.badgeId]||{}));
    q("#badgeCatalogCount").textContent=`${cache.filter(x=>x.ownership_state==="EARNED").length} / ${cache.length}`;
    renderFilters();
    renderGrid();
  }

  function openDetail(badgeId){
    const item=cache.find(x=>x.badge_id===badgeId);
    if(!item)return;
    const panel=q("#badgeDetailPanel");
    q("#badgeDetailArt").innerHTML=artMarkup(item,"large");
    q("#badgeDetailTitle").textContent=item.display_title;
    q("#badgeDetailCategory").textContent=item.category;
    q("#badgeDetailStory").textContent=item.core_detail||"";
    q("#badgeDetailState").textContent=item.ownership_state==="EARNED"
      ? `${tierLabel(item.tier)} · 재획득 별 ${item.reacquire_stars}/5`
      : "아직 만나지 못한 배지";
    q("#badgeDetailStars").innerHTML=item.ownership_state==="EARNED"?starsMarkup(item.reacquire_stars):"";
    panel.hidden=false;
    panel.scrollIntoView({block:"nearest",behavior:document.documentElement.classList.contains("reduceMotion")?"auto":"smooth"});
  }

  function install(){
    const open=q("#badgeCatalogBtn"), back=q("#badgeCatalogBack"), close=q("#badgeDetailClose");
    if(open)open.onclick=async()=>{await render();deps.show("badgeCatalog")};
    if(back)back.onclick=()=>deps.show("growth");
    if(close)close.onclick=()=>{q("#badgeDetailPanel").hidden=true};
    qa("#badgeCatalogFilters [data-badge-filter]").forEach(b=>b.onclick=()=>{filter=b.dataset.badgeFilter;renderFilters();renderGrid()});
    qa("#badgeCategoryFilters [data-badge-category]").forEach(b=>b.onclick=()=>{category=b.dataset.badgeCategory;renderFilters();renderGrid()});
  }

  return Object.freeze({contract:"SNAP_POP_BADGE_CATALOG_CONTROLLER_V1",render,install,openDetail});
}

window.SnapPopBadgeCatalogController=Object.freeze({instance(deps){if(!singleton)singleton=create(deps);return singleton}});
})();