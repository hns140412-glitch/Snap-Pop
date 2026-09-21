최신 TAKY 기준으로 Snap & Pop 작업을 재개해.

먼저 Google Drive의 `SNAP_POP_HANDOFF_2026-09-21_LATEST`와 GitHub의 아래 기준을 읽고 현재 상태를 복원해.

Snap & Pop:
- repo: hns140412-glitch/Snap-Pop
- branch: `taky/snap-pop-implementation-2026-09-20`
- `C2S/SNAP_POP_C2S_HANDOFF_2026-09-21.md`
- `C2S/SNAP_POP_BADGE_SOURCE_RECOVERY_2026-09-21.md`
- `SNAP_POP_CURRENT_CANONICAL_2026-09-21.md`
- `data/snap-pop-requirement-matrix.json`
- `data/exploration-crew-rules.json`
- `data/badge-system.json`
- `data/badge-catalog-working.json`
- `badge-runtime.js`
- `writing-runtime.js`
- `semantic-writing-runtime.js`
- `openai-semantic-provider.js`
- `netlify/functions/snap-pop-semantic-writing.mjs`
- `learning-context-runtime.js`
- `intelligence-runtime.js`
- `voice-runtime.js`
- `snap-bridge.js`

Ready & Set:
- repo: hns140412-glitch/Ready-Set
- branch: `taky/ready-integration-v01`
- `ready-learning-master-v01.js`
- `ready-runtime-v07.js`

중요 잠금:
1. Snap & Pop 기본 상태는 글쓰기 탐험이다.
2. 상상구름은 핵심이지만 평소 숨은 on-demand 사고/질문 레이어다. 기본 화면으로 올리지 마.
3. 글쓰기는 `ONE DRAFT → ONE NEXT MOVE → SAME DRAFT GROWS → REVISE/FINISH` 구조다.
4. 5개 장소는 독립 미니게임이 아니라 글쓰기 lens다.
5. 아이가 최종 작성자다.
   - 대필 금지
   - 전체 rewrite 금지
   - 채점 금지
   - 질문폭격 금지
6. Ready Learning Master는 학습 맥락만 제공하고, Snap `SnapPopSemanticWritingProvider`가 현재 초안 의미/맥락/흐름을 분석한다.
7. secure same-origin OpenAI 경계 코드는 이미 구현·정적검증돼 있다.
   - 브라우저 API key 금지
   - live OpenAI/browser/server runtime은 아직 검증 전
   - `OPENAI_RUNTIME_CONNECTED=false`
8. Truth Guard는 부분 구현이다. 검증되지 않은 사실을 verified로 취급하지 마.
9. 배지 시스템은 독립 성장·경험 수집축이다.
10. `data/badge-catalog-working.json`의 약 60개 이름/트리거는 `WORKING_DRAFT_NOT_ACTIVE`다. 자동 확정/활성화 금지.
11. 배지를 캐릭터 레벨 / EXP / 보석 / 친밀도와 자동 동일시하지 마.
12. 사용자를 테스터/디버거로 쓰지 마.
13. merge / deploy / Netlify 금지. exact frozen candidate + TAKY external-resource gate 전에는 호출하지 마.
14. BLOCKED가 발생하면 같은 실패 조건에 같은 시도를 반복하지 말고 원인을 분류한 뒤 다른 경로를 선택해.
15. 보고는 반드시 `CODED / STATIC_VERIFIED / RUNTIME_VERIFIED / DEVICE_VERIFIED`를 분리한다.

현재 이어갈 지점:
A. 배지 P0는 “현재 회수 범위 분류”까지 닫혀 있다. 처음부터 반복하지 마.
   - 추가로 회수 가능한 Ready 인트로/프로필/HOLD 및 과거 Drive/대화 근거만 더 찾는다.
   - 새로 회수된 것만 CONFIRMED / HOLD / WORKING / OPEN으로 반영한다.
   - 60개 draft catalog는 계속 비활성 상태로 유지한다.

