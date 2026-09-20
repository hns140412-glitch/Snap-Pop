const $=q=>document.querySelector(q), $$=q=>[...document.querySelectorAll(q)];
let db, marks=[], selected=null, lastMain="map", calendarCursor=new Date();
const STEPS=["생각 꺼내기","생각 넓히기","표현 완성하기"];
const QUESTION_BANK={
 idea:{
  ko:[["무엇이 먼저 떠올랐어?","작은 소재 하나만 잡아보자."],["그 아이디어에서 더 궁금한 건 뭐야?","이유나 다음 장면 하나를 붙여봐."],["이제 네 아이디어를 한 문장으로 묶어볼까?","네 말투 그대로 끝내면 돼."]],
  en:[["What idea came to mind first?","A word or tiny idea is enough."],["What else could happen or connect to it?","Add one reason, detail, or next scene."],["Can you finish it in your own sentence?","Use your own words."]]
 },
 emotion:{
  ko:[["지금 떠오르는 마음은 뭐야?","감정 이름이 아니어도 괜찮아."],["왜 그런 마음이 들었을까?","사건이나 이유 하나만 이어봐."],["그 마음을 네 문장으로 표현해볼까?","평가 말고 네 느낌을 그대로 적어봐."]],
  en:[["What feeling comes to mind?","You do not need the perfect emotion word."],["What made you feel that way?","Add one event or reason."],["Can you express that feeling in your own sentence?","Keep it in your voice."]]
 },
 description:{
  ko:[["무엇이 가장 먼저 보였어?","색·모양·소리 중 하나만 골라도 돼."],["가까이 가면 무엇이 더 느껴질까?","보이는 것 말고 소리·냄새·촉감도 떠올려봐."],["그 장면이 보이게 한 문장으로 써볼까?","네가 실제로 느낀 단서를 넣어봐."]],
  en:[["What did you notice first?","Pick a color, shape, sound, or texture."],["What else would you notice up close?","Try a sound, smell, or feeling."],["Can you describe the scene in your own sentence?","Use details you noticed."]]
 },
 viewpoint:{
  ko:[["나는 이 일을 어떻게 보고 있어?","먼저 내 생각 하나를 잡아보자."],["다른 사람은 어떻게 볼 수 있을까?","반대일 필요는 없어. 다른 시선이면 돼."],["두 시선을 보고 네 생각을 정리해볼까?","이유 하나와 함께 네 입장을 써봐."]],
  en:[["How do you see this?","Start with your own view."],["How might someone else see it?","It can simply be a different view."],["Can you explain your view with one reason?","Write it in your own words."]]
 },
 final:{
  ko:[["지금 글에서 가장 살리고 싶은 부분은 뭐야?","핵심 하나를 골라보자."],["더 분명하게 고칠 곳이 있을까?","제목·순서·끝맺음 중 하나만 봐도 돼."],["이제 마지막 문장으로 마무리해볼까?","네 글의 느낌이 남도록 끝내봐."]],
  en:[["What part do you want to keep strongest?","Choose one key idea."],["What could be clearer?","Check the order, wording, or ending."],["Can you finish with your final sentence?","Make it sound like you."]]
 }
};
const LEVEL_NEEDS=[0,80,100,120,150,180,220,260,300,340,380,430,480,540,600,670,740,820,900,990,1080,1180,1280,1390,1500];
const LEVEL_THRESHOLDS=LEVEL_NEEDS.reduce((a,n,i)=>{a.push(i===0?0:a[i-1]+n);return a},[]);
const uid=p=>`${p}_${Date.now()}_${Math.random().toString(36).slice(2,9)}`;

