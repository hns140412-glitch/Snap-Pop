# SNAP & POP — Full Implementation Audit

Date: 2026-09-21
Branch: `taky/snap-pop-implementation-2026-09-20`
Scope: ORIGINAL + Guide-derived exploration crew rules + crew runtime + connected-app bridge + PWA/data + visual/runtime + optional expansion packs
Governance: TAKY / C2S
Release boundary: no merge / no deploy / no Netlify

## 0. Audit correction

This audit does **not** use Core 6 personality work as the center of the project.

Core 6 is a **provisional reference set** only.

The project-wide behavioral baseline is the recovered **Guide / 길잡이 rule system**, migrated into official terminology:
- 탐험가
- 탐험대
- 탐험대원
- 탐험대 규칙

The implementation target is **Snap & Pop as a whole**.

## 1. Authority stack for this audit

1. latest direct user correction;
2. TAKY governance / C2S;
3. `Snap_Pop_UI_MASTER_LOGIC_REV_12.md`
4. inherited REV_11;
5. inherited REV_10 detailed baseline;
6. `SNAP_EXPLORATION_CREW_MASTER_2026-09-20.md`;
7. `data/exploration-crew-rules.json`;
8. actual branch code/assets/runtime data;
9. historical Handoff/IDEA recovery material as evidence only.

## 2. Key fragmentation finding

Snap & Pop currently has several simultaneous truth surfaces:
- REV_10: detailed ORIGINAL + FAMILY EXPANSION baseline;
- REV_11: thought-to-expression / English / Growth Chapters / Imagination Cloud / connected-app expansion;
- REV_12: corrections + runtime bridge release gate + expansion conflict register;
- exploration crew MASTER;
- exploration crew JSON;
- C2S ledgers;
- actual `app.js`;
- `snap-bridge.js`;
- data JSON;
- old FUNCTION_STATUS / QA docs.

This is a structural fragmentation issue. A feature appearing in a MASTER is not proof it is implemented, and a feature appearing in `app.js` is not proof it is currently canonical.

## 3. Guide-derived rule baseline — project-wide standard

The recovered Guide lineage is used as an **overall operating/interaction standard**, not merely a character-personality source.

### A. Role / authorship
- child/explorer owns the thought and final expression;
- crew member never writes the final answer in place of the child;
- crew is companion/helper, not teacher/grader/system voice.

### B. Intervention ladder
- observe/wait first;
- respond to what the child actually gave;
- one small hint at a time;
- do not over-question;
- do not complete the expression for the child.

### C. Tone
- clarity and kindness before cleverness;
- humor is allowed;
- never make the child's weakness/error the joke;
- crew-to-crew chemistry may carry humor.

### D. Presence / UI
- no persistent large dialogue bubble blocking exploration/input;
- crew reactions are contextual and brief;
- world/landmark remains visually primary.

### E. Main / Guest orchestration
- main companion continuity;
- additional crew appearance may consider recent frequency and current state/mood;
- no functional/power advantage from character choice.

### F. Relationship / memory
- relationship reflects shared experience, not usage farming;
- no affinity decay merely because of absence;
- relationship changes expression/gesture/greeting/nickname/memory, not learning power;
- identity, name history, shared events and memories bind to stable Explorer_ID.

### G. World behavior
- crew members exist in the world outside the current screen;
- temporary absence/return/dispatch/hub state may be expressed as story;
- full daily simulation is not required;
- system logic should remain behind world-language.

### H. Voice / accessibility
- listening and speaking are distinct;
- radio/voice is a shared input/connection layer, not a sixth writing tool;
- voice must preserve child authorship.

### I. Special encounters
- special means the meeting method is special, not stronger ability;
- optional; no miss penalty, no streak loss, no farming pressure.

These rules are broader than the Core 6 and remain valid even if the provisional six-member roster changes.

## 4. Implementation matrix

Scoring is feature-weighted, not line-count based.
`CODED` means implementation exists in current branch code/data.
It does **not** mean runtime/device verification.

