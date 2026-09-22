# SNAP & POP PRODUCT/UI ARCHITECTURE — 2026-09-22

Status: PRODUCT/UI RECONCILIATION DRAFT / BRANCH-ONLY
Basis: latest exact HEAD 5cc3ae0f1dc7d11b1fad4fc60298feb1725abfdd
Deployment / Netlify / main merge / DEVICE_VERIFIED: NOT_RUN

## 0. Product purpose lock

Snap & Pop is the connected learning system's **thought-to-expression specialist**.

The child-facing product promise is not "many features." It is:

**떠오른 생각을 붙잡고 → 자기 말로 넓히고 → 자기 표현으로 남기고 → 다시 돌아와 이어가는 경험.**

The exploration world is an experience language, not a decorative skin.
The Exploration Crew is an interaction/presentation layer, not a teacher, grader, answer generator, or power system.

### Learning purpose
- child-authored thinking and expression
- Korean/English writing and short oral expression
- optional learned-word expression material
- revision without replacing the original
- question → verified understanding → optional expression transition

### Non-negotiables
- child final authorship
- WAIT → HINT_OFFER → minimal intervention
- no automatic draft rewrite
- stale semantic result rejection
- truth-state separation
- Imagination Cloud explicit/on-demand with return integrity
- Wish Economy is Snap-owned
- Badge != ability score
- Crew affinity != power
- Special skip has no penalty
- Ready owns session/timer/profile authority
- Hide vocabulary remains expression material only

---

# A. Product/UI Audit

## A1. Current structural strengths
1. Architecture surgery is closed and major domain owners are split.
2. Writing, Imagination, Crew, Records/Growth, Wish, Family, Special, Badge and bridge boundaries exist in code.
3. Runtime evidence already protects authorship, same-draft continuity, truth gating, Imagination return, wish spend, family isolation and PWA recovery.
4. 390×844 browser runtime has evidence.

## A2. Product-level problems

### P1 — Home is carrying too many responsibilities
Current Home/Map simultaneously exposes:
- 5 landmarks
- current explorer
- main crew member
- Special invite
- expression intent banner
- radio/Imagination entry
- selected landmark detail sheet
- status chips

This is structurally valid but cognitively too dense for the product's first decision.

**Correction:** Home must answer only:
1. 지금 어디로 갈까?
2. 이어서 할 것이 있나?
3. 필요하면 궁금증/상상을 어디서 열까?

Everything else becomes contextual or secondary.

### P2 — Navigation reflects implementation domains more than child mental model
Records, Growth, Gems/Wish, Settings, Family and Special are separate code surfaces, but not all deserve primary navigation.

**Correction:** primary child navigation should stay small and stable.

Recommended bottom navigation:
- 탐험
- 기록
- 성장
- 보물함

Contextual/secondary only:
- 글쓰기
- 질문→이해
- 상상구름
- 탐험대
- Special
- 소원상점
- Family
- Settings
- record edit

### P3 — Result surface is too decision-heavy
Current completion screen asks the child to process story, EXP/gem, strengths, records, growth and optional extra practice.

**Correction:** Result has one primary closure action:
**탐험 마치기 / 지도 돌아가기**
and one secondary:
**내 기록 보기**

Growth/reward is acknowledged briefly, not turned into another task.

### P4 — Crew is visually present but product contract is not yet explicit enough
Crew identity is already runtime-driven, but UI must guarantee fixed slots rather than fixed characters.

Required slots:
- CHARACTER_SLOT
- MAIN_COMPANION_SLOT
- CREW_REACTION_SLOT
- GUEST_SLOT

Character identity comes from runtime state.

### P5 — Ask→Understand lacks an explicit stable entry surface
The runtime exists, but the child-facing entry must be recognizable and separate from creative Imagination.

**Correction:** use a clearly labeled contextual action:
**궁금한 게 있어?**
It opens ASK input. It must not be hidden behind ambiguous radio behavior.

### P6 — Imagination and factual question can be confused
Both can start from curiosity.

**Correction:**
- ASK = “진짜로 알고 싶은 것”
- IMAGINATION = “상상해 보고 싶은 것”
The product may route internally, but the child-facing choice must remain comprehensible.

### P7 — Growth / Badge / Wish can visually collapse into one reward economy
They are semantically separate.

**Correction:**
- Growth = continuity/progress story
- Badge = reviewed evidence-based observation identity
- Gem/Wish = Snap economy
No unified score dashboard.

### P8 — Family Expansion is too large for child primary UI
Family functions are runtime-capable but can dominate the child experience.

**Correction:** Family is a secondary mode entered from Settings/Family gate and must restore the exact prior child context on exit.

