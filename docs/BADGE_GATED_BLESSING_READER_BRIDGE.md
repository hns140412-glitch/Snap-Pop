# Snap & Pop — Badge-gated Blessing Reader Bridge

Status: DRAFT integration seam / no deployment.

- Blessings never unlock from browser flags, telemetry, EXP, gems, candidate reviews or the inactive 60-badge working catalog.
- The browser bridge accepts only `TAKY_AUTHENTICATED_BADGE_READ_ADAPTER_V1` with both:
  - `getProgress({badge_id})` → verified `TAKY_FAMILY_BADGE_READ_V1` projection from the signed Award Ledger.
  - `getApprovedBindings({badge_ids})` → `TAKY_APPROVED_BADGE_GATE_BINDINGS_V1`, produced by a trusted server from the approved active badge catalog.
- Missing adapter, read error, child mismatch, mixed family scope, incomplete binding list, unapproved/inactive badge, or no verified award all fail closed.
- `child_id` handed through Snap's app bridge is display/scope hygiene only; it is not authorization. The server reader must derive the authenticated child/family from its trusted session.
- Current Ready PR #112 and TAKY badge audit still state that the real production Badge Reader endpoint/backend is not connected. Therefore the live default is LOCKED until that server composition exists.

This file does not activate any draft badge, create awards, merge main, or deploy.
