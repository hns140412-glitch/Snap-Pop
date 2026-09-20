# SNAP & POP — C2S CLOSURE 2026-09-20

## Scope
이번 대화에서 발생한 탐험대 관련 요구·정정·복원·구현을 Conversation-to-System 기준으로 원자화한다.

## Authority
Latest user correction > direct raw user evidence > live canonical/runtime > validated master > handoff/summary.

## Atomic Ledger

### DECISION — terminology
- 공식 사용자-facing 용어는 탐험가 / 탐험대 / 탐험대원 / 탐험대 규칙.
- Guide / Guide Companion / 길잡이는 레거시 용어.
- 신규 코드/문서에서 독립 기준으로 사용 금지.

### DECISION — ownership
- 탐험대 규칙의 주도권은 Snap & Pop.
- 향후 프로필/세션/일부 권한이 Ready & Set 등 공통 시스템으로 이양되어도 Snap & Pop의 고유 성격은 탐험대 규칙이 발전시킨다.
- Ready & Set 공유 대상: profile/session/planner/timer.
- Snap & Pop 소유: 탐험대원 정체성, Personality, 행동, 반응, 개입 강도, 탐험 문법.

### CORRECTION — starter crew simplification
- 기존 4개 계보(말티푸/탐험 고양이/랫서팬더/동료 탐험가)를 시작 6명에 자동 배치했던 단순화는 폐기.
- 시작 후보는 최신 사용자 기준 5~6명.
- 과거 원자료는 시작 6명 설계로 반복 수렴했으므로 현재 WORKING COUNT=6.
- 6명은 우선 Personality Slot이며 종족/외형/최종 이름은 별도 확정 필요.

### REQUIREMENT — starter 6 personality slots
1. 장난꾸러기 — 능청·유머
2. 씩씩이 — 용감·직진
3. 몽상가 — 엉뚱·상상
4. 차분이 — 느긋·관찰
5. 호기심쟁이 — 질문·발견
6. 다정이 — 따뜻·공감

### RECOVERED — previously approved starter six identity lineage
- 과거 대화/Google Drive의 GUIDE 회수 자료에서 시작 6명 계보를 복원함.
- Core 순서: **두비 → 로리 → 잉크 → 노바 → 테이크 → 제로**.
- 회수된 정체성:
  1. 두비 — dog-like · 호기심/활력
  2. 로리 — rabbit · 다정/공감 · 핑크 브레이드 계보
  3. 잉크 — 여성형 dark fox · 관찰/아이디어 · 고글/다크톤
  4. 노바 — brown otter/ferret-like · 에너지/도전 · 고글/포니테일
  5. 테이크 — panda · 정리/든든함
  6. 제로 — penguin · 음악/여유 · 헤드폰/캡
- 과거 이미지 결과물은 **후보/회귀검증 증거**이며, 6종 최종 Visual ID의 Golden Reference 1:1 검증은 아직 OPEN.
- SUPERSEDED 회수: 노바 rabbit / 제로 polar bear / 잉크 cat-like substitution / 테이크 turtle 혼동 / 로리↔노바 swap.

### OPEN — starter six ↔ Personality Slot 1:1 mapping
- 2026-09-08 원자료에서 6 Personality Slot은 이름 없이 별도 설계된 것을 확인함.
- 회수된 6명의 성격 계보와 일부 의미상 유사성은 있으나, **사용자가 6명을 6개 Slot에 1:1 확정 매핑한 원자료는 회수되지 않음**.
- 따라서 의미 유사성만으로 자동 매핑하지 않는다.
- 기존 4개 레거시 계보를 시작 6명에 자동 배치하지 않는 규칙도 그대로 유지한다.
- 추정/재창작 금지.

### DECISION — roster architecture
- 장기 로스터 Ceiling=20명.
- 출시 시 20명 전부 채울 필요 없음.
- 성장하면서 천천히 친구가 늘어남.
- 사용량 반복으로 발견/친밀도 파밍 금지.
- 세계/거점 인원은 역할 수를 먼저 계산하고 확정.
- 6+6+8=20은 유효한 WORKING DESIGN BOARD이나 절대 고정 배분 아님.
- Special은 최대 12명 이하, 실제 인원 OPEN.

### REQUIREMENT — special encounter
- 특별한 것은 능력치가 아니라 만남 방식.
- 미발견 → 단서 → Encounter Window → 조우 → 첫 만남 → 아는 친구 → 선택 가능 → 재회.
- 단서: 그림자/발자국/소문/목소리/소지품/짧은 목격.
- Cooldown 사용.
- 정확한 7일/14일/거점/배지 조건은 캐릭터별 OPEN.
- 아이에게 확률/타이머 직접 노출 금지.
- 놓친 만남에 실패/감점/연속기록 손실 없음.

### REQUIREMENT — relationship
- Explorer_ID 안정 유지.
- 개명/메인 동행 변경/거점 이동으로 ID 변경 금지.
- 친밀도 = 실제로 함께한 경험.
- 친밀도는 Personality를 바꾸지 않고 관계 거리만 변화.
- 친밀도에 따른 성능/보상/성공률 우위 금지.
- 장기 미접속 친밀도 감소 금지.
- 관계 표현만 확장: 표정/포즈/인사/별명/농담/축하/부르는 방식/특별 일러스트.

### REQUIREMENT — personality pack
공통 스키마:
PERSONALITY → HABIT → REACTION → RELATIONSHIP_EXCEPTION → WORLD_ROUTINE → MEMORY

