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


## 16. P3 EXPLANATION-ORDER ROUTING — 2026-09-21

### Implemented

Question lens is now classified BEFORE knowledge retrieval and carried through:
`intelligence-runtime.js → knowledge-runtime.js → openai-knowledge-provider.js → snap-pop-knowledge.mjs`

Server uses a strict whitelist:
- MEANING
- ETYMOLOGY
- CAUSE_EFFECT
- MECHANISM
- COMPARE
- TIME_FLOW
- PERSON_EVENT
- PLACE_CONTEXT
- CONCEPT

Unknown lens input falls back to CONCEPT and is never interpolated directly.

Explanation-order guidance:
- MEANING: definition → concrete example or connection
- ETYMOLOGY: root/origin → how the meaning developed → one related word if supported
- CAUSE_EFFECT: cause → what happens in between → result
- MECHANISM: main parts or steps → how they connect
- COMPARE: one shared point → one key difference → why the difference matters
- TIME_FLOW: before → event/change → after
- PERSON_EVENT: who → key action → impact
- PLACE_CONTEXT: where → defining feature → why it matters
- CONCEPT: core idea → simple connection or example

Hard rule:
- order is preferred only when sources support it;
- missing steps must not be invented or forced;
- every factual sentence still requires citation/source coverage from P2.

Validation artifact:
- `scripts/validate-question-lens-routing.mjs`

Checks:
- web_search remains required;
- COMPARE order reaches server instructions;
- TIME_FLOW order reaches server instructions;
- unknown/injected lens falls back to CONCEPT and is not passed through.

### Status

- CODED: PASS
- STATIC_VERIFIED: PASS for bounded lens routing structure
- RUNTIME_VERIFIED: PARTIAL
- live OpenAI/browser/server: NOT_RUN
- DEVICE_VERIFIED: NOT_RUN
- merge/deploy/Netlify: NOT_RUN

### Next P3 increment

Improve explanation quality without increasing pressure:
- choose one visual/mental model when useful;
- preserve one-next-curiosity rule;
- keep child-facing answer compact;
- keep writing-first surface unchanged;
- no separate explore hub.


## 17. P3 VERIFIED-CLAIM MENTAL MODEL — 2026-09-21

### Implemented

Added:
- `mental-model-runtime.js`

Purpose:
- make verified factual explanations easier to picture without generating new facts;
- reuse only existing VERIFIED claim text;
- never paraphrase or synthesize new factual content inside the mental model.

Hard boundary:
- only `verification.claims[].status === VERIFIED` are eligible;
- claim text is copied verbatim;
- UNVERIFIED claims are excluded;
- maximum four mental-model items;
- `transformsFacts:false`;
- no verified claim => no mental model.

Mental-model types:
- FLOW:
  - CAUSE_EFFECT
  - MECHANISM
  - TIME_FLOW
  - PERSON_EVENT
  - PLACE_CONTEXT
  - ETYMOLOGY
- COMPARE:
  - COMPARE
- STACK:
  - MEANING
  - CONCEPT

Structure labels provide navigation only.
They are not evidence and do not create facts.

UI:
- rendered inside the existing Imagination Cloud response;
- no separate learning hub;
- FLOW uses compact arrow sequence;
- COMPARE uses side-by-side cards where space permits;
- mobile collapses FLOW vertically;
- writing-first default surface remains unchanged.

Integration:
- script load order:
  `knowledge-runtime → mental-model-runtime → curiosity-scaffold-runtime → intelligence-runtime`
- `curiosity-scaffold-runtime` attaches mentalModel only after guarded knowledge result.

Validation:
- `scripts/validate-mental-model.mjs`
- isolated Node execution PASS:
  - verified-only
  - flow-type
  - verbatim-source
  - no-fact-transform
  - compare-type
  - no-verified-claim-no-model
  - max-four-items
- final marker:
  `MENTAL_MODEL_VERIFIED_CLAIM_CONTRACT_PASS`

