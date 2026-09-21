const fs=require('fs');
const vm=require('vm');
const ctx={window:{},console};
ctx.window=ctx;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('authorship-guard-runtime.js','utf8'),ctx);
vm.runInContext(fs.readFileSync('book-response-scaffold-runtime.js','utf8'),ctx);
vm.runInContext(fs.readFileSync('writing-runtime.js','utf8'),ctx);

const assert=(name,cond)=>{if(!cond)throw new Error('FAIL '+name);console.log('PASS '+name)};
const learning={subject:'국어',concept_skill_target:'독서 감상문',activity_types:['WRITING']};

const a=ctx.SnapPopWriting.move({draft:'',language:'ko',learnerContext:learning});
assert('selection-reason-first',a.kind==='BOOK_RESPONSE_SCAFFOLD'&&a.focus==='SELECTION_REASON');
assert('one-question-first',(a.question.match(/[?？]/g)||[]).length===1);

const b=ctx.SnapPopWriting.move({draft:'이 책을 고른 이유는 표지가 궁금했기 때문이다.',language:'ko',learnerContext:learning});
assert('scene-second',b.focus==='SCENE_OR_STORY');

const c=ctx.SnapPopWriting.move({draft:'이 책을 고른 이유는 표지가 궁금했기 때문이다. 가장 기억나는 장면은 주인공이 숲에서 길을 찾는 부분이다.',language:'ko',learnerContext:learning});
assert('memorable-why-third',c.focus==='WHY_MEMORABLE');

const d=ctx.SnapPopWriting.move({draft:'이 책을 고른 이유는 표지가 궁금했기 때문이다. 가장 기억나는 장면은 주인공이 숲에서 길을 찾는 부분이다. 그 장면이 기억에 남은 이유는 나도 비슷하게 길을 잃은 적이 있기 때문이다.',language:'ko',learnerContext:learning});
assert('own-position-fourth',d.focus==='OWN_POSITION');

const e=ctx.SnapPopWriting.move({draft:'이 책을 고른 이유는 표지가 궁금했기 때문이다. 가장 기억나는 장면은 주인공이 숲에서 길을 찾는 부분이다. 그 장면이 기억에 남은 이유는 나도 비슷하게 길을 잃은 적이 있기 때문이다. 나는 포기하지 않은 점이 좋았다고 생각한다.',language:'ko',learnerContext:learning});
assert('targeted-revision-last',e.focus==='TARGETED_REVISION');
assert('no-final-answer-fields',!('finalDraft' in e)&&!('rewrite' in e)&&!('suggestedSentence' in e));

const generic=ctx.SnapPopWriting.move({draft:'나는 오늘 숲에 갔다.',language:'ko',learnerContext:{subject:'국어',concept_skill_target:'일기'}});
assert('generic-writing-unchanged',generic.kind!=='BOOK_RESPONSE_SCAFFOLD');

console.log('BOOK_RESPONSE_SCAFFOLD_PASS');
