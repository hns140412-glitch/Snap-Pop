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


## 12. CONTINUATION INCREMENT — 2026-09-21 / P1 HARDENING + P2 FOUNDATION

### P1 semantic writing boundary hardening

Added:
- recursive rejection of forbidden authorship fields, including nested output;
- exactly one next-move question required;
- next-move question must end in a single question mark;
- hint must not contain another question;
- malformed provider output falls back locally with providerError provenance;
- server semantic function guard aligned with browser/runtime guard.

Regression validator:
- `scripts/validate-semantic-writing-runtime.mjs`
- fixture coverage: valid single move / nested forbidden output / multi-question / missing question / hint-question.

Status for this increment:
- CODED: PASS
- STATIC_VERIFIED: PASS
- RUNTIME_VERIFIED: PARTIAL — isolated contract verification only; live browser/OpenAI/server remains NOT_RUN
- DEVICE_VERIFIED: NOT_RUN

### P2 Truth Guard foundation

Added:
- `truth-guard-runtime.js`
- claim/evidence boundary;
- raw provider `verified:true` cannot self-authorize;
- a claim is VERIFIED only when evidence exists;
- overall verified requires CLAIM_EVIDENCE mode, all claims evidence-backed, and zero unresolved items;
- `intelligence-runtime.js` routes factual ASK_UNDERSTAND results through Truth Guard.

Regression validator:
- `scripts/validate-truth-guard-runtime.mjs`

Added server-agnostic knowledge contract:
- `knowledge-runtime.js`
- factual questions route through `SnapPopKnowledge`;
- backend absence falls back to the existing unverified/no-guess response;
- any future backend output is forced through Truth Guard before user-facing verified state;
- `scripts/validate-knowledge-runtime.mjs` records this regression contract.

### Verified search provider — still OPEN

Official OpenAI Responses API web-search/source contract was checked before implementation design.

A bundled GitHub write that attempted to add:
- a new server knowledge function,
- server-side external search call,
- client adapter,
- same-origin route

was BLOCKED by tool security-state classification.

Cause class:
- TOOL / WRITE SECURITY CLASSIFICATION
- not a Snap & Pop runtime/code failure.

TAKY response:
- same blocked bundle was NOT retried;
- readback confirmed no partial server knowledge endpoint write;
- implementation was split into a safe server-agnostic knowledge contract instead.

Current rule:
- do not claim verified Q&A until a compatible server-side retrieval/search path is actually connected and source evidence is returned.
- OPENAI_RUNTIME_CONNECTED remains false.

### Current execution status after this increment

- P0 badge recovered-scope classification: unchanged / do not repeat.
- P1 writing semantic boundary: hardened; live external runtime still open.
- P2 Truth Guard: foundational contract CODED + STATIC/isolated contract evidence; verified retrieval provider OPEN.
- P3+ unchanged.
- merge: NOT_RUN
- deploy: NOT_RUN
- Netlify call: NOT_RUN
- DEVICE_VERIFIED: NOT_RUN

### Next execution order

1. preserve the guarded `SnapPopKnowledge → TruthGuard` boundary;
2. add a compatible server-side verified retrieval provider without exposing API keys or bypassing same-origin security;
3. cross-check retrieved source evidence against claim evidence before allowing verified=true;
4. expose source/evidence provenance in a bounded child-facing way;
5. then continue P3 Imagination Cloud intelligence.


## 13. P2 VERIFIED RETRIEVAL BACKEND INCREMENT — 2026-09-21

### Implemented

Server:
- `netlify/functions/snap-pop-knowledge.mjs`
- server-only `OPENAI_API_KEY`
- explicit `SNAP_POP_KNOWLEDGE_MODEL`
- Responses API `web_search`
- `include: ["web_search_call.action.sources"]`
- model-returned source URLs are NOT trusted by themselves
- claim evidence is promoted only when the URL exactly matches the actual retrieved source set
- invented / non-retrieved URLs remain UNVERIFIED
- no retrieved search source => claim remains UNVERIFIED

Browser:
- `openai-knowledge-provider.js`
- same-origin `/api/snap-pop-knowledge` only
- no browser API key path
- loaded before `knowledge-runtime.js`

