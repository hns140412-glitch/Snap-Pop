탐험가의 아이디어 노트 V10 UI 개선판

주요 변경
- iPhone safe-area 상단 여백 강화: 상태바/프로필 HUD 겹침 완화
- 하단 탭 이모지 제거: 지도/기록/보석함/성장 전용 벡터 일러스트 아이콘 적용
- 하단 설정 탭 제거: 우측 상단 메뉴에서 설정 접근, 하단에는 성장 지도 배치
- 레벨 명칭/타이포그래피 정리 및 RPG 성장 지도형 목록 강화
- 설정 화면 레이아웃 재구성: 아이콘/제목/설명/상태를 고정 그리드로 정렬
- 전체 비주얼 밝기 상향: 밝은 청록/크림/황금 계열로 통일
- 보석함 카드/최근 획득 영역 선명도 개선
- PWA theme/background 색상 밝게 변경
- 기존 카메라/필터/Google Calendar/기록 기능 유지

GitHub Desktop 적용
1) 이 ZIP의 모든 파일을 Snap-Pop 로컬 저장소 루트에 덮어쓰기
2) GitHub Desktop > Changes 확인
3) Summary: V10 premium UI polish
4) Commit to main
5) Push origin
6) Netlify 자동 배포 후 기존 PWA를 완전히 종료했다가 다시 실행

주의
- service worker 캐시가 남으면 Safari에서 한 번 새로고침 후 홈 화면 앱 재실행
