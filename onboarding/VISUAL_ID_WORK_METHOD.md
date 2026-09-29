# TAKY — 동행탐험 이야기 Visual ID 등록 → 에셋 제작 → 동일 UI 구현 작업방식 (확정 실행 기준)

**적용:** 기존 Core 6와 이후 승인된 모든 탐험대원. 이 문서는 규칙의 재작성이 아니라 실제 재사용 가능한 작업 파이프라인이다. 사람의 역할은 최초 Visual ID·기준 시안 승인 및 최종 승인이고, 중간 에셋 생산·바인딩·실기기 전 자체 검증·오류 수정은 ChatGPT가 담당한다. `USER != DEBUGGER`.

## 실행 사이클 (Think Again, Keep Your Key / Think Again, You’re The Key)

1. **SOURCE_LOCK:** 승인 원본·Visual ID·계보·첫 만남 구도를 조회하고 SHA256, 승인 참조, 불변 ID를 묶는다. 이전 폐기 시안은 가져오지 않는다. 확정되지 않은 원화에서는 자동 제작하지 않는다.
2. **PLAN:** `node onboarding/tools/visual-id-workflow.cjs plan <new-id>`로 필요한 결과 경로·화면별 바인딩·검증 항목을 동일하게 생성한다. Core6은 `report`의 미완료 항목에서 시작한다. *이 단계는 사용자에게 명령을 떠넘기는 것이 아니라 AI 작업 실행 도구다.*
3. **REGISTER/STAGE:** 원본 파일·해시·사용자 Visual ID 승인 근거가 확보된 경우에만 `register <id> <approval-ref> <source-relpath>` 실행하여 `visual-id-candidates/<id>.json`에 미공개 준비 상태로 등록한다. 재등록·ID 덮어쓰기·루트 승격 금지.
4. **ASSET_PRODUCTION:** 승인 원화를 참고해 본체, 개성 소품, 테마 장비를 각각 독립 투명 파일로 제작·분리한다. OBSERVE/LISTEN/IDEA/REACT/WAIT/COMPLETE 여섯 시각 상태도 독립 파일로 제작한다. 승인된 원본이 이미 레이어를 제공하면 해당 레이어를 사용하고, 단일 이미지밖에 없으면 신원과 화풍을 보존하는 실제 분리·충실한 재구성 및 별도 비교 검증을 시행한다. **원본을 크롭한 조각이나 하나의 누끼를 아홉 파일로 복제하는 행위는 금지**한다. 원본 해시·파생 에셋 해시·작업 방식·비교 근거를 각각 기록한다.
5. **SCREEN_CONTRACT:** FIRST_MEETING/CHOICE/PRIMARY/HOME/ACTIVE_SCENE에서 고정 Visual ID를 사용한다. 새 탐험대원을 추가하면 새 승인 구도에 맞춰 첫 만남 장면을 구성하며 현재의 6명 통합 원화에 단순 hotspot만 추가하지 않는다. 대사·행동·음성은 해당 원본 Personality/Owner에 연결하며 점수·답안·친밀도를 임의 생성하지 않는다. 새 캐릭터도 기존 화면 구성·실행 효과·동일 렌더러를 상속한다. 앱별 권한 분리.
6. **ACTUAL IMPLEMENTATION:** 개별 에셋을 Visual ID 등록부와 장면 컴포넌트의 실제 이미지/상태/애니메이션에 바인딩한다. 상태 저장·동행 변경·별칭/이력·reduce-motion·입력 방해 없는 짧은 반응을 연결한다. 정적 이미지 삽입만으로 '구현 완료'라 하지 않는다.
7. **SELF QA & CORRECT:** 4개 뷰포트에서 전체 흐름과 상태별 캡처, 원본/실제 화면 1:1 육안·수치 대조, 클릭·저장·재진입·음성/접근성·원본 SHA·중복 레이어 여부·회귀를 확인해 **제가 직접 수정**한다. 실제 Safari/iPhone 검증 여부는 별도 표기한다. CI 통과≠시안 승인.
8. **GATE:** Source/Layer/Reaction/Scene/Behavior/Render/RealDevice/OwnerApproval이 모두 충족된 경우에만 release candidate. 명시적 최종 승인 전에는 ROOT, Ready/Hide, MAIN, Netlify 자동 전파 금지. 승인되지 않은 추가 구성원은 STAGED에 남는다.

## 공통 규격/사용법

- 기계 판정 기준: `visual-id-production-contract.json`, 단일 기존 Visual ID·정적 에셋 지도: `visual-id-runtime.js`.
- 실제 등록·작업지시·검증: `tools/visual-id-workflow.cjs`의 `plan/register/audit/report`. 새 후보는 `visual-id-candidates/<id>.json`로 별도 관리.
- 필수 개별 에셋: `IDENTITY_BODY`, `PERSONALITY_PROP`, `THEME_GEAR` 및 여섯 반응 상태. 제작물 경로 `characters/produced/<id>/...`. 파일명만 존재하는 것으로 PASS 불가: SHA256 매니페스트, 실제 이미지, 알파 채널 및 파생 출처 검사. 이는 화풍/동일성에 대한 인간·이미지 대조까지 대체하지 않는다.
- CI는 매번 기존 Core6 + 새 후보 미완료 목록을 출력하고 신규 ID가 임의 활성화되지 않는지 확인한다. `plan`은 원본·기존 파일을 변경하지 않는다. 실제 에셋 생성은 제가 승인 원본을 이용해 별도 수행하고, 레이어 제작 또는 UI 반영이 이뤄지지 않았으면 완료로 보고하지 않는다.
- 진행상태는 `STATIC_PREVIEW` / `STAGED_SOURCE_LOCKED` / `ASSET_PRODUCTION_OPEN` / `SCENE_BINDING_OPEN` / `RENDER_QA_OPEN` / `HUMAN_APPROVAL_OPEN` / `ROOT_RELEASE_HOLD`로 구분한다. 각 항목에 실파일·화면 캡처·CI 근거를 붙인다.

**현재 Core6 증거:** 승인 원본과 정적 컷아웃·첫 만남 경로는 연결됐지만 독립 레이어 18종 및 반응 36종은 아직 확보되지 않았다. 이 54개 항목은 결과물이 생성되어 검증되기 전까지 모두 OPEN이다. 11개 화면 확정 시안 1:1 및 물리기기 승인은 별개 OPEN.

## 독립 검증 보정
- 첫 만남의 통합 **장면 PNG는 불투명 원화도 허용**하며, 본체·장비·표정/동작의 독립 렌더용 에셋만 투명 PNG와 개별 출처를 강제한다.
- STAGED 신원은 실제 렌더러와 연동된 뒤에도 감사 가능해야 한다. 등록은 기존 ID와 충돌하면 거부하되, 제작 중 후보가 런타임에 들어간 뒤에는 누락된 증거가 있다면 CI를 실패시킨다. 작업 완료 상태를 임의로 먼저 표시한 후보 역시 FAIL CLOSED.
