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
