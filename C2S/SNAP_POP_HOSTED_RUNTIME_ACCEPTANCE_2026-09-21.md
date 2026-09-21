# SNAP & POP HOSTED RUNTIME VALIDATION ACCEPTANCE — 2026-09-21

## Candidate lock

- frozen candidate SHA: `aadf62a087a9c922b8b15f3436eb8a23fc5d8f67`
- branch: `taky/snap-pop-implementation-2026-09-20`
- exact-SHA branch closure: 43/43 PASS
- this document does not authorize an external call

## Single-call objective

Use exactly one hosted validation attempt only after explicit Human Approval.

The hosted attempt must validate the frozen candidate only. Any code/config change before the hosted attempt supersedes the candidate and requires a new 43/43 exact-SHA pass.

## Acceptance criteria

The hosted runtime PASS requires all of the following:

1. App boot
- initial app shell loads without fatal JS error
- IndexedDB/local-first initialization completes
- required runtime scripts load in dependency order

2. Core writing flow
- map → exploration → draft → next step → finish works
- child draft remains the authored source
- no ghostwritten full draft or auto-answer injection occurs

3. Imagination Cloud
- hidden/on-demand entry works
- ASK_UNDERSTAND verified result displays through crew presentation guard
- THINK_EXPRESS remains NOT_APPLICABLE for factual verification
- return integrity restores the same session/landmark/step/language and preserves newer draft

4. Badge evidence
- HELP_REQUEST / WRITING_EXPLORATION / EXTRA_TASK / RETRY still record
- ERROR_DISCOVERY requires explicit child-marked self-correction
- DEEP_THINKING requires explicit child reflection artifact
- SPECIAL_BEHAVIOR requires declared special feature action
- no time/idle/retry-count/score/AI-inference shortcut fires

5. Badge visual / Theme Expression
- Profile Character identity remains stable
- Theme Expression stays cosmetic-only
- unresolved theme assets remain explicitly unresolved
- no badge award is created from preview rendering

6. Crew / guest
- SPECIAL role has no power/reward advantage
- guest appearance occurs only through explicit appearance authorization
- main companion continuity remains intact

7. Voice
- no always-listening behavior
- one-shot user mic path only
- voice failure does not block text input

8. Truth / source boundary
- unsupported factual claims are not marked verified
- cited source URLs must belong to retrieved evidence
- etymology FULL_FACTUAL_CONTENT requires distinct-source diversity

## Immediate FAIL conditions

Stop after the single attempt and do not repeat the same hosted call if any of these occurs:
- deployment/hosting auth or quota failure
- candidate SHA mismatch
- fatal boot error
- script-order/runtime dependency failure
- OpenAI/provider boundary failure
- production-only environment variable missing
- redirect/hosting route misconfiguration

Classify the failure first, then choose a different route. Do not retry identical conditions.

## Non-pass outcomes

- INFRA_BLOCKED: host/auth/quota/network issue; candidate remains frozen, runtime remains unverified
- CONFIG_BLOCKED: environment/config issue; fix config on branch, re-run 43/43, create new frozen candidate
- CODE_RUNTIME_FAIL: runtime defect; fix code on branch, re-run 43/43, create new frozen candidate
- PROVIDER_BLOCKED: provider/API boundary issue; candidate remains unverified until provider path is resolved
- PASS: hosted runtime verified for the tested acceptance scope only

## What PASS does not mean

A hosted PASS does not automatically imply:
- DEVICE_VERIFIED
- production merge approval
- FAMILY_EXPANSION completion
- final theme asset approval
- full product completion

## Human approval boundary

External hosted validation is allowed only after an explicit approval that names the external action.
Generic continuation tokens such as `ㄱ` are not approval.