| Domain | Weight | Current CODED estimate | Evidence / gap |
|---|---:|---:|---|
| ORIGINAL five-place / 3-step exploration core | 20 | 17/20 | 5 landmarks in data, 3-step render, answer persistence, completion path present. Question depth still relatively fixed/template-driven. |
| Guide-derived interaction rules | 15 | 9/15 | Comprehensive JSON contract; one-hint behavior and contextual reactions exist. Many rules remain policy/data rather than executable enforcement. |
| Exploration crew runtime | 15 | 10/15 | crewRegistry, selection, rename/nameHistory, affinity, world state, reactions, special/world/start roles exist. Full 20-person content/encounter implementation remains incomplete/open. |
| Records / gem / wish / blessing / growth | 10 | 8/10 | records, revisions, gem flow, wish history, single tree, timeline present. Approved final asset/state and some long-term semantics remain incomplete. |
| Special exploration / Imagination Cloud / voice | 10 | 7/10 | special invite/save, cloud UI logic, TTS/STT fallback implemented. Production-grade speech/device permission and richer adaptive behavior unverified. |
| Ready & Set / Hide & Seek bridge | 10 | 7/10 | `snap-bridge.js` carries session/task/lap/return/event context. Latest real app-switch/device behavior remains unverified. |
| PWA / local data / offline | 5 | 4/5 | manifest, service worker, IndexedDB, offline shell/static validation present. Latest real-device install/offline regression unverified. |
| UI / asset / Golden-reference fidelity | 5 | 2.5/5 | live DOM UI and assets exist; preview images exist. Hosted/current runtime visual regression was explicitly not completed in existing docs. |
| FAMILY / optional expansion pack | 10 | 0.5/10 | REV10/12 define expansion, but current app/index/rules contain no FAMILY_EXPANSION feature-flag/runtime implementation. |

### Current weighted CODED estimate

**65 / 100**

This is the provisional full-product coded implementation rate **when expansion packs are included in the denominator**.

If FAMILY Expansion is temporarily excluded and only current ORIGINAL + connected-island scope is considered, coded coverage is approximately **71.5 / 90 = 79%**.

That distinction is important:
- **ORIGINAL/current core is substantially implemented.**
- **Snap & Pop as the full product including its expansion layer is not near completion.**

## 5. Verification matrix

### CODED
Partial-to-strong coverage, summarized above.

### STATIC_VERIFIED
Existing repository docs report:
- Node syntax checks: PASS;
- 39 files checked;
- manifest/static structure checks: PASS;
- bottom nav/right walkie/single-tree/wish-blessing checks: PASS.

The exploration-crew validator also checks many current rules structurally.

### RUNTIME_VERIFIED
**NOT CLOSED for the current full branch.**

Existing preview validation explicitly states browser screenshot automation could not complete and hosted visual regression remained required.

Do not convert prior static/prototype PASS into current full runtime PASS.

### DEVICE_VERIFIED
**NOT VERIFIED for this audit.**

No new device test was requested or delegated to the user.

## 6. ORIGINAL core findings

### Strongly coded
- five free landmarks;
- three-step exploration;
- Korean/English mode paths;
- active exploration persistence;
- records and revision history;
- gem shards / EXP;
- single current growth tree;
- wish/blessing transaction history;
- weekend special exploration;
- TTS and browser STT fallback;
- settings/PWA shell.

### Partial
- adaptive question engine depth;
- Guide-derived full intervention policy enforcement;
- Imagination Cloud richness;
- Character Master real generation pipeline;
- final visual asset fidelity;
- current hosted/mobile runtime proof.

## 7. Exploration crew findings

The crew system is **not merely a document anymore**.

Actual runtime evidence exists for:
- stable registry;
- selected main member;
- rename/name history;
- affinity;
- memories;
- synthesized world state;
- reaction motifs;
- starter/world/special roles;
- special roster constraints.

