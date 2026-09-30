#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const behavior=require(path.resolve(__dirname,'..','..','vendor','taky','explorer-crew','behavior-patterns-v1.js'));
const roles=require(path.resolve(__dirname,'..','..','vendor','taky','explorer-crew','role-behavior-policy-v1.js'));
const dialogue=require(path.resolve(__dirname,'..','..','vendor','taky','explorer-crew','dialogue-personality-v1.js'));

let b=behavior.decide({focus_state:'FOCUS',child_state:'ACTIVE'});
assert.equal(b.interaction_mode,'SILENT');
assert.equal(roles.validateTurn({role:'AMBIENT',talk:false,hint:false,concurrent_speakers:0}).ok,true);

b=behavior.decide({child_state:'PAUSED'});
assert.equal(b.behavior_state,'PEEK');
assert.equal(roles.validateTurn({role:'MAIN',talk:true,hint:false,concurrent_speakers:1}).ok,true);

let d=dialogue.resolve({character_id:'dubi',intent:'GREET',scene_id:'HOME',interaction_mode:'TALK'});
assert.equal(typeof d.text,'string');

d=dialogue.resolve({character_id:'guide-07',intent:'GREET',scene_id:'HOME',interaction_mode:'TALK'});
assert.equal(d.text,'작은 빛도 길이 될 수 있어.');
assert.equal(d.source,'APPROVED_BOARD_SIGNATURE');

assert.equal(roles.validateTurn({role:'AMBIENT',talk:true,hint:false,concurrent_speakers:1}).ok,false);
assert.equal(roles.validateTurn({role:'GUEST',talk:true,hint:false,direct_response:true,exit_planned:true,concurrent_speakers:1}).ok,false);
assert.equal(roles.validateTurn({role:'GUEST',talk:true,hint:false,direct_response:false,exit_planned:false,concurrent_speakers:1}).ok,false);
assert.equal(roles.validateTurn({role:'GUEST',talk:true,hint:false,direct_response:false,exit_planned:true,concurrent_speakers:1}).ok,true);

console.log(JSON.stringify({
  gate:'EXPLORER_CREW_ROLE_BEHAVIOR_INTEGRATION_V1',
  focus_ambient_silent:'PASS',
  main_single_turn:'PASS',
  core6_sourced_line:'PASS',
  approved_board_tagline_used:'PASS',
  ambient_talk_blocked:'PASS',
  guest_direct_response_blocked:'PASS',
  guest_exit_required:'PASS'
},null,2));
