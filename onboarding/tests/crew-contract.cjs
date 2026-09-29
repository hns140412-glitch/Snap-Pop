#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const scope = JSON.parse(fs.readFileSync(path.join(root, 'crew-scope-contract.json'), 'utf8'));
const assets = JSON.parse(fs.readFileSync(path.join(root, 'asset-and-release-gate.json'), 'utf8'));
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const approved = ['dubi','lori','ink','nova','take','zero'];
const same = (a,b) => assert.deepEqual(a,b);
const required = assets.required_assets;

same(scope.roster.original_ids, approved);
assert.equal(scope.roster.active_originals, 6);
assert.equal(scope.roster.release_claim_max_verified_unique_originals, 6);
assert.match(scope.roster.historical_20_ceiling, /NOT_CURRENT_IMPLEMENTED_COUNT/);
assert.match(scope.roster.later_18_plus_special, /DO_NOT_AUTO_PROMOTE/);
assert.equal(scope.authority.family_wide_semantic_owner, 'P0_RECONCILIATION_HOLD_DO_NOT_SILENTLY_TRANSFER');
assert.equal(scope.authority.original_exploration_crew_rule_source, 'SNAP_POP_ORIGIN');
assert.equal(scope.authority.app_location_never_grants_semantic_authority, true);

for (const field of ['original_assets','ui_cutouts']) {
  same(Object.keys(scope.identity[field]).sort(), [...approved].sort());
  for (const [id,rel] of Object.entries(scope.identity[field])) {
    assert.match(rel, new RegExp('/'+id+'[_.]'));
    assert.match(required[rel] || '', /^[a-f0-9]{64}$/, 'Unregistered '+rel);
    assert.ok(fs.existsSync(path.join(root, rel)), 'Missing '+rel);
  }
}
assert.match(required[scope.identity.first_meeting_scene] || '', /^[a-f0-9]{64}$/);
assert.ok(fs.existsSync(path.join(root, scope.identity.first_meeting_scene)));
assert.equal(Object.keys(required).length,22);
assert.equal(scope.identity.immutable_visual_ids, true);
assert.equal(scope.identity.cross_system_mapping_requires_explicit_approval, true);

const reference = html.match(/const referenceOrder\s*=\s*\[([^\]]+)\]/);
assert.ok(reference, 'Approved first-meeting member order missing');
same([...reference[1].matchAll(/'([a-z]+)'/g)].map(x=>x[1]),approved);
assert.match(html, /renderApprovedCrewScene\(true\)/);
assert.match(html, /picked\.length>=5/);
assert.match(html, /state\.crew\.length<6/);
assert.match(html, /if\(o\.step>=3&&o\.crew\.length<5\)o\.step=2/);
assert.equal(scope.interaction.first_meeting_all_six,true);
assert.equal(scope.interaction.selected_crew.min,5);
assert.equal(scope.interaction.selected_crew.max,6);
assert.equal(scope.interaction.primary_companion.must_not_default_from_array,true);
assert.match(scope.interaction.primary_companion.implementation_state,/^OPEN_/);
// An approved primary-selection screen is absent; never silently promote crew[0].
assert.doesNotMatch(html,/primaryCompanion|mainCompanion|primary_companion_id/);

assert.equal(scope.approval_scopes.automatic_runtime_promotion,false);
assert.equal(scope.approval_scopes.automatic_active_roster_promotion,false);
assert.equal(scope.approval_scopes.root_home_replacement,false);
assert.equal(scope.approval_scopes.merge_or_deploy,false);
assert.match(scope.approval_scopes.snap_root_crew_runtime_use,/SEPARATE_OWNER_SCOPED/);
assert.match(scope.approval_scopes.ready_hide_visual_import,/NOT_AUTHORIZED/);
console.log(JSON.stringify({
  gate:'COMPANION_CREW_IDENTITY_AND_SCOPE',
  core6_identity:'PASS', asset_manifest_references: 'PASS_13_REFERENCES',
  crew_selection:'PASS_5_TO_6',
  primary_companion:'OPEN_NOT_SILENTLY_DEFAULTED',
  shared_owner:'RECONCILIATION_HOLD',
  '18_vs_20_roster':'CONFLICT_PRESERVED_NOT_AUTO_PROMOTED',
  visual_and_device_release:'OPEN',
  merge_or_deploy_allowed:false
},null,2));
