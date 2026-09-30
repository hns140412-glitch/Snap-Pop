# Visual ID 등록 → 공통 일괄 제작 명세 (Core 6 우선)

**권위:** `VISUAL_ID_WORK_METHOD.md` + `visual-id-production-contract.json` + 이 문서와 실행형 `visual-id-batch-production.v1.json`. 승인 원화 자체와 22개 바이너리 SHA는 `asset-and-release-gate.json`에서만 판정한다. 새 명세는 기존 승인 규칙을 대체하거나 기존 결과를 무효화하지 않는다.

## 입력 잠금과 자동 작업 생성

1. 기존 Core 6은 승인된 원본 JPEG, 정적 cutout PNG, Visual ID, 6개 개별 mask spec SHA, 18개 기술 분리본과 6개 underpaint 후보 및 9-pose QA를 **승계**한다. 새로운 그림을 생성해 원본을 바꾸지 않는다.
2. 향후 추가 등록은 반드시 승인 참조·Visual ID·개별 원본·SHA가 `required_assets`에 일치해야만 `register`로 STAGED 처리한다. 개별 cutout 및 mask spec이 없으면 `BLOCKED_INDIVIDUAL_CUTOUT_OR_MASK_SPEC`이며 이름만으로 그림을 그리거나 Core6의 mask를 복사하지 않는다.
3. 등록 결과의 `batchProduction.command`가 공통 실행 경로다. `python onboarding/tools/visual-id-art-batch.py --mode plan`은 기존 소유자 범위와 승인된 staged source를 동적으로 발견하고 Visual ID마다 동일한 9개 실물 제작 슬롯을 만든다. `--id <id>`로 해당 ID만 검사 가능하다. plan은 결과물 원화가 아니다.
4. `python onboarding/tools/visual-id-art-batch.py --mode audit`는 실제 `characters/produced/<id>/manifest.json`와 개별 PNG를 읽어 판단한다. 누락 파일은 별도 OPEN으로 반환하며 source SHA가 바뀌면 즉시 FAIL CLOSED. 감사는 원본이나 파생 파일을 자동 수정하지 않는다.

## Visual ID별 고정 9개 개별 출력
| 슬롯 | 경로 (`characters/produced/<id>/` 아래) | 필수 기준 |
|---|---|---|
| IDENTITY_BODY | `layers/identity_body.png` | 기존 체형/의상/머리·가림 부분 복원; 소품 제거 후에도 성립 |
| PERSONALITY_PROP | `layers/personality_prop.png` | 해당 멤버의 원본 고유 소품; 손/쥐는 위치와 가려진 뒷면 처리 |
| THEME_GEAR | `layers/theme_gear.png` | 기존 모자·고글·배낭 등 고유 장비; 머리·의복 경계 분리 |
| OBSERVE | `reactions/observe.png` | 실제 독립 관찰 반응 원화 |
| LISTEN | `reactions/listen.png` | 실제 독립 듣기 반응 원화 |
| IDEA | `reactions/idea.png` | 실제 독립 생각·발견 반응 원화 |
| REACT | `reactions/react.png` | 실제 독립 반응 원화 |
| WAIT | `reactions/wait.png` | 실제 독립 기다림 반응 원화 |
| COMPLETE | `reactions/complete.png` | 실제 독립 완료 반응 원화 |

각 PNG는 원본과 같은 1122×1402 좌표계의 독립 RGBA 투명 파일이다. 원본의 2.5D 화풍·인체 비례·색상·고유 장비·표정을 승인 설계에서 벗어나게 재구성하지 않는다. 투명 영역 RGB도 (0,0,0)으로 정리한다. 누끼를 9번 복사하거나, 크롭/이름만 바꾸거나, 임의 인물을 생성한 파일은 미제출로 처리한다. 본체·소품·장비 정지 합성은 승인된 cutout의 보이는 픽셀과 동일해야 하며, 복원된 미가시 부분은 별도 미술 검수 대상이다.

신규 ID에서는 위 9개 외에 정적 cutout과 새로 승인받은 첫 만남 합성 원화도 별도 필수다. 기존 6인 합성에 클릭 영역만 추가하면 안 된다. Core6은 승인된 첫 만남 원화를 그대로 승계한다.

## 실제 산출물 증빙

ID별 `characters/produced/<id>/manifest.json`에 `schema=TAKY_VISUAL_ID_ART_PACKAGE_V1`, `visual_id`, 원본·cutout·mask spec SHA, 승인 참조, 9개 `assets`를 기록한다. 각 에셋은 정확한 개별 경로, 실제 파일 SHA, 동일 ID cutout SHA, 제작 방법(`EXTRACT_APPROVED_SOURCE` / `APPROVED_ORIGINAL_LAYER` / `FAITHFUL_TRACE_WITH_SOURCE_REVIEW`)과 원본 충실도 검수 참조를 가진다. 사용자가 별도 승인하지 않은 기술 마스크, underpaint, 미리보기·WebP는 여기에 최종 원화로 등록하지 않는다.
## 자동 검증과 사람의 미술 승인 분리

- **기계 검증:** 기존 원본·cutout·mask SHA, 9개 파일과 경로, RGBA/캔버스/알파 청결, 동일한 픽셀의 재인코딩·중복 파일, 다른 ID와 동일한 파생 픽셀, 원본 보이는 영역의 정지 합성 정합성을 검사한다. 출처 불일치, 누락, 재사용은 FAIL CLOSED.
- **실제 미술 검증:** 눈·입·귀·머리·손·의상과 장비의 세부 윤곽, 가려진 곳의 자연스러운 복원, 실제로 구별되는 6가지 표정/동작, 이동 시 그립·관절·그림자 검증은 별도 검토한다. 파일 존재/자동 alpha 보정만으로는 미술 승인 불가.
- **UI/기능:** `FIRST_MEETING / CHOICE / PRIMARY / HOME / ACTIVE_SCENE`에 Visual ID를 실제 바인딩하고, 기존 11단계 온보딩(0~10)과 선택·재선택·기억/이력·무전 독립 반응을 검증한다. 375×667, 390×844, 430×932, 1024×768에서 원본 시안과 실제 렌더를 대조한다. 실제 iPhone/Safari·reduced-motion도 별도 증거가 필요하다.
- **승인 게이트:** 기술적 원화 검수 → 미술 승인 → 실제 UI 1:1 검수 → 실기기/회귀 → 사용자 최종 승인 → 별도 Snap ROOT 권한 승인. 앞 단계의 CI PASS가 뒷 단계 승인으로 자동 전파되지 않는다. `USER != DEBUGGER`.

## 진척 계산과 작업 범위

기존 22개 승인 바이너리와 6개의 Visual ID는 보존한다. 18개 SOURCE-PARTITION 초안, 6개 부분 복원, 기존 인터랙티브 QA 및 54개 9-pose 검사 프레임은 모두 승계하지만 **54개 최종 제작물에 중복 가산하지 않는다**. 현재 6명×9 = 54개가 제작 목표이며, 미술 최종 승인 0/18 레이어·0/36 반응 원화를 그대로 OPEN으로 보고한다.

새로운 승인 Visual ID는 동일한 명세·명령·검증을 재사용하지만 Core 6 완성 전 20명 확장은 보류한다. 20은 코드의 처리 가능 상한일 뿐 탐험대원 수나 신규 제작 허가는 아니다. 사용자 명시 승인 전 PR Draft/HOLD, main 병합·ROOT 활성화·Netlify·Ready/Hide 자동 배포 금지.