### P9 — Normal states are represented; non-happy states are not yet a first-class design system
Required:
loading / empty / success / partial / blocked / retry / offline / stale / unavailable / recovery.

### P10 — Final visual direction remains open
Current structural UI is evidence, not visual authority.

---

# B. Product Architecture

## CORE LOOP
### C1. EXPLORE → THINK → EXPRESS → SAVE → RETURN
Home/map → one destination → 3-step writing → complete → record → return.

### C2. ASK → VERIFY → UNDERSTAND → OPTIONAL EXPRESS
Question → truth guard → child-readable answer → optional mental model → one next curiosity OR explicit expression transition.

## SUPPORT LOOP
- Imagination Cloud
- Crew reaction/intervention
- voice listen
- voice input
- expression bridge
- vocabulary material
- explicit reflection

## META LOOP
- Records / revisions
- Growth tree / continuity
- Badge preview / reviewed evidence
- Gem inventory
- Wish economy

## OPTIONAL LOOP
- Special Exploration
- Family Expansion
- extra practice

## SYSTEM / BACKGROUND
- persistence / IndexedDB
- offline shell
- stale guards
- truth verification
- Ready bridge
- Hide expression-material bridge
- shared badge-event envelope
- profile fallback/migration

---

# C. Information Architecture

## Primary child navigation
1. **탐험** — Home/map, resume, writing entry, Ask entry, Imagination entry
2. **기록** — writing records, revisions, cloud history
3. **성장** — one growth tree, activity continuity, badge preview
4. **보물함** — gems, Wish Shop entry, wish history

## Contextual subflows
- SP_WRITING
- SP_ASK
- SP_UNDERSTAND
- SP_IMAGINATION
- SP_SPECIAL
- SP_RECORD_EDIT
- SP_WISH_SHOP
- SP_CREW
- SP_FAMILY
- SP_SETTINGS

## IA rule
A domain may own runtime logic without receiving a primary tab.

---

# D. End-to-End Journeys

## Journey A — 일반 탐험 글쓰기
SP_HOME
→ landmark select
→ SP_LANDMARK_SHEET
→ start
→ SP_WRITING step 1
→ step 2
→ step 3
→ SP_RESULT
→ save acknowledgement
→ SP_HOME

Exception branches:
- empty attempt → WAIT
- repeated empty → HINT_OFFER
- hint reveal → same draft preserved
- voice input fail → manual typing remains available
- offline → local writing remains available
- semantic unavailable → child can continue without AI help
- stale response → ignored

## Journey B — 질문에서 이해로
SP_HOME
→ “궁금한 게 있어?”
→ SP_ASK
→ verification state
→ SP_UNDERSTAND

Truth UI states:
- VERIFIED: 확인된 내용
- PARTIAL: 확인 중인 부분 있음
- INSUFFICIENT: 지금은 근거가 부족함

After full verified answer only:
- optional mental model
- one next curiosity
- optional “이걸 내 표현으로 써볼래?” transition

Never transfer AI answer as child draft.

## Journey C — 상상구름
explicit action
→ SP_IMAGINATION
→ question/imagine
→ child chooses return
→ integrity check
→ exact prior context restored

Writing return key:
session / landmark / step / language / current draft.

## Journey D — 탐험대원
SP_CREW
→ starter roster / known friends
→ select MAIN_COMPANION
→ rename if desired
→ return
→ runtime-selected reactions in slots
→ memory/affinity retained by Explorer_ID.

## Journey E — 소원
SP_TREASURE
→ gem inventory
→ Wish Shop
→ wish select
→ explicit confirmation
→ exact spend
→ ledger + transaction
→ result
→ treasure return.

## Journey F — Special
explicit invite
→ Special
→ optional guest
→ child expression
→ save OR skip
→ no penalty
→ return.

## Journey G — Family
Settings
→ Family gate
→ child profile select
→ diary/letter/support/shared special
→ isolated timeline
→ exit
→ exact prior mode restore.

---

# E. Screen Inventory

