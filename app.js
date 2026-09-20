const $=q=>document.querySelector(q), $$=q=>[...document.querySelectorAll(q)];
let db, marks=[], selected=null, lastMain="map", calendarCursor=new Date();
const STEPS=[
  ["생각 꺼내기","무엇이 먼저 떠올랐어?","완벽한 문장이 아니어도 좋아. 작은 조각 하나만 잡아보자."],
  ["생각 넓히기","그 생각 옆에는 뭐가 더 있을까?","이유, 느낌, 장면 중 하나를 더 붙여보자."],
  ["표현 완성하기","이제 네 문장으로 마무리해볼까?","앞의 생각을 이어서 네 말로 정리해보자."]
];
const LEVEL_NEEDS=[0,80,100,120,150,180,220,260,300,340,380,430,480,540,600,670,740,820,900,990,1080,1180,1280,1390,1500];
const LEVEL_THRESHOLDS=LEVEL_NEEDS.reduce((a,n,i)=>{a.push(i===0?0:a[i-1]+n);return a},[]);
const uid=p=>`${p}_${Date.now()}_${Math.random().toString(36).slice(2,9)}`;

function openDB(){return new Promise((ok,no)=>{const r=indexedDB.open("snap_pop_rev10",1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains("state"))r.result.createObjectStore("state")};r.onsuccess=()=>{db=r.result;ok()};r.onerror=()=>no(r.error)})}
function get(k){return new Promise(ok=>{const r=db.transaction("state").objectStore("state").get(k);r.onsuccess=()=>ok(r.result)})}
function set(k,v){return new Promise((ok,no)=>{const r=db.transaction("state","readwrite").objectStore("state").put(v,k);r.onsuccess=()=>ok();r.onerror=()=>no(r.error)})}
function setMany(entries){return new Promise((ok,no)=>{const tx=db.transaction("state","readwrite"),store=tx.objectStore("state");entries.forEach(([k,v])=>store.put(v,k));tx.oncomplete=()=>ok();tx.onerror=()=>no(tx.error);tx.onabort=()=>no(tx.error)})}
function toast(t){$("#toast").textContent=t;$("#toast").classList.add("show");clearTimeout(window.tt);window.tt=setTimeout(()=>$("#toast").classList.remove("show"),1800)}
function show(id){$$(".view").forEach(v=>v.classList.remove("active"));$("#"+id).classList.add("active");const sub=["settings","shop","result","special"].includes(id);$("#nav").hidden=sub;if(!sub)lastMain=id;$$(".nav button").forEach(b=>b.classList.toggle("on",b.dataset.view===id));scrollTo(0,0);if(id==="records")renderRecords();if(id==="gems")renderGems();if(id==="growth")renderGrowth();if(id==="result")renderLastResult()}
function html(s){return (s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function levelFromExp(exp){let level=1;for(let i=1;i<LEVEL_THRESHOLDS.length;i++){if(exp>=LEVEL_THRESHOLDS[i])level=i+1;else break}return Math.min(25,level)}
function levelProgress(exp){const level=levelFromExp(exp);if(level>=25)return {level,within:1,remaining:0};const floor=LEVEL_THRESHOLDS[level-1],ceil=LEVEL_THRESHOLDS[level];return {level,within:Math.max(0,Math.min(1,(exp-floor)/(ceil-floor))),remaining:Math.max(0,ceil-exp)}}
function calcExp(answers,completedCount){
  const text=answers.join(" ").trim(),len=text.length;
  const initial=completedCount<5?12:completedCount<15?7:3;
  const strengths=[];let mastery=0;
  if(len>=80){mastery+=3;strengths.push("길게 이어 쓰기")}
  if(len>=150){mastery+=3;strengths.push("생각 충분히 펼치기")}
  if(/왜|이유|때문|느낌|기분|생각|아이디어|마음/.test(text)){mastery+=3;strengths.push("이유·감정·아이디어")}
  if(/보이|들리|냄새|향|맛|촉감|따뜻|차갑|밝|어둡|장면|풍경|소리/.test(text)){mastery+=3;strengths.push("감각·장면")}
  if(/[.!?。！？]/.test(text)){mastery+=2;strengths.push("문장 나누기")}
  mastery=Math.min(14,mastery);
  return {total:34+initial+mastery,base:34,initial,mastery,strengths};
}
async function loadSettings(){const s=await get("settings")||{};$("#autoRead").checked=!!s.autoRead;$("#reduceMotion").checked=!!s.reduceMotion;document.documentElement.classList.toggle("reduceMotion",!!s.reduceMotion)}
async function init(){await openDB();marks=await fetch("data/landmarks.json").then(r=>r.json());renderLandmarks();await loadSettings();await updateStatus();renderRecords();renderGems();renderGrowth();await renderIncomingHandoff();renderSpecialInvite();const active=await get("active");if(active)renderExplore(active)}

function renderLandmarks(){const host=$("#landmarks");host.innerHTML="";marks.forEach(m=>{const b=document.createElement("button");b.className="landmark";b.textContent=m.title;b.style.left=m.x+"%";b.style.top=m.y+"%";b.onclick=async()=>{selected=m;$$(".landmark").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");const a=await get("active"),g=await get("gems")||{};$("#selTitle").textContent=m.title;$("#selDesc").textContent=m.desc;$("#selProgress").textContent="진행 "+(a?.landmark===m.id?(Math.min(3,(a.step||0)+1)):0)+" / 3";$("#selShard").textContent="보석 조각 "+((g[m.id]||0)%6)+" / 6";$("#selection").hidden=false};host.appendChild(b)})}
$("#startBtn").onclick=async()=>{if(!selected)return;let s=await get("active");if(!s||s.landmark!==selected.id)s={id:uid("explore"),landmark:selected.id,step:0,answers:["","",""],startedAt:new Date().toISOString()};await set("active",s);renderExplore(s);show("explore");if($("#autoRead").checked)speak(STEPS[s.step][1]+" "+STEPS[s.step][2])}

function renderExplore(s){const m=marks.find(x=>x.id===s.landmark)||marks[0],i=Math.min(2,s.step||0);$("#exploreTitle").textContent="탐험 진행 · "+m.title;$("#question").textContent=STEPS[i][1];$("#hint").textContent=STEPS[i][2];$("#answer").value=s.answers[i]||"";$("#guideLine").textContent=["처음엔 작은 조각 하나면 충분해.","오, 그 생각 옆에 뭐가 더 숨어 있을까?","이제 네 문장으로 딱 묶어보자."][i];$("#nextBtn").textContent=i===2?"탐험 완료":"다음 단계";$("#steps").innerHTML=STEPS.map((x,n)=>`<span class="${n===i?"on":n<i?"done":""}">${n+1}. ${x[0]}</span>`).join("")}

$("#nextBtn").onclick=async()=>{
  let s=await get("active");
  if(!s){toast("지도에서 탐험지를 먼저 골라줘.");show("map");return}
  const i=s.step||0;s.answers[i]=$("#answer").value.trim();
  if(!s.answers[i])return toast("한 줄이라도 남겨볼까?");
  if(i<2){s.step=i+1;await set("active",s);renderExplore(s);return}
  const events=await get("completionEvents")||{};
  const completionEventId=s.completionEventId||`completion_${s.id}`;
  if(events[completionEventId]){await set("active",null);toast("이미 기록된 탐험이에요.");show("growth");return}
  const records=await get("records")||[];
  const expAward=calcExp(s.answers,records.length);
  const now=new Date().toISOString();
  const record={id:uid("record"),completionEventId,landmark:s.landmark,answers:[...s.answers],date:now,expAward:expAward.total,strengths:expAward.strengths};
  records.unshift(record);
  const gems=await get("gems")||{};gems[s.landmark]=(gems[s.landmark]||0)+1;
  const expLedger=await get("expLedger")||[];
  expLedger.push({eventId:completionEventId,type:"EXPLORATION_COMPLETE",amount:expAward.total,landmark:s.landmark,at:now,breakdown:expAward});
  const gemLedger=await get("gemLedger")||[];
  gemLedger.push({eventId:completionEventId,type:"SHARD_EARNED",landmark:s.landmark,amount:1,at:now});
  events[completionEventId]={at:now,recordId:record.id};
  const totalExp=expLedger.reduce((sum,e)=>sum+(Number(e.amount)||0),0);
  await setMany([["records",records],["gems",gems],["expLedger",expLedger],["gemLedger",gemLedger],["completionEvents",events],["exp",totalExp],["lastResult",record],["active",null]]);
  await updateStatus();
  window.dispatchEvent(new CustomEvent("snap-pop:task-completed",{detail:{completionEventId,landmark:s.landmark,exp:expAward.total}}));
  toast(`탐험 완료! +${expAward.total} EXP · 보석 조각 +1`);show("result")
}

function speak(t){if(!("speechSynthesis"in window))return toast("이 브라우저에서는 읽어주기를 지원하지 않아요.");speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang="ko-KR";speechSynthesis.speak(u)}
$("#answer").addEventListener("input",async()=>{const s=await get("active");if(!s)return;const i=Math.min(2,s.step||0);s.answers[i]=$("#answer").value;s.updatedAt=new Date().toISOString();await set("active",s)});
function currentBridgeContext(){try{return window.SnapPopBridge?.context?.()||{}}catch{return {}}}
async function renderIncomingHandoff(){const ctx=currentBridgeContext();const box=$("#handoffWord");if(!box)return;if(ctx.word){box.hidden=false;box.textContent=`Hide & Seek에서 찾은 단어 · ${ctx.word}${ctx.word_context?" · "+ctx.word_context:""}`}else box.hidden=true}
function cloudFragments(text){const t=(text||"").trim();const out=[];if(t)out.push(`장면: ${t.slice(0,32)}`);out.push("어디에서 일어났을까?","그때 어떤 기분이었을까?","무엇이 보이거나 들렸을까?","왜 그렇게 생각했을까?");return [...new Set(out)].slice(0,5)}
$("#cloudBtn").onclick=()=>{const panel=$("#cloudPanel"),chips=$("#cloudChips"),frags=cloudFragments($("#answer").value);chips.innerHTML=frags.map(x=>`<button type="button">${html(x)}</button>`).join("");panel.hidden=false;chips.onclick=e=>{const b=e.target.closest("button");if(!b)return;toast("좋아. 그 힌트를 참고해서 네 문장으로 이어가봐.")}};
$("#cloudClose").onclick=()=>$("#cloudPanel").hidden=true;
$("#listenBtn").onclick=async()=>{const s=await get("active");speak(STEPS[s?.step||0][1]+" "+STEPS[s?.step||0][2])}
$("#voiceBtn").onclick=()=>{const R=window.SpeechRecognition||window.webkitSpeechRecognition;if(!R)return toast("이 브라우저에서는 음성 인식을 지원하지 않아요.");const r=new R();r.lang="ko-KR";r.interimResults=false;$("#voiceBtn").textContent="듣고 있어요";r.onresult=e=>$("#answer").value+=(($("#answer").value?" ":"")+e.results[0][0].transcript);r.onend=()=>$("#voiceBtn").innerHTML='<img src="assets/icons/radio.svg" alt="">말해서 쓰기';r.start()}

async function renderRecords(){
  if(!db)return;
  const r=await get("records")||[], special=await get("specialMemories")||[];
  renderCalendar(r,special);
  const normalCards=r.map(x=>{const m=marks.find(z=>z.id===x.landmark);const strengths=(x.strengths||[]).slice(0,3).map(html).join(" · ");return `<article class="card" data-record-date="${x.date}"><b>${m?.title||"탐험"}</b><p>${x.answers.map(html).join(" ")}</p>${strengths?`<span class="kicker">오늘 발견한 글쓰기 힘 · ${strengths}</span><br>`:""}<span class="kicker">${new Date(x.date).toLocaleDateString("ko-KR")} · +${x.expAward||0} EXP</span></article>`});
  const specialCards=special.map(x=>`<article class="card specialMemory" data-record-date="${x.at}"><b>특별 탐험</b><p><strong>${html(x.prompt)}</strong><br>${html(x.text)}</p><span class="kicker">${new Date(x.at).toLocaleDateString("ko-KR")} · 선택 기록 · 보상/실패 없음</span></article>`);
  const all=[...normalCards,...specialCards];
  $("#recordList").innerHTML=all.length?all.join(""):'<article class="card"><b>첫 기록을 기다리고 있어요.</b><p>지도에서 탐험지를 골라 시작해봐요.</p></article>';
}
function renderCalendar(records,special=[]){
  const y=calendarCursor.getFullYear(),m=calendarCursor.getMonth(),first=new Date(y,m,1),days=new Date(y,m+1,0).getDate(),offset=first.getDay();
  $("#calTitle").textContent=`${y}년 ${m+1}월`;
  const count={},specialCount={};records.forEach(r=>{const d=new Date(r.date);if(d.getFullYear()===y&&d.getMonth()===m)count[d.getDate()]=(count[d.getDate()]||0)+1});special.forEach(r=>{const d=new Date(r.at);if(d.getFullYear()===y&&d.getMonth()===m)specialCount[d.getDate()]=(specialCount[d.getDate()]||0)+1});
  const today=new Date();let cells="";
  for(let i=0;i<offset;i++)cells+='<button class="blank" tabindex="-1"></button>';
  for(let d=1;d<=days;d++){const has=(count[d]||0)+(specialCount[d]||0)>0,isToday=today.getFullYear()===y&&today.getMonth()===m&&today.getDate()===d;cells+=`<button data-day="${d}" class="${has?"hasRecord ":""}${isToday?"today":""}" aria-label="${m+1}월 ${d}일${has?", 기록 있음":""}">${d}</button>`;}
  $("#calendarGrid").innerHTML=cells;
  $("#calendarGrid").onclick=e=>{const b=e.target.closest("button[data-day]");if(!b)return;const d=Number(b.dataset.day);const hit=records.find(r=>{const x=new Date(r.date);return x.getFullYear()===y&&x.getMonth()===m&&x.getDate()===d}),specialHit=special.find(r=>{const x=new Date(r.at);return x.getFullYear()===y&&x.getMonth()===m&&x.getDate()===d}),target=hit?.date||specialHit?.at;if(target){const el=document.querySelector(`[data-record-date="${target}"]`);el?.scrollIntoView({behavior:document.documentElement.classList.contains("reduceMotion")?"auto":"smooth",block:"center"})}else toast("이날은 아직 탐험 기록이 없어요.")};
}
async function renderGems(){if(!db)return;const g=await get("gems")||{};$("#gemRows").innerHTML=marks.map(m=>{const n=g[m.id]||0;return `<article class="gemRow"><div><b>${m.title}</b><span>보석 조각 ${n%6}/6</span></div><strong>완성 ${Math.floor(n/6)}</strong></article>`}).join("")}
async function renderGrowth(){if(!db)return;const cfg=await fetch("data/growth.json").then(r=>r.json()),exp=await get("exp")||0,p=levelProgress(exp);let stage=cfg[0];cfg.forEach(x=>{if(p.level>=x.min)stage=x});$("#growthLv").textContent="Lv."+p.level;$("#growthName").textContent=stage.name;$("#treeImage").src="assets/growth/"+stage.image;$("#expBar").style.width=(p.within*100)+"%";$("#expText").textContent=p.level>=25?`EXP ${exp} · 최고 성장 단계`:`EXP ${exp} · 다음 성장까지 ${p.remaining} EXP`}
async function renderGrowthTimeline(){const r=await get("records")||[],special=await get("specialMemories")||[],host=$("#growthTimeline"),events=[...r.map(x=>({kind:"normal",at:x.date,data:x})),...special.map(x=>({kind:"special",at:x.at,data:x}))].sort((a,b)=>new Date(b.at)-new Date(a.at));host.hidden=false;host.innerHTML=events.length?events.slice(0,20).map(e=>{if(e.kind==="special")return `<div class="timelineItem"><b>특별 탐험 기억</b><span>${new Date(e.at).toLocaleString("ko-KR")} · 선택 참여 · 보상/실패 없음</span></div>`;const x=e.data,m=marks.find(z=>z.id===x.landmark);return `<div class="timelineItem"><b>${m?.title||"탐험"} · +${x.expAward||0} EXP</b><span>${new Date(x.date).toLocaleString("ko-KR")}${x.strengths?.length?" · "+x.strengths.slice(0,2).map(html).join(" · "):""}</span></div>`}).join(""):'<div class="timelineItem"><b>첫 성장 기록을 기다리고 있어요.</b><span>탐험을 완료하면 여기에 시간이 쌓여요.</span></div>'}
async function renderLastResult(){const r=await get("lastResult");if(!r){$("#resultTitle").textContent="아직 완료한 탐험이 없어요.";$("#resultDraft").textContent="지도에서 탐험을 시작해봐요.";$("#resultExp").textContent="+0 EXP";$("#resultGem").textContent="보석 조각 +0";$("#resultStrengths").innerHTML="";return}const m=marks.find(x=>x.id===r.landmark);$("#resultTitle").textContent=m?.title||"오늘의 탐험";$("#resultDraft").textContent=r.answers.join(" ");$("#resultExp").textContent=`+${r.expAward||0} EXP`;$("#resultGem").textContent="보석 조각 +1";$("#resultStrengths").innerHTML=(r.strengths||[]).length?(r.strengths||[]).map(s=>`<span>${html(s)}</span>`).join(""):'<span>내 문장으로 끝까지 완성하기</span>'}
async function updateStatus(){const exp=await get("exp")||0,g=await get("gems")||{},lv=levelFromExp(exp),complete=Object.values(g).reduce((a,n)=>a+Math.floor(n/6),0);$("#levelChip").textContent="Lv."+lv;$("#gemChip").textContent="보석 "+complete}

$("#shopBtn").onclick=()=>show("shop");$("#useWish").onclick=()=>$("#blessing").hidden=false;
$("#confirmBlessing").onclick=async()=>{
  const txns=await get("wishTransactions")||[];
  if(txns.some(x=>x.status==="PENDING"))return toast("처리 중인 소원이 있어요.");
  const g={...(await get("gems")||{})};let needCompleted=2;const spend={};
  for(const m of marks){const complete=Math.floor((g[m.id]||0)/6);const take=Math.min(complete,needCompleted);if(take){spend[m.id]=take;g[m.id]-=take*6;needCompleted-=take}if(!needCompleted)break}
  if(needCompleted)return toast("완성 보석 2개가 필요해요.");
  const id=uid("wish_tx"),at=new Date().toISOString();
  txns.push({id,status:"COMPLETED",wish:"가족과 주말 영화 보기",spend,completedGemCount:2,at});
  await setMany([["gems",g],["wishTransactions",txns]]);await updateStatus();renderGems();$("#blessing").hidden=true;toast("축복을 사용했어요. 소원 사용 내역에 기록됐어요.")
}
function isWeekend(d=new Date()){const day=d.getDay();return day===0||day===6}
function specialPromptFor(d=new Date()){const seed=(d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate())%4;return [
 {q:"오늘 본 것 중 하나를 완전히 다른 물건처럼 설명해볼까?",h:"정답은 없어요. 네가 본 장면을 바꿔 상상해봐요."},
 {q:"오늘 가장 기억나는 소리를 이야기 속 단서로 바꿔볼까?",h:"소리에서 시작해서 장면을 하나 만들어봐요."},
 {q:"누군가의 입장에서 오늘 하루를 다시 보면 뭐가 달라질까?",h:"다른 시선 하나만 골라도 충분해요."},
 {q:"평범한 장소에 비밀 하나가 숨어 있다면 무엇일까?",h:"작은 이상함 하나를 네 이야기로 키워봐요."}
 ][seed]}
function renderSpecialInvite(){const invite=$("#specialInvite");if(!invite)return;invite.hidden=!isWeekend()}
async function openSpecial(){const p=specialPromptFor();$("#specialDate").textContent=new Date().toLocaleDateString("ko-KR");$("#specialPrompt").textContent=p.q;$("#specialHint").textContent=p.h;const draft=await get("specialDraft")||"";$("#specialAnswer").value=draft;show("special")}
$("#specialInvite").onclick=openSpecial;$("#specialBack").onclick=()=>show("map");$("#specialLater").onclick=()=>show("map");
$("#specialAnswer").addEventListener("input",()=>set("specialDraft",$("#specialAnswer").value));
$("#specialSave").onclick=async()=>{const text=$("#specialAnswer").value.trim();if(!text)return toast("한 줄이라도 네 생각을 남겨볼까?");const memories=await get("specialMemories")||[];const id=uid("special"),at=new Date().toISOString(),p=specialPromptFor(new Date(at));memories.unshift({id,at,prompt:p.q,text});await setMany([["specialMemories",memories],["specialDraft",""]]);$("#specialAnswer").value="";toast("특별 탐험 기억을 남겼어요.");show("records")};
$("#historyBtn").onclick=renderGrowthTimeline;$("#resultBack").onclick=()=>show("map");$("#resultRecords").onclick=()=>show("records");$("#resultGrowth").onclick=()=>show("growth");$("#calPrev").onclick=()=>{calendarCursor=new Date(calendarCursor.getFullYear(),calendarCursor.getMonth()-1,1);renderRecords()};$("#calNext").onclick=()=>{calendarCursor=new Date(calendarCursor.getFullYear(),calendarCursor.getMonth()+1,1);renderRecords()};
$("#settingsBtn").onclick=()=>show("settings");$("#settingsBack").onclick=()=>show(lastMain);$$("[data-back]").forEach(b=>b.onclick=()=>show(b.dataset.back));
$("#characterBtn").onclick=()=>toast("Character Master 원본 파이프라인은 승인 자산 연결 전까지 보존 상태예요.");
$("#guideBtn").onclick=()=>toast("현재 길잡이 디자인 계보는 유지하고 이름 변경은 별도 승인 후 연결해요.");
$("#homeRadio").onclick=()=>toast("탐험 안에서 말해서 쓰기를 사용할 수 있어요.");
$("#autoRead").onchange=$("#reduceMotion").onchange=async()=>{const s={autoRead:$("#autoRead").checked,reduceMotion:$("#reduceMotion").checked};await set("settings",s);document.documentElement.classList.toggle("reduceMotion",s.reduceMotion)}
$("#nav").onclick=e=>{const b=e.target.closest("button[data-view]");if(b)show(b.dataset.view)}
if("serviceWorker"in navigator)addEventListener("load",()=>navigator.serviceWorker.register("sw.js"));
init().catch(e=>{console.error(e);toast("앱 데이터를 준비하지 못했어요.")});
