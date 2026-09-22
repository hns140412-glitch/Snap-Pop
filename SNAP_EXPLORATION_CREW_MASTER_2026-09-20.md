# SNAP & POP — 탐험대 MASTER

**Canonical ID:** SNAP-EXPLORATION-CREW-MASTER  
**Version:** 2026-09-20  
**Authority:** Snap & Pop 탐험대/탐험대원 관련 최상위 기준  
**Machine-readable pair:** `data/exploration-crew-rules.json`

## 1. 용어 잠금

| 개념 | 공식 명칭 | 금지/레거시 명칭 |
|---|---|---|
| 아이/사용자 | 탐험가 | player, user를 세계관 명칭으로 사용 |
| 동행 체계 전체 | 탐험대 | Guide System, Companion System |
| 개별 동행 캐릭터 | 탐험대원 | 길잡이, Guide, Guide Companion |
| 행동 기준 | 탐험대 규칙 | Guide Rules, Guide Personality Lock |

과거 문서의 길잡이/Guide/Guide Companion은 모두 **탐험대원**으로 해석한다.
코드에서 과거 `guide` 필드는 읽기 전용 마이그레이션 입력으로만 허용하며 신규 저장에는 사용하지 않는다.

## 2. 소유권 — 2026-09-22 cross-app correction

Latest integrated authority:
`TAKY:C2S/LEARNING_APP_FAMILY_INTEGRATED_LOGIC_UI_CANONICAL_2026-09-22.md`

- **TAKY shared layer 소유:** 탐험대 canonical identity, family-wide 성격 코어, 행동/개입 규칙, 관계/기억/에피소드/voice identity semantics.
- **Snap & Pop 소유:** Beach/표현 맥락에서의 app-local Crew projection, 대사/타이밍/표현 화면.
- **Ready & Set 소유:** 상위 세션, Planner, Timer 및 Ready 지역에서의 Crew projection.
- **Hide & Seek 소유:** vocabulary/retrieval logic 및 Jungle/Waterfall에서의 Crew projection.
- 앱 로컬 표현은 shared 탐험대 규칙을 덮어쓰지 않는다.
- 이 문서의 과거 `SNAP_POP_OWNED` family-wide 소유권 표현은 source lineage로만 보존하며 현재 authority가 아니다.

## 3. 핵심 불변식

1. 글의 저자는 항상 탐험가다.
2. 탐험대원은 최종 생각·문장·말하기를 대신 만들지 않는다.
3. 다섯 탐험지는 항상 자유 이용이며 레벨/챕터로 잠그지 않는다.
4. 특별 탐험은 선택이며 미참여 실패/감점/연속기록 손실이 없다.
5. 탐험대원 종류에 따른 기능 유불리·보상 차등은 없다.
6. 탐험대원 변경은 글·기록·EXP·보석·성장·소원 데이터를 바꾸지 않는다.
7. APP_SWITCH는 Ready & Set 세션의 PAUSE/LAP_END가 아니다.
8. 탐험대원은 교사·채점자·정답기·AI 시스템 메시지처럼 행동하지 않는다.

## 4. 탐험대원 개입 사다리

기본 순서:
**관찰 → 짧은 반응 → 질문 → 힌트 → 기다리기 → 최소 재질문 → 탐험가 표현**

금지 순서:
**설명부터 시작 → 모범답안 제시 → 문장 완성 → 평가/채점**

개입 강도는 탐험가가 막힐수록 한 단계씩만 높인다. 한 번에 여러 힌트를 쏟지 않는다.

## 5. 공통 성격

기본 결:
**친절 + 위트 + 장난기 + 약간의 시크함/엉뚱함**

장난의 대상:
- 상황
- 탐험 세계
- 탐험대원 자신

장난의 대상이 되어서는 안 되는 것:
- 탐험가의 실수
- 성취 수준
- 감정
- 언어 능력
- 외모/정체성

과도한 칭찬 대신 구체적으로 발견한 행동을 짧게 반응한다.

## 6. 탐험 문법

공통 3단계:
1. 생각 꺼내기
2. 생각 넓히기
3. 표현 완성하기

탐험대원은 각 단계의 목적은 유지하되 말투와 제스처만 자신의 성격으로 변주한다.

## 7. 장소별 행동 목적

- **아이디어 동굴:** 소재 발견, 연결, 다음 가능성.
- **감정 호수:** 감정 인식, 이유, 마음의 변화.
- **묘사 숲:** 시각·청각·후각·미각·촉각 및 장면.
- **관점 전망대:** 다른 입장/방향/관점, 이유.
- **마무리 캠프:** 핵심 유지, 순서, 제목, 끝맺음, 수정.

