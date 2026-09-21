import fs from "node:fs";
import vm from "node:vm";

const guardSource=fs.readFileSync(new URL("../crew-presentation-guard.js",import.meta.url),"utf8");
const voiceSource=fs.readFileSync(new URL("../voice-runtime.js",import.meta.url),"utf8");
const appSource=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
const supportSource=fs.readFileSync(new URL("../interaction-support-controller.js",import.meta.url),"utf8");

const calls=[];
const window={
  SnapPopVoiceProvider:{
    speak:async payload=>{calls.push(payload);return {ok:true};}
  }
};

vm.runInNewContext(guardSource,{window,Object,Array,String,Number,Math,Error,RegExp});
vm.runInNewContext(voiceSource,{
  window,Object,Array,String,Number,Math,Error,RegExp,Promise,
  speechSynthesis:{cancel(){},speak(){}},
  SpeechSynthesisUtterance:function(text){this.text=text;}
});

const voice=window.SnapPopVoice;

function assert(name,condition){
  if(!condition) throw new Error("FAIL "+name);
  console.log("PASS",name);
}

const fact="AI 모델은 패턴을 학습해.";
assert("legitimate-ai-fact-preserved",voice.guardedSpeechText(fact)===fact);

let blocked=false;
try{voice.guardedSpeechText("As an AI, I can explain this.")}catch(error){
  blocked=error?.message==="VOICE_IDENTITY_LEAK";
}
assert("self-identity-speech-blocked",blocked);

await voice.speak("확인된 설명이야.",{language:"ko",voiceRole:"system"});
assert("external-voice-forced-to-crew",
  calls.length===1&&
  calls[0].voiceRole==="crew"&&
  calls[0].responseOwner==="EXPLORATION_CREW"&&
  calls[0].text==="확인된 설명이야."
);

assert("app-has-no-direct-speech-synthesis-bypass",
  !appSource.includes("new SpeechSynthesisUtterance(t)")&&
  !appSource.includes('if(!("speechSynthesis"in window))')&&
  !supportSource.includes("SpeechSynthesisUtterance")&&
  !supportSource.includes("speechSynthesis")
);

assert("app-requires-voice-runtime",
  supportSource.includes('if(!window.SnapPopVoice)throw new Error("VOICE_RUNTIME_UNAVAILABLE")')
);

console.log("VOICE_OWNERSHIP_BOUNDARY_PASS");
