import fs from "node:fs";
const index=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const css=fs.readFileSync(new URL("../styles.css",import.meta.url),"utf8");

function assert(name,condition){
  if(!condition) throw new Error("FAIL "+name);
  console.log("PASS",name);
}

assert("writing-focus-card-present",index.includes('class="paper writingFocusCard"'));
assert("question-is-framed-as-single-current-focus",index.includes("지금은 이것만 생각해봐"));
assert("child-answer-label-present",index.includes('for="answer">내 생각'));
assert("primary-writing-controls-are-voice-and-hint",
  /class="tools quickTools"[sS]*id="voiceBtn"[sS]*id="hintBtn"/.test(index)
);
assert("optional-assists-are-collapsed-by-default",
  index.includes('class="assistDrawer"')&&
  index.includes("다른 도움이 필요해?")&&
  /class="assistTools"[sS]*id="listenBtn"[sS]*id="cloudBtn"[sS]*id="expressionBridgeBtn"[sS]*id="deepThinkOpen"/.test(index)
);
assert("next-action-has-dedicated-dock",
  index.includes('class="writingNextDock"')&&index.includes('id="nextBtn">이 생각으로 다음')
);
assert("writing-dock-stays-above-bottom-nav",
  /.writingNextDock{[^}]*position:sticky[^}]*bottom:calc(var(--nav)/.test(css)
);
assert("answer-remains-large-writing-surface",
  /#answer{[^}]*min-height:220px/.test(css)
);

console.log("INTEGRATED_CHILD_WRITING_FLOW_PASS");