Blocked-path note:
- first execution route attempted direct raw GitHub fetch from the container;
- container DNS resolution was blocked;
- classified as NETWORK / CONTAINER DNS;
- same route was not repeated;
- switched to GitHub connector readback → local temporary execution.

### Status

- CODED: PASS
- STATIC_VERIFIED: PASS
- RUNTIME_VERIFIED: PARTIAL
  - isolated mental-model runtime PASS
  - live browser render NOT_RUN
  - live OpenAI/browser/server NOT_RUN
- DEVICE_VERIFIED: NOT_RUN
- merge/deploy/Netlify: NOT_RUN

### Next P3 increment

Next quality layer:
1. prevent structural labels from implying unsupported semantics when verified claim count/order is insufficient;
2. add bounded mental-model eligibility rules by lens and claim count;
3. then improve child-facing interaction around one-next-curiosity without increasing question pressure.


## 18. P3 MENTAL MODEL ELIGIBILITY LOCK — 2026-09-21

### Problem addressed

A verified claim set must not automatically become a semantic flow diagram.

Risk examples:
- partial evidence visually implying a complete cause → process → result chain;
- one verified sentence being presented as a complete timeline;
- structural labels overstating relationships that evidence did not establish.

### Eligibility rules

Current mental-model runtime:
- STACK types (MEANING / CONCEPT):
  - may render with at least one VERIFIED claim;
  - can render under partial claim coverage because the structure is non-relational.
- FLOW / COMPARE structural types:
  - require `verification.coverage === FULL_FACTUAL_CONTENT`;
  - require at least 2 VERIFIED claims;
  - otherwise no mental model is rendered.

Existing hard locks remain:
- VERIFIED claim text only;
- verbatim text;
- UNVERIFIED excluded;
- max 4 items;
- no factual transformation.

### Validation

Updated:
- `scripts/validate-mental-model.mjs`

Isolated Node execution:
- verified-only PASS
- flow-type PASS
- verbatim-source PASS
- no-fact-transform PASS
- compare-type PASS
- no-verified-claim-no-model PASS
- partial-coverage-no-structural-flow PASS
- single-claim-no-structural-flow PASS
- single-stack-can-render PASS
- max-four-items PASS

Final marker:
- `MENTAL_MODEL_VERIFIED_CLAIM_CONTRACT_PASS`

### Status

- CODED: PASS
- STATIC_VERIFIED: PASS
- RUNTIME_VERIFIED: PARTIAL
  - isolated mental-model eligibility runtime PASS
  - live browser render NOT_RUN
- DEVICE_VERIFIED: NOT_RUN
- merge/deploy/Netlify: NOT_RUN

### Next P3 increment

The next intelligence-quality task is not more structure.
It is interaction pressure control:
- preserve one-next-curiosity;
- avoid automatic follow-up chains;
- suppress next curiosity when the answer is still partially verified or the child did not ask to continue;
- keep writing flow resumable without losing the draft.


## 19. P3 FOLLOW-UP PRESSURE + WRITING RETURN LOCK — 2026-09-21

### Problems addressed

1. `nextCuriosity` was rendered immediately after an answer, which could create implicit pressure to keep asking.
2. WRITING_FLOW opened Imagination Cloud from the textarea, but the latest textarea value could race with async persistence before the overlay opened.
3. return from Imagination Cloud needed an explicit same-exploration / same-step guard so a stale overlay could not write into another writing state.

### Follow-up pressure policy

`curiosity-scaffold-runtime.js` now applies `followUpPolicy`:

- WRITING_FLOW:
  - follow-up unavailable;
  - reason `WRITING_FLOW_RETURN_PRIORITY`.
- incomplete factual verification:
  - follow-up unavailable;
  - reason `VERIFICATION_INCOMPLETE`.
- GLOBAL + `verified === true` + `FULL_FACTUAL_CONTENT`:
  - one optional curiosity may be available;
  - reason `OPTIONAL_AFTER_FULL_VERIFICATION`.

