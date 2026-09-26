(() => {
  'use strict';

  // Child-only, read-only UI. Never import app.js IndexedDB exploration counts
  // as achievements. The real trusted server reader is not connected by default.
  const VIEWER='TAKY_AUTHENTICATED_CHILD_BADGE_VIEWER_V1';
  const MONTH='TAKY_CHILD_BADGE_CALENDAR_V1';
  const DETAIL='TAKY_FAMILY_BADGE_DETAIL_HISTORY_V1';
  const COLLECTION='TAKY_CHILD_APPROVED_BADGE_COLLECTION_V1';
  const ADAPTER='TAKY_AUTHENTICATED_BADGE_READ_ADAPTER_V1';
  const TZ='Asia/Seoul';
  const EVENT_LABEL={FIRST_ACQUISITION:'첫 획득',REACQUISITION:'다시 만난 훈장',TIER_PROMOTION:'새 티어 달성'};
  const $=s=>document.querySelector(s);
  const clean=v=>typeof v==='string'?v.trim():'';
  const dateKey=v=>typeof v==='string'&&/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(v);
  const monthKey=v=>typeof v==='string'&&/^\d{4}-(0[1-9]|1[0-2])$/.test(v);
  const make=(tag,className,text)=>{
    const el=document.createElement(tag);if(className)el.className=className;
    if(text!==undefined)el.textContent=text;return el;
  };
  function kstMonth(){
    const p=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{
      timeZone:TZ,year:'numeric',month:'2-digit'
    }).formatToParts(new Date()).filter(x=>x.type!=='literal').map(x=>[x.type,x.value]));
    return p.year+'-'+p.month;
  }
  let adapter=null,revision=0,mode='journal',month=kstMonth(),selectedDate=null,viewer=null,lastMonth=null;
  function panels(next){
    mode=next;
    for(const [id,key] of [
      ['recordJournalPanel','journal'],['badgeCollectionPanel','collection'],
      ['badgeCalendarPanel','calendar'],['badgeDetailPanel','detail']
    ]){const panel=$('#'+id);if(panel)panel.hidden=key!==next;}
    document.querySelectorAll('[data-record-mode]').forEach(el=>{
      const on=el.dataset.recordMode===next;
      el.classList.toggle('on',on);el.setAttribute('aria-selected',String(on));
    });
  }
  function notice(host,message){
    host?.replaceChildren(make('p','badgeReadNotice',message));
  }
  function clearPrivate(){
    lastMonth=null;viewer=null;selectedDate=null;
    notice($('#badgeCollectionItems'),'인증된 배지 기록 연결 전이에요.');
    notice($('#badgeCalendarGrid'),'인증된 획득 기록 연결 전이에요.');
    $('#badgeCalendarDay')?.replaceChildren();
    $('#badgeCalendarUndated')?.replaceChildren();
    $('#badgeDetailHistory')?.replaceChildren();
    if($('#badgeDetailTitle'))$('#badgeDetailTitle').textContent='획득 기록';
  }
  function disconnect(){
    revision++;adapter=null;clearPrivate();panels('journal');
    return {ok:true};
  }
  function connectReadAdapter(input){
    if(!input||input.contract!==ADAPTER||
       ['getViewer','getCollection','getMonth','getBadgeHistory'].some(k=>typeof input[k]!=='function'))
      return {ok:false,reason:'TRUSTED_SERVER_READ_ADAPTER_REQUIRED'};
    revision++;clearPrivate();adapter=input;
    if(mode==='collection'||mode==='calendar')void open(mode);
    return {ok:true,contract:ADAPTER};
  }
  async function identity(ticket){
    if(!adapter)return null;
    let result;
    try{result=await adapter.getViewer()}catch{return null}
    if(ticket!==revision||result?.ok!==true||result.contract!==VIEWER||
       result.authenticated!==true||result.role!=='CHILD'||
       result.source!=='NETLIFY_IDENTITY'||!clean(result.family_id)||
       !clean(result.child_id))return null;
    viewer={family_id:result.family_id,child_id:result.child_id};
    return viewer;
  }
  const sameScope=(result,who)=>!!result&&result.family_id===who.family_id&&result.child_id===who.child_id;
  function validateMonth(data,who,key){
    if(data?.ok!==true||data.contract!==MONTH||data.time_zone!==TZ||
       data.month!==key||!sameScope(data,who)||!Array.isArray(data.days))return false;
    const ids=new Set,dates=new Set;
    for(const day of data.days){
      if(!day||!dateKey(day.date)||day.date.slice(0,7)!==key||
         dates.has(day.date)||!Array.isArray(day.events)||day.award_count!==day.events.length)return false;
      dates.add(day.date);
      for(const event of day.events){
        if(!clean(event.award_id)||ids.has(event.award_id)||!clean(event.badge_id)||
           event.calendar_date!==day.date||!Object.hasOwn(EVENT_LABEL,event.event_type)||
           event.date_status!=='VERIFIED_AWARD_TIME')return false;
        ids.add(event.award_id);
      }
    }
    if(!Array.isArray(data.undated_history))return false;
    return true;
  }
  async function open(next){
    if(!['journal','collection','calendar'].includes(next))return {ok:false,reason:'UNKNOWN_RECORD_MODE'};
    revision++;const ticket=revision;panels(next);
    if(next==='journal')return {ok:true};
    const host=next==='collection'?$('#badgeCollectionItems'):$('#badgeCalendarGrid');
    if(!adapter){notice(host,'배지 기록 서버 연결 전이에요. 실제 획득 기록만 표시해요.');return {ok:false,reason:'SERVER_READ_ADAPTER_NOT_CONNECTED'}}
    notice(host,'확인된 기록을 살펴보고 있어요.');
    const who=await identity(ticket);
    if(ticket!==revision)return {ok:false,reason:'SUPERSEDED'};
    if(!who){notice(host,'인증된 아이의 배지 기록을 확인할 수 없어요.');return {ok:false,reason:'AUTHENTICATED_CHILD_VIEWER_REQUIRED'}}
    if(next==='collection')return loadCollection(ticket,who);
    return loadMonth(ticket,who);
  }
  async function loadCollection(ticket,who){
    let result;
    try{result=await adapter.getCollection()}catch{}
    if(ticket!==revision)return {ok:false,reason:'SUPERSEDED'};
    const host=$('#badgeCollectionItems');
    if(result?.ok!==true||result.contract!==COLLECTION||!sameScope(result,who)||
       !Array.isArray(result.items)||result.items.length>100||
       result.items.some(x=>!clean(x.badge_id)||!clean(x.title)||
         x.active!==true||x.approved!==true||typeof x.earned!=='boolean')||
       new Set(result.items.map(x=>x.badge_id)).size!==result.items.length){
      notice(host,'승인된 도감과 획득 이력을 확인할 수 없어요.');
      return {ok:false,reason:'APPROVED_CHILD_COLLECTION_REQUIRED'};
    }
    host.replaceChildren();
    if(!result.items.length){notice(host,'승인된 도감이 아직 준비되지 않았어요.');return {ok:true,count:0}}
    for(const item of result.items){
      const card=make('article','badgeCollectionItem');
      const outline=make('span','badgeCollectionOutline',item.earned?'기록':'미획득');
      outline.setAttribute('aria-hidden','true');
      const content=make('div','badgeCollectionInfo');
      content.append(make('b',null,item.title),
        make('small',null,item.earned?'내가 획득한 훈장':'아직 만나지 않은 훈장'));
      card.append(outline,content);
      if(item.earned){
        const btn=make('button','badgeHistoryOpen','획득 이력');
        btn.type='button';btn.onclick=()=>void detail(item.badge_id,item.title);
        card.append(btn);
      }
      host.append(card);
    }
    return {ok:true,count:result.items.length};
  }
  function calendarCells(data,ticket){
    const grid=$('#badgeCalendarGrid');grid.replaceChildren();
    for(const label of ['월','화','수','목','금','토','일'])grid.append(make('span','badgeWeekday',label));
    const [year,mon]=month.split('-').map(Number);
    const first=new Date(Date.UTC(year,mon-1,1)).getUTCDay();
    for(let i=0;i<(first+6)%7;i++)grid.append(make('span','badgeCalendarBlank',''));
    for(const day of data.days){
      const d=Number(day.date.slice(-2));
      const b=make('button','badgeCalendarCell'+(selectedDate===day.date?' chosen':''),String(d));
      b.type='button';b.dataset.badgeDay=day.date;
      if(day.events.length)b.append(make('span','badgeDayCount','훈장 '+day.events.length));
      b.onclick=()=>{if(ticket!==revision)return;selectedDate=day.date;
        grid.querySelectorAll('button').forEach(x=>x.classList.toggle('chosen',x===b));
        daySheet(day);};
      grid.append(b);
    }
    const label=$('#badgeMonthLabel');if(label)label.textContent=year+'년 '+mon+'월';
    const undated=$('#badgeCalendarUndated');undated.replaceChildren();
    if(data.undated_history.length)undated.append(make('p','badgeReadNotice',
      '날짜 미확인 획득 이력 '+data.undated_history.length+'건 · 실제 수여 시각이 기록되지 않았어요.'));
  }
  function daySheet(day){
    const root=$('#badgeCalendarDay');root.replaceChildren();
    root.append(make('h3',null,day.date.slice(5).replace('-','월 ')+'일의 훈장'));
    if(!day.events.length){root.append(make('p','badgeReadNotice','이날 기록된 새 훈장은 없어요. 탐험은 그대로 소중해요.'));return}
    for(const event of day.events){
      const row=make('button','badgeDayEvent');
      row.type='button';row.append(make('b',null,clean(event.badge_title)||'획득한 훈장'),
        make('small',null,EVENT_LABEL[event.event_type]));
      row.onclick=()=>void detail(event.badge_id,clean(event.badge_title)||'획득 기록');
      root.append(row);
    }
  }
  async function loadMonth(ticket,who){
    let result;
    try{result=await adapter.getMonth({month})}catch{}
    if(ticket!==revision)return {ok:false,reason:'SUPERSEDED'};
    if(!validateMonth(result,who,month)){
      lastMonth=null;
      notice($('#badgeCalendarGrid'),'확인되지 않은 기록은 캘린더에 표시하지 않아요.');
      return {ok:false,reason:'SIGNED_CHILD_MONTH_PROJECTION_REQUIRED'};
    }
    lastMonth=result;calendarCells(result,ticket);
    const selected=result.days.find(x=>x.date===selectedDate);
    if(selected)daySheet(selected);
    else{
      $('#badgeCalendarDay')?.replaceChildren(make('p','badgeReadNotice','날짜를 선택하면 그날의 훈장을 볼 수 있어요.'));
    }
    return {ok:true,month,count:result.days.reduce((n,x)=>n+x.events.length,0)};
  }
  async function detail(badgeId,title){
    if(!adapter||!viewer||!clean(badgeId))return {ok:false,reason:'VIEWER_AND_BADGE_REQUIRED'};
    const ticket=++revision,who={...viewer},returnTo=mode==='calendar'?'calendar':'collection';
    panels('detail');$('#badgeDetailTitle').textContent=title||'획득 기록';
    notice($('#badgeDetailHistory'),'검증된 획득 이력을 확인하고 있어요.');
    let result;
    try{result=await adapter.getBadgeHistory({badge_id:badgeId})}catch{}
    if(ticket!==revision)return {ok:false,reason:'SUPERSEDED'};
    const root=$('#badgeDetailHistory');
    if(result?.ok!==true||result.contract!==DETAIL||!sameScope(result,who)||
       result.badge_id!==badgeId||!Array.isArray(result.history)||
       result.history.some(e=>e.child_id!==who.child_id||e.badge_id!==badgeId||
         !clean(e.award_id)||!Object.hasOwn(EVENT_LABEL,e.event_type))){
      notice(root,'검증된 획득 이력을 확인할 수 없어요.');
      return {ok:false,reason:'SIGNED_BADGE_DETAIL_REQUIRED'};
    }
    root.replaceChildren();
    for(const e of result.history){
      const row=make('article','badgeDetailEvent');
      row.append(make('b',null,EVENT_LABEL[e.event_type]));
      row.append(make('small',null,e.date_status==='VERIFIED_AWARD_TIME'&&clean(e.awarded_at)?
        new Intl.DateTimeFormat('ko-KR',{timeZone:TZ,dateStyle:'medium'}).format(new Date(e.awarded_at)):
        '날짜 미확인'));
      root.append(row);
    }
    if(!result.history.length)notice(root,'아직 확인된 획득 기록이 없어요.');
    $('#badgeDetailBack').onclick=()=>void open(returnTo);
    return {ok:true};
  }
  document.querySelectorAll('[data-record-mode]').forEach(b=>b.addEventListener('click',()=>void open(b.dataset.recordMode)));
  $('#badgeMonthPrev')?.addEventListener('click',()=>moveMonth(-1));
  $('#badgeMonthNext')?.addEventListener('click',()=>moveMonth(1));
  function moveMonth(delta){
    if(mode!=='calendar')return;
    const [year,mon]=month.split('-').map(Number);
    const d=new Date(Date.UTC(year,mon-1+delta,1));
    month=d.getUTCFullYear()+'-'+String(d.getUTCMonth()+1).padStart(2,'0');
    selectedDate=null;void open('calendar');
  }
  $('#nav')?.addEventListener('click',e=>{
    const button=e.target.closest('button[data-view]');
    if(button&&button.dataset.view!=='records'){
      revision++;clearPrivate();panels('journal');
    }
  });
  // Do not leave private child data on an unattended switched-out tab.
  document.addEventListener('visibilitychange',()=>{if(document.hidden){
    revision++;clearPrivate();panels('journal');
  }});
  window.SnapBadgeRecordUI=Object.freeze({
    contract:ADAPTER,connectReadAdapter,disconnect,open
  });
})();
