# Companion Onboarding — isolated integration candidate (DRAFT / HOLD)

## Exact scope and approval boundary
- The existing Snap & Pop root home, learning session, runtime crew registry and release state are unchanged. This is an additive `onboarding/` route candidate, **not integrated into the production navigation**.
- The exact source in this candidate is `onboarding/index.html`; the SHA-256 authority is `asset-and-release-gate.json` (`af3909b1b2ef25754fcbf61cead4167e83ad20c4670551adf69b776998c9389e`). Earlier 0d4136..., 8a645... and 5402... hashes and the old missing-binary handoff are historical, not current.
- All 22 original files remain byte-identically registered in the PR. The current automated source/asset/Core6/primary checks must be read at the exact PR HEAD. Browser-render checks are separate from pixel-approved 11-screen matching, HTTPS-origin persistence and real iPhone sign-off.
- `crew-scope-contract.json` keeps the six approved onboarding originals and immutable identifiers `dubi/lori/ink/nova/take/zero`, selected-crew 5–6, and an independently chosen primary companion **separate**. The explicit primary selection is coded on the existing step-2 approved composite as a separate functional phase, storing `primaryCompanionId`. No member is silently defaulted; the new overlay remains visual-approval OPEN.
- Unselected Core 6 remain known friends. Do not claim Expansion 12, a full 20-character roster or Special Guest release based on these six images. The historical 20 ceiling and later 18+Special design are a documented unresolved conflict, not an automatic new count.
- The Snap-origin Exploration Crew rule source is preserved. The development-branch JSON's TAKY shared semantic-owner pointer is not present as a verified central canonical file in TAKY main at the inspected revision; therefore ownership transfer stays P0 HOLD. TAKY governs integration, Learning App Family governs handoff, and app-specific visual/runtime decisions stay scoped to their relevant owner.
- Approval for use of originals in **this standalone onboarding** does not grant automatic approval to the Snap ROOT Crew runtime registry or a Ready/Hide UI. That separate owner-scoped reviewed-binding gate remains authoritative and no cross-app lookalikes are substituted.

## Current verification
- Run `node onboarding/tests/asset-integrity.cjs` for source + exact bytes of 22 originals and the isolated Crew-state runtime script.
- Run `node onboarding/tests/crew-contract.cjs` for Core 6 names/IDs, 13 image references, original-scene hotspot/selection contract, separate primary state and non-promotion/ownership/roster gates. Run `node onboarding/tests/crew-state-runtime.cjs` for immutable Core 6 ID, first-meeting idempotence, name/history preservation, evidence deduplication, no automatic affinity and no cross-app authority. Run `node onboarding/tests/primary-selection.cjs` for chosen-member → primary → local rename → persistence/reload → invalid-draft/reselection regression.
- The standalone candidate now has served HTTP Chromium journeys at 375×667, 390×844, 430×932 and 1024×768. They cover 11 steps, loaded original scene, 5-member gate, explicit primary, HOME, local rename and browser reload. The test waits for actual image loading and requires eight candidate screenshots (crew + HOME for each size). The capture archive is render evidence, NOT reference-to-render approval, HTTPS/secure-origin IndexedDB reload or physical iPhone/Safari proof.
- Approved first-meeting scene is currently a composite with hit areas. Other screens, especially HOME/profile/packing/naming, have **OPEN** 1:1 comparison and must reuse approved originals/layers rather than become generic cards.
- Actual child-photo source registration in IndexedDB is not a photo-derived Visual ID/avatar generation pipeline.
- No new exploratory character creation until the current Core 6 rules and functional runtime gates have been implemented and verified. No main merge / Netlify / deployment before exact source+asset, visual, secure-origin persistence, real-device, TAKY and human-approval gates.

## Source-priority correction
Current exact evidence > older handoff statement. Never reactivate the previous binary-upload failure, copy the old 0d4136... source into this PR, equate the full 22 asset registration with Snap ROOT Crew approval, or quietly choose 18/20 as current implemented character count.

