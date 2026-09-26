# SNAP CHILD BADGE RECORDS UI SHELL — 2026-09-26

## Placement and approved design boundaries
The existing Records tab receives one-screen switching for 탐험일지 / 배지 도감 / 캘린더, plus badge detail history. The exploration journal, gem wallet, completed tasks, approved world layout and existing native assets remain unchanged. No unapproved candidate badge art is substituted with generated badge artwork. Text-only placeholder/pin is permitted to explain data truthfully.

## Data authority
`snap-badge-records.js` is PRESENTATION ONLY. It intentionally ships without a working adapter or a fictional badge dataset. `connectReadAdapter` requires future server session-bound read capabilities:
- `getViewer()`: authenticated, verified Child with own family_id and child_id; fail-closed for Parent, local bootstrap and spoofed TEST_ONLY source.
- `getCollection()`: active, approved catalog items with server-owned earned state; never promote 60 historical working drafts or 20 learning-history discovery proposals.
- `getMonth({month})`: verified TAKY child-scoped `TAKY_CHILD_BADGE_CALENDAR_V1` (source signed Award Ledger).
- `getBadgeHistory({badge_id})`: authenticated TAKY `TAKY_FAMILY_BADGE_DETAIL_HISTORY_V1` with full first/reaward/promotion timeline.
All calls MUST derive viewer/member scope from the trusted server session, never from browser parameters. Client contract checks are defense-in-depth, not signature verification or proof that a forged in-page JavaScript adapter is authenticated. Browser tests use fake projections ONLY as test fixtures.

The calendar uses Asia/Seoul month grouping from the verified source, shows current dated awards, separates legacy undated award notices and never invents a date from earlier decision approved_at. Family praise and gem gifts are a separate signed journal lane in TAKY; a real explicitly authorized gift-history GET and visibility policy are still OPEN and not silently shown as Achievement rewards.

The viewer automatically drops transient private DOM on leaving the Records tab, hiding the page, or disconnect. No award history is saved to Snap's existing local IndexedDB, sessionStorage, or localStorage by this module. Service Worker now bypasses ALL /api/ GET requests via fetch-only, never stores them in a shared offline cache, and precaches only the public UI script.

## Outstanding live integration
Snap main does NOT currently provide a real trusted child login or Badge read API. Therefore default screen says "인증된 기록 연결 전" rather than showing zero or fake awards. Need a real authenticated identity/session route, child-scoped approved catalog, central Award Ledger source, asset approvals, and safe release/deploy gate before live binding. No Netlify deploy or actual user award mutation in this draft. Ready PR #111 separately adds optional Week/Day earned-badge traces, also unmerged.
