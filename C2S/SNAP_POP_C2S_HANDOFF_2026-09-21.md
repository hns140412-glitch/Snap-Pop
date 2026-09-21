# SNAP & POP C2S HANDOFF — 2026-09-21

## 0. STATE

- Conversation scope: Snap & Pop rebuild / writing core / Imagination Cloud / Ready Learning bridge / badge recovery / secure semantic provider boundary
- C2S_COMPILE_CLOSED: true
- REFLECTION_COMPLETE: false
- DOWNSTREAM_EXECUTION_COMPLETE: false
- NO_SILENT_LOSS: enforced within recovered conversation scope
- Historical badge provenance recovery: CLASSIFIED_CLOSED_FOR_RETRIEVED_SCOPE / SOURCE_COVERAGE_OPEN
- NEW_CHAT_READY: true
- Merge / deploy / Netlify: NOT_RUN / DO_NOT_RUN until exact frozen candidate + TAKY external-resource gate

## 1. BRANCH LOCK

Snap & Pop
- repo: hns140412-glitch/Snap-Pop
- branch: `taky/snap-pop-implementation-2026-09-20`

Ready & Set
- repo: hns140412-glitch/Ready-Set
- branch: `taky/ready-integration-v01`

Do not merge main/staging.
Do not deploy or call Netlify.

## 2. HARD PRODUCT LOCKS

1. Snap & Pop visible default = writing exploration.
2. Imagination Cloud = hidden/on-demand thought/question layer.
3. Writing flow = `ONE DRAFT → ONE NEXT MOVE → SAME DRAFT GROWS → REVISE/FINISH`.
4. Five places are writing lenses, not isolated mini-games.
5. Child is final author.
   - no ghostwriting
   - no full rewrite
   - no grading
   - no question flooding
6. Ready Learning Master provides learning context only.
7. Snap `SnapPopSemanticWritingProvider` analyzes current draft meaning/context/flow.
8. Browser OpenAI API key is forbidden.
9. Truth Guard remains partial; unverified facts must never be treated as verified.
10. Badge is a separate growth/experience collection axis.
11. Historical ~60 badge names/triggers remain `WORKING_DRAFT_NOT_ACTIVE`.
12. Badge must not be auto-equated with character level / EXP / gem / affinity.
13. User is not tester/debugger.
14. BLOCKED => classify cause first, then choose a different path; do not repeat same failing path.

## 3. P0 BADGE RECOVERY — CURRENT STATE

Source recovery document:
- `C2S/SNAP_POP_BADGE_SOURCE_RECOVERY_2026-09-21.md`

Classification closed for retrieved scope:
- CONFIRMED
  - independent process/experience collection axis
  - not score/power/leaderboard
  - circular / hand-drawn / pastel visual direction
  - Profile Character is protagonist
  - GREEN / BLUE / RED / GOLD / PLATINUM growth presentation
  - meaningful behavior families include self-start, recovery, help request, error discovery, retry, deep thinking, self-explanation, plan adaptation, special behavior, writing exploration
  - no punitive removal / streak pressure
- HOLD
  - character level/growth economy as badge mechanic
  - advanced reward economy
  - social competition/leaderboard
  - badge→EXP/gem/affinity/power auto conversion
- WORKING
  - `data/badge-catalog-working.json`
  - BDG-DRAFT-001..060
  - historical names/triggers/copy/thresholds/art
- OPEN
  - final active catalog
  - exact cross-app event contract
  - award threshold/repeat/dedup rules
  - display surfaces
  - tier applicability
  - old-observation migration
  - remaining historical source coverage

Important:
- source coverage is still OPEN.
- no badge activation has occurred.

## 4. P1 WRITING CORE — CURRENT STATE

