const APP_KEY='ideaExpeditionV3';
const topicDefs={
1:{name:'아이디어 동굴',short:'아이디어',icon:'',gem:'amber',gemName:'아이디어 보석',unlock:1,hint:'새로운 소재를 발견하는 탐험',questions:[['오늘 가장 기억에 남는 장면은 무엇이었어?','한 장의 사진처럼 떠올려봐.'],['그 장면에서 가장 눈에 띈 것은 무엇이었어?','색깔, 모양, 소리도 좋아.'],['그 장면에 제목을 붙인다면 뭐라고 하고 싶어?','짧고 재미있는 제목이면 충분해.']]},
2:{name:'감정 호수',short:'감정',icon:'',gem:'ruby',gemName:'감정 보석',unlock:1,hint:'마음을 자세히 들여다보는 탐험',questions:[['오늘 가장 크게 느낀 감정은 무엇이었어?','기쁨, 속상함, 기대, 긴장 모두 좋아.'],['왜 그런 마음이 들었을까?','작은 이유 하나부터 찾아봐.'],['그 마음을 색이나 날씨로 표현하면?','비유하면 글이 더 생생해져.']]},
3:{name:'묘사 숲',short:'묘사',icon:'',gem:'emerald',gemName:'묘사 보석',unlock:1,hint:'오감으로 장면을 풍부하게 만드는 탐험',questions:[['장면 속에서 네 눈에 보인 것을 자세히 말해줘.','그림을 그리듯 적어봐.'],['그때 어떤 소리나 냄새가 있었어?','귀와 코로 기억을 찾아봐.'],['손으로 만진 느낌이나 몸의 느낌은 어땠어?','따뜻함, 차가움, 거침도 좋아.']]},
4:{name:'관점 전망대',short:'관점',icon:'',gem:'sapphire',gemName:'관점 보석',unlock:1,hint:'내 생각과 이유를 발견하는 탐험',questions:[['그 일에 대해 너는 어떻게 생각해?','좋다/싫다보다 이유를 같이 찾아봐.'],['반대편 사람은 어떻게 생각할 수 있을까?','다른 시선으로 한 번 바라봐.'],['그래도 네가 가장 중요하다고 생각하는 것은?','나만의 기준을 한 문장으로 적어봐.']]},
5:{name:'마무리 캠프',short:'마무리',icon:'',gem:'violet',gemName:'완성 보석',unlock:1,hint:'글을 멋지게 끝내는 탐험',questions:[['이 글에서 꼭 기억하고 싶은 한 문장은?','가장 중요한 마음을 골라봐.'],['앞으로 어떻게 해보고 싶어?','작은 계획도 멋진 마무리가 돼.'],['미래의 나에게 한마디를 남긴다면?','응원이나 다짐으로 끝내봐.']]}}
const levelNames=['첫발견 탐험가','연필 견습생','노트 길잡이','반짝 기록가','황금 지도꾼','나침반 탐험가','길 위의 기록가','지도 해독가','보물 추적자','별빛 항해사','원석 수집가','빛의 수집가','이야기 수집가','보석 연구가','전설 수집가','새싹 작가','문장 조율사','이야기 작가','빛나는 작가','황금펜 작가','별빛 대작가','왕관 대작가','전설의 대작가','마스터 대작가','위대한 대작가'];
const tierIcons=['tier-1','tier-2','tier-3','tier-4','tier-5'];
const tierNames=['견습 탐험가','길잡이','이야기 수집가','작가','대작가'];
function artSvg(kind){
 const common='viewBox="0 0 120 100" aria-hidden="true"';
 const svgs={
  bulb:`<svg ${common}><defs><radialGradient id="bg"><stop stop-color="#fff7bc"/><stop offset="1" stop-color="#f2b82d"/></radialGradient></defs><circle cx="60" cy="43" r="28" fill="url(#bg)" opacity=".26"/><path d="M43 37c0-14 8-24 18-24s18 10 18 24c0 10-5 15-10 20-3 3-4 6-4 10H55c0-4-1-7-4-10-5-5-8-10-8-20Z" fill="#f6c63f" stroke="#744719" stroke-width="4"/><path d="M53 69h16M54 76h14" stroke="#744719" stroke-width="4" stroke-linecap="round"/><path d="M60 0v8M92 15l-6 6M28 15l6 6M101 44h-9M28 44h-9" stroke="#efb82b" stroke-width="4" stroke-linecap="round"/></svg>`,
  heart:`<svg ${common}><path d="M60 84C43 70 20 54 20 33c0-14 10-23 22-23 9 0 15 5 18 11 4-6 10-11 19-11 12 0 22 9 22 23 0 21-24 37-41 51Z" fill="#e36c68" stroke="#7a3835" stroke-width="4"/><path d="M42 22c-7 2-10 7-10 14" fill="none" stroke="#ffd7c9" stroke-width="5" stroke-linecap="round" opacity=".8"/><path d="M60 21l-7 18 13 8-8 16" fill="none" stroke="#b84445" stroke-width="3"/></svg>`,
  leaf:`<svg ${common}><path d="M89 13C48 14 25 36 28 66c2 19 17 25 32 19 24-10 32-40 29-72Z" fill="#74a64f" stroke="#345b31" stroke-width="4"/><path d="M34 82c14-25 29-38 50-58M49 55l-15-4M59 43l-5-15M69 34l12 1" fill="none" stroke="#315c34" stroke-width="3" stroke-linecap="round"/></svg>`,
  telescope:`<svg ${common}><g transform="rotate(-14 60 48)"><path d="M31 37h53v17H31Z" fill="#386e82" stroke="#48351f" stroke-width="4"/><path d="M22 34h15v23H22Z" fill="#d49a49" stroke="#5a3a1f" stroke-width="4"/><path d="M82 39h16v13H82Z" fill="#d5a657" stroke="#5a3a1f" stroke-width="4"/></g><path d="M60 56 45 91M60 56l16 35M60 56v36" stroke="#61401f" stroke-width="5" stroke-linecap="round"/><circle cx="60" cy="56" r="5" fill="#c18b45"/></svg>`,
  tent:`<svg ${common}><path d="M20 80 57 19l43 61Z" fill="#c66b32" stroke="#663b22" stroke-width="4"/><path d="M57 19v61M57 80 71 55l15 25" stroke="#edb272" stroke-width="4"/><path d="M14 83h92" stroke="#533a26" stroke-width="4" stroke-linecap="round"/></svg>`,
  lantern:`<svg ${common}><path d="M45 20q15-17 30 0" fill="none" stroke="#4d3521" stroke-width="5"/><path d="M42 29h36l-5 51H47Z" fill="#d28d2e" stroke="#4d3521" stroke-width="4"/><path d="M51 39h18v31H51Z" fill="#ffd65b" stroke="#7a4c20" stroke-width="3"/><path d="M54 18h12v12H54Z" fill="#76502c"/></svg>`,
  backpack:`<svg ${common}><path d="M39 22q21-16 42 0l6 64H33Z" fill="#9b6033" stroke="#50321f" stroke-width="4"/><path d="M45 22v-8q15-9 30 0v8" fill="none" stroke="#50321f" stroke-width="4"/><path d="M42 48h36v24H42Z" fill="#b9793e" stroke="#50321f" stroke-width="3"/><path d="M33 39q-13 9-7 32M87 39q13 9 7 32" fill="none" stroke="#50321f" stroke-width="5"/></svg>`
 };
 return svgs[kind]||svgs.telescope;
}
function topicArtKind(id){return ({1:'bulb',2:'heart',3:'leaf',4:'telescope',5:'tent'})[id]||'telescope'}
const defaultData={name:'',xp:0,records:[],gems:{ruby:0,amber:0,emerald:0,sapphire:0,violet:0},calendarLinked:false,avatar:'',avatarMode:'real',avatarFilter:'warm',theme:'adventure'};
let data=loadData(), currentTopic=1, qIndex=0, answers=[], calendarCursor=new Date(), speech=null, googleTokenClient=null, googleAccessToken='';
function loadData(){try{const saved=JSON.parse(localStorage.getItem(APP_KEY)||'{}');return {...defaultData,...saved,gems:{...defaultData.gems,...(saved.gems||{})},records:Array.isArray(saved.records)?saved.records:[]}}catch{return {...defaultData,gems:{...defaultData.gems},records:[]}}}
function saveData(){try{localStorage.setItem(APP_KEY,JSON.stringify(data))}catch(e){console.error('localStorage save failed',e);showToast('사진 용량이 커서 저장하지 못했어. 다른 사진으로 다시 시도해줘.');return false}renderAll();return true}
function levelFromXp(xp){return Math.min(25,Math.floor(xp/100)+1)}
function levelProgress(xp){const level=levelFromXp(xp);if(level===25)return 100;return xp%100}
function tierForLevel(level){return Math.min(4,Math.floor((level-1)/5))}
function totalGems(){return Object.values(data.gems).reduce((a,b)=>a+b,0)}
function showToast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');clearTimeout(showToast.t);showToast.t=setTimeout(()=>t.classList.remove('show'),2600)}
function openScreen(id){if(document.getElementById('cameraModal')?.classList.contains('open'))closeCamera();document.body.dataset.screen=id;document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));document.getElementById(id)?.classList.add('active');const navMap={home:'home',records:'records',gems:'gems',levels:'levels',settings:null,report:null};document.querySelectorAll('.nav').forEach(n=>n.classList.toggle('on',navMap[id]===n.dataset.nav));document.getElementById('bottomNav').style.display=['register','question','report','detail'].includes(id)?'none':'flex';if(id==='records')renderRecords();if(id==='gems')renderGems();if(id==='levels')renderLevels();if(id==='settings')renderSettings()}
function beginAdventure(){if(!data.name){openScreen('register');return}renderTopics();openScreen('topics')}
function saveName(){const v=document.getElementById('nameInput').value.trim();if(!v)return showToast('탐험가 이름을 입력해줘!');data.name=v;saveData();renderTopics();openScreen('topics')}
function openNameModal(){document.getElementById('modalName').value=data.name;document.getElementById('nameModal').classList.add('show')}
function closeNameModal(){document.getElementById('nameModal').classList.remove('show')}
function updateName(){const v=document.getElementById('modalName').value.trim();if(!v)return;data.name=v;saveData();closeNameModal();showToast('탐험가 이름을 바꿨어!')}
function renderTopics(){document.getElementById('topicGrid').innerHTML=Object.entries(topicDefs).map(([id,t])=>`<button class="topic ${id==='5'?'wide':''}" onclick="startTopic(${id})"><span class="ico illustration">${artSvg(topicArtKind(Number(id)))}</span><strong>${t.name}</strong><small>${t.hint}</small></button>`).join('');document.getElementById('unlockNote').textContent='5가지 글쓰기 도움 중 지금 필요한 방법을 골라봐.'}
function startTopic(id){const t=topicDefs[id];if(!data.name){openScreen('register');return}currentTopic=id;qIndex=0;answers=[];renderQuestion();openScreen('question')}
function renderQuestion(){const t=topicDefs[currentTopic],q=t.questions[qIndex];document.getElementById('questLabel').textContent=`탐험 질문 ${qIndex+1}/3`;document.getElementById('questionArea').textContent=t.name;document.getElementById('questionIcon').innerHTML=qIndex===0?artSvg(topicArtKind(currentTopic)):artSvg(qIndex===1?'lantern':'backpack');document.getElementById('questionText').textContent=q[0];document.getElementById('questionHint').textContent=q[1];document.getElementById('answerInput').value='';document.getElementById('charCount').textContent='0';document.getElementById('nextAnswer').textContent=qIndex===2?'탐험 완료':'다음';for(let i=1;i<=3;i++){document.getElementById('dot'+i).classList.toggle('on',i<=qIndex+1);const s=document.getElementById('slot'+i);s.className='slot'+(i<=answers.length?' done':'');s.innerHTML=i<=answers.length?'<span class="tiny-gem"></span>':''}}
function submitAnswer(){const el=document.getElementById('answerInput'),v=el.value.trim();if(v.length<2)return showToast('조금만 더 적어볼까?');answers.push({q:topicDefs[currentTopic].questions[qIndex][0],a:v});data.xp+=5;if(qIndex<2){qIndex++;saveData();renderQuestion();return}finishAdventure()}
function composeFinal(){return answers.map(x=>x.a.replace(/[.!?]$/,'')).join('. ')+'!'}
function finishAdventure(){const t=topicDefs[currentTopic],before=levelFromXp(data.xp);data.xp+=40;data.gems[t.gem]=(data.gems[t.gem]||0)+1;const now=new Date();const rec={id:Date.now().toString(36),topicId:currentTopic,topic:t.name,gem:t.gem,gemName:t.gemName,date:now.toISOString(),answers:[...answers],final:composeFinal(),calendar:false};data.records.unshift(rec);saveData();const after=levelFromXp(data.xp);renderReport(rec,after>before);openScreen('report')}
function renderReport(rec,leveled){document.getElementById('reportDate').textContent=new Date(rec.date).toLocaleDateString('ko-KR');document.getElementById('reportName').textContent=data.name;document.getElementById('reportTopic').textContent=rec.topic;document.getElementById('reportFinal').textContent=rec.final;document.getElementById('reportGem').className=`gem big ${rec.gem}`;document.getElementById('rewardText').innerHTML=`<span class=\"reward-gem ${rec.gem}\"></span><b>${rec.gemName} +1</b><span class=\"reward-xp\">EXP +55</span>${leveled?'<span class=\"level-up-copy\">레벨 업 · '+levelNames[levelFromXp(data.xp)-1]+'</span>':''}`;document.getElementById('calendarBtn').dataset.recordId=rec.id}
async function saveReportImage(){const el=document.getElementById('reportCard');if(!window.html2canvas)return showToast('이미지 모듈을 불러오지 못했어.');const c=await html2canvas(el,{backgroundColor:'#0a3540',scale:2});const a=document.createElement('a');a.download=`${data.name}_탐험노트.png`;a.href=c.toDataURL('image/png');a.click()}
async function shareReport(){const el=document.getElementById('reportCard');if(!window.html2canvas)return;const c=await html2canvas(el,{backgroundColor:'#0a3540',scale:2});c.toBlob(async blob=>{if(!blob)return showToast('공유 이미지를 만들지 못했어.');const file=new File([blob],`${data.name}_탐험노트.png`,{type:'image/png'});if(navigator.canShare?.({files:[file]})){await navigator.share({files:[file],title:'탐험가의 아이디어 노트'}).catch(()=>{})}else{saveReportImage()}},'image/png')}
function setRecordView(v){document.getElementById('segList').classList.toggle('on',v==='list');document.getElementById('segCal').classList.toggle('on',v==='calendar');document.getElementById('recordList').style.display=v==='list'?'grid':'none';document.getElementById('calendarView').style.display=v==='calendar'?'block':'none';if(v==='calendar')renderCalendar()}
function renderRecords(){const box=document.getElementById('recordList');box.innerHTML=data.records.length?data.records.map(r=>`<button class="record" onclick="openDetail('${r.id}')"><div class="rec-gem"><div class="gem sm ${r.gem}"></div></div><div><strong>${r.topic}</strong><small>${new Date(r.date).toLocaleString('ko-KR',{month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'})}</small></div><span class="arrow">›</span></button>`).join(''):'<div class="paper" style="text-align:center">아직 탐험 기록이 없어.<br><small>첫 탐험을 시작해보자!</small></div>'}
function openDetail(id){const r=data.records.find(x=>x.id===id);if(!r)return;document.getElementById('detailPaper').innerHTML=`<small>${new Date(r.date).toLocaleString('ko-KR')}</small><h2>${r.topic}</h2><p>${r.final}</p>${r.answers.map((x,i)=>`<div class="qa"><b>${i+1}. ${x.q}</b><p>${x.a}</p></div>`).join('')}<button class="purple" style="margin-top:12px" data-record="${r.id}" onclick="saveRecordToCalendar('${r.id}')">Calendar에 저장</button>`;openScreen('detail')}
function changeMonth(n){calendarCursor=new Date(calendarCursor.getFullYear(),calendarCursor.getMonth()+n,1);renderCalendar()}
function renderCalendar(){const y=calendarCursor.getFullYear(),m=calendarCursor.getMonth();document.getElementById('calendarTitle').textContent=`${y}년 ${m+1}월`;const first=new Date(y,m,1).getDay(),days=new Date(y,m+1,0).getDate(),today=new Date();let h=['일','월','화','수','목','금','토'].map(x=>`<div class="dow">${x}</div>`).join('');for(let i=0;i<first;i++)h+='<div></div>';for(let d=1;d<=days;d++){const rs=data.records.filter(r=>{const x=new Date(r.date);return x.getFullYear()===y&&x.getMonth()===m&&x.getDate()===d});const ist=today.getFullYear()===y&&today.getMonth()===m&&today.getDate()===d;h+=`<button class="day ${rs.length?'has':''} ${ist?'today':''}" onclick="showDayRecords(${y},${m},${d})">${d}</button>`}document.getElementById('calendarGrid').innerHTML=h;document.getElementById('calendarDayRecords').innerHTML=''}
function showDayRecords(y,m,d){const rs=data.records.filter(r=>{const x=new Date(r.date);return x.getFullYear()===y&&x.getMonth()===m&&x.getDate()===d});document.getElementById('calendarDayRecords').innerHTML=rs.map(r=>`<button class="record" onclick="openDetail('${r.id}')"><div class="rec-gem"><div class="gem sm ${r.gem}"></div></div><div><strong>${r.topic}</strong><small>${r.final.slice(0,36)}…</small></div></button>`).join('')||'<small style="color:#735f3e">이 날의 기록은 없어.</small>'}
function renderGems(){
  const total=totalGems();
  document.getElementById('totalGems').textContent=total;
  const items=[['ruby','감정','감정의 빛'],['amber','아이디어','발상의 빛'],['emerald','묘사','장면의 빛'],['sapphire','관점','시선의 빛'],['violet','완성','완성의 빛']];
  document.getElementById('vaultRow').innerHTML=items.map(([g,n,sub])=>`<article class="gem-card ${g}"><img src="assets/gem-${g}-v12.svg" alt="${n} 보석"><div><strong>${n}</strong><small>${sub}</small></div><b>${data.gems[g]||0}</b></article>`).join('');
  const milestone=document.getElementById('gemMilestone');
  if(milestone){
    milestone.textContent=total>=25?'보관소의 모든 빛이 깨어났어요. 대작가의 길이 열렸습니다.':total>=10?'보석의 빛이 하나의 별자리를 만들기 시작했어요.':total>=5?'다섯 가지 빛을 모두 발견했어요. 다음 목표는 10개입니다.':total>0?`첫 발견 성공. ${5-total>0?5-total:0}개를 더 모으면 첫 수집 보상이 열려요.`:'첫 보석을 발견하면 보관소가 빛나기 시작해요.';
  }
  document.getElementById('recentGems').innerHTML=data.records.slice(0,5).map(r=>`<button class="recent-gem" onclick="openDetail('${r.id}')"><img src="assets/gem-${r.gem}-v12.svg" alt=""><span><strong>${r.gemName}</strong><small>${new Date(r.date).toLocaleDateString('ko-KR')}</small></span><i>기록 보기</i></button>`).join('')||'<div class="empty-state">아직 발견한 보석이 없어요. 첫 탐험을 완료해 보세요.</div>';
}
function renderLevels(){
  const lvl=levelFromXp(data.xp),tier=tierForLevel(lvl),progress=levelProgress(data.xp);
  document.getElementById('levelIcon').className='level-medal rank-art '+tierIcons[tier];
  document.getElementById('levelTitle').textContent=`Lv.${lvl} ${levelNames[lvl-1]}`;
  document.getElementById('levelDesc').textContent=[`첫 문장을 발견하는 ${tierNames[tier]}`,`지도를 넓혀가는 ${tierNames[tier]}`,`이야기를 보석처럼 모으는 ${tierNames[tier]}`,`나만의 문장을 만드는 ${tierNames[tier]}`,`세상을 글로 기록하는 ${tierNames[tier]}`][tier];
  document.getElementById('levelXpBar').style.width=progress+'%';
  document.getElementById('levelXpText').textContent=lvl===25?'최고 레벨 달성':`${progress} / 100 EXP · 다음 레벨까지 ${100-progress} EXP`;
  document.getElementById('rankList').innerHTML=levelNames.map((n,i)=>{
    const level=i+1, t=tierForLevel(level), state=level<lvl?'done':level===lvl?'current':'locked';
    return `<article class="growth-node ${state} ${i%2?'right':'left'}"><div class="growth-path-dot"><img src="assets/rank-tier-${t+1}-v12.svg" alt=""></div><div class="growth-card"><small>LEVEL ${String(level).padStart(2,'0')}</small><strong>${n}</strong><span>${state==='done'?'발견 완료':state==='current'?'현재 위치':`${i*100} EXP에서 해금`}</span></div></article>`;
  }).join('');
}
function applyTheme(theme){
  const next=theme==='storybook'?'storybook':'adventure';
  document.documentElement.dataset.theme=next;
  document.body.dataset.theme=next;
  const meta=document.querySelector('meta[name=\"theme-color\"]');
  if(meta)meta.setAttribute('content',next==='storybook'?'#7fc6b2':'#52c7d7');
  document.getElementById('themeAdventure')?.setAttribute('aria-pressed',String(next==='adventure'));
  document.getElementById('themeStorybook')?.setAttribute('aria-pressed',String(next==='storybook'));
}
function setTheme(theme){
  data.theme=theme==='storybook'?'storybook':'adventure';
  localStorage.setItem(APP_KEY,JSON.stringify(data));
  applyTheme(data.theme);
  renderThemeSetting();
  showToast(data.theme==='storybook'?'스토리북 탐험 테마로 바꿨어.':'판타지 어드벤처 테마로 바꿨어.');
}
function renderThemeSetting(){
  const theme=data.theme||'adventure';
  const a=document.getElementById('themeAdventure'),s=document.getElementById('themeStorybook');
  if(a)a.classList.toggle('on',theme==='adventure');
  if(s)s.classList.toggle('on',theme==='storybook');
}
function renderSettings(){document.getElementById('settingName').textContent=data.name||'미등록';document.getElementById('calendarStatus').textContent=data.calendarLinked?'연결됨':'연결 전';document.getElementById('calendarStatus').className=data.calendarLinked?'status-ok':'status-warn';renderThemeSetting()}
function renderAll(){applyTheme(data.theme||'adventure');const lvl=levelFromXp(data.xp),progress=levelProgress(data.xp);document.getElementById('hudName').textContent=data.name||'탐험가';document.getElementById('hudLevel').textContent=`Lv.${lvl} ${tierNames[tierForLevel(lvl)]}`;document.getElementById('hudXp').style.width=progress+'%';document.getElementById('hudGemCount').textContent=totalGems();document.getElementById('homeRankIcon').className='rank-art '+tierIcons[tierForLevel(lvl)];document.getElementById('homeRank').textContent=`Lv.${lvl} ${levelNames[lvl-1]}`;document.getElementById('homeNext').textContent=lvl===25?'대작가 최고 레벨 달성!':`다음 레벨까지 ${100-progress} EXP`;document.getElementById('homeXp').style.width=progress+'%';document.querySelectorAll('.map-node').forEach(n=>n.classList.remove('locked'));renderAvatarUI();renderSettings()}
function exportData(){const b=new Blob([JSON.stringify({app:'탐험가의 아이디어 노트',version:12,exportedAt:new Date().toISOString(),...data},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`idea-expedition-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(a.href)}
function toggleSpeech(){const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR)return showToast('이 브라우저에서는 음성입력을 지원하지 않아.');if(speech){speech.stop();speech=null;return}speech=new SR();speech.lang='ko-KR';speech.interimResults=false;document.getElementById('speechStatus').textContent='듣는 중...';speech.onresult=e=>{const el=document.getElementById('answerInput');el.value=(el.value+' '+e.results[0][0].transcript).trim().slice(0,220);document.getElementById('charCount').textContent=el.value.length};speech.onend=()=>{speech=null;document.getElementById('speechStatus').textContent='음성 입력 가능'};speech.onerror=()=>showToast('음성입력을 사용할 수 없었어.');speech.start()}
document.getElementById('answerInput').addEventListener('input',e=>document.getElementById('charCount').textContent=e.target.value.length);document.getElementById('nameInput').addEventListener('keydown',e=>{if(e.key==='Enter')saveName()});
function getClientId(){return window.APP_CONFIG?.GOOGLE_CLIENT_ID||''}
function initGoogleTokenClient(){if(!window.google?.accounts?.oauth2)throw new Error('Google 로그인 모듈이 아직 준비되지 않았습니다.');if(!getClientId())throw new Error('OAuth Client ID가 없습니다.');if(!googleTokenClient)googleTokenClient=google.accounts.oauth2.initTokenClient({client_id:getClientId(),scope:'https://www.googleapis.com/auth/calendar.events',callback:()=>{},error_callback:e=>console.error('Google OAuth popup error',e)});return googleTokenClient}
function requestGoogleToken(){return new Promise((resolve,reject)=>{try{const tc=initGoogleTokenClient();tc.callback=r=>{if(r.error)return reject(new Error(r.error));googleAccessToken=r.access_token;data.calendarLinked=true;saveData();resolve(r.access_token)};tc.requestAccessToken({prompt:googleAccessToken?'':'consent'})}catch(e){reject(e)}})}
async function connectGoogleCalendar(){try{await requestGoogleToken();showToast('Google Calendar 연결 완료!');renderSettings()}catch(e){console.error(e);showToast('연결 실패: Cloud Console의 허용 주소를 확인해줘.')}}
function calendarEventForRecord(r){const d=new Date(r.date),start=new Date(d),end=new Date(d.getTime()+30*60000);return {summary:`[아이디어 탐험] ${r.topic} · ${data.name}`,description:`${r.final}\n\n${r.answers.map((x,i)=>`${i+1}. ${x.q}\n${x.a}`).join('\n\n')}\n\n보석: ${r.gemName}`,start:{dateTime:start.toISOString()},end:{dateTime:end.toISOString()},visibility:'private'}}
async function insertCalendarEvent(r){if(!googleAccessToken)await requestGoogleToken();let res=await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events',{method:'POST',headers:{Authorization:`Bearer ${googleAccessToken}`,'Content-Type':'application/json'},body:JSON.stringify(calendarEventForRecord(r))});if(res.status===401){googleAccessToken='';await requestGoogleToken();res=await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events',{method:'POST',headers:{Authorization:`Bearer ${googleAccessToken}`,'Content-Type':'application/json'},body:JSON.stringify(calendarEventForRecord(r))})}if(!res.ok)throw new Error((await res.json()).error?.message||'Calendar 저장 실패');r.calendar=true;saveData();return res.json()}
async function saveRecordToCalendar(id){const r=data.records.find(x=>x.id===id);if(!r)return;try{await insertCalendarEvent(r);showToast('Google Calendar에 저장했어!')}catch(e){console.error(e);showToast('Calendar 저장 실패. 허용 주소와 권한을 확인해줘.')}}
async function saveToGoogleCalendar(){const id=document.getElementById('calendarBtn').dataset.recordId;return saveRecordToCalendar(id)}
window.addEventListener('DOMContentLoaded',()=>{document.body.dataset.screen='home';applyTheme(data.theme||'adventure');renderAll();renderTopics();renderRecords();renderGems();renderLevels();if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(console.warn);if(!data.name)setTimeout(()=>showToast('처음이라면 탐험가 이름부터 등록해줘!'),600)});


// --- Explorer camera/profile v7 ---
let cameraStream=null;
let cameraFacing='user';
let avatarMode=data.avatarMode||'real';
let avatarFilter=data.avatarFilter||'warm';
let pendingAvatar='';
let avatarBaseCanvas=document.createElement('canvas');
let avatarHasBase=false;

function renderAvatarUI(){
  const url=data.avatar||'';
  document.querySelectorAll('.portrait,.hud-avatar').forEach(el=>{
    if(url){
      el.style.backgroundImage=`url("${url}")`;
      el.classList.add('has-photo');
    }else{
      el.style.backgroundImage='';
      el.classList.remove('has-photo');
    }
  });
}

async function openCamera(){
  const modal=document.getElementById('cameraModal');
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
  document.body.classList.add('camera-open');
  resetCameraPreview();
  setAvatarMode(data.avatarMode||'real');
  setAvatarFilter(data.avatarFilter||'warm',document.querySelector(`.filter-chip[data-filter="${data.avatarFilter||'warm'}"]`));
  try{
    await startCamera();
  }catch(e){
    console.warn('camera unavailable',e);
    document.getElementById('cameraTip').textContent='카메라 권한을 허용하거나 앨범에서 사진을 선택해줘.';
    document.getElementById('cameraFallback').click();
  }
}

async function startCamera(){
  if(!navigator.mediaDevices?.getUserMedia)throw new Error('getUserMedia unsupported');
  if(cameraStream)cameraStream.getTracks().forEach(t=>t.stop());
  cameraStream=await navigator.mediaDevices.getUserMedia({
    video:{facingMode:cameraFacing,width:{ideal:1080},height:{ideal:1440}},
    audio:false
  });
  const video=document.getElementById('cameraVideo');
  video.srcObject=cameraStream;
  video.classList.remove('captured');
  document.getElementById('cameraCanvas').classList.remove('show');
  avatarHasBase=false;
  pendingAvatar='';
  previewCameraFilter();
}

function closeCamera(){
  if(cameraStream){cameraStream.getTracks().forEach(t=>t.stop());cameraStream=null}
  const modal=document.getElementById('cameraModal');
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
  document.body.classList.remove('camera-open');
}

async function switchCamera(){
  cameraFacing=cameraFacing==='user'?'environment':'user';
  try{await startCamera()}catch(e){showToast('카메라 전환을 사용할 수 없어.')}
}

function setAvatarMode(mode){
  avatarMode=mode;
  document.getElementById('realModeBtn').classList.toggle('on',mode==='real');
  document.getElementById('illustrationModeBtn').classList.toggle('on',mode==='illustration');
  document.getElementById('cameraTip').textContent=
    mode==='real'
    ?'얼굴 형태는 유지하고 색감·빛·탐험가 분위기만 더해.'
    :'얼굴 특징을 유지하며 색면과 윤곽을 부드럽게 정리해.';
  if(avatarHasBase){
    renderAvatarFromBase();
    buildFilterThumbnails();
  }else{
    previewCameraFilter();
  }
}

function setAvatarFilter(filter,btn){
  avatarFilter=filter;
  document.querySelectorAll('.filter-chip').forEach(x=>x.classList.toggle('on',x===btn || x.dataset.filter===filter));
  if(avatarHasBase){
    // This is the bug fix: re-render the already-captured source every time.
    renderAvatarFromBase();
  }else{
    previewCameraFilter();
  }
}

function cssFilterFor(filter){
  return {
    natural:'contrast(1.02) saturate(.98)',
    warm:'sepia(.13) saturate(1.13) contrast(1.035) brightness(1.025)',
    vintage:'sepia(.34) saturate(.82) contrast(1.085) brightness(.98)',
    forest:'sepia(.08) hue-rotate(14deg) saturate(1.09) contrast(1.04)',
    adventure:'sepia(.18) saturate(1.16) contrast(1.09) brightness(1.01)'
  }[filter]||'none';
}

function previewCameraFilter(){
  const v=document.getElementById('cameraVideo');
  v.style.filter=cssFilterFor(avatarFilter)+(avatarMode==='illustration'?' saturate(1.12) contrast(1.06)':'');
}

function copySourceToBase(source){
  const sw=source.videoWidth||source.naturalWidth||source.width;
  const sh=source.videoHeight||source.naturalHeight||source.height;
  if(!sw||!sh)return false;
  const size=640;
  avatarBaseCanvas.width=size;
  avatarBaseCanvas.height=size;
  const ctx=avatarBaseCanvas.getContext('2d',{willReadFrequently:true});
  ctx.clearRect(0,0,size,size);
  const side=Math.min(sw,sh);
  const sx=(sw-side)/2, sy=(sh-side)/2;
  // Mirror front camera so saved result matches preview.
  if(source.tagName==='VIDEO' && cameraFacing==='user'){
    ctx.save();ctx.translate(size,0);ctx.scale(-1,1);
    ctx.drawImage(source,sx,sy,side,side,0,0,size,size);
    ctx.restore();
  }else{
    ctx.drawImage(source,sx,sy,side,side,0,0,size,size);
  }
  avatarHasBase=true;
  return true;
}

function applyIllustrationEffect(ctx,w,h){
  const im=ctx.getImageData(0,0,w,h),d=im.data;
  // Gentle posterization only: preserves the person's geometry and facial landmarks.
  for(let i=0;i<d.length;i+=4){
    d[i]=Math.min(255,Math.round(d[i]/18)*18);
    d[i+1]=Math.min(255,Math.round(d[i+1]/18)*18);
    d[i+2]=Math.min(255,Math.round(d[i+2]/18)*18);
  }
  ctx.putImageData(im,0,0);
  ctx.globalCompositeOperation='soft-light';
  ctx.globalAlpha=.12;
  ctx.fillStyle='#d7a45a';
  ctx.fillRect(0,0,w,h);
  ctx.globalCompositeOperation='source-over';
  ctx.globalAlpha=1;
}

function renderToCanvas(targetCanvas,filter,mode,size=640){
  targetCanvas.width=size;targetCanvas.height=size;
  const ctx=targetCanvas.getContext('2d',{willReadFrequently:true});
  ctx.clearRect(0,0,size,size);
  ctx.filter=cssFilterFor(filter);
  ctx.drawImage(avatarBaseCanvas,0,0,size,size);
  ctx.filter='none';
  if(mode==='illustration')applyIllustrationEffect(ctx,size,size);

  // Subtle cinematic vignette, not face reshaping.
  const g=ctx.createRadialGradient(size*.5,size*.46,size*.27,size*.5,size*.5,size*.59);
  g.addColorStop(.55,'rgba(0,0,0,0)');
  g.addColorStop(1,'rgba(3,24,23,.38)');
  ctx.fillStyle=g;ctx.fillRect(0,0,size,size);

  // Thin brass portrait rim.
  ctx.strokeStyle='#d3a44d';
  ctx.lineWidth=Math.max(8,size*.018);
  ctx.beginPath();ctx.arc(size/2,size/2,size*.474,0,Math.PI*2);ctx.stroke();
}

function renderAvatarFromBase(){
  if(!avatarHasBase)return;
  const canvas=document.getElementById('cameraCanvas');
  renderToCanvas(canvas,avatarFilter,avatarMode,640);
  pendingAvatar=canvas.toDataURL('image/jpeg',.9);
  canvas.classList.add('show');
  document.getElementById('cameraVideo').classList.add('captured');
}

function buildFilterThumbnails(){
  if(!avatarHasBase)return;
  document.querySelectorAll('.filter-chip').forEach(btn=>{
    const filter=btn.dataset.filter;
    const c=document.createElement('canvas');
    renderToCanvas(c,filter,avatarMode,150);
    const preview=btn.querySelector('.filter-preview');
    if(preview)preview.style.backgroundImage=`url("${c.toDataURL('image/jpeg',.72)}")`;
  });
}

function captureAvatar(){
  const v=document.getElementById('cameraVideo');
  if(!v.videoWidth){
    document.getElementById('cameraFallback').click();
    return;
  }
  if(!copySourceToBase(v))return showToast('사진을 읽지 못했어.');
  renderAvatarFromBase();
  buildFilterThumbnails();
  document.getElementById('cameraTip').textContent='필터를 눌러 비교해봐. 촬영한 원본에서 매번 다시 적용돼.';
  showToast('촬영 완료! 아래 필터를 눌러 비교해봐.');
}

function saveAvatar(){
  if(!pendingAvatar)return showToast('먼저 사진을 찍거나 선택해줘!');
  data.avatar=pendingAvatar;
  data.avatarMode=avatarMode;
  data.avatarFilter=avatarFilter;
  if(!saveData())return;
  closeCamera();
  renderAvatarUI();
  showToast('탐험가 프로필을 저장했어!');
}

function loadAvatarFile(e){
  const file=e.target.files?.[0];
  if(!file)return;
  const img=new Image();
  const url=URL.createObjectURL(file);
  img.onload=()=>{
    if(!copySourceToBase(img)){URL.revokeObjectURL(url);return}
    URL.revokeObjectURL(url);
    const modal=document.getElementById('cameraModal');
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
    renderAvatarFromBase();
    buildFilterThumbnails();
    document.getElementById('cameraTip').textContent='앨범 사진을 불러왔어. 필터를 눌러 바로 비교할 수 있어.';
  };
  img.src=url;
  e.target.value='';
}

function resetCameraPreview(){
  pendingAvatar='';
  avatarHasBase=false;
  const c=document.getElementById('cameraCanvas');
  c.classList.remove('show');
  document.getElementById('cameraVideo').classList.remove('captured');
  document.querySelectorAll('.filter-preview').forEach(p=>p.style.backgroundImage='');
}

renderAvatarUI();
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.getElementById('cameraModal')?.classList.contains('open'))closeCamera()});