| SCREEN_ID | Name | Purpose | Primary action | Secondary | Runtime owner | Key states |
|---|---|---|---|---|---|---|
| SP_HOME | 탐험지도 | next child action | destination select / resume | Ask / Imagination | app shell + writing entry | loading, empty, resume, offline |
| SP_LANDMARK_SHEET | 탐험지 선택 | preview one lens | 시작 | 닫기 | writing | ready, resume |
| SP_WRITING | 탐험 글쓰기 | child-authored expression | 다음 | hint/voice/cloud | writing-flow | WAIT, HINT_OFFER, typing, offline, semantic unavailable, stale |
| SP_RESULT | 탐험 완료 | closure | 지도 복귀 | 기록 보기 | records-flow | success, partial-save, retry |
| SP_ASK | 궁금증 입력 | factual curiosity | 물어보기 | 취소 | knowledge | typing, offline, unavailable |
| SP_UNDERSTAND | 이해 | verified explanation | 돌아가기 | next curiosity / express | truth + knowledge | verified, partial, insufficient, retry |
| SP_IMAGINATION | 상상구름 | optional imagination | 질문/상상 | 돌아가기 | imagination | loading, partial, offline, stale, recovery |
| SP_RECORDS | 탐험 기록 | retrieve work | record open | month nav | records | empty, list, offline |
| SP_RECORD_EDIT | 기록 다듬기 | revision | 수정본 저장 | back | records | dirty, save, retry |
| SP_GROWTH | 성장 | continuity story | history toggle | badge preview | growth | empty, growing |
| SP_TREASURE | 보물함 | gem inventory | Wish Shop | history | wish economy | empty, enough/not-enough |
| SP_WISH_SHOP | 소원상점 | spend gems | confirm | back | wish economy | insufficient, confirm, busy, success |
| SP_CREW | 탐험대 | companion relationship | select | rename | crew/settings | starter, known, undiscovered |
| SP_SPECIAL | 특별 탐험 | optional event | save | skip | special | invite, guest/no guest |
| SP_SETTINGS | 설정 | preferences | save | family/crew | settings | normal |
| SP_FAMILY | 가족 확장팩 | family mode | create/save | child switch | family | disabled, empty, child-isolated |

### Screen state contract
Every applicable screen must define:
LOADING / EMPTY / READY / SUCCESS / PARTIAL / BLOCKED / RETRY / OFFLINE / STALE / RECOVERY.

---

# F. Low-fi Wireframes

## F1. SP_HOME
```
┌──────────────────────────────┐
│ SNAP & POP        보석 2  ⚙ │
│ 오늘의 탐험                  │
│ 어디로 가볼까?               │
│                              │
│       [탐험 세계 지도]        │
│   ○아이디어      ○감정        │
│      ○묘사  ○관점  ○마무리   │
│                              │
│ [이어 하던 탐험이 있어]       │  ← only when resumable
│                              │
│ 궁금한 게 있어?  상상해볼래?  │  ← 2 contextual actions
│                              │
│  [MAIN_COMPANION_SLOT]        │
├──────────────────────────────┤
│ 탐험   기록   성장   보물함   │
└──────────────────────────────┘
```

## F2. SP_WRITING
```
┌──────────────────────────────┐
│ ← 지도        1 / 3          │
│ 아이디어 동굴                 │
│ 지금은 이것만 생각해봐        │
│ “무엇이 먼저 떠올랐어?”       │
│                              │
│ ┌──────────────────────────┐ │
│ │ 내 생각…                  │ │
│ │                          │ │
│ └──────────────────────────┘ │
│ [CREW_REACTION_SLOT]          │
│ 🎙 말해서 쓰기   힌트 하나     │
│ 다른 도움 ▾                   │
│                              │
│       [이 생각으로 다음]       │
└──────────────────────────────┘
```
Note: actual visual should use icon assets rather than emoji.

## F3. SP_UNDERSTAND
```
┌──────────────────────────────┐
│ ← 탐험                       │
│ 궁금증                        │
│ “왜 무지개가 생겨?”           │
│                              │
│ [확인된 내용]                 │
│ 쉬운 설명 2~4 short blocks    │
│ [optional mental model]       │
│                              │
│ 더 궁금한 한 가지 ▸           │
│ 내 표현으로 써볼래?           │
│                              │
│             [돌아가기]        │
└──────────────────────────────┘
```

## F4. SP_RESULT
```
┌──────────────────────────────┐
│ 탐험 완료                     │
│ 내가 만든 글                  │
│ [child authored draft]        │
│                              │
│ 오늘 남은 흔적                │
│ +EXP / gem shard compact      │
│ [CREW_REACTION_SLOT]          │
│                              │
│        [지도 돌아가기]         │
│        기록에서 보기           │
└──────────────────────────────┘
```

---

# G. Design Direction Comparison

## Direction 1 — Illustrated Expedition Journal
- parchment/editorial surfaces
- layered map illustration
- field-notes visual grammar
- restrained character slots
- moderate depth

Strength:
- matches writing/record/exploration meaning.
Risk:
- can become visually busy or “school worksheet” if too much paper/card framing.

## Direction 2 — Living Exploration World
- map/world is dominant
- transitions feel like moving between places
- writing surface emerges from world
- crew appears as environmental presence

