# SNAP & POP — Universal Core Contract

Date: 2026-09-21
Branch: `taky/snap-pop-implementation-2026-09-20`
Authority: latest direct user correction
Status: CURRENT PRODUCT CORE

## 1. Product purpose

Snap & Pop is not only a writing trainer.

Its general-purpose core is:

### A. THINK → EXPRESS
Help a child turn thoughts into an actual expression.

Supported expression paths include:
- Korean writing;
- English writing;
- spoken expression;
- idea fragments;
- explanation;
- opinion;
- story/scene;
- revision/refinement.

### B. ASK → UNDERSTAND
Act as a child-friendly curiosity resolver.

The child may ask broadly about:
- society;
- history;
- culture;
- science;
- geography;
- language;
- arts;
- people/events/concepts;
- everyday life;
- other age-appropriate curiosity.

The goal is not merely to return a short answer.

The system should help the child:
1. understand the core answer;
2. understand why/how when useful;
3. connect it to prior knowledge or a familiar example;
4. distinguish fact from uncertainty;
5. ask one useful follow-up only when it helps;
6. optionally turn understanding into writing/speaking/exploration.

## 2. Bilingual expression standard

Korean and English are both first-class expression paths.

They are not simple UI translations.

The system should support:
- thinking in Korean and writing in Korean;
- thinking in Korean and expressing in English;
- asking about an English phrase/word and understanding it in Korean when useful;
- improving English expression without replacing the child's meaning;
- preserving the child's intended idea across languages.

English support must not become:
- grammar-drill-only;
- translation-only;
- teacher/scoring mode.

Korean support must not become:
- essay-format-only;
- spelling/grammar correction as the primary goal.

Both share the same principle:
`MEANING FIRST → EXPRESSION SECOND → POLISH THIRD`.

## 3. Curiosity resolver standard

For broad child questions, the exploration crew/Guide should behave as a helpful resolver, not a quizmaster.

Response pattern may use:
- direct answer;
- simple explanation;
- example/analogy;
- timeline/context;
- compare/contrast;
- cause/effect;
- map/place/context;
- "what we know / what is uncertain";
- optional next curiosity.

Do not force every answer back into a writing exercise.

Sometimes the correct product behavior is simply:
`QUESTION → CLEAR ANSWER → UNDERSTANDING`.

## 4. Knowledge domains

The core must be domain-general.

Examples:
- 사회: 제도, 직업, 공동체, 경제의 기초
- 역사: 사건, 인물, 시대, 원인과 결과
- 문화: 음식, 관습, 언어, 예술, 지역문화
- 과학: 자연현상, 생물, 물리/화학 기초, 우주
- 지리: 국가, 지역, 환경, 지도 맥락
- 언어: 단어, 표현, 문장, 의미 차이
- 일상: 생활 속 궁금증
- 예술/콘텐츠: 작품/장르/표현 이해

Specific factual answers may require current/fresh sources when the topic is time-sensitive.

## 5. Connection to writing support

Writing-support devices remain important but are one subsystem.

Possible transitions:
- ASK → UNDERSTAND only
- ASK → UNDERSTAND → EXPRESS
- THINK → EXPRESS
- THINK → ASK → UNDERSTAND → EXPRESS
- VOICE → THINK/ASK → EXPRESS

Do not force transitions that the child did not need.

## 6. Guide / exploration crew role across both axes

The same Guide-derived rules apply:
- no shame for not knowing;
- no over-praise;
- no teacher/grader persona;
- answer the actual question;
- react to the child's actual thought;
- explain at the smallest useful depth first;
- preserve agency;
- avoid question flooding;
- use humor without mocking;
- use voice when reading/writing is a barrier;
- admit uncertainty rather than invent.

## 7. Runtime architecture implication

Snap & Pop needs at least two bounded runtime engines:

### ThoughtExpressionEngine
Owns:
- idea elicitation;
- emotion/sensory/perspective tools;
- Korean/English expression;
- voice capture;
- revision.

