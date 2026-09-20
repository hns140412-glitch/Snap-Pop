import fs from 'node:fs';

const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const app=read('app.js');
const index=read('index.html');
const sw=read('sw.js');
const master=read('SNAP_EXPLORATION_CREW_MASTER_2026-09-20.md');
const rules=JSON.parse(read('data/exploration-crew-rules.json'));
const legacyMasters=['Snap_Pop_UI_MASTER_LOGIC_REV_10.md','Snap_Pop_UI_MASTER_LOGIC_REV_11.md','Snap_Pop_UI_MASTER_LOGIC_REV_12.md'].map(read);
const failures=[];
const ok=(cond,msg)=>{if(!cond)failures.push(msg)};

ok(rules.terminology?.explorer==='탐험가','terminology.explorer');
ok(rules.terminology?.crew==='탐험대','terminology.crew');
ok(rules.terminology?.member==='탐험대원','terminology.member');
ok(rules.ownership?.explorationCrew==='SNAP_POP_OWNED','crew ownership');
ok(rules.invariants?.crewMemberNeverWritesFinalAnswer===true,'authorship invariant');
ok(rules.roster?.currentTarget===20,'current roster target 20');
ok(rules.roster?.expandableByFutureUpdate===true,'future roster expansion');
ok(rules.roster?.starter?.selectableCandidateCount?.min===5&&rules.roster?.starter?.selectableCandidateCount?.max===6,'starter latest range 5-6');
ok((rules.roster?.starter?.definedMembers||[]).slice().sort().join(',')==='buddy,cat,maltipoo,redpanda','defined starter identities');
ok(rules.roster?.worldRegion?.countStatus==='OPEN_CALCULATE_FROM_ACTUAL_HUB_NEED','world crew count must stay OPEN');
ok(rules.roster?.worldRegion?.fixedHubCountSnap===5,'Snap fixed five hubs');
ok(rules.roster?.special?.maximumCount===12,'special max 12');
ok(rules.roster?.special?.noPowerAdvantage===true,'special no power advantage');
ok(rules.roster?.special?.afterEncounter?.selectableAsMainCompanion===true,'encountered special can become main');
ok(rules.roster?.special?.hubAppearance?.triggerDialogueFromCurrentMainCrew===true,'special hub arrival triggers main crew dialogue');
ok(rules.roster?.invariants?.allMembersSameFunctionalAbility===true,'all crew equal ability');
ok(rules.relationship?.enabled===true&&rules.relationship?.affectsPower===false,'affinity exists but not power');
ok(rules.naming?.starter?.directInput===true&&rules.naming?.starter?.recommendation===true,'starter naming');
ok(rules.naming?.whenSetAsMain?.renameAllowed===true,'rename when set as main');
ok(rules.naming?.nameHistoryPermanent===true,'name history permanent');
ok(rules.worldSimulation?.hubPresenceIsDynamic===true,'dynamic hub presence');
ok(rules.worldSimulation?.substituteMemberAllowed===true,'hub substitute member');
ok(rules.worldSimulation?.systemLogicHiddenBehindWorldStory===true,'hide system probability behind world story');
ok(rules.specialCrewEncounter?.separateFromSpecialExploration===true,'special crew encounter separated from special exploration');
ok(rules.specialCrewEncounter?.exactProbability==='OPEN','special exact probability remains OPEN');
ok(rules.specialCrewEncounter?.exactCadencePerMember==='OPEN','special exact cadence remains OPEN');
ok(!('minimumCapacity' in (rules.roster?.worldRegion||{})),'stale world minimum removed');
ok(master.includes('세계/거점 최소 2명 → 근거 부족, **폐기**'),'stale minimum-two rule must remain explicitly rejected');
ok(master.includes('스페셜 3~4명')&&master.includes('폐기'),'old special 3-4 proposal explicitly rejected');
ok(!/길잡이|Guide Companion|>Guide</.test(index),'legacy user-facing terminology');
ok(app.includes('crewMember')&&app.includes('explorationCrewRulesVersion'),'canonical runtime schema');
ok(app.includes('renderCrewRoster')&&app.includes('starterCrewRoster')&&app.includes('worldCrewRoster')&&app.includes('specialCrewRoster'),'roster runtime surfaces');
ok(app.includes('selectableCandidateCount')&&app.includes('maximumCount'),'runtime reads current roster schema');
ok(!app.includes('remainingDiscoveryPool')&&!app.includes('maximumWithinRoster'),'old roster schema removed');
ok(app.includes('data/exploration-crew-rules.json'),'canonical rules fetch');
ok(!app.includes('data/guide-explorer-rules.json'),'old rules file reference');
ok(sw.includes('data/exploration-crew-rules.json'),'offline rule cache');
ok(sw.includes('SNAP_EXPLORATION_CREW_MASTER_2026-09-20.md'),'offline master cache');
ok(!sw.includes('stage_07.png'),'stale seventh growth stage cache');
for(const [i,m] of legacyMasters.entries())ok(m.startsWith('> **CANONICAL TERMINOLOGY / AUTHORITY OVERRIDE'),'legacy master override '+(i+10));

const legacyGuideReads=(app.match(/\.guide\b|\.guideType\b|\.guideName\b|\.guideVoice\b/g)||[]);
ok(legacyGuideReads.length<=5,'legacy guide refs exceed migration-only allowance: '+legacyGuideReads.length);

if(failures.length){
  console.error('EXPLORATION_CREW_VALIDATION_FAIL');
  failures.forEach(x=>console.error('- '+x));
  process.exit(1);
}
console.log('EXPLORATION_CREW_VALIDATION_PASS');
