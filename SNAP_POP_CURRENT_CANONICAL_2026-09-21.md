# SNAP & POP — Current Canonical Index

Date: 2026-09-21
Branch: `taky/snap-pop-implementation-2026-09-20`
Status: CURRENT CANONICAL INDEX / P0 CONSOLIDATION
Scope: Snap & Pop entire product, including optional expansion lineage

## 1. Purpose

This file is the **entry point**, not a replacement for source masters.

Its job is to prevent fragmented documents from being read as independent competing truths.

Read order:

1. latest direct user correction;
2. TAKY / C2S governance;
3. this Current Canonical Index;
4. `data/snap-pop-requirement-matrix.json`;
5. domain owner documents listed below;
6. actual code/data and validation evidence.

## 2. Project center

Snap & Pop is evaluated as a whole.

The center of the system is **not Core 6 personality detail**.

Project-wide behavioral/interaction baseline:
**recovered Guide / 길잡이 rules → migrated into 탐험대 규칙**.

Core 6:
- provisional starter reference set;
- useful for current visual/content regression;
- does not own overall product behavior;
- does not replace Guide-derived interaction rules.

## 2.1 Universal product purpose — HARD LOCK

Snap & Pop is not a narrow writing tutor.

Its universal core has two equal product axes:

### A. THINK → EXPRESS
Help the child turn an internal thought, feeling, observation, memory, imagination or opinion into an external expression.

Expression modes include:
- Korean writing;
- English writing;
- spoken expression;
- idea fragments;
- scene/story building;
- explanation/opinion;
- revision and refinement.

### B. ASK → UNDERSTAND
Act as a child-friendly curiosity resolver when the child asks about something they do not know or understand.

Question domains are broad and may include:
- society;
- history;
- culture;
- science;
- language;
- geography;
- everyday life;
- arts;
- people/events/concepts appropriate to the child's context.

The system should help the child:
- ask freely;
- receive a clear answer;
- understand why/how;
- connect the answer to what they already know;
- optionally turn the new understanding into speaking/writing/exploration.

Therefore the product formula is:

`THINK → EXPRESS`
+
`ASK → UNDERSTAND`
+
`UNDERSTAND → EXPRESS/EXPLORE when useful`

Writing support is a major subsystem, but it is not the entire product.

The exploration crew/Guide standard applies across both axes:
- do not over-teach;
- do not shame ignorance;
- answer clearly;
- adapt depth/language;
- distinguish known fact from uncertainty;
- preserve child agency;
- invite one useful next curiosity when appropriate.

## 3. Domain ownership

### ORIGINAL product / UI / data / reward / PWA
Inherited authority:
`REV_12 → REV_11 → REV_10`

- REV10 owns detailed ORIGINAL and FAMILY baseline.
- REV11 adds thought-to-expression, English, Growth Chapters, Imagination Cloud and connected-app contracts.
- REV12 corrects brand/bridge/conflict/recovery boundaries.
- Later revision inherits earlier detail unless explicitly superseded.

### Guide-derived interaction standard
Current owner:
`SNAP_EXPLORATION_CREW_MASTER_2026-09-20.md`
+
`data/exploration-crew-rules.json`

Scope is broader than character personality:
- authorship;
- intervention ladder;
- waiting/hinting;
- tone/humor;
- UI presence;
- Main/Guest orchestration;
- affinity/relationship;
- memory;
- world behavior;
- voice/accessibility;
- special encounter ethics.

### Exploration crew identity/content
Current owner:
same exploration-crew master/JSON + C2S evidence ledgers.

Core 6 remains **WORKING / provisional reference** unless a later user lock changes status.

### Response ownership — 탐험대가 답변의 주체

상상구름이 OpenAI 모델/도구를 내부적으로 사용하더라도 사용자에게 답하는 주체는 **탐험대**다.

`OpenAI = 내부 지능 엔진`
`탐험대 = 답변 주체 / 말투 / 행동 / 관계 / 개입 기준 소유자`

금지:
- raw AI/system voice를 그대로 사용자-facing 답변으로 노출;
- "AI가 분석했어 / AI가 알려줄게"를 기본 정체성으로 사용;
- 캐릭터마다 사실 품질이나 학습 능력을 다르게 설정.