B. P1 Writing Core는 secure semantic boundary hardening까지 진행됐다.
   이미 구현된 것:
   - same-origin browser adapter
   - server-only OpenAI boundary
   - explicit server model config
   - current draft meaning/context/coherence/development 중심 분석
   - single next move
   - child-authorship guard
   - rewrite/final-answer 금지
   - `factVerified:false` 강제
   - local fallback

C. P1의 다음 작업은 문서 반복이 아니라 실제 구현 gap을 우선한다.
   - live boundary wiring의 남은 코드 gap 확인
   - provider output guard / stale-result / fallback 연결 회귀 확인
   - Truth Guard P2로 넘어가기 위한 claim/evidence 경계 정리 및 구현
   - 단, deploy/Netlify로 런타임 검증하지 마.

D. 현재 검증 상태:
   - CODED: PASS (P0/P1 increment)
   - STATIC_VERIFIED: PASS
   - RUNTIME_VERIFIED: PARTIAL
     - isolated component runtime PASS
     - live browser/OpenAI/server runtime NOT_RUN
     - cross-app runtime NOT_RUN
   - DEVICE_VERIFIED: NOT_RUN
   - OPENAI_RUNTIME_CONNECTED: false

E. 첫 보고에서 “거의 완료” 같은 총괄 추정 금지. 실제 구현 gap과 다음 조치만 보여줘.

바로 이어서 진행해.


LATEST CONTINUATION NOTE:
- P1 semantic output guard was hardened after this prompt was first written.
- P2 now includes `truth-guard-runtime.js` + `knowledge-runtime.js`.
- Read `C2S/SNAP_POP_C2S_HANDOFF_2026-09-21.md` section 12 before continuing.
- Verified external search provider is still OPEN; do not claim OPENAI runtime connection.


LATEST P2 NOTE:
- P2 citation-level coverage architecture is now coded.
- Read C2S/SNAP_POP_C2S_HANDOFF_2026-09-21.md sections 13-14.
- Factual verification uses actual url_citation annotations + retrieved source-set matching.
- P3 Imagination Cloud intelligence quality is the next branch-only implementation axis.
- live OpenAI/browser/server runtime is still NOT_RUN; no deploy/Netlify/merge.


LATEST P3 NOTE:
- P3 question-structure scaffold is coded.
- Read C2S/SNAP_POP_C2S_HANDOFF_2026-09-21.md section 15.
- 12 Korean/English classification fixtures pass after precedence correction.
- next P3 increment is bounded explanation-order templates without inventing facts.
- no deploy/Netlify/merge/device testing.


LATEST P3 ROUTING NOTE:
- P3 explanation-order routing is coded.
- Read C2S/SNAP_POP_C2S_HANDOFF_2026-09-21.md section 16.
- question lens is classified before retrieval and server-whitelisted.
- explanation order is lens-aware but cannot bypass citation coverage.
- next axis: bounded mental-model / explanation-quality layer.


LATEST P3 MENTAL MODEL NOTE:
- P3 verified-claim mental model is coded.
- Read C2S/SNAP_POP_C2S_HANDOFF_2026-09-21.md section 17.
- only VERIFIED claim text is rendered; no paraphrase/new facts.
- isolated mental-model runtime validator PASS.
- next: lens/claim-count eligibility so structure labels cannot over-imply unsupported semantics.


LATEST P3 ELIGIBILITY NOTE:
- P3 mental-model eligibility is locked.
- Read C2S/SNAP_POP_C2S_HANDOFF_2026-09-21.md section 18.
- structural FLOW/COMPARE requires FULL_FACTUAL_CONTENT + at least 2 verified claims.
- partial coverage or single-claim structural diagrams are suppressed.
- updated isolated validator PASS.
- next: one-next-curiosity pressure control and resumable writing return.


LATEST P3 PRESSURE NOTE:
- P3 follow-up pressure + writing return lock is coded.
- Read C2S/SNAP_POP_C2S_HANDOFF_2026-09-21.md section 19.
- writing-flow and partial verification suppress follow-up.
- global fully verified answer exposes only an optional hidden follow-up reveal.
- writing draft is persisted before cloud open and restored only on same activeId + step.
- isolated validator PASS.
- next: minimal return acknowledgement without starting a new question chain.