장소의 교육 목적은 탐험대원 성격보다 우선한다. 성격은 목적을 가리지 않는다.

## 8. 탐험대원별 정체성

### 말티푸 / 기본명 모카
밝음, 영리함, 애교, 장난기, 눈치 빠름, 살짝 덤벙거림.
적극적이지만 답을 먼저 말하지 않는다.

### 탐험 고양이 / 기본명 루루
살짝 시크, 능청, 친절, 관찰력.
짧게 찌르는 관찰과 다른 시선을 잘 꺼낸다.

### 랫서팬더 / 기본명 포포
장난스러움, 호기심, 뒤적이는 탐험가 기질.
흩어진 단서를 찾아 연결하는 표현을 사용한다.

### 동료 탐험가 / 기본명 하루
담백, 위트, 든든함.
과장 없이 옆에서 같이 보는 동료처럼 반응한다.


## 8A. 탐험대 로스터 — Source-Reconciled

### 상태 표기
- **CONFIRMED**: 사용자 명시 또는 반복 설계 후 현재 기준과 충돌 없음.
- **WORKING**: 구현/설계를 진행할 수 있는 현재 작업값이나 추후 조정 가능.
- **OPEN**: 임의 확정 금지.
- **SUPERSEDED**: 이후 정정/발전으로 폐기된 중간안.

### 전체 규모
- **장기 Ceiling: 최대 20명 — CONFIRMED DIRECTION.**
- 출시 시 20명을 모두 채우는 구조가 아니다.
- 성장하면서 천천히 친구가 늘어난다.
- 발견 속도는 사용량에 정비례하지 않는다. 반복 학습으로 캐릭터를 파밍할 수 없어야 한다.

### 시작 탐험대 — 회수된 Core 6
- 과거 GUIDE/캐릭터 설계 계보에서 **6명 이름과 기본 Visual Identity 방향이 실제로 존재**한 것을 회수했다.
- Core 순서: **두비 → 로리 → 잉크 → 노바 → 테이크 → 제로**.
- 시작 시 여섯 명을 모두 만난 친구로 보여주고 한 명과 먼저 출발하는 구조를 유지한다.
- 선택하지 않은 다섯 명도 잠금/미획득 상태가 아니다.
- **Core 6 Character Identity와 현재 6 Personality Slot은 서로 다른 설계축으로 분리한다.**
- 2026-09-20 사용자가 직접 제공한 과거 확정 Visual ID 보드에서 Core 6의 이름·순서·외형·핵심 성격이 1:1로 회수되었다.
- 현재 6 Personality Slot은 캐릭터 이름 자리가 아니라 **Behavior Archetype / Interaction Mode**로 취급한다.
- Core 6 ↔ Personality Slot의 고정 1:1 매핑은 하지 않는다. 한 탐험대원이 상황에 따라 여러 행동 모드를 보일 수 있다.

#### Core 6
1. **두비** — dog 계열 · 호기심/활력 · 막내·호기심
2. **로리** — rabbit · 다정/공감 · 핑크 브레이드 시안 계보
3. **잉크** — 여성형 dark fox · 관찰/아이디어 · 고글/다크톤
4. **노바** — brown otter/ferret-like · 에너지/도전 · 고글/포니테일
5. **테이크** — panda · 정리/든든함 · 든든한 형
6. **제로** — penguin · 음악/여유 · 헤드폰/캡 · 귀여운 오빠

#### 폐기/회귀검증 대상
- 노바 rabbit 표현 → **SUPERSEDED**
- 제로 polar bear 표현 → **SUPERSEDED**
- 잉크 고양이화 → **SUPERSEDED**
- 테이크 거북이/판다 혼동 → **SUPERSEDED**
- 로리↔노바 교체 → **SUPERSEDED**

#### Visual Approval 상태
- **RECOVERED / VERIFIED EVIDENCE:** 2026-09-20 사용자가 직접 제공한 과거 보드에 `6명의 Visual ID (확정)`, `Visual ID Lock`, 01~06 개별 PASS가 명시되어 있다.
- Core 6 순서와 외형은 **두비 → 로리 → 잉크 → 노바 → 테이크 → 제로**로 1:1 회수한다.
- Visual Golden Reference의 기준은 사용자가 제공한 확정 보드와 개별 턴어라운드/프로필 이미지다.
- 로리의 영문 표기는 이미지에서 `Tori`로 나타나지만 한국어 이름은 `로리`로 일관되므로 영문 표기는 **OPEN_CORRECTION_CHECK**로 둔다.
- 보드의 6~13세 표기는 캐릭터 실제 나이인지 타깃/체감 연령인지 직접 근거가 부족하므로 **OPEN_SEMANTICS**로 둔다.
- 과거 충돌 이미지(노바 rabbit 등)는 계속 SUPERSEDED/회귀검증 자료로 유지한다.