UI:
- even when available, the next curiosity text is hidden by default;
- child sees only `더 궁금하면 한 가지 더`;
- curiosity text appears only after explicit reveal;
- reveal does not auto-submit or create another answer chain.

### Writing-flow draft preservation

Before opening Imagination Cloud from writing:
- current textarea value is read synchronously;
- `active.draft` is updated;
- current step answer is updated;
- active state is persisted;
- only then is the cloud opened.

Return lock:
- cloud stores `activeId + step + draft`;
- on close, restore is allowed only if current active id and current step still match;
- preserved draft is restored to the writing textarea;
- `crewState.cloudReturn.draftPreserved=true` is recorded;
- stale overlay cannot write into a different exploration or step.

### Validation

Added:
- `scripts/validate-imagination-pressure-return.mjs`

Isolated execution PASS:
- global-full-can-offer-optional-followup
- partial-answer-suppresses-followup
- writing-flow-suppresses-followup
- global-full-has-one-next-curiosity
- writing-flow-has-no-next-curiosity
- partial-has-no-next-curiosity
- draft-persists-before-cloud-open
- return-requires-same-active-and-step
- return-restores-preserved-draft
- followup-is-hidden-until-child-reveals

Final marker:
- `IMAGINATION_PRESSURE_RETURN_CONTRACT_PASS`

### Status

- CODED: PASS
- STATIC_VERIFIED: PASS
- RUNTIME_VERIFIED: PARTIAL
  - isolated pressure/return contract PASS
  - live browser interaction NOT_RUN
- DEVICE_VERIFIED: NOT_RUN
- merge/deploy/Netlify: NOT_RUN

### Next P3 increment

Next:
- make writing return visible but minimal;
- do not add another modal or hub;
- after cloud close, restore focus/draft and show at most one short crew acknowledgement;
- do not trigger a new question automatically;
- preserve ONE DRAFT → ONE NEXT MOVE.


## 20. P3 MINIMAL WRITING RETURN ACKNOWLEDGEMENT — 2026-09-21

### Implemented

After closing Imagination Cloud from WRITING_FLOW:
- draft restore still requires same activeId + same step;
- one short crew acknowledgement is shown:
  - KO: `쓰던 글은 그대로 있어. 준비되면 이어서 쓰면 돼.`
  - EN: equivalent non-driving message;
- acknowledgement uses `persist:false`;
- no new question is generated;
- no `analyzeWritingMove`;
- no `runImagination`;
- no next-step navigation;
- no automatic step change.

This preserves:
`ONE DRAFT → ONE NEXT MOVE`
without turning cloud return into a new interaction branch.

### Validation

Updated:
- `scripts/validate-imagination-pressure-return.mjs`

Isolated execution:
- previous 10 pressure/return assertions PASS
- `return-acknowledgement-is-non-driving` PASS

Total:
- 11/11 PASS
- `IMAGINATION_PRESSURE_RETURN_CONTRACT_PASS`

### Status

- CODED: PASS
- STATIC_VERIFIED: PASS
- RUNTIME_VERIFIED: PARTIAL
  - isolated pressure/return/acknowledgement contract PASS
  - live browser interaction NOT_RUN
- DEVICE_VERIFIED: NOT_RUN
- merge/deploy/Netlify: NOT_RUN

### Next

P3 branch-only intelligence quality is now materially stronger.

Next axis:
- review remaining P3/P4 boundary:
  - Exploration Crew response ownership on all Imagination Cloud paths;
  - no raw provider/system voice leakage;
  - crew-specific reaction guard without changing factual content;
- keep P2 Truth Guard and P3 pressure locks unchanged.


## 21. P4 EXPLORATION CREW RESPONSE OWNERSHIP — 2026-09-21

### Problems addressed

User-facing Imagination Cloud content could expose provider identity through:
- provider-authored title;
- raw system/model metadata;
- provider label in history UI;
- possible provider self-identification inside returned text.

A naive word-stripping guard was rejected during implementation because it could corrupt legitimate factual content such as `경제 모델`.

### Current ownership boundary