LATEST P3 RETURN NOTE:
- P3 minimal return acknowledgement is coded.
- Read C2S/SNAP_POP_C2S_HANDOFF_2026-09-21.md section 20.
- cloud return shows one short non-driving crew acknowledgement only.
- no new question, analysis, step transition or follow-up chain is triggered.
- pressure/return validator now 11/11 PASS.
- next axis: P4 Exploration Crew response ownership / raw provider voice leakage guard.


LATEST P4 OWNERSHIP NOTE:
- P4 response ownership is coded.
- Read C2S/SNAP_POP_C2S_HANDOFF_2026-09-21.md section 21.
- all intelligence paths are presented as EXPLORATION_CREW.
- factual text remains verbatim; metadata/title ownership is normalized.
- system/provider self-identity leakage fails closed.
- provider provenance remains internal but provider label is hidden from child-facing history UI.
- isolated ownership validator 12/12 PASS.
- next: voice/TTS ownership boundary, then P5 voice quality.


LATEST VOICE NOTE:
- P4→P5 voice ownership boundary is coded.
- Read C2S/SNAP_POP_C2S_HANDOFF_2026-09-21.md section 22.
- all TTS now routes through SnapPopVoice.
- app direct speechSynthesis bypass removed.
- voice text self-identity leak fails closed.
- external provider is forced to EXPLORATION_CREW / crew role.
- isolated voice ownership validator 5/5 PASS.
- next: P5 voice quality/pacing/interrupt policy; live realtime remains OPEN.


LATEST P5 VOICE QUALITY NOTE:
- P5 voice quality policy is coded.
- Read C2S/SNAP_POP_C2S_HANDOFF_2026-09-21.md section 23.
- autoRead no longer exposes hidden hint.
- USER_TAP vs AUTO_READ pacing/interrupt policy is separated.
- external provider does not imply realtime.
- isolated voice policy runtime 8/8 PASS.
- next: STT session ownership / overlapping-listen prevention / no always-listening without separate approval.


LATEST P5 STT NOTE:
- P5 STT session ownership is coded.
- Read C2S/SNAP_POP_C2S_HANDOFF_2026-09-21.md section 24.
- continuous/realtime listen is blocked.
- one active one-shot USER_MIC session only.
- stale callbacks from superseded sessions are ignored.
- isolated STT validator 6/6 PASS.
- next: explicit mic-entry audit and misleading autoVoice semantics cleanup.


LATEST P5 CLOSURE NOTE:
- P5 branch-only voice closure is complete.
- Read C2S/SNAP_POP_C2S_HANDOFF_2026-09-21.md section 25.
- exactly two explicit USER_MIC listen entry points remain.
- HOME_RADIO no longer auto-starts microphone.
- autoVoice semantics removed.
- realtime/device voice remains OPEN / NOT_RUN.
- next axis: P6 integrated regression across P1-P5 contracts.


LATEST P6 READINESS NOTE:
- P6 branch-only readiness report is complete.
- Read C2S/SNAP_POP_C2S_HANDOFF_2026-09-21.md section 27 and C2S/SNAP_POP_P6_BRANCH_ONLY_READINESS_2026-09-21.md.
- active-branch stale-pattern sweep is clean except expected guard/validator/browser-fallback matches.
- P6 app boundary static: 10/10 PASS.
- P1-P5 integrated isolated regression: 19/19 PASS.
- classification: BRANCH_ONLY_CLOSURE_PASS / FROZEN_CANDIDATE_NOT_YET_DECLARED.
- no merge/deploy/Netlify/device claims.


FROZEN CANDIDATE / EXTERNAL GATE NOTE:
- frozen candidate SHA: a333e735f69b57164edc8440f7108e49a6ee8c7a
- classification: FROZEN_CANDIDATE_BRANCH_ONLY
- exact-SHA cross-layer: 15/15 PASS
- TAKY external-resource gate checked against latest TAKY main.
- local/frozen/budget preconditions pass.
- explicit Human Approval for external action is PENDING.
- current decision: HOLD_BEFORE_EXTERNAL_ACTION.
- do not call Netlify/hosting until explicit approval is given.
- read C2S section 28 and C2S/SNAP_POP_EXTERNAL_RESOURCE_GATE_2026-09-21.json.


