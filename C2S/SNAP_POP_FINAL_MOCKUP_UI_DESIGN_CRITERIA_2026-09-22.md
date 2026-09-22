# SNAP & POP FINAL MOCKUP/UI DESIGN CRITERIA — 2026-09-22

Status: LOCK CANDIDATE FOR MOCKUP PHASE
Scope: productization before high-fidelity implementation
Deployment / main merge / DEVICE_VERIFIED: NOT_RUN

## 1. Core principle

**PRODUCT LOGIC → IA → JOURNEY → SCREEN PURPOSE → STATE → UI CONTRACT → VISUAL**

Never reverse this order.

A mockup may reveal missing requirements, but a mockup must not silently redefine ownership, learning semantics, authorship or reward logic.

---

## 2. Product experience key

Snap & Pop is the thought-to-expression specialist.

Child experience key:
**생각을 발견한다 → 자기 말로 표현한다 → 기록으로 남긴다 → 다음 탐험으로 돌아온다.**

The world must feel exploratory, but the task itself must remain obvious.

---

## 3. Visual intensity by surface

### HIGH exploration intensity
- SP_HOME
- landmark selection / transition
- Special encounter
- milestone/completion moments

### MEDIUM exploration intensity
- Records
- Growth
- Treasure/Wish
- Crew

### LOW exploration intensity
- Writing
- Ask
- Understand
- Revision
- Family text entry
- Settings

Rule:
**The more thinking/typing the child must do, the calmer the visual surface becomes.**

---

## 4. Home criteria

Home answers only:
1. 어디로 갈까?
2. 이어서 할 것이 있나?
3. 궁금증 또는 상상을 열까?

Required:
- world/map remains the dominant visual.
- five landmarks are always available.
- resume appears only when resumable context exists.
- Ask and Imagination are clearly different.
- main companion is visible but not dominant.
- Special is contextual, not permanent primary navigation.
- no Family/Badge/Wish/Settings feature cards on Home.

Do not:
- stack multiple rounded cards over the map.
- use character art as a fixed structural element.
- use a radio icon as an ambiguous entry to both factual and imaginative flows.

---

## 5. Writing criteria

Primary visual order:
1. location / progress
2. one current question
3. child draft
4. contextual crew reaction
5. minimal assistance
6. primary next action

Required:
- only one dominant primary CTA.
- hint is not auto-visible.
- voice input is explicit child action.
- listening and speaking actions remain distinct.
- imagination is secondary assistance.
- crew reaction never overlaps draft or CTA.
- AI does not visually appear as author.
- the current draft is always the visual center.

WAIT/HINT:
- WAIT must not look like failure.
- HINT_OFFER must feel optional.
- revealed hint must not be formatted as an answer.
- repeated empty input must not create judgment/praise pressure.

---

## 6. Ask / Understand criteria

Ask and Imagination are not one UI mode.

### Ask
Child label:
**궁금한 게 있어? / 진짜로 알고 싶은 것**

### Imagination
Child label:
**상상해볼래? / 있을 법하지 않아도 괜찮은 생각**

Understand must visibly distinguish:
- VERIFIED → 확인된 내용
- PARTIAL → 일부는 더 확인이 필요해
- INSUFFICIENT → 지금은 근거가 부족해

Do not:
- present PARTIAL as visually equivalent to verified.
- use technical verification/provider language.
- transfer the answer into writing draft.
- show many follow-up questions.

Allowed after fully verified:
- one mental model
- one next curiosity
- optional expression transition

---

## 7. Result criteria

Purpose = closure, not dashboard.

Show:
- child-authored output
- one concise crew response
- lightweight trace of progress/reward

Primary CTA:
**지도 돌아가기 / 탐험 마치기**

Secondary:
**기록에서 보기**

Do not put Growth, Badge, Wish and bonus practice at equal visual weight.

---

## 8. Navigation criteria

Primary bottom navigation = exactly 4:
- 탐험
- 기록
- 성장
- 보물함

Contextual only:
- writing
- ask/understand
- imagination
- crew
- special
- wish shop
- record edit
- family
- settings

Repeated navigation stays in the same position and uses the same label.

---

## 9. Crew visual contract