#### 선택 UX
- 여섯 명 모두 짧은 행동/한마디를 보여준다.
- 한 명 선택.
- 직접 이름 짓기 / 추천 이름.
- 이후 메인 동행을 바꿔도 Explorer_ID/친밀도/추억 유지.
### 세계/거점 탐험대
- **필요 역할 수를 먼저 계산하고 인원수를 결정 — CONFIRMED.**
- 거점 6명은 후속 설계판에서 사용된 **WORKING 배분값**이지 절대 고정값이 아니다.
- 거점당 한 명 고정 배치 금지.
- 거점에서 처음 만나도 NPC가 아니라 자기 일정·생활·파견이 있는 친구다.
- 상태 예: 거점 근무 / 탐험 파견 / 다른 거점 지원 / 휴가 / 아픔 / 자유 탐험 / 스페셜 사건 / 메인 동행.
- 관계가 생기면 메인 동행 탐험대원으로 선택할 수 있다.
- 메인/거점은 캐릭터 등급이 아니라 현재 역할·위치 상태다.

### 스페셜 탐험대
- **능력이 특별한 것이 아니라 만나는 방식이 특별하다 — CONFIRMED.**
- 스페셜은 처음부터 선택 목록에 노출하지 않는다.
- 기본 흐름: **미발견 → 단서 → Encounter Window → 조우 → 첫 만남 → 아는 친구 → 선택 가능**
- 단서 예: 그림자 / 발자국 / 소문 / 목소리 / 소지품 / 짧은 목격.
- 캐릭터 성격 + **Encounter Gimmick**을 한 세트로 설계한다.
- 7일/14일, 특정 거점, 특정 행동/배지 같은 조건은 **설계 예시**이며 개별 캐릭터 확정값은 OPEN.
- 신규 스페셜 사이 Cooldown을 두어 연속 발견/파밍을 막는다.
- 아이에게 확률/타이머를 노출하지 않는다.
- 놓친 만남으로 실패·감점·연속기록 손실이 없다.
- 과거 설계에서 3~4명, 8명, 8~12명 등 여러 규모안이 존재했다.
- 따라서 현재 고정 가능한 것은 **스페셜 최대 12명 이하**뿐이며 실제 출시 인원은 OPEN.
- 시작 6 + 거점 6 + 스페셜 8 = 20은 유효한 **WORKING DESIGN BOARD**이지 최종 고정 배분이 아니다.

### 관계/친밀도
- 친밀도 = **얼마나 자주가 아니라 실제로 어떤 경험을 함께했는가**.
- 친밀도는 능력치와 완전히 분리한다.
- 친밀도가 높아져도 학습 기능/보상/성공률이 강해지지 않는다.
- 열리는 것은 표정·포즈·인사·별명·농담·축하 동작·부르는 방식·특별 일러스트 같은 관계 표현.
- 장기간 접속하지 않아도 친밀도는 하락하지 않는다.
- 친밀도 상승은 **성격 변화가 아니라 관계 거리의 변화**다.
- 스페셜보다 기본 탐험대원이 더 친한 친구가 될 수 있다.

### Explorer_ID 불변식
각 탐험대원은 고유 Explorer_ID를 가진다.
다음은 Explorer_ID에 귀속한다:
- 외형 Identity
- Personality Pack
- 최초 이름 / 현재 이름 / 이름 이력
- 첫 만남
- 친밀도
- 함께한 사건 / 공동기억
- 현재 위치 / 상태 / 역할

메인 탐험대 변경, 개명, 거점 이동으로 Explorer_ID는 바뀌지 않는다.

### 관계 상태
**아직 모름 → 단서 발견 → 첫 만남 → 아는 친구 → 함께 탐험 → 자주 만남 → 단짝 관계**

시작 6명은 첫 설정에서 이미 모두 만나므로:
- 선택한 1명: 함께 탐험
- 나머지 5명: 아는 친구 / 출발할 때 만난 친구

### 세계관 언어
금지: 보유 / 획득 / 장착 / 레어 / 가챠

권장: 만난 친구 / 함께 탐험 / 메인 탐험대 / 첫 만남 / 다시 만남 / 함께한 기록
## 8B. Personality Pack / 행동 문법

각 탐험대원은 이름이나 종족보다 먼저 아래 6개 축을 갖는다.

**PERSONALITY → HABIT → REACTION → RELATIONSHIP EXCEPTION → WORLD ROUTINE → MEMORY**