필수:
- 현재 메인 탐험대원 문맥 유지;
- 탐험대 규칙에 따른 설명 깊이/유머/후속질문;
- 사실성과 불확실성은 캐릭터 연출보다 우선;
- 모델 출력은 최종 답변 전에 탐험대 Guard를 통과.

### Imagination Cloud ownership

상상구름 is a CORE Snap & Pop feature and the user-facing gateway for:
- `THINK → EXPRESS`;
- `ASK → UNDERSTAND`;
- Korean/English expression;
- broad child curiosity resolution.

Architecture:
`상상구름 UI / world feature`
→ `Snap & Pop routing/guard layer`
→ `OpenAI model/tools when needed`
→ `bounded child-facing result`

Current runtime note:
the existing `cloudFragments()` code is only a basic local implementation and does not prove that the full OpenAI-backed intelligence gateway is connected.

### Connected-app bridge
Product contract:
REV11/REV12.
Runtime implementation:
`snap-bridge.js`.

### FAMILY / optional Snap expansion
Baseline lineage:
REV10 + REV12 recovery/conflict register + recovered audit evidence.

Important:
`SPECIFIED != IMPLEMENTED`.

Current Family Expansion runtime is implemented for the active/locked scope and browser-runtime verified. Active features execute in child-scoped storage; RECOVERY_LOCKED and CONFLICT_LOCKED features remain fail-closed rather than being silently promoted.

## 4. Current requirement-to-code truth

Universal product core:
`SNAP_POP_UNIVERSAL_CORE_2026-09-21.md`

Machine-readable current matrix:
`data/snap-pop-requirement-matrix.json`

Human audit:
`C2S/SNAP_POP_FULL_IMPLEMENTATION_AUDIT_2026-09-21.md`

Evidence-backed scorecard:
`data/snap-pop-implementation-scorecard.json`

Every meaningful status claim must distinguish:
- `CODED`;
- `STATIC_VERIFIED`;
- `RUNTIME_VERIFIED`;
- `DEVICE_VERIFIED`.

Do not use plain `IMPLEMENTED` when these differ.

## 5. Full-scope implementation snapshot

Current implementation percentage is **temporarily invalidated for recalculation**.

Reason:
the previous score omitted the now-restored core axis:
`ASK → UNDERSTAND` / broad child curiosity resolver.

The former ~67% figure is retained only as a historical pre-correction audit snapshot and must not be used as current full-scope completion.

These values are audit snapshots, not permanent requirements.

## 6. Expansion boundary

FAMILY / optional expansion is part of **full product scope** for implementation-rate accounting, even when disabled by default.

Current confirmed broad lineage includes:
- diary;
- letters / notes / family pen-pal;
- family sharing;
- family joint special exploration;
- family growth record;
- multiple child profiles;
- family-specific Character Master;
- childId isolation/migration.

Recovered but not fully promoted:
- family group/invite/relation/permission detail;
- forest mailbox;
- stationery/sticker/sealing UX;
- composited diary illustration.

Conflict:
- gem-piece gifting.

No conflict may be resolved by inference.

## 7. Guide-derived rule lock

The following are project-wide interaction standards:

1. explorer owns final thought/expression;
2. crew never completes final answer;
3. wait/observe before intervening;
4. one small hint at a time;
5. silence/short answer is not pressure target;
6. clarity/kindness before cleverness;
7. child weakness/error is not comedy material;
8. humor may arise from crew-to-crew chemistry;
9. persistent blocking speech UI is forbidden;
10. character choice never creates learning-power advantage;
11. affinity changes relationship expression, not performance;
12. absence does not decay affinity;
13. identity/name history/shared memories bind to stable Explorer_ID;
14. world behavior may express absence/return/dispatch without full simulation;
15. voice is input/accessibility, not a sixth writing tool;
16. special encounter means special meeting method, not stronger ability;
17. optional/special content has no miss penalty/farming pressure.

Any code path that contradicts these is a product-rule regression.

## 8. Fragmentation controls

Forbidden:
- reading REV10, REV11, REV12 as three separate independent products;
- treating exploration crew JSON as the whole Snap & Pop product;
- treating old FUNCTION_STATUS as full completion evidence;
- treating static QA as runtime/device PASS;
- treating Core 6 personality recovery as project completion;
- excluding expansion from full-scope implementation percentage without explicitly saying so.