POST-FREEZE IMPLEMENTATION NOTE:
- deployment remains deferred.
- old frozen candidate a333e735... is superseded by new runtime code; external call count remains 0.
- crew guest orchestration coded/static verified (9/9).
- crew interaction safety coded/static verified (9/9).
- Hide & Seek vocabulary material ownership bridge coded/static verified (11/11).
- requirement matrix SP-GUIDE-003 / SP-GUIDE-005 / SP-BRIDGE-002 updated.
- branch closure runner now contains 17 validators.
- next: Korean↔English meaning-preserving expression bridge.


BILINGUAL EXPRESSION BRIDGE NOTE:
- Korean↔English meaning-preserving bridge is coded/static verified.
- explicit button only; no auto-translation or draft overwrite.
- output = meaning anchor + 1-4 phrase fragments + one assembly question.
- final sentence remains child-authored.
- Hide & Seek vocabulary remains optional source-owned expression material.
- validator: 11/11 PASS.
- requirement SP-UNIV-002 updated.
- branch closure runner now has 18 validators.
- next: verified ASK→UNDERSTAND → optional EXPRESS transition.


OPTIONAL EXPRESS TRANSITION NOTE:
- verified GLOBAL ASK can optionally transition to expression.
- gate requires ASK_UNDERSTAND + verified=true + FULL_FACTUAL_CONTENT.
- explicit child action only.
- only original question/topic is transferred.
- verified answer body is never injected into a draft.
- new writing session only; existing draft continuity wins.
- validator 9/9 PASS.
- requirement SP-UNIV-006 updated.
- branch closure runner now has 19 validators.
- old frozen candidate remains superseded; external call count remains 0.


EXPRESSION TRACE / INTERVENTION NOTE:
- pending verified-expression topic now has explicit dismiss; no arbitrary TTL.
- expressionTrace stores metadata only, not child draft/AI answer/phrase contents.
- expression trace validator 8/8 PASS.
- staged crew intervention implemented from explicit empty Next attempts:
  WAIT → HINT_OFFER → MINIMAL_REASK; after explicit hint → WAIT_AFTER_HINT.
- no auto hint reveal and no draft writing.
- intervention validator 9/9 PASS.
- SP-GUIDE-002 updated.
- closure runner now has 21 validators.
- old frozen candidate remains superseded; external calls still 0.


BADGE BEHAVIOR OBSERVATION NOTE:
- badge behavior taxonomy + anti-labeling guard implemented.
- current runtime observation wiring is intentionally limited to explicit HELP_REQUEST.
- no elapsed-silence deep-thinking inference or generic error/retry labeling.
- historical ~60 badge catalog remains WORKING_DRAFT_NOT_ACTIVE.
- validator 9/9 PASS.
- SP-BADGE-006 remains CODED=PARTIAL until source-specific detectors exist.
- branch closure runner now has 22 validators.


GUEST APPEARANCE CORRECTION NOTE:
- badge observation runtime now wires only explicit HELP_REQUEST / WRITING_EXPLORATION / EXTRA_TASK signals.
- no inferred DEEP_THINKING / RETRY / ERROR_DISCOVERY / SPECIAL_BEHAVIOR.
- selected Special Guest now receives shared micro-episode memory and is visible in records.
- corrected implicit 100% Special Guest appearance: Guest selection is now default-deny and requires a one-shot authorized scene trigger.
- encounter cadence/probability remains OPEN.
- special guest shared-memory validator 8/8 PASS.
- guest appearance gate validator 7/7 PASS.
- closure runner now has 24 validators.


