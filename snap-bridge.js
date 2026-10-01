(() => {
  'use strict';

  const BRIDGE_VERSION = '2026.09.07-a';
  const CONTEXT_KEY = 'snap_pop_shared_context_v1';
  const OUTBOX_KEY = 'snap_pop_shared_outbox_v1';
  const PARAMS = ['session_id','goal_id','task_id','lap_id','return_target','from_app','word','word_context','child_id','subject','concept_skill_target','learning_target_id'];

  const EventEnvelope = globalThis.TakyEventEnvelope;
  const ScopeGuard = globalThis.SnapReadyScopeGuardV01;
  if(!EventEnvelope?.create) throw new Error('SNAP_SHARED_EVENT_ENVELOPE_UNAVAILABLE');
  if(!ScopeGuard?.prepareContext) throw new Error('SNAP_READY_SCOPE_GUARD_UNAVAILABLE');
  // Configured by the owning host, never learned from a link or referrer.
  const trustedReadyTargets=ScopeGuard.allowedTargets(globalThis.SnapPopTrustedReadyTargets);
  const iso = () => new Date().toISOString();
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  function readStoredContext() {
    try { return JSON.parse(sessionStorage.getItem(CONTEXT_KEY) || '{}') || {}; }
    catch { return {}; }
  }

  function persistContext(context) {
    sessionStorage.setItem(CONTEXT_KEY, JSON.stringify(context || {}));
  }

  function readIncomingContext() {
    const p = new URLSearchParams(location.search);
    const incoming = {};
    PARAMS.forEach(key => {
      const value = p.get(key);
      if (value) incoming[key] = value;
    });
    return incoming;
  }

  let context = readStoredContext();
  let handoffRejection=null;

  function bootContext() {
    const incoming = readIncomingContext();
    const params=new URLSearchParams(location.search);
    const hasIncoming=PARAMS.some(key=>params.has(key));
    // NEVER merge old run fields into a different new run. A child_id is a
    // continuity label, not identity proof; Ready must validate on receipt.
    const result=ScopeGuard.prepareContext(incoming,context,trustedReadyTargets,
      {incoming:hasIncoming,now:iso()});
    handoffRejection=result.ok?null:result.reason;
    context=result.context;
    persistContext(context);
  }

  function trustedReturnTarget(){
    return context.linked_context_valid
      ?ScopeGuard.trustedTarget(context.return_target,trustedReadyTargets):null;
  }

  function emit(type, payload = {}) {
    const envelope = EventEnvelope.create({
      source:'snap-pop',
      event_type:type,
      occurred_at:iso(),
      correlation_id:context.session_id || context.task_id || null,
      payload
    });
    const event = {
      ...envelope,
      type,
      app:'snap-pop',
      at:envelope.occurred_at,
      session_id: context.session_id || null,
      goal_id: context.goal_id || null,
      task_id: context.task_id || null,
      lap_id: context.lap_id || null,
      payload
    };
    let outbox = [];
    try { outbox = JSON.parse(sessionStorage.getItem(OUTBOX_KEY) || '[]') || []; } catch {}
    sessionStorage.setItem(OUTBOX_KEY, JSON.stringify([...outbox, event].slice(-120)));
    try {
      const ready=trustedReturnTarget();
      if (window.opener && !window.opener.closed && ready) {
        window.opener.postMessage({ type:'TAKY_LEARNING_EVENT', event }, ready.origin);
      }
    } catch {}
    return event;
  }

  // Optional central Learning evidence path. Snap owns the outcome observation;
  // authenticated host/session and durable ACK remain external authority.
  let centralEvidencePipeline = null;
  let centralDecisionConfig = null;
  let growthDecisionState = { status:'UNBOUND', received_at:null, decision:null, reason:'CENTRAL_DECISION_NOT_CONFIGURED' };
  let centralEvidenceState = { status:'UNBOUND', event_id:null, reason:'TRUSTED_CENTRAL_SESSION_NOT_CONFIGURED' };

  function centralEvidenceStatus() { return { ...centralEvidenceState }; }
  function reportCentralEvidence(status,event_id,reason) {
    centralEvidenceState = { status, event_id:event_id || null, reason:reason || null };
    try {
      window.dispatchEvent(new CustomEvent('snap-central-evidence-status',
        { detail:centralEvidenceStatus() }));
    } catch {}
  }

  function configureCentralEvidence({ endpointUrl, decisionEndpointUrl, sessionProvider, tokenProvider,
    fetchImpl, indexedDB:database, dbName } = {}) {
    if (centralEvidencePipeline) throw new Error('CENTRAL_EVIDENCE_ALREADY_CONFIGURED');
    if (typeof sessionProvider !== 'function' || typeof tokenProvider !== 'function')
      throw new Error('EXPLICIT_TRUSTED_CENTRAL_SESSION_REQUIRED');
    const factory = globalThis.TakyCentralEvidence?.pipeline;
    if (factory?.VERSION !== 'TAKY_PWA_SCOPED_EVIDENCE_PIPELINE_V1' ||
        typeof factory.create !== 'function')
      throw new Error('PINNED_CENTRAL_BROWSER_PIPELINE_UNAVAILABLE');
    const fetcher=fetchImpl || globalThis.fetch.bind(globalThis);
    centralEvidencePipeline = factory.create({
      endpointUrl, sessionProvider, tokenProvider,
      fetchImpl:fetcher,
      indexedDB:database || globalThis.indexedDB, dbName,
      cryptoProvider:globalThis.crypto
    });
    const evidenceUrl=new URL(endpointUrl,location.href);
    const decisionUrl=decisionEndpointUrl
      ?new URL(decisionEndpointUrl,location.href)
      :new URL('/api/learning/decision',evidenceUrl.origin);
    centralDecisionConfig={
      endpointUrl:decisionUrl.href,
      sessionProvider,
      tokenProvider,
      fetchImpl:fetcher
    };
    growthDecisionState={status:'PENDING',received_at:null,decision:null,reason:'CENTRAL_DECISION_REQUEST_PENDING'};
    reportCentralEvidence('READY',null,null);
    Promise.resolve().then(()=>requestLearningGrowthDecision()).catch(()=>{});
    return Object.freeze({ configured:true, version:centralEvidencePipeline.version,
      decision_endpoint_configured:true });
  }

  async function flushCentralEvidenceOnce(owner) {
    if (!centralEvidencePipeline) throw new Error('CENTRAL_EVIDENCE_NOT_CONFIGURED');
    const result = await centralEvidencePipeline.flushOne('snap-pop',owner);
    if (result.processed) reportCentralEvidence(
      result.status === 'ACKED' ? 'CENTRAL_OBSERVATION_ACKED' :
      result.status === 'BLOCKED' ? 'HOLD' : 'PENDING',
      null,result.reason);
    return result;
  }

  async function closeCentralEvidence() {
    if (!centralEvidencePipeline) return;
    const pipeline=centralEvidencePipeline;
    centralEvidencePipeline=null;
    centralDecisionConfig=null;
    growthDecisionState={status:'UNBOUND',received_at:null,decision:null,reason:'CENTRAL_DECISION_CLOSED'};
    await pipeline.close();
    reportCentralEvidence('UNBOUND',null,'CENTRAL_EVIDENCE_CLOSED');
  }

  function queueCentralLearningOutcome(event) {
    if (!centralEvidencePipeline) {
      reportCentralEvidence('UNBOUND',event.event_id,'TRUSTED_CENTRAL_SESSION_NOT_CONFIGURED');
      return;
    }
    const p=event.payload || {};
    if (!p.member_id || !p.subject || !p.concept_skill_target || !p.learning_target_id) {
      reportCentralEvidence('HOLD',event.event_id,'EXPLICIT_LEARNING_SCOPE_REQUIRED');
      return;
    }
    Promise.resolve().then(()=>centralEvidencePipeline.enqueueBridge('snap-pop',event))
      .then(result=>{
        if (result?.queued === true || result?.duplicate === true)
          reportCentralEvidence('PENDING_CENTRAL_OUTBOX',event.event_id,null);
        else reportCentralEvidence('HOLD',event.event_id,'DURABLE_ENQUEUE_NOT_CONFIRMED');
      }).catch(error=>reportCentralEvidence('HOLD',event.event_id,
        String(error?.message || 'CENTRAL_ENQUEUE_UNAVAILABLE')));
  }

  function growthDecisionStatus() {
    return {
      status:growthDecisionState.status,
      received_at:growthDecisionState.received_at,
      reason:growthDecisionState.reason,
      decision:growthDecisionState.decision
        ?JSON.parse(JSON.stringify(growthDecisionState.decision)):null
    };
  }

  function getLearningGrowthDecision() {
    return growthDecisionState.decision
      ?JSON.parse(JSON.stringify(growthDecisionState.decision)):null;
  }

  async function requestLearningGrowthDecision() {
    if(!centralDecisionConfig){
      growthDecisionState={status:'UNBOUND',received_at:null,decision:null,
        reason:'CENTRAL_DECISION_NOT_CONFIGURED'};
      return {ok:false,reason:growthDecisionState.reason};
    }
    if(!context.linked_context_valid||!context.child_id||!context.subject||
       !context.concept_skill_target){
      growthDecisionState={status:'HOLD',received_at:null,decision:null,
        reason:'LINKED_LEARNING_SCOPE_REQUIRED'};
      return {ok:false,reason:growthDecisionState.reason};
    }
    const session=await centralDecisionConfig.sessionProvider();
    const memberId=String(session?.selected_member_id||'').trim();
    const familyId=String(session?.family_id||'').trim();
    if(session?.authenticated!==true||!familyId||!memberId||memberId!==context.child_id){
      growthDecisionState={status:'HOLD',received_at:null,decision:null,
        reason:'TRUSTED_CENTRAL_MEMBER_SCOPE_REQUIRED'};
      return {ok:false,reason:growthDecisionState.reason};
    }
    let token;
    try{token=await centralDecisionConfig.tokenProvider();}
    catch{
      growthDecisionState={status:'HOLD',received_at:null,decision:null,
        reason:'CENTRAL_DECISION_TOKEN_UNAVAILABLE'};
      return {ok:false,reason:growthDecisionState.reason};
    }
    if(!String(token||'').trim()){
      growthDecisionState={status:'HOLD',received_at:null,decision:null,
        reason:'CENTRAL_DECISION_TOKEN_UNAVAILABLE'};
      return {ok:false,reason:growthDecisionState.reason};
    }
    let response;
    try{
      response=await centralDecisionConfig.fetchImpl(centralDecisionConfig.endpointUrl,{
        method:'POST',credentials:'omit',
        headers:{'Authorization':'Bearer '+String(token).trim(),'Content-Type':'application/json'},
        body:JSON.stringify({
          family_id:familyId,member_id:memberId,
          subject:String(context.subject).toLowerCase(),
          concept_skill_target:String(context.concept_skill_target).toLowerCase()
        })
      });
    }catch{
      growthDecisionState={status:'HOLD',received_at:null,decision:null,
        reason:'CENTRAL_DECISION_REQUEST_FAILED'};
      return {ok:false,reason:growthDecisionState.reason};
    }
    let body=null;
    try{body=await response.json();}catch{}
    const decision=body?.runtime_result?.growth_next_step;
    const valid=response.status===200&&body?.ok===true&&
      body?.authenticated_server_response===true&&
      body?.receipt_scope?.member_id===memberId&&
      decision?.authority==='LEARNING_ENGINE_GROWTH_INTENT_ONLY'&&
      decision?.guards?.engine_guides_growth_not_answers===true&&
      decision?.hide_to_snap_handoff?.final_answer_generation_forbidden===true;
    if(!valid){
      growthDecisionState={status:'HOLD',received_at:null,decision:null,
        reason:'CENTRAL_GROWTH_DECISION_INVALID'};
      return {ok:false,reason:growthDecisionState.reason};
    }
    growthDecisionState={status:'READY',received_at:iso(),
      decision:JSON.parse(JSON.stringify(decision)),reason:null};
    try{window.dispatchEvent(new CustomEvent('snap-learning-growth-updated',
      {detail:growthDecisionStatus()}));}catch{}
    return {ok:true,decision:getLearningGrowthDecision()};
  }

  function growthPrompt(step=0) {
    const d=getLearningGrowthDecision();
    if(!d)return null;
    const word=String(context.word||'').trim();
    const chunk=String(d.language_support?.expression_chunks?.[0]||'').trim();
    const grammar=String(d.language_support?.grammar_patterns?.[0]||'').trim();
    const easy=String(d.language_support?.easy_english_definitions?.[0]||'').trim();
    const control=d.growth_control||d.hide_to_snap_handoff?.growth_control||{};
    const depth=Number(control.question_depth||d.question_depth?.level||1);
    const phase=String(d.support_phase||'ELICIT_PULL');
    const expressionLevel=String(control.expression_level||'L2_SIMPLE_SENTENCE');
    const intensity=String(control.learning_intensity||'BUILD_CONNECT');
    const hintStrength=String(control.hint_strength||d.hint_policy?.level||'PARTIAL_FRAME');
    const confidence=String(control.evidence_confidence||'LOW');

    let question='';
    let hint='';
    if(step<=0){
      question=word?('What does "'+word+'" mean here?'):'What is the key idea?';
      hint=easy?('Easy English: '+easy):(chunk?('Useful chunk: '+chunk):
        'Think of the meaning before translating word by word.');
    }else if(step===1){
      if(expressionLevel==='L1_CHUNK_OR_PHRASE'){
        question=word?('Can you make a short phrase with "'+word+'"?'):'Can you make a short English phrase?';
      }else if(/^L[45]_/.test(expressionLevel)){
        question=word?('Can you use "'+word+'" and add one reason?'):'Can you say the idea and add one reason?';
      }else{
        question=word?('Can you use "'+word+'" in your own short idea?'):'Can you say the idea in your own English?';
      }
      hint=hintStrength==='MINIMAL_CUE'
        ?'Try your own idea first.'
        :(chunk?('Useful chunk: '+chunk):(grammar?('Pattern: '+grammar):'Build a short English chunk first.'));
    }else{
      if(expressionLevel==='L5_TRANSFER_CREATION'){
        question=word?('Create a new situation with "'+word+'" and explain why it fits.')
          :'Create a new situation and explain why your idea fits.';
      }else if(expressionLevel==='L4_REASONED_RESPONSE'||depth>=4){
        question=word?('Use "'+word+'" in a new situation. Why does it fit?')
          :'Use your idea in a new situation and explain why.';
      }else if(expressionLevel==='L1_CHUNK_OR_PHRASE'){
        question=word?('Finish one useful phrase with "'+word+'".'):'Finish one useful English phrase.';
      }else{
        question=word?('Make your own sentence with "'+word+'".'):'Make your own sentence.';
      }
      hint=hintStrength==='MINIMAL_CUE'
        ?'Try it without translating every word first.'
        :(grammar?('Pattern: '+grammar):'Say the idea first, then make the sentence smoother.');
    }
    return {
      question,hint,
      language:'ENGLISH_FIRST_KOREAN_FALLBACK',
      support_phase:phase,
      learning_intensity:intensity,
      expression_level:expressionLevel,
      question_depth:depth,
      hint_strength:hintStrength,
      evidence_confidence:confidence
    };
  }

  function safeReturnUrl(taskState = 'PARTIAL') {
    const ready=trustedReturnTarget();
    if (!ready || !context.session_id || !context.task_id || !context.lap_id) return null;
    try {
      const url = new URL(ready.href);
      if (context.session_id) url.searchParams.set('session_id', context.session_id);
      if (context.goal_id) url.searchParams.set('goal_id', context.goal_id);
      if (context.task_id) url.searchParams.set('task_id', context.task_id);
      if (context.lap_id) url.searchParams.set('lap_id', context.lap_id);
      url.searchParams.set('task_state', taskState);
      url.searchParams.set('from_app', 'snap-pop');
      return url.href;
    } catch {
      return null;
    }
  }

  function returnToBase(taskState = 'PARTIAL', payload = {}) {
    const normalized = ['COMPLETED','PARTIAL','BLOCKED','HELP_NEEDED'].includes(taskState) ? taskState : 'PARTIAL';
    emit(
      normalized === 'COMPLETED' ? 'TASK_COMPLETED' :
      normalized === 'BLOCKED' ? 'TASK_BLOCKED' :
      normalized === 'HELP_NEEDED' ? 'HELP_NEEDED' : 'TASK_PARTIAL',
      payload
    );
    const url = safeReturnUrl(normalized);
    if (url) location.assign(url);
    else toast('베이스캠프 연결 주소가 없어요. 현재 표현 기록은 이 기기에 남아 있어요.');
  }

  async function waitForDB() {
    for (let i = 0; i < 80; i++) {
      if (db) return true;
      await sleep(50);
    }
    return false;
  }

  async function activeExploration() {
    try {
      if (!await waitForDB()) return null;
      return await get('active');
    } catch {
      return null;
    }
  }

  function injectStyles() {
    if (document.getElementById('snapBridgeStyle')) return;
    const style = document.createElement('style');
    style.id = 'snapBridgeStyle';
    style.textContent = `
      .snap-bridge-chip{position:fixed;right:14px;z-index:9998;border:0;border-radius:999px;padding:11px 15px;font-weight:900;box-shadow:0 10px 28px rgba(0,0,0,.22)}
      #snapBaseCampChip{bottom:calc(82px + env(safe-area-inset-bottom));background:#fff6df;color:#173d38}
      #snapWordChip{left:14px;right:auto;bottom:calc(132px + env(safe-area-inset-bottom));background:#173d38;color:#fff;max-width:calc(100vw - 28px);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}`;
    document.head.appendChild(style);
  }

  function ensureBaseCampChip() {
    const linked = !!(context.session_id && context.task_id &&
      context.lap_id && trustedReturnTarget());
    let chip = document.getElementById('snapBaseCampChip');
    if (!linked) { chip?.remove(); return; }
    if (!chip) {
      chip = document.createElement('button');
      chip.id = 'snapBaseCampChip';
      chip.className = 'snap-bridge-chip';
      chip.type = 'button';
      chip.textContent = 'Ready & Set으로';
      chip.onclick = async () => {
        const active = await activeExploration();
        const state = context.task_completed ? 'COMPLETED' : active ? 'PARTIAL' : 'PARTIAL';
        returnToBase(state, { active_landmark: active?.landmark || null, step: active?.step ?? null });
      };
      document.body.appendChild(chip);
    }
  }

  function ensureWordChip() {
    let chip = document.getElementById('snapWordChip');
    if (!context.word) { chip?.remove(); return; }
    if (!chip) {
      chip = document.createElement('div');
      chip.id = 'snapWordChip';
      chip.className = 'snap-bridge-chip';
      document.body.appendChild(chip);
    }
    chip.textContent = `표현할 단어 · ${context.word}`;
    chip.title = context.word_context || context.word;
  }

  function wrapCompletion() {
    const button = document.getElementById('nextBtn');
    const original = button?.onclick;
    if (!button || !original || button.dataset.snapBridgeWrapped) return;
    button.dataset.snapBridgeWrapped = 'true';
    button.onclick = async function bridgedNext(event) {
      const before = await activeExploration();
      await original.call(this, event);
      const after = await activeExploration();
      const completedNow = before && Number(before.step || 0) >= 2 && !after;
      if (completedNow && context.session_id && context.task_id) {
        context.task_completed = true;
        context.completed_at = iso();
        persistContext(context);
        emit('TASK_COMPLETED', {
          landmark: before.landmark || null,
          used_handoff_word: context.word || null,
          child_authored: true
        });
        if(context.learning_target_id){
          emitLearningOutcome({
            completed:true,
            production_ref:'snap-production:'+String(Date.now()),
            growth_signals:[
              {dimension:'EXPRESSION',outcome:'UNKNOWN',assisted:false,
               kind:'CHILD_PRODUCTION_CREATED',target_id:context.learning_target_id},
              {dimension:'THINKING',outcome:'UNKNOWN',assisted:false,
               kind:'CHILD_PRODUCTION_CREATED',target_id:context.learning_target_id,
               depth:Number(getLearningGrowthDecision()?.question_depth?.level||0)||null}
            ]
          });
        }
        ensureBaseCampChip();
      }
    };
  }

  function cleanIncomingQuery() {
    const p = new URLSearchParams(location.search);
    if (!PARAMS.some(key => p.has(key))) return;
    PARAMS.forEach(key => p.delete(key));
    const clean = `${location.pathname}${p.toString() ? `?${p}` : ''}${location.hash}`;
    history.replaceState(null, '', clean);
  }

  function emitLearningOutcome(input = {}) {
    // No linked, context-free event can claim a member or learning target.
    // This emits only specialist observation, never a verified receipt.
    const binding=ScopeGuard.boundScope(context,input,{targetRequired:true});
    if(!binding.ok)return binding;
    const scope=binding.scope;
    const payload = {
      skill_id: scope.concept_skill_target,
      concept_skill_target: scope.concept_skill_target,
      member_id: scope.member_id,
      subject: scope.subject,
      learning_target_id: scope.learning_target_id,
      completed: !!input.completed,
      evidence_of_improvement: !!input.evidence_of_improvement,
      needed_assistance: !!(input.needed_assistance || input.help_used),
      error_persisted: !!input.error_persisted,
      production_ref: input.production_ref || input.event_id || null,
      rubric_ref: input.rubric_ref || null,
      rubric_result: input.rubric_result || null,
      growth_signals: Array.isArray(input.growth_signals)
        ?input.growth_signals.slice(0,16).map(x=>({
          dimension:String(x?.dimension||'').toUpperCase(),
          outcome:String(x?.outcome||'UNKNOWN').toUpperCase(),
          assisted:x?.assisted===true,
          transfer:x?.transfer===true,
          direct_english:x?.direct_english===true?true:x?.direct_english===false?false:null,
          kind:x?.kind||null,
          target_id:x?.target_id||scope.learning_target_id||null,
          depth:Number.isFinite(Number(x?.depth))?Math.max(0,Math.min(5,Number(x.depth))):null
        })):[],
      growth_intent_ref: getLearningGrowthDecision()?.version || null,
      growth_control_applied:(()=>{
        const d=getLearningGrowthDecision();
        const x=d?.growth_control||d?.hide_to_snap_handoff?.growth_control;
        return x?{
          evidence_confidence:x.evidence_confidence||null,
          learning_intensity:x.learning_intensity||null,
          expression_level:x.expression_level||null,
          question_depth:Number.isFinite(Number(x.question_depth))?Number(x.question_depth):null,
          hint_strength:x.hint_strength||null,
          hint_fade:x.hint_fade||null,
          challenge_direction:x.challenge_direction||null
        }:null;
      })(),
      evidence_source_refs: Array.isArray(input.source_refs) ? [...input.source_refs] : [],
      evidence_provenance: Array.isArray(input.provenance) ? [...input.provenance] : [],
      contextual_evidence_only: true,
      global_mastery_claim: false
    };
    const event=emit('LEARNING_OUTCOME', payload);
    queueCentralLearningOutcome(event);
    return event;
  }

  function requestRubricReview(input = {}) {
    const verifier = globalThis.SnapRubricVerifier;
    if (!verifier?.createReviewRequest) return { ok:false, reason:'SNAP_RUBRIC_VERIFIER_UNAVAILABLE' };
    // A standalone child may prepare a review *request*, never certify its
    // own result. An active linked run may not rebind its member/subject/skill.
    const linked=!!(context.session_id||context.task_id);
    const bound=linked?ScopeGuard.boundScope(context,input,{targetRequired:false}):null;
    if(linked&&!bound?.ok)return bound;
    const scope=bound?.scope||{};
    return verifier.createReviewRequest({
      event_id: input.event_id,
      member_id: linked?scope.member_id:(input.member_id||''),
      subject: linked?scope.subject:(input.subject||''),
      concept_skill_target: linked?scope.concept_skill_target:(input.concept_skill_target||''),
      rubric_ref: input.rubric_ref,
      reviewer_role: input.reviewer_role,
      rubric_version: input.rubric_version,
      production_summary: input.production_summary || null
    });
  }

  function validate() {
    const checks = {
      noLocalTimer: true,
      sessionIdPresentWhenLinked: !context.return_target || !!context.session_id,
      taskIdPresentWhenLinked: !context.return_target || !!context.task_id,
      lapIdPresentWhenLinked: !context.return_target || !!context.lap_id,
      safeReturnTarget: !context.return_target || !!trustedReturnTarget(),
      linkedRunValid: !handoffRejection,
      noUnscopedLinkedReturn: !context.session_id || !!(
        context.linked_context_valid && context.task_id && context.lap_id && trustedReturnTarget())
    };
    return { ok:Object.values(checks).every(Boolean), checks };
  }

  function boot() {
    document.documentElement.dataset.snapBridge = BRIDGE_VERSION;
    bootContext();
    injectStyles();
    ensureBaseCampChip();
    ensureWordChip();
    wrapCompletion();
    cleanIncomingQuery();
    if (context.linked_context_valid && context.session_id && context.task_id)
      emit('APP_ENTERED', { from_app: context.from_app || null, word: context.word || null });
    window.SnapPopBridge = Object.freeze({
      version: BRIDGE_VERSION,
      context: () => ({ ...context }),
      handoffStatus:()=>({ok:!handoffRejection,reason:handoffRejection,
        ready_target_configured:trustedReadyTargets.length>0,
        linked_context_valid:context.linked_context_valid===true,
        authenticated:false}),
      emit,
      returnToBase,
      requestRubricReview,
      emitLearningOutcome,
      requestLearningGrowthDecision,
      getLearningGrowthDecision,
      growthDecisionStatus,
      growthPrompt,
      configureCentralEvidence,
      flushCentralEvidenceOnce,
      closeCentralEvidence,
      centralEvidenceStatus,
      validate
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true });
  else boot();
})();
