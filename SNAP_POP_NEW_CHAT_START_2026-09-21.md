최신 TAKY 기준으로 Snap & Pop 작업을 재개해.

먼저 아래 기준을 읽고 현재 상태를 복원해.

GitHub:
- repo: hns140412-glitch/Snap-Pop
- branch: taky/snap-pop-implementation-2026-09-20
- C2S/SNAP_POP_C2S_HANDOFF_2026-09-21.md
- SNAP_POP_CURRENT_CANONICAL_2026-09-21.md
- data/snap-pop-requirement-matrix.json
- data/exploration-crew-rules.json
- data/badge-system.json
- data/badge-catalog-working.json
- badge-runtime.js
- writing-runtime.js
- semantic-writing-runtime.js
- learning-context-runtime.js
- intelligence-runtime.js
- voice-runtime.js
- snap-bridge.js

Ready & Set:
- repo: hns140412-glitch/Ready-Set
- branch: taky/ready-integration-v01
- ready-learning-master-v01.js
- ready-runtime-v07.js

중요 잠금:
1. Snap & Pop 기본 상태는 글쓰기 탐험이다.
2. 상상구름은 핵심이지만 평소 숨은 on-demand 사고/질문 레이어다.
3. 글쓰기는 질문 3개 나열형이 아니라 ONE DRAFT → ONE NEXT MOVE → SAME DRAFT GROWS → REVISE/FINISH다.
4. 5개 장소는 독립 미니게임이 아니라 글쓰기 lens다.
5. 아이가 최종 작성자다. 대필/전체 rewrite/채점/질문폭격 금지.
6. Ready Learning Master는 학습맥락을 제공하고, Snap Semantic Writing Provider가 현재 글 의미를 분석한다.
7. OpenAI semantic backend는 아직 실제 연결 전이다. 브라우저 API key 금지.
8. Truth Guard는 아직 부분 구현이다. 검증되지 않은 사실을 verified로 취급하지 마.
9. 배지 시스템은 독립 성장·경험 수집축으로 복원 중이다.
10. data/badge-catalog-working.json의 약 60개 이름/트리거는 WORKING_DRAFT_NOT_ACTIVE다. 자동 확정/활성화 금지.
11. 캐릭터 레벨/EXP/보석/친밀도와 배지를 자동 동일시하지 마.
12. 사용자를 테스터/디버거로 쓰지 마.
13. merge/deploy/Netlify 금지. frozen candidate + TAKY external-resource gate 통과 전 호출하지 마.

첫 작업:
A. Ready & Set 인트로/프로필/HOLD 및 과거 Drive/대화 근거에서 배지 원형을 더 회수해 CONFIRMED / HOLD / WORKING / OPEN으로 정리하고 C2S closure를 갱신해.
B. 배지 원형 회수 후 P1 Writing Core로 돌아와 secure OpenAI-backed Semantic Writing Provider 연결 경계를 구현/검증해.
C. 중간에 같은 실패 접근을 반복하지 말고 BLOCKED 원인을 분류한 뒤 대체 경로로 진행해.

보고는 CODED / STATIC_VERIFIED / RUNTIME_VERIFIED / DEVICE_VERIFIED를 분리해서 해.