Strength:
- strongest emotional product identity.
Risk:
- highest implementation complexity; can hide controls and harm clarity.

## Direction 3 — Modern Field Kit
- clean mobile shell
- exploration props/icons as accents
- strong typography and large action areas
- world illustration concentrated on Home and milestone moments

Strength:
- best clarity, accessibility, runtime mapping and PWA performance.
Risk:
- can feel generic if illustration language is too weak.

## Chosen synthesis
**Modern Field Kit + Living World moments**

Reason:
- child task clarity must beat theme.
- exploration identity remains strong on Home, transitions, crew reactions and completion.
- writing/Ask surfaces stay calm.
- avoids card-everything UI.
- easier to preserve 390×844 mobile readability.
- supports offline/PWA state messaging without visual chaos.

---

# H. Design System Direction

## Layout
- viewport baseline: 390×844
- 4-column child-mobile grid
- horizontal safe padding: 20px
- section gap: 20–28px
- action gap: 12px
- bottom navigation reserved zone: 72–84px + safe-area
- primary controls target: recommend 48px+ height; WCAG absolute floor is lower but product should exceed it.

## Typography
- one display family role for world titles
- one highly readable UI/body family role
- child-facing body: short blocks, 1–3 sentences per block
- no dense helper copy above the writing field.

## Surface rules
- map/world: full-bleed visual surface
- writing/understand: calm flat surface
- contextual sheet: one active selection only
- avoid wrapping every region in rounded cards

## Button hierarchy
1. Primary — exactly one dominant action per task screen
2. Secondary — one or two helpers
3. Tertiary/contextual — text/icon action
4. Destructive/irreversible — explicit confirmation

## Icons
- illustration/icon assets, not emoji as UI language
- icon + visible text for unfamiliar actions
- radio icon never means both factual Ask and imagination at once

## Crew
- no fixed character asset in structural markup
- runtime slot + identity
- reaction must never block typing or primary action

## Motion
- transition confirms place/state change
- no reward explosion
- reduce-motion setting respected
- offline/recovery state never depends on animation alone

---

# I. UI Component Contract — draft

| COMPONENT_ID | Screen | Event | State | Input | Output | Owner |
|---|---|---|---|---|---|---|
| SP_HOME_MAP | HOME | LANDMARK_SELECT | READY | landmarks | selectedLandmark | shell/writing |
| SP_RESUME_BANNER | HOME | RESUME | HIDDEN/READY | draft context | resume event | writing |
| SP_ASK_ENTRY | HOME | OPEN_ASK | READY | none | ask-open | knowledge |
| SP_IMAGINATION_ENTRY | HOME | OPEN_IMAGINATION | READY | return context | cloud-open | imagination |
| SP_MAIN_COMPANION_SLOT | HOME | OPEN_CREW | READY | character_id/state | crew-open | crew |
| SP_WRITING_DRAFT | WRITING | DRAFT_INPUT | EDITING | current draft | draft-changed | writing |
| SP_WRITING_HINT | WRITING | REVEAL_HINT | HIDDEN/OFFERED/REVEALED | intervention state | hint-viewed | writing |
| SP_CREW_REACTION | WRITING | NONE | HIDDEN/VISIBLE | safe reaction | presentation only | crew |
| SP_VOICE_INPUT | WRITING | USER_MIC | READY/LISTENING/ERROR | language | transcript | voice |
| SP_TRUTH_STATUS | UNDERSTAND | NONE | VERIFIED/PARTIAL/INSUFFICIENT | verification | presentation | truth |
| SP_MENTAL_MODEL | UNDERSTAND | NONE | HIDDEN/VISIBLE | verified claims | visualization | knowledge |
| SP_EXPRESSION_TRANSITION | UNDERSTAND | START_EXPRESSION | HIDDEN/READY | question only | new writing intent | bridge/writing |
| SP_WISH_CONFIRM | WISH | CONFIRM | READY/BUSY/INSUFFICIENT/SUCCESS | gem ledger | transaction | wish economy |
| SP_BADGE_PREVIEW | GROWTH | NONE | PREVIEW_ONLY | reviewed visual config | none | badge visual |
| SP_FAMILY_CHILD_SWITCH | FAMILY | CHILD_SELECT | READY | child profiles | active child | family |

---

# J. Runtime Mapping

