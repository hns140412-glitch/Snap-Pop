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

 const event=await page.evaluate(async()=>{
  window.__central=[];
  SnapPopBridge.configureCentralEvidence({
   dbName:'snap-central-evidence-v1',
   endpointUrl:'https://central.example.test/api/learning/evidence',
   sessionProvider:async()=>({authenticated:true,family_id:'F',selected_member_id:'A'}),
   tokenProvider:async()=> 'fixture-bearer-token-1234567890',
   fetchImpl:async(url,opts)=>{
    if(String(url).includes('/decision')){
      window.__decisionRequest={url,body:JSON.parse(opts.body),credentials:opts.credentials};
      return {status:200,json:async()=>({
        ok:true,authenticated_server_response:true,
        receipt_scope:{family_id:'F',member_id:'A'},
        runtime_result:{growth_next_step:{
          ok:true,version:'TAKY_GROWTH_NEXT_STEP_POLICY_V2',
          authority:'LEARNING_ENGINE_GROWTH_INTENT_ONLY',
          support_phase:'ELICIT_PULL',
          question_depth:{level:3},
          growth_control:{
            evidence_confidence:'MEDIUM',
            learning_intensity:'BUILD_CONNECT',
            expression_level:'L3_EXPANDED_SENTENCE',
            easy_english_level:'EASY_ENGLISH',
            question_depth:3,
            hint_strength:'PARTIAL_FRAME',
            hint_fade:'FADE_ONE_STEP_WHEN_SUCCESSFUL',
            challenge_direction:'EXTEND'
          },
          language_support:{
            easy_english_definitions:['to put an idea into words'],
            expression_chunks:['I think ... because ...'],
            grammar_patterns:['I think + clause']
          },
          hide_to_snap_handoff:{
            final_answer_generation_forbidden:true,
            child_authorship_required:true
          },
          guards:{engine_guides_growth_not_answers:true}
        }}
      })};
    }
    const packet=JSON.parse(opts.body);window.__central.push({url,packet,credentials:opts.credentials});
    return {status:200,json:async()=>({ok:true,storage_confirmed:true,
     acknowledgement_kind:'OBSERVATION_INGEST_RECEIPT',
     receipt_id:'fixture:'+packet.event.event_id,
     receipt_scope:{family_id:packet.context.family_id,member_id:packet.context.member_id},
     source_app:packet.source_app,packet_id:packet.packet_id,event_id:packet.event.event_id,
     duplicate:false})};
   }
  });
  for(let i=0;i<50&&SnapPopBridge.growthDecisionStatus().status!=='READY';i++)
    await new Promise(r=>setTimeout(r,10));
  return SnapPopBridge.emitLearningOutcome({completed:true,evidence_of_improvement:true,
   production_ref:'prod-1',rubric_ref:'rubric-1'});
 });
 await expect.poll(()=>page.evaluate(()=>SnapPopBridge.centralEvidenceStatus().status))
  .toBe('PENDING_CENTRAL_OUTBOX');
 expect(event.payload).toMatchObject({member_id:'A',subject:'english',
  concept_skill_target:'writing',learning_target_id:'writing:1',
  contextual_evidence_only:true,global_mastery_claim:false,
  growth_intent_ref:'TAKY_GROWTH_NEXT_STEP_POLICY_V2',
  growth_control_applied:{
    evidence_confidence:'MEDIUM',
    learning_intensity:'BUILD_CONNECT',
    expression_level:'L3_EXPANDED_SENTENCE',
    question_depth:3,
    hint_strength:'PARTIAL_FRAME',
    challenge_direction:'EXTEND'
  }});
 await expect.poll(()=>page.evaluate(()=>SnapPopBridge.growthDecisionStatus().status)).toBe('READY');
 expect(await page.evaluate(()=>window.__central.length)).toBe(0);
 const growth=await page.evaluate(()=>({prompt:SnapPopBridge.growthPrompt(1),request:window.__decisionRequest}));
 expect(growth.request.credentials).toBe('omit');
 expect(growth.request.body).toMatchObject({family_id:'F',member_id:'A',subject:'english',concept_skill_target:'writing'});
 expect(growth.prompt.question).toContain('your own English');
 expect(growth.prompt.hint).toContain('I think');
 expect(growth.prompt.expression_level).toBe('L3_EXPANDED_SENTENCE');
 expect(growth.prompt.learning_intensity).toBe('BUILD_CONNECT');
 expect(growth.prompt.hint_strength).toBe('PARTIAL_FRAME');
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


