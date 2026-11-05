(() => {
'use strict';
if(window.SnapLiteracyAdapterV1)return;
const VERSION='2026.10.07-snap-literacy-adapter-v1';
const clean=v=>String(v??'').trim();
function context(){try{return window.SnapPopBridge?.context?.()||{}}catch{return {}}}
function term(c=context()){return clean(c.academic_vocab_term||c.word)}
function activeFlow(c=context()){return clean(c.literacy_flow)||((term(c)&&c.from_app==='hide-seek')?'READ_TO_WRITE_CONCEPT_TRANSFER':'')}
function prompts(c=context()){
  const w=term(c)||'핵심 용어';
  if(activeFlow(c)!=='READ_TO_WRITE_CONCEPT_TRANSFER')return null;
  return [
    ['‘'+w+'’를 네 말로 풀어볼까?','교과서 문장을 베끼지 말고 '+w+'의 뜻을 한 문장으로 바꿔봐.'],
    [w+'를 꼭 넣어 새 문장을 만들어볼까?','아까와 다른 상황에 '+w+'를 사용해봐.'],
    ['왜 여기서 '+w+'가 맞는지 설명해볼까?','뜻과 상황을 연결해서 네 문장으로 마무리해봐.']
  ];
}
async function apply(){
  const p=prompts(); if(!p)return;
  let s=null;try{s=await window.get?.('active')}catch{}
  const i=Math.min(2,Number(s?.step||0));
  const q=document.querySelector('#question'),h=document.querySelector('#hint');
  if(q)q.textContent=p[i][0]; if(h)h.textContent=p[i][1];
  document.documentElement.dataset.snapLiteracyFlow='READ_TO_WRITE_CONCEPT_TRANSFER';
}
function enrich(event){
  if(!event||event.app!=='snap-pop'||!activeFlow())return event;
  event.payload=event.payload||{};
  event.payload.literacy_context={
    framework:'CNE_LITERACY',
    flow:'READ_TO_WRITE_CONCEPT_TRANSFER',
    academic_vocab_term:term()||null,
    academic_vocab_level:clean(context().academic_vocab_level)||null,
    reading_material_ondok:Number(context().reading_material_ondok)||null
  };
  if(event.type==='TASK_COMPLETED')event.payload.writing_transfer_stage='TRANSFER_COMPLETED';
  return event;
}
window.addEventListener('taky-learning-event',e=>{if(e?.detail)enrich(e.detail)},true);
document.addEventListener('click',e=>{if(e.target?.closest?.('#nextBtn,#startBtn'))setTimeout(apply,0)},true);
new MutationObserver(()=>void apply()).observe(document.documentElement,{childList:true,subtree:true});
setTimeout(apply,200);
window.SnapLiteracyAdapterV1=Object.freeze({version:VERSION,context,term,activeFlow,prompts,apply,enrich});
})();