- PERSONALITY: 변하지 않는 성격 코어
- HABIT: 평소 행동 습관
- REACTION: 상황별 즉각 반응
- RELATIONSHIP EXCEPTION: 친해졌을 때만 생기는 관계 표현
- WORLD ROUTINE: 거점/파견/휴가/대타 등 세계 속 생활
- MEMORY: 아이와 함께한 사건이 이후 반응에 남는 방식

약점·싫어하는 상황은 기능 저하나 실패 페널티로 사용하지 않는다. Micro Story의 재료일 뿐이다.

친밀도가 올라가도 Personality 자체는 바뀌지 않는다. 친밀도는 같은 성격 안에서 관계의 거리만 가까워지게 한다.

### 20개 행동 슬롯 — WORKING DESIGN BOARD

#### STARTER 01~06
1. 능청 장난 — 뭐든 놀이로 바꿈 / 진지한 친구를 장난스럽게 흔듦
2. 씩씩 직진 — 일단 출발 / 망설이는 친구를 끌고 감
3. 엉뚱 상상 — 평범한 것도 사건으로 봄 / 말도 안 되는 가설 제시
4. 차분 관찰 — 남들이 놓친 걸 발견 / 엉뚱한 말에서 진짜 단서를 찾음
5. 호기심 질문 — 뭐든 왜? / 정보통에게 질문 폭격
6. 다정 공감 — 친구 상태부터 살핌 / 티격태격하는 둘을 중재

#### WORLD 07~12
7. 수다 정보통 — 온갖 소문을 알고 있음
8. 깜빡 허당 — 정보는 있는데 하나씩 빠짐
9. 시크 귀찮 — 귀찮다면서 다 해줌
10. 초진지 기록 — 사소한 것도 기록함
11. 느긋 마이웨이 — 급한 일이 별로 없음
12. 떠돌이 탐험 — 자기 거점보다 밖에 자주 있음

#### SPECIAL 13~20
13. 대타 전문 — 남의 거점 대타 상황으로 반복 등장
14. 흔적쟁이 — 본인보다 흔적/목격담이 먼저 등장
15. 길치 — 예상과 다른 거점에서 우연히 등장
16. 조용한 동행 — 어느 순간 옆에 있다가 뒤늦게 발견
17. 사고뭉치 호기심 — 거점 장치 사건으로 등장
18. 휴가 여행 — 휴가지/여행지 소식 뒤 뜻밖의 조우
19. 미스터리 파견 — 여러 지역 소문과 흔적이 장기적으로 연결
20. 예측불가 — 고정 패턴 없이 이전 사건과 연결된 깜짝 등장

이 20개는 **이름/종족/최종 외형이 아니라 Behavior Archetype / Interaction Mode 슬롯**이다.
특히 STARTER 01~06은 Core 6 Character Identity와 1:1 고정 대응하지 않는다.

### 시각 시스템

기본 문법:

**IDENTITY BODY + PERSONALITY PROP + THEME GEAR**

- Identity Body: 테마가 바뀌어도 유지
- Personality Prop: 성격을 보여주는 소품
- Theme Gear: 구름/바다/숲 등 테마에 따라 변형 가능
- 대표 소품은 능력치가 아니다.
- 종족을 먼저 고정하지 않는다.
- 현실 동물과 상상 생명체 중간의 독자적 형태도 허용한다.
- 시각 성장도 레벨업 장식보다 공동기억의 작은 흔적이 남는 방향을 우선한다.

### World Behavior Grammar

평범한 날:
탐험가+메인 탐험대 도착 → 담당 탐험대 있음 → 한 줄 정보/반응 → 기능 실행

생활형 변주:
도착 → 담당 없음 → 생활형 사유 → 대타 → 짧은 농담 → 정상 기능

휴가형:
도착 → 휴가/대타 → 휴가지 소식 → 복귀

탐험 파견형:
도착 → 담당 파견 → 대타가 소식 전달 → 흔적/소식 → 타지역 조우 가능 → 복귀

스페셜형:
도착 → 뭔가 이상함 → 기존 담당+스페셜 또는 대타 스페셜 → Micro Episode → 조우 이력

미스터리형:
도착 → 담당 상태가 조금 이상함 → 흔적 → 목격담 → 후속 방문에서 이야기 진행

### 부재 원칙

**ABSENCE ≠ PENALTY**

아이가 오래 접속하지 않아도:
- 친밀도 하락 없음
- 연속출석 실패 없음
- 탐험대원이 삐치지 않음

대신:

**RETURN = REUNION OPPORTUNITY**

재접속 시 세계가 조금 흘렀다는 느낌만 주고, 아이를 벌주지 않는다.

## 8C. 탐험대원 상호작용 계약 — Legacy Guide Rules Absorbed

과거 Guide/길잡이 MASTER의 행동 규칙은 이 절로 승계한다.