Routing:
- repository `netlify.toml` now defines the same-origin knowledge route.
- this is configuration only; Netlify deploy/call was NOT_RUN.

Guard:
- Truth Guard version advanced.
- claim-level evidence no longer implies that the whole answer is verified.
- server returns `coverage: CLAIM_SET_ONLY`.
- full answer `verified=true` requires `coverage: FULL_FACTUAL_CONTENT`, all claims evidence-backed, and no unresolved items.
- current search backend therefore yields evidence-backed claims but does NOT falsely mark the entire generated explanation as fully verified.

UI:
- ASK_UNDERSTAND answer badge now distinguishes:
  - 확인 완료
  - 일부 근거 확인
  - 확인 필요
- verified claim count and up to four evidence domains are shown in a bounded way.
- partial evidence does not display as full verification.

### Validation evidence

Added/updated:
- `scripts/validate-knowledge-search-boundary.mjs`
- `scripts/validate-truth-guard-runtime.mjs`
- `scripts/validate-knowledge-runtime.mjs`

Isolated mocked runtime harness executed without Netlify/OpenAI external calls:
- missing server key => fail closed PASS
- retrieved source exact match => claim evidence PASS
- invented URL => cannot promote PASS
- no search source => remains unverified PASS

Official OpenAI API contract rechecked before implementation:
- Responses API supports `web_search`
- `web_search_call.action.sources` is an includable response field.

### Status

- CODED: PASS for verified retrieval backend boundary
- STATIC_VERIFIED: PASS
- RUNTIME_VERIFIED: PARTIAL
  - isolated/mocked server boundary PASS
  - Truth Guard/knowledge contract isolated evidence PASS
  - live OpenAI call NOT_RUN
  - browser→server live runtime NOT_RUN
  - cross-app runtime NOT_RUN
- DEVICE_VERIFIED: NOT_RUN
- OPENAI_RUNTIME_CONNECTED: false
- merge: NOT_RUN
- deploy: NOT_RUN
- Netlify call: NOT_RUN

### Remaining P2 gap

The retrieval/source boundary is now coded, but full factual-content coverage is intentionally still OPEN.

Do not promote overall answer to verified solely because every listed claim has evidence.

Next P2 work:
1. add a post-answer factual-coverage verifier or equivalent deterministic coverage mechanism;
2. only that mechanism may promote `coverage` from `CLAIM_SET_ONLY` to `FULL_FACTUAL_CONTENT`;
3. preserve claim-level evidence provenance;
4. then move to P3 Imagination Cloud intelligence quality.


## 14. P2 CITATION-LEVEL COVERAGE CLOSURE — 2026-09-21

### Correction from section 13

The first retrieval implementation matched model-returned source URLs against the retrieved source set.
This was improved further.

Current server evidence boundary:
- Responses API web_search is REQUIRED, not optional.
- user-facing factual answer is plain cited output, not model-authored source JSON.
- server reads actual `url_citation` annotations from output text.
- each citation annotation must also match an actual `web_search_call.action.sources` URL.
- sentence ranges are calculated deterministically.
- a sentence is VERIFIED only when at least one valid citation annotation overlaps that sentence and the cited URL exists in the retrieved source set.
- any uncited sentence remains UNVERIFIED.
- any citation URL absent from the retrieved source set is ignored.
- overall `FULL_FACTUAL_CONTENT` is granted only when every answer sentence is VERIFIED and no unresolved sentence remains.

This closes the earlier specific gap where a model could omit factual content from its explicit claims list while still receiving overall verified status.

### UI evidence presentation

- verified evidence title is preserved through Truth Guard;
- up to four evidence sources are rendered as bounded clickable links;
- partial evidence still displays as partial, not full verification.

### Citation coverage regression

Updated:
- `scripts/validate-knowledge-search-boundary.mjs`

Isolated runtime execution:
- all answer sentences cited + sources retrieved => FULL_FACTUAL_CONTENT PASS
- citation URL not in retrieved source set => blocked / CLAIM_SET_ONLY PASS
- one uncited sentence => FULL coverage blocked PASS

