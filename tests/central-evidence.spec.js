const {test,expect}=require('@playwright/test');

const BASE='http://127.0.0.1:4173/';
const READY='https://ready.example.test/';
function linked(){
 const p=new URLSearchParams({session_id:'S1',task_id:'T1',lap_id:'L1',
  from_app:'ready-set',return_target:READY,child_id:'A',subject:'english',
  concept_skill_target:'writing',learning_target_id:'writing:1'});
 return BASE+'?'+p;
}

test('Snap scoped outcome -> durable browser outbox -> exact central observation ACK',async({page})=>{
 await page.addInitScript(()=>{globalThis.SnapPopTrustedReadyTargets=['https://ready.example.test/'];});
 await page.goto(linked());
 const initial=await page.evaluate(()=>{
  let missing='';
  try{SnapPopBridge.configureCentralEvidence({});}catch(e){missing=e.message;}
  return {bundle:globalThis.TakyCentralEvidence?.pipeline?.VERSION,
   missing,status:SnapPopBridge.centralEvidenceStatus().status};
 });
 expect(initial).toEqual({bundle:'TAKY_PWA_SCOPED_EVIDENCE_PIPELINE_V1',
  missing:'EXPLICIT_TRUSTED_CENTRAL_SESSION_REQUIRED',status:'UNBOUND'});

 const event=await page.evaluate(()=>{
  window.__central=[];
  SnapPopBridge.configureCentralEvidence({
   dbName:'snap-central-evidence-v1',
   endpointUrl:'https://central.example.test/api/learning/evidence',
   sessionProvider:async()=>({authenticated:true,family_id:'F',selected_member_id:'A'}),
   tokenProvider:async()=> 'fixture-bearer-token-1234567890',
   fetchImpl:async(url,opts)=>{
    const packet=JSON.parse(opts.body);window.__central.push({url,packet,credentials:opts.credentials});
    return {status:200,json:async()=>({ok:true,storage_confirmed:true,
     acknowledgement_kind:'OBSERVATION_INGEST_RECEIPT',
     receipt_id:'fixture:'+packet.event.event_id,
     receipt_scope:{family_id:packet.context.family_id,member_id:packet.context.member_id},
     source_app:packet.source_app,packet_id:packet.packet_id,event_id:packet.event.event_id,
     duplicate:false})};
   }
  });
  return SnapPopBridge.emitLearningOutcome({completed:true,evidence_of_improvement:true,
   production_ref:'prod-1',rubric_ref:'rubric-1'});
 });
 await expect.poll(()=>page.evaluate(()=>SnapPopBridge.centralEvidenceStatus().status))
  .toBe('PENDING_CENTRAL_OUTBOX');
 expect(event.payload).toMatchObject({member_id:'A',subject:'english',
  concept_skill_target:'writing',learning_target_id:'writing:1',
  contextual_evidence_only:true,global_mastery_claim:false});
 expect(await page.evaluate(()=>window.__central.length)).toBe(0);
 const flushed=await page.evaluate(()=>SnapPopBridge.flushCentralEvidenceOnce('snap-browser-fixture'));
 expect(flushed).toMatchObject({processed:true,settled:true,status:'ACKED',
  reason:'CENTRAL_ACK_VALIDATED'});
 const sent=await page.evaluate(()=>({calls:window.__central,status:SnapPopBridge.centralEvidenceStatus()}));
 expect(sent.calls).toHaveLength(1);
 expect(sent.calls[0].credentials).toBe('omit');
 expect(sent.calls[0].packet.source_app).toBe('snap-pop');
 expect(sent.calls[0].packet.context).toMatchObject({family_id:'F',member_id:'A',
  subject:'english',concept_skill_target:'writing',learning_target_id:'writing:1'});
 expect(sent.calls[0].packet.evidence_policy).toMatchObject({observation_only:true,
  planner_schedule_authority:false,auto_award:false});
 expect(sent.status.status).toBe('CENTRAL_OBSERVATION_ACKED');
 await page.evaluate(()=>SnapPopBridge.closeCentralEvidence());
});

test('Snap member mismatch cannot reach central HTTP',async({page})=>{
 await page.addInitScript(()=>{globalThis.SnapPopTrustedReadyTargets=['https://ready.example.test/'];});
 await page.goto(linked());
 await page.evaluate(()=>{
  window.__calls=0;
  SnapPopBridge.configureCentralEvidence({
   dbName:'snap-central-mismatch-v1',
   endpointUrl:'https://central.example.test/api/learning/evidence',
   sessionProvider:async()=>({authenticated:true,family_id:'F',selected_member_id:'B'}),
   tokenProvider:async()=> 'fixture-bearer-token-1234567890',
   fetchImpl:async()=>{window.__calls++;throw Error('SHOULD_NOT_SEND');}
  });
  SnapPopBridge.emitLearningOutcome({completed:true,evidence_of_improvement:false});
 });
 await expect.poll(()=>page.evaluate(()=>SnapPopBridge.centralEvidenceStatus().reason))
  .toBe('SPECIALIST_EVENT_MEMBER_SCOPE_MISMATCH');
 expect(await page.evaluate(()=>window.__calls)).toBe(0);
 await page.evaluate(()=>SnapPopBridge.closeCentralEvidence());
});
