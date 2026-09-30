'use strict';
const fs=require('node:fs');
const path=require('node:path');
const ROOT=__dirname;
const AMBIENT=[
 ['READ_BOOK','book_hand',['BOOK'],'neutral'],
 ['READ_MAP','map_hands',['MAP'],'neutral'],
 ['WRITE_NOTE','write_hand',['NOTEBOOK','PEN'],'think'],
 ['CHECK_COMPASS','compass_hand',['COMPASS'],'observe'],
 ['ORGANIZE_BAG','bag_hands',['BAG'],'neutral'],
 ['USE_MAGNIFIER','magnifier_hand',['MAGNIFIER'],'observe'],
 ['USE_RADIO','radio_hand',['RADIO'],'listen'],
 ['REST',null,[],'neutral']
];
function build(manifest){
 if(!manifest||manifest.schema!=='TAKY_CREW_COMPOSABLE_ASSET_MANIFEST_V1')throw new Error('BAD_MANIFEST_SCHEMA');
 const members=[];
 for(const [id,m] of Object.entries(manifest.members||{})){
   const tasks=[];
   const add=(priority,group,key,why,unlocks)=>tasks.push({priority,group,key,why,unlocks,status:'OPEN'});
   const has=(g,key)=>Array.isArray(m.groups?.[g]?.assets)&&m.groups[g].assets.some(a=>a.approved===true&&a.key===key);
   if(!has('PUPPET_BODY','FIELD_NEUTRAL'))add('P0','PUPPET_BODY','FIELD_NEUTRAL','same-character fail-closed body','RUNTIME_FALLBACK');
   if(!has('FACE_STATES','neutral'))add('P0','FACE_STATES','neutral','minimum neutral expression','RUNTIME_FALLBACK');
   if(!has('DEPTH_SHADOW','field_default'))add('P0','DEPTH_SHADOW','field_default','minimum approved depth/shadow','RUNTIME_FALLBACK');
   for(const [,part,,face] of AMBIENT){
     if(face!=='neutral'&&!has('FACE_STATES',face)&&!tasks.some(t=>t.group==='FACE_STATES'&&t.key===face))
       add('P1','FACE_STATES',face,'required Ambient face state','AMBIENT_ACTIONS');
     if(part&&!has('ACTION_PARTS',part))add('P1','ACTION_PARTS',part,'required Ambient semantic action part','AMBIENT_ACTIONS');
   }
   if(!has('PEEK_MASK','peek_default'))add('P2','PEEK_MASK','peek_default','peek/hide presentation support','PEEK_HIDE');
   members.push({
     visual_id:id,
     source_sha256:m.source_sha256,
     production_eligible:m.production_eligible===true,
     runtime_fallback_eligible:m.runtime_fallback_eligible===true,
     tasks,
     counts:{
       P0:tasks.filter(t=>t.priority==='P0').length,
       P1:tasks.filter(t=>t.priority==='P1').length,
       P2:tasks.filter(t=>t.priority==='P2').length
     }
   });
 }
 const shared=[];
 for(const key of ['BOOK','MAP','NOTEBOOK','PEN','RADIO','MAGNIFIER','BAG','COMPASS']){
   const a=manifest.shared_assets?.[key];
   if(!(a&&a.approved===true&&a.shared===true))shared.push({priority:'P1',group:'SHARED_EQUIPMENT',key,status:'OPEN',why:'required by Ambient composition'});
 }
 const pending=Object.values(manifest.pending_members||{}).map(m=>({
   visual_id:m.visual_id,code:m.code,status:'BLOCKED_BEFORE_COMPOSABLE_ART',
   blockers:['INDIVIDUAL_SOURCE_SHA','CUTOUT_SHA','MASK_SPEC_SHA','APPROVAL_LINEAGE']
 }));
 return {
   schema:'TAKY_CREW_COMPOSABLE_WORK_QUEUE_V1',
   contract_version:manifest.contract_version,
   manifest_version:manifest.manifest_version,
   rules:{
     image_generation_automatic:false,
     name_based_generation:false,
     existing_approved_bytes_reuse_first:true,
     failed_id_only_retry:true,
     runtime_unlock_requires:['PUPPET_BODY:FIELD_NEUTRAL','FACE_STATES:neutral','DEPTH_SHADOW:field_default']
   },
   summary:{
     registered_members:members.length,
     pending_members:pending.length,
     P0_member_tasks:members.reduce((n,m)=>n+m.counts.P0,0),
     P1_member_tasks:members.reduce((n,m)=>n+m.counts.P1,0),
     P2_member_tasks:members.reduce((n,m)=>n+m.counts.P2,0),
     P1_shared_tasks:shared.length
   },
   members,shared_equipment:shared,pending_members:pending
 };
}
function main(){
 const manifest=JSON.parse(fs.readFileSync(path.join(ROOT,'crew-composable-asset-manifest.v1.json'),'utf8'));
 const q=build(manifest),payload=JSON.stringify(q,null,2)+'\n';
 const i=process.argv.indexOf('--out');
 if(i>=0){
  const rel=process.argv[i+1];if(!rel)throw new Error('OUT_PATH_REQUIRED');
  const out=path.resolve(process.cwd(),rel),allowed=path.resolve(ROOT,'qa');
  if(!(out===allowed||out.startsWith(allowed+path.sep)))throw new Error('QUEUE_REPORT_MUST_BE_QA_ONLY');
  fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,payload,'utf8');
 }
 process.stdout.write(payload);
}
if(require.main===module)main();
module.exports={build};
