'use strict';
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const ROOT=__dirname;
const GROUPS=['MASTER_FULL','PROFILE','PUPPET_BODY','FACE_STATES','ACTION_PARTS','PEEK_MASK','DEPTH_SHADOW'];
function digest(p){return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');}
function groupReady(g,id,verifyFiles){
  if(!g||!Array.isArray(g.assets)||g.assets.length===0)return false;
  for(const a of g.assets){
    if(a.approved!==true||a.visual_id!==id||a.group!==g.name&&a.group!==undefined){}
    if(typeof a.path!=='string'||!a.path||typeof a.sha256!=='string'||a.sha256.length!==64)return false;
    if(verifyFiles){
      const p=path.join(ROOT,a.path); if(!fs.existsSync(p)||digest(p)!==a.sha256)return false;
    }
  }
  return true;
}
function analyze(manifest,{verifyFiles=true}={}){
  if(!manifest||manifest.schema!=='TAKY_CREW_COMPOSABLE_ASSET_MANIFEST_V1')throw new Error('BAD_MANIFEST_SCHEMA');
  const members={};
  for(const [id,m] of Object.entries(manifest.members||{})){
    const states={}; const blockers=[];
    for(const g of GROUPS){
      const entry=m.groups?.[g];
      const ready=!!entry&&Array.isArray(entry.assets)&&entry.assets.length>0&&entry.assets.every(a=>{
        if(a.approved!==true||a.visual_id!==id||a.group!==g||!a.path||!a.sha256||!a.approval_ref)return false;
        if(!verifyFiles)return true;
        const p=path.join(ROOT,a.path); return fs.existsSync(p)&&digest(p)===a.sha256;
      });
      states[g]=ready?'APPROVED':'OPEN';
      if(!ready)blockers.push(g);
    }
    const runtimeBlockers=[];
    const body=m.groups?.PUPPET_BODY?.assets||[], faces=m.groups?.FACE_STATES?.assets||[], depth=m.groups?.DEPTH_SHADOW?.assets||[];
    if(!body.some(a=>a.approved===true&&a.key==='FIELD_NEUTRAL'))runtimeBlockers.push('PUPPET_BODY:FIELD_NEUTRAL');
    if(!faces.some(a=>a.approved===true&&a.key==='neutral'))runtimeBlockers.push('FACE_STATES:neutral');
    if(!depth.some(a=>a.approved===true&&a.key==='field_default'))runtimeBlockers.push('DEPTH_SHADOW:field_default');
    members[id]={
      visual_id:id,
      approved_groups:GROUPS.filter(g=>states[g]==='APPROVED'),
      open_groups:blockers,
      production_ready:blockers.length===0,
      runtime_fallback_ready:runtimeBlockers.length===0,
      runtime_blockers:runtimeBlockers
    };
  }
  const pending={};
  for(const [id,m] of Object.entries(manifest.pending_members||{})){
    pending[id]={
      visual_id:id,
      code:m.code||null,
      production_ready:false,
      runtime_fallback_ready:false,
      blockers:[
        ...(m.individual_source_verified===true?[]:['INDIVIDUAL_SOURCE_SHA']),
        ...(m.cutout_sha256?[]:['CUTOUT_SHA']),
        ...(m.mask_spec_sha256?[]:['MASK_SPEC_SHA']),
        ...GROUPS.map(g=>'GROUP:'+g)
      ]
    };
  }
  const vals=Object.values(members);
  return {
    schema:'TAKY_CREW_COMPOSABLE_READINESS_V1',
    contract_version:manifest.contract_version,
    manifest_version:manifest.manifest_version,
    runtime_schema_version:manifest.runtime_schema_version,
    summary:{
      registered_members:vals.length,
      pending_members:Object.keys(pending).length,
      production_ready_members:vals.filter(x=>x.production_ready).length,
      runtime_fallback_ready_members:vals.filter(x=>x.runtime_fallback_ready).length,
      approved_group_instances:vals.reduce((n,x)=>n+x.approved_groups.length,0),
      open_group_instances:vals.reduce((n,x)=>n+x.open_groups.length,0),
      pending_group_instances:Object.keys(pending).length*GROUPS.length
    },
    members,pending
  };
}
function main(){
  const manifest=JSON.parse(fs.readFileSync(path.join(ROOT,'crew-composable-asset-manifest.v1.json'),'utf8'));
  const report=analyze(manifest);
  const payload=JSON.stringify(report,null,2)+'\n';
  const idx=process.argv.indexOf('--out');
  if(idx>=0){
    const rel=process.argv[idx+1]; if(!rel)throw new Error('OUT_PATH_REQUIRED');
    const out=path.resolve(process.cwd(),rel);
    const allowed=path.resolve(ROOT,'qa');
    if(!(out===allowed||out.startsWith(allowed+path.sep)))throw new Error('READINESS_REPORT_MUST_BE_QA_ONLY');
    fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,payload,'utf8');
  }
  process.stdout.write(payload);
}
if(require.main===module)main();
module.exports={analyze,GROUPS};
