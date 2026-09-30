# GUIDE☆ Visual ID 07~24 — CLI PIPELINE HANDOFF LATEST

## 목적
다른 대화창에서 CLI로 실제 개별 Cutout/SHA/Mask/최종 원화 제작을 진행하기 위한 실행 기준이다.
이 문서는 제작물을 대체하지 않으며, 이름만으로 캐릭터를 생성하지 않는다.

## Authority / 고정값
- Core 6: dubi / lori / ink / nova / take / zero — 기존 승인 원본·Cutout·Mask SHA 보존, 재생성 금지.
- Expansion 18: 07 SOLA, 08 BELO, 09 MOCA, 10 NIA, 11 KIRO, 12 PEACH,
  13 MINT, 14 TOTO, 15 RUNE, 16 POPO, 17 MARU, 18 BORI,
  19 RIN, 20 LUMI, 21 TESS, 22 SEL, 23 ZEKE, 24 VIVI.
- 19~24는 사람형 Special Crew.
- ID24 canonical = VIVI/비비. 원본 보드 안의 NOVA 글자는 source pixels only; 파생 Registry/UI/File에는 NOVA 금지.
- 승인 그룹 SHA 3개와 Library 승인 ZIP/manifest는 기존 HANDOFF authority 그대로 상속한다.
## 현재 준비상태
- Core6 source lock: 6/6 READY.
- Expansion group identity + source-group SHA: 18/18 READY.
- Expansion exact member reference-view SHA: 18/18 READY.
- Expansion independent transparent cutout SHA: 0/18.
- Expansion per-ID mask spec SHA: 0/18.
- Final art approved: 0/216.
- Full24 batch: NOT ARMED (현재 source lock 6/24).
- main / ROOT / Netlify: HOLD.

## 핵심 원칙
1. group SHA ≠ individual cutout SHA.
2. reference-view SHA ≠ individual cutout SHA.
3. 독립 Cutout은 승인 원본에서 캐릭터 정체성을 유지한 투명 RGBA 파일이어야 한다.
4. 독립 Cutout SHA가 실제 파일 바이트와 일치해야 다음 단계로 이동한다.
5. Mask Spec은 반드시 같은 Visual ID와 같은 Cutout SHA를 바인딩한다.
6. Cutout SHA + Mask SHA + approval ref가 모두 맞아야 ART_PRODUCTION_OPEN.
7. 이름/코드만 보고 새 캐릭터를 생성하면 FAIL.
8. 기존 QA prototype / crop / underpaint / 9-pose preview는 final art로 승격 금지.
## per-ID 상태 머신
AWAITING_INDEPENDENT_CUTOUT_SHA
→ [실제 characters/ui_cutouts/guide-XX.png 생성 + SHA256 등록/대조]
INDEPENDENT_CUTOUT_SHA_LOCKED_MASK_SPEC_OPEN
→ [characters/layer_specs/guide-XX.json 작성 + SHA256 + approval_ref + cutout_sha bind]
ART_PRODUCTION_OPEN_NOT_AUTO_GENERATED
→ [BODY / PROP / GEAR + 6 reactions 실제 개별 PNG 제작]
NINE_REAL_ART_FILES_SUBMITTED
→ [manifest + SHA + pixel/alpha/source provenance audit]
NINE_ART_FILES_MACHINE_CHECKED_ARTISTIC_AND_UI_QA_OPEN
→ [미술 검수 + 11 screen binding + 4 viewport + iPhone/Safari]
HUMAN_APPROVED
→ [별도 release authorization 후에만 ROOT/main/Netlify]
## 최종 제작 슬롯 — 24명 공통
각 ID마다 정확히 9개:
- layers/identity_body.png
- layers/personality_prop.png
- layers/theme_gear.png
- reactions/observe.png
- reactions/listen.png
- reactions/idea.png
- reactions/react.png
- reactions/wait.png
- reactions/complete.png

총 24 × 9 = 216.
Core6도 최종 54개 슬롯 대상이지만 기존 source cutout/mask는 재생성하지 않는다.

## CLI 실행 순서
1. CURRENT → live main → Draft PR #10 HEAD/CI 확인.
2. Library 승인 ZIP + SHA manifest 복원 후 3개 group SHA 재검증.
3. `python onboarding/tools/visual-id-source-readiness.py`
4. 07~24 각 ID에 대해 독립 Cutout 생성 → SHA256 계산 → `guide-07-24-independent-source-registry.v1.json` 등록.
5. 등록 후 readiness 재실행; 잘못된 SHA는 즉시 FAIL CLOSED여야 한다.
6. 각 ID Mask Spec 생성 → SHA256 계산 → registry에 mask SHA + approval_ref 등록.
7. per-ID `ART_PRODUCTION_OPEN_NOT_AUTO_GENERATED` 확인.
8. 24/24 source lock이 되기 전에는 full art batch 시작 금지.
9. 24/24 후:
   `python onboarding/tools/visual-id-source-readiness.py --require-full24`
   `python onboarding/tools/visual-id-art-batch.py --mode plan --scope full24`