### CuriosityResolver
Owns:
- broad child question intake;
- intent/topic understanding;
- factual/explanatory answer;
- age-appropriate depth;
- confidence/uncertainty handling;
- optional follow-up;
- optional bridge into expression.

These engines share:
- exploration crew interaction layer;
- session/context;
- voice accessibility;
- memory/records when appropriate.

## 7.1 Imagination Cloud — OpenAI Intelligence Gateway

상상구름은 단순 아이디어 칩 UI가 아니다.

사용자-facing 기능:
- 생각 꺼내기;
- 궁금증 묻기;
- 설명 듣기;
- 비교하기;
- 이유/원인 이해하기;
- 사회·역사·문화·과학 등 범용 질문 해결;
- 한글 표현;
- 영어 표현;
- 번역/의미 연결;
- 글/말/탐험으로 확장;
- 원래 탐험으로 복귀.

Internal role:
`IMAGINATION_CLOUD = SNAP_POP_INTELLIGENCE_GATEWAY`

Its internal execution layer may use OpenAI model/tool capabilities to:
- classify intent;
- answer/explain;
- search when fresh information is needed;
- retrieve project/local knowledge when applicable;
- transform/translate/rephrase without replacing the child's meaning;
- route to app functions;
- return bounded results to the Snap & Pop experience.

The child must not be exposed to raw platform/tool complexity.

The exploration crew standard sits **above** the model/tool layer:
- child agency first;
- no shame;
- no teacher/grader persona;
- no fabricated certainty;
- smallest useful answer first;
- no forced writing conversion;
- no question flooding;
- age-appropriate explanation;
- Korean/English meaning preservation.

Important status distinction:

`ARCHITECTURE_CONFIRMED != OPENAI_RUNTIME_CONNECTED`

The current branch contains a local/basic `cloudFragments()` implementation.
That implementation is a placeholder/minimal residue of the larger Imagination Cloud concept and must not be mistaken for the complete OpenAI-backed gateway.

## 7.2 Response ownership — exploration crew is the speaking subject

The response subject is the **exploration crew**, not OpenAI.

Architecture:
`child input`
→ `Snap & Pop intent/routing`
→ `OpenAI model/tools as internal engine when needed`
→ `exploration crew policy/voice/relationship guard`
→ `crew-member-facing response`

Hard rules:
- user-facing answer must be delivered through exploration crew identity/interaction rules;
- raw "AI answer" voice is not the product voice;
- model/tool output is intermediate material, not final child-facing copy;
- current main crew member context should govern delivery when a main companion exists;
- Guest crew members may participate only under crew orchestration rules;
- answer depth/tone/humor/follow-up must obey exploration crew rules;
- factual uncertainty must not be hidden by character voice;
- character personality must never override truthfulness or clarity;
- crew members may differ in expression, but not in factual quality or learning power.

Therefore:
`OPENAI = INTERNAL INTELLIGENCE ENGINE`
`EXPLORATION_CREW = RESPONSE OWNER / USER-FACING SUBJECT`

## 7.3 Concept-first scaffold and truth gate

상상구름의 기본 출력은 장문의 설명문이 아니다.

기본 설명 우선순위:
1. **핵심 개념** — 이것이 무엇인지;
2. **원리/구조** — 왜 그렇게 되는지;
3. **어원/말의 뿌리** — 실제 학습에 도움이 되고 근거가 있을 때;
4. **관계/맥락** — 무엇과 연결되는지;
5. **간단한 예시** — 생활/장면/비교 예시;
6. **마인드맵형 구조** — 중심개념 → 하위개념 → 관계;
7. 필요할 때만 한글/영어 표현 또는 탐험으로 확장.

