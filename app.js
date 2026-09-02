const qs=s=>document.querySelector(s), qsa=s=>[...document.querySelectorAll(s)];
const DB_NAME='snap-pop-rev06', STORE='state';
let db, landmarks=[], selected=null, currentStep=0, lastView='map';
const prompts=[
 {title:'무엇이 떠올랐어?',hint:'완벽한 문장일 필요 없어. 먼저 떠오르는 걸 잡아보자.'},
 {title:'조금 더 넓혀볼까?',hint:'왜 그런지, 어떤 느낌인지, 무엇이 보였는지 한 가지 더 붙여보자.'},
 {title:'이제 표현을 완성해보자.',hint:'앞의 생각을 이어서 네 문장으로 마무리해보자.'}
];

function openDB(){return new Promise((resolve,reject)=>{const r=indexedDB.open(DB_NAME,1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(STORE))r.result.createObjectStore(STORE)};r.onsuccess=()=>{db=r.result;resolve(db)};r.onerror=()=>reject(r.error)})}
function dbGet(k){return new Promise((resolve,reject)=>{const t=db.transaction(STORE,'readonly').objectStore(STORE).get(k);t.onsuccess=()=>resolve(t.result);t.onerror=()=>reject(t.error)})}
function dbSet(k,v){return new Promise((resolve,reject)=>{const t=db.transaction(STORE,'readwrite').objectStore(STORE).put(v,k);t.onsuccess=()=>resolve();t.onerror=()=>reject(t.error)})}
function toast(msg){const t=qs('#toast');t.textContent=msg;t.classList.add('toast-show');setTimeout(()=>t.classList.remove('toast-show'),2200)}
function show(name){
  qsa('.view').forEach(v=>v.classList.remove('active'));
  qs(`#${name}View`).classList.add('active');
  qs('#bottomNav').hidden=name==='settings'||name==='wish';
  qsa('#bottomNav button').forEach(b=>b.classList.toggle('active',b.dataset.view===name));
  if(!['settings','wish'].includes(name)) lastView=name;
}
function stageForLevel(lv,data){let s=data.stages[0];for(const x of data.stages)if(lv>=x.minLevel)s=x;return s}
function levelFromEXP(exp){return Math.max(1,Math.floor(exp/120)+1)}

