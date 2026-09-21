import fs from "node:fs";
import vm from "node:vm";

const files=[
  "truth-guard-runtime.js",
  "mental-model-runtime.js",
  "curiosity-scaffold-runtime.js",
  "crew-presentation-guard.js",
  "voice-runtime.js"
];

const window={};
const context={
  window,Object,Array,String,Number,Math,Error,RegExp,Promise,Set,
  speechSynthesis:{cancel(){},speak(){}},
  SpeechSynthesisUtterance:function(text){this.text=text;}
};

for(const file of files){
  const source=fs.readFileSync(new URL("../"+file,import.meta.url),"utf8");
  vm.runInNewContext(source,context);
}

const truth=window.SnapPopTruthGuard;
const mental=window.SnapPopMentalModel;
const scaffold=window.SnapPopCuriosityScaffold;
const present=window.SnapPopCrewPresentationGuard;
const voice=window.SnapPopVoice;

function assert(name,condition){
  if(!condition) throw new Error("FAIL "+name);
  console.log("PASS",name);
}

const evidence=url=>[{source_type:"WEB",source_url:url,title:"source"}];

const fullRaw={
  kind:"ASK_UNDERSTAND",
  title:"provider title",
  core:"비는 수증기가 응결해 물방울이 되고 충분히 커지면 내려.",
  speakable:"비는 수증기가 응결해 물방울이 되고 충분히 커지면 내려.",
  verification:{
    mode:"CLAIM_EVIDENCE",
    coverage:"FULL_FACTUAL_CONTENT",
    unresolved:[],
    claims:[
      {claim:"수증기가 응결해 물방울이 된다.",status:"VERIFIED",evidence:evidence("https://example.com/a")},
      {claim:"물방울이 충분히 커지면 비로 내린다.",status:"VERIFIED",evidence:evidence("https://example.com/b")}
    ]
  }
};

const guardedFull=truth.guardKnowledge(fullRaw);
assert("truth-full-remains-verified",guardedFull.verified===true);

const shapedFull=scaffold.scaffoldKnowledge(guardedFull,"비는 왜 내려?","ko","GLOBAL");
assert("full-answer-can-build-cause-flow",
  shapedFull.mentalModel?.type==="FLOW"&&shapedFull.mentalModel.items.length===2
);
assert("full-answer-can-offer-one-optional-followup",
  typeof shapedFull.understanding.nextCuriosity==="string"&&shapedFull.understanding.followUpAvailable===true
);

const presentedFull=present.sanitizeUserFacing(shapedFull,{language:"ko"});
assert("presentation-keeps-truth-state",
  presentedFull.verified===true&&presentedFull.verification.verified===true
);
assert("presentation-keeps-verified-claim-text",
  presentedFull.mentalModel.items[0].text==="수증기가 응결해 물방울이 된다."
);
assert("presentation-owner-is-crew",presentedFull.responseOwner==="EXPLORATION_CREW");
assert("presentation-title-not-provider-owned",presentedFull.title==="확인해서 정리했어");
const fullHistory=present.publicHistoryEntry({...presentedFull,intent:"ASK_UNDERSTAND"},{language:"ko"});
assert("verified-history-status-is-explicit",
  fullHistory.verificationStatus==="FACT_VERIFIED"&&fullHistory.verified===true
);
assert("voice-can-read-guarded-full-answer",
  voice.guardedSpeechText(presentedFull.speakable)===presentedFull.speakable
);

const partialRaw={
  kind:"ASK_UNDERSTAND",
  core:"첫 문장은 확인됐지만 전체 설명은 아직 열려 있어.",
  speakable:"첫 문장은 확인됐지만 전체 설명은 아직 열려 있어.",
  verification:{
    mode:"CLAIM_EVIDENCE",
    coverage:"CLAIM_SET_ONLY",
    unresolved:["UNCITED_SENTENCE_2"],
    claims:[
      {claim:"첫 문장은 확인됐다.",status:"VERIFIED",evidence:evidence("https://example.com/a")}
    ]
  }
};

const guardedPartial=truth.guardKnowledge(partialRaw);
assert("partial-cannot-become-verified",guardedPartial.verified===false);

const shapedPartial=scaffold.scaffoldKnowledge(guardedPartial,"왜 그래?","ko","GLOBAL");
assert("partial-cannot-build-structural-flow",shapedPartial.mentalModel===null);
assert("partial-suppresses-followup",
  shapedPartial.understanding.nextCuriosity===null&&shapedPartial.understanding.followUpAvailable===false
);

const presentedPartial=present.sanitizeUserFacing(shapedPartial,{language:"ko"});
assert("presentation-cannot-upgrade-partial-truth",
  presentedPartial.verified===false&&presentedPartial.title==="확인된 부분부터 볼게"
);
const partialHistory=present.publicHistoryEntry({...presentedPartial,intent:"ASK_UNDERSTAND"},{language:"ko"});
assert("partial-history-status-needs-check",
  partialHistory.verificationStatus==="FACT_NEEDS_CHECK"&&partialHistory.verified===false
);
const thinkHistory=present.publicHistoryEntry({
  kind:"THINK_EXPRESS",
  intent:"THINK_EXPRESS",
  core:"내 생각을 펼쳐보는 기록",
  speakable:"내 생각을 펼쳐보는 기록"
},{language:"ko"});
assert("think-history-verification-not-applicable",
  thinkHistory.verificationStatus==="NOT_APPLICABLE"&&thinkHistory.verified===null
);

const writingFull=scaffold.scaffoldKnowledge(guardedFull,"비는 왜 내려?","ko","WRITING_FLOW");
assert("writing-flow-suppresses-followup-even-when-verified",
  writingFull.understanding.nextCuriosity===null&&
  writingFull.understanding.followUpReason==="WRITING_FLOW_RETURN_PRIORITY"
);

let presentationLeakBlocked=false;
try{
  present.sanitizeUserFacing({
    kind:"ASK_UNDERSTAND",
    verified:true,
    core:"As an AI, I can explain rain.",
    speakable:"As an AI, I can explain rain."
  },{language:"en"});
}catch(error){
  presentationLeakBlocked=error?.message==="CREW_PRESENTATION_IDENTITY_LEAK";
}
assert("presentation-self-identity-leak-fails-closed",presentationLeakBlocked);

let voiceLeakBlocked=false;
try{voice.guardedSpeechText("As an AI, I can explain rain.")}catch(error){
  voiceLeakBlocked=error?.message==="VOICE_IDENTITY_LEAK";
}
assert("voice-self-identity-leak-fails-closed",voiceLeakBlocked);

assert("mental-model-never-transforms-facts",
  shapedFull.mentalModel.transformsFacts===false&&
  shapedFull.mentalModel.items.every(x=>x.source==="VERIFIED_CLAIM_VERBATIM")
);

console.log("P1_P5_INTEGRATED_REGRESSION_PASS");
