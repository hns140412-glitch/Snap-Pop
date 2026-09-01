탐험가의 아이디어 노트 v4.0 — Netlify 배포본

[포함 기능]
- 첫 시안 기반 모바일 탐험지도 UI
- 이름 등록 / 5개 글쓰기 탐험지 / 3단계 질문
- 질문당 +5 EXP, 탐험 완료 +40 EXP (총 +55 EXP)
- 5종 보석 수집
- 총 25레벨: 글린이 → 글 탐험가 → 이야기 수집가 → 작가 → 대작가
- 레벨별 지도 지역 해금: Lv.1 / 6 / 11 / 16 / 21
- 기록 목록 / 달력 / 기록 상세 / JSON 백업
- Google Calendar OAuth 2.0 실제 일정 저장
- PWA manifest + service worker

[Netlify]
1) 이 폴더 전체 또는 ZIP을 Netlify 수동 배포(Deploy manually)에 올립니다.
2) 배포 후 주소 예: https://my-idea-expedition.netlify.app
3) 가능하면 Site configuration > Domain management에서 원하는 site name을 먼저 확정합니다.

[Google Cloud Console]
OAuth Client ID: 657919711099-nba747fem5s7do5cn77iqt88h9q9v08q.apps.googleusercontent.com

A. APIs & Services > Library 에서 Google Calendar API 활성화
B. Google Auth Platform > Branding 에서 앱 이름/지원 이메일 설정
C. Google Auth Platform > Audience
   - 개인 Gmail 계정을 쓰면 External
   - Testing 상태라면 실제 사용할 부모/아이 Google 계정을 Test users에 추가
D. Google Auth Platform > Data Access
   - Calendar event 생성 권한(scope): https://www.googleapis.com/auth/calendar.events
E. Google Auth Platform > Clients > 해당 Web application OAuth client
   Authorized JavaScript origins 에 다음을 추가:
   - https://YOUR-SITE-NAME.netlify.app
   - (커스텀 도메인 사용 시) https://yourdomain.com
   - 로컬 테스트가 필요하면 http://localhost:8000

이 앱은 브라우저 토큰 방식(Google Identity Services)을 사용하므로 Redirect URI는 사용하지 않습니다.
주소에는 마지막 / 를 넣지 마세요. 경로(/index.html 등)도 넣지 않고 origin만 입력합니다.

[중요]
- OAuth Client Secret은 이 폴더에 넣지 마세요.
- config.js의 Client ID는 브라우저용 식별자라 공개되어도 됩니다.
- Netlify deploy preview의 임시 주소는 매번 달라질 수 있으므로 고정된 production URL을 Authorized JavaScript origins에 등록하는 것이 좋습니다.


[v4.0 UI/안정성 보강]
- 첨부 시안 기준 고전 탐험 그림책 스타일 강화
- Song Myung(제목) + Gowun Dodum(본문) 웹폰트 적용, 실패 시 시스템 한글 폰트 fallback
- 탐험지도 SVG 디테일/지형/강/산/동굴/캠프/등대/배 효과 강화
- 플랫폼별 이모지 차이를 줄이기 위해 주요 주제/질문 아이콘을 자체 SVG 일러스트로 교체
- 보석 facet/광택/받침대 개선
- 마무리 캠프 완성 보석 중복 지급 수정
- 저장 데이터 파싱 안정성 및 공유 이미지 blob 오류 처리 보강

[검증]
- node --check app.js / sw.js 통과
- HTML inline handler ↔ JS 함수 연결 확인
- JS getElementById ↔ HTML ID 연결 확인
- 이름 등록 → 질문 3단계 → 완료 → EXP 55 → 보석 1개 → 기록 1개 런타임 모의 테스트 통과
- Lv.21 마무리 캠프에서 violet 보석 1개 지급 테스트 통과
