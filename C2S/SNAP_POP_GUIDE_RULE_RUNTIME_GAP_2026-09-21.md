# SNAP & POP — Guide Rule → Runtime Gap Review

Date: 2026-09-21
Branch: `taky/snap-pop-implementation-2026-09-20`
Scope: Guide/길잡이 derived operating rules as project-wide Snap & Pop standard
Core 6 personality detail: OUT OF CENTER SCOPE

## 1. Review correction

Earlier high-level audit understated some already-coded behavior.

Direct `app.js` review confirms:
- empty answer does **not** pressure/advance the child;
- the runtime says there is no rush and offers one hint;
- hint is one-at-a-time and disabled after reveal;
- voice input explicitly preserves the child's wording;
- Imagination Cloud returns fragments/questions and explicitly tells the child to continue in their own sentence;
- active exploration text is persisted while typing.

Therefore these are not merely document rules.

## 2. Guide-rule implementation classification

### G-01 Child authorship / no final-answer replacement
**Rule:** explorer owns final thought/expression.

Evidence:
- fixed QUESTION_BANK asks the child to finish in own words;
- hint text remains prompt-level rather than producing a final sentence;
- voice path says to keep the child's wording;
- Imagination Cloud produces fragments/questions rather than a final answer.

Status:
**CODED_BY_CURRENT_FLOW / NO CENTRAL GUARD**

Gap:
there is no reusable runtime guard that would stop a future AI/generative path from returning a completed final answer.

### G-02 Wait before intervention
Evidence:
empty advance attempt:
`급할 건 없어. 잠깐 생각해도 돼. 필요하면 힌트 하나만 보자.`

Status:
**CODED**

The child does not auto-fail, auto-submit or receive pressure.

### G-03 One small hint at a time
Evidence:
`revealHint()`
- sets one hint level;
- disables hint button after reveal;
- reaction: `힌트는 하나만. 나머지는 네 생각으로 가보자.`

Status:
**CODED**

Gap:
no multi-step intervention engine exists beyond the current one-hint flow.

### G-04 Respond to actual child input
Evidence:
`stepSpecificReaction(text)` extracts a snippet from current input and reacts to that text.

Status:
**CODED / LIGHTWEIGHT**

Gap:
reaction is template-level; no deeper semantic adaptation.

### G-05 No generic praise as substitute for useful response
Current runtime uses contextual lines and input snippets.

Status:
**CURRENT COPY MOSTLY COMPLIANT / NO ENFORCEMENT FILTER**

Gap:
no central copy validator prevents future generic praise regression.

### G-06 Child weakness/error is not comedy material
No current runtime path was found that mocks the child.

Status:
**CURRENT CODE COMPLIANT / POLICY NOT EXECUTABLY GUARDED**

### G-07 No blocking persistent dialogue
Crew reaction overlay is transient and auto-hides; the main exploration UI remains primary.

Status:
**CODED STRUCTURALLY / VISUAL RUNTIME NOT CLOSED**

### G-08 Main companion continuity
Current selected crew member persists through identity/IndexedDB state.

Status:
**CODED**

### G-09 Guest weighted appearance
Recovered rule:
recent appearance frequency + mood/state conflict should influence Guest appearance.

Search of `app.js` found no:
- `crewInteractionOrchestration` use;
- Guest selector;
- weighted selection;
- recentAppearanceFrequency;
- moodStateConflictAvoidance.

Status:
**NOT CODED**

This is a real P1 runtime gap.

### G-10 Character selection creates no learning-power advantage
Affinity weights only relationship memory; current question bank and completion path do not vary learning power by crew member.

Status:
**CODED / STRUCTURALLY COMPLIANT**

### G-11 Affinity/memory
`recordCrewExperience()` stores memories and updates affinity.
VOICE_EXPRESSION and REUNION do not farm affinity.

Status:
**CODED**

### G-12 Absence / return world behavior
`synthesizeCrewWorldState()` generates lightweight world state and reunion memory.

Status:
**CODED**

Gap:
world state is synthetic/lightweight; this is acceptable under the rule that full daily simulation is not required.

### G-13 Crew-to-crew humor/chemistry
Rule recovered, but no actual Guest runtime exists.

Status:
**NOT CODED**

Blocked by G-09.

### G-14 Listening vs speaking
TTS and STT paths are separate.

Status:
**CODED**
Device/browser permission quality remains unverified.

### G-15 Special means encounter method, not power
Rule exists; runtime special roster does not create learning-power boosts.

Status:
**PARTIAL CODED**

Full encounter lifecycle/content is incomplete.

## 3. ORIGINAL question-engine gap

Current `QUESTION_BANK` is:
- five landmarks;
- Korean/English;
- exactly three fixed prompts per place.

This correctly implements the basic loop but does **not** yet implement the REV11 adaptive growth-dimension idea at runtime.

Current status:
**BASIC QUESTION ENGINE CODED**
**ADAPTIVE QUESTION ENGINE NOT CODED**

The following taxonomy is currently document-level:
`RECALL / UNDERSTAND / REASON / CONNECT / EVIDENCE / PERSPECTIVE / EXPRESS / REVISE`

This taxonomy must remain internal if implemented; it must not become a child-facing test.

## 4. Imagination Cloud gap

Current implementation:
- fragment from current text;
- place / feeling / sensory / reason prompts;
- child selects/notices;
- returns focus to original answer.

Status:
**BASIC FLOW CODED**

Gap:
- limited context sensitivity;
- no richer scene/meaning/mood decomposition engine;
- no shared cross-app invocation behavior proven at runtime.

## 5. P1 actual blockers

Priority runtime gaps:

1. **Guest orchestration engine**
   - selection candidates;
   - recent appearance history;
   - state/mood compatibility;
   - no functional advantage;
   - crew-to-crew interaction slot.

2. **Central authorship/intervention guard**
   - reusable contract for every future response path;
   - stop final-answer generation;
   - prevent pressure/question flooding;
   - keep hint count/size bounded.

3. **Adaptive question engine**
   - context-sensitive without becoming grading;
   - preserve fixed five-place identity;
   - preserve three-step loop.

4. **Copy/interaction regression guard**
   - no mocking;
   - no generic praise-only response;
   - no teacher/grader/system voice;
   - no persistent blocking bubble.

## 6. Non-blockers / already coded

Do not rework these merely because they are listed in Guide rules:
- blank-answer wait behavior;
- one-hint reveal;
- current child-authorship flow;
- basic input-specific reaction;
- main companion persistence;
- affinity memory;
- lightweight absence/return state;
- TTS/STT separation;
- basic Imagination Cloud return-to-task.

## 7. Implementation-rate effect

The earlier full audit's Guide-derived runtime score was conservative because it did not distinguish current-code compliance from central enforcement.

After direct code review:
- more Guide behavior is already present than first estimated;
- however Guest orchestration and central future-proof guards remain genuine gaps.

Do **not** revise the full-product percentage upward solely from this correction until the requirement matrix is reweighted deterministically.
