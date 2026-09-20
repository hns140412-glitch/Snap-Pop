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
ok(rules.roster?.starter?.minCandidates===5&&rules.roster?.starter?.maxCandidates===6,'starter latest range 5-6');
const starterDefined=(rules.roster?.starter?.slots||[]).filter(x=>x.memberId).map(x=>x.memberId).sort().join(',');
ok(starterDefined==='buddy,cat,maltipoo,redpanda','currently defined starter identities');
ok(rules.roster?.starter?.exactCount==='OPEN_PENDING_ROSTER_DESIGN','starter exact count remains OPEN');
ok(rules.roster?.worldRegion?.count==='CALCULATE_FROM_APP_HUB_ROLE_NEED','world crew count role-calculated');
ok(rules.roster?.worldRegion?.fixedMinimum===null,'world minimum not invented');
ok(rules.roster?.special?.maximumCapacity===12&&rules.roster?.special?.maximumCount===12,'special max 12');
ok(rules.roster?.special?.noPowerAdvantage===true,'special no power advantage');
ok(rules.roster?.special?.afterEncounter?.selectableAsMainCompanion===true,'met special can become main');
ok(rules.roster?.special?.exactCadencePerMember==='OPEN','exact special cadence remains OPEN');
ok(rules.roster?.special?.encounterCycle?.userConfirmedCadence?.includes('1주'),'user-confirmed special cadence concept');
ok(rules.roster?.invariants?.allMembersSameFunctionalAbility===true,'all crew equal ability');

ok(rules.relationship?.enabled===true&&rules.relationship?.powerEffect===false,'affinity exists but not power');
ok(rules.relationship?.preservesOnSwitch===true,'affinity preserved on switch');
ok(Array.isArray(rules.naming?.starter)&&rules.naming.starter.includes('DIRECT_INPUT')&&rules.naming.starter.includes('RECOMMENDED_NAME'),'starter naming');
ok(rules.naming?.discovered==='RANDOM_INITIAL_NAME','discovered random initial name');
ok(rules.naming?.nameHistoryPermanent===true,'name history permanent');
ok(rules.naming?.affinityAndMemoryBindToStableMemberId===true,'relationship bound to stable member id');

ok(master.includes('초기 선택 후보는 **5~6명**'),'master latest starter correction');
ok(master.includes('스페셜 탐험대 ≤ 12명'),'master special max');
ok(master.includes('거점 탐험대원 수는 고정 최소값을 먼저 정하지 않는다'),'master hub count stays role-calculated');
ok(master.includes('이름·친밀도·추억은 초기화하지 않는다'),'master switch preservation');

ok(!/길잡이|Guide Companion|>Guide</.test(index),'legacy user-facing terminology');
for(const fn of ['function openDB','function get(','function set(','function setMany','migrateIdentityFallback','resolvedIdentity','loadSettings','renderCrewRoster','ensureCrewRegistry','renameCurrentCrewMember'])ok(app.includes(fn),'runtime definition missing: '+fn);
ok(app.includes('crewMember')&&app.includes('explorationCrewRulesVersion'),'canonical runtime schema');
ok(app.includes('starter?.slots')&&app.includes('minCandidates')&&app.includes('maxCandidates'),'runtime reads starter 5-6 schema');
ok(app.includes('maximumCapacity')&&app.includes('specialCrewRoster'),'runtime reads special roster schema');
ok(app.includes('crewRegistry')&&app.includes('nameHistory'),'per-member identity history runtime');
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
