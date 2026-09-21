# SNAP & POP C2S HANDOFF — 2026-09-21

## 0. STATE

- Conversation scope: current Snap & Pop rebuild / writing core / Imagination Cloud / Ready Learning bridge / badge recovery
- C2S_COMPILE_CLOSED: true
- REFLECTION_COMPLETE: false
- DOWNSTREAM_EXECUTION_COMPLETE: false
- NO_SILENT_LOSS: enforced within recovered conversation scope
- Historical badge provenance recovery: RECOVERY_IN_PROGRESS
- Merge / deploy / Netlify: NOT_RUN / DO_NOT_RUN until explicitly approved

## 1. BRANCH LOCK

Snap & Pop
- repo: hns140412-glitch/Snap-Pop
- branch: `taky/snap-pop-implementation-2026-09-20`
- handoff head observed: `0961d7cab979cba877185caff9e3b1d6c928aaec`

Ready & Set
- repo: hns140412-glitch/Ready-Set
- branch: `taky/ready-integration-v01`
- handoff head observed: `833c607e76cd2490a05da11da85b9dbfb585eb0b`

Do not merge main/staging.
Do not deploy or call Netlify.

## 2. LATEST PRODUCT CORRECTIONS

### Writing is the default state
Snap & Pop default is writing exploration, not a generic Q&A hub.

Default:
`world / 5 writing lenses → continuous draft → revise/finish → record/growth`

Imagination Cloud:
- core intelligence layer, but normally hidden;
- appears on demand from writing stuck state, child request, curiosity, or radio/voice;
- returns to the original writing context;
- must not become the default navigation hub.

### Writing core must not be list-style
Forbidden:
`Q1→A1→Q2→A2→Q3→A3`

Required:
`ONE DRAFT → ONE NEXT MOVE → SAME DRAFT GROWS → ONE NEXT MOVE → REVISE/FINISH`

The 5 places are lenses, not isolated checklist mini-games:
- idea
- emotion
- description
- viewpoint
- final/revision

### Child authorship
- system analyzes and suggests one next move;
- no final answer writing;
- no full rewrite;
- no grading;
- no question flooding.

## 3. CURRENT WRITING IMPLEMENTATION

Implemented structure:
- `draft`
- per-step `snapshots`
- `finalDraft`
- legacy state migration
- current-draft based prompt adaptation
- stale-result guard
- optional one cross-lens suggestion
- final record stores final draft, snapshots for history

Files:
- `writing-runtime.js`
- `semantic-writing-runtime.js`
- `app.js`
- `index.html`

Status:
- CODED: substantial skeleton
- STATIC_VERIFIED: yes
- RUNTIME_VERIFIED: no
- DEVICE_VERIFIED: no

## 4. READY & SET LEARNING BRIDGE

Ready Learning Master is not the writing analyzer.

Ready provides:
- subject
- learning_unit_id
- analysis_id
- assignment_id
- activity_types
- cognitive_load_profile
- concept_skill_target
- confidence
- unresolved_flags

Only FACT_CONFIRMED context should be transferred.

Snap & Pop:
- receives minimal context through bridge;
- must not read Ready localStorage directly;
- uses context conservatively;
- low confidence/unresolved context must not strongly steer writing;
- final child-authored draft is not copied back to Ready;
- only minimal specialist provenance is returned.

Files:
- Snap: `snap-bridge.js`, `learning-context-runtime.js`, `writing-runtime.js`, `app.js`
- Ready: `ready-runtime-v07.js`

Status:
- CODED / STATIC VERIFIED
- cross-app RUNTIME/DEVICE NOT_RUN

## 5. SEMANTIC WRITING PROVIDER

Canonical name:
`SnapPopSemanticWritingProvider`

Do not use the old ambiguous name `SnapPopLearningProvider`.

Role:
- semantic analysis of current child draft only;
- identify present/missing signals;
- return one next move;
- optional one lens;
- no final draft authoring;
- no rewrite;
- no suggested full sentence by default;
- no grading.

OpenAI:
- intended internal backing engine;
- actual secure server/backend call is NOT connected yet;
- browser API-key embedding is forbidden;
- local writing analysis is fallback.

Status:
- provider boundary CODED / STATIC VERIFIED
- OPENAI_RUNTIME_CONNECTED = false

## 6. IMAGINATION CLOUD

Canonical:
- hidden/on-demand core layer;
- writing remains the visible default;
- current global overlay implementation replaces the earlier `exploreHub` concept.

Implemented:
- global hidden overlay
- writing-context invocation
- home radio/voice invocation
- return focus/context
- THINK/ASK basic route
- local fail-closed behavior for factual questions without provider