test('Hide -> Snap continuity re-resolves growth centrally instead of trusting URL policy',async({page})=>{
 await page.addInitScript(()=>{globalThis.SnapPopTrustedReadyTargets=['https://ready.example.test/'];});
 const p=new URLSearchParams({
  session_id:'S-HIDE',task_id:'T-HIDE',lap_id:'L-HIDE',goal_id:'G-HIDE',
  from_app:'hide-seek',return_target:READY,child_id:'A',subject:'english',
  concept_skill_target:'vocabulary',learning_target_id:'word:accept',
  word:'accept',word_context:'new context'
 });
 await page.goto(BASE+'?'+p.toString());
 const result=await page.evaluate(async()=>{
  window.__decisionCalls=[];
  SnapPopBridge.configureCentralEvidence({
    dbName:'snap-hide-growth-v1',
    endpointUrl:'https://central.example.test/api/learning/evidence',
    decisionEndpointUrl:'https://central.example.test/api/learning/decision',
    sessionProvider:async()=>({authenticated:true,family_id:'F',selected_member_id:'A'}),
    tokenProvider:async()=> 'fixture-bearer-token-1234567890',
    fetchImpl:async(url,opts)=>{
      if(!String(url).includes('/decision'))throw Error('NO_EVIDENCE_SEND_EXPECTED');
      window.__decisionCalls.push({url,body:JSON.parse(opts.body),credentials:opts.credentials});
      return {status:200,json:async()=>({
        ok:true,authenticated_server_response:true,
        receipt_scope:{family_id:'F',member_id:'A'},
        runtime_result:{growth_next_step:{
          ok:true,version:'TAKY_GROWTH_NEXT_STEP_POLICY_V2',
          authority:'LEARNING_ENGINE_GROWTH_INTENT_ONLY',
          support_phase:'TRANSFER_PUSH',
          question_depth:{level:5},
          growth_control:{
            evidence_confidence:'HIGH',
            learning_intensity:'STRETCH_TRANSFER',
            expression_level:'L5_TRANSFER_CREATION',
            easy_english_level:'CONTEXTUAL_EASY_ENGLISH',
            question_depth:5,
            hint_strength:'MINIMAL_CUE',
            hint_fade:'MINIMAL_CUE',
            challenge_direction:'TRANSFER'
          },
          language_support:{
            easy_english_definitions:['to say yes to something or receive it'],
            expression_chunks:['accept an idea'],
            grammar_patterns:['accept + noun']
          },
          hide_to_snap_handoff:{final_answer_generation_forbidden:true,child_authorship_required:true},
          guards:{engine_guides_growth_not_answers:true}
        }}
      })};
    }
  });
  for(let i=0;i<50&&SnapPopBridge.growthDecisionStatus().status!=='READY';i++)
    await new Promise(r=>setTimeout(r,10));
  return {
    handoff:SnapPopBridge.handoffStatus(),
    context:SnapPopBridge.context(),
    growth:SnapPopBridge.getLearningGrowthDecision(),
    prompt:SnapPopBridge.growthPrompt(2),
    calls:window.__decisionCalls
  };
 });
 expect(result.handoff.ok).toBe(true);
 expect(result.context.handoff_via_hide_seek).toBe(true);
 expect(result.context.continuity_source_authoritative).toBe(false);
 expect(result.calls).toHaveLength(1);
 expect(result.growth.authority).toBe('LEARNING_ENGINE_GROWTH_INTENT_ONLY');
 expect(result.prompt.question).toContain('Create a new situation');
 expect(result.prompt.hint).toContain('without translating every word');
 expect(result.prompt.expression_level).toBe('L5_TRANSFER_CREATION');
 expect(result.prompt.learning_intensity).toBe('STRETCH_TRANSFER');
});