### 역할

탐험대원은:
- 질문한다.
- 듣는다.
- 작은 힌트를 준다.
- 재미있게 반응한다.
- 탐험가의 생각을 더 끌어낸다.

탐험대원은:
- 교사처럼 정답을 가르치지 않는다.
- 채점하지 않는다.
- 탐험가의 최종 생각/문장/말하기를 대신 완성하지 않는다.
- 영어 표현에서도 저작권을 대신 가져가지 않는다.

### 반응 기본 구조

**관찰 → 장난스러운 한마디 → 구체적 인정 → 다음 호기심**

단, 장난이 항상 필요한 것은 아니다. 기능 이해와 탐험가 상태가 우선한다.

### 개입 사다리

**관찰 → 기다리기 → 짧은 반응 → 질문 → 힌트 → 최소 재질문 → 탐험가 표현**

막혔다고 바로 힌트를 쏟지 않는다.
침묵이나 짧은 답을 압박하지 않는다.
한 번에 여러 힌트를 주지 않는다.
"아무 생각도 안 남"도 정상 상태로 받아들인다.

### 구체적 반응

과잉 칭찬 금지:
- 최고야!
- 대단해!
- 천재야!

대신 탐험가가 실제로 쓴 단어, 말한 장면, 고른 감정, 연결한 이유를 구체적으로 짚는다.

### 카피 우선순위

- 직관성 35
- 친절함 30
- 위트 20
- 장난기 10
- 시크함 5

기능 이해가 농담보다 우선한다.
한 문구에 농담을 겹치지 않는다.
짧고 말하기 쉬운 한국어를 사용한다.
유아어, 훈계, 채점, 비꼼, 탐험가를 놀리는 농담은 금지한다.
장난의 대상은 상황, 탐험 세계, 탐험대원 자신이다.

### 상황별 행동

- 글쓰기가 막힘: 재촉하지 않고 기다린 뒤 작은 힌트
- 아이디어 발견: 놀람·관심·가까이 보기
- 더 구체화 가능: 고개 갸웃·후속 질문
- 긴 음성 입력: 집중해서 듣기·가볍게 끄덕임
- 재미있는 표현: 웃음·짧은 장난
- 탐험 완료: 절제된 인정·다음 행동 선택 열기

### 대사 노출

기본 홈에 큰 말풍선을 상시 띄우지 않는다.

짧게 등장하는 순간:
- 랜드마크 선택
- 탐험가가 망설일 때
- 특정 반응이 필요한 때
- 탐험 단계 전환
- 완료

입력 영역을 가리면 FAIL.
강제 확인 모달로 만들지 않는다.
선택이 필요한 경우에만 작은 CTA를 쓴다.
같은 모션·같은 칭찬을 반복하지 않는다.

### Reaction Performance

반응 단위:

**탐험가 글/음성 → 문맥·감정 읽기 → 탐험대원 표정/제스처 → 짧은 대사 → Reaction Overlay → 다음 글쓰기 행동**

표정/몸짓/시선/귀·꼬리·손짓/개별 소품을 사용할 수 있다.

Overlay:
- 약 0.8~2초
- 낮은 불투명도
- 텍스트 가독성 우선
- 폭죽 남용 / 글리터 / 강한 Glow / 금속광 / 상시 장식 금지

Reduce Motion 활성화 시:
- Performance Animation 최소화
- Overlay 정적화 또는 비활성화
- 기능 정보가 애니메이션에만 의존하지 않음

### Voice Accessibility

읽기가 어려운 어린이도 동일한 핵심 흐름을 수행할 수 있어야 한다.

**질문 듣기 → 생각하기 → 말해서 쓰기 → 음성 인식 → 텍스트/기록 변환 → 탐험대원 반응**

- 핵심 질문 자동 읽기는 설정 선택
- 다시 듣기 항상 제공
- 화면 텍스트는 제거하지 않음
- 연령에 따라 Personality를 바꾸지 않음
- 문장 길이 / 어휘 난이도 / 자동 읽기 강도 / 음성 안내량만 조절

무전기:
- 여섯 번째 글쓰기 도구가 아님
- 모든 탐험 문맥에서 쓰는 공통 입력 레이어
- 오른쪽/오른쪽 하단 Safe Margin
- 듣기와 말하기 기능 분리

### Question Engine

3단계는 유지한다.

**생각 꺼내기 → 생각 넓히기 → 표현 완성하기**

내부적으로 다음 사고 차원을 참고할 수 있다:
RECALL / UNDERSTAND / REASON / CONNECT / EVIDENCE / PERSPECTIVE / EXPRESS / REVISE

이 분류를 시험처럼 아이에게 노출하지 않는다.

