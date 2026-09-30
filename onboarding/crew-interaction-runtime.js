(function(root,factory){
  'use strict';
  const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root)root.CompanionCrewInteraction=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  // Only actual user-submitted text; never claims child feelings or authorship.
  const scenes=Object.freeze(['idea','emotion','description','viewpoint','final']);
  const hints=Object.freeze({
    idea:'먼저 떠오른 단어 하나를 골라 볼래?',
    emotion:'마음을 나타내는 단어 하나만 골라 볼래?',
    description:'눈에 들어온 장면 하나만 골라 볼래?',
    viewpoint:'다른 위치에서 보이는 것 하나만 떠올려 볼래?',
    final:'마지막에 남기고 싶은 생각 하나를 골라 볼래?'
  });
  function open({primaryId,selectedIds,scene='description'}={},projection){
    if(!scenes.includes(scene)||typeof projection?.preview!=='function')return null;
    const cue=projection.preview({primaryId,selectedIds,scene});
    if(!cue||cue.memberId!==primaryId||cue.autoWrite||cue.reward||cue.affinity||cue.voicePlayback)return null;
    return Object.freeze({kind:'WAIT_CHILD',memberId:primaryId,scene,selectedIds:Object.freeze([...selectedIds]),cue:cue.text,
      childText:null,answer:null,grade:false,reward:false,affinity:false,voicePlayback:false});
  }
  function submit(session,raw){
    if(session?.kind!=='WAIT_CHILD'||typeof raw!=='string'||!raw.trim()||raw.trim().length>180)return null;
    return Object.freeze({kind:'SHORT_REACTION',memberId:session.memberId,scene:session.scene,selectedIds:session.selectedIds,
      childText:raw.trim(),reply:session.cue,hintUsed:false,answer:null,childAuthorshipPreserved:true,
      grade:false,reward:false,affinity:false,voicePlayback:false,autoCompletion:false});
  }
  function hint(result){
    if(result?.kind!=='SHORT_REACTION'||result.hintUsed||!scenes.includes(result.scene))return null;
    return Object.freeze({...result,hintUsed:true,hint:hints[result.scene],kind:'ONE_REQUESTED_HINT'});
  }
  return Object.freeze({version:'COMPANION_USER_TRIGGERED_TEXT_CREW_V1',scenes,open,submit,hint,
    owner:'SNAP_ONBOARDING_ONLY',crossAppAuthority:false,autoAnswer:false,autoHint:false,autoGrade:false,autoReward:false,autoAffinity:false,voicePlayback:false});
});