Implemented/hardened:
- current continuous draft / snapshots / finalDraft
- stale-result guard
- optional one cross-lens suggestion
- Ready Learning context bridge
- `SnapPopSemanticWritingProvider`
- `openai-semantic-provider.js` browser same-origin adapter
- server-only function `netlify/functions/snap-pop-semantic-writing.mjs`
- `/api/snap-pop-semantic-writing` rewrite
- browser API key path forbidden
- explicit server-side OpenAI model configuration
- current draft meaning/context/coherence/development prioritized over keyword matching
- child draft treated as untrusted content, not instruction
- single-next-move contract
- forbidden rewrite/final-answer fields stripped/rejected
- `factVerified:false` forced until Truth Guard actually verifies facts
- local fallback remains available and also marks factual verification false

Validation for this increment:
- CODED: PASS
- STATIC_VERIFIED: PASS
- RUNTIME_VERIFIED: PARTIAL
  - isolated semantic provider → writing runtime contract PASS
  - forbidden rewrite removal PASS
  - forced factVerified false PASS
  - local fallback PASS
  - server missing-key fail-closed PASS
  - server missing-model fail-closed PASS
  - server multi-question rejection PASS
  - server valid single-next-move response PASS
  - live browser/OpenAI/server runtime NOT_RUN
  - cross-app runtime NOT_RUN
- DEVICE_VERIFIED: NOT_RUN
- OPENAI_RUNTIME_CONNECTED: false
- merge/deploy/Netlify: NOT_RUN

Runtime note:
- first isolated function harness was BLOCKED by missing Web `Response` in connector JS isolate.
- cause classification: JS runtime API/environment mismatch.
- same failed route was not repeated; minimal Response/Request shim was used for isolated contract verification.

## 5. READY ↔ SNAP BRIDGE

Ready provides minimal FACT_CONFIRMED context only:
- learning_unit_id
- analysis_id
- assignment_id
- subject
- activity_types
- cognitive_load_profile
- concept_skill_target
- confidence
- unresolved_flags

Snap returns minimal specialist provenance only.
Do not copy full child draft back to Ready.

## 6. IMAGINATION CLOUD

Must remain hidden/on-demand.
Do not promote it to the default screen.

Current:
- global hidden overlay
- writing-context invocation
- home radio/voice invocation
- return to original context/focus
- basic THINK/ASK route

Still open:
- verified OpenAI Q&A backend
- concept/principle/etymology verification
- comparison/timeline/cause-effect scaffold variants
- full post-model Truth Guard
- high-quality voice/realtime

## 7. TRUTH GUARD

Current: PARTIAL.

Still missing:
- verified source/search pipeline
- history/date/person verification
- science mechanism verification
- reliable etymology verification / folk-etymology blocking
- claim-level evidence validation
- external model result validation

Rule:
Anything not explicitly verified must not be stored/rendered as verified by default.

## 8. IMPLEMENTATION REALITY

Do not report the product as near-finished.

Required reporting:
- CODED
- STATIC_VERIFIED
- RUNTIME_VERIFIED
- DEVICE_VERIFIED

Keep these separate.

## 9. NEXT EXECUTION ORDER

P0 continuation — only unresolved badge recovery
- recover additional Ready intro/profile/HOLD and historical evidence if available
- classify only newly recovered evidence into CONFIRMED / HOLD / WORKING / OPEN
- do NOT redo already closed retrieved scope
- do NOT activate the 60-draft catalog

P1 continuation — implementation gap first
- inspect live semantic boundary wiring and remaining code gaps
- preserve one-next-move / child-authorship / hidden Imagination Cloud locks
- do not deploy merely to test
- do not use user as tester

Then:
P2 Truth Guard
P3 Imagination Cloud intelligence
P4 Crew response guard
P5 Voice
P6 runtime regression
P7 device verification
P8 family expansion

## 10. GOVERNANCE

Apply latest TAKY:
- latest explicit user correction first
- no guessing
- no silent loss
- no false convergence
- lock confirmed decisions
- change impact/regression awareness
- BLOCKED cause classification before alternate path
- user is not tester/debugger
- no merge/deploy/Netlify before exact frozen candidate + external-resource gate

## 11. NEW CHAT ENTRY

Use:
`SNAP_POP_NEW_CHAT_START_2026-09-21.md`

This handoff is ready for a new conversation.