Added:
- `crew-presentation-guard.js`

Rules:
- user-facing response owner is always `EXPLORATION_CREW`;
- provider-authored title is replaced with a generic crew-owned title;
- title is localized for Korean / English;
- factual `core`, nodes, example and speakable content are preserved, not paraphrased;
- provider/system metadata fields are removed from the user-facing object;
- internal `provider` provenance may remain in storage/runtime for diagnostics;
- provider name is removed from Cloud History UI;
- known AI/system self-identification patterns in factual text cause fail-closed `CREW_PRESENTATION_IDENTITY_LEAK`;
- leak content is not silently rewritten or word-stripped.

All intelligence paths now pass through a shared `present(result, language)` helper:
- verified ASK_UNDERSTAND;
- unverified fallback;
- external THINK_EXPRESS;
- local THINK_EXPRESS;
- EMPTY/local scaffold.

This makes response ownership consistent even when no external provider is used.

### UI/storage separation

Cloud render path:
- intelligence result → presentation guard → render.

Cloud history:
- stores a public-safe history payload;
- retains provider provenance internally;
- does not display provider label to the child.

### Validation

Added/updated:
- `scripts/validate-crew-presentation-ownership.mjs`

Isolated execution PASS:
- generic-crew-title
- english-title-localized
- factual-core-preserved
- factual-node-preserved
- response-owner-is-crew
- system-metadata-removed
- internal-provider-can-remain-for-provenance
- self-identity-leak-fails-closed
- history-ui-hides-provider-label
- history-still-keeps-provider-provenance
- app-applies-presentation-guard-before-render
- all-intelligence-paths-have-present-helper

Final marker:
- `CREW_PRESENTATION_OWNERSHIP_CONTRACT_PASS`

### Implementation correction log

An initial guard removed generic words like `model` / `provider` from user-facing text.
That approach was identified as unsafe because it could mutate legitimate facts.
It was replaced before closure with:
- verbatim factual content preservation;
- metadata/title ownership normalization;
- explicit self-identity leak detection + fail-closed behavior.

### Status

- CODED: PASS
- STATIC_VERIFIED: PASS
- RUNTIME_VERIFIED: PARTIAL
  - isolated presentation ownership contract PASS
  - live browser interaction NOT_RUN
- DEVICE_VERIFIED: NOT_RUN
- merge/deploy/Netlify: NOT_RUN

### Next P4/P5 boundary

P4 response ownership is materially closed for branch-only work.

Next:
- inspect voice path ownership so TTS never speaks hidden provider/system metadata;
- keep `speakable` guarded;
- then move into P5 voice quality/realtime boundary without weakening authorship or Truth Guard.


## 22. P4→P5 VOICE OWNERSHIP BOUNDARY — 2026-09-21

### Implemented

`voice-runtime.js` now owns every TTS path.

Rules:
- speech text is bounded and non-empty;
- known AI/system self-identification is rejected with `VOICE_IDENTITY_LEAK`;
- legitimate factual text such as `AI 모델은 ...` remains unchanged;
- external voice provider receives:
  - guarded text only;
  - normalized language;
  - `voiceRole: crew`;
  - `responseOwner: EXPLORATION_CREW`;
- any non-crew requested role is coerced to crew.

App correction:
- direct browser `speechSynthesis` fallback was removed from `app.js`;
- app TTS now requires `SnapPopVoice`;
- if voice runtime is unavailable, app falls back to text UI/toast rather than bypassing ownership guard.

Browser TTS is still allowed only INSIDE `voice-runtime.js`, after the same guarded text boundary.

### Validation

Added:
- `scripts/validate-voice-ownership.mjs`

Isolated execution PASS:
- legitimate-ai-fact-preserved
- self-identity-speech-blocked
- external-voice-forced-to-crew
- app-has-no-direct-speech-synthesis-bypass
- app-requires-voice-runtime

Final marker:
- `VOICE_OWNERSHIP_BOUNDARY_PASS`

### Status