Use slots:
- CHARACTER_SLOT
- MAIN_COMPANION_SLOT
- CREW_REACTION_SLOT
- GUEST_SLOT

Runtime decides character identity.

Visual uniqueness may use:
- hat
- glasses/goggles
- magnifier
- small bag
- notebook
- lightweight explorer gear

But props:
- are not powers,
- do not modify reward,
- do not imply rarity.

Core 6 visual identity is respected when a specific ID is selected.

---

## 10. Reward-system visual separation

### Growth
Continuity / accumulated exploration.

### Badge
Evidence-based reviewed observation.
Never a score or ability rating.

### Gem/Wish
Snap-owned economy.
Wish Shop must not be nested under Growth.

These three may visually coexist in the product but never collapse into one rank/power system.

---

## 11. State design system

Every applicable screen must support:
- LOADING
- EMPTY
- READY
- SUCCESS
- PARTIAL
- BLOCKED
- RETRY
- OFFLINE
- STALE
- RECOVERY

Rules:
- offline writing remains usable where local capability allows.
- live semantic/provider failure cannot block basic writing.
- stale responses produce no late visual mutation.
- blocked state always provides a next safe action where possible.
- recovery restores the prior meaningful context.

---

## 12. 390×844 layout baseline

- viewport: 390×844
- safe horizontal padding: 18–20px
- vertical section rhythm: 20–28px
- button/control gap: 10–12px
- bottom nav + safe area reserved
- major touch targets: product target 48px+ height
- icon-only controls used only when conventional and additionally labelled for accessibility
- unfamiliar actions use icon + visible text

---

## 13. Typography

- child reading first, branding second.
- title should fit in 1–2 lines.
- task instruction: one short sentence.
- helper copy: optional, subordinate.
- avoid more than 3 text hierarchy levels in one viewport.
- no decorative type in writing/Ask body copy.

---

## 14. Surface language

Use:
- full-bleed world scene on Home
- calm field/journal surface on task screens
- sheets only for contextual decisions
- open whitespace as separation
- illustration as orientation or atmosphere

Avoid:
- card for every item
- rounded container nesting
- dense status chip rows
- badge-like labels on ordinary text
- emoji as primary icon language

---

## 15. Motion

Motion communicates:
- entering a place
- returning to the map
- companion appearing
- completion
- recoverable state change

Motion must not:
- reward-spam
- interrupt typing
- reveal hints automatically
- be required to understand state

reduce-motion must have a stable equivalent.

---

## 16. Accessibility and cognitive clarity

- visible labels for child-relevant actions.
- predictable placement of repeated controls.
- no context change on simple focus.
- significant context change follows explicit action.
- controls have sufficient touch size/spacing.
- status must not rely on color alone.
- offline/partial/error must use text + shape/icon cue.

---

## 17. High-fidelity direction

Chosen direction:
**Modern Field Kit + Living World Moments**

Meaning:
- Home feels like a living expedition world.
- task screens feel like a calm field notebook/workbench.
- character presence is contextual, not wallpaper.
- visual personality comes from illustration, props, type hierarchy, motion and spatial depth—not from excessive cards.

---

## 18. Mockup pass set

First high-fidelity pass must include:
1. SP_HOME — normal
2. SP_HOME — resume state
3. SP_WRITING — normal
4. SP_WRITING — HINT_OFFER
5. SP_ASK
6. SP_UNDERSTAND — VERIFIED
7. SP_UNDERSTAND — PARTIAL
8. SP_IMAGINATION
9. SP_RESULT
10. SP_RECORDS
11. SP_GROWTH
12. SP_TREASURE / Wish entry
13. SP_CREW
14. SP_SPECIAL
15. one OFFLINE/RECOVERY state

A single polished screen is not UI completion.

---

## 19. Acceptance gate before code styling

A high-fi screen is accepted only if:
- screen purpose is unambiguous,
- primary action is obvious,
- all shown elements map to component IDs,
- ownership is correct,
- required states are defined,
- no hidden requirement is introduced without registration,
- child authorship remains intact,
- return/back behavior is known,
- offline/provider-failure behavior is known,
- it works conceptually at 390×844.

END
