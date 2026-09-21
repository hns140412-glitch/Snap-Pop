(() => {
  "use strict";
  const VERSION="SNAP_POP_FAMILY_EXPANSION_V1";
  const STATES=Object.freeze({
    ORIGINAL:"ORIGINAL",
    FAMILY_EXPANSION:"FAMILY_EXPANSION",
    ACTIVE:"ACTIVE",
    RECOVERY_LOCKED:"RECOVERY_LOCKED",
    CONFLICT_LOCKED:"CONFLICT_LOCKED"
  });
  const FEATURES=Object.freeze({
    DIARY:{id:"DIARY",state:"ACTIVE",childScoped:true},
    LETTER:{id:"LETTER",state:"ACTIVE",childScoped:true},
    SHARED_SPECIAL:{id:"SHARED_SPECIAL",state:"ACTIVE",childScoped:true},
    FAMILY_TIMELINE:{id:"FAMILY_TIMELINE",state:"ACTIVE",childScoped:true,derived:true},
    MULTI_CHILD:{id:"MULTI_CHILD",state:"ACTIVE",childScoped:false},
    FAMILY_GROUP:{id:"FAMILY_GROUP",state:"RECOVERY_LOCKED",childScoped:false},
    MAILBOX_DECOR:{id:"MAILBOX_DECOR",state:"RECOVERY_LOCKED",childScoped:true},
    SUPPORT_CARD:{id:"SUPPORT_CARD",state:"ACTIVE",childScoped:true},
    GEM_GIFT:{id:"GEM_GIFT",state:"CONFLICT_LOCKED",childScoped:true,economyMutationAllowed:false},
    COMPOSITE_DIARY_ILLUSTRATION:{id:"COMPOSITE_DIARY_ILLUSTRATION",state:"RECOVERY_LOCKED",childScoped:true}
  });
  const ROLES=Object.freeze({
    OWNER:["READ_OWN_CHILD","WRITE_OWN_CHILD","READ_FAMILY_TIMELINE"],
    PARENT:["READ_OWN_CHILD","WRITE_OWN_CHILD","READ_FAMILY_TIMELINE"],
    CHILD:["READ_SELF","WRITE_SELF"]
  });
  function cleanId(v,name){const s=String(v||"").trim();if(!s)throw new Error(name+"_REQUIRED");if(!/^[A-Za-z0-9_-]{2,64}$/.test(s))throw new Error(name+"_INVALID");return s}
  function normalizeChild(x={}){return Object.freeze({childId:cleanId(x.childId,"CHILD_ID"),displayName:String(x.displayName||"").trim().slice(0,30),active:x.active!==false})}
  function normalizeGroup(x={}){return Object.freeze({groupId:cleanId(x.groupId,"GROUP_ID"),role:["OWNER","PARENT","CHILD"].includes(x.role)?x.role:"CHILD",memberId:cleanId(x.memberId,"MEMBER_ID")})}
  function feature(id){const f=FEATURES[id];if(!f)throw new Error("FAMILY_FEATURE_UNKNOWN");return f}
  function assertAvailable(id){const f=feature(id);if(f.state!=="ACTIVE")throw new Error("FAMILY_FEATURE_"+f.state);return f}
  function createArtifact(type,input={}){
    const f=assertAvailable(type);
    const childId=f.childScoped?cleanId(input.childId,"CHILD_ID"):null;
    const now=String(input.at||new Date().toISOString());
    const artifact={
      artifactId:cleanId(input.artifactId||("fam_"+Date.now()+"_"+Math.random().toString(36).slice(2,9)),"ARTIFACT_ID"),
      type,childId,at:now,
      title:String(input.title||"").trim().slice(0,80),
      text:String(input.text||"").trim().slice(0,5000),
      source:String(input.source||"SNAP_POP_FAMILY_EXPANSION").trim(),
      economyMutationAllowed:false,
      crossChildMutationAllowed:false,
      ghostwritingAllowed:false
    };
    if(!artifact.text)throw new Error("FAMILY_ARTIFACT_TEXT_REQUIRED");
    if(type==="LETTER"||type==="SUPPORT_CARD")artifact.toChildId=input.toChildId?cleanId(input.toChildId,"TO_CHILD_ID"):null;
    return Object.freeze(artifact);
  }
  function timeline(artifacts=[],childId){
    const id=cleanId(childId,"CHILD_ID");
    return artifacts.filter(x=>x&&x.childId===id).slice().sort((a,b)=>String(b.at).localeCompare(String(a.at)));
  }
  function can(group,action,childId){
    const g=normalizeGroup(group);
    const allowed=ROLES[g.role]||[];
    if(g.role==="CHILD"&&childId&&g.memberId!==childId)return false;
    return allowed.includes(action);
  }
  window.SnapPopFamilyExpansion=Object.freeze({
    version:VERSION,states:STATES,features:FEATURES,roles:ROLES,
    normalizeChild,normalizeGroup,feature,assertAvailable,createArtifact,timeline,can,
    contracts:Object.freeze({
      featureFlagRequired:true,
      originalModePreserved:true,
      childIdIsolationRequired:true,
      crossChildMutationAllowed:false,
      sharedIdentityAuthority:false,
      sharedPermissionAuthority:false,
      gemGiftEconomyMutationAllowed:false,
      recoveryLockedFeatures:["FAMILY_GROUP","MAILBOX_DECOR","COMPOSITE_DIARY_ILLUSTRATION"],
      conflictLockedFeatures:["GEM_GIFT"]
    })
  });
})();