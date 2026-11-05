
const $=q=>document.querySelector(q), $$=q=>[...document.querySelectorAll(q)];
const RELEASE=globalThis.SnapPopReleaseDescriptor;
if(!globalThis.TakyReleaseContract?.validateDescriptor?.(RELEASE)?.ok)throw new Error('INVALID_SNAP_RELEASE_DESCRIPTOR');
let db, marks=[], selected=null, lastMain="map", snapActiveExploration=false;
globalThis.SnapPopPwaSafePoint=()=>!snapActiveExploration;
globalThis.SnapExplorerCrewInboundCrewEvent=new URLSearchParams(location.search).get('crew_event')||'';
const crewAppConsumer=(()=>{try{return globalThis.TakyExplorerCrewAppConsumerV2?.create?.({app_id:'snap-pop',storage:localStorage,locationHref:location.href,replaceUrl:u=>history.replaceState(null,'',u)})||null}catch(e){console.warn('crew app consumer unavailable',e);return null}})();
const TURNAROUND_FRONT_APPROVED=Object.freeze({
  'guide-07':Object.freeze({src:'characters/ui_cutouts/guide-07.png',sha:'159b0bba1f39cf95c90f091eecf5296233c510a0c1d63bd1bb51927752008f99'}),
  'guide-08':Object.freeze({src:'characters/ui_cutouts/guide-08.png',sha:'183433f836aa89ba5016c05c51a772f5059bb7709a999702cf778d390efec816'}),
  'guide-09':Object.freeze({src:'characters/ui_cutouts/guide-09.png',sha:'6a1f62673f67b02cd50debb480c9f76d679d35a320a997c6e70e15ea087ea5e2'}),
  'guide-10':Object.freeze({src:'characters/ui_cutouts/guide-10.png',sha:'38b7624f5d4f205acfd1173c4de09469467217ad9750face3d0211ac1b860eb7'}),
  'guide-11':Object.freeze({src:'characters/ui_cutouts/guide-11.png',sha:'6d898a6c990bd0895d75c5d007b95fbdd1189e1912b8e5bacb10bc4e4d083510'}),
  'guide-12':Object.freeze({src:'characters/ui_cutouts/guide-12.png',sha:'5f00543ab9570a83f62bc7159eab772b372d7ecb1f19f150697098c5e830b014'}),
  'guide-13':Object.freeze({src:'characters/ui_cutouts/guide-13.png',sha:'b91916c58a4497fee82122e092fb083e7bcffb8e5fe8992add7e4dc9124f61ef'}),
  'guide-14':Object.freeze({src:'characters/ui_cutouts/guide-14.png',sha:'62c04c2cd83bd737c40f56b987c99434ef152301620daf96d81213416752001f'}),
  'guide-15':Object.freeze({src:'characters/ui_cutouts/guide-15.png',sha:'437bc370493b466edd1aa17ec182f3285dafd58536d414715334f5bd273f4903'}),
  'guide-16':Object.freeze({src:'characters/ui_cutouts/guide-16.png',sha:'766176a65ddce66199b14d91782c8f9c83839a40bbe43db31b5cbe0190e79c97'}),
  'guide-17':Object.freeze({src:'characters/ui_cutouts/guide-17.png',sha:'2493c8450d61863cab28bbccfbbfca38a32c601a496a1eb74156045c4aeb484c'}),
  'guide-18':Object.freeze({src:'characters/ui_cutouts/guide-18.png',sha:'cfee3ce8cd707d95441d578f086852f1246d01a59625925388554d1adaf68ffb'}),
  'guide-19':Object.freeze({src:'characters/ui_cutouts/guide-19.png',sha:'e220e05d0e4adfe53d7e5c0fc0d3e9041a2311b1bb66d75b27354accf1a79a33'}),
  'guide-20':Object.freeze({src:'characters/ui_cutouts/guide-20.png',sha:'2326e79a94a21024a188a4a125494f4a3b186a3bd2fdf685a5f809caad79c2b8'}),
  'guide-21':Object.freeze({src:'characters/ui_cutouts/guide-21.png',sha:'901fd4d30f581e4bb0c2a6918952149bf6a2cfda43ae1ccf67db1e7e03a4dd64'}),
  'guide-22':Object.freeze({src:'characters/ui_cutouts/guide-22.png',sha:'18ad95072887c218899f59b1a13a0678c61d618423da0314c9c8b195a27330d7'}),
  'guide-23':Object.freeze({src:'characters/ui_cutouts/guide-23.png',sha:'e926fadffd67dc5967f6639d12ffb635d7bf9ca4972565bcd000d2b1aa97712d'}),
  'guide-24':Object.freeze({src:'characters/ui_cutouts/guide-24.png',sha:'4cca9b946de0b59d743b67c55ff26049e99f2b113c77c8444f05e81344bd31b2'})
});
function turnaroundFrontPlan(id){
  const a=TURNAROUND_FRONT_APPROVED[id];
  return a?Object.freeze({kind:'STATIC_APPROVED_COMPAT',character_id:id,asset:a.src,asset_sha:a.sha,semantic_preserved:true,relation_mutation:false,affinity_mutation:false,source_kind:'TURNAROUND_FRONT_APPROVED'}):null;
}

