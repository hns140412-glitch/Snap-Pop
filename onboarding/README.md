# Companion Onboarding — integration candidate (not runtime/release)

## Authority and boundaries
- Exact Snap & Pop main base: `3de97be0d12dd6244a942b0c137c2efe578a43b6`.
- `onboarding/index.html` is now synchronized to the locally tested source SHA-256 `0d41363de67717c0a939df1de1492551350ef7f230472ef4bc62cb82a8d05f7b`; this branch does NOT hook it into Snap's home, router, nav or learning session.
- `asset-and-release-gate.json` records all 22 source images/cutouts/props and immutable SHA-256 checksums. These binaries are present in the locally tested artifact, NOT yet uploaded to this branch. Never present this branch URL as a working web preview while they are absent.
- `node onboarding/tests/asset-integrity.cjs` fails closed on missing or different bytes; even a technical PASS must not be called visual/release PASS.

## Actual QA evidence, performed against the complete local source
- Chromium simulated viewport: 375×667, 390×844, 430×932 and 1024×768.
- Complete 11-step navigation, five-member selection gate, all five HOME tabs and edit-return flows: PASS; JavaScript page errors: none.
- HOME now exposes four functional location pins on the default mobile map (camp, jungle/waterfall, beach, harbor). Tapping a pin opens the corresponding map detail; tested across all four simulated viewport sizes.
- Camp discovery/naming uses a crop of the existing approved island instead of a newly generated illustration.
- Test method: page.set_content with local asset-routing. This is NOT a genuine served HTTPS origin / IndexedDB-reload / physical iPhone/Safari test.
- Visual gate: approved first meeting source is linked as a fixed composite and hotspot overlay; remaining scenes, especially HOME, are NOT pixel-matched. Current generic panel styling is still BELOW approved visual target.

## Branch CI status
- Existing Snap & Pop validation: previously passed for this PR.
- New asset-integrity gate: **FAIL / EXPECTED while 22 original binary assets remain absent from remote branch**. The local package is complete; do not describe the remote branch as runnable.
- Source checksum in the remote manifest has been corrected to match the exact tested source.

## MAIN promotion prerequisites
1. Transfer the approved binary assets with exact source SHA-256; verify tests PASS.
2. Compare mobile screens one-by-one with approved visuals and correct mismatches (not create substitute artwork).
3. Secure-origin browser persistence/reload, regression, exact HEAD, CI and physical device as applicable.
4. TAKY review and explicit human approval. Main and Netlify remain unchanged by this candidate.

Status: `DRAFT / DO NOT MERGE / NO DEPLOY`.