Previous local drafts with an already-reached first-meeting step but no ledger are migrated as LEGACY_DRAFT_STEP_REACHED_TIME_UNKNOWN. Rename and primary continuity work without inventing a first-met timestamp. Core 6 local-first ledger is now attached to isolated onboarding only. It preserves immutable IDs, first/current names, rename history, first meeting and primary transition history. It does NOT award affinity, alter rewards, invent shared experiences or send child data across apps; Snap-local task-result candidates require explicit provenance and a separate owner verification before shared promotion. Profile editing in HOME Crew tab is functionally coded; its approved pixel match and Safari/HTTPS persistence remain OPEN.

Status: **CORE6 CODED / CI CHECKS; LOCAL HTTP CHROMIUM BROWSER JOURNEY AND EIGHT-CAPTURE GATE; VISUAL 1:1 / SECURE HTTPS / SAFARI DEVICE / CROSS-APP INTEGRATION OPEN; DRAFT / DO NOT MERGE / NO DEPLOY**.

## 2026-09-29 responsive visual QA continuation
- Inspected eight actual screenshots on `ada56ef`: 1024×768 HOME words and buttons vertically broke because global tablet `.content` width 480px was narrowed again to 41%; 375×667 HOME had an oversized cream card masking the illustrated island. Functionality PASS was not visual PASS.
- New isolated candidate scopes HOME parent to full viewport, enforces tablet drawer width through browser geometry assertions, and tests scene-colored lower overlay in place of the cream floating card with **unchanged approved artwork**. The lower overlay is a correction candidate only.
- Browser CI must collect 12 states (11 stages plus distinct primary choice) × 4 viewports = exactly 48 candidate renders. See `visual-review-current.json`; capture ≠ approved screen parity. The old eight screenshot artifact is historical, not the new gate.

- Follow-up from direct 48-image review: 375×667 crew-change CTA was clipped by the 45dvh drawer. Short-phone layout now preserves that action in-view without internal scrolling; CI checks the actual button rectangle is inside the drawer and above the bottom navigation at all four viewports. Requires new exact-head CI and screenshot confirmation.

## CI-only genuine HTTPS origin probe
- The temporary `127.0.0.1:4174` self-signed TLS server exercises secure-context WebCrypto, IndexedDB image-blob SHA-256, reload/persistent original preview, explicit clearing and zero outbound requests using a **non-child JPEG fixture**. It is not Netlify/deployment, physical iPhone/Safari verification or child-photo-to-avatar generation. Never treat the self-signed loopback as a public trusted origin.

## Latest exact-head QA outcome (2026-09-29)
- `47ae7be` asset/Core6 gate and full Snap/browser gate SUCCESS: 12 state renders × 4 viewports = 48. All HOME controls were verified to fit, with no inner drawer scroll at all four tested viewport sizes.
- Temporary localhost HTTPS CI test SUCCESS using a non-child JPEG fixture: WebCrypto and stored IndexedDB blob digest, reload, preview, clearing, zero outbound network requests. This is a secure-origin technical check only; Safari/iPhone, public trusted TLS, approved avatar generation, family-scoped integration and 11-screen 1:1 visual parity remain OPEN.
- The exact served-browser and secure-origin run links are in `HANDOFF_LATEST.md`; never label all-product release complete from these checks.

## Core 6 behavior projection: isolated and sourced
- `crew-behavior-runtime.js` uses only the six recovered original signature lines from Snap development master (`d9f48f9`) and scene reactions from that development branch's rules. It is a read-only, explicit-primary-only projection, with no automatic question answering, score, reward, affinity, cross-app promotion, unconsented voice, or additional member creation.
- HOME `오늘` reuses its existing caption for the currently chosen primary's short recovered signature. Pure scene previews are defined but are NOT connected to a learning session/voice engine until relevant owner approval. A main switch changes caption without changing immutable character ID, relationship history, or current name. The approved first-meeting original is untouched. Per-screen pixel comparison remains OPEN.
