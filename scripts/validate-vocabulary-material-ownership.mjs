import fs from "node:fs";
import vm from "node:vm";

const runtimeSource=fs.readFileSync(new URL("../vocabulary-material-runtime.js",import.meta.url),"utf8");
const bridgeSource=fs.readFileSync(new URL("../snap-bridge.js",import.meta.url),"utf8");
const writingSource=fs.readFileSync(new URL("../writing-runtime.js",import.meta.url),"utf8");
const semanticSource=fs.readFileSync(new URL("../semantic-writing-runtime.js",import.meta.url),"utf8");
const providerSource=fs.readFileSync(new URL("../openai-semantic-provider.js",import.meta.url),"utf8");
const serverSource=fs.readFileSync(new URL("../netlify/functions/snap-pop-semantic-writing.mjs",import.meta.url),"utf8");
const appSource=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
const flowSource=fs.readFileSync(new URL("../writing-flow-controller.js",import.meta.url),"utf8");

const window={};
vm.runInNewContext(runtimeSource,{window,Object,Array,String,Number,Math,RegExp});
const v=window.SnapPopVocabularyMaterial;

function assert(name,condition){
  if(!condition) throw new Error("FAIL "+name);
  console.log("PASS",name);
}

const material=v.normalize({
  word:"explore",
  word_context:"새로운 곳을 찾아보다",
  from_app:"hide-seek"
});

assert("hide-seek-ownership-preserved",
  material.sourceOwner==="HIDE_SEEK"&&
  material.role==="EXPRESSION_MATERIAL_ONLY"
);
assert("no-auto-insert-or-mastery-mutation",
  material.autoInsertAllowed===false&&
  material.masteryMutationAllowed===false&&
  material.vocabularyOwnershipTransferred===false&&
  material.doNotInferMastery===true
);
assert("english-whole-word-usage-detected",
  v.usedInText(material,"I want to explore the cave.")===true
);
assert("english-substring-not-falsely-counted",
  v.usedInText(material,"We explored yesterday.")===false
);

const ko=v.normalize({word:"용기",word_context:"무서워도 해보는 마음",from_app:"hide_seek"});
assert("korean-usage-detected",v.usedInText(ko,"나는 용기를 내서 말했다.")===true);

const unused=v.usageEvidence(material,"I want to discover a cave.");
assert("offered-does-not-mean-used",
  unused.offeredWord==="explore"&&unused.usedInDraft===false
);
assert("used-does-not-mean-mastered",
  v.usageEvidence(material,"I want to explore.").masteryInferred===false
);

assert("bridge-exposes-material-not-mastery",
  bridgeSource.includes("vocabularyMaterial: () =>")&&
  !bridgeSource.includes("used_handoff_word")
);
assert("writing-analysis-receives-optional-material",
  writingSource.includes("vocabularyMaterial:payload.vocabularyMaterial||null")&&
  semanticSource.includes("vocabularyMaterial:payload.vocabularyMaterial||null")
);
assert("provider-and-server-preserve-ownership-contract",
  providerSource.includes('role:"EXPRESSION_MATERIAL_ONLY"')&&
  serverSource.includes('role:"EXPRESSION_MATERIAL_ONLY"')&&
  serverSource.includes("Never auto-insert the vocabulary word")&&
  serverSource.includes("never infer mastery")
);
assert("app-records-provenance-only",
  flowSource.includes("vocabularyRef:vocabEvidence")&&
  flowSource.includes("vocabulary_material:vocabEvidence")
);

console.log("VOCABULARY_MATERIAL_OWNERSHIP_PASS");
