# 탐험가의 아이디어 노트 — GitHub Pages PWA

이 저장소는 정적 PWA 테스트용입니다.

## 배포
`Settings → Pages → Deploy from a branch → main → /(root)` 로 설정합니다.

## 실행 주소
`https://<GitHub사용자명>.github.io/<저장소명>/`

## PWA
- `manifest.webmanifest`
- `sw.js`
- `.nojekyll`
- 상대경로 기반 assets

## Google OAuth
Authorized JavaScript origins에는 `https://<GitHub사용자명>.github.io` 를 등록합니다.
