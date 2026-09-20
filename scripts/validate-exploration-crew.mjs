import fs from 'node:fs';

const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const app=read('app.js');
const index=read('index.html');
const sw=read('sw.js');
const rules=JSON.parse(read('data/exploration-crew-rules.json'));
const masters=['Snap_Pop_UI_MASTER_LOGIC_REV_10.md','Snap_Pop_UI_MASTER_LOGIC_REV_11.md','Snap_Pop_UI_MASTER_LOGIC_REV_12.md'].map(read);
const failures=[];
const ok=(cond,msg)=>{if(!cond)failures.push(msg)};

ok(rules.terminology?.explorer==='탐험가','terminology.explorer');
ok(rules.terminology?.crew==='탐험대','terminology.crew');
ok(rules.terminology?.member==='탐험대원','terminology.member');
ok(rules.ownership?.explorationCrew==='SNAP_POP_OWNED','crew ownership');
ok(rules.ownership?.crewBehaviorRules==='SNAP_POP_OWNED','crew behavior ownership');
ok(rules.invariants?.crewMemberNeverWritesFinalAnswer===true,'authorship invariant');
ok(rules.invariants?.noFunctionalAdvantageByMember===true,'no member advantage invariant');
ok(Array.isArray(rules.interventionLadder)&&rules.interventionLadder.join('>')==='OBSERVE>SHORT_REACTION>ASK>HINT>WAIT>MINIMAL_REASK>CHILD_EXPRESSES','intervention ladder');
ok(rules.roster?.baseRoster?.count===20,'base roster 20');
ok(rules.roster?.baseRoster?.extensible===true,'roster extensible');
ok(rules.roster?.starterMainCandidates?.min===5&&rules.roster?.starterMainCandidates?.max===6,'starter latest range 5-6');
ok(rules.roster?.special?.max===12,'special max 12');
ok(rules.roster?.partitionSemantics?.noDoubleCount===true,'roster partition no double count');
ok(rules.roster?.starterMainCandidates?.definedMembers?.sort().join(',')==='buddy,cat,maltipoo,redpanda','currently defined starter members');
ok(rules.relationship?.affinity?.neverAffects?.includes('학습 기능'),'affinity not power');
ok(rules.identity?.immutableId==='Explorer_ID','immutable member identity');
ok(rules.roster?.starterMainCandidates?.namePolicy?.preserveNameHistory===true,'name history preserved');
ok(rules.classification?.OPEN?.includes('STARTER_REMAINING_1_TO_2_IDENTITIES'),'starter open identities remain explicit');
ok(!/길잡이|Guide Companion|>Guide</.test(index),'legacy user-facing terminology');
ok(app.includes('crewMember')&&app.includes('explorationCrewRulesVersion'),'canonical runtime schema');
ok(!app.includes('data/guide-explorer-rules.json'),'old rules file reference');
ok(app.includes('data/exploration-crew-rules.json'),'canonical rules fetch');
ok(app.includes('selCrewMemberReaction')&&app.includes('resultCrewMemberLine')&&app.includes('crewMemberPersonalityPreview'),'major surface propagation');
ok(app.includes('renderCrewRoster')&&app.includes('starterCrewRoster')&&app.includes('specialCrewRoster'),'canonical roster runtime');
ok(!app.includes('renderCrewRosters'),'duplicate legacy roster renderer removed');
ok(app.includes('renderCrewRosters')&&app.includes('starterCrewRoster')&&app.includes('specialCrewRoster'),'roster runtime surfaces');
ok(sw.includes('data/exploration-crew-rules.json'),'offline rule cache');
ok(sw.includes('SNAP_EXPLORATION_CREW_MASTER_2026-09-20.md'),'offline master cache');
ok(!sw.includes('stage_07.png'),'stale seventh growth stage cache');
for(const [i,m] of masters.entries())ok(m.startsWith('> **CANONICAL TERMINOLOGY / AUTHORITY OVERRIDE'),'legacy master override '+(i+10));

const legacyGuideReads=(app.match(/\.guide\b|\.guideType\b|\.guideName\b|\.guideVoice\b/g)||[]);
ok(legacyGuideReads.length<=5,'legacy guide refs exceed migration-only allowance: '+legacyGuideReads.length);

if(failures.length){
  console.error('EXPLORATION_CREW_VALIDATION_FAIL');
  failures.forEach(x=>console.error('- '+x));
  process.exit(1);
}
console.log('EXPLORATION_CREW_VALIDATION_PASS');
