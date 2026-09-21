import fs from "node:fs";
import vm from "node:vm";

const safetySource=fs.readFileSync(new URL("../crew-interaction-safety-runtime.js",import.meta.url),"utf8");
const semanticSource=fs.readFileSync(new URL("../semantic-writing-runtime.js",import.meta.url),"utf8");
const presentationSource=fs.readFileSync(new URL("../crew-presentation-guard.js",import.meta.url),"utf8");
const appSource=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
const crewSource=fs.readFileSync(new URL("../crew-controller.js",import.meta.url),"utf8");

const window={};
vm.runInNewContext(safetySource,{window,Object,Array,String,Number,Math,Error,RegExp});
const safety=window.SnapPopCrewInteractionSafety;

function assert(name,condition){
  if(!condition) throw new Error("FAIL "+name);
  console.log("PASS",name);
}

assert("neutral-reaction-passes",
  safety.inspect("한 조각만 더 볼까?",{mode:"CHILD_REACTION"}).safe===true
);
assert("directed-mock-blocked",
  safety.inspect("넌 바보야.",{mode:"CHILD_REACTION"}).reason==="CHILD_DIRECTED_MOCK_OR_DEFICIT"
);
assert("grading-language-blocked-in-writing",
  safety.inspect("이 글은 100점이야.",{mode:"WRITING_PROMPT"}).reason==="GRADING_LANGUAGE"
);
assert("overpraise-blocked-in-reaction",
  safety.inspect("넌 역시 천재야!",{mode:"CHILD_REACTION"}).reason==="OVERPRAISE_LANGUAGE"
);
assert("knowledge-word-meaning-not-overblocked",
  safety.inspect("'stupid'는 무례하게 들릴 수 있는 단어야.",{mode:"GENERAL"}).safe===true
);
assert("unsafe-reaction-falls-back-neutral",
  safety.safeReaction("넌 바보야.",{language:"ko"})==="작은 한 조각만 같이 보자."
);

assert("semantic-runtime-applies-writing-safety",
  semanticSource.includes('safety.assertSafe(next.question,{mode:"WRITING_PROMPT"})')&&
  semanticSource.includes('safety.assertSafe(next.hint,{mode:"WRITING_PROMPT"})')
);
assert("presentation-applies-general-safety",
  presentationSource.includes('safety.assertSafe(core,{mode:"GENERAL"})')&&
  presentationSource.includes('safety.assertSafe(node.value,{mode:"GENERAL"})')
);
assert("reaction-overlay-applies-safe-reaction",
  crewSource.includes('safety.safeReaction(message,{language})')&&
  crewSource.includes('s.crewState.lastReaction=safeMessage')
);

console.log("CREW_INTERACTION_SAFETY_PASS");
