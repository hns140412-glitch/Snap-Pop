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

## 8. Current implementation diagnosis

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
