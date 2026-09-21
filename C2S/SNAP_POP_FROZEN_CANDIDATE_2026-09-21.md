# SNAP & POP FROZEN CANDIDATE — 2026-09-21

## Candidate lock

Frozen candidate SHA:
`a333e735f69b57164edc8440f7108e49a6ee8c7a`

Branch:
`taky/snap-pop-implementation-2026-09-20`

Scope:
- branch-only implementation candidate;
- no deploy;
- no merge;
- no Netlify call;
- no device-verification claim.

Any later documentation/handoff commit is NOT part of this candidate unless a new candidate is explicitly declared.

## Why this SHA is frozen

Before freeze:
- P1-P5 individual branch validators had passed in isolated execution;
- P6 integrated pipeline regression passed 19/19;
- P6 app boundary static checks passed 10/10;
- stale-pattern sweep found no active runtime residue for:
  - `verified !== false`
  - `autoVoice`
  - provider label in child-facing Cloud History
  - direct app browser-TTS bypass
  - old verified-flow label
  - raw system/model metadata pass-through.

At exact candidate SHA:
- closure runner file exists;
- required candidate validator/runtime file set confirmed;
- exact-SHA cross-layer execution passed 15/15:
  1. full factual answer stays verified
  2. verified cause-flow can build
  3. fully verified global answer can expose one optional follow-up
  4. presentation owner is Exploration Crew
  5. provider-owned title is replaced
  6. guarded answer is voice-safe
  7. partial factual answer remains unverified
  8. partial answer cannot build structural flow
  9. partial answer suppresses follow-up
  10. presentation cannot upgrade partial truth
  11. THINK history is NOT_APPLICABLE / verified=null
  12. app has no verified!==false residue
  13. app has no autoVoice residue
  14. app has exactly two USER_MIC listen entry points
  15. provider label is not shown in child-facing Cloud History

## Repeatable validator path

Added at candidate SHA:
`scripts/validate-branch-closure.mjs`

It sequentially invokes 14 closure validators using Node standard library only.

Important distinction:
- the unified runner itself has not been executed through GitHub CI because the repository currently has no attached workflow/status checks;
- no new GitHub Actions workflow was created;
- exact-SHA cross-layer execution and prior individual isolated executions provide the current branch-only evidence.

## Candidate classification

`FROZEN_CANDIDATE_BRANCH_ONLY`

This means:
- candidate code SHA is locked;
- subsequent code changes require a new candidate SHA;
- documentation-only commits may continue outside the candidate;
- external-resource gate is still required before any Netlify/hosting call.

## Still NOT verified

- GitHub CI: NONE
- live browser → server route: NOT_RUN
- live OpenAI search runtime: NOT_RUN
- browser/device TTS/STT: NOT_RUN
- external realtime voice: OPEN / NOT_RUN
- DEVICE_VERIFIED: NOT_RUN

## Next gate

Run TAKY external-resource gate against this exact candidate SHA.

Only if that gate passes may one controlled external runtime verification be considered.

No deployment or merge is authorized by this document alone.