function openDB(){return new Promise((ok,no)=>{const r=indexedDB.open("snap_pop_rev10",1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains("state"))r.result.createObjectStore("state")};r.onsuccess=()=>{db=r.result;ok()};r.onerror=()=>no(r.error)})}
function get(k){return new Promise(ok=>{const r=db.transaction("state").objectStore("state").get(k);r.onsuccess=()=>ok(r.result)})}
function set(k,v){return new Promise((ok,no)=>{const r=db.transaction("state","readwrite").objectStore("state").put(v,k);r.onsuccess=()=>ok();r.onerror=()=>no(r.error)})}
function setMany(entries){return new Promise((ok,no)=>{const tx=db.transaction("state","readwrite"),store=tx.objectStore("state");entries.forEach(([k,v])=>store.put(v,k));tx.oncomplete=()=>ok();tx.onerror=()=>no(tx.error);tx.onabort=()=>no(tx.error)})}
function toast(t){$("#toast").textContent=t;$("#toast").classList.add("show");clearTimeout(window.tt);window.tt=setTimeout(()=>$("#toast").classList.remove("show"),1800)}
function show(id){$$(".view").forEach(v=>v.classList.remove("active"));$("#"+id).classList.add("active");const sub=["settings","shop","result","special","recordEdit"].includes(id);$("#nav").hidden=sub;if(!sub)lastMain=id;$$(".nav button").forEach(b=>b.classList.toggle("on",b.dataset.view===id));scrollTo(0,0);if(id==="records")renderRecords();if(id==="gems")renderGems();if(id==="growth")renderGrowth();if(id==="result")renderLastResult()}
function html(s){return (s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function levelFromExp(exp){let level=1;for(let i=1;i<LEVEL_THRESHOLDS.length;i++){if(exp>=LEVEL_THRESHOLDS[i])level=i+1;else break}return Math.min(25,level)}
function levelProgress(exp){const level=levelFromExp(exp);if(level>=25)return {level,within:1,remaining:0};const floor=LEVEL_THRESHOLDS[level-1],ceil=LEVEL_THRESHOLDS[level];return {level,within:Math.max(0,Math.min(1,(exp-floor)/(ceil-floor))),remaining:Math.max(0,ceil-exp)}}
function calcExp(answers,completedCount,language="ko"){
  const text=answers.join(" ").trim(),len=text.length;
  const initial=completedCount<5?12:completedCount<15?7:3;
  const strengths=[];let mastery=0;
  if(len>=80){mastery+=3;strengths.push(language==="en"?"writing longer":"길게 이어 쓰기")}
  if(len>=150){mastery+=3;strengths.push(language==="en"?"expanding an idea":"생각 충분히 펼치기")}
  const reason=language==="en"?/because|think|feel|idea|reason|so/i:/왜|이유|때문|느낌|기분|생각|아이디어|마음/;
  const sensory=language==="en"?/see|saw|hear|heard|sound|smell|taste|touch|warm|cold|bright|dark|scene/i:/보이|들리|냄새|향|맛|촉감|따뜻|차갑|밝|어둡|장면|풍경|소리/;
  if(reason.test(text)){mastery+=3;strengths.push(language==="en"?"reason·feeling·idea":"이유·감정·아이디어")}
  if(sensory.test(text)){mastery+=3;strengths.push(language==="en"?"sensory detail":"감각·장면")}
  if(/[.!?。！？]/.test(text)){mastery+=2;strengths.push(language==="en"?"sentence control":"문장 나누기")}
  mastery=Math.min(14,mastery);
  return {total:34+initial+mastery,base:34,initial,mastery,strengths};
}
async function loadSettings(){const s=await get("settings")||{};$("#autoRead").checked=!!s.autoRead;$("#reduceMotion").checked=!!s.reduceMotion;document.documentElement.classList.toggle("reduceMotion",!!s.reduceMotion);$("#characterSummary").textContent=s.characterName?`탐험가 · ${s.characterName}`:"Character Master 기록 보존";$("#guideSummary").textContent=`말티푸 · ${s.guideName||"모카"}`;$("#characterName").value=s.characterName||"";$("#guideName").value=s.guideName||"모카"}
function promptFor(landmark,step,language="ko"){const bank=QUESTION_BANK[landmark]||QUESTION_BANK.idea;return (bank[language]||bank.ko)[Math.min(2,step)]}
function setModeButtons(language){$("#modeKo")?.classList.toggle("on",language!=="en");$("#modeEn")?.classList.toggle("on",language==="en")}
async function init(){await openDB();marks=await fetch("data/landmarks.json").then(r=>r.json());renderLandmarks();await loadSettings();await updateStatus();renderRecords();renderGems();renderGrowth();await renderIncomingHandoff();renderSpecialInvite();const active=await get("active");if(active)renderExplore(active)}

function renderLandmarks(){const host=$("#landmarks");host.innerHTML="";marks.forEach(m=>{const b=document.createElement("button");b.className="landmark";b.textContent=m.title;b.style.left=m.x+"%";b.style.top=m.y+"%";b.onclick=async()=>{selected=m;$$(".landmark").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");const a=await get("active"),g=await get("gems")||{};$("#selTitle").textContent=m.title;$("#selDesc").textContent=m.desc;$("#selProgress").textContent="진행 "+(a?.landmark===m.id?(Math.min(3,(a.step||0)+1)):0)+" / 3";$("#selShard").textContent="보석 조각 "+((g[m.id]||0)%6)+" / 6";$("#selection").hidden=false};host.appendChild(b)})}
$("#startBtn").onclick=async()=>{if(!selected)return;let s=await get("active");if(!s||s.landmark!==selected.id)s={id:uid("explore"),landmark:selected.id,step:0,answers:["","",""],language:"ko",startedAt:new Date().toISOString()};if(!s.language)s.language="ko";await set("active",s);renderExplore(s);show("explore");if($("#autoRead").checked){const p=promptFor(s.landmark,s.step,s.language);speak(p[0]+" "+p[1],s.language)}}

function renderExplore(s){const m=marks.find(x=>x.id===s.landmark)||marks[0],i=Math.min(2,s.step||0),language=s.language||"ko",p=promptFor(s.landmark,i,language);$("#exploreTitle").textContent="탐험 진행 · "+m.title;$("#question").textContent=p[0];$("#hint").textContent=p[1];$("#answer").value=s.answers[i]||"";setModeButtons(language);$("#guideLine").textContent=language==="en"?["Start small. One idea is enough.","Nice. Add one more piece.","Now finish it in your own words."][i]:["처음엔 작은 조각 하나면 충분해.","오, 그 생각 옆에 뭐가 더 숨어 있을까?","이제 네 문장으로 딱 묶어보자."][i];$("#nextBtn").textContent=i===2?(language==="en"?"Finish exploration":"탐험 완료"):(language==="en"?"Next step":"다음 단계");$("#steps").innerHTML=STEPS.map((x,n)=>`<span class="${n===i?"on":n<i?"done":""}">${n+1}. ${x}</span>`).join("")}

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
  const expAward=calcExp(s.answers,records.length,s.language||"ko");
  const now=new Date().toISOString();
  const record={id:uid("record"),completionEventId,landmark:s.landmark,language:s.language||"ko",answers:[...s.answers],date:now,expAward:expAward.total,strengths:expAward.strengths};
  records.unshift(record);
  const gems=await get("gems")||{},beforeShard=gems[s.landmark]||0;gems[s.landmark]=beforeShard+1;
  const expLedger=await get("expLedger")||[];
  expLedger.push({eventId:completionEventId,type:"EXPLORATION_COMPLETE",amount:expAward.total,landmark:s.landmark,at:now,breakdown:expAward});
  const gemLedger=await get("gemLedger")||[];
  gemLedger.push({eventId:completionEventId,type:"SHARD_EARNED",landmark:s.landmark,amount:1,at:now});
  if(Math.floor((beforeShard+1)/6)>Math.floor(beforeShard/6))gemLedger.push({eventId:completionEventId,type:"COMPLETE_GEM_CONVERTED",landmark:s.landmark,completedGemDelta:1,sourceShards:6,at:now});
  events[completionEventId]={at:now,recordId:record.id};
  const totalExp=expLedger.reduce((sum,e)=>sum+(Number(e.amount)||0),0);
  await setMany([["records",records],["gems",gems],["expLedger",expLedger],["gemLedger",gemLedger],["completionEvents",events],["exp",totalExp],["lastResult",record],["active",null]]);
  await updateStatus();
  window.dispatchEvent(new CustomEvent("snap-pop:task-completed",{detail:{completionEventId,landmark:s.landmark,exp:expAward.total}}));
  toast(`탐험 완료! +${expAward.total} EXP · 보석 조각 +1`);show("result")
}

function speak(t,language="ko"){if(!("speechSynthesis"in window))return toast("이 브라우저에서는 읽어주기를 지원하지 않아요.");speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang=language==="en"?"en-US":"ko-KR";speechSynthesis.speak(u)}
$("#answer").addEventListener("input",async()=>{const s=await get("active");if(!s)return;const i=Math.min(2,s.step||0);s.answers[i]=$("#answer").value;s.updatedAt=new Date().toISOString();await set("active",s)});
function currentBridgeContext(){try{return window.SnapPopBridge?.context?.()||{}}catch{return {}}}
async function renderIncomingHandoff(){const ctx=currentBridgeContext();const box=$("#handoffWord");if(!box)return;if(ctx.word){box.hidden=false;box.textContent=`Hide & Seek에서 찾은 단어 · ${ctx.word}${ctx.word_context?" · "+ctx.word_context:""}`}else box.hidden=true}
window.addEventListener("snap-pop:bridge-ready",renderIncomingHandoff);
function cloudFragments(text){const t=(text||"").trim();const out=[];if(t)out.push(`장면: ${t.slice(0,32)}`);out.push("어디에서 일어났을까?","그때 어떤 기분이었을까?","무엇이 보이거나 들렸을까?","왜 그렇게 생각했을까?");return [...new Set(out)].slice(0,5)}
$("#cloudBtn").onclick=()=>{const panel=$("#cloudPanel"),chips=$("#cloudChips"),frags=cloudFragments($("#answer").value);chips.innerHTML=frags.map(x=>`<button type="button">${html(x)}</button>`).join("");panel.hidden=false;chips.onclick=e=>{const b=e.target.closest("button");if(!b)return;toast("좋아. 그 힌트를 참고해서 네 문장으로 이어가봐.")}};
$("#cloudClose").onclick=()=>$("#cloudPanel").hidden=true;
$("#modeKo").onclick=async()=>{const s=await get("active");if(!s)return;s.language="ko";await set("active",s);renderExplore(s)};
$("#modeEn").onclick=async()=>{const s=await get("active");if(!s)return;s.language="en";await set("active",s);renderExplore(s)};
$("#listenBtn").onclick=async()=>{const s=await get("active");if(!s)return;const p=promptFor(s.landmark,s.step||0,s.language||"ko");speak(p[0]+" "+p[1],s.language||"ko")}
$("#voiceBtn").onclick=async()=>{const R=window.SpeechRecognition||window.webkitSpeechRecognition;if(!R)return toast("이 브라우저에서는 음성 인식을 지원하지 않아요.");const s=await get("active"),r=new R();r.lang=(s?.language||"ko")==="en"?"en-US":"ko-KR";r.interimResults=false;$("#voiceBtn").textContent=(s?.language||"ko")==="en"?"Listening":"듣고 있어요";r.onresult=e=>{$("#answer").value+=(($("#answer").value?" ":"")+e.results[0][0].transcript);$("#answer").dispatchEvent(new Event("input"))};r.onend=()=>$("#voiceBtn").innerHTML='<img src="assets/icons/radio.svg" alt="">말해서 쓰기';r.start()}

async function renderRecords(){
  if(!db)return;
  const r=await get("records")||[], special=await get("specialMemories")||[], revisions=await get("recordRevisions")||{};
  renderCalendar(r,special);
  const normalCards=r.map(x=>{const m=marks.find(z=>z.id===x.landmark),rev=(revisions[x.id]||[]),latest=rev.length?rev[rev.length-1].text:x.answers.join(" "),strengths=(x.strengths||[]).slice(0,3).map(html).join(" · ");return `<article class="card" data-record-date="${x.date}" data-record-id="${x.id}"><b>${m?.title||"탐험"}${x.language==="en"?" · English":""}</b><p>${html(latest)}</p>${rev.length?`<span class="kicker">수정본 ${rev.length}개 · 원문 보존</span><br>`:""}${strengths?`<span class="kicker">오늘 발견한 글쓰기 힘 · ${strengths}</span><br>`:""}<span class="kicker">${new Date(x.date).toLocaleDateString("ko-KR")} · +${x.expAward||0} EXP</span><div class="recordActions"><button class="soft recordEditBtn" data-record-id="${x.id}">기록 다듬기</button></div></article>`});
  const specialCards=special.map(x=>`<article class="card specialMemory" data-record-date="${x.at}"><b>특별 탐험</b><p><strong>${html(x.prompt)}</strong><br>${html(x.text)}</p><span class="kicker">${new Date(x.at).toLocaleDateString("ko-KR")} · 선택 기록 · 보상/실패 없음</span></article>`);
  const all=[...normalCards,...specialCards];
  $("#recordList").innerHTML=all.length?all.join(""):'<article class="card"><b>첫 기록을 기다리고 있어요.</b><p>지도에서 탐험지를 골라 시작해봐요.</p></article>';
  $(".recordEditBtn").forEach(b=>b.onclick=()=>openRecordEdit(b.dataset.recordId));
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
async function renderLastResult(){const r=await get("lastResult");if(!r){$("#resultTitle").textContent="아직 완료한 탐험이 없어요.";$("#resultDraft").textContent="지도에서 탐험을 시작해봐요.";$("#resultExp").textContent="+0 EXP";$("#resultGem").textContent="보석 조각 +0";$("#resultStrengths").innerHTML="";$("#bonusStart").disabled=true;return}const m=marks.find(x=>x.id===r.landmark),bonusEvents=await get("bonusEvents")||{};$("#resultTitle").textContent=m?.title||"오늘의 탐험";$("#resultDraft").textContent=r.answers.join(" ");$("#resultExp").textContent=`+${r.expAward||0} EXP`;$("#resultGem").textContent="보석 조각 +1";$("#resultStrengths").innerHTML=(r.strengths||[]).length?(r.strengths||[]).map(s=>`<span>${html(s)}</span>`).join(""):'<span>내 문장으로 끝까지 완성하기</span>';const done=!!bonusEvents[`bonus_${r.completionEventId}`];$("#bonusStart").disabled=done;$("#bonusStart").textContent=done?"추가 연습 완료됨":"추가 연습";$("#bonusPanel").hidden=true}
async function updateStatus(){const exp=await get("exp")||0,g=await get("gems")||{},lv=levelFromExp(exp),complete=Object.values(g).reduce((a,n)=>a+Math.floor(n/6),0);$("#levelChip").textContent="Lv."+lv;$("#gemChip").textContent="보석 "+complete}
async function openRecordEdit(recordId){const records=await get("records")||[],revisions=await get("recordRevisions")||{},r=records.find(x=>x.id===recordId);if(!r)return toast("기록을 찾지 못했어요.");const list=revisions[recordId]||[],original=r.answers.join(" "),latest=list.length?list[list.length-1].text:original;$("#recordEdit").dataset.recordId=recordId;$("#recordEditMeta").textContent=`원문 ${new Date(r.date).toLocaleString("ko-KR")} · EXP/보상은 수정되지 않음`;$("#recordEditText").value=latest;$("#recordRevisionList").innerHTML=`<div class="timelineItem"><b>원문</b><span>${html(original)}</span></div>`+list.map((x,i)=>`<div class="timelineItem"><b>수정본 ${i+1}</b><span>${new Date(x.at).toLocaleString("ko-KR")} · ${html(x.text)}</span></div>`).join("");show("recordEdit")}
async function renderWishHistory(){const txns=await get("wishTransactions")||[],host=$("#wishHistoryList");host.hidden=false;host.innerHTML=txns.length?[...txns].reverse().map(x=>`<div class="timelineItem"><b>${html(x.wish||"소원")} · 완성 보석 ${x.completedGemCount||0}개</b><span>${new Date(x.at).toLocaleString("ko-KR")} · ${x.status==="COMPLETED"?"사용 완료":html(x.status)}</span></div>`).join(""):'<div class="timelineItem"><b>아직 사용한 소원이 없어요.</b><span>축복을 확정하면 여기에 사용 내역이 남아요.</span></div>'}

$("#shopBtn").onclick=()=>show("shop");$("#useWish").onclick=()=>$("#blessing").hidden=false;
$("#confirmBlessing").onclick=async()=>{
  const txns=await get("wishTransactions")||[];
  if(txns.some(x=>x.status==="PENDING"))return toast("처리 중인 소원이 있어요.");
  const g={...(await get("gems")||{})},gemLedger=await get("gemLedger")||[];let needCompleted=2;const spend={};
  for(const m of marks){const complete=Math.floor((g[m.id]||0)/6);const take=Math.min(complete,needCompleted);if(take){spend[m.id]=take;g[m.id]-=take*6;needCompleted-=take}if(!needCompleted)break}
  if(needCompleted)return toast("완성 보석 2개가 필요해요.");
  const id=uid("wish_tx"),at=new Date().toISOString();
  Object.entries(spend).forEach(([landmark,count])=>gemLedger.push({eventId:id,type:"GEM_SPENT",landmark,completedGemDelta:-count,sourceShards:-count*6,at,reason:"WISH_BLESSING"}));
  txns.push({id,status:"COMPLETED",wish:"가족과 주말 영화 보기",spend,completedGemCount:2,at});
  await setMany([["gems",g],["gemLedger",gemLedger],["wishTransactions",txns]]);await updateStatus();renderGems();$("#blessing").hidden=true;if(!$("#wishHistoryList").hidden)renderWishHistory();toast("축복을 사용했어요. 소원 사용 내역에 기록됐어요.")
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
$("#bonusStart").onclick=async()=>{const r=await get("lastResult");if(!r)return;const bonusEvents=await get("bonusEvents")||{},bonusEventId=`bonus_${r.completionEventId}`;if(bonusEvents[bonusEventId])return toast("이미 완료한 추가 연습이에요.");const prompts={idea:"같은 아이디어로 다른 시작 문장 하나를 만들어볼까?",emotion:"같은 마음을 다른 말로 한 문장 표현해볼까?",description:"오감 하나를 더 넣어 장면을 한 문장 늘려볼까?",viewpoint:"다른 시선에서 한 문장만 더 써볼까?",final:"제목이나 마지막 문장 중 하나를 새로 다듬어볼까?"};$("#bonusQuestion").textContent=prompts[r.landmark]||"한 문장 더 만들어볼까?";$("#bonusAnswer").value="";$("#bonusPanel").hidden=false};
$("#bonusSave").onclick=async()=>{const r=await get("lastResult");if(!r)return;const text=$("#bonusAnswer").value.trim();if(!text)return toast("한 문장만 더 남겨볼까?");const bonusEvents=await get("bonusEvents")||{},bonusEventId=`bonus_${r.completionEventId}`;if(bonusEvents[bonusEventId])return toast("이미 완료한 추가 연습이에요.");const gems=await get("gems")||{},gemLedger=await get("gemLedger")||[],beforeShard=gems[r.landmark]||0,at=new Date().toISOString();gems[r.landmark]=beforeShard+1;gemLedger.push({eventId:bonusEventId,type:"BONUS_SHARD_EARNED",landmark:r.landmark,amount:1,at});if(Math.floor((beforeShard+1)/6)>Math.floor(beforeShard/6))gemLedger.push({eventId:bonusEventId,type:"COMPLETE_GEM_CONVERTED",landmark:r.landmark,completedGemDelta:1,sourceShards:6,at});bonusEvents[bonusEventId]={at,landmark:r.landmark,text};await setMany([["gems",gems],["gemLedger",gemLedger],["bonusEvents",bonusEvents]]);await updateStatus();$("#bonusPanel").hidden=true;$("#bonusStart").disabled=true;$("#bonusStart").textContent="추가 연습 완료됨";toast("추가 연습 완료! 보석 조각 +1 · EXP 추가 없음")};
$("#recordEditBack").onclick=()=>show("records");
$("#recordEditSave").onclick=async()=>{const recordId=$("#recordEdit").dataset.recordId,text=$("#recordEditText").value.trim();if(!recordId||!text)return toast("수정할 내용을 남겨줘.");const records=await get("records")||[],r=records.find(x=>x.id===recordId);if(!r)return toast("기록을 찾지 못했어요.");const revisions=await get("recordRevisions")||{},list=revisions[recordId]||[],current=list.length?list[list.length-1].text:r.answers.join(" ");if(text===current)return toast("바뀐 내용이 없어요.");list.push({id:uid("revision"),at:new Date().toISOString(),text,source:"CHILD_EDIT",originalPreserved:true});revisions[recordId]=list;await set("recordRevisions",revisions);toast("수정본을 저장했어요. 원문은 그대로 보존돼요.");openRecordEdit(recordId)};
$("#wishHistoryBtn").onclick=renderWishHistory;
$("#historyBtn").onclick=renderGrowthTimeline;$("#resultBack").onclick=()=>show("map");$("#resultRecords").onclick=()=>show("records");$("#resultGrowth").onclick=()=>show("growth");$("#calPrev").onclick=()=>{calendarCursor=new Date(calendarCursor.getFullYear(),calendarCursor.getMonth()-1,1);renderRecords()};$("#calNext").onclick=()=>{calendarCursor=new Date(calendarCursor.getFullYear(),calendarCursor.getMonth()+1,1);renderRecords()};
$("#settingsBtn").onclick=()=>show("settings");$("#settingsBack").onclick=()=>show(lastMain);$$("[data-back]").forEach(b=>b.onclick=()=>show(b.dataset.back));
$("#characterBtn").onclick=()=>$("#characterPanel").hidden=!$("#characterPanel").hidden;
$("#guideBtn").onclick=()=>$("#guidePanel").hidden=!$("#guidePanel").hidden;
$("#characterSave").onclick=async()=>{const name=$("#characterName").value.trim();const s=await get("settings")||{};s.characterName=name;await set("settings",s);$("#characterSummary").textContent=name?`탐험가 · ${name}`:"Character Master 기록 보존";$("#characterPanel").hidden=true;toast("캐릭터 표시 이름을 저장했어요. 승인 자산은 바꾸지 않았어요.")};
$("#guideSave").onclick=async()=>{const name=$("#guideName").value.trim()||"모카";const s=await get("settings")||{};s.guideName=name;await set("settings",s);$("#guideSummary").textContent=`말티푸 · ${name}`;$(".guideLine b").forEach(el=>el.textContent=`길잡이 ${name}`);$("#guidePanel").hidden=true;toast("길잡이 이름을 저장했어요.")};
$("#homeRadio").onclick=()=>toast("탐험 안에서 말해서 쓰기를 사용할 수 있어요.");
$("#autoRead").onchange=$("#reduceMotion").onchange=async()=>{const s=await get("settings")||{};s.autoRead=$("#autoRead").checked;s.reduceMotion=$("#reduceMotion").checked;await set("settings",s);document.documentElement.classList.toggle("reduceMotion",s.reduceMotion)}
$("#nav").onclick=e=>{const b=e.target.closest("button[data-view]");if(b)show(b.dataset.view)}
if("serviceWorker"in navigator)addEventListener("load",()=>navigator.serviceWorker.register("sw.js"));
init().catch(e=>{console.error(e);toast("앱 데이터를 준비하지 못했어요.")});