10. 실제 216개 제작 후:
   `python onboarding/tools/visual-id-art-batch.py --mode audit --scope full24`
11. machine PASS 이후에도 artistic/UI/device/human gate는 별도 수행.

## 배치 전략
- 07 SOLA 1개 파일럿 → fidelity/edge/identity/prop/gear 확인.
- PASS 시 08~12.
- 그 다음 13~18.
- 마지막 19~24 Special Human.
- 한 ID 실패 시 그 ID만 수정; 이미 PASS한 ID를 다시 생성하지 않는다.
- 동일 SHA/동일 입력 재실행은 idempotent하게 재사용하고, source 변경 시 새 승인 필요.
## 금지
- 승인 원본 재디자인.
- 다른 캐릭터의 mask/spec/asset 복제.
- group board의 컬럼 crop을 최종 cutout으로 간주.
- 생성형 이미지로 기존 승인 원본을 대체.
- 이름만으로 새 얼굴/체형/소품 생성.
- 24 VIVI를 NOVA로 등록.
- QA preview를 final art로 카운트.
- 사용자 승인 전 main merge / ROOT activation / Netlify.

## CLI 재개 프롬프트
최신 TAKY 기준으로 GUIDE☆ Visual ID 07~24 CLI 제작을 재개해.
Library `/TAKY/HANDOFF/GUIDE_VISUAL_ID_07_24/`의 NEW_CHAT_START_LATEST.md, 승인 원화 ZIP, SHA manifest,
그리고 이 `GUIDE_07_24_CLI_PIPELINE_HANDOFF_LATEST.md`를 먼저 복원해.

CURRENT → live main → Draft PR #10 exact HEAD/CI → HANDOFF 순서로 확인하고 CLOSED는 상속해.
Core6 source lock 6/6은 보존하고 재생성하지 마.
07~24는 `guide-07-24-independent-source-registry.v1.json` 기준으로 독립 Cutout SHA → Mask SHA → ART_PRODUCTION_OPEN 순서로만 진행해.
19~24는 사람형 Special, 24는 VIVI다.
이름만으로 임의 생성하지 말고, 잘못된 SHA/ID/source binding은 FAIL CLOSED.
24/24 source lock 전 full 216-art batch를 시작하지 마.
USER != DEBUGGER. main/ROOT/Netlify는 HOLD.

## 신규 시각 QA 고정사항 — 2026-09-30
- 추가 18명만 따로 보지 말고 **Core6와 같은 보드에 함께 배치**해 스타일 응집도를 확인한다.
- 비교 보드는 검수용이며 final art가 아니다. Core6 원본/컷아웃은 절대 재생성하지 않는다.
- 각 Expansion Cutout 배치가 끝날 때마다 Mask Spec으로 승격하기 전에 Core6 6명 + 신규 결과를 중립 배경/동일 스케일 기준으로 비교한다.
- 비교축: 캐릭터 크기, 머리:몸 비율, 2.5D 깊이/재질, 외곽선 부드러움, 광원 방향/대비, 채도, 소품 밀도, 발-지면 정렬, 동물형↔사람형 Special의 전체 세계관 응집도.
- 눈에 띄는 화풍/비율 drift가 있으면 해당 ID만 FAIL CLOSED 후 수정하고, 이미 PASS한 ID는 재생성하지 않는다.

### 현재 발견된 파생본 오류 플래그
- **21 TESS**: 왼쪽 손이 없거나 보이지 않는 파생 결과가 있었다. Cutout 단계에서는 승인 원본에 없는 손을 임의 생성하지 않는다. 이후 반응/포즈에서 왼손이 실제로 드러나야 할 때만 승인된 TESS의 체형·의상·손 크기·피부톤에 맞춰 충실 복원하고 별도 미술 QA를 거친다.
- **23 ZEKE**: 파생 결과의 하체/다리 연결·비율이 이상해진 사례가 있었다. 이 왜곡을 source authority로 승계하지 않는다. 승인 원본의 다리 길이·무릎/발 위치·좌우 연결을 기준으로 BODY/pose QA에서 교정한다.
- 위 두 오류가 들어간 기존 생성 시트/파생 이미지는 **INVALID QA RESULT**이며 SHA Registry, Final Art Manifest, UI binding 근거로 사용 금지.
