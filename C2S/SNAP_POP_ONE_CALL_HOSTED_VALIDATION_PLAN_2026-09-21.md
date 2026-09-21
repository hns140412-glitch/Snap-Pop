# SNAP & POP ONE-CALL HOSTED VALIDATION PLAN — 2026-09-21

## Locked target

Candidate SHA:
`a333e735f69b57164edc8440f7108e49a6ee8c7a`

Branch:
`taky/snap-pop-implementation-2026-09-20`

This plan is preparatory only.
It does NOT authorize an external call.

## External call budget

- Goal: hosted runtime validation of the exact frozen candidate.
- Budget: 1 external execution for this goal.
- Current used count: 0.
- Same call may not be repeated without materially new evidence/state transition or explicit override.

## Pre-call hard checks

All must remain true immediately before any external execution:

1. candidate SHA is still exactly `a333e735f69b57164edc8440f7108e49a6ee8c7a`;
2. no code/runtime file after candidate SHA is substituted into the build;
3. local branch closure remains PASS;
4. no merge is required for the hosted validation route;
5. no production alias/domain change is included;
6. no destructive setting/configuration change is included;
7. external action has explicit Human Approval;
8. no prior external execution has consumed the one-call budget.

Any mismatch => HOLD / NO CALL.

## Hosted execution scope

The single allowed external execution, once explicitly approved, is limited to:
- exact frozen candidate artifact/source;
- temporary/controlled hosted runtime validation only;
- no main merge;
- no production promotion beyond what is technically inseparable from the approved validation surface;
- no repeated deploy/poll loop.

## Runtime acceptance checks

Hosted result may be called PASS only when evidence supports all applicable items:

### A. App shell
- page loads without fatal JS error;
- writing-first default surface remains the default;
- Imagination Cloud remains hidden/on-demand;
- current draft is not lost when cloud opens/closes.

### B. Semantic writing boundary
- one draft / one next move remains intact;
- malformed provider result does not ghostwrite/rewrite final draft;
- no multi-question pressure regression.

### C. Knowledge / Truth Guard
- ASK factual path reaches same-origin knowledge endpoint;
- no browser OpenAI key is exposed;
- factual answer remains unverified unless citation/source coverage satisfies the P2 contract;
- partial coverage cannot show full verified state;
- source links, when present, are bounded and clickable.

### D. P3 scaffold / mental model
- question lens renders without changing factual content;
- structural FLOW/COMPARE is suppressed for insufficient/partial evidence;
- follow-up is hidden by default;
- WRITING_FLOW does not offer an automatic follow-up.

### E. Exploration Crew ownership
- child-facing response owner is Exploration Crew;
- provider/model/system identity is not shown;
- provider provenance may remain internal only;
- self-identity leakage fails closed.

### F. Voice boundary
- no microphone starts automatically;
- HOME_RADIO does not auto-listen;
- only explicit USER_MIC starts STT;
- autoRead does not expose hidden hint;
- no direct app TTS bypass outside SnapPopVoice.

## Result classifications

Allowed result labels:
- HOSTED_RUNTIME_PASS
- HOSTED_RUNTIME_PARTIAL
- HOSTED_RUNTIME_FAIL
- HOSTED_RUNTIME_BLOCKED

Never infer:
- DEVICE_VERIFIED
- REALTIME_VOICE_VERIFIED
- RELEASE_PASS
- PRODUCTION_READY

from hosted browser evidence alone.

## Failure / rollback rules

If the single hosted execution fails:

1. do not repeat the same external call automatically;
2. classify cause first:
   - build/config
   - route/function
   - auth/env
   - browser runtime
   - OpenAI upstream
   - host platform
   - unknown;
3. preserve evidence from the failed call;
4. return to branch/local repair;
5. create a new candidate SHA if runtime code/config changes;
6. rerun branch closure;
7. a second external execution requires:
   - materially new evidence or new frozen candidate;
   - remaining/renewed call authority;
   - explicit approval if required by TAKY.

## No-poll rule

After the external execution:
- do not enter repeated status polling;
- one bounded result readback may be part of the approved execution when technically necessary;
- repeated unchanged-state polling is prohibited.

## Success boundary

Even if hosted runtime passes:
- merge remains separate;
- production release remains separate;
- device verification remains separate;
- realtime voice remains separate;
- human approval requirements remain active.

Current state:
`PLAN_READY / EXTERNAL_ACTION_NOT_AUTHORIZED`
