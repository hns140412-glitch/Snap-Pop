# Snap & Pop Ui Master Logic — REV_12

> Status: FORMAL BASELINE / SOURCE OF TRUTH
> Date: 2026-09-07
> Previous Baseline: `Snap_Pop_UI_MASTER_LOGIC_REV_11.md`
> Shared Contract: `TAKY/MASTER/LEARNING_APP_FAMILY_MASTER_REV_01.md`
> Brand: **Snap & Pop**
> Primary Tagline: **아이디어를 Snap! 이야기로 Pop!**
> Optional in-app playful phrase: **머쓱~ 머쓱!!**

REV_12 inherits REV_11 and its inherited REV_10 detail unless explicitly overridden below.

## 1. BRAND / DESCRIPTION CORRECTION — HARD LOCK

The current official one-line Snap & Pop brand phrase is:

**아이디어를 Snap! 이야기로 Pop!**

The prior REV_11 primary tagline `생각을 Snap! 아이디어를 Pop!` is `SUPERSEDED` as the official tagline.

Natural child-facing questions may still use `생각` where conversationally appropriate. This correction does not require replacing every ordinary occurrence of the Korean word `생각` in learning dialogue.

`OFFICIAL TAGLINE ≠ EVERYDAY QUESTION VOCABULARY`

## 2. PRODUCT ROLE — PRESERVE

Snap & Pop remains the connected learning system's **thought-to-expression specialist**.

It supports expression through:
- Korean writing / idea development,
- English sentence writing,
- learned-word sentence use,
- English speaking / short oral expression,
- sentence expansion and revision.

AI/Guide SHALL NOT replace the child's authorship of the final thought, sentence, speech or writing.

## 3. READY & SET CONNECTED SESSION CONTRACT — HARD LOCK

When called from an active Ready & Set session, Snap & Pop SHALL receive and preserve:

`session_id / goal_id / task_id / lap_id / return_target`

Rules:
- `APP_SWITCH ≠ PAUSE`
- `APP_SWITCH ≠ LAP_END`
- Snap & Pop writes only its expression-task result/evidence.
- Snap & Pop does not become session owner.
- Snap & Pop does not close the full Ready & Set session.
- completion/partial/blocked/help result is returned to Ready & Set.
- timer authority remains with Ready & Set's timestamp-derived session state.

## 4. HIDE & SEEK → SNAP & POP HANDOFF — PRESERVE

A word or context found in Hide & Seek may enter Snap & Pop as expression material.

`FOUND WORD → SNAP & POP EXPRESSION → CHILD SPEAKS/WRITES → RESULT RETURN`

The handed-off word is material, not a generated final answer.
Snap & Pop does not create a competing long-term vocabulary authority.

## 5. RUNTIME BRIDGE RELEASE GATE

The runtime bridge may carry shared identifiers through URL/session context and return a task-level result to Ready & Set.

Required validation before Release PASS:
- incoming context survives Snap & Pop navigation/reload where supported,
- Snap & Pop does not create a second session timer,
- returning to Ready & Set preserves the same `session_id / task_id / lap_id`,
- duplicate result events do not double-close a Lap,
- partial return does not falsely mark completion,
- active child-authored work is preserved before app return,
- real iPhone/Safari app-switch behavior is verified.

`CODE EXISTS ≠ ACTUAL BEHAVIOR VERIFIED`

## 6. RECOVERY / CONFLICT REGISTER — HARD LOCK

REV_12 preserves the inherited REV_11/REV_10 Original Core, five free help places, child authorship, radio/voice, Imagination Cloud, gem/wish/blessing identity, optional Family Expansion boundary, records and safe-update requirements.

Historical Family Expansion detail may exist in prior masters/recovery evidence, including family groups/invite, roles/permissions, multiple child profiles, per-child isolation, forest mailbox/penpal, letter decoration/sealing, cheering cards, diary/illustration/share and related family surfaces.

Those recovered details SHALL be treated as `RECOVERY_REQUIRED / LINEAGE EVIDENCE` unless the active inherited master or a later authoritative user decision confirms them. A recovery summary or historical implementation alone SHALL NOT silently promote them into current required scope.

`HISTORICAL DETAIL ≠ AUTOMATIC CURRENT REQUIREMENT`
`FAMILY EXPANSION ≠ ORIGINAL CORE REPLACEMENT`

### 6.1 GEM-PIECE GIFTING — CONFLICT LOCK

Recovered source lineages conflict:
- one lineage allows optional gem-piece gifting;
- another lineage prohibits gem-piece gifting through family letters and keeps cheering cards separate from the gem/wish/blessing economy.

Current disposition: `CONFLICT / NO AUTO-RESOLUTION`.

Until a later direct authoritative decision resolves precedence:
- do not add a new gem-piece-gifting requirement,
- do not delete a runtime-active behavior solely from the conflict record,
- do not present either side as finalized product policy,
- preserve both source pointers/lineages when implementing or reviewing the Family Expansion layer.

`CONFLICT ≠ PERMISSION TO GUESS`

### 6.2 BASELINE 01 PROJECT CANDIDATES — HOLD

Ideas such as locked-vs-mutable transformation regions and personal/biometric-image privacy boundaries remain project/lower-layer candidates where applicable.
They SHALL NOT be treated as active Snap & Pop HARD LOCKs until separately source-validated and approved at the owning layer.

## 7. REGRESSION

REV_12 does not remove or weaken REV_11/REV_10 preserved features including the five free ORIGINAL places, child authorship, radio/voice, Imagination Cloud, gem/wish/blessing identity, optional expansion boundaries, records and safe-update requirements.

This document reflection does not establish runtime, device, deployment or release PASS.

END — SNAP & POP UI MASTER LOGIC REV_12
