# SNAP & POP — NEW CHAT START — 2026-09-22

최신 TAKY 기준으로 Snap & Pop 대수술 후속 작업을 재개해.

## 1. Repository / branch
- repo: `hns140412-glitch/Snap-Pop`
- branch: `taky/snap-pop-implementation-2026-09-20`

반드시 branch를 live refresh한 뒤 시작한다.

## 2. Read first
아래 순서대로 읽는다.

1. `C2S/SNAP_POP_REWRITE_C2S_CLOSURE_2026-09-21.md`
2. `HANDOFF/SNAP_POP_REWRITE_HANDOFF_2026-09-21_LATEST.md`
3. `SNAP_POP_CURRENT_CANONICAL_2026-09-21.md`
4. `C2S/SNAP_POP_REWRITE_SURGERY_2026-09-21.md`
5. `data/snap-pop-requirement-matrix.json`
6. `VALIDATION/SNAP_POP_REWRITE_CLOSURE_LATEST.txt`
7. `wish-economy-controller.js`
8. `scripts/validate-knowledge-source-quality.mjs`

## 3. Latest validated checkpoint
Latest exact validated implementation SHA:
`8d16060012599d5d25a692a1f879f5e39e1e7cd2`

Evidence commit:
`581816834093b060cd6dd30e7fd8ae22eed7b1db`

Validation:
- `BRANCH_CLOSURE_VALIDATOR_PASS 71/71`
- `BROWSER_RUNTIME_CDP_PASS`
- viewport `390×844`
- `PWA_RELOAD_RECOVERY_PASS`
- `PWA_OFFLINE_SHELL_PASS`

Current matrix:
- CODED `80/80`
- STATIC_VERIFIED `80/80`
- RUNTIME_VERIFIED `69/80`
- DEVICE_VERIFIED `0/80`

Architecture rewrite: CLOSED.
Integrated UI structural rewrite: CLOSED.
Final visual/art direction: OPEN.

## 4. Critical canonical ownership
소원상점 / 축복 사용하기는 Snap & Pop 전용 기능이다.

Canonical owner:
`SNAP_POP_WISH_ECONOMY`

Dedicated code owner:
`wish-economy-controller.js`

Owns:
- gem rendering
- wish shop
- blessing confirmation
- exact 2 completed-gem spend
- `wishTransactions`
- `gemLedger`
- `GEM_SPENT`

`SP-GROWTH-002`는 legacy trace key일 뿐 Growth 소유가 아니다.

Ready & Set / Hide & Seek / TAKY는 Snap gem을 차감하거나 wish를 실행할 authority가 없다.

## 5. Important regressions already fixed
다시 만들지 말 것.

- `records-growth-controller.js` stale `html()` helper regression
- semantic analysis stale-result race
- stale-null → local fallback overwrite
- HOME_RADIO verified expression transition blocked by GLOBAL-only gate
- crew reunion runtime probe stale-main nondeterminism
- Imagination sequential request test race
- records/growth에 흩어져 있던 wish economy ownership

## 6. Current runtime-verified behavior
Browser evidence includes:
- child authorship + no auto-write
- WAIT → HINT_OFFER minimal intervention
- one draft continuity
- current-draft-sensitive one-next-move
- crew reaction grounded in child draft
- no final-answer authorship
- stale semantic result protection
- five writing lenses
- low-confidence Learning Context cannot force direction
- bilingual expression bridge preserves draft/authorship
- Imagination on-demand + return integrity
- verified/partial ASK→UNDERSTAND guard behavior
- verified optional expression transition; partial blocks it
- verified mental-model rendering; partial blocks structural flow
- voice speak/listen separation
- Home Radio → Imagination
- crew identity/name history / authorized guest / reunion / affinity
- Special skip no penalty
- record revision provenance
- cloud history + no reward farming
- badge fail-closed/evidence contracts
- Snap Wish Economy exact spend/ledger/transaction
- Family expansion runtime/isolation
- PWA IndexedDB reload recovery
- service-worker offline shell
- Live DOM 390×844 runtime

## 7. Knowledge source-quality hardening
Latest static closure includes:
- every factual sentence must have citation evidence;
- citation URL must belong to actual retrieved source set;
- community/social/forum-only evidence cannot reach FULL_FACTUAL_CONTENT;
- source evidence gets source-quality classification;
- etymology diversity counts eligible non-community hosts;
- etymology requires at least two eligible independent hosts for FULL_FACTUAL_CONTENT;
- do not add brittle hardcoded source whitelist as a substitute for live quality review.

## 8. Remaining runtime-open requirements: 11
### Cross-app only
- `SP-BRIDGE-001`
- `SP-BRIDGE-002`
- `SP-WRITE-007`
- `SP-WRITE-009`
- `SP-BADGE-003`

### Live provider / live knowledge
- `SP-UNIV-003`
- `SP-UNIV-004`
- `SP-UNIV-005`
- `SP-IMAGINE-004`
- `SP-TRUTH-002`
- `SP-WRITE-005`

Mocks alone must NOT flip these remaining items to runtimeVerified.

## 9. Scope / prohibitions
- Snap repo only unless the user explicitly expands scope.
- Do not modify Ready & Set / Hide & Seek repos.
- No Netlify deployment/production/main merge.
- No user-as-tester/debugger.
- DEVICE_VERIFIED remains false.
- Do not inflate implementation percentage from CODED alone.
- Preserve CODED / STATIC / RUNTIME / DEVICE separation.
- Final visual direction remains OPEN.
- Generic "ㄱ" means continue; it is not deploy/merge approval.

## 10. Next recommended work
1. live refresh branch and confirm exact-head evidence;
2. reconcile latest docs-only commits against validated code SHA;
3. review the remaining 11 without fake runtime closure;
4. for Snap-only work, harden live-provider readiness / source-quality / fail-closed boundaries without external deployment;
5. if cross-app runtime becomes scope, first obtain explicit scope change and then validate contracts without transferring ownership;
6. keep Wish Economy Snap-owned throughout.

Always report:
- 전체 구현율/evidence index;
- architecture surgery state;
- integrated UI rewrite state;
- CODED / STATIC / RUNTIME / DEVICE counts.
