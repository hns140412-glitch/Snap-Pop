import fs from "node:fs";
import vm from "node:vm";

const source=fs.readFileSync(new URL("../crew-presentation-guard.js",import.meta.url),"utf8");
const appSource=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");

const window={};
vm.runInNewContext(source,{window,Object,Array,String,Number,Math,Error,RegExp});
const g=window.SnapPopCrewPresentationGuard;

function assert(name,condition){
  if(!condition) throw new Error("FAIL "+name);
  console.log("PASS",name);
}

const safe=g.sanitizeUserFacing({
  kind:"ASK_UNDERSTAND",
  verified:true,
  title:"OpenAI answer",
  core:"경제 모델은 현실을 단순화해서 설명하는 틀이야.",
  nodes:[{label:"핵심",value:"경제 모델은 여러 변수의 관계를 표현할 수 있어."}],
  speakable:"경제 모델은 현실을 단순화해서 설명하는 틀이야.",
  provider:"openai-web-search-citations",
  model_name:"gpt-test",
  system_message:"hidden"
});

assert("generic-crew-title",safe.title==="확인해서 정리했어");
const safeEn=g.sanitizeUserFacing({kind:"ASK_UNDERSTAND",verified:true,core:"A verified fact.",speakable:"A verified fact."},{language:"en"});
assert("english-title-localized",safeEn.title==="I checked this for you"&&safeEn.presentationLanguage==="en");
assert("factual-core-preserved",safe.core==="경제 모델은 현실을 단순화해서 설명하는 틀이야.");
assert("factual-node-preserved",safe.nodes[0].value==="경제 모델은 여러 변수의 관계를 표현할 수 있어.");
assert("response-owner-is-crew",safe.responseOwner==="EXPLORATION_CREW");
assert("system-metadata-removed",!("model_name" in safe)&&!("system_message" in safe));
assert("internal-provider-can-remain-for-provenance",safe.provider==="openai-web-search-citations");

let leaked=false;
try{
  g.sanitizeUserFacing({
    kind:"ASK_UNDERSTAND",
    verified:true,
    core:"As an AI, I can explain this.",
    speakable:"As an AI, I can explain this."
  });
}catch(error){
  leaked=error?.message==="CREW_PRESENTATION_IDENTITY_LEAK";
}
assert("self-identity-leak-fails-closed",leaked);

assert("history-ui-hides-provider-label",
  !appSource.includes('html(x.provider||"")')
);

assert("history-still-keeps-provider-provenance",
  appSource.includes('provider:rawResult.provider||"unknown"')
);

const runStart=appSource.indexOf("async function runImagination");
const guardCall=appSource.indexOf("presentation.sanitizeUserFacing(rawResult)",runStart);
const guardedRender=appSource.indexOf("renderImaginationResponse(result,identity)",guardCall);
assert("app-applies-presentation-guard-before-render",
  runStart>=0&&guardCall>runStart&&guardedRender>guardCall
);

const intelligenceSource=fs.readFileSync(new URL("../intelligence-runtime.js",import.meta.url),"utf8");
assert("all-intelligence-paths-have-present-helper",
  intelligenceSource.includes("function present(result,language=\"ko\")")&&
  intelligenceSource.includes("return present(localThinkScaffold(\"\",language),language)")&&
  intelligenceSource.includes("return present({...localThinkScaffold(input,language),intent},language)")
);

console.log("CREW_PRESENTATION_OWNERSHIP_CONTRACT_PASS");