async function renderCrewCompanion(sceneId='SNAP_EXPLORE'){
  const slot=$('#crewVisual'),img=$('#crewVisualImage'),composite=$('#crewVisualComposite'),nameEl=$('#crewName');
  if(!slot||!img||!composite||!nameEl)return false;
  const authority=globalThis.SnapExplorerCrewAuthorityConsumer?.snapshot?.(localStorage);
  const id=authority?.character_id||crewAppConsumer?.system?.snapshot?.()?.relation?.main_character_id||'';
  const profile=id?globalThis.TakyExplorerCrewPersonalityRegistry?.get?.(id):null;
  nameEl.textContent=profile?.name_ko?profile.name_ko+' 탐험대원':'탐험대원';
  const dom=globalThis.TakyExplorerCrewRenderPlanDomConsumer;
  dom?.clearImage?.(img);dom?.clearComposable?.(composite);
  img.hidden=true;composite.hidden=true;slot.hidden=true;
  if(!id||!crewAppConsumer||!dom)return false;
  const sync=await crewAppConsumer.sync({character_id:id,scene_id:sceneId,render:true});
  const plan=sync?.render_plan||turnaroundFrontPlan(id);
  if(!plan)return false;
  if(plan.kind==='STATIC_APPROVED_COMPAT'){
    const ok=dom.applyImage?.(img,plan,{alt:(profile?.name_ko||id)+' 탐험대원'})===true;
    if(ok){img.hidden=false;slot.hidden=false;slot.dataset.crewRenderStatus=plan.source_kind==='TURNAROUND_FRONT_APPROVED'?'TURNAROUND_FRONT_APPROVED':'STATIC';}
    return ok;
  }
  if(plan.kind==='COMPOSABLE_APPROVED'){
    composite.hidden=false;
    const ok=dom.mountComposable?.(composite,plan)===true;
    if(ok){slot.hidden=false;slot.dataset.crewRenderStatus='COMPOSABLE';}
    else composite.hidden=true;
    return ok;
  }
  return false;
}
const STEPS=[["생각 꺼내기","무엇이 먼저 떠올랐어?","완벽한 문장이 아니어도 좋아. 작은 조각 하나만 잡아보자."],["생각 넓히기","그 생각 옆에는 뭐가 더 있을까?","이유, 느낌, 장면 중 하나를 더 붙여보자."],["표현 완성하기","이제 네 문장으로 마무리해볼까?","앞의 생각을 이어서 네 말로 정리해보자."]];
function stepsFor(m){const x=Array.isArray(m?.steps)&&m.steps.length===3?m.steps:null;return x&&x.every(s=>Array.isArray(s)&&s.length>=3&&s.slice(0,3).every(v=>String(v||"").trim()))?x:STEPS}
function openDB(){return new Promise((ok,no)=>{const r=indexedDB.open("snap_pop_rev10",1);r.onupgradeneeded=()=>r.result.createObjectStore("state");r.onsuccess=()=>{db=r.result;ok()};r.onerror=()=>no(r.error)})}
function get(k){return new Promise(ok=>{const r=db.transaction("state").objectStore("state").get(k);r.onsuccess=()=>ok(r.result)})}
function set(k,v){return new Promise((ok,no)=>{const r=db.transaction("state","readwrite").objectStore("state").put(v,k);r.onsuccess=()=>{if(k==="active"){snapActiveExploration=!!v;if(!snapActiveExploration)window.dispatchEvent(new CustomEvent("snap-pop-safe-point"))}ok()};r.onerror=()=>no(r.error)})}
function toast(t){$("#toast").textContent=t;$("#toast").classList.add("show");clearTimeout(window.tt);window.tt=setTimeout(()=>$("#toast").classList.remove("show"),1800)}
function show(id){$$(".view").forEach(v=>v.classList.remove("active"));$("#"+id).classList.add("active");const sub=["settings","shop"].includes(id);$("#nav").hidden=sub;if(!sub)lastMain=id;$$(".nav button").forEach(b=>b.classList.toggle("on",b.dataset.view===id));scrollTo(0,0);if(id==="records")renderRecords();if(id==="gems")renderGems();if(id==="growth")renderGrowth()}
function html(s){return (s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
async function init(){await openDB();marks=await fetch("data/landmarks.json").then(r=>r.json());renderLandmarks();await updateStatus();renderRecords();renderGems();renderGrowth();const active=await get("active");snapActiveExploration=!!active;if(active)renderExplore(active);else window.dispatchEvent(new CustomEvent("snap-pop-safe-point"));await renderCrewCompanion(active?"SNAP_EXPLORE":"SNAP_HOME")}
function renderLandmarks(){const host=$("#landmarks");host.innerHTML="";marks.forEach(m=>{const b=document.createElement("button");b.className="landmark";b.textContent=m.title;b.style.left=m.x+"%";b.style.top=m.y+"%";b.onclick=async()=>{selected=m;$$(".landmark").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");const a=await get("active"),g=await get("gems")||{};$("#selTitle").textContent=m.title;$("#selDesc").textContent=m.desc;$("#selProgress").textContent="진행 "+(a?.landmark===m.id?(a.step||0):0)+" / 3";$("#selShard").textContent="보석 조각 "+((g[m.id]||0)%6)+" / 6";$("#selection").hidden=false};host.appendChild(b)})}
$("#startBtn").onclick=async()=>{if(!selected)return;let s=await get("active");if(!s||s.landmark!==selected.id)s={landmark:selected.id,step:0,answers:["","",""]};await set("active",s);renderExplore(s);show("explore");if($("#autoRead").checked){const q=stepsFor(selected)[s.step]||stepsFor(selected)[0];speak(q[1]+" "+q[2])}}
function renderExplore(s){const m=marks.find(x=>x.id===s.landmark)||marks[0],steps=stepsFor(m),i=Math.min(2,s.step||0);$("#exploreTitle").textContent="탐험 진행 · "+m.title;$("#question").textContent=steps[i][1];$("#hint").textContent=steps[i][2];$("#answer").value=s.answers[i]||"";$("#guideLine").textContent=["처음엔 작은 조각 하나면 충분해.","오, 그 생각 옆에 뭐가 더 숨어 있을까?","이제 네 문장으로 딱 묶어보자."][i];$("#nextBtn").textContent=i===2?"탐험 완료":"다음 단계";$("#steps").innerHTML=steps.map((x,n)=>`<span class="${n===i?"on":n<i?"done":""}">${n+1}. ${html(x[0])}</span>`).join("");void renderCrewCompanion("SNAP_EXPLORE_STEP_"+i)}
// Lightweight learner-authored evidence gate, not a semantic grading model.
// Keep a short first idea valid; later steps must contribute distinct content.
// A participation reward NEVER constitutes independently verified mastery.
function expressionEvidence(answer,earlier=[]){
 const words=s=>String(s||"").normalize("NFKC").toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu,"");
 const current=words(answer);
 if(!current)return {ok:false,prompt:"먼저 네 생각을 한 단어나 문장으로 적어 볼까?"};
 if(current.length>=4&&/^(.{1,6})\1+$/u.test(current))
   return {ok:false,prompt:"같은 글자를 반복하기보다 네 생각을 적어 보자."};
 for(const other of earlier){
   const before=words(other);
   if(!before)continue;
   if(current===before)return {ok:false,prompt:"앞의 답과 같아. 새로운 느낌이나 이유를 하나 더 붙여볼까?"};
   if(current.startsWith(before)&&current.length-before.length<3)
     return {ok:false,prompt:"앞에서 한 말을 조금 더 넓혀 볼까? 장소나 이유를 더해 봐."};
 }
 if(earlier.length&&current.length<3)
   return {ok:false,prompt:"조금만 더 자세히 표현해 볼까?"};
 return {ok:true,basis:"DISTINCT_PARTICIPATION_TEXT_NOT_SEMANTIC_MASTERY"};
}
$("#nextBtn").onclick=async()=>{let s=await get("active");if(!s){toast("지도에서 탐험지를 먼저 골라줘.");show("map");return}const i=s.step||0,answer=$("#answer").value.trim(),evidence=expressionEvidence(answer,s.answers.slice(0,i));if(!evidence.ok)return toast(evidence.prompt);s.answers[i]=answer;if(i<2){s.step=i+1;await set("active",s);renderExplore(s);return}const m=marks.find(x=>x.id===s.landmark)||{},r=await get("records")||[];r.unshift({id:Date.now(),landmark:s.landmark,answers:s.answers,date:new Date().toISOString(),expansionPack:m.expansionPack||null,sourceRef:m.sourceRef||null,sourceSha256:m.sourceSha256||null,verificationStatus:"PARTICIPATION_STRUCTURE_ONLY_NOT_INDEPENDENT_LEARNING_MASTERY"});await set("records",r);const g=await get("gems")||{};g[s.landmark]=(g[s.landmark]||0)+1;await set("gems",g);await set("exp",(await get("exp")||0)+55);await set("active",null);await updateStatus();toast("탐험 완료! 보석 조각과 성장이 기록됐어.");show("growth")}
function speak(t){if(!("speechSynthesis"in window))return toast("이 브라우저에서는 읽어주기를 지원하지 않아요.");speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang="ko-KR";speechSynthesis.speak(u)}
$("#listenBtn").onclick=async()=>{const s=await get("active");const m=marks.find(x=>x.id===s?.landmark)||selected||marks[0],q=stepsFor(m)[s?.step||0]||stepsFor(m)[0];speak(q[1]+" "+q[2])}
$("#voiceBtn").onclick=()=>{const R=window.SpeechRecognition||window.webkitSpeechRecognition;if(!R)return toast("이 브라우저에서는 음성 인식을 지원하지 않아요.");const r=new R();r.lang="ko-KR";r.interimResults=false;$("#voiceBtn").textContent="듣고 있어요";r.onresult=e=>$("#answer").value+=(($("#answer").value?" ":"")+e.results[0][0].transcript);r.onend=()=>$("#voiceBtn").innerHTML='<img src="assets/icons/radio.svg" alt="">말해서 쓰기';r.start()}
async function renderRecords(){if(!db)return;const r=await get("records")||[];$("#recordList").innerHTML=r.length?r.map(x=>{const m=marks.find(z=>z.id===x.landmark);return `<article class="card"><b>${m?.title||"탐험"}</b><p>${x.answers.map(html).join(" ")}</p><span class="kicker">${new Date(x.date).toLocaleDateString("ko-KR")}</span></article>`}).join(""):'<article class="card"><b>첫 기록을 기다리고 있어요.</b><p>지도에서 탐험지를 골라 시작해봐요.</p></article>'}
async function renderGems(){if(!db)return;const g=await get("gems")||{};$("#gemRows").innerHTML=marks.map(m=>{const n=g[m.id]||0;return `<article class="gemRow"><div><b>${m.title}</b><span>보석 조각 ${n%6}/6</span></div><strong>완성 ${Math.floor(n/6)}</strong></article>`}).join("")}
async function renderGrowth(){if(!db)return;const cfg=await fetch("data/growth.json").then(r=>r.json()),exp=await get("exp")||0,lv=Math.floor(exp/120)+1;let s=cfg[0];cfg.forEach(x=>{if(lv>=x.min)s=x});$("#growthLv").textContent="Lv."+lv;$("#growthName").textContent=s.name;$("#treeImage").src="assets/growth/"+s.image;$("#expBar").style.width=((exp%120)/120*100)+"%";$("#expText").textContent="EXP "+exp+" · 다음 성장까지 "+(120-exp%120)+" EXP"}
async function updateStatus(){const exp=await get("exp")||0,g=await get("gems")||{},lv=Math.floor(exp/120)+1,complete=Object.values(g).reduce((a,n)=>a+Math.floor(n/6),0);$("#levelChip").textContent="Lv."+lv;$("#gemChip").textContent="보석 "+complete}
$("#shopBtn").onclick=()=>show("shop");$("#useWish").onclick=()=>$("#blessing").hidden=false;
$("#confirmBlessing").onclick=async()=>{const g=await get("gems")||{};let need=12;for(const k of Object.keys(g)){const use=Math.min(Math.floor(g[k]/6)*6,need);g[k]-=use;need-=use;if(!need)break}if(need)return toast("완성 보석 2개가 필요해요.");await set("gems",g);await updateStatus();renderGems();$("#blessing").hidden=true;toast("축복을 사용했어요. 소원이 기록됐어요.")}
$("#historyBtn").onclick=()=>toast("성장 기록 타임라인은 기능 검토 후 연결하는 HOLD 항목이에요.");
$("#settingsBtn").onclick=()=>show("settings");$("#settingsBack").onclick=()=>show(lastMain);$$("[data-back]").forEach(b=>b.onclick=()=>show(b.dataset.back));
$("#characterBtn").onclick=()=>toast("사진 기반 Character Master 재생성은 원본 파이프라인 연결 전 HOLD예요.");
$("#guideBtn").onclick=()=>toast("현재 길잡이 디자인 계보는 유지하고 이름 변경만 연결할 예정이에요.");
$("#homeRadio").onclick=()=>{const event=window.SnapPopBridge?.requestGuideRadio?.("home_radio",{view:"map"});if(!event)toast("무전 연결을 준비하고 있어요.");};
$("#autoRead").onchange=$("#reduceMotion").onchange=async()=>{await set("settings",{autoRead:$("#autoRead").checked,reduceMotion:$("#reduceMotion").checked})}
$("#nav").onclick=e=>{const b=e.target.closest("button[data-view]");if(b)show(b.dataset.view)}
globalThis.SnapExplorerCrewAuthorityConsumer?.boot?.({
  storage:localStorage,
  locationHref:location.href,
  replaceUrl:u=>history.replaceState(null,'',u),
  host:document.getElementById('app'),
  radio:document.getElementById('homeRadio')
});
void renderCrewCompanion('SNAP_BOOT');
init().catch(e=>{console.error(e);toast("앱 데이터를 준비하지 못했어요.")});
