# Core 6 승인 원화 제작 — 재개준비 / NEW CHAT START — 2026-09-30 LATEST

## 작업 목적 / HUMAN INTENT
사용자는 두비(dubi), 로리(lori), 잉크(ink), 노바(nova), 테이크(take), 제로(zero) **기존 승인 원화 6명만 실제 완성**하라고 지시했다. 새 캐릭터를 창작하거나, 기존 작업물을 버리거나, 기술 마스크/QA 화면을 최종 원화로 부풀려서는 안 된다. Core 6부터 7단계 완료; 20명 확장 논의/새 ID 추가는 보류. Codex는 Plus 5시간 사용량을 고려해 채팅에서 불가한 중요하고 무거운 실행에만 사용한다. USER != DEBUGGER.

## Authority 복원 (기록 SHA를 현재 고정 권한으로 보지 말 것)
1. `onboarding/HANDOFF_LATEST.md`, 이 파일, `onboarding/central-asset-source.v1.json`, `onboarding/visual-id-runtime.js`, `onboarding/visual-id-production-contract.json`, `onboarding/asset-and-release-gate.json`, `onboarding/visual-review-current.json` 확인.
2. Live Snap-Pop `main` EXACT HEAD → [Draft PR #10](https://github.com/hns140412-glitch/Snap-Pop/pull/10) 최신 HEAD/CI/변경파일 및 HANDOFF override 대조 → approved original 22 files SHA 확인. 이 핸드오프 작성 전 확인값: main `3de97be0d12dd6244a942b0c137c2efe578a43b6`, PR `280cec59fc4634810d752a67c21ec8a876d721cf`. 최신값 재조회 우선.
3. 권위 원본: `onboarding/characters/originals/{id}_source.jpeg`; 별도 정적 컷아웃 `onboarding/characters/ui_cutouts/{id}.png`; 6개 독립 `onboarding/characters/layer_specs/{id}.json`. 22 approved user source images NEVER overwrite. Visual ID 절대 재명명/대체 금지.

## 실제 CLOSED / 이번 시점 증거
- 6명의 고유 승인 원본/컷아웃과 22개 immutable original SHA 잠금. Core6 정적 선택 → PRIMARY → HOME/무전 흐름, 6명별 실제 선택/로딩/대사/힌트 저장·재접속 테스트, baseline 74 화면 검증.
- 6명×3 = 18 source-visible clean-alpha layer **technical partition drafts** (BODY, PROP, GEAR)과 캐릭터별 visible contour corrections. 원본 visible RGBA 재조합 일치. 이 18개는 18 approved motion-rig drawings가 아님.
- 6명×2 = 12 source-exposure masks; 6 source-local partial BODY underpaint candidate PNGs and 12 fixed QA shifts. At-rest reconstruct approved original. 일부 interpolation이지 보이지 않았던 신체/소품의 미술 완성 아님.
- **이번 추가 최신:** `onboarding/tools/build-core6-motion-preview.py`, `onboarding/qa/core6-motion-preview.template.html`, `onboarding/central-asset-source.v1.json`: 동일 승인 원본 6개 + 각자의 BODY/PROP/GEAR + 각자의 부분 underpaint = 30 SHA-verifiable independent PNG copies를 묶는 실제 인터랙티브 QA viewer. Static 원본 합성은 6/6 byte-exact, 원본 지정된 PROP 또는 GEAR의 작은 시험 이동만 가능. 375×667/390×844/1024×768에서 6명×3=18 브라우저 화면. Product UI/11-screen parity / arbitrary rig 또는 release asset 아님.
- 직전 source CI: https://github.com/hns140412-glitch/Snap-Pop/actions/runs/36637966224 PASS. 원본 인터랙티브 QA 산출물: https://github.com/hns140412-glitch/Snap-Pop/actions/runs/36637966224/artifacts/11065292898 (GitHub retention에 따라 만료 가능; 실행으로 재생성). 별도 baseline browser CI https://github.com/hns140412-glitch/Snap-Pop/actions/runs/36637966114 PASS.
- 직전 오류: preview Playwright 테스트 내 닫는 괄호 하나 누락으로 구 HEAD에서 파서 실패 → 실제 테스트 코드 수정, `node --check` CI 사전 검사 추가, 후속 HEAD 280cec5에서 양쪽 CI PASS. 실패를 지우거나 이전 SHA 통과로 바꿔 말하지 말 것.
- 신규 ID 배치 처리는 승인·SHA·멤버별 mask spec을 요구하는 기술적 20 ID capacity와 임시 7번째 전체 파이프라인 regression까지 PASS. 이것은 14명 신규 원화 제작/20명 roster 확정이 아니며 Core6 우선순위를 바꾸지 않음.
- **폐기된 일탈:** 대화 중 승인 원본과 무관한 애니 여성 6명 contact-sheet 및 근거 없는 '완료' 레이블을 생성한 적 있다. NOT source authority, NOT asset, NOT committed. 절대로 재사용하거나 기존 6명에 대입하지 말 것.

## 정확한 OPEN 및 전체 7단계 실적 (완료 부풀리기 금지)
1. 원본·6개 Visual ID 확보: CLOSED.
2. 독립 visible 18 source-pixel role draft: technical prototype CLOSED, artistic release HOLD.
3. 가려진 부분 원화: 6개 partial interpolation draft 있으나 최종 미술 검수 OPEN.
4. 최종 움직임용 독립 BODY/PROP/GEAR: 승인 **0/18** = Core6 최종 motion art **0/6**.
5. 별도 원화 반응 OBSERVE/LISTEN/IDEA/REACT/WAIT/COMPLETE: **0/36** genuine independent illustrated frames.
6. 확정 11개 화면 1:1 구현: 기존 정적 6명 선택 flow/QA는 부분 완료, approved reference-vs-actual pixel/render parity 및 진짜 rig/sprite 바인딩 OPEN.
7. 통합 UI·4 viewport/real iPhone Safari·regression·별도 human visual approval·Snap ROOT owner gate: OPEN.
- 녹색 CI와 30 QA PNG, 18 브라우저 스크린샷은 원화/제품 디자인 승인과 다른 증거. 신규 아트를 생성했다고 말하려면 **실제 6명 원본별 별도 결과물과 SHA, before/after artistic inspection** 필요. 20명 추가보다 6명 최종 완성이 우선.

## 다음 대화 작업 (보고서 반복보다 실제 제작)
- 먼저 재조회한 현재 PR 소스를 기존 승인 원본과 1:1 연결, 30 PNG QA viewer를 개별 확인하여 소품 이동 후 몸통/머리/가려진 손·장비 뒷면의 visible 충돌을 멤버별 좁힌다.
- 승인 원본에서 벗어나는 임의 화풍/체형/캐릭터 재생성 금지. 기존 2.5D 승인 원화의 비율, 고유 장비/상징, Visual ID 유지; flatten/contact-sheet 아닌 인물별 BODY, PROP, GEAR 원본 레이어 파일 및 필요 독립 반응 원화를 실제 제작. 원본에 없는 부분을 이미 확보했다고 주장하지 말 것.
- 완료 결과는 6명 공통 기준으로 source SHA → 개별 에셋 → 정지 원본 pixel parity → 정해진 이동 외 motion 안전성/미술 검토 → 여섯 실제 다른 반응 → 홈/무전/선택 11-screen 실 UI 렌더 screenshot parity → 회귀·실기기 및 승인 근거로 증명.
- NEW CHAT에서 재개준비 단계 자체는 신규 원화 제작/배포를 의미하지 않음. 먼저 신규 HEAD와 CLOSED 상속, 신규 OPEN만 진행. GitHub Draft PR 지속, main merge/Netlify/Ready-Hide promotion 사용자 명시 승인 전 금지.
- TAKY slogan: Think Again, Keep Your Key. / Think Again, You're The Key. 사용자 의도 → 원본/권한 잠금 → 실제 생산 → 자기/교차/회귀검증 → 사용자 승인. Codex 최소화.

## 복사용 NEW CHAT START
최신 TAKY 기준으로 Snap-Pop 동행탐험 **기존 승인 Core 6 최종 원화 제작**을 이어서 진행해. 먼저 `onboarding/CORE6_RECOVERY_NEW_CHAT_START_LATEST.md`와 `onboarding/HANDOFF_LATEST.md`를 모두 읽고, CURRENT/중앙 소스 → Snap-Pop live main EXACT HEAD → Draft PR #10 최신 HEAD·CI → 승인 원본 22개와 Core 6 Visual ID 원본·SHA → 최신 인터랙티브 원본 레이어 QA 산출물 순서로 복원해. 기록한 SHA를 현재 HEAD로 오인하지 마. CLOSED는 상속하고 신규 증거가 있는 OPEN만 진행해. 가짜 애니 여성 캐릭터 이미지는 전면 무효; 기존 dubi/lori/ink/nova/take/zero 승인 2.5D 원화를 절대 재생성·대체하지 마. 6명 최종 움직임용 원화와 36개 실제 독립 반응 원화 제작을 우선하고, 기존 분리 18개/부분 복원 6개는 시제품으로만 간주해. 원본 레이어 분리·반응 원화·UI 구현은 개별 파일과 실제 실행/미술 QA로 확인하며 사용자에게 디버깅을 넘기지 마. 20명 확장·임의 생산·진척 부풀리기·계획서로 제작 대체 금지. Codex는 Plus 5시간 사용량 고려해 최소 투입. 승인 전 main·Netlify·ROOT 활성화 금지.

## 2026-09-30 nine-pose source QA update
- Check `onboarding/qa-nine-pose/MANIFEST.json` produced by `onboarding/tools/core6-nine-pose-qa.py`; previous fixed extreme shifts hid intermediate-source alpha gaps. Six individual approved-art WebP nine-frame motion technical QA and six extended source-local underpaint PNGs cover the original visible pixel silhouette across 54 sampled frames. Still 0/18 final motion artist-approved assets and 0/36 hand-illustrated reactions, grip/semantic geometry remains OPEN. Do not load QA animation as production. Keep original six exact Visual IDs and 22 SHA.
