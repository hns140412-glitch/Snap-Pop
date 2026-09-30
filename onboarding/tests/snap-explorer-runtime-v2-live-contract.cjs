#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const presenter=require(path.join(root,'crew-visual-presenter.js'));
const system=require(path.resolve(root,'..','vendor','taky','explorer-crew','system-v2.js'));
const consumer=require(path.resolve(root,'..','vendor','taky','explorer-crew','app-consumer-v2.js'));

assert.equal(system.VERSION,'EXPLORER_CREW_SYSTEM_V2');
assert.equal(system.ALL_CREW.length,24);
assert.equal(consumer.VERSION,'EXPLORER_CREW_APP_CONSUMER_V2');
assert.equal(presenter.version,'CANONICAL_RENDER_PLAN_COMPATIBILITY_CONSUMER_V2');
assert.equal(presenter.behaviorOwner,false);
assert.equal(presenter.assetResolver,false);

assert.match(html,/renderSequentialEncounter\(\)/);
assert.match(html,/recordCanonicalFirstMeeting/);
assert.match(html,/companionEligibleIds/);
assert.match(html,/canonicalMainId/);
assert.match(html,/homeCrewSceneMarkup/);

assert.match(html,/TakyExplorerCrewAppConsumerV2/);
assert.match(html,/TakyExplorerCrewPersonalityBehavior/);
assert.match(html,/explorerCrewCanonicalHost\.renderPlan/);

for(const legacy of [
  '<script src="crew-behavior-runtime.js"',
  '<script src="crew-semantic-behavior.js"',
  '<script src="crew-runtime-policy.js"',
  '<script src="crew-render-plan-dom-consumer.js"',
  'crew.length<5',
  'picked.length>=5',
  'selectedIds:state.crew',
  'state.crew.includes(state.primaryCompanionId)',
  'crewLogic.choosePrimary(',
  'function toggleCrew('
]) assert.equal(html.includes(legacy),false,'LEGACY_LIVE_AUTHORITY:'+legacy);

console.log(JSON.stringify({
  gate:'SNAP_EXPLORER_RUNTIME_V2_LIVE_CONTRACT',
  roster_24:'PASS',
  single_runtime_owner:'PASS',
  legacy_5_6_authority_removed:'PASS',
  canonical_first_encounter:'PASS',
  canonical_main_selection:'PASS',
  canonical_render_plan_consumer:'PASS',
  visual_presenter_compatibility_only:'PASS',
  main_merge_allowed:false,
  netlify:'HOLD'
},null,2));
