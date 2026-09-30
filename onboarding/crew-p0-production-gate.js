'use strict';
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const ROOT=__dirname;
function sha(p){return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');}
function evaluate(contract,manifest,{verifyFiles=true}={}){
 if(!contract||contract.schema!=='TAKY_CREW_P0_PRODUCTION_CONTRACT_V1')throw new Error('BAD_P0_CONTRACT_SCHEMA');
 if(!manifest||manifest.schema!=='TAKY_CREW_COMPOSABLE_ASSET_MANIFEST_V1')throw new Error('BAD_MANIFEST_SCHEMA');
 if(contract.contract_version!==manifest.contract_version||contract.manifest_version!==manifest.manifest_version)throw new Error('VERSION_POINTER_MISMATCH');
 const members={}; let readyOutputs=0,readyMembers=0;
 for(const spec of contract.members||[]){
  const id=spec.visual_id,m=manifest.members?.[id]; if(!m)throw new Error('MANIFEST_MEMBER_MISSING:'+id);
  if(m.source_sha256!==spec.source_master_sha256)throw new Error('SOURCE_SHA_MISMATCH:'+id);
  const outputs=[];
  for(const o of spec.outputs||[]){
   let ready=false,reason='OUTPUT_NOT_REGISTERED';
   const g=m.groups?.[o.group],reg=(g?.assets||[]).find(a=>a.key===o.key);
   if(reg){
    if(reg.visual_id!==id) reason='VISUAL_ID_MISMATCH';
    else if(reg.source_sha256!==spec.source_master_sha256) reason='SOURCE_SHA_MISMATCH';
    else if(reg.approved!==true) reason='NOT_APPROVED';
    else if(!reg.approval_ref) reason='APPROVAL_REF_MISSING';
    else if(!reg.sha256||reg.sha256.length!==64) reason='SHA_MISSING';
    else if(verifyFiles){
      const p=path.join(ROOT,reg.path);
      if(!fs.existsSync(p)) reason='FILE_MISSING';
      else if(sha(p)!==reg.sha256) reason='SHA_BYTE_MISMATCH';
      else {ready=true;reason='READY';}
    } else {ready=true;reason='READY';}
   }
   if(ready)readyOutputs++;
   outputs.push({group:o.group,key:o.key,path:o.path,ready,reason});
  }
  const ready=outputs.length===3&&outputs.every(x=>x.ready);
  if(ready)readyMembers++;
  members[id]={ready,outputs};
 }
 return {
  schema:'TAKY_CREW_P0_GATE_REPORT_V1',
  contract_version:contract.contract_version,
  manifest_version:contract.manifest_version,
  summary:{members:Object.keys(members).length,total_outputs:Object.values(members).reduce((n,x)=>n+x.outputs.length,0),ready_outputs:readyOutputs,ready_members:readyMembers},
  members
 };
}
function main(){
 const contract=JSON.parse(fs.readFileSync(path.join(ROOT,'crew-p0-production-contract.v1.json'),'utf8'));
 const manifest=JSON.parse(fs.readFileSync(path.join(ROOT,'crew-composable-asset-manifest.v1.json'),'utf8'));
 const r=evaluate(contract,manifest),payload=JSON.stringify(r,null,2)+'\n';
 const i=process.argv.indexOf('--out');
 if(i>=0){
  const rel=process.argv[i+1];if(!rel)throw new Error('OUT_PATH_REQUIRED');
  const out=path.resolve(process.cwd(),rel),allowed=path.resolve(ROOT,'qa');
  if(!(out===allowed||out.startsWith(allowed+path.sep)))throw new Error('P0_REPORT_MUST_BE_QA_ONLY');
  fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,payload,'utf8');
 }
 process.stdout.write(payload);
}
if(require.main===module)main();
module.exports={evaluate};
