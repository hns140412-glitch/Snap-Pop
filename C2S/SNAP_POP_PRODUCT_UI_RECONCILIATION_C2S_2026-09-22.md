# SNAP & POP PRODUCT/UI RECONCILIATION C2S — 2026-09-22

## Purpose
Convert the latest product-completion correction into an explicit C2S contract before final visual/UI work.

## Canonical correction
- `CODED 80/80` and `RUNTIME_VERIFIED 69/80` are evidence-index values for the current requirement matrix, not whole-product completion.
- Architecture surgery being CLOSED means the rewritten code structure is viable; it does not mean final UX/UI/product composition is closed.
- Final visual/art direction is OPEN.
- A UI mockup cannot be treated as decoration layered on finished logic. UI decisions can create or modify product requirements, interaction states, transitions, component contracts and runtime obligations.
- Any new requirement exposed by UI/UX reconciliation must be added to the requirement matrix; existing 80/80 must be allowed to decrease rather than preserving an inflated completion claim.

## C2S atoms

### CORRECTION — C2S-SP-UI-001
Whole-product completion must not be inferred from CODED / STATIC / RUNTIME evidence axes.

### REQUIREMENT — C2S-SP-UI-002
Before final visual design, perform Product/UI Functional Reconciliation:
user action → screen → component → event → state → data → crew reaction → result → persistence/return.

### REQUIREMENT — C2S-SP-UI-003
Every designed screen must map to explicit runtime/component contracts. No orphan visual element and no hidden functional requirement.

### REQUIREMENT — C2S-SP-UI-004
Every existing functional requirement must be mapped to at least one user-visible surface or explicitly classified as background/system-only.

### REQUIREMENT — C2S-SP-UI-005
UI state coverage must include loading, empty, success, partial, blocked, retry, offline, stale, permission/availability and return/recovery states where applicable.

### REQUIREMENT — C2S-SP-UI-006
Exploration Crew must be integrated as a behavior/interaction layer, not a fixed decorative character layer. Character identity is runtime-selected.

### REQUIREMENT — C2S-SP-UI-007
Final UI must preserve child authorship, minimal intervention, no answer-writing by AI/crew, truth-state visibility, and Snap-owned Wish Economy boundaries.

### REQUIREMENT — C2S-SP-UI-008
Do not optimize for visual polish before screen hierarchy, feature ownership, interaction flow and state model are reconciled.

### REQUIREMENT — C2S-SP-UI-009
A design handoff must output component IDs, state IDs, event IDs, data bindings and transitions sufficient for implementation without reinterpreting the design.

### REQUIREMENT — C2S-SP-UI-010
No deployment / Netlify / main merge / DEVICE_VERIFIED during this design-reconciliation stage.

### DECISION — C2S-SP-UI-011
Work order:
1. product purpose + child experience
2. information architecture
3. end-to-end journeys
4. screen/state inventory
5. wireframe
6. design system
7. high-fidelity mockups
8. UI-to-runtime contract
9. requirement-matrix reconciliation
10. implementation delta

### OPEN — C2S-SP-UI-012
Final visual/art direction remains open until reference research + comparative review + child-facing readability/usability review are completed.

## Product completion interpretation
Current engineering evidence:
- CODED 80/80
- STATIC_VERIFIED 80/80
- RUNTIME_VERIFIED 69/80
- DEVICE_VERIFIED 0/80

Product-level interpretation:
- engineering/runtime foundation is materially ahead of final product/UX closure.
- final product completion must be recalculated after Product/UI Functional Reconciliation.
- do not preserve the current 80-requirement denominator if UI work reveals missing requirements.

## Locked boundaries
- Snap Wish Economy owner: SNAP_POP_WISH_ECONOMY
- Hide & Seek vocabulary: optional expression material only; no mastery ownership transfer
- Ready & Set cross-app context remains externally owned
- Exploration Crew: runtime identity/behavior layer, not fixed decorative UI
- final visual direction: OPEN
- deployment: NOT_RUN

## Exit criteria for UI-design phase
A UI-design phase is not complete unless:
- screen IA is explicit,
- every screen has purpose and owner,
- every component has state/event/data contract,
- every requirement maps to a surface or background contract,
- all newly discovered requirements are added to matrix,
- child-facing flow is coherent end to end,
- no false completion percentage is retained.