지원 가능한 child-facing scaffold:
- 한 줄 핵심;
- 원리 그림/텍스트 다이어그램;
- 간단한 마인드맵;
- 원인 → 과정 → 결과;
- 비교표;
- 시간순서;
- 장소/지도 맥락;
- 어원 → 현재 의미;
- 예시 1~2개;
- "이것과 이것의 차이";
- 작은 확인 질문 1개.

### Truth / hallucination guard — HARD LOCK

정확성은 캐릭터성·재미·속도보다 우선한다.

금지:
- 모르는 내용을 그럴듯하게 채우기;
- 불확실한 어원을 사실처럼 단정;
- 역사적 일화/연도/인물 관계를 추정으로 생성;
- 사회·문화 관습을 과도하게 일반화;
- 과학 원리를 단순화하다 사실을 왜곡;
- 출처가 필요한 최신/전문 사실을 내부 기억만으로 단정;
- 탐험대 캐릭터 말투로 불확실성을 숨기기.

필수:
- 사실 / 해석 / 가설 / 추정을 내부적으로 구분;
- 불확실하면 확신을 낮추고 확인 경로 사용;
- 최신성·전문성·논쟁성이 높으면 적절한 검색/자료 참조;
- 어원은 신뢰 가능한 언어학/사전 근거가 있을 때만 제시;
- 확인되지 않은 민간어원(folk etymology)은 사실처럼 쓰지 않음;
- 숫자/연도/고유명사/인과관계는 검증 우선;
- 여러 해석이 존재하면 하나로 수렴시키지 않음;
- 확인 불가능하면 "확실히 확인되지 않았어"라고 탐험대 말투로 솔직하게 표현.

### Output rule

`FACT CHECK → CONCEPT MODEL → SCAFFOLD → EXPLORATION CREW VOICE`

NOT:

`MODEL GUESS → CHARACTER FLAVOR → CONFIDENT ANSWER`

## 7.4 Writing-first surface / hidden Imagination Cloud

Latest direct correction:

Snap & Pop의 **기본 사용자 상태는 글쓰기 탐험**이다.

상상구름은 제품의 핵심 지능 레이어이지만, 기본 메뉴/전면 허브가 아니다.

User-facing hierarchy:

`DEFAULT = WRITING EXPLORATION`

`IMAGINATION_CLOUD = HIDDEN / ON-DEMAND THINKING LAYER`

기본 흐름:
- 탐험 세계 / 5개 글쓰기 장소;
- 장소 선택;
- 3단계 글쓰기;
- 기록 / 성장.

상상구름 호출 조건:
- 아이가 직접 상상구름을 부름;
- 무전으로 질문;
- 글쓰기가 막혔을 때 도움 요청;
- 탐험대가 작은 도움을 제안할 때;
- 어원·역사·사회·문화·과학 등 궁금증이 생겼을 때.

행동 원칙:
- 평소에는 숨김;
- 호출 시 오버레이/보조 레이어로 등장;
- 현재 글쓰기 문맥을 잃지 않음;
- 닫으면 원래 입력 위치로 복귀;
- 상상구름 사용을 강제하지 않음;
- 별도 범용 허브 화면을 기본 네비게이션으로 두지 않음.



Current branch:
- Korean writing: PARTIAL/CODED
- English writing: PARTIAL/CODED
- voice expression: PARTIAL/CODED
- fixed writing prompts: CODED
- basic Imagination Cloud: CODED/PARTIAL
- broad-domain child Q&A: NOT CODED
- society/history/culture/general knowledge resolver: NOT CODED
- answer confidence/source handling: NOT CODED
- question→understanding→optional expression routing: NOT CODED

Therefore previous implementation percentages that omitted the Ask→Understand axis are scope-incomplete.

## 9. C2S invariant

`SNAP_POP != WRITING_ONLY`

`CORE = THINK_TO_EXPRESS + ASK_TO_UNDERSTAND`

`KOREAN + ENGLISH = FIRST_CLASS EXPRESSION PATHS`

`CURIOSITY_RESOLVER = CORE, NOT OPTIONAL EXPANSION`
