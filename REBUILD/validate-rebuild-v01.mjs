import fs from 'node:fs';

function loadSource(path){
  return fs.readFileSync(path,'utf8');
}
async function importSource(path){
  const source=loadSource(path);
  const url='data:text/javascript;base64,'+Buffer.from(source).toString('base64');
  return import(url);
}
function assert(name,cond){
  if(!cond) throw new Error('FAIL '+name);
  console.log('PASS '+name);
}

const storeMod=await importSource('src/core/state-store.js');
const shellMod=await importSource('src/shell/app-shell.js');
const gateMod=await importSource('src/integrations/contract-gate.js');

const store=storeMod.createStateStore({count:0},{app:'snap-pop'});
let observed=null;
const off=store.subscribe((next,event,prev)=>{observed={next,event,prev};});
store.update(draft=>{draft.count+=1;},{reason:'REBUILD_TEST'});
assert('store-update',store.snapshot().count===1);
assert('store-revision',store.revision()===1);
assert('store-observer',observed?.event?.type==='STATE_REPLACED'&&observed.prev.count===0&&observed.next.count===1);
off();

const shell=shellMod.createAppShell({app:'snap-pop'});
const trace=[];
shell.registerView('home',{render:()=>trace.push('render-home'),enter:()=>trace.push('enter-home'),leave:()=>trace.push('leave-home')});
shell.registerView('work',{render:()=>trace.push('render-work'),enter:()=>trace.push('enter-work')});
await shell.show('home');
await shell.show('work');
assert('shell-active-view',shell.activeView()==='work');
assert('shell-lifecycle',trace.join('|')==='render-home|enter-home|leave-home|render-work|enter-work');

const gate=gateMod.createIntegrationGate({app:'snap-pop',allowedContractVersions:['READY_LEARNING_CONTEXT_V1']});
assert('contract-allow',gate.validateContract({contract_version:'READY_LEARNING_CONTEXT_V1'}).ok===true);
assert('contract-fail-closed',gate.validateContract({contract_version:'UNKNOWN'}).ok===false);
assert('contract-no-object',gate.validateContract(null).ok===false);


const legacyApp=loadSource('app.js');
const exploreMod=await importSource('src/exploration/exploration-session.js');
const session=exploreMod.createExplorationSession({id:'e1',landmark:'forest',startedAt:'2026-09-21T00:00:00.000Z'});
assert('exploration-session-shape',session.step===0&&session.landmark==='forest'&&session.answers.length===3&&session.draft==='');
const restored=exploreMod.ensureWritingState({step:1,answers:['a','b',''],snapshots:null});
assert('exploration-draft-recovery',restored.draft==='b'&&restored.snapshots.length===3);
assert('exploration-step-clamp',exploreMod.clampExplorationStep(9)===2&&exploreMod.clampExplorationStep(-2)===0);
assert('exploration-parity-writing-state',legacyApp.includes('function ensureWritingState(s)'));
assert('exploration-parity-session-shape',legacyApp.includes('answers:["","",""],snapshots:["","",""],draft:"",language:"ko"'));


const flowMod=await importSource('src/exploration/exploration-flow.js');
assert('exploration-empty-waits',flowMod.transitionExploration({step:0,draft:'   '}).kind==='WAIT_FOR_CHILD_INPUT');
assert('exploration-step-advance',flowMod.transitionExploration({step:1,draft:'child text'}).nextStep===2);
assert('exploration-step-complete',flowMod.transitionExploration({step:2,draft:'child text'}).complete===true);
assert('exploration-parity-advance',legacyApp.includes('if(i<2){writingAnalysisSeq++;s.step=i+1'));
assert('exploration-parity-empty',legacyApp.includes('if(!s.draft){s.crewState=s.crewState||{}'));

console.log('REBUILD_DOMAIN_PARITY_PASS');

console.log('REBUILD_V01_FOUNDATION_PASS snap-pop');

const bookScaffoldSource=loadSource('book-response-scaffold-runtime.js');
const writingSourceForBook=loadSource('writing-runtime.js');
assert('book-response-scaffold-loaded',
  indexSource.includes('book-response-scaffold-runtime.js') &&
  indexSource.indexOf('book-response-scaffold-runtime.js')<indexSource.indexOf('writing-runtime.js')
);
assert('book-response-child-authorship',
  bookScaffoldSource.includes('SELECTION_REASON') &&
  bookScaffoldSource.includes('SCENE_OR_STORY') &&
  bookScaffoldSource.includes('WHY_MEMORABLE') &&
  bookScaffoldSource.includes('OWN_POSITION') &&
  bookScaffoldSource.includes('TARGETED_REVISION') &&
  !bookScaffoldSource.includes('finalDraft') &&
  !bookScaffoldSource.includes('suggestedSentence')
);
assert('book-response-writing-integration',
  writingSourceForBook.includes('SnapPopBookResponseScaffold?.nextMove')
);
