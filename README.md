# Snap & Pop REV_06 — Asset Integrated PWA

이 패키지는 확정 시안과 REV_06 MASTER를 기반으로 제작한 모바일 웹앱/PWA 배포 베이스라인입니다.

## 포함
- 초고밀도 일러스트 분할 에셋
- ORIGINAL 홈/랜드마크 선택
- 3단계 탐험
- IndexedDB 중단/복귀
- 보석 조각 기록
- 성장나무 레벨 연동
- 탐험가의 소원 상점 / 소원 사용하기 / 축복 사용하기
- 설정
- 5개 고정 하단 탭
- manifest / service worker / PWA icons
- GitHub Pages `.nojekyll`
- Netlify `_headers`
- MASTER 및 Self-Validation 문서

## 배포
### GitHub Pages
저장소 루트에 ZIP 내용을 풀어 업로드 → Settings → Pages → main/root.

### Netlify
ZIP을 풀어 폴더 전체를 배포하거나 drag & drop deploy.

## 중요한 범위
현재 패키지는 정적 PWA + 로컬 IndexedDB 데이터 기준으로 동작합니다.
Google Calendar, 실제 Character Master 생성, 가족 멀티프로필 동기화는 외부 인증/백엔드 연결이 필요한 후속 배포 Gate입니다.
