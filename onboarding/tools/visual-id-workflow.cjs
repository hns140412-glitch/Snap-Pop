#!/usr/bin/env node
'use strict';
// TAKY Visual ID work-order executor: plan → register to STAGING → audit/report.
// It NEVER invents art, overwrites approved originals or activates a member.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const ROOT=path.resolve(__dirname,'..'),STAGED=path.join(ROOT,'visual-id-candidates');
const cfg=require('../visual-id-production-contract.json');
const registry=require('../visual-id-runtime.js');
const sourceManifest=require('../asset-and-release-gate.json');
const scope=require('../crew-scope-contract.json');
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
const validId=id=>typeof id==='string'&&/^[a-z][a-z0-9_-]{1,40}$/.test(id);
function inside(rel){
  if(typeof rel!=='string'||!rel||rel.includes('\\')||path.posix.isAbsolute(rel)||rel.split('/').some(p=>p==='.'||p==='..'||!p))return null;
  const full=path.resolve(ROOT,rel);
  if(full===ROOT||!full.startsWith(ROOT+path.sep))return null;
  return full;
}
function hashFile(rel){
  const full=inside(rel);if(!full||!fs.existsSync(full)||!fs.statSync(full).isFile()||fs.lstatSync(full).isSymbolicLink())return null;
  return digest(fs.readFileSync(full));
}
function verified(rel,expect){
  const actual=hashFile(rel);
  const manifest=sourceManifest.required_assets[rel];
  return Boolean(actual&&actual===expect&&manifest===expect&&/^[a-f0-9]{64}$/.test(expect));
}
function pathsFor(id){
  if(!validId(id))throw Error('VISUAL_ID_BAD_FORMAT');
  const base='characters/produced/'+id+'/';
  return Object.freeze({
    original:'characters/originals/'+id+'_source.png',
    cutout:base+'static-cutout.png',
    layers:Object.fromEntries(cfg.independentLayers.map(k=>[k,base+'layers/'+k.toLowerCase()+'.png'])),
    reactions:Object.fromEntries(cfg.reactions.map(k=>[k,base+'reactions/'+k.toLowerCase()+'.png'])),
    scene:'ui/approved/'+id+'_first_meeting_scene.png'
  });
}
function plan(id){
  if(!validId(id))throw Error('VISUAL_ID_BAD_FORMAT');
  const p=pathsFor(id);
  return {
    schema:cfg.schema,visualId:id,registered:registry.memberIds.includes(id),
    inputRequired:['user confirmed Visual ID','exact approved original file and SHA256','visual approval reference','owner/alias evidence'],
    assetWorkOrder:p,
    independentAssetSlots:[...cfg.independentLayers,...cfg.reactions],
    sceneWorkOrder:Object.fromEntries(cfg.sceneKeys.map(k=>[k,{referenceId:null,renderBinding:null,approvedState:'OPEN',fourViewportEvidence:[]} ])),
    additionalTasks:['original visual fidelity/provenance check per derived asset','recompose group first-meeting scene; do NOT overlay old Core6 original','add name/behavior/ledger to reconciled semantic owner','bind every scene and six reaction states to real UI','run full browser/visual/device regression','record human signoff before ROOT release'],
    warning:'PLAN IS NOT ART GENERATION NOR REGISTRATION NOR APPROVAL'
  };
}
function candidateFile(id){
  if(!validId(id))throw Error('VISUAL_ID_BAD_FORMAT');
  return path.join(STAGED,id+'.json');
}
function register(id,approvalRef,source){
  if(!validId(id)||registry.memberIds.includes(id))throw Error('NEW_IMMUTABLE_VISUAL_ID_REQUIRED');
  if(typeof approvalRef!=='string'||approvalRef.trim().length<6)throw Error('USER_VISUAL_APPROVAL_REFERENCE_REQUIRED');
  if(typeof source!=='string'||!new RegExp('^characters/originals/'+id+'_source\\.(png|jpe?g)$').test(source))throw Error('SOURCE_PATH_IDENTITY_MISMATCH');
  const hash=hashFile(source);
  if(!hash||sourceManifest.required_assets[source]!==hash)throw Error('LOCK_APPROVED_SOURCE_BYTES_IN_REQUIRED_ASSETS_FIRST');
  if(fs.existsSync(candidateFile(id)))throw Error('DUPLICATE_ID_REGISTRATION_FORBIDDEN');
  const p=pathsFor(id),item={
    schema:cfg.schema,id,stage:'STAGED_SOURCE_LOCKED',
    visualApproval:{status:'LOCKED',reference:approvalRef,sourcePath:source,sha256:hash},
    planned:p,
    produced:{layers:{},reactions:{},cutout:null,firstMeetingScene:null},
    provenance:{},behaviorOwnerEvidence:null,sceneContracts:{},
    rendererEvidence:null,visualReview:null,realDeviceEvidence:null,rootOwnerApproval:null
  };
  fs.mkdirSync(STAGED,{recursive:true});
  fs.writeFileSync(candidateFile(id),JSON.stringify(item,null,2)+'\n',{flag:'wx'});
  return {file:path.relative(ROOT,candidateFile(id)),registration:'STAGING_ONLY_NOT_ACTIVE',workOrder:plan(id)};
}
function approvedTransparentImage(rel){
  const full=inside(rel);if(!full||!fs.existsSync(full))return false;
  const b=fs.readFileSync(full);
  // Enforce transparent, independent illustrated PNG layers. Existence of an alpha channel
  // is NOT proof of actual separation: source provenance and visual review remain mandatory.
  return b.length>33&&b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))&&b.toString('ascii',12,16)==='IHDR'&&[4,6].includes(b[25]);
}
function inspectCandidate(item){
  const open=[],passed=[],id=item&&item.id;
  const add=(yes,reason)=>{(yes?passed:open).push(reason);};
  if(!validId(id)||registry.memberIds.includes(id))return {id:id||null,stage:'SOURCE_MISSING',passed,open:['NEW_IMMUTABLE_VISUAL_ID_REQUIRED'],releaseReady:false};
  const p=pathsFor(id),v=item.visualApproval||{};
  add(item.schema===cfg.schema,'SCHEMA_AND_VERSION');
  add(v.status==='LOCKED'&&typeof v.reference==='string'&&v.reference.trim().length>=6,'USER_APPROVED_SOURCE_REFERENCE');
  add(v.sourcePath===p.original||v.sourcePath==='characters/originals/'+id+'_source.jpeg'||v.sourcePath==='characters/originals/'+id+'_source.jpg','ORIGINAL_SOURCE_IDENTITY_MATCH');
  add(verified(v.sourcePath,v.sha256),'ORIGINAL_BYTE_HASH_AND_MANIFEST');
  const allAssets=[];
  const checkDerived=(record,expected,slot)=>{
    const actual=record&&typeof record==='object'?record:{};
    const rel=actual.path;
    const correct=rel===expected&&verified(rel,actual.sha256)&&approvedTransparentImage(rel);
    add(correct,'EXACT_INDEPENDENT_TRANSPARENT_ASSET:'+slot);
    if(correct)allAssets.push(actual.sha256);
    const prov=item.provenance?.[slot];
    add(Boolean(prov&&prov.originalSha256===v.sha256&&cfg.assetProvenanceMethods.includes(prov.method)&&typeof prov.reviewRef==='string'&&prov.reviewRef.trim()),'SOURCE_FIDELITY_PROVENANCE:'+slot);
  };
  checkDerived(item.produced?.cutout,p.cutout,'CUTOUT');
  cfg.independentLayers.forEach(k=>checkDerived(item.produced?.layers?.[k],p.layers[k],k));
  cfg.reactions.forEach(k=>checkDerived(item.produced?.reactions?.[k],p.reactions[k],k));
  checkDerived(item.produced?.firstMeetingScene,p.scene,'NEW_FIRST_MEETING_COMPOSITION');
  add(allAssets.length===11&&new Set(allAssets).size===11,'DISTINCT_DERIVED_BINARY_ASSETS_NOT_REUSED_FLAT_IMAGE');
  for(const k of cfg.sceneKeys){
    const c=item.sceneContracts?.[k];
    add(Boolean(c&&typeof c.approvedReference==='string'&&c.approvedReference.trim()&&typeof c.renderBinding==='string'&&c.renderBinding.trim()&&c.sourceApproval===true),'SCENE_REFERENCE_AND_EXPLICIT_BINDING:'+k);
    add(Boolean(c&&Array.isArray(c.fourViewportEvidence)&&cfg.viewportSizes.every(size=>c.fourViewportEvidence.some(e=>e.viewport===size&&/^[a-f0-9]{64}$/.test(e.sha256)&&typeof e.artifactRef==='string'&&e.artifactRef.trim()))),'SCENE_FOUR_VIEWPORT_EVIDENCE:'+k);
  }
  const b=item.behaviorOwnerEvidence;
  add(Boolean(b&&b.ownerVerified===true&&b.visualId===id&&typeof b.personalitySource==='string'&&b.personalitySource.trim()&&b.aliasReviewed===true),'SEMANTIC_OWNER_PERSONALITY_AND_ALIAS');
  add(registry.memberIds.includes(id)&&scope.roster.original_ids.includes(id),'ACTUAL_UI_REGISTRY_AND_LEDGER_BINDING');
  add(Boolean(item.rendererEvidence?.sixReactionStatesTested&&item.rendererEvidence?.noMissingAssets&&item.rendererEvidence?.accessibleReducedMotion&&item.rendererEvidence?.fullJourneyRegression),'ACTUAL_REACTION_AND_UI_REGRESSION');
  add(Boolean(item.visualReview?.userApproved===true&&item.visualReview?.sourceToRenderComparisonRef),'HUMAN_1_TO_1_VISUAL_APPROVAL');
  add(Boolean(item.realDeviceEvidence?.verified===true&&item.realDeviceEvidence?.reference),'REAL_DEVICE_INTERACTION');
  add(Boolean(item.rootOwnerApproval?.userConfirmed===true&&item.rootOwnerApproval?.reference),'SNAP_ROOT_RELEASE_SEPARATE_APPROVAL');
  return {id,stage:open.length?'ASSET_OR_INTEGRATION_OPEN':'RELEASE_CANDIDATE_NOT_AUTO_RELEASED',passed,open,
    technicalReady:false,releaseReady:false,automaticArtGeneration:false,automaticPublish:false,
    note:'Self-reported evidence references do not substitute independent human image/interaction review. This agent workflow never activates ROOT.'};
}
function report(){
  const existing=registry.memberIds.map(id=>{const row=registry.renderPlan(id);return {id,stage:'STATIC_PREVIEW',source:registry.member(id).source,staticCutout:row.staticCutout,missing:row.missing,actionReady:false,releaseReady:false}});
  const staged=[];
  if(fs.existsSync(STAGED))for(const name of fs.readdirSync(STAGED).filter(x=>x.endsWith('.json')).sort()){
    const id=name.slice(0,-5),full=candidateFile(id);
    if(fs.lstatSync(full).isSymbolicLink())throw Error('CANDIDATE_SYMLINK_REJECTED');
    const obj=JSON.parse(fs.readFileSync(full,'utf8'));if(obj.id!==id)throw Error('CANDIDATE_FILENAME_ID_MISMATCH:'+name);
    staged.push(inspectCandidate(obj));
  }
  return {schema:cfg.schema,referenceAuthority:'LIVE_MANIFEST_PLUS_ORIGINAL_SOURCE',existing,staged,
    counts:{staticBound:existing.length,independentLayerAssetsMissing:existing.reduce((n,x)=>n+x.missing.filter(s=>s.startsWith('LAYER:')).length,0),
      independentReactionAssetsMissing:existing.reduce((n,x)=>n+x.missing.filter(s=>s.startsWith('REACTION:')).length,0),pendingNewRegistrations:staged.length},
    nextAction:'Produce independent approved-source assets and bind actual scenes; reject silent art generation or release',
    rootActivation:false,mainMerge:false,netlify:false};
}
function cli(argv){
  const [cmd,...args]=argv;let out;
  if(cmd==='plan')out=plan(args[0]);
  else if(cmd==='register')out=register(args[0],args[1],args[2]);
  else if(cmd==='audit'){if(!args[0]||!validId(args[0]))throw Error('AUDIT_CANDIDATE_ID_REQUIRED');out=inspectCandidate(JSON.parse(fs.readFileSync(candidateFile(args[0]),'utf8')));}
  else if(cmd==='report')out=report();
  else throw Error('USAGE: visual-id-workflow.cjs plan <new-id> | register <new-id> <user-approval-ref> <approved-source-path> | audit <staged-id> | report');
  process.stdout.write(JSON.stringify(out,null,2)+'\n');
}
if(require.main===module){try{cli(process.argv.slice(2));}catch(e){process.stderr.write(String(e.message)+'\n');process.exitCode=1;}}
module.exports={plan,register,inspectCandidate,report,pathsFor,inside,hashFile,verified};