Required:
`REQUIREMENT → AUTHORITY → OWNER → CODE EVIDENCE → VALIDATION EVIDENCE → STATUS`

## 9. Current P0 status

P0 Canonical consolidation artifacts:
- `SNAP_POP_CURRENT_CANONICAL_2026-09-21.md`
- `data/snap-pop-requirement-matrix.json`
- `C2S/SNAP_POP_FULL_IMPLEMENTATION_AUDIT_2026-09-21.md`
- updated `docs/FUNCTION_STATUS.md`
- `scripts/validate-current-requirement-matrix.mjs`

P0 goal:
make fragmentation visible and mechanically harder to reintroduce.

## 10. Next execution axis

P1 begins from the requirement matrix, not from character design.

Priority:
1. Guide-derived rule → runtime enforcement gaps;
2. ORIGINAL question/adaptation/authorship closure;
3. runtime traceability;
4. then crew orchestration;
5. then connected-app closure;
6. then expansion implementation after unresolved lineage/conflicts are classified.

No Netlify/deploy/merge in this branch-only phase.


### Writing-first surface correction — 2026-09-21

최신 직접 정정:
- Snap & Pop의 기본 상태는 **글쓰기 탐험**.
- 상상구름은 핵심 엔진이지만 **무의식처럼 숨겨진 on-demand 레이어**.
- 별도 `exploreHub`를 기본 사용자 허브로 두지 않는다.
- 기본: 지도/5개 장소 → 3단계 글쓰기.
- 상상구름: 글쓰기 중 호출, 홈 무전 호출, 궁금증/막힘 시 호출.
- 닫으면 원래 글쓰기 문맥/포커스로 복귀.


### Ready Learning Context bridge — 2026-09-21

Runtime integration is now defined as a reference bridge, not ownership transfer.

Flow:

`Ready & Set confirmed Assignment Fact → Ready Learning Master → Learning Unit → minimal Learning Context → Snap & Pop Writing Engine → child-authored final draft → minimal specialist provenance → Ready & Set task`

Hard rules:
- only `FACT_CONFIRMED` Learning Units may be transferred;
- Snap & Pop must not read Ready & Set localStorage directly across app boundaries;
- transfer only minimal learning metadata, not assignment artifacts/answers;
- Ready Learning Master provides subject/activity/cognitive-load/unit context;
- Snap & Pop owns writing-help orchestration and continuous-draft flow;
- Learning Context may guide assistance but must not author the child's final text;
- low-confidence/unresolved context must not strongly steer writing;
- completed writing returns provenance/status, not the child's full draft;
- record keeps only Learning Unit references needed for traceability.


### Semantic Writing Provider boundary — 2026-09-21

Terminology correction:

`SnapPopLearningProvider` is superseded because it conflicts with the role of Ready Learning Master.

Use:

`SnapPopSemanticWritingProvider`

Role split:
- Ready Learning Master = subject / learning-unit / activity / cognitive-load context.
- SnapPopSemanticWritingProvider = semantic analysis of the child's current draft.
- Snap & Pop Writing Engine = selects/bounds the next writing move.
- Exploration Crew = user-facing response subject.
- Child = final author.

Semantic provider hard limits:
- analysis only;
- no final-draft generation;
- no rewriting the child's text;
- no full-sentence answer suggestion by default;
- no grading;
- one next move at a time;
- OpenAI may back the provider internally when securely connected;
- if the provider is unavailable, local writing analysis remains the fallback.


### Badge system recovery — source-backed 2026-09-21

Recovered direct-user requirements from the 2026-09-08 source conversation:

#### Product role
- Badge is not a score table or character power system.
- It records the child's exploration/process moments, including unusual, imperfect, recovery, persistence, and self-directed behaviors.
- Approximately **60 badges** was the requested launch-scale direction, with the catalog allowed to grow from observed child activity.
- Badge must remain separate from Character level, affinity, EXP/Gem economy, and World State.

#### Event scope
Badge candidates may come from:
- starting early;
- creating extra time independently;
- choosing an extra task;
- unusual/special behavior;
- task execution/completion patterns;
- long ISSUE/problem-solving periods;
- returning after distraction/rest;
- noticing/fixing mistakes;
- asking for help appropriately;
- other meaningful child-activity events.

