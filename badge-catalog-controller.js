(() => {
"use strict";
let singleton=null;

function create(deps){
  const q=deps.query, qa=deps.queryAll, store=window.SnapPopStorage, esc=window.SnapPopUIShell.escapeHtml;
  let filter="ALL", category="ALL", nature="ALL", sort="NUMBER_ASC", cache=[], selectedId=null;

  function artMarkup(item,cls=""){
    const path=esc(item.asset_runtime_url||item.asset_repo_path||"");
    const secretLocked=item.category==="SECRET"&&item.ownership_state!=="EARNED";
    return `<div class="badgeCatalogArt ${cls} ${secretLocked?"secretLocked":""}">
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

  function natureLabel(id){
    return ({
      SELF_DIRECTED:"스스로",
      GOAL_ACHIEVEMENT:"목표도달",
      FOCUS_IMMERSION:"집중·몰입",
      RECOVERY_RESILIENCE:"복귀·재도전",
      ERROR_LEARNING:"실수·교정",
      PLANNING_SELF_REGULATION:"계획·조절",
      PROBLEM_SOLVING:"문제해결",
      EXTRA_GROWTH:"추가도전·성장"
    })[id]||"기타";
  }

  function isRecent(item){
    if(!item.last_at)return false;
    const t=new Date(item.last_at).getTime();
    return Number.isFinite(t)&&Date.now()-t<=72*60*60*1000;
  }

  function displayTitle(item){
    return item.category==="SECRET"&&item.ownership_state!=="EARNED"?"???":item.display_title;
  }

  function sorted(items){
    const copy=[...items];
    if(sort==="RECENT"){
      copy.sort((a,b)=>(new Date(b.last_at||0))-(new Date(a.last_at||0))||a.slot-b.slot);
    }else if(sort==="TIER"){
      const order={PLATINUM:5,GOLD:4,RED:3,BLUE:2,GREEN:1};
      copy.sort((a,b)=>(order[b.tier]||0)-(order[a.tier]||0)||b.reacquire_stars-a.reacquire_stars||a.slot-b.slot);
    }else if(sort==="NATURE"){
      const order={SELF_DIRECTED:1,GOAL_ACHIEVEMENT:2,FOCUS_IMMERSION:3,RECOVERY_RESILIENCE:4,ERROR_LEARNING:5,PLANNING_SELF_REGULATION:6,PROBLEM_SOLVING:7,EXTRA_GROWTH:8};
      copy.sort((a,b)=>(order[a.primary_nature]||99)-(order[b.primary_nature]||99)||a.slot-b.slot);
    }else{
      copy.sort((a,b)=>a.slot-b.slot);
    }
    return copy;
  }

  function renderHeader(){
    const total=cache.length;
    const earned=cache.filter(x=>x.ownership_state==="EARNED").length;
    q("#badgeCatalogCount").textContent=`${earned} / ${total}`;
    const pct=total?Math.round(earned/total*100):0;
    q("#badgeCatalogProgressBar").style.width=`${pct}%`;
    q("#badgeCatalogPercent").textContent=`${pct}%`;
    for(const key of ["POCKET","FIELD","EXPEDITION","SECRET"]){
      const items=cache.filter(x=>x.category===key);
      const done=items.filter(x=>x.ownership_state==="EARNED").length;
      const el=q(`[data-badge-category-progress="${key}"]`);
      if(el)el.textContent=`${done}/${items.length}`;
    }
    if(q("#badgeCatalogSort"))q("#badgeCatalogSort").value=sort;
  }

  function renderFilters(){
    qa("#badgeCatalogFilters [data-badge-filter]").forEach(b=>b.classList.toggle("on",b.dataset.badgeFilter===filter));
    qa("#badgeCategoryFilters [data-badge-category], .badgeCategoryProgress [data-badge-category]").forEach(b=>b.classList.toggle("on",b.dataset.badgeCategory===category));
    qa("#badgeNatureFilters [data-badge-nature]").forEach(b=>b.classList.toggle("on",b.dataset.badgeNature===nature));
  }

  function tileHtml(item){
    const locked=item.ownership_state!=="EARNED";
    return `<button class="badgeCatalogTile ${locked?"locked":"earned"} ${selectedId===item.badge_id?"selected":""}" data-badge-id="${esc(item.badge_id)}" type="button">
      <span class="badgeCatalogNo">No.${String(item.slot).padStart(3,"0")}</span>
      <div class="badgeCatalogArtWrap">
        ${artMarkup(item)}
        ${locked?'<span class="badgeCatalogLock" aria-hidden="true"></span>':""}
        ${isRecent(item)?'<span class="badgeCatalogNew">NEW</span>':""}
      </div>
      <b>${esc(displayTitle(item))}</b>
      <span class="badgeNatureMini">${esc(natureLabel(item.primary_nature))}</span>
      ${item.ownership_state==="EARNED"?starsMarkup(item.reacquire_stars):'<small>미획득</small>'}
    </button>`;
  }

  function renderGrid(){
    const selected=sorted(window.SnapPopBadgeCatalogUI.select(cache,{filter,category,nature}));
    const host=q("#badgeCatalogGrid");
    if(!host)return;
    if(!selected.length){
      host.innerHTML=`<div class="badgeCatalogEmpty">해당 조건의 배지가 아직 없어요.</div>`;
    }else if(sort==="NATURE"&&nature==="ALL"){
      const groups=[...new Set(selected.map(x=>x.primary_nature))];
      host.innerHTML=groups.map(group=>{
        const items=selected.filter(x=>x.primary_nature===group);
        return `<section class="badgeNatureGroup">
          <header><b>${esc(natureLabel(group))}</b><span>${items.length}</span></header>
          <div class="badgeNatureGroupGrid">${items.map(tileHtml).join("")}</div>
        </section>`;
      }).join("");
    }else{
      host.innerHTML=selected.map(tileHtml).join("");
    }
    qa(".badgeCatalogTile").forEach(b=>b.onclick=()=>openDetail(b.dataset.badgeId));
  }

  async function render(){
    if(!window.SnapPopStorage.isOpen())return;
    const vm=await window.SnapPopBadgeCatalogUI.load();
    const progress=await store.get("badgeProgress")||{};
    cache=vm.items.map(item=>window.SnapPopBadgeCatalogUI.composeItem(item,progress[item.badge_id]||progress[item.badgeId]||{}));
    renderHeader();
    renderFilters();
    renderGrid();
  }

  function stepDetail(delta){
    const list=sorted(window.SnapPopBadgeCatalogUI.select(cache,{filter,category,nature}));
    const idx=list.findIndex(x=>x.badge_id===selectedId);
    if(idx<0||!list.length)return;
    const next=list[(idx+delta+list.length)%list.length];
    openDetail(next.badge_id);
  }

  function openDetail(badgeId){
    const item=cache.find(x=>x.badge_id===badgeId);
    if(!item)return;
    selectedId=badgeId;
    renderGrid();
    const secretLocked=item.category==="SECRET"&&item.ownership_state!=="EARNED";
    q("#badgeDetailArt").innerHTML=artMarkup(item,"large");
    q("#badgeDetailNo").textContent=`No.${String(item.slot).padStart(3,"0")}`;
    q("#badgeDetailTitle").textContent=displayTitle(item);
    q("#badgeDetailCategory").textContent=item.category;
    q("#badgeDetailNature").textContent=natureLabel(item.primary_nature);
    q("#badgeDetailStory").textContent=secretLocked?"아직 발견되지 않은 비밀 배지입니다.":(item.core_detail||"");
    q("#badgeDetailState").textContent=item.ownership_state==="EARNED"
      ? `${tierLabel(item.tier)} · 재획득 별 ${item.reacquire_stars}/5`
      : item.ownership_state==="IN_PROGRESS"?"발견 중":"아직 만나지 못한 배지";
    q("#badgeDetailStars").innerHTML=item.ownership_state==="EARNED"?starsMarkup(item.reacquire_stars):"";
    const sheet=q("#badgeDetailLayer");
    sheet.hidden=false;
    sheet.setAttribute("aria-hidden","false");
  }

  function closeDetail(){
    selectedId=null;
    renderGrid();
    const sheet=q("#badgeDetailLayer");
    if(sheet){
      sheet.hidden=true;
      sheet.setAttribute("aria-hidden","true");
    }
  }

  function install(){
    const open=q("#badgeCatalogBtn"), back=q("#badgeCatalogBack"), close=q("#badgeDetailClose");
    if(open)open.onclick=async()=>{await render();deps.show("badgeCatalog")};
    if(back)back.onclick=()=>deps.show("growth");
    if(close)close.onclick=closeDetail;
    const backdrop=q("#badgeDetailBackdrop");
    if(backdrop)backdrop.onclick=closeDetail;
    const prev=q("#badgeDetailPrev"), next=q("#badgeDetailNext");
    if(prev)prev.onclick=()=>stepDetail(-1);
    if(next)next.onclick=()=>stepDetail(1);
    qa("#badgeCatalogFilters [data-badge-filter]").forEach(b=>b.onclick=()=>{filter=b.dataset.badgeFilter;renderFilters();renderGrid()});
    qa("#badgeCategoryFilters [data-badge-category], .badgeCategoryProgress [data-badge-category]").forEach(b=>b.onclick=()=>{category=b.dataset.badgeCategory;renderFilters();renderGrid()});
    qa("#badgeNatureFilters [data-badge-nature]").forEach(b=>b.onclick=()=>{nature=b.dataset.badgeNature;renderFilters();renderGrid()});
    const sortSelect=q("#badgeCatalogSort");
    if(sortSelect)sortSelect.onchange=()=>{sort=sortSelect.value;renderGrid()};
  }

  return Object.freeze({contract:"SNAP_POP_BADGE_CATALOG_CONTROLLER_V3_NATURE",render,install,openDetail,closeDetail});
}

window.SnapPopBadgeCatalogController=Object.freeze({instance(deps){if(!singleton)singleton=create(deps);return singleton}});
})();