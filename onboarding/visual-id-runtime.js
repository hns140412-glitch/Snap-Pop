(function(root,factory){
  'use strict';
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root)root.CompanionVisualAssets=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  // Single source for isolated onboarding visual binding. These six local IDs
  // refer to existing approved originals, NOT an authorization to activate
  // Snap ROOT crew registry or to assert an unresolved global Visual ID alias.
  const FIRST_MEETING='ui/approved/first_meeting_selection_source.png';
  const INTEGRATION_ORDER=Object.freeze(['dubi','lori','ink','nova','take','zero']);
  const roleKeys=Object.freeze(['IDENTITY_BODY','PERSONALITY_PROP','THEME_GEAR']);
  const reactionKeys=Object.freeze(['OBSERVE','LISTEN','IDEA','REACT','WAIT','COMPLETE']);
  const viewKeys=Object.freeze(['FIRST_MEETING','CHOICE','PRIMARY','HOME','ACTIVE_SCENE']);
  const hotspotCoordinates={
    dubi:{hero:[3.8,47.4,29.5,16],portrait:[6.4,76.7,12.5,7.0],slot:[10.25,85.9]},
    lori:{hero:[5.6,31.0,29.8,19.9],portrait:[20.6,76.7,12.5,7.0],slot:[24.5,85.9]},
    ink:{hero:[34.0,32.1,30.0,18.0],portrait:[35.0,76.7,12.5,7.0],slot:[38.9,85.9]},
    nova:{hero:[60.5,35.0,27.0,15.7],portrait:[49.1,76.7,12.5,7.0],slot:[53.4,85.9]},
    take:{hero:[63.5,48.0,30.8,14.0],portrait:[63.4,76.7,12.5,7.0],slot:[67.7,85.9]},
    zero:{hero:[30.0,47.9,32.0,17.0],portrait:[77.4,76.7,12.5,7.0],slot:[82.0,85.9]}
  };
  const names={dubi:'두비',lori:'로리',ink:'잉크',nova:'노바',take:'테이크',zero:'제로'};
  function freezeRecord(id){
    const areas=hotspotCoordinates[id];
    return Object.freeze({
      id,localIdentityOnly:true,displayName:names[id],
      source:'characters/originals/'+id+'_source.jpeg',
      cutout:'characters/ui_cutouts/'+id+'.png',
      firstMeetingSource:FIRST_MEETING,
      firstMeetingLayout:Object.freeze(Object.fromEntries(Object.entries(areas).map(([k,v])=>[k,Object.freeze([...v])]))),
      // A flattened cutout is a static preview, NOT independently animated body/prop/gear.
      layerRoles:Object.freeze(Object.fromEntries(roleKeys.map(k=>[k,null]))),
      reactions:Object.freeze(Object.fromEntries(reactionKeys.map(k=>[k,null]))),
      review:Object.freeze({layerSeparation:false,sceneBindings:false,interaction:true,pixelParity:false,realDevice:false,rootOwnerApproval:false}),
      status:'STATIC_ASSET_BOUND_ACTION_LAYERS_OPEN'
    });
  }
  const records=Object.freeze(Object.fromEntries(INTEGRATION_ORDER.map(id=>[id,freezeRecord(id)])));
  const canonicalIds=Object.freeze([...INTEGRATION_ORDER]);
  const owned=id=>typeof id==='string'&&Object.prototype.hasOwnProperty.call(records,id);
  function member(id){if(!owned(id))throw new Error('UNREGISTERED_ONBOARDING_VISUAL_ID:'+String(id));return records[id];}
  function asset(id,slot){const row=member(id);if(slot!=='source'&&slot!=='cutout')throw new Error('UNAPPROVED_ASSET_SLOT:'+slot);return row[slot];}
  function hotspot(id,kind){const row=member(id);if(!['hero','portrait','slot'].includes(kind))throw new Error('UNREGISTERED_SCENE_HOTSPOT:'+kind);return [...row.firstMeetingLayout[kind]];}
  function renderPlan(id){
    const row=member(id);
    const missing=[
      ...roleKeys.filter(k=>!row.layerRoles[k]).map(k=>'LAYER:'+k),
      ...reactionKeys.filter(k=>!row.reactions[k]).map(k=>'REACTION:'+k),
      ...Object.entries(row.review).filter(([k,v])=>v!==true).map(([k])=>'VERIFICATION:'+k)
    ];
    return Object.freeze({id,staticPreviewReady:true,actionReady:missing.length===0,releaseReady:false,missing:Object.freeze(missing),
      firstMeetingSource:row.firstMeetingSource,staticCutout:row.cutout,owner:'ISOLATED_SNAP_ONBOARDING'});
  }
  // Used for every NEW Visual ID. A name or single image cannot be silently
  // treated as a fully layered/runtime-ready member. No auto generation is claimed.
  function auditNewIdentity(candidate,registeredHashes={}){
    const c=candidate&&typeof candidate==='object'?candidate:{};
    const missing=[],id=c.id;
    if(typeof id!=='string'||!/^[a-z][a-z0-9_-]{1,40}$/.test(id)||owned(id))missing.push('NEW_IMMUTABLE_LOCAL_ID_REQUIRED');
    if(c.userVisualApproval!==true||typeof c.visualEvidenceRef!=='string'||!c.visualEvidenceRef.trim())missing.push('LOCKED_VISUAL_SOURCE_AND_USER_APPROVAL');
    for(const field of ['source','cutout','firstMeetingSource']){
      const p=c[field];
      if(typeof p!=='string'||!(p in registeredHashes)||!/^[a-f0-9]{64}$/.test(registeredHashes[p]))missing.push('HASH_GUARDED_ASSET:'+field);
    }
    for(const slot of roleKeys)if(typeof c.layerRoles?.[slot]!=='string'||!(c.layerRoles[slot] in registeredHashes))missing.push('LAYER:'+slot);
    for(const state of reactionKeys)if(typeof c.reactions?.[state]!=='string'||!(c.reactions[state] in registeredHashes))missing.push('REACTION:'+state);
    for(const scene of viewKeys)if(!c.scenes?.[scene]?.userApproved||!c.scenes[scene].renderBinding||!c.scenes[scene].referenceId)missing.push('SCENE_CONTRACT:'+scene);
    if(c.behaviorOwnerVerified!==true)missing.push('BEHAVIOR_OWNER_AND_ID_ALIAS');
    if(c.fourViewportBrowserVerified!==true)missing.push('FOUR_VIEWPORT_RENDER_INTERACTION');
    if(c.pixelParityApproved!==true)missing.push('SCREEN_REFERENCE_1TO1');
    if(c.realDeviceVerified!==true)missing.push('REAL_DEVICE');
    if(c.rootOwnerApproval!==true)missing.push('SNAP_ROOT_RELEASE_APPROVAL');
    return Object.freeze({id:typeof id==='string'?id:null,ready:missing.length===0,missing:Object.freeze(missing)});
  }
  return Object.freeze({version:'COMPANION_VISUAL_ID_TO_UI_GATE_V1',memberIds:canonicalIds,member,asset,hotspot,
    firstMeetingSource:FIRST_MEETING,roleKeys,reactionKeys,viewKeys,renderPlan,auditNewIdentity,
    rootRegistryActivation:false,readyHideImport:false,automaticArtGeneration:false});
});