Not complete:
- actual verified OpenAI Q&A backend
- concept/principle/etymology factual verification
- comparison/timeline/cause-effect variants
- full post-model truth guard
- high-quality voice/realtime

## 7. TRUTH GUARD

Current:
- local factual question can fail closed;
- no-guess contract exists.

Missing:
- verified source/search pipeline
- history/date/person verification
- science mechanism verification
- reliable etymology verification / folk-etymology blocking
- claim-level evidence validation
- external model result validation

High-priority known risk:
Anything not explicitly verified must not be stored/rendered as verified by default.

## 8. BADGE SYSTEM RECOVERY

This was omitted from the implementation path and has now been recovered as a distinct axis.

Canonical separation:
`Character Master != Exploration Crew != Badge != Affinity != EXP/Gem != World State`

Recovered structure currently in branch:
- `data/badge-system.json`
- `data/badge-catalog-working.json`
- `badge-runtime.js`

Recovered confirmed direction:
- process/experience collection, not score/power;
- cross-app direction across TAKY ecosystem;
- circular / hand-drawn / pastel visual language;
- child Profile Character is protagonist;
- 5 tiers: GREEN / BLUE / RED / GOLD / PLATINUM;
- each tier has 1–5 upper-semicircle gem/star growth marks;
- approximately 60 starting badge concepts;
- can expand from meaningful observed activity;
- can recognize self-start, return/recovery, help request, error discovery, retry, deep thinking, self-explanation, adaptation, special behavior, writing exploration;
- not character power, leaderboard, punitive removal, streak pressure, or EXP/gem equivalence.

Critical status:
- `data/badge-catalog-working.json` = `WORKING_DRAFT_NOT_ACTIVE`
- all 60 historical names/triggers are preserved for recovery but are NOT active canon
- exact active catalog, event triggers, ownership, display surfaces, and cross-app event contract still require source recovery/review
- do not auto-canonicalize the 60 draft entries

Current matrix badge requirements:
- SP-BADGE-001 … SP-BADGE-010
- recovered but not fully implemented

## 9. CURRENT IMPLEMENTATION REALITY

Do not report overall completion as near-finished.

Latest matrix observed:
- version: 2026-09-21.16
- total requirements: 78
- many items are CODED/PARTIAL with static checks only
- runtime verification remains largely not run
- device verification remains not run

Family expansion remains largely unimplemented.

## 10. STALE/RESIDUE WARNING

Older requirement evidence may still mention superseded UI names:
- exploreHub
- cloudPanel
- runHubCloud / runCloud
- renderCloudResponse
- homeQuickStart

Current canonical UI:
- writing-first
- hidden global Imagination Cloud overlay

Do not use stale evidence as current implementation truth.

## 11. NEXT EXECUTION ORDER

P0 — badge source recovery completion
- recover original badge intent/evidence from Ready intro/profile/HOLD and older conversations/Drive;
- classify each recovered item as CONFIRMED / HOLD / WORKING / OPEN;
- do not activate 60-draft catalog yet.

P1 — writing quality
- connect semantic analysis to actual secure OpenAI-backed provider;
- keep one-next-move and child-authorship guards;
- improve meaning/flow analysis beyond keyword heuristics.

P2 — Truth Guard
- provider output validation;
- fact verification/search path;
- high-risk history/science/etymology guard.

P3 — Imagination Cloud intelligence
- verified ASK→UNDERSTAND;
- concept/principle/mind-map/cause-effect/comparison/timeline scaffolds;
- preserve hidden/on-demand behavior.

P4 — crew response guard
- final response owner = current Exploration Crew member;
- character style cannot override truth/clarity.

P5 — voice
- secure high-quality STT/TTS/Realtime adapter;
- browser speech remains fallback.

P6 — runtime regression
- only after core implementation;
- user must not be used as tester/debugger.

P7 — device verification
- later, after frozen candidate.

P8 — Family expansion
- after core stabilizes.

## 12. GOVERNANCE

Apply latest TAKY:
- explicit user corrections first;
- no guessing;
- no silent loss;
- no false convergence;
- lock confirmed decisions;
- separate CODED / STATIC / RUNTIME / DEVICE;
- BLOCKED => diagnose category then choose a different route;
- do not repeat the same failed path;
- no Netlify until exact frozen candidate passes external-resource gate.

## 13. RESUME COMMAND

Use the new-chat prompt file:
`SNAP_POP_NEW_CHAT_START_2026-09-21.md`

Primary first task:
**Complete badge source recovery, then continue P1 Writing Core semantic implementation.**
