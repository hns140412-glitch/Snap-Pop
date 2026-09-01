탐험가의 아이디어 노트 - Windows 실행판

가장 쉬운 실행 방법
1) ZIP 파일을 '모두 압축 풀기'로 먼저 풀어주세요.
2) START_WINDOWS.bat 을 더블클릭하세요.
3) 자동으로 로컬 서버가 켜지고 앱 창이 열립니다.
4) 종료할 때 STOP_WINDOWS.bat 을 더블클릭하세요.

더 깔끔한 실행
- START_WINDOWS_SILENT.vbs 를 더블클릭하면 검은 콘솔창 없이 실행됩니다.

특징
- Python 필요 없음
- Node.js 필요 없음
- Windows 기본 PowerShell 사용
- 8000번 포트가 사용 중이면 8001~8010 중 빈 포트를 자동 사용
- Microsoft Edge가 있으면 '앱 창' 형태로 열고, 없으면 기본 브라우저로 실행
- localhost 방식이라 카메라 테스트 가능
- index.html 직접 더블클릭(file://)보다 권장

문제가 있을 때
- Windows SmartScreen 경고가 뜨면 ZIP 안에서 직접 실행하지 말고 먼저 압축을 완전히 풀어주세요.
- 회사/학교 PC처럼 PowerShell 실행이 정책으로 차단된 환경에서는 관리자 정책에 따라 실행이 제한될 수 있습니다.