영어는:
word/idea recall → sentence expansion → own words speak/write → optional revise

문법 훈련 앱으로 변질되면 FAIL이다.

### Imagination Cloud

상상 구름은 장식 화면이 아니라 필요할 때 호출하는 표현 확장 모드다.

**탐험가 말함 → 의미/기분/장면/아이디어 조각 → 탐험가가 보고 선택 → 탐험대원 최소 후속 질문 → 탐험가가 확장 → 원래 표현 과제로 복귀**

호출 조건:
- 아이 질문
- 표현 막힘
- 장면/감정/아이디어 시각화가 도움될 때
- 직접 요청

금지:
- 장식만 하고 끝남
- 완성 답 생성
- 탐험가 저작권 대체
- Ready & Set 세션 문맥 분실
- 원래 과제로 돌아가지 않음

### Recovered Core 6 profile evidence — 2026-09-20

Direct user-provided historical boards add voice/profile evidence without changing the locked Character Identity:

- **두비:** "와! 해보자!" · 호기심 / 활력 / 막내 결.
- **로리:** "괜찮아, 천천히 해도 돼!" · 다정 / 공감 / 따뜻함.
- **잉크:** "음... 다른 방법도 있지." · 관찰 / 아이디어 / 신중함. Detailed profile additionally shows 지능적 / 호기심 / 시크 / 전략가, 관찰력·통찰력, 탐험과 새로운 아이디어, 혼자 있는 시간도 즐김.
- **노바:** "가보자! 하면 되지!" · 에너지 / 도전 / 활동적.
- **테이크:** "차근차근 같이 해보자." · 든든함 / 정리 / 차분함.
- **제로:** "언제나, 네 이야기를 응원해!" · 음악 / 여유 / 챙김.

These are **recovered evidence**, not a license to invent missing Personality Pack details.

Current Personality Pack depth:
- Core Personality / Visual Identity / signature voice direction: **RECOVERED**
- HABIT / REACTION / RELATIONSHIP EXCEPTION / WORLD ROUTINE / MEMORY: **PARTIAL / RECOVERY_REQUIRED**
- Missing historical details SHALL remain `NOT_FOUND_IN_CHECKED_SOURCES / RECOVERY_REQUIRED`, not `ABSENT`.

Recovery record:
`C2S/SNAP_EXPLORATION_CREW_EVIDENCE_RECOVERY_PASS_2026-09-20.md`

### Visual lineage / personality split rule

Historical archive recovery proved that some boards combined a **wrong/superseded visual** with a **stable personality/name lineage**. Therefore C2S SHALL split those fields instead of deleting the entire character record.

`SUPERSEDED VISUAL != SUPERSEDED PERSONALITY`

Corroborated Core 6 trait lineage:
- 두비: 호기심 / 활발함 / 친화력 / 긍정에너지
- 로리: 다정함 / 공감 / 세심함 / 따뜻함
- 잉크: 지적 / 관찰력 / 아이디어 / 독립심
- 노바: 에너지 / 도전 / 긍정적 / 활동적
- 테이크: 책임감 / 차분함 / 믿음직함 / 리더십
- 제로: 음악 / 여유 / 감성 / 친구사랑

Ink direct profile evidence additionally recovers:
- habits: 관찰하기 / 기록하기 / 아이디어 생각하기 / 친구들과 토론하기
- reaction direction: `생각해보자!` / `다르게 보면 어때?`
- relationship evidence: 친구와 함께 / 친구들과 토론하기

Legacy boards with superseded visuals may still contain behavior candidates. Those candidates require cross-artifact corroboration before promotion.

Historical archive package: `GUIDE_길잡이_대화정리_첨부결과물_2026-09-06.zip`

Visual lineage record:
`C2S/SNAP_EXPLORATION_CREW_VISUAL_LINEAGE_LEDGER_2026-09-21.md`

### 탐험대 상호작용 오케스트레이션 — recovered legacy rule

과거 GUIDE 운영원문에서 다음 세부 규칙을 회수하며, 현재 공식 용어로 변환해 탐험대 규칙에 흡수한다.

- **메인 탐험대원 연속성:** 한 활동/세션의 주 동행자는 맥락 없이 자주 교체하지 않는다.
- **Guest 탐험대원 선정:** 필요한 장면에서 추가 탐험대원이 등장할 때 최근 등장 빈도와 현재 mood/state 충돌을 고려한 weighted selection을 사용한다.
- **기능 차등 금지:** Guest 선정은 기능/품질 우열이 아니라 관계·장면 다양성을 위한 것이다.
- **티키타카 위치:** 위트/농담은 탐험가의 부족함을 소재로 하지 않고, 탐험대원 ↔ 탐험대원 간 성격 차이와 상황 반응에서 만든다.
- **탐험가 대상:** 응원·실제 도움을 우선하며 질문 폭격/진단식 대화를 하지 않는다.
- **그룹 장면:** 함께 공부 / 쉬는 시간 / 가벼운 장난 / 힘든 날 곁에 있기 / 함께 더 멀리 가기 같은 장면은 탐험대의 관계 세계를 구성한다.

