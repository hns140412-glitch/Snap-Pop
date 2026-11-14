/* Snap & Pop ↔ TAKY Learning Engine link (2026-11-14).
 * Logic owner: TAKY/MASTER/LEARNING_APP_FAMILY_MASTER (one learning history). Snap REV_12: Snap writes
 * only its expression-task result; snap-bridge keeps "no linked, context-free event can claim a member
 * or learning target". So this file adds ONLY the family sign-in that installs TAKY_FAMILY_RUNTIME:
 *  - one family sign-in per device (TakyFamilySigninV1), from 설정 → 가족 학습 연결;
 *  - once bound, the existing TakyLearningEvidenceClientV1 sends Ready-linked Snap results to
 *    /api/learning/evidence, and SnapFamilyRuntimeBootstrapV1 binds the family character providers.
 * Standalone (non-Ready) Snap play is not given a learner or a learning target here.
 */
(function(){
'use strict';
if(window.SnapLearningLinkV1)return;
const VERSION='2026.11.14-snap-learning-link-v1';
let signin=null,session=null;
function client(){return window.TakyLearningEvidenceClientV1}
async function sendNow(){
 const c=client();if(!c)return null;
 try{c.scan()}catch{}
 try{return await c.flush()}catch{return null}
}

function ensurePanel(){
 let el=document.getElementById('snapLearnLink');if(el)return el;
 el=document.createElement('section');el.id='snapLearnLink';el.className='sp-ll';el.hidden=true;
 el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-labelledby','spLlTitle');
 el.innerHTML='<div class="sp-ll-sheet">'+
  '<header class="sp-ll-head"><h2 id="spLlTitle">가족 학습 연결</h2><button type="button" class="sp-ll-x" data-ll-close aria-label="닫기">닫기</button></header>'+
  '<p class="sp-ll-lead">가족 과제로 연 탐험 기록을 가족 학습 기록으로 보내요. 이 기기에서 한 번만 로그인하면 돼요.</p>'+
  '<div id="familyLogin" class="sp-ll-login"><button id="familySignInBtn" class="sp-ll-btn" type="button" disabled>Google로 가족 로그인</button>'+
  '<div id="familyGoogleTarget"></div><div id="familyChooseTarget" class="sp-ll-choices"></div>'+
  '<p id="familyLoginStatus" class="sp-ll-status" role="status">로그인하지 않음</p>'+
  '<button id="familySignOutBtn" class="sp-ll-ghost" type="button" hidden>이 기기에서 로그아웃</button></div>'+
  '<p class="sp-ll-sync" data-ll-sync aria-live="polite"></p>'+
 '</div>';
 document.body.appendChild(el);
 el.querySelector('[data-ll-close]').onclick=close;
 el.addEventListener('click',e=>{if(e.target===el)close()});
 return el;
}
function open(){const el=ensurePanel();el.hidden=false;renderSync();if(signin&&!session)signin.restore?.()}
function close(){const el=document.getElementById('snapLearnLink');if(el)el.hidden=true}
function renderSync(text){
 const p=document.querySelector('#snapLearnLink [data-ll-sync]');if(!p)return;
 if(text){p.textContent=text;return}
 const c=client();if(!c||!session){p.textContent='';return}
 const n=f=>{try{return c[f]().length}catch{return 0}};
 p.textContent='보낸 기록 '+n('acked')+'개 · 보낼 기록 '+n('pending')+'개';
}
function renderRow(){
 const span=document.querySelector('[data-snap-learn-link-state]');
 if(span)span.textContent=session?'가족 계정 연결됨':'가족 과제 기록 보내기';
}

/* 설정 row, same .setting pattern as the approved settings view. */
function addSettingsRow(){
 const view=document.getElementById('settings');
 if(!view||view.querySelector('[data-snap-learn-link]'))return;
 const row=document.createElement('div');row.className='setting';row.dataset.snapLearnLink='1';
 row.innerHTML='<div><b>가족 학습 연결</b><span data-snap-learn-link-state>가족 과제 기록 보내기</span></div><button class="soft" type="button">연결</button>';
 row.querySelector('button').onclick=open;
 view.appendChild(row);
 renderRow();
}

async function onBound(){
 try{session=await window.TAKY_FAMILY_RUNTIME.currentSession()}catch{session=null}
 renderRow();renderSync();
 if(!session)return;
 await sendNow();renderSync();setTimeout(()=>renderSync(),1500);
}
function onCleared(){session=null;renderRow();renderSync()}

function boot(){
 ensurePanel();
 try{addSettingsRow()}catch{}
 const F=window.TakyFamilySigninV1;
 if(!F){renderSync('로그인 모듈을 불러오지 못했어요.');return}
 signin=F.createFamilySignin();
 window.addEventListener('taky-central-auth-ready',()=>void onBound());
 window.addEventListener('taky-central-auth-cleared',onCleared);
 signin.mount();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();

window.SnapLearningLinkV1=Object.freeze({version:VERSION,open,close,status:()=>({bound:!!session,family_id:session?.family_id||null})});
})();
