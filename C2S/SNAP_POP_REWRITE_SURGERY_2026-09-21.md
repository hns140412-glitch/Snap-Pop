# SNAP & POP REWRITE SURGERY — 2026-09-21

Status: ACTIVE REWRITE / BRANCH-ONLY

## Trigger

Direct user correction: accumulated coupling and context drift are now large enough that continued patch stacking is unsafe. Preserve product meaning and rewrite architecture under TAKY.

## Primary outcome

Rebuild Snap & Pop so UI can change without re-breaking feature logic, state ownership stays explicit, and user-facing quality is judged from the integrated product rather than internal implementation volume.

## Protected state

The rewrite SHALL preserve:
- writing-first default surface;
- five places as writing lenses;
- ONE DRAFT → ONE NEXT MOVE → SAME DRAFT GROWS → REVISE/FINISH;
- child final authorship;
- Exploration Crew rules and no-power Special role;
- Imagination Cloud on-demand + return integrity;
- voice ownership boundaries;
- Truth Guard / verification separation;
- badge experience-axis separation;
- optional Family Expansion + child isolation + recovery/conflict locks;
- Ready & Set session/bridge ownership;
- NO USER-AS-QA;
- no deploy/device/release overclaim.

## Why surgery

Legacy concentration at start:
- app.js repository blob approximately 92 KB;
- 94 named functions;
- 225 direct DOM references;
- 56 direct event-property bindings;
- persistence, navigation, writing, crew, records, badge, imagination and special exploration are concentrated in one orchestration file.

This is a structural source of UI-change blast radius and context loss.

## Target ownership

- app-storage-runtime.js → local persistence mechanism only
- app-shell-runtime.js → view activation + surface utility only
- app.js → temporary compatibility/orchestration adapter; MUST shrink
- writing controller/runtime → writing state + transitions
- crew controller/runtime → crew presentation/orchestration
- records controller → records/growth/history surface
- family-expansion-app.js → Family UI adapter
- family-expansion-runtime.js → Family semantic contract
- snap-bridge.js → cross-app adapter only
- index.html/styles.css → presentation, not domain authority

## Migration rule

For each ownership family:
1. preserve canonical behavior;
2. extract one owner;
3. replace legacy implementation with delegation;
4. run full closure + representative browser runtime;
5. only then move the next family.

Duplicate semantic ownership is not allowed after each phase closes.

## Phase 1 — STARTED

Extracted from legacy app.js:
- IndexedDB open/get/set/setMany → app-storage-runtime.js
- view activation/toast/HTML escaping → app-shell-runtime.js

Legacy app.js now delegates those concerns.

Phase 1 exit:
- rewrite foundation boundary validator PASS;
- existing full validator suite PASS;
- 390×844 browser runtime PASS;
- writing + Family flow regression PASS.

## Completion semantics

REWRITE STARTED ≠ REWRITE COMPLETE.
MODULE EXISTS ≠ OWNER MIGRATED.
LEGACY DELEGATION ≠ FINAL ARCHITECTURE.

Completion requires app.js to become thin orchestration only, with material state/feature/UI ownership independently testable.


## Phase 1 closure evidence

- exact SHA: `66d08c1ea3e5398eb1a33420cf76ad20c29098ba`
- Actions run: `35588685883`
- job: `106297888041`
- REWRITE_FOUNDATION_BOUNDARY_PASS
- BRANCH_CLOSURE_VALIDATOR_PASS 48/48
- BROWSER_RUNTIME_CDP_PASS
- 390×844 runtime preserved

Phase 1 disposition: CLOSED.
Phase 2 entry: extract Writing Controller without changing protected writing semantics.


## Phase 2 closure evidence

### Extracted ownership
- writing-controller.js → writing presentation/state helper owner
- writing-flow-controller.js → writing start/advance/input/language/completion flow owner

### Legacy reduction
- app.js reduced by approximately 12 KB across Phase 2A + 2B.
- direct writing event ownership removed from app.js for start, next, draft input and language switching.

### Exact evidence
- SHA: `639199a0e4e9d35e78e924824272d4693c11907b`
- Actions run: `35589987925`
- job: `106301962904`
- WRITING_CONTROLLER_BOUNDARY_PASS
- WRITING_FLOW_CONTROLLER_BOUNDARY_PASS
- BRANCH_CLOSURE_VALIDATOR_PASS 50/50
- BROWSER_RUNTIME_CDP_PASS