Legacy mapping:
`Main Guide → 현재 메인 탐험대원`
`Guest Guide → 장면 Guest 탐험대원`

이 규칙은 과거 GUIDE 명칭을 되살리는 것이 아니라 **탐험대 규칙으로 소유권을 이전한 행동 문법**이다.

## 9. 화면별 계약

- **홈:** 탐험가 + 현재 탐험대원이 같은 세계에 존재. 상시 큰 말풍선 금지.
- **랜드마크 선택:** 장소 설명 + 진행도/보석 + 탐험대원 Preview Reaction.
- **탐험 진행:** 질문/힌트는 장소 목적, 반응은 탐험대원 성격.
- **상상 구름:** 생각 조각만 제공. 완성 문장 생성 금지.
- **음성:** 듣기와 말하기 분리. 말한 내용은 탐험가의 입력으로 기록.
- **완료:** 평가 대신 탐험가가 만든 표현과 발견한 힘을 보여준다.
- **추가 연습:** 선택, EXP 없음, 별도 bonusEventId.
- **성장:** 현재 한 그루 성장나무 + 탐험가/탐험대원 동행.
- **특별 탐험:** 선택 초대, 무패널티, Event Memory로 보존.
- **설정:** 시작 메인 후보 5~6명 / 거점·지역 탐험대원 / 스페셜 탐험대를 분리한다. 미발견 스페셜은 정체를 과도하게 노출하지 않고 흔적 상태로 표현하며, 실제 조우 후 선택 가능 여부를 연다. 탐험대원 선택/이름/성격/친밀도·추억은 진행도와 분리한다.

## 10. 외부 앱 경계

### Ready & Set
받음: profile, session_id, goal_id, task_id, lap_id, return_target.
보존: Timer 권한은 Ready & Set.
Snap 반환: expression result/evidence, completion/partial/blocked/help.
Snap은 전체 세션을 닫지 않는다.

### Hide & Seek
받음: 찾은 단어/문맥.
사용: 표현 재료.
금지: 장기 어휘 소유권 중복, 단어 자동 문장 삽입.

## 11. 상태/데이터 기준

신규 Canonical 필드:
- `profile`
- `crewMember`
- `explorationCrewRulesVersion`

레거시 읽기 허용:
- `guide`
- `guideType`
- `guideName`
- `guideVoice`

레거시 값은 마이그레이션 후 신규 저장하지 않는다.

## 12. 실패 조건

다음 중 하나라도 있으면 탐험대 규칙 FAIL:
- 길잡이/Guide가 사용자 화면에 다시 나타남
- 탐험대원이 최종 답을 작성
- 탐험대원별 기능/보상 차등
- 탐험대원 성격이 장소 교육 목적을 가림
- 상시 큰 대사창이 랜드마크/입력을 가림
- 탐험가 실수를 놀림
- 교사/채점자/AI 시스템 말투
- Ready & Set 타이머/세션 권한 침범
- Hide & Seek 어휘 장기 소유권 중복
- 탐험대원 변경으로 기존 데이터 변형

## 13. 검증 Gate

제출 전 반드시:
1. 공식 용어 4개만 사용되는가?
2. 규칙 소스가 이 MASTER + paired JSON 하나인가?
3. 코드 신규 저장에 `guide`가 없는가?
4. 모든 화면이 현재 탐험대원 규칙을 참조하는가?
5. 장소 목적과 탐험대원 성격이 분리되어 있는가?
6. 탐험가 저작권이 보존되는가?
7. 외부 앱 권한 경계가 유지되는가?
8. 레거시는 읽기만 하고 새 기준으로 정규화되는가?
9. 탐험대원 변경이 보상/기록에 영향을 주지 않는가?
10. PWA 오프라인에서도 같은 규칙 파일을 사용하는가?

이 MASTER가 과거 REV10/REV11/REV12의 Guide/길잡이/Guide Companion 관련 조항을 **용어·소유권·행동 규칙에 한해 승계 및 대체**한다. 그 외 UI/보상/성장/세션 규칙은 각 최신 MASTER를 계속 따른다.

## 14. Source Evidence Ledger

Primary recovered source: Google Drive sanitized transcript `P03_SANITIZED_6aa5d901-2c80-83e8-aaa2-3f6a57902a8a_연결 대화 재개` (Drive ID: `1GTnatAVOLpbac_qWakAhMdnIu1zkw1lthp2MY04RACY`).

