# Snap & Pop Sync Boundary

Authority: TAKY `TAKY_SYNC_CONTRACT_V1.md`.

Snap & Pop must preserve connected-session and expression evidence while applying the shared TAKY sync rules:
- local persistence is cache/queue only unless an app-specific canonical contract explicitly says otherwise;
- stable record identity is mandatory;
- conflict detection uses version/time plus canonical fingerprint where available;
- direct authorized canonical edits win over stale cached values;
- conflicted offline mutations must never silently overwrite newer canonical data;
- successful writes require canonical readback verification.

Snap-specific context that must survive sync:
`session_id / goal_id / task_id / lap_id / return_target / expression_result_id`.

No deployment state is implied by this contract.
