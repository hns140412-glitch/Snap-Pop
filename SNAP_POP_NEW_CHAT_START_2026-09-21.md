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
