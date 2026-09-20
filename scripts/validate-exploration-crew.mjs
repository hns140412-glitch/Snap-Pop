import fs from 'node:fs';

const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const app=read('app.js');
const index=read('index.html');
const sw=read('sw.js');
const master=read('SNAP_EXPLORATION_CREW_MASTER_2026-09-20.md');
const ledger=read('SNAP_EXPLORATION_CREW_SOURCE_LEDGER_2026-09-20.md');
const rules=JSON.parse(read('data/exploration-crew-rules.json'));
const legacyMasters=['Snap_Pop_UI_MASTER_LOGIC_REV_10.md','Snap_Pop_UI_MASTER_LOGIC_REV_11.md','Snap_Pop_UI_MASTER_LOGIC_REV_12.md'].map(read);
const failures=[];
const ok=(cond,msg)=>{if(!cond)failures.push(msg)};

ok(rules.terminology?.explorer==='탐험가','terminology.explorer');
ok(rules.terminology?.crew==='탐험대','terminology.crew');
ok(rules.terminology?.member==='탐험대원','terminology.member');
ok(rules.ownership?.explorationCrew==='SNAP_POP_OWNED','crew ownership');
ok(rules.invariants?.crewMemberNeverWritesFinalAnswer===true,'authorship invariant');

ok(rules.roster?.total?.longTermCeiling===20,'long-term ceiling 20');
ok(rules.roster?.total?.launchFillRequired===false,'20 not required at launch');
ok(rules.roster?.starter?.currentUserRange==='5-6','latest starter range 5-6');
ok(rules.roster?.starter?.canonicalWorkingCount===6,'starter working count 6');
ok((rules.roster?.starter?.personalitySlots||[]).length===6,'six starter personality slots');
ok(rules.roster?.starter?.personalitySlots?.every(x=>x.species==='OPEN'&&x.name==='OPEN'),'starter species/name remain open');
ok(rules.roster?.starter?.selection==='MEET_ALL_THEN_CHOOSE_ONE_TO_DEPART_WITH','starter meet-all choose-one flow');

ok(rules.roster?.worldRegion?.count==='ROLE_DRIVEN_OPEN','world crew count role-driven');
ok(rules.roster?.worldRegion?.status==='COUNT_NOT_HARD_LOCKED','world count not hard locked');
ok(rules.roster?.worldRegion?.rules?.includes('거점당 1명 고정 배치 금지'),'no fixed one-per-hub');

ok(rules.roster?.special?.hardMaximum===12,'special maximum 12');
ok(rules.roster?.special?.laterDesignBoardCount===8,'special working board 8 retained');
ok(rules.roster?.special?.status==='COUNT_OPEN_WITH_MAXIMUM','special count open under maximum');
ok(rules.roster?.special?.encounterGimmickRequired===true,'special encounter gimmick');
ok(rules.roster?.special?.cooldown===true,'special cooldown');
ok(rules.roster?.special?.farmingPrevention===true,'special farming prevention');
ok(rules.roster?.special?.noPowerAdvantage===true,'special no power advantage');
ok(rules.roster?.special?.noMissPenalty===true,'special no miss penalty');

ok(rules.roster?.relationship?.key==='Explorer_ID','stable Explorer_ID');
ok(rules.roster?.relationship?.affinity?.noPowerBoost===true,'affinity no power boost');
ok(rules.roster?.relationship?.affinity?.neverDecreasesForAbsence===true,'affinity no absence decay');

ok(rules.roster?.invariants?.allMembersSameFunctionalAbility===true,'all members equal ability');
ok(rules.roster?.invariants?.discoveryRateNotProportionalToUsage===true,'no discovery farming');
ok(rules.definedCharacterLineages&&Object.keys(rules.definedCharacterLineages).length===4,'legacy four lineages preserved');
ok(Object.keys(rules.members||{}).length===0,'starter slots not falsely mapped to legacy lineages');