- 약점은 실패 페널티가 아니라 Micro Story 재료.
- 소품은 능력 장비가 아니라 Personality 연출 장치.
- IDENTITY BODY + PERSONALITY PROP + THEME GEAR.

### DECISION — 20-slot behavior board
- STARTER 01~06 / WORLD 07~12 / SPECIAL 13~20 행동 슬롯 복원.
- 각 슬롯은 이름/종족 확정이 아니라 행동·성격·실루엣·세계 루틴 설계판.
- Special 13~20은 Encounter Gimmick 필수.

### REQUIREMENT — absorbed legacy Guide rules
구 REV10/11 Guide 기준은 모두 탐험대원 상호작용 계약으로 승계:
- 질문/듣기/힌트/재미있는 반응/생각 끌어내기.
- 최종 답/문장 대필 금지.
- 관찰 → 기다림 → 짧은 반응 → 질문 → 힌트 → 최소 재질문 → 아이 표현.
- 침묵·짧은 답 압박 금지.
- 힌트 한 단계씩.
- 실제 아이 표현을 구체적으로 짚음.
- 일반 과잉칭찬 금지.
- Copy Priority: 직관성35/친절30/위트20/장난10/시크5.
- 상시 큰 말풍선 금지, 입력 가림 금지, 강제 모달 금지.
- Reaction Performance / Reduce Motion / Voice Accessibility 유지.
- Radio는 공통 입력 레이어, 여섯 번째 글쓰기 도구 아님.
- Imagination Cloud는 표현 확장용이며 완성답 생성 금지, 원 과제로 복귀.
- English는 own-words 중심, grammar drill 금지.

### IMPLEMENTED — runtime
- 단계형 힌트 공개.
- 빈 답 재촉 대신 기다림/힌트 선택.
- 실제 작성 문구 일부를 짚는 구체 반응.
- 음성 Listening 상태/긴 음성 반응.
- Imagination Cloud return state 보존.
- 완료 구체 반응.
- Reaction Motif + Gesture.
- Crew Registry / 이름 이력 / 공동 기억.
- Lightweight world state.
- 선택 대원 MAIN_COMPANION.
- 재회 기억.
- 친밀도 anti-farming: VOICE_EXPRESSION=0, REUNION=0, 탐험완료/특별기억만 점수 반영.
- Reduce Motion 연동.

### OPEN — runtime gaps
- 시작 6명 ↔ Personality Slot 1:1 매핑 원자료 회수/확정.
- 6종 최종 Visual ID Golden Reference 1:1 검증.
- 20개 슬롯 전체의 실제 캐릭터 Identity 확정.
- Reaction Overlay의 최종 시각 자산.
- 거점 실제 역할 수/인원 확정.
- Special 캐릭터별 정확 Encounter Cycle.
- 관계 단계의 최종 사용자-facing 명칭/연출.
- 실제 iPhone/Safari DEVICE_VERIFIED.
- PWA safe update active-session gate 완결.
- Persisted wish intent 기반 refresh/interruption duplicate-spend 원자성 보강.

## Canonical Destinations
- SNAP_EXPLORATION_CREW_MASTER_2026-09-20.md
- SNAP_EXPLORATION_CREW_SOURCE_LEDGER_2026-09-20.md
- data/exploration-crew-rules.json
- scripts/validate-exploration-crew.mjs
- app.js

## C2S Closure
- UNMAPPED_MATERIAL = 0 within recovered current-conversation scope.
- SILENT_LOSS = 0 within recovered current-conversation scope.
- FALSE_CONVERGENCE prevention: 시작 6명 Identity 계보는 RECOVERED. 다만 Personality Slot 1:1 매핑과 최종 Visual Golden Reference는 직접 근거가 없어 OPEN 유지.
- Reverse Reconstruction: 이 문서 + Canonical Master + Source Ledger로 현재 대화의 탐험대 결정/정정/미확정 항목 재구성 가능.


## DIRECT_VISUAL_EVIDENCE_2026-09-20
- 사용자 직접 제공 이미지 7장으로 과거 Core 6 확정 보드/턴어라운드/잉크 상세 프로필을 회수.
- 보드 명시: `6명의 Visual ID (확정)`, `Visual ID Lock`, 두비/로리/잉크/노바/테이크/제로 01~06 PASS.
- **CLOSED:** Core 6 이름·순서·종족/외형·핵심 성격·주요 소품/실루엣.
- **OPEN_CORRECTION_CHECK:** 로리 영문명 `Tori` vs canonical `Lori`.
- **OPEN_SEMANTICS:** 6~13세 표기의 의미.
- **ARCHITECTURE CORRECTION:** six Personality Slots는 Character Identity 슬롯이 아니라 Behavior Archetype / Interaction Mode.
- **FALSE_CONVERGENCE prevention:** 의미 유사성으로 Core 6와 six Personality Slots를 강제 1:1 매핑하지 않음.


## Evidence Recovery Pass linkage
- Recovery record: `C2S/SNAP_EXPLORATION_CREW_EVIDENCE_RECOVERY_PASS_2026-09-20.md`
- Exact quote misses were explicitly separated from source absence.
- Legacy/semantic/decision-marker/attachment/reverse-trace search was performed across five source families.
- Personality Pack detail remains PARTIAL / RECOVERY_REQUIRED rather than falsely ABSENT.
