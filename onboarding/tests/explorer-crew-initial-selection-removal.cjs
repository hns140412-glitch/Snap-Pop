#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const html=fs.readFileSync(path.resolve(__dirname,'..','index.html'),'utf8');

assert.equal(/crew\.length\s*<\s*5/.test(html),false);
assert.equal(/toggleCrew\s*\(/.test(html),false);
assert.equal(html.includes('친구 선택 변경'),false);
assert.equal(html.includes('5명 이상'),false);
assert.equal(html.includes('function knownCrewIds()'),true);
assert.equal(html.includes("if(step===2){state.selectionPhase='primary';if(!companionEligibleIds().length)"),true);
assert.equal(html.includes("if(state.step===1){void advanceFirstEncounter();return;}"),true);
assert.equal(html.includes("const canGo=Boolean(primary&&eligible.includes(primary))"),true);
assert.equal(html.includes('legacy primary'),false);

console.log(JSON.stringify({
  gate:'EXPLORER_CREW_INITIAL_SELECTION_REMOVAL_V1',
  forced_5_to_6_gate_removed:'PASS',
  initial_multi_select_handler_removed:'PASS',
  canonical_known_roster:'PASS',
  companion_gate_only_for_main:'PASS',
  onboarding_can_continue_without_main:'PASS'
},null,2));