Phase 2 disposition: CLOSED.
Phase 3 entry: extract Crew Controller while preserving Guide-derived interaction rules and Special=no-power semantics.


## Phase 3 closure evidence

### Extracted ownership
- crew-controller.js → crew identity/rule presentation, reaction overlay, special invite presentation
- crew-runtime-controller.js → registry, affinity/memory, guest selection, synthetic world-state

### Exact evidence
- SHA: `15735698dcb23ab926c3322e5ef619d6e0619653`
- Actions run: `35591812660`
- job: `106307662202`
- CREW_CONTROLLER_BOUNDARY_PASS
- CREW_RUNTIME_CONTROLLER_BOUNDARY_PASS
- BRANCH_CLOSURE_VALIDATOR_PASS 52/52
- BROWSER_RUNTIME_CDP_PASS

Phase 3 disposition: CLOSED.
Phase 4 entry: extract Records/Growth/History while preserving original-record provenance, revision history, EXP/Gem ledgers and child-facing timeline behavior.


## Phase 4 closure evidence
- records-growth-controller.js → records/gems/growth/result presentation
- records-flow-controller.js → revision/bonus/wish transactions
- SHA `f411829dc38d1bb90c9574c48353e15136afe9f9`
- run `35593508272` / job `106312987169`
- 54/54 closure PASS + Browser CDP PASS
- app.js reduced by ~10.7 KB across Phase 4.


## Phase 5A closure evidence
- special-controller.js → Special Exploration owner
- SHA `a30698ce07e48c2db417df6fd7e4e05a12d450f9`
- run `35594097359` / job `106314852163`
- 55/55 closure PASS + Browser CDP PASS
- next: Imagination Controller → Settings/Profile → remaining orchestration.


## Phase 5B closure evidence
- imagination-controller.js → Imagination Cloud entry/run/close/return ownership
- SHA `55c9e35f84f43c145506beda066104470bce15e8`
- run `35596924196` / job `106323772673`
- 56/56 closure PASS + Browser CDP PASS
- Radio=Imagination entry contract preserved
- return integrity preserved

Phase 5 disposition: CLOSED.
Phase 6 entry: Settings/Profile/Identity extraction.


## Latest rewrite checkpoint — 61/61

- validated SHA: `1b5165d7d1d910dcace9b073e3f304f97920b8f4`
- run: `35609997862`
- job: `106366428142`
- 61/61 branch closure PASS
- Browser CDP PASS at 390×844
- app.js: 15,116 bytes (~92 KB at surgery start)

Additional owners now extracted:
- settings-profile-controller.js
- badge-controller.js
- bridge-context-controller.js
- bootstrap-controller.js
- interaction-support-controller.js

Next and final architecture target: thin app.js orchestrator closure. UI rewrite follows only after that closure.


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


## Integrated UI rewrite entry — Phase 1

Latest exact-head evidence:
- SHA `0cef75de449b17111610aa4dea449b19066b9efc`
- 63/63 closure PASS
- 390×844 Browser CDP PASS

Phase 1 child-writing hierarchy now includes:
- a single current writing focus;
- explicit child-owned writing surface;
- Voice + Hint as primary quick assists;
- secondary assists collapsed behind an optional drawer;
- dedicated next-action dock above bottom navigation;
- large writing surface preserved.

This is an interaction hierarchy rewrite, not final visual styling approval.
Next UI work must continue surface-by-surface without moving domain ownership back into `app.js`.


## Integrated UI structural closure — 2026-09-22

- exact validated code SHA: `02977e81d0c03c1bdb941b9c5a6685c88dbaa373`
- evidence commit: `8f1ca65830b05e018deff698ff405ffc76f62b4a`
- branch closure: `68/68 PASS`
- browser runtime: `BROWSER_RUNTIME_CDP_PASS`
- viewport: `390×844`
- architecture rewrite: CLOSED
- integrated UI structural rewrite: CLOSED
- verified child-facing surfaces:
  1. Home / Map
  2. Writing
  3. Result / Records / Growth
  4. Imagination Cloud / Special Exploration
  5. Settings / Family
- final visual / art direction: OPEN
- DEVICE_VERIFIED: false
- deploy / Netlify / main merge: NOT_RUN

This closure means interaction hierarchy and structural child-facing flow are validated. It does not mean final visual styling, production hosting, or physical-device verification is complete.