ok(Array.isArray(rules.designBoard20)&&rules.designBoard20.length===20,'20-slot design board');
ok(rules.designBoard20.filter(x=>x.role==='STARTER').length===6,'starter design slots 6');
ok(rules.designBoard20.filter(x=>x.role==='WORLD').length===6,'world working slots 6');
ok(rules.designBoard20.filter(x=>x.role==='SPECIAL').length===8,'special working slots 8');
ok(rules.designBoard20.filter(x=>x.role==='SPECIAL').every(x=>x.encounterGimmick),'all working special slots have encounter gimmick');
ok(rules.personalityPackSchema?.fields?.join('>')==='PERSONALITY>HABIT>REACTION>RELATIONSHIP_EXCEPTION>WORLD_ROUTINE>MEMORY','personality pack schema');
ok(rules.visualSystem?.rule==='IDENTITY_FIXED_THEME_VARIABLE','visual identity fixed/theme variable');
ok(rules.interactionContract?.authorship?.neverWriteFinalAnswer===true,'crew never writes final answer');
ok(rules.interactionContract?.stuckBehavior?.waitFirst===true,'stuck behavior waits before hint');
ok(rules.interactionContract?.stuckBehavior?.oneHintAtATime===true,'one hint at a time');
ok(rules.interactionContract?.silenceOrShortAnswer?.pressure===false,'no pressure on silence/short answer');
ok(rules.interactionContract?.specificity?.genericPraiseForbidden===true,'generic praise forbidden');
ok(rules.interactionContract?.copyPriority?.clarity===35&&rules.interactionContract?.copyPriority?.kindness===30,'copy priority clarity/kindness');
ok(rules.interactionContract?.dialoguePresence?.persistentLargeBubble===false,'no persistent large speech bubble');
ok(rules.interactionContract?.dialoguePresence?.inputBlockingForbidden===true,'crew dialogue cannot block input');
ok(rules.voiceAccessibility?.radio?.isSixthWritingTool===false,'radio is not sixth tool');
ok(rules.voiceAccessibility?.radio?.listeningAndSpeakingSeparated===true,'voice listening/speaking separated');
ok(rules.questionEngine?.english?.grammarDrillForbidden===true,'English grammar drill forbidden');
ok(rules.imaginationCloud?.finalAnswerGenerationForbidden===true,'imagination cloud final answer forbidden');
ok(rules.imaginationCloud?.mustReturnToOriginalTask===true,'imagination cloud returns to original task');
ok(rules.reactionPerformance?.reduceMotion?.supported===true,'reaction performance reduce motion');

ok(rules.worldBehaviorGrammar?.absence?.affinityDecay===false,'absence does not decay affinity');
ok(rules.worldBehaviorGrammar?.absence?.streakPenalty===false,'absence no streak penalty');
ok(master.includes('시작 6명 성격 슬롯'),'master starter slots');
ok(master.includes('WORKING DESIGN BOARD'),'master working-board distinction');
ok(master.includes('Explorer_ID'),'master Explorer_ID');
ok(ledger.includes('118871~120431'),'source ledger raw index trace');
ok(ledger.includes('6+6+8=20 배분'),'source ledger working allocation');

ok(!/길잡이|Guide Companion|>Guide</.test(index),'legacy user-facing terminology');
for(const fn of ['function openDB','function get(','function set(','function setMany','migrateIdentityFallback','resolvedIdentity','loadSettings','renderCrewRoster','ensureCrewRegistry','renameCurrentCrewMember'])ok(app.includes(fn),'runtime definition missing: '+fn);
ok(app.includes('definedCharacterLineages'),'runtime preserves defined lineages');
ok(app.includes('designBoard20'),'runtime reads 20-slot design board');
ok(app.includes('role===\"STARTER\"')&&app.includes('role===\"WORLD\"')&&app.includes('role===\"SPECIAL\"'),'runtime renders role design slots');
ok(app.includes('hardMaximum')&&app.includes('specialCrewRoster'),'runtime reads special maximum');
ok(app.includes('crewRegistry')&&app.includes('nameHistory'),'per-member name history runtime');
ok(app.includes('data/exploration-crew-rules.json'),'canonical rules fetch');
ok(!app.includes('data/guide-explorer-rules.json'),'old rules file reference');

ok(sw.includes('data/exploration-crew-rules.json'),'offline rule cache');
ok(sw.includes('SNAP_EXPLORATION_CREW_MASTER_2026-09-20.md'),'offline master cache');
ok(sw.includes('SNAP_EXPLORATION_CREW_SOURCE_LEDGER_2026-09-20.md'),'offline source ledger cache');
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
