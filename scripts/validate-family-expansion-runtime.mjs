import fs from "node:fs";
import vm from "node:vm";

const runtime=fs.readFileSync(new URL("../family-expansion-runtime.js",import.meta.url),"utf8");
const app=fs.readFileSync(new URL("../family-expansion-app.js",import.meta.url),"utf8");
const index=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const matrix=JSON.parse(fs.readFileSync(new URL("../data/snap-pop-requirement-matrix.json",import.meta.url),"utf8"));
const window={};
vm.runInNewContext(runtime,{window,Object,Array,String,Number,Math,Date,RegExp,Error});
const r=window.SnapPopFamilyExpansion;
function assert(name,c){if(!c)throw new Error("FAIL "+name);console.log("PASS",name)}
assert("feature-flag-separates-original-and-family",r.contracts.featureFlagRequired===true&&r.contracts.originalModePreserved===true&&app.includes("familyExpansionEnabled"));
assert("diary-active",r.features.DIARY.state==="ACTIVE");
assert("letter-active",r.features.LETTER.state==="ACTIVE");
assert("shared-special-active",r.features.SHARED_SPECIAL.state==="ACTIVE");
assert("family-timeline-active",r.features.FAMILY_TIMELINE.state==="ACTIVE");
assert("multi-child-active",r.features.MULTI_CHILD.state==="ACTIVE");
assert("child-id-isolation-required",r.contracts.childIdIsolationRequired===true&&r.contracts.crossChildMutationAllowed===false);
assert("family-group-permission-contract-present",!!r.roles.PARENT&&r.contracts.sharedPermissionAuthority===false);
assert("mailbox-decor-recovery-locked",r.features.MAILBOX_DECOR.state==="RECOVERY_LOCKED");
assert("support-card-active",r.features.SUPPORT_CARD.state==="ACTIVE");
assert("gem-gift-conflict-locked-no-economy",r.features.GEM_GIFT.state==="CONFLICT_LOCKED"&&r.contracts.gemGiftEconomyMutationAllowed===false);
assert("composite-diary-illustration-recovery-locked",r.features.COMPOSITE_DIARY_ILLUSTRATION.state==="RECOVERY_LOCKED");
const a=r.createArtifact("DIARY",{childId:"child_a",text:"오늘의 기록"});
assert("artifact-child-scoped",a.childId==="child_a"&&a.crossChildMutationAllowed===false&&a.ghostwritingAllowed===false);
let blocked=false;try{r.createArtifact("GEM_GIFT",{childId:"child_a",text:"gift"})}catch(e){blocked=/CONFLICT_LOCKED/.test(e.message)}
assert("gem-gift-cannot-create-artifact",blocked);
const tl=r.timeline([a,r.createArtifact("DIARY",{childId:"child_b",text:"다른 아이"})],"child_a");
assert("timeline-does-not-cross-child",tl.length===1&&tl[0].childId==="child_a");
assert("family-ui-present",index.includes('id="familyExpansion"')&&index.includes('id="familyExpansionToggle"')&&index.includes('id="familyChildSelect"'));
const family=matrix.requirements.filter(x=>x.domain==="FAMILY_EXPANSION");
assert("all-family-items-coded-static-runtime",family.length===11&&family.every(x=>x.coded===true&&x.staticVerified===true&&x.runtimeVerified===true&&x.deviceVerified===false));
console.log("FAMILY_EXPANSION_RUNTIME_PASS");
