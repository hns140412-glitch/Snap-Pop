import fs from "node:fs";
import vm from "node:vm";

const guardSource=fs.readFileSync(new URL("../crew-presentation-guard.js",import.meta.url),"utf8");
const voiceSource=fs.readFileSync(new URL("../voice-runtime.js",import.meta.url),"utf8");
const appSource=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");

const externalCalls=[];
const window={
  SnapPopVoiceProvider:{
    capabilities:{realtime:false},
    speak:async payload=>{externalCalls.push(payload);return {ok:true};}
  }
};

vm.runInNewContext(guardSource,{window,Object,Array,String,Number,Math,Error,RegExp});
vm.runInNewContext(voiceSource,{
  window,Object,Array,String,Number,Math,Error,RegExp,Promise,Set,
  speechSynthesis:{cancel(){},speak(){}},
  SpeechSynthesisUtterance:function(text){this.text=text;}
});

const voice=window.SnapPopVoice;

function assert(name,condition){
  if(!condition) throw new Error("FAIL "+name);
  console.log("PASS",name);
}

const koUser=voice.voicePolicy({language:"ko",source:"USER_TAP"});
const enUser=voice.voicePolicy({language:"en",source:"USER_TAP"});
const koAuto=voice.voicePolicy({language:"ko",source:"AUTO_READ"});

assert("user-tap-default-interrupts",koUser.interrupt===true&&koUser.userInitiated===true);
assert("auto-read-default-does-not-interrupt",koAuto.interrupt===false&&koAuto.autoAllowed===true);
assert("language-pacing-separated",koUser.browserRate!==enUser.browserRate&&koUser.browserRate===0.94&&enUser.browserRate===0.98);
assert("auto-read-is-more-bounded",koAuto.maxChars<koUser.maxChars);

await voice.speak("사용자가 눌러서 듣는 문장.",{language:"ko",source:"USER_TAP"});
await voice.speak("자동 읽기 문장.",{language:"ko",source:"AUTO_READ"});

assert("external-receives-initiation-policy",
  externalCalls[0].source==="USER_TAP"&&
  externalCalls[0].interrupt===true&&
  externalCalls[1].source==="AUTO_READ"&&
  externalCalls[1].interrupt===false
);

assert("realtime-not-inferred-from-external-provider",
  voice.capabilities().mode==="external"&&voice.capabilities().realtime===false
);

assert("auto-read-does-not-speak-hidden-hint",
  appSource.includes('speak(p[0],s.language,"AUTO_READ")')&&
  !appSource.includes('speak(p[0]+" "+p[1],s.language)')
);

assert("manual-listen-respects-revealed-hint-only",
  appSource.includes('(s.crewState?.hintLevel?p[1]:"")')
);

console.log("VOICE_QUALITY_POLICY_PASS");
