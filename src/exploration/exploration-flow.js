export const EXPLORATION_STEPS=Object.freeze([0,1,2]);
export function normalizeDraft(value){return String(value||'').trim();}
export function transitionExploration({step=0,draft=''}={}){
  const current=Math.max(0,Math.min(2,Math.floor(Number(step)||0)));
  const text=normalizeDraft(draft);
  if(!text)return Object.freeze({kind:'WAIT_FOR_CHILD_INPUT',step:current,nextStep:current,complete:false});
  if(current<2)return Object.freeze({kind:'ADVANCE',step:current,nextStep:current+1,complete:false});
  return Object.freeze({kind:'COMPLETE',step:2,nextStep:2,complete:true});
}