Current code owners align with the target architecture, but screen orchestration needs reconciliation:
- `app-shell-runtime.js` → primary/subflow navigation
- `writing-controller.js` + `writing-flow-controller.js` → SP_WRITING
- `imagination-controller.js` → SP_IMAGINATION
- `crew-controller.js` / crew runtime → slots/reactions
- `records-growth-controller.js` → split visual surfaces, not merged semantics
- `wish-economy-controller.js` → SP_TREASURE/SP_WISH_SHOP
- `special-controller.js` → SP_SPECIAL
- `settings-profile-controller.js` → SP_SETTINGS/SP_CREW
- family controller/runtime → SP_FAMILY
- truth/knowledge runtimes → SP_ASK/SP_UNDERSTAND

Important: this mapping is a UI contract. It does not transfer domain ownership.

---

# K. New Requirement Candidates

The current 80 requirements are evidence-complete only for their current denominator. The following are newly exposed product/UI obligations and should enter reconciliation.

1. SP-UI-003 — primary child navigation limited to stable product destinations.
2. SP-UI-004 — Ask and Imagination must have distinct child-facing entry semantics.
3. SP-UI-005 — explicit resume-current-draft surface on Home when applicable.
4. SP-UI-006 — every major screen has offline/retry/recovery presentation.
5. SP-UI-007 — stale result must have no visible side effect and no confusing late UI.
6. SP-UI-008 — runtime character identity must render through slots, not fixed assets.
7. SP-UI-009 — Result has one dominant closure action; reward/meta actions are secondary.
8. SP-UI-010 — Growth/Badge/Wish cannot be presented as one score system.
9. SP-UI-011 — Family exit restores prior child/product context.
10. SP-UI-012 — unavailable voice/provider paths preserve manual completion path.
11. SP-UI-013 — Truth status uses child-readable VERIFIED/PARTIAL/INSUFFICIENT presentation.
12. SP-UI-014 — primary unfamiliar controls require visible labels, not icon-only affordance.
13. SP-UI-015 — touch target and spacing baseline exceeds accessibility minimum.
14. SP-UI-016 — one dominant primary action per task screen.
15. SP-UI-017 — non-happy states are part of screen acceptance criteria.
16. SP-UI-018 — bottom nav never exposes implementation-only/system domains.
17. SP-UI-019 — Wish Shop remains outside Growth hierarchy.
18. SP-UI-020 — Badge preview is visibly non-award/non-score.
19. SP-UI-021 — Crew reaction never occludes input/primary action.
20. SP-UI-022 — state restoration after Imagination/Family/subflow return is explicit UI acceptance.

This creates a provisional denominator of **100 requirements** if all 20 survive reconciliation.

Do not yet claim these as coded.

---

# L. Current Reconciliation Status

Current engineering evidence remains:
- CODED 80/80
- STATIC_VERIFIED 80/80
- RUNTIME_VERIFIED 69/80
- DEVICE_VERIFIED 0/80

Provisional product denominator after UI audit:
- Existing: 80
- New candidates: +20
- Provisional: 100

Therefore whole-product coded status must not be reported as 100%.

If the 20 candidates are accepted as canonical requirements before implementation:
- CODED would become at most **80/100**
- STATIC_VERIFIED at most **80/100**
- RUNTIME_VERIFIED at most **69/100**
- DEVICE_VERIFIED **0/100**

These are reconciliation projections, not current matrix values.

---

# Research-derived design constraints

External reference review supports:
- clear and concise child navigation over feature-heavy surfaces,
- creative/gamified framing can improve willingness to write,
- game/visual activity can also overshadow actual writing when unconstrained,
- open-ended exploration works best when interaction is simple,
- offline availability and saved local content are meaningful for child apps,
- cognitive accessibility benefits from clear labels, predictable controls, short text, clear hierarchy and easy recovery,
- touch targets require adequate minimum size/spacing; Snap should use a larger child-friendly internal target baseline.

Reference families reviewed:
- Khan Academy Kids
- Night Zookeeper
- WriteReader
- Pok Pok
- PBS KIDS
- Duolingo
- W3C/WAI cognitive accessibility and WCAG target-size guidance
- public offline/PWA education projects

---

# Next implementation delta

Before visual polish:
1. introduce explicit SP_ASK / SP_UNDERSTAND UI surfaces if current routing is implicit;
2. simplify Home visual priority;
3. implement 4-destination nav contract;
4. add explicit resume draft surface;
5. add state components for offline/partial/blocked/retry/recovery;
6. refactor character presentation to slot contract where any fixed visual assumption remains;
7. simplify Result;
8. separate Growth / Badge / Wish presentation hierarchy;
9. implement Family return-context restoration acceptance;
10. add validators for the 20 UI/product candidates;
11. only then recalculate requirement matrix and evidence scorecard.

Final visual/art direction remains OPEN until high-fidelity reference-comparison pass.