MATRIX / ETYMOLOGY HARDENING NOTE:
- reconciled stale requirement statuses for Universal/Imagination/Truth code already present.
- all reconciled items remain runtimeVerified=false / deviceVerified=false.
- matrix reconciliation validator 9/9 PASS.
- ETYMOLOGY FULL_FACTUAL_CONTENT now additionally requires 2 distinct evidence hosts.
- same-host etymology remains CLAIM_SET_ONLY with ETYMOLOGY_SOURCE_DIVERSITY_INSUFFICIENT.
- general concept questions keep normal citation rule.
- etymology core validation 3/3 PASS.
- closure runner now has 26 validators.


CENTRAL AUTHORSHIP GUARD NOTE:
- added authorship-guard-runtime.js.
- semantic writing assist, bilingual expression bridge, and verified ASK→EXPRESS transition all route through the same child-authorship guard.
- full draft/rewrite/completed-text fields rejected.
- writing assist stays one next move.
- expression help stays fragment-only.
- ASK transition carries question/topic only; answerTransferred=false and draftTransferred=false.
- validator 9/9 PASS.
- SP-GUIDE-001 now CODED=true / STATIC_VERIFIED=true.
- closure runner now has 27 validators.


SHARED BADGE / THINK SEPARATION NOTE:
- added semantic-light TAKY_BADGE_EXPERIENCE_EVENT_V1 envelope.
- shared envelope does NOT commonize user/family/org identity, role or permission.
- no badge award/economy authority in shared event.
- shared contract validator 8/8 PASS.
- crew reaction now has explicit hidden-by-default non-blocking DOM slot; validator 7/7 PASS.
- THINK_EXPRESS now uses verified=null / verification=NOT_APPLICABLE for local and external paths.
- Think verification separation validator 4/4 PASS.
- SP-BADGE-003/004, SP-GUIDE-004, SP-UNIV-001, SP-IMAGINE-005/006 reconciled.
- closure runner now has 30 validators.


BADGE VISUAL / SPECIAL ROLE NOTE:
- added layered badge preview compositor: circle/pastel/Profile Character identity/5-tier upper gem-star arc.
- preview explicitly says not an earned badge.
- visual compositor validator 10/10 PASS.
- added fail-closed working badge catalog activation guard; validator 6/6 PASS.
- SP-BADGE-002/007/009/010 reconciled; SP-BADGE-008 remains PARTIAL because Theme Expression system/assets remain OPEN.
- added crew-role-guard-runtime.js.
- SPECIAL = ENCOUNTER_STYLE_ONLY / functional ability equal / no power or reward multiplier.
- special role validator 8/8 PASS.
- SP-CREW-004 now CODED=true / STATIC_VERIFIED=true.
- closure runner now has 33 validators.


IMAGINATION RETURN INTEGRITY NOTE:
- added SNAP_POP_IMAGINATION_RETURN_V1 guard.
- writing-flow cloud snapshot includes session/landmark/step/language/draft.
- return fails closed if session, landmark, step or language changed.
- newer current draft wins over opening snapshot.
- snapshot is fallback only.
- existing writing-flow pressure suppression remains.
- return integrity validator 9/9 PASS.
- SP-IMAGINE-001 now CODED=true / STATIC_VERIFIED=true.
- closure runner now has 34 validators.


WRITING / CORE6 / BADGE CANDIDATE / VOICE NOTE:
- writing semantic contract validator 10/10 PASS.
- SP-WRITE-002/003/004 now CODED=true / STATIC_VERIFIED=true.
- Core 6 locked as STARTER_REFERENCE_ONLY, not global authority; validator 8/8 PASS.
- SP-CREW-005 now CODED=true / STATIC_VERIFIED=true.
- review-only badge candidate runtime added; no auto-call/activation; validator 6/6 PASS.
- SP-BADGE-005 now CODED=true / STATIC_VERIFIED=true.
- voice boundary validator 9/9 PASS.
- SP-VOICE-001/002 now CODED=true / STATIC_VERIFIED=true.
- closure runner now has 38 validators.


INDEPENDENT BADGE AXIS NOTE:
- badge observation axis verified independent from EXP, gems, affinity, award state and economy mutation.
- independent axis validator 8/8 PASS.
- SP-BADGE-001 now CODED=true / STATIC_VERIFIED=true.
- closure runner now has 39 validators.