| User source node | User-confirmed material | Canonical disposition |
|---|---|---|
| 4338afbb-1fcf-4e27-a01b-0a61e4bd721e | 최대 20명, 기본 6명, 챕터/거점, 스페셜 흔적, 녹음 랜덤 조우, 능력 동일 | LOCKED; starter count superseded by latest 5~6 range only |
| afb0abfd-f651-4692-a02f-f0980a0325ad | 직접/추천 이름, 발견 대원 랜덤 이름, 메인 변경 후 이름 유지, 이름 이력 | LOCKED |
| 2426c93f-3b83-4892-adae-cc2767a99b31 | 스페셜 만남 주기 1주/2주 요소 | LOCKED concept; exact per-member cycle OPEN |
| 9b2a70b6-689d-44a4-9b31-0f809b4e5245 | 성장하며 추가, 초반 과밀 금지, 거점 인원 역할 기준 산정 | LOCKED principle |
| ebdc58b8-b231-46bd-8cc6-c3ecf906a7f1 | 6명 중 메인 선택, Snap 고정 5거점, 거점 정보원/한 줄 힌트, 탐험가+메인 동행 | LOCKED; starter number updated by latest 5~6 correction |
| cffdd6fd-970f-4865-a801-0dad05f64654 | 현재 20명, 앱별 컨셉, 향후 추가 가능 | LOCKED |
| 009f5687-9724-4ae5-9944-314483350417 | 스페셜 탐험대 12명 이하 | LOCKED MAX |
| current conversation 2026-09-20 | 초기 5~6명 중 선택, 탐험대 규칙은 Snap & Pop 주도 | LATEST LOCKED |

### Rejected as non-authoritative if unsupported by user correction
- “초기 메인 3 + 거점 3”은 과거 assistant 제안이며 사용자 확정값으로 사용하지 않는다.
- “스페셜 3~4명이 적당”은 과거 assistant 제안이며 상한 규칙으로 사용하지 않는다.
- 거점 탐험대원 정확 인원은 아직 OPEN이다.
- 20명의 전체 개별 종/이름/성격은 아직 확정되지 않았다.


## 15. Source Evidence / Correction Ledger

이 섹션은 탐험대 기준이 다시 파편화되지 않도록 **사용자 원문과 파생 제안**을 구분한다.

| Source | 내용 | 판정 |
|---|---|---|
| 2026-09-08 USER node `4338afbb...` | 최대 20명, 기본 6명 시작, 나머지 챕터/거점, 스페셜 흔적·녹음 랜덤 등장, 기본 탐험대로 변경 가능, 능력 동일 | HARD |
| 2026-09-08 USER node `6f5b25b8...` | 자주 만난 탐험대 친밀도 | HARD |
| 2026-09-08 USER node `ebdc58b8...` | 6명 중 시작, Snap & Pop 고정 5거점, 한 줄 힌트 정보원, 사용자+메인 탐험대 동행 | HARD |
| 2026-09-08 USER node `cffdd6fd...` | 현재 20명, 앱별 컨셉 차이, 향후 업데이트 추가 가능 | HARD |
| 2026-09-08 USER node `009f5687...` | 스페셜 탐험대 12명 이하 | HARD |
| 2026-09-08 USER node `a3efc456...` | 스페셜이 거점 등장 시 기존 탐험대와 재미있는 이슈/대화 | HARD |
| 2026-09-08 USER node `edd06980...` | 아픔/휴가 때문에 대신 옴 같은 생활형 등장 | HARD |
| 2026-09-08 USER node `15b06ede...` | 탐험 파견 느낌 | HARD |
| REV10 | 4종 기본 후보, 기능 능력 차이 없음, Personality/Reaction/Performance, 변경 시 기록 보존 | PRESERVE / terminology superseded |
| Assistant-derived 7일/14일, 정확한 20명 역할 배분, 친밀도 단계명 | 사용자 직접 확정 아님 | OPEN / DO NOT HARD-CODE |

**Correction:** 과거 임시 Canonical에 들어갔던 `worldRegion.minimumCapacity=2` 같은 역할별 최소 인원은 사용자 직접 확정치가 아니므로 제거한다. 수학적으로 남는 인원이 있더라도 실제 역할 배치는 앱/거점 분석 후 결정한다.


### C2S Visual Evidence Clarification
- 로리 영문 표기는 사용자 제공 확정 보드의 `Tori`와 현행 계보의 `Lori`가 충돌하므로 **OPEN_CORRECTION_CHECK**이다. 한국어 이름 `로리`는 잠금한다.
