#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const board=require(path.resolve(__dirname,'..','..','vendor','taky','explorer-crew','personality-source-board-v1.js'));
const reg=require(path.resolve(__dirname,'..','..','vendor','taky','explorer-crew','personality-registry-v2.js'));
const dlg=require(path.resolve(__dirname,'..','..','vendor','taky','explorer-crew','dialogue-personality-v1.js'));

assert.deepEqual(board.get('dubi').keywords,['호기심','활력','막내']);
assert.deepEqual(board.get('guide-07').keywords,['탐색','발견','생명','공감']);
assert.deepEqual(board.get('guide-23').keywords,['문제해결','기획','도구','전략']);
assert.deepEqual(board.get('guide-24').keywords,['유대','즐거움','창의','특별함']);
assert.equal(board.get('guide-24').code,'VIVI');
assert.equal(board.get('guide-24').legacy_board_label,'NOVA');

const expectedSpecies={13:'카피바라',14:'원숭이',15:'카멜레온',16:'오리',17:'두더지',18:'코알라'};
for(let n=13;n<=18;n++){
  const id='guide-'+String(n).padStart(2,'0');
  assert.equal(board.get(id).species,expectedSpecies[n]);
  assert.equal(board.get(id).keywords_provenance,'DERIVED_FROM_APPROVED_TAGLINE_AND_SPECIES_USER_AUTHORIZED');
  assert.equal(reg.get(id).status,'DERIVED_PROFILE_FROM_APPROVED_BOARD_AND_SPECIES');
  assert.equal(reg.get(id).behavior_bias.provenance,'DERIVED_FROM_USER_AUTHORIZED_PERSONALITY');
}

assert.equal(dlg.styleGroup(reg.get('guide-13')),'CALM');
assert.equal(dlg.styleGroup(reg.get('guide-14')),'ACTION');
assert.equal(dlg.styleGroup(reg.get('guide-15')),'ADAPT');
assert.equal(dlg.styleGroup(reg.get('guide-16')),'CONNECT');
assert.equal(dlg.styleGroup(reg.get('guide-17')),'EXPLORE');
assert.equal(dlg.styleGroup(reg.get('guide-18')),'MEMORY');

console.log(JSON.stringify({
  gate:'EXPLORER_CREW_APPROVED_PERSONALITY_BOARD_V2',
  approved_keywords_corrected:'PASS',
  derived_13_18_species_profiles:'PASS',
  six_distinct_behavior_styles:'PASS',
  vivi_canonical:'PASS'
},null,2));
