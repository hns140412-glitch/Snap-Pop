(() => {
  'use strict';

  const BRIDGE_VERSION = '2026.09.07-a';
  const CONTEXT_KEY = 'snap_pop_shared_context_v1';
  const OUTBOX_KEY = 'snap_pop_shared_outbox_v1';
  const PARAMS = ['session_id','goal_id','task_id','lap_id','return_target','from_app','word','word_context'];

  const iso = () => new Date().toISOString();
  const eventId = () => `snap_event_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
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

  function bootContext() {
    const incoming = readIncomingContext();
    if (incoming.session_id || incoming.task_id || incoming.word) {
      context = { ...context, ...incoming, received_at: iso(), task_completed: false };
      persistContext(context);
    }
  }

  function emit(type, payload = {}) {
    const event = {
      event_id: eventId(),
      type,
      app: 'snap-pop',
      at: iso(),
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
      if (window.opener && !window.opener.closed && context.return_target) {
        window.opener.postMessage({ type:'TAKY_LEARNING_EVENT', event }, new URL(context.return_target).origin);
      }
    } catch {}
    return event;
  }

  function safeReturnUrl(taskState = 'PARTIAL') {
    if (!context.return_target) return null;
    try {
      const url = new URL(context.return_target, location.href);
      if (!['http:','https:'].includes(url.protocol)) return null;
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
      if (completedNow && context.session_id && context.task_id) {
        context.task_completed = true;
        context.completed_at = iso();
        persistContext(context);
        emit('TASK_COMPLETED', {
          landmark: before.landmark || null,
          used_handoff_word: context.word || null,
          child_authored: true
        });
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
    window.SnapPopBridge = Object.freeze({
      version: BRIDGE_VERSION,
      context: () => ({ ...context }),
      emit,
      returnToBase,
      validate
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true });
  else boot();
})();
