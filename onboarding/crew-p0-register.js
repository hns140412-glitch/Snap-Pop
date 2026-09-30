'use strict';
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const ROOT=__dirname;
const CONTRACT_PATH=path.join(ROOT,'crew-p0-production-contract.v1.json');
const MANIFEST_PATH=path.join(ROOT,'crew-composable-asset-manifest.v1.json');
function sha(p){return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');}
function pngHeader(p){
 const b=fs.readFileSync(p);
 if(b.length<33||b.slice(0,8).toString('hex')!=='89504e470d0a1a0a')throw new Error('NOT_PNG');
 if(b.slice(12,16).toString('ascii')!=='IHDR')throw new Error('PNG_IHDR_MISSING');
 return {width:b.readUInt32BE(16),height:b.readUInt32BE(20),bit_depth:b[24],color_type:b[25]};
}
function load(){return {
 contract:JSON.parse(fs.readFileSync(CONTRACT_PATH,'utf8')),
 manifest:JSON.parse(fs.readFileSync(MANIFEST_PATH,'utf8'))
};}
function findSpec(contract,id,group,key){
 const m=(contract.members||[]).find(x=>x.visual_id===id);if(!m)throw new Error('P0_MEMBER_UNKNOWN');
 const o=(m.outputs||[]).find(x=>x.group===group&&x.key===key);if(!o)throw new Error('P0_OUTPUT_UNKNOWN');
 return {member:m,output:o};
}
function inspect(contract,id,group,key){
 const {member,output}=findSpec(contract,id,group,key);
 const abs=path.join(ROOT,output.path);
 if(!fs.existsSync(abs))return {visual_id:id,group,key,path:output.path,state:'MISSING',ready:false};
 const h=pngHeader(abs);
 const expected=member.canvas_size||[1122,1402];
 if(h.width!==expected[0]||h.height!==expected[1])throw new Error('CANVAS_SIZE_MISMATCH');
 if(h.bit_depth!==8||h.color_type!==6)throw new Error('PNG_MUST_BE_8BIT_RGBA');
 return {visual_id:id,group,key,path:output.path,state:'FILE_VALID_UNAPPROVED',ready:false,sha256:sha(abs),png:h,source_sha256:member.source_master_sha256};
}
function register({id,group,key,approvalRef,apply=false}){
 if(!approvalRef||typeof approvalRef!=='string')throw new Error('APPROVAL_REF_REQUIRED');
 const {contract,manifest}=load();
 const proposal=inspect(contract,id,group,key);
 if(proposal.state!=='FILE_VALID_UNAPPROVED')throw new Error('P0_FILE_NOT_READY_FOR_REGISTRATION');
 const {member,output}=findSpec(contract,id,group,key);
 const mm=manifest.members?.[id];if(!mm)throw new Error('MANIFEST_MEMBER_MISSING');
 const asset={group,key,path:output.path,sha256:proposal.sha256,approved:true,visual_id:id,source_sha256:member.source_master_sha256,approval_ref:approvalRef};
 const result={...proposal,approval_ref:approvalRef,registration:'PROPOSAL_ONLY'};
 if(!apply)return result;
 const existing=(mm.groups[group].assets||[]).filter(a=>a.key!==key);
 mm.groups[group].assets=[...existing,asset];
 mm.groups[group].state='APPROVED';
 output.sha256=proposal.sha256;output.approval_ref=approvalRef;output.status='READY_REGISTERED';
 const ready=member.outputs.every(o=>o.status==='READY_REGISTERED');
 if(ready){mm.runtime_fallback_eligible=true;}
 contract.summary.ready_outputs=contract.members.reduce((n,m)=>n+m.outputs.filter(o=>o.status==='READY_REGISTERED').length,0);
 contract.summary.ready_members=contract.members.filter(m=>m.outputs.every(o=>o.status==='READY_REGISTERED')).length;
 fs.writeFileSync(CONTRACT_PATH,JSON.stringify(contract,null,2)+'\n','utf8');
 fs.writeFileSync(MANIFEST_PATH,JSON.stringify(manifest,null,2)+'\n','utf8');
 return {...result,registration:'APPLIED'};
}
function audit(){
 const {contract}=load();const rows=[];
 for(const m of contract.members)for(const o of m.outputs)rows.push(inspect(contract,m.visual_id,o.group,o.key));
 return {schema:'TAKY_CREW_P0_REGISTRATION_AUDIT_V1',total:rows.length,present:rows.filter(x=>x.state!=='MISSING').length,missing:rows.filter(x=>x.state==='MISSING').length,rows};
}
function arg(name){const i=process.argv.indexOf(name);return i>=0?process.argv[i+1]:null;}
function main(){
 const mode=arg('--mode')||'audit';
 if(mode==='audit'){process.stdout.write(JSON.stringify(audit(),null,2)+'\n');return;}
 if(mode!=='register')throw new Error('MODE_MUST_BE_AUDIT_OR_REGISTER');
 const r=register({id:arg('--visual-id'),group:arg('--group'),key:arg('--key'),approvalRef:arg('--approval-ref'),apply:process.argv.includes('--apply')});
 process.stdout.write(JSON.stringify(r,null,2)+'\n');
}
if(require.main===module){try{main();}catch(e){console.error(e.message);process.exit(2);}}
module.exports={audit,inspect,register,pngHeader};
