(function(root,factory){
  'use strict';
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root)root.CompanionCrewBehavior=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  // Read-only, isolated onboarding projection. Source: recovered six signature
  // lines in SNAP_EXPLORATION_CREW_MASTER_2026-09-20.md lines 469-480 on
  // Snap dev d9f48f9; per-scene lines from its data/exploration-crew-rules.json.
  // No global TAKY ownership assertion and no production root registry activation.
  const LINEAGE=Object.freeze({
    dubi:{signature:'와! 해보자!',scenes:{idea:'어? 이거 더 파보면 뭐 하나 나올 것 같은데?',emotion:'마음도 궁금한 게 많네. 하나만 먼저 볼까?',description:'잠깐, 저건 뭐지? 하나 더 자세히 보자.',viewpoint:'그렇게 볼 수도 있네. 다른 쪽은 어떨까?',final:'좋아, 마지막에 뭐 하나 놓친 건 없는지 같이 보자.'}},
    lori:{signature:'괜찮아, 천천히 해도 돼!',scenes:{idea:'그 생각, 조금 더 들여다봐도 괜찮을 것 같아.',emotion:'그 마음이 있었구나. 이유가 하나 떠오를까?',description:'네가 느낀 걸 그대로 말해도 좋아.',viewpoint:'다른 사람 마음에서는 어떻게 보일까?',final:'네 느낌이 남는 쪽으로 끝내면 좋겠어.'}},
    ink:{signature:'음... 다른 방법도 있지.',scenes:{idea:'여기 작은 단서 하나 보이는데. 네 생각엔 뭘 뜻할까?',emotion:'말보다 먼저 보이는 표정 같은 게 있을지도.',description:'빛, 소리, 모양 중 하나만 더 잡아보자.',viewpoint:'같은 장면도 위치가 바뀌면 다르게 보여.',final:'핵심 단서만 남기고 정리해보자.'}},
    nova:{signature:'가보자! 하면 되지!',scenes:{idea:'좋아, 그거 한 단계만 더 가보자.',emotion:'그 마음을 말로 붙잡는 것도 꽤 멋진 도전이야.',description:'한 장면만 더 선명하게 만들어볼까?',viewpoint:'반대편으로 한 걸음만 옮겨보자.',final:'마지막 한 번. 네 방식대로 딱 끝내자.'}},
    take:{signature:'차근차근 같이 해보자.',scenes:{idea:'생각이 몇 개 있네. 먼저 하나만 잡자.',emotion:'마음과 이유를 따로 놓고 보면 좀 편해질 수도 있어.',description:'보이는 것부터 순서대로 챙겨보자.',viewpoint:'두 생각을 나란히 놓으면 차이가 보여.',final:'핵심은 남기고 순서만 한번 정리해보자.'}},
    zero:{signature:'언제나, 네 이야기를 응원해!',scenes:{idea:'생각 하나가 들어왔네. 다음 박자는 뭐지?',emotion:'그 마음에도 리듬이 있나 봐. 조금 더 들어볼까?',description:'소리나 느낌 하나 넣으면 장면이 살아날지도.',viewpoint:'박자를 바꾸듯 시선도 한번 바꿔볼까?',final:'좋아. 마지막 박자는 네가 정해.'}}
  });
  const scenes=Object.freeze(['home','idea','emotion','description','viewpoint','final']);
  const ids=Object.freeze(Object.keys(LINEAGE));
  const AMBIENT_BY_SCENE=Object.freeze({
    home:Object.freeze(['REST','READ_BOOK','ORGANIZE_BAG']),
    idea:Object.freeze(['READ_MAP','WRITE_NOTE','REST']),
    emotion:Object.freeze(['READ_BOOK','REST','WRITE_NOTE']),
    description:Object.freeze(['USE_MAGNIFIER','WRITE_NOTE','REST']),
    viewpoint:Object.freeze(['CHECK_COMPASS','READ_MAP','REST']),
    final:Object.freeze(['WRITE_NOTE','ORGANIZE_BAG','REST'])
  });
  function chooseAmbientAction(scene,id,recent=[]){
    const pool=AMBIENT_BY_SCENE[scene]||AMBIENT_BY_SCENE.home;
    const used=new Set(Array.isArray(recent)?recent:[]);
    const offset=Math.max(0,ids.indexOf(id))%pool.length;
    const ordered=[...pool.slice(offset),...pool.slice(0,offset)];
    return ordered.find(x=>!used.has(id+':'+x))||ordered[0];
  }
  function sceneCommands({primaryId,selectedIds,scene='home',recentAmbient=[]}={},semantic){
    if(!semantic?.command||!semantic?.ambient)return null;
    if(!Array.isArray(selectedIds)||new Set(selectedIds).size!==selectedIds.length||selectedIds.length<5||selectedIds.length>6||selectedIds.some(id=>!ids.includes(id)))return null;
    if(!ids.includes(primaryId)||!selectedIds.includes(primaryId)||!scenes.includes(scene))return null;
    const main=semantic.command({character_id:primaryId,role:'MAIN',relation_state:'KNOWN',behavior_state:'OBSERVE',interaction_mode:'SILENT',target:'child_task'});
    if(!main)return null;
    const ambient=selectedIds.filter(id=>id!==primaryId).map(id=>semantic.ambient({character_id:id,relation_state:'KNOWN',ambient_action:chooseAmbientAction(scene,id,recentAmbient)})).filter(Boolean);
    return Object.freeze([main,...ambient]);
  }
  function preview({primaryId,selectedIds,scene='home'}={}){
    if(!Array.isArray(selectedIds)||new Set(selectedIds).size!==selectedIds.length||selectedIds.length<5||selectedIds.length>6||selectedIds.some(id=>!ids.includes(id)))return null;
    if(!ids.includes(primaryId)||!selectedIds.includes(primaryId)||!scenes.includes(scene))return null;
    const source=LINEAGE[primaryId],text=scene==='home'?source.signature:source.scenes[scene];
    return Object.freeze({memberId:primaryId,scene,text,kind:'READ_ONLY_COMPANION_REACTION',source:'RECOVERED_SNAP_DEVELOPMENT_LINEAGE',autoWrite:false,autoHint:false,grade:false,reward:false,affinity:false,voicePlayback:false});
  }
  // Adaptation interface is intentionally pure: no session, transcript, grade, reward,
  // or external app events are synthesized from presence or the reaction preview.
  return Object.freeze({version:'COMPANION_CORE6_BEHAVIOR_PROJECTION_V2',memberIds:ids,scenes,ambientByScene:AMBIENT_BY_SCENE,chooseAmbientAction,sceneCommands,preview,
    owner:'ISOLATED_SNAP_ONBOARDING_PROJECTION_PENDING_SHARED_OWNER_RECONCILIATION',
    rootRegistryActivation:false,readyHideAuthority:false,autoWrite:false,autoReward:false,autoAffinity:false});
});
