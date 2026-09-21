import fs from "node:fs";
const index=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const css=fs.readFileSync(new URL("../styles.css",import.meta.url),"utf8");

function assert(name,condition){
  if(!condition) throw new Error("FAIL "+name);
  console.log("PASS",name);
}
function ordered(text,tokens){
  let cursor=-1;
  for(const token of tokens){
    cursor=text.indexOf(token,cursor+1);
    if(cursor<0) return false;
  }
  return true;
}

assert("writing-focus-card-present",index.includes('class="paper writingFocusCard"'));
assert("question-is-framed-as-single-current-focus",index.includes("지금은 이것만 생각해봐"));
assert("child-answer-label-present",index.includes('for="answer">내 생각'));
assert("primary-writing-controls-are-voice-and-hint",
  ordered(index,['class="tools quickTools"','id="voiceBtn"','id="hintBtn"'])
);
assert("optional-assists-are-collapsed-by-default",
  index.includes('class="assistDrawer"')&&
  index.includes("다른 도움이 필요해?")&&
  ordered(index,['assistTools','id="listenBtn"','id="cloudBtn"','id="expressionBridgeBtn"','id="deepThinkOpen"'])
);
assert("next-action-has-dedicated-dock",
  index.includes('class="writingNextDock"')&&index.includes('id="nextBtn">이 생각으로 다음')
);
assert("writing-dock-stays-above-bottom-nav",
  css.includes(".writingNextDock{position:sticky")&&css.includes("bottom:calc(var(--nav)")
);
assert("answer-remains-large-writing-surface",
  css.includes("#answer{min-height:220px")
);

console.log("INTEGRATED_CHILD_WRITING_FLOW_PASS");
