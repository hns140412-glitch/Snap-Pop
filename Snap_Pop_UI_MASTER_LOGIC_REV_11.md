# Snap & Pop Ui Master Logic — REV_11

> Status: FORMAL BASELINE / SOURCE OF TRUTH
> Date: 2026-09-06
> Previous Baseline: `Snap_Pop_UI_MASTER_LOGIC_REV_10.md`
> Shared Contract: `TAKY/MASTER/LEARNING_APP_FAMILY_MASTER_REV_01.md`
> Brand: Snap & Pop
> Primary Tagline: **생각을 Snap! 아이디어를 Pop!**
> Optional in-app playful phrase: **머쓱~ 머쏙!!**

REV_11 inherits REV_10 unless explicitly overridden below. ORIGINAL features, validated visual rules, five free writing tools, gem/wish/blessing history and expansion boundaries remain preserved.

## 1. PRODUCT ROLE EXPANSION — HARD LOCK

Snap & Pop is not limited to Korean writing.

It is the **thought-to-expression specialist** for the connected learning island.

Supported expression domains include:
- Korean writing and idea development
- diary / reading response / descriptive and explanatory writing
- English sentence writing
- using learned vocabulary in sentences
- English speaking / short oral expression
- sentence expansion and revision

AI/Guide must not author the child's final thought or final writing in place of the child.

## 2. FIVE ORIGINAL PLACES — PRESERVE HARD LOCK

Keep free access to all five tools:
- 아이디어 동굴
- 감정 호수
- 묘사 숲
- 관점 전망대
- 마무리 캠프

These are HELP PLACES, not locked chapters.

No level/EXP/gem gate may lock access to these places.

## 3. QUESTION ENGINE — PRESERVE + EXPAND

Preserve the 3-step exploration loop:
`생각 꺼내기 → 생각 넓히기 → 표현 완성하기`

Question generation may internally draw on growth dimensions such as:
`RECALL / UNDERSTAND / REASON / CONNECT / EVIDENCE / PERSPECTIVE / EXPRESS / REVISE`

Do not expose this taxonomy as a test to the child.

Questions should adapt to context, language and age while keeping child authorship.

For English expression, the same loop may become:
`word/idea recall → sentence expansion → speak/write in own words → optional revise`

## 4. GROWTH CHAPTERS — NEW ADOPT / NAMES NOT HARD LOCKED

Growth chapters are a long-term growth map, separate from the five free help places.

Functional growth sequence:
1. discover own thought
2. expand thought
3. connect ideas
4. see another perspective / add reasons and evidence
5. express through speech/sentence/writing, including English
6. revise and complete

Current naming candidates, not yet HARD LOCKED:
- 첫 발견의 해변
- 생각의 오솔길
- 이어지는 강
- 새로운 시야의 절벽
- 말이 되는 항구
- 빛나는 등대

Chapter progression must not lock the five ORIGINAL places.
Growth is observed across responses over time, not inferred from one answer or one error.

## 5. IMAGINATION CLOUD — SHARED ON-DEMAND EXPANSION

Imagination Cloud is not a fixed Snap & Pop screen only.

Within Snap & Pop it is the strongest expression-expansion mode, but it also participates in the shared Guide contract.

Typical Snap & Pop flow:
`CHILD SPEAKS → MEANING/MOOD/SCENE/IDEA FRAGMENTS APPEAR → CHILD NOTICES/SELECTS → GUIDE ASKS MINIMAL FOLLOW-UP → CHILD EXPANDS → RETURN TO EXPRESSION TASK`

Triggers include:
- child question
- expression stuck
- scene/feeling/idea would benefit from visualization
- child directly requests it

Rules:
- no decorative-only cloud,
- no final-answer generation,
- preserve child ownership,
- preserve shared session/task/lap when invoked from Ready & Set,
- must return to original task.

## 6. RADIO / VOICE INPUT — PRESERVE + CONNECT

Preserve the existing radio voice concept and existing Guide settings.

Radio remains a common input/connection layer, not a sixth writing tool.

In the connected island it also represents continuity with the Guide across BASE CAMP, Hide & Seek and Snap & Pop.

Do not redefine the already established Guide persona in this project master.

## 7. READY & SET HANDOFF CONTRACT

When Snap & Pop is called from an active Ready & Set task:
- receive the same `session_id / goal_id / task_id / lap_id / return_target`,
- do not pause or reset the shared timer merely because the app changes,
- write only Snap & Pop expression-task results,
- return completion/partial/blocked/help status to the session owner,
- do not close the full session.

`APP_SWITCH != LAP_END`

## 8. HIDE & SEEK CONNECTION

Vocabulary discovered/retrieved in Hide & Seek may be handed to Snap & Pop as expression material.

Example:
`Hide & Seek word found → Snap & Pop sentence/speaking use → result returns to shared Learning History`

Do not duplicate the vocabulary source registry as an independent long-term Snap & Pop database.

## 9. GEM / WISH / BLESSING — PRESERVE HARD LOCK

Preserve ORIGINAL identity and wording:
- 보석 / 보석 조각 / 완성 보석
- 탐험가의 소원 상점
- 소원 사용하기
- 축복 사용하기
- 성장 기록

Do not reduce these to a generic coin/item shop.
Do not force Ready & Set or Hide & Seek to copy the same reward economy.

## 10. EXPANSION PACK CONTRACT — PRESERVE / CLARIFY

Expansion packs extend the island/world; they do not rewrite ORIGINAL.

`ORIGINAL CORE + OPTIONAL EXPANSION AREA/EXPERIENCE`

Family/relationship-derived experiences remain optional expansion content and must not replace the five ORIGINAL places, navigation, writing loop, gem/wish/blessing loop or existing records.

## 11. PWA SAFE AUTO-UPDATE

Inherit shared family update contract:
`AUTO DEPLOY → AUTO DETECT → PREPARE → SAFE APPLY`

If Snap & Pop is participating in an active shared session, do not force reload. Apply at safe idle/session-end point after persisting current exploration step, answers, voice-to-text confirmed content, reward-commit state and shared session identifiers.

## 12. ICON / APP NAME RELEASE GATE

Snap & Pop brand name remains Snap & Pop unless separately approved later.

After final UI/visual approval:
- create an original ultra-high-density illustration master icon matching the island/Snap & Pop world,
- derive PWA and Apple touch icon sizes,
- update manifest/icon references only in the approved release,
- validate iPhone/Safari installed-home-screen rendering and cache behavior.

## 13. REGRESSION FAIL CONDITIONS

FAIL if:
- five ORIGINAL places become chapter-locked,
- Guide writes the child's final answer,
- English support turns Snap & Pop into a grammar drill app,
- Imagination Cloud becomes decorative only,
- app switch resets shared timing/session state,
- specialist completion closes the entire Ready & Set session,
- gem/wish/blessing or expansion boundaries disappear,
- new connected-world UI deletes existing writing/history data.

END — SNAP & POP UI MASTER LOGIC REV_11
