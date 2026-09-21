(() => {
  'use strict';

  const BRIDGE_VERSION = '2026.09.21-c';
  const CONTEXT_KEY = 'snap_pop_shared_context_v1';
  const OUTBOX_KEY = 'snap_pop_shared_outbox_v1';
  const PARAMS = ['session_id','goal_id','task_id','lap_id','return_target','from_app','word','word_context','child_id','target_time_ms','session_start_at','paused_at','issue_ms','learning_context'];

  const EventEnvelope = globalThis.TakyEventEnvelope;
  if(!EventEnvelope?.create) throw new Error('SNAP_SHARED_EVENT_ENVELOPE_UNAVAILABLE');
  const iso = () => new Date().toISOString();
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  function decodeLearningContext(raw) {
    if (!raw || typeof raw !== 'string' || raw.length > 6000) return null;
    try {
      const normalized=raw.replace(/-/g,'+').replace(/_/g,'/');
      const padded=normalized+'='.repeat((4-normalized.length%4)%4);
      const binary=atob(padded);
      const bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));
      const value=JSON.parse(new TextDecoder().decode(bytes));
      if (!value || value.contract_version!=='READY_LEARNING_CONTEXT_V1') return null;
      const forbiddenKeys=new Set([
        'role','permission','permissions','planner_authority','allocation_authority',
        'family_id','child_id','hanja_grade','hanja_level','grade_inference'
      ]);
      if(Object.keys(value).some(key=>forbiddenKeys.has(key))) return null;
      const required=['learning_unit_id','analysis_id','assignment_id'];
      if(required.some(key=>!String(value[key]||'').trim())) return null;
      const list=v=>Array.isArray(v)?[...new Set(v.filter(x=>typeof x==='string').map(x=>x.trim()).filter(Boolean))].slice(0,12):[];
      return {
        contract_version:'READY_LEARNING_CONTEXT_V1',
        learning_unit_id:String(value.learning_unit_id).slice(0,120),
        analysis_id:String(value.analysis_id).slice(0,120),
        assignment_id:String(value.assignment_id).slice(0,120),
        subject:String(value.subject||'').slice(0,80)||null,
        concept_skill_target:String(value.concept_skill_target||'').slice(0,180)||null,
        activity_types:list(value.activity_types),
        cognitive_load_profile:list(value.cognitive_load_profile),
        divisible_boundary:String(value.divisible_boundary||'').slice(0,80)||null,
        confidence:Number.isFinite(value.confidence)?Math.max(0,Math.min(1,value.confidence)):null,
        unresolved_flags:list(value.unresolved_flags),
        provenance:{
          engine:String(value.provenance?.engine||'').slice(0,80)||null,
          version:String(value.provenance?.version||'').slice(0,40)||null,
          confirmation_state:String(value.provenance?.confirmation_state||'').slice(0,40)||null
        }
      };
    } catch { return null; }
  }

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

  function bootContext() {
    const incoming = readIncomingContext();
    if (incoming.session_id || incoming.task_id || incoming.word) {
      context = { ...context, ...incoming, received_at: iso(), task_completed: false };
      persistContext(context);
    }
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
      child_id: context.child_id || null
    };
    let outbox = [];
    try { outbox = JSON.parse(sessionStorage.getItem(OUTBOX_KEY) || '[]') || []; } catch {}
    sessionStorage.setItem(OUTBOX_KEY, JSON.stringify([...outbox, event].slice(-120)));
    try {
      if (window.opener && !window.opener.closed && context.return_target) {
        window.opener.postMessage({ type:'TAKY_LEARNING_EVENT', event }, new URL(context.return_target).origin);
      }
    } catch {}
    return event;
  }

  function safeReturnUrl(taskState = 'PARTIAL', eventIdValue = null) {
    if (!context.return_target) return null;
    try {
      const url = new URL(context.return_target, location.href);
      if (!['http:','https:'].includes(url.protocol)) return null;
      if (context.session_id) url.searchParams.set('session_id', context.session_id);
      if (context.goal_id) url.searchParams.set('goal_id', context.goal_id);
      if (context.task_id) url.searchParams.set('task_id', context.task_id);
      if (context.lap_id) url.searchParams.set('lap_id', context.lap_id);
      if (eventIdValue) url.searchParams.set('event_id', eventIdValue);
      url.searchParams.set('task_state', taskState);
      url.searchParams.set('from_app', 'snap-pop');
      return url.href;
    } catch {
      return null;
    }
  }

  function returnToBase(taskState = 'PARTIAL', payload = {}) {
    const normalized = ['COMPLETED','PARTIAL','BLOCKED','HELP_NEEDED'].includes(taskState) ? taskState : 'PARTIAL';
    let event;
    if (normalized === 'COMPLETED' && context.completion_event_id) {
      event = { event_id: context.completion_event_id };
    } else {
      event = emit(
        normalized === 'COMPLETED' ? 'TASK_COMPLETED' :
        normalized === 'BLOCKED' ? 'TASK_BLOCKED' :
        normalized === 'HELP_NEEDED' ? 'HELP_NEEDED' : 'TASK_PARTIAL',
        payload
      );
      if (normalized === 'COMPLETED') {
        context.completion_event_id = event.event_id;
        context.task_completed = true;
        persistContext(context);
      }
    }
    const url = safeReturnUrl(normalized, event.event_id);
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
    const linked = !!(context.session_id && context.task_id && context.return_target);
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
      if (completedNow && context.session_id && context.task_id && !context.task_completed) {
        context.task_completed = true;
        context.completed_at = iso();
        const material=window.SnapPopVocabularyMaterial?.normalize?.({
          word:context.word||"",
          word_context:context.word_context||"",
          from_app:context.from_app||""
        })||null;
        const vocabularyMaterial=window.SnapPopVocabularyMaterial?.usageEvidence?.(material,before.draft||"")||null;
        const resultEvent = emit('TASK_COMPLETED', {
          landmark: before.landmark || null,
          vocabulary_material: vocabularyMaterial,
          child_authored: true
        });
        context.completion_event_id = resultEvent.event_id;
        persistContext(context);
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

  function validate() {
    const checks = {
      noLocalTimer: true,
      sessionIdPresentWhenLinked: !context.return_target || !!context.session_id,
      goalIdPresentWhenLinked: !context.return_target || !!context.goal_id,
      taskIdPresentWhenLinked: !context.return_target || !!context.task_id,
      lapIdPresentWhenLinked: !context.return_target || !!context.lap_id,
      safeReturnTarget: !context.return_target || (() => { try { return ['http:','https:'].includes(new URL(context.return_target).protocol); } catch { return false; } })()
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
    if (context.session_id && context.task_id) emit('APP_ENTERED', { from_app: context.from_app || null, word: context.word || null });
    window.addEventListener('snap-pop:task-completed', event => {
      if (!(context.session_id && context.task_id) || context.task_completed) return;
      const resultEvent = emit('TASK_COMPLETED', {
        ...(event.detail || {}),
        child_authored: true
      });
      context.task_completed = true;
      context.completed_at = iso();
      context.completion_event_id = resultEvent.event_id;
      persistContext(context);
      ensureBaseCampChip();
    });

    window.SnapPopBridge = Object.freeze({
      version: BRIDGE_VERSION,
      context: () => ({ ...context }),
      emit,
      returnToBase,
      validate,
      learningContext: () => decodeLearningContext(context.learning_context),
      vocabularyMaterial: () => {
        try {
          return window.SnapPopVocabularyMaterial?.normalize?.({
            word: context.word || "",
            word_context: context.word_context || "",
            from_app: context.from_app || ""
          }) || null;
        } catch {
          return null;
        }
      }
    });
    window.dispatchEvent(new CustomEvent('snap-pop:bridge-ready'));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true });
  else boot();
})();