- CODED: PASS
- STATIC_VERIFIED: PASS
- RUNTIME_VERIFIED: PARTIAL
  - isolated voice ownership boundary PASS
  - browser/device voice runtime NOT_RUN
  - external realtime voice NOT_RUN
- DEVICE_VERIFIED: NOT_RUN
- merge/deploy/Netlify: NOT_RUN

### Next P5 increment

Voice ownership is locked.

Next P5 work:
1. voice quality policy;
2. Korean/English pacing and interrupt behavior;
3. browser fallback vs external voice capability separation;
4. no provider/system identity exposure;
5. no auto-speaking that increases interaction pressure;
6. external realtime voice remains OPEN until separately implemented and verified.


## 23. P5 VOICE QUALITY / PACING / AUTO-READ POLICY — 2026-09-21

### Regression found and corrected

Existing `autoRead` behavior spoke:
- current question;
- hidden hint;

even when the hint had not been revealed in the UI.

This violated the existing child-pressure rule:
- hint remains optional;
- one hint only;
- hidden help must not be exposed automatically.

Correction:
- `AUTO_READ` now speaks the current question only.
- manual `listenBtn` reads the hint only when `hintLevel > 0`.

### Voice policy

`voice-runtime.js` now exposes `voicePolicy`.

Supported speech initiation:
- `USER_TAP`
- `AUTO_READ`

USER_TAP:
- user initiated;
- default interrupt = true;
- max text = 1600 chars.

AUTO_READ:
- only for an already-enabled explicit user setting;
- default interrupt = false;
- bounded to 700 chars;
- hidden hint is excluded from the automatic speech call.

Language pacing:
- Korean browser fallback rate: 0.94
- English browser fallback rate: 0.98
- pitch: 1

These are policy defaults, not device-verified voice-quality claims.

External provider receives the same policy:
- source
- interrupt
- pacing
- `voiceRole: crew`
- `responseOwner: EXPLORATION_CREW`

### Capability separation

`SnapPopVoice.capabilities()` now separates:
- mode;
- TTS;
- STT;
- realtime;
- browser fallback.

Important:
- existence of an external provider does NOT imply realtime.
- realtime is true only when provider capabilities explicitly declare `realtime: true`.
- current external realtime implementation remains OPEN / NOT_RUN.

### Validation

Added:
- `scripts/validate-voice-quality-policy.mjs`

Repository readback checks:
- AUTO_READ uses `speak(p[0], ..., "AUTO_READ")`;
- hidden hint is not included;
- manual listen only includes hint when already revealed.

Isolated Node policy execution PASS:
- user-tap-default-interrupts
- auto-read-default-does-not-interrupt
- language-pacing-separated
- auto-read-is-more-bounded
- external-receives-initiation-policy
- realtime-not-inferred-from-external-provider
- legitimate-fact-survives-guard
- identity-leak-blocked

Final marker:
- `VOICE_QUALITY_POLICY_RUNTIME_PASS`

### Status

- CODED: PASS
- STATIC_VERIFIED: PASS
- RUNTIME_VERIFIED: PARTIAL
  - isolated voice policy runtime PASS
  - browser/device TTS/STT NOT_RUN
  - external realtime voice NOT_RUN
- DEVICE_VERIFIED: NOT_RUN
- merge/deploy/Netlify: NOT_RUN

### Next P5 increment

Next:
1. listening/STT session ownership and interruption rules;
2. prevent overlapping recognition sessions;
3. distinguish explicit microphone action from any future hands-free/realtime mode;
4. no always-listening mode without separate explicit approval;
5. preserve text-first fallback.


## 24. P5 STT SESSION OWNERSHIP / ONE-SHOT LOCK — 2026-09-21

### Implemented

`voice-runtime.js` now owns STT session lifecycle.

Listen policy:
- only explicit `USER_MIC` source is accepted;
- `continuous:true` is rejected;
- `realtime:true` is rejected;
- current mode is always one-shot;
- no always-listening mode is available.

