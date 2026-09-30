#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const compat=require(path.resolve(__dirname,'..','..','vendor','taky','explorer-crew','semantic-command-compat-v1.js'));

const base={character_id:'guide-07',role:'MAIN',relation_state:'KNOWN'};

let x=compat.toPr10({...base,behavior_state:'GUIDE',interaction_mode:'GUIDE',hint_level:'H1'},'TEXT');
assert.equal(x.ok,true);
assert.equal(x.semantic_interaction_mode,'GUIDE');
assert.equal(x.pr10_command.interaction_mode,'TEXT');
assert.equal(x.pr10_command.behavior_state,'GUIDE');

x=compat.toPr10({...base,behavior_state:'LISTEN',interaction_mode:'LISTEN'},'NONE');
assert.equal(x.ok,true);
assert.equal(x.pr10_command.interaction_mode,'SILENT');

x=compat.toPr10({...base,role:'AMBIENT',behavior_state:'AMBIENT',interaction_mode:'SILENT',ambient_action:'READ_BOOK'},'NONE');
assert.equal(x.ok,true);
assert.equal(x.pr10_command.interaction_mode,'SILENT');
assert.equal(x.pr10_command.ambient_action,'READ_BOOK');

x=compat.toPr10({...base,behavior_state:'TALK',interaction_mode:'TALK'},'TEXT');
assert.equal(x.ok,false);
assert.equal(x.reason,'PR10_UNSUPPORTED_BEHAVIOR_STATE:TALK');

x=compat.toPr10({...base,behavior_state:'IDEA',interaction_mode:'TALK'},'TEXT');
assert.equal(x.ok,false);
assert.equal(x.reason,'PR10_UNSUPPORTED_BEHAVIOR_STATE:IDEA');

x=compat.toPr10({...base,role:'AMBIENT',behavior_state:'AMBIENT',interaction_mode:'SILENT',ambient_action:'IDLE'},'NONE');
assert.equal(x.ok,false);
assert.equal(x.reason,'PR10_UNSUPPORTED_AMBIENT_ACTION:IDLE');

x=compat.toPr10({...base,behavior_state:'GUIDE',interaction_mode:'GUIDE'},'NONE');
assert.equal(x.ok,false);
assert.equal(x.reason,'ACTIVE_INTERACTION_REQUIRES_DELIVERY_MODE');

console.log(JSON.stringify({
  gate:'EXPLORER_CREW_SEMANTIC_COMPAT_V1',
  interaction_delivery_split:'PASS',
  semantic_preserved:'PASS',
  no_forced_talk_mapping:'PASS',
  no_forced_idea_mapping:'PASS',
  no_forced_idle_mapping:'PASS',
  active_delivery_required:'PASS'
},null,2));