Exact badge names from the historical 60-item table are **WORKING DRAFT**, not all individually user-approved.

#### Visual lock
- circular badge;
- hand-drawn feeling;
- pastel illustration language;
- child Profile Character is the badge protagonist;
- the same child identity must remain recognizable across profile/world/badge derivatives;
- theme may change clothing/props/light/rendering while identity stays stable.

#### Tier / growth presentation
Recovered and subsequently accepted interaction direction:
- five color tiers: Green → Blue → Red → Gold → Platinum;
- each tier uses 1–5 small gem-stars;
- gem-stars sit in a semi-circle around the upper badge rim;
- badge illustration stays hand-drawn/pastel; tier stars act as the clearer progress signal.

This tier is a badge-history/progression presentation, NOT permission to create a character-level power economy.

#### Asset composition
Preferred stable composition:
`COMMON_BADGE_ART + CHILD_IDENTITY_LAYER + BADGE_GROWTH_LAYER`

Where:
- Common Badge Art = background + body/pose + props + optional crew + effects;
- Child Identity Layer = face + hair + glasses / identity-defining traits in the common character style;
- Growth Layer = tier/gem-star state.

Do not regenerate the entire child character independently for every badge.

#### Theme expression
`Character Identity Master → Theme Expression → Badge/World/Diary/Share derivatives`

Identity remains stable; theme changes rendering/expression only.

#### Open / not hard-locked
- final exact 60 badge catalog;
- exact trigger thresholds;
- duplicate/repeat policy;
- exact title unlock thresholds;
- which badge events may influence Special Encounter;
- cross-app owner/storage surface;
- whether historical badges preserve acquisition-time theme or re-render to current theme.



## 11. TAKY user-outcome / UI realization checkpoint — 2026-09-21

Latest direct correction:
- internal CODED/validator progress is supporting evidence, not the user's product-completeness experience;
- user-facing completion must be judged from the actual integrated screen/flow;
- internal development terminology/state must not leak into child-facing UI;
- final UI/visual PASS is not claimable before an approved visual direction and representative device evidence.

Current implementation evidence:
- child-facing internal jargon cleanup applied;
- writing tools reflow to a mobile-friendly wrapped layout;
- Family Expansion internal lock semantics remain internal while the surface shows plain-language availability;
- browser runtime covers app init, IndexedDB, core writing, Family Expansion, child isolation and locked-feature fail-closed behavior.

Current truthful boundary:
- DESIGN REALIZATION = PARTIAL;
- final approved visual direction = OPEN;
- DEVICE_VERIFIED = false;
- hosted/live-provider verification = separate;
- therefore CODED/CI/runtime progress SHALL NOT be reported as equivalent to final product polish.

This checkpoint follows:
`USER OUTCOME → ACTUAL INTEGRATED RESULT → HIGHEST-VALUE DELTA → IMPROVE → TARGETED REGRESSION CHECK`.

Evidence update:
- GitHub Actions run `35587771286` / job `106294991604`;
- branch closure `47/47 PASS`;
- 390×844 Chrome CDP runtime PASS;
- no root/document horizontal overflow;
- visible writing controls satisfy the runtime touch-height gate;
- controls remain inside the viewport;
- next-step primary control satisfies the same touch-height gate.

This is **mobile browser realization evidence**, not real-device DESIGN/DEVICE PASS.


## 12. Controlled rewrite surgery — 2026-09-21

Direct user decision activates a controlled architectural rewrite. The legacy implementation is now regression evidence and temporary compatibility scaffolding, not the target architecture.

Canonical rewrite plan: `C2S/SNAP_POP_REWRITE_SURGERY_2026-09-21.md`.

Phase 1 closed at `66d08c1ea3e5398eb1a33420cf76ad20c29098ba`: persistence ownership and UI shell ownership were extracted from `app.js`; full 48/48 closure and 390×844 Chrome runtime passed.

Next owner migration: Writing Controller. Continued feature patch stacking into `app.js` is not the preferred route when extraction is feasible.


## 13. Rewrite Phase 2 — Writing ownership extracted

