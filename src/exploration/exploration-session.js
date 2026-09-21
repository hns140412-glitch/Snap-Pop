export function ensureWritingState(session){
  if(!session)return session;
  session.answers=Array.isArray(session.answers)?session.answers:['','',''];
  session.snapshots=Array.isArray(session.snapshots)?session.snapshots:[...session.answers];
  if(typeof session.draft!=='string'){
    const current=session.answers[Math.min(2,session.step||0)];
    session.draft=current||[...session.answers].reverse().find(x=>(x||'').trim())||'';
  }
  return session;
}
export function createExplorationSession({id,landmark,language='ko',startedAt}={}){
  if(!id)throw new Error('EXPLORATION_ID_REQUIRED');
  if(!landmark)throw new Error('LANDMARK_REQUIRED');
  return ensureWritingState({
    id,landmark,step:0,answers:['','',''],snapshots:['','',''],draft:'',
    language:language||'ko',startedAt:startedAt||new Date().toISOString()
  });
}
export function clampExplorationStep(step){
  const n=Number(step);
  return Number.isFinite(n)?Math.max(0,Math.min(2,Math.floor(n))):0;
}