Result:
- `CITATION_COVERAGE_RUNTIME_PASS`

### P2 current status

- CODED: PASS
- STATIC_VERIFIED: PASS
- RUNTIME_VERIFIED: PARTIAL
  - isolated citation/source coverage harness PASS
  - isolated semantic/Truth Guard/knowledge contracts PASS
  - live OpenAI web search NOT_RUN
  - live browser→server NOT_RUN
- DEVICE_VERIFIED: NOT_RUN
- OPENAI_RUNTIME_CONNECTED: false
- merge/deploy/Netlify call: NOT_RUN

### Next

P2 guard architecture is sufficiently closed for branch-only implementation work.
Do not claim live runtime connection until external runtime evidence exists.

Proceed to P3 Imagination Cloud intelligence quality while preserving:
- writing-first default surface;
- hidden/on-demand Imagination Cloud;
- Exploration Crew as response owner;
- Truth Guard before verified factual display;
- no user testing;
- no deploy/Netlify/merge.


## 15. P3 IMAGINATION CLOUD INTELLIGENCE — QUESTION STRUCTURE SCAFFOLD — 2026-09-21

### Implemented

Added:
- `curiosity-scaffold-runtime.js`

Role:
- runs AFTER verified knowledge / Truth Guard;
- does not rewrite factual answer content;
- does not mutate verification evidence;
- classifies the child's question structure;
- attaches one understanding lens and one next curiosity only.

Current lenses:
- MEANING / 뜻부터
- ETYMOLOGY / 말의 뿌리
- CAUSE_EFFECT / 왜 → 그래서
- MECHANISM / 어떻게 작동해?
- COMPARE / 같은 점 · 다른 점
- TIME_FLOW / 시간 순서
- PERSON_EVENT / 사람 · 사건
- PLACE_CONTEXT / 어디 · 왜 중요해?
- CONCEPT / 핵심 개념

UI:
- displays `이렇게 보면 쉬워 · <lens>`;
- keeps factual response text unchanged;
- shows only one next-curiosity prompt;
- evidence/truth state remains owned by P2 Truth Guard.

### Regression correction found during validation

Initial classifier produced two collisions:
1. `고려와 조선의 차이는 뭐야?` was incorrectly classified as MEANING because generic `뭐야` matched too early.
2. `훈민정음은 언제 만들어졌어?` was incorrectly classified as MECHANISM because generic `만들어` matched too broadly.

Correction:
- strong/specific question axes now take precedence over generic meaning cues;
- order: ETYMOLOGY → COMPARE → TIME_FLOW → CAUSE_EFFECT → MECHANISM → MEANING → PERSON_EVENT → PLACE_CONTEXT → CONCEPT;
- broad `만들어` mechanism cue removed and replaced with narrower process/mechanism patterns.

Validation:
- Korean + English fixture set: 12/12 PASS after correction.
- scaffold preserves factual core.
- scaffold does not mutate verification object.
- next curiosity remains exactly one prompt.

Artifacts:
- `scripts/validate-curiosity-scaffold.mjs`
- `curiosity-scaffold-runtime.js`
- `intelligence-runtime.js` applies the scaffold only after guarded knowledge result.
- `app.js` renders the lens and one next curiosity.

### Status

- CODED: PASS
- STATIC_VERIFIED: PASS for current question-structure scaffold
- RUNTIME_VERIFIED: PARTIAL
  - isolated classifier fixture evidence PASS
  - live browser flow NOT_RUN
- DEVICE_VERIFIED: NOT_RUN
- merge/deploy/Netlify: NOT_RUN

### Next P3 increment

Move from classification label to a bounded explanation-order template while preserving facts:
- MEANING: definition → example/connection
- ETYMOLOGY: root/origin → present meaning → related word
- CAUSE_EFFECT: cause → process → result
- MECHANISM: parts/steps → how they connect
- COMPARE: common point → key difference → why it matters
- TIME_FLOW: before → event → after
- PERSON_EVENT: who → action → impact
- PLACE_CONTEXT: where → feature → why important

Do not invent missing facts to fill a template.
A template slot must remain absent unless the verified answer actually supports it.