Phase 2 closed at `639199a0e4e9d35e78e924824272d4693c11907b`.

Current ownership:
- `writing-controller.js` owns writing-state normalization, question/hint presentation, writing lens labels, language-mode presentation and writing-screen render.
- `writing-flow-controller.js` owns writing start/advance/input/language changes and completion transaction orchestration.
- `app.js` remains temporary compatibility/orchestration and SHALL NOT reclaim those semantics.

Validation: 50/50 closure PASS + 390×844 Chrome CDP runtime PASS.

Next surgery owner: Crew Controller.


## 14. Rewrite Phase 3 — Crew ownership extracted

Phase 3 closed at `15735698dcb23ab926c3322e5ef619d6e0619653`.

Current ownership:
- `crew-controller.js` owns crew-facing presentation helpers, reaction overlay and special invitation presentation.
- `crew-runtime-controller.js` owns crew registry, affinity-memory accumulation, guest selection and synthetic world-state.
- SPECIAL remains encounter-style only with no gameplay/economy advantage.
- guest selection remains explicit-authorized/default-deny.

Validation: 52/52 closure PASS + 390×844 Chrome CDP runtime PASS.

Next surgery owner: Records/Growth/History.


## 15. Rewrite Phase 4 — Records/Growth ownership extracted

Phase 4 closed at `f411829dc38d1bb90c9574c48353e15136afe9f9`.

- `records-growth-controller.js` owns records/gems/growth/result presentation.
- `records-flow-controller.js` owns revision, bonus and wish-spend transactions.
- original record provenance and no-reward-on-revision rule remain locked.
- validation: 54/54 + 390×844 Chrome runtime PASS.


## 16. Rewrite Phase 5A — Special Exploration ownership extracted

Phase 5A closed at `a30698ce07e48c2db417df6fd7e4e05a12d450f9`.

- `special-controller.js` owns the Special Exploration interaction and persistence path.
- guest appearance remains explicit-authorized/default-deny.
- SPECIAL remains no-power/no-reward-advantage.
- validation: 55/55 + 390×844 Chrome runtime PASS.

Next: Imagination Controller, then Settings/Profile and remaining orchestration cleanup.


## 15. Rewrite Phase 4/5 — Records, Special, Imagination ownership extracted

Records/Growth is owned by `records-growth-controller.js` + `records-flow-controller.js`. Special Exploration is owned by `special-controller.js`. Imagination Cloud is owned by `imagination-controller.js`.

Latest validated state: `55c9e35f84f43c145506beda066104470bce15e8`, 56/56 closure PASS + 390×844 Chrome CDP runtime PASS.

Legacy `app.js` is now ~43 KB versus ~92 KB at surgery start. Next owner migration: Settings/Profile/Identity.


## 17. Rewrite checkpoint — thin orchestrator remaining

Latest validated architecture checkpoint: `1b5165d7d1d910dcace9b073e3f304f97920b8f4`.

At this point Settings/Profile/Identity, Badge orchestration, Bridge/context, Bootstrap migration, and Interaction Support are separated into dedicated owners. Branch closure is 61/61 PASS and 390×844 Chrome CDP runtime PASS. Legacy `app.js` is 15,116 bytes versus ~92 KB at surgery start.

Rewrite is NOT yet fully complete: residual wrapper/orchestration glue in `app.js` must be reduced to a thin orchestrator and validated before architecture closure. Final UI/visual direction and device verification remain OPEN.


## Thin orchestrator architecture closure — 2026-09-21

- exact validated code SHA: `7a16d5d01d22067baba40fd2b2933be5b9984ca3`
- evidence commit: `5e9ef59f0b3138d233aaaba5a0e9bda27b4ac09c`
- branch closure: `62/62 PASS`
- browser runtime: `BROWSER_RUNTIME_CDP_PASS`
- viewport: `390×844`
- runtime init: PASS
- IndexedDB: OPEN
- runtime errors: 0
- Family Expansion browser regression: PASS
- app.js thin orchestrator size: approximately 12.6 KB characters at closure
- architecture rewrite: CLOSED
- integrated child-facing UI rewrite: NEXT / OPEN
- final visual direction: OPEN
- DEVICE_VERIFIED: false
- deploy / Netlify / main merge: NOT_RUN