Single-session lock:
- starting a new listen first stops any previous external/browser session;
- each session receives a monotonically increasing `sessionId`;
- current session id is tracked;
- callbacks from an older/stale session are ignored;
- only the active session can deliver:
  - onStart
  - onText
  - onError
  - onEnd

External voice provider receives:
- oneShot=true
- continuous=false
- realtime=false
- responseOwner=EXPLORATION_CREW
- explicit sessionId

Stop behavior:
- provider-returned stop callback is invoked when available;
- provider `stopListening` is also called;
- browser recognition is aborted;
- active session id is cleared.

### Validation

Added:
- `scripts/validate-stt-session-ownership.mjs`

Isolated execution PASS:
- continuous-listening-blocked
- realtime-listening-blocked
- new-session-stops-previous
- external-listen-forced-one-shot
- stale-callbacks-ignored
- current-session-callbacks-pass

Final marker:
- `STT_SESSION_OWNERSHIP_PASS`

### Status

- CODED: PASS
- STATIC_VERIFIED: PASS
- RUNTIME_VERIFIED: PARTIAL
  - isolated STT session ownership PASS
  - browser/device microphone runtime NOT_RUN
  - external realtime voice NOT_RUN
- DEVICE_VERIFIED: NOT_RUN
- merge/deploy/Netlify: NOT_RUN

### Next P5 increment

Current voice boundary is safe for branch-only work.

Next:
1. review app mic entry points so every listen is explicit user action;
2. remove or rename any misleading `autoVoice` semantics that could imply hands-free listening;
3. keep HOME_RADIO explicit-action only;
4. after that, P5 branch-only voice architecture can be considered closed until live runtime/device stage.


## 25. P5 EXPLICIT MIC ENTRY / BRANCH-ONLY VOICE CLOSURE — 2026-09-21

### Mic entry audit

Previous path:
- HOME_RADIO click
- `openImagination(autoVoice:true)`
- programmatic click of the voice button

Even though it originated from a user action, this path was removed because:
- `autoVoice` semantics were ambiguous;
- browser microphone permission/user-activation could be lost after async open;
- it weakened the explicit-mic-only boundary.

### Current rule

Every STT session now starts only from an explicit mic button handler.

Current app listen entry points:
1. Imagination Cloud mic button
2. Writing voice input button

Both pass:
- `source:"USER_MIC"`

HOME_RADIO:
- opens Imagination Cloud only;
- does NOT start microphone;
- child must explicitly press the mic button.

Removed:
- `autoVoice` parameter;
- programmatic voice-button click on cloud open.

### Validation

Updated:
- `scripts/validate-stt-session-ownership.mjs`

Repository readback:
- exactly two `SnapPopVoice.listen` call sites;
- both are inside explicit button handlers;
- both declare `source:"USER_MIC"`;
- no `autoVoice` remains;
- HOME_RADIO opens cloud without starting STT.

Previous isolated STT session execution remains PASS:
- continuous/realtime blocked;
- previous session stopped;
- one-shot forced;
- stale callbacks ignored;
- active callbacks pass.

### P5 branch-only status

P5 voice architecture is now closed for branch-only static/isolated work:

- voice ownership: PASS
- TTS ownership boundary: PASS
- pacing/interrupt policy: PASS
- autoRead hidden-hint regression: FIXED
- STT one-shot session ownership: PASS
- stale callback guard: PASS
- explicit mic entry only: PASS
- always-listening: NOT IMPLEMENTED / BLOCKED BY POLICY
- realtime external voice: OPEN / NOT_RUN
- browser/device TTS/STT: NOT_RUN
- DEVICE_VERIFIED: NOT_RUN
- merge/deploy/Netlify: NOT_RUN

### Next execution axis

Do not spend more branch-only time inventing realtime voice behavior.

Next should move to:
- P6 integrated regression across P1–P5 contracts;
- static/runtime-isolated cross-regression;
- detect collisions between Truth Guard, curiosity scaffold, mental model, pressure control, crew ownership and voice policy;
- still no deploy/device/Netlify until frozen candidate and external-resource gate.