async function loadLandmarks(){
 landmarks=await fetch('./data/landmarks.json').then(r=>r.json());
 const layer=qs('#landmarkLayer');
 landmarks.forEach(x=>{const b=document.createElement('button');b.textContent=x.title;b.dataset.id=x.id;b.onclick=()=>selectLandmark(x,b);layer.appendChild(b)})
}
function selectLandmark(x,b){
 selected=x;qsa('.landmark-layer button').forEach(z=>z.classList.remove('selected'));b.classList.add('selected');
 qs('#landmarkName').textContent=x.title;qs('#landmarkDescription').textContent=x.description;qs('#landmarkArt').src=x.asset;qs('#landmarkSheet').hidden=false
}
async function startExploration(){
 if(!selected) selected=landmarks[0];
 currentStep=0;
 const session={state:'STEP_1_ACTIVE',landmarkId:selected.id,answers:['','',''],updatedAt:Date.now()};
 await dbSet('activeExploration',session);renderExplore(session);show('explore')
}
function renderExplore(session){
 const l=landmarks.find(x=>x.id===session.landmarkId)||landmarks[0];
 selected=l;currentStep=Math.min(2,Math.max(0,session.answers.findIndex((a,i)=>!a&&i<2)));
 if(currentStep<0)currentStep=2;
 qs('#exploreHeading').textContent=`탐험 진행 · ${l.title}`;
 qsa('.stepper button').forEach((b,i)=>b.classList.toggle('active',i===currentStep));
 qs('#questionTitle').textContent=prompts[currentStep].title;qs('#questionHint').textContent=prompts[currentStep].hint;
 qs('#writingField').value=session.answers[currentStep]||'';
 qs('#nextStepButton').textContent=currentStep===2?'탐험 완료':'다음 단계';
}
async function saveStepAndContinue(){
 let s=await dbGet('activeExploration'); if(!s){toast('먼저 탐험 장소를 골라줘.');show('map');return}
 s.answers[currentStep]=qs('#writingField').value.trim();s.updatedAt=Date.now();
 if(currentStep<2){currentStep++;s.state=`STEP_${currentStep+1}_ACTIVE`;await dbSet('activeExploration',s);renderExplore(s);return}
 s.state='REWARD_COMMITTING';await dbSet('activeExploration',s);
 const completionId=`${s.landmarkId}-${s.updatedAt}`;
 let commits=await dbGet('completionIds')||[];
 if(!commits.includes(completionId)){
   commits.push(completionId);await dbSet('completionIds',commits);
   let records=await dbGet('records')||[];records.unshift({id:completionId,date:new Date().toISOString(),landmarkId:s.landmarkId,answers:s.answers});await dbSet('records',records);
   let gems=await dbGet('gems')||{};gems[s.landmarkId]=(gems[s.landmarkId]||0)+1;await dbSet('gems',gems);
   let exp=await dbGet('exp')||0;exp+=55;await dbSet('exp',exp);
 }
 await dbSet('activeExploration',null);toast('탐험 완료! 보석 조각 1개를 기록했어.');await renderRecords();await renderGems();await renderGrowth();show('growth')
}
async function renderRecords(){
 const list=qs('#recordsList'),records=await dbGet('records')||[];list.innerHTML='';
 if(!records.length){list.innerHTML='<div class="record-card">아직 완성한 탐험이 없어요.</div>';return}
 records.forEach(r=>{const l=landmarks.find(x=>x.id===r.landmarkId);const d=document.createElement('div');d.className='record-card';d.innerHTML=`<b>${l?.title||'탐험 기록'}</b><small>${new Date(r.date).toLocaleDateString('ko-KR')}</small><p>${r.answers.filter(Boolean).join(' ')}</p>`;list.appendChild(d)})
}
async function renderGems(){
 const gems=await dbGet('gems')||{}, box=qs('#gemSummary');box.innerHTML='';
 landmarks.forEach(l=>{const n=gems[l.id]||0,complete=Math.floor(n/6),shards=n%6;const d=document.createElement('div');d.className='gem-card';d.innerHTML=`<b>${l.title.replace(/동굴|호수|숲|전망대|캠프/,'보석')}</b><span>조각 ${shards}/6 · 완성 ${complete}</span>`;box.appendChild(d)})
}
async function renderGrowth(){
 const cfg=await fetch('./data/growth-tree.json').then(r=>r.json()),exp=await dbGet('exp')||0,lv=levelFromEXP(exp),st=stageForLevel(lv,cfg);
 qs('#growthLevel').textContent=`Lv.${lv}`;qs('#growthName').textContent=st.name;qs('#growthTree').src=st.asset;qs('#growthExpText').textContent=`EXP ${exp}`;
 qs('#growthBar').style.width=`${Math.min(100,(exp%120)/120*100)}%`
}
async function confirmBlessing(){
 let tx=await dbGet('blessingTx')||[];const id=`wish-movie-${new Date().toISOString().slice(0,10)}`;
 if(tx.includes(id)){toast('오늘 이미 처리된 소원이에요.');return}
 let gems=await dbGet('gems')||{};let totalComplete=Object.values(gems).reduce((a,n)=>a+Math.floor(n/6),0);
 if(totalComplete<2){toast('완성 보석이 2개 필요해요.');return}
 let need=2;
 for(const k of Object.keys(gems)){while(need&&gems[k]>=6){gems[k]-=6;need--}}
 tx.push(id);await dbSet('gems',gems);await dbSet('blessingTx',tx);qs('#blessingPanel').hidden=true;toast('축복 사용을 기록했어요.');renderGems()
}
function speakCurrent(){
 if(!('speechSynthesis'in window)){toast('이 브라우저에서는 읽어주기를 사용할 수 없어요.');return}
 speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(`${prompts[currentStep].title} ${prompts[currentStep].hint}`);u.lang='ko-KR';speechSynthesis.speak(u)
}
function voiceInput(){
 const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!SR){toast('음성 인식을 지원하지 않아 직접 쓰기를 사용해줘.');return}
 const r=new SR();r.lang='ko-KR';r.interimResults=false;r.onstart=()=>toast('듣고 있어요…');r.onerror=()=>toast('음성 인식이 잘 안 됐어요. 직접 써도 괜찮아요.');r.onresult=e=>{qs('#writingField').value+=(qs('#writingField').value?' ':'')+e.results[0][0].transcript};r.start()
}
async function init(){
 await openDB();await loadLandmarks();await renderRecords();await renderGems();await renderGrowth();
 const active=await dbGet('activeExploration');if(active){renderExplore(active)}
 const auto=await dbGet('autoRead');qs('#autoRead').checked=!!auto;
 const rm=await dbGet('reduceMotion');qs('#reduceMotion').checked=!!rm;
}
qs('#settingsButton').onclick=()=>show('settings');qs('#settingsBack').onclick=()=>show(lastView);
qs('#closeLandmark').onclick=()=>{qs('#landmarkSheet').hidden=true;qsa('.landmark-layer button').forEach(z=>z.classList.remove('selected'))};
qs('#beginExploration').onclick=startExploration;qs('#nextStepButton').onclick=saveStepAndContinue;qs('#listenButton').onclick=speakCurrent;qs('#radioButton').onclick=voiceInput;
qs('#wishShopButton').onclick=()=>show('wish');qs('#useWishButton').onclick=()=>qs('#blessingPanel').hidden=false;qs('#cancelBlessing').onclick=()=>qs('#blessingPanel').hidden=true;qs('#confirmBlessing').onclick=confirmBlessing;
qs('#autoRead').onchange=e=>dbSet('autoRead',e.target.checked);qs('#reduceMotion').onchange=e=>dbSet('reduceMotion',e.target.checked);
qs('#bottomNav').onclick=e=>{const b=e.target.closest('button[data-view]');if(!b)return;show(b.dataset.view);if(b.dataset.view==='explore')dbGet('activeExploration').then(s=>{if(s)renderExplore(s);else toast('지도에서 탐험 장소를 먼저 골라줘.')})};
if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js'));
init().catch(e=>{console.error(e);toast('앱 데이터를 여는 중 문제가 생겼어요.')});
