const {test,expect}=require('@playwright/test');
test.use({serviceWorkers:'block'});

const SNAP=process.env.SNAP_TEST_URL||'http://127.0.0.1:4175/';
const READY='https://ready-set-staging-taky.netlify.app/';

function contextToken(){
  return Buffer.from(JSON.stringify({
    contract_version:'READY_LEARNING_CONTEXT_V1',
    learning_unit_id:'LU1',analysis_id:'AN1',assignment_id:'AS1',
    subject:'영어',concept_skill_target:'문장 표현',
    activity_types:[],cognitive_load_profile:[],divisible_boundary:null,
    confidence:1,unresolved_flags:[],
    provenance:{engine:'READY_SCOPED_SPECIALIST_CONTINUITY_ONLY',
      version:'READY_SNAP_RUN_SCOPE_V01',confirmation_state:'FACT_CONFIRMED'}
  }),'utf8').toString('base64url');
}

function linkedUrl(fromApp='ready-set'){
  const url=new URL(SNAP);
  const params={session_id:'S1',goal_id:'G1',task_id:'T1',lap_id:'L1',
    return_target:READY,from_app:fromApp,child_id:'CHILD_A',
    subject:'영어',concept_skill_target:'문장 표현',
    learning_target_id:'LU1',learning_context:contextToken()};
  for(const [k,v] of Object.entries(params))url.searchParams.set(k,v);
  return url;
}

test('Snap receives and decodes confirmed Ready learning context',async({page})=>{
  await page.goto(linkedUrl().href,{waitUntil:'load'});
  const result=await page.evaluate(()=>({
    bridge:window.SnapPopBridge.learningContext(),
    provider:window.SnapPopLearningContextProvider?.current?.()||null
  }));
  expect(result.bridge.contract_version).toBe('READY_LEARNING_CONTEXT_V1');
  expect(result.bridge.learning_unit_id).toBe('LU1');
  expect(result.bridge.provenance.confirmation_state).toBe('FACT_CONFIRMED');
  expect(result.provider.source).toBe('READY_SET_LEARNING_MASTER');
  expect(result.provider.learning_unit_id).toBe('LU1');
});

test('Snap receives Hide word and context as expression material',async({page})=>{
  const url=linkedUrl('hide-seek');
  url.searchParams.set('word','focus');
  url.searchParams.set('word_context','문맥');
  await page.goto(url.href,{waitUntil:'load'});
  await expect(page.locator('#snapWordChip')).toContainText('focus');
  const material=await page.evaluate(()=>window.SnapPopBridge.vocabularyMaterial());
  expect(material.word).toBe('focus');
  expect(material.word_context).toBe('문맥');
});

test('Snap same-tab return preserves run ids and minimal provenance',async({page})=>{
  await page.route(READY+'**',route=>route.abort());
  await page.goto(linkedUrl().href,{waitUntil:'load'});
  const request=page.waitForRequest(r=>r.url().startsWith(READY+'?'));
  await page.evaluate(()=>window.SnapPopBridge.returnToBase('COMPLETED',{
    child_authored:true,landmark:'LIGHTHOUSE',
    learning_provenance:{contract_version:'READY_LEARNING_CONTEXT_V1',
      learning_unit_id:'LU1',analysis_id:'AN1',assignment_id:'AS1',
      subject:'영어',concept_skill_target:'문장 표현'}
  }));
  const url=new URL((await request).url());
  expect(url.searchParams.get('session_id')).toBe('S1');
  expect(url.searchParams.get('task_id')).toBe('T1');
  expect(url.searchParams.get('lap_id')).toBe('L1');
  expect(url.searchParams.get('task_state')).toBe('COMPLETED');
  const raw=url.searchParams.get('result_payload');
  expect(raw).toBeTruthy();
  const payload=JSON.parse(Buffer.from(raw,'base64url').toString('utf8'));
  expect(payload.child_authored).toBe(true);
  expect(payload.learning_provenance.learning_unit_id).toBe('LU1');
});
