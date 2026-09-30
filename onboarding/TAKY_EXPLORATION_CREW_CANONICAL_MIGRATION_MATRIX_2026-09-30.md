# TAKY Exploration Crew Canonical Migration Matrix
Date: 2026-09-30
Status: MIGRATED / CENTRAL CANONICAL ACTIVE
Source implementation: Snap-Pop Draft PR #10
Exact verified HEAD: 8ea7b985eaf792e866e4d21d174eaac824a23567
CI: Validate Snap & Pop = SUCCESS / Companion Onboarding Source/Asset Gate = SUCCESS

## 1. Migration target
Promote only the shared semantic/runtime contract from the verified PR implementation into central TAKY authority.
Do not promote Snap-specific UI, onboarding screens, release state, asset binaries, or project-only interaction details.

## 2. Central authority files currently relevant
- OS/GUIDE_FAMILY_LEARNING_OS.md
- OS/GUIDE_CHARACTER_RELATIONSHIP.md
- PROJECTS/GUIDE_CORE6_CHARACTER.md
- MASTER/SYSTEM_LAYER_OWNERSHIP_MAP.json
- MASTER/MASTER_LOGIC.md

## 3. Proposed shared canonical contract
EXPLORATION_CREW_CANONICAL_LOGIC
→ CHARACTER_BEHAVIOR_ENGINE
→ SEMANTIC_ACTION_COMMAND
→ ASSET_ENGINE
→ UI_RENDERER

Behavior Engine owns meaning only.
Asset Engine owns approved visual composition only.
Renderer owns rendering plan only.
No downstream layer may mutate relationship or affinity semantics.

## 4. Required Ambient contract
READ_BOOK / READ_MAP / WRITE_NOTE / CHECK_COMPASS /
ORGANIZE_BAG / USE_MAGNIFIER / USE_RADIO / REST

## 5. Required composable asset groups
MASTER_FULL / PROFILE / PUPPET_BODY / FACE_STATES /
ACTION_PARTS / PEEK_MASK / DEPTH_SHADOW

Shared equipment:
BOOK / MAP / NOTEBOOK / PEN / RADIO / MAGNIFIER / BAG / COMPASS

## 6. Safety contract
- approved source only
- Visual ID + source SHA + approval reference required
- missing part does not authorize new art
- no name/code-only generation
- no cross-character part substitution
- relation/affinity never selects unapproved visual
- asset availability never mutates relation/affinity
- safe fallback = same-character FIELD_NEUTRAL + neutral
- image generation remains outside runtime fallback

## 7. Gate contract
Behavior Gate:
valid semantic command, no asset fields.

Asset Gate:
Visual ID/source SHA/approval/part ownership/shared equipment verified.

Integration Gate:
semantic meaning preserved, relation/affinity unchanged,
renderer receives only approved composition, fallback creates no art.

## 8. Version contract
contract_version = CREW_PIPELINE_V1
manifest_version = CREW_COMPOSABLE_MANIFEST_V1
runtime_schema_version = CREW_RUNTIME_TRACE_V1

All three pointers must agree before implementation PASS.

## 9. Runtime trace minimum
- semantic_action_command
- selected_asset_composition
- fallback_reason
- renderer_result
- gate_verdicts
- relation_mutated=false
- affinity_mutated=false

## 10. Legacy migration
IDENTITY_BODY / PERSONALITY_PROP / THEME_GEAR +
OBSERVE / LISTEN / IDEA / REACT / WAIT / COMPLETE
= LEGACY_3_PLUS_6_ASSET_CONTRACT_HOLD_PENDING_COMPOSABLE_ASSET_MIGRATION

Rules:
- production authority = false
- regression only
- mass production forbidden
- do not delete until composable regression is proven

## 11. Ownership
Central TAKY:
shared semantics, ownership, contracts, gates.

Specialist asset pipeline:
production state, work queue, cutout/mask/art/QA progression.

TAKY-ASSETS:
approved binaries/results, immutable hashes, provenance, consumer pointers.

App runtime:
consume verified pointers; never manufacture missing art.

Snap/Ready/Hide:
project-specific presentation and behavior remain project-owned unless separately promoted.

## 12. Non-migration items
Do NOT centralize:
- Snap onboarding 11-screen flow
- Snap ROOT UI
- current Core6 art-production prototype details
- project release/Netlify state
- project-specific dialogue or scene composition
- unapproved character artwork

## 13. Current verdict
PR working implementation: PASS at exact HEAD 8ea7b985eaf792e866e4d21d174eaac824a23567.
Central Canonical write: MERGED TO TAKY MAIN at 55547a7c4c859a1aae700405fdba4a302a2c20d3 via PR #192; TAKY Enforcement Replay SUCCESS.
Snap main / ROOT / Netlify: HOLD.
Image generation: NOT PERFORMED.