NEW CHAT C2S CLOSURE — 2026-09-21
- Read C2S/SNAP_POP_C2S_HANDOFF_2026-09-21.md Section 43 first.
- Then verify current branch HEAD and data/snap-pop-requirement-matrix.json.
- Current closure runner: 39 validators.
- Remaining Snap & Pop body PARTIAL items only:
  1) SP-BADGE-006 — ERROR_DISCOVERY / DEEP_THINKING / SPECIAL_BEHAVIOR need stronger explicit evidence contracts.
  2) SP-BADGE-008 — stable Profile Character identity implemented; exact Theme Expression system/assets remain OPEN.
- FAMILY_EXPANSION remains separate scope.
- current candidate NOT FROZEN.
- old frozen candidate SUPERSEDED.
- external calls 0.
- Netlify/deploy/merge/device verification NOT_RUN.
- next work: branch-only SP-BADGE-006 evidence contracts first.
- do not infer weak behavior signals; preserve anti-labeling/no-score/no-power rules.
- user is not tester/debugger.


BODY IMPLEMENTATION CLOSURE NOTE — 2026-09-21
- Read C2S/SNAP_POP_C2S_HANDOFF_2026-09-21.md Section 44.
- SP-BADGE-006 is CODED=true / STATIC_VERIFIED=true.
- SP-BADGE-008 is CODED=true / STATIC_VERIFIED=true.
- Snap & Pop body PARTIAL = 0.
- Remaining CODED=false = 11 FAMILY_EXPANSION items only; separate scope.
- closure runner = 43 validators.
- exact reviewed Theme Expression assets remain OPEN and are represented as UNRESOLVED; no theme semantics/assets were invented.
- current candidate is NOT FROZEN because full exact-SHA 43-validator execution has not yet run in a reproducible environment.
- local clone path is BLOCKED by container DNS/network; do not repeat same path.
- Netlify/deploy/merge/device verification remain NOT_RUN.
- next: exact-SHA non-deployment closure execution, then new frozen-candidate decision.


FROZEN CANDIDATE V2 NOTE — 2026-09-21
- frozen candidate SHA: aadf62a087a9c922b8b15f3436eb8a23fc5d8f67
- exact-SHA GitHub Actions run 35577164180: SUCCESS
- branch closure: 43/43 PASS
- body PARTIAL: 0
- remaining CODED=false: 11 FAMILY_EXPANSION only
- current candidate classification: FROZEN_CANDIDATE_BRANCH_ONLY_V2
- Netlify/hosted runtime/merge/device verification: NOT_RUN
- external hosted call count: 0
- HUMAN APPROVAL for external action: PENDING
- generic ㄱ is NOT external-action approval.
- read C2S/SNAP_POP_C2S_HANDOFF_2026-09-21.md Section 45 before any hosted/deploy action.


HOSTED VALIDATION ACCEPTANCE PREP — 2026-09-21
- acceptance contract: C2S/SNAP_POP_HOSTED_RUNTIME_ACCEPTANCE_2026-09-21.md
- one hosted attempt only after explicit Human Approval
- generic ㄱ is not approval
- Netlify/hosted runtime/merge remain NOT_RUN
- external call count remains 0


FAMILY EXPANSION + BROWSER RUNTIME CLOSURE — 2026-09-21
- frozen candidate SHA: d8d5b5caf91f21b3cbb72688b8a7d8e8eb9f2f16
- exact-SHA closure: 45/45 PASS
- Chrome CDP browser runtime: PASS
- Family Expansion: 11/11 CODED + STATIC_VERIFIED + RUNTIME_VERIFIED
- device verification remains NOT_RUN
- SP-BRIDGE-001 remains STATIC PARTIAL pending actual Ready & Set transition/return verification
- Snap-Pop Netlify site identified as cheerful-pothos-d1c3ee, but available connector cannot guarantee exact branch/SHA preview; no unsafe deploy triggered
- read Handoff Section 47 before further work