However, the implementation is incomplete relative to the recovered rule system:
- many Guide-derived rules are represented in JSON but not enforced as runtime decision logic;
- complete 20-member identities/content are not closed;
- exact special roster/cadence remains open by design;
- pairwise relationship exceptions and richer world routines are incomplete;
- provisional Core 6 visual/content integration must not be mistaken for completion of the crew system.

## 8. FAMILY / Expansion Pack finding — major implementation gap

Canonical lineage preserves an optional expansion layer:
- diary;
- letters;
- notes;
- family pen-pal;
- family sharing;
- family joint special exploration;
- family growth record/timeline;
- multiple child profiles;
- family-specific Character Master;
- childId data isolation/migration rules.

Recovered detail additionally includes, with different authority states:
- family group/invite/relationship/permission model — RECOVERY_REQUIRED;
- forest mailbox — RECOVERY_REQUIRED;
- stationery/font/sticker/color customization — RECOVERY_REQUIRED;
- sealing wax / seal-and-send UX — RECOVERY_REQUIRED;
- cheering cards — PRESERVE lineage;
- gem-piece gifting — CONFLICT / DO NOT AUTO-RESOLVE;
- composited diary illustration — RECOVERY_CANDIDATE.

### Actual branch check

Current `app.js`, `index.html`, bridge and exploration rules show no operative:
- `FAMILY_EXPANSION`
- `FAMILY_DIARY`
- `FAMILY_LETTERS`
- `FAMILY_PENPAL`
- `FAMILY_SHARED_EXPEDITION`
feature runtime.

Therefore the expansion pack is **specified/recovered but essentially unimplemented** in the current branch.

## 9. Major fragmentation / residue

1. REV10/11/12 inheritance is human-readable but not compiled into one machine-readable current product contract.
2. Exploration crew rules have a strong machine-readable JSON, while ORIGINAL/FAMILY product rules do not have an equivalent unified contract.
3. `docs/FUNCTION_STATUS.md` is too coarse and omits REV11/REV12/crew/expansion obligations.
4. Old QA PASS is structural/static and can be misread as product completion.
5. Guide-derived rules are split across old master text, crew master, JSON and runtime code.
6. FAMILY broad features survive, but detailed rules are partly compressed/lost.
7. Current expansion-pack implementation is effectively absent, yet its canonical lineage remains active.
8. Visual and functional completion are currently conflated in some older artifacts.

## 10. Correct next implementation order

P0 — Canonical consolidation:
- compile REV10 + REV11 + REV12 + Guide-derived rules + exploration-crew rules + recovered expansion lineage into one current requirement matrix;
- every requirement receives owner, status and code/test evidence.

P1 — ORIGINAL rule-to-code closure:
- child-authorship / hint ladder / silence handling / contextual reaction / no-blocking-dialogue enforcement;
- adaptive question-engine gaps;
- current runtime traceability.

P2 — exploration crew rule closure:
- orchestration and world/relationship behaviors;
- provisional Core 6 used only as current reference data;
- no personality-centric redesign.

P3 — connected-app runtime closure:
- bridge idempotency / partial-return / persistence / session-owner boundaries.

P4 — FAMILY Expansion implementation:
- only after unresolved recovery/conflict items are classified;
- no gem-gifting decision by inference.

P5 — runtime/device/release verification:
- after frozen candidate and TAKY external-resource gate;
- no premature hosting/deploy.

## 11. Audit conclusion

Snap & Pop is **substantially coded as an ORIGINAL prototype/current core**, but the project as a whole is fragmented and the optional expansion layer is largely specification-only.

Current provisional full-scope implementation estimate:
**CODED ≈ 65%**
**STATIC_VERIFIED = partial/strong for existing prototype checks**
**RUNTIME_VERIFIED = not closed**
**DEVICE_VERIFIED = not established**

The dominant risk is not Core 6 personality detail.
The dominant risk is **rule fragmentation and false completion caused by treating partial masters/static checks as the whole Snap & Pop product.**
