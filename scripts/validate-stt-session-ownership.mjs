import fs from "node:fs";
import vm from "node:vm";

const guardSource=fs.readFileSync(new URL("../crew-presentation-guard.js",import.meta.url),"utf8");
const voiceSource=fs.readFileSync(new URL("../voice-runtime.js",import.meta.url),"utf8");

const sessions=[];
let providerStops=0;
const window={
  SnapPopVoiceProvider:{
    capabilities:{realtime:false},
    listen:async payload=>{
      sessions.push(payload);
      return ()=>{providerStops++};
    },
    stopListening:()=>{providerStops++}
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

let blockedContinuous=false;
try{voice.listenPolicy({continuous:true})}catch(error){
  blockedContinuous=error?.message==="VOICE_ALWAYS_LISTENING_NOT_ALLOWED";
}
assert("continuous-listening-blocked",blockedContinuous);

let blockedRealtime=false;
try{voice.listenPolicy({realtime:true})}catch(error){
  blockedRealtime=error?.message==="VOICE_ALWAYS_LISTENING_NOT_ALLOWED";
}
assert("realtime-listening-blocked",blockedRealtime);

const received=[];
await voice.listen({
  source:"USER_MIC",
  onText:text=>received.push("first:"+text),
  onEnd:()=>received.push("first:end")
});
const first=sessions[0];

await voice.listen({
  source:"USER_MIC",
  onText:text=>received.push("second:"+text),
  onEnd:()=>received.push("second:end")
});
const second=sessions[1];

assert("new-session-stops-previous",providerStops>=2);
assert("external-listen-forced-one-shot",
  second.oneShot===true&&second.continuous===false&&second.realtime===false&&
  second.responseOwner==="EXPLORATION_CREW"
);

first.onText("late");
first.onEnd();
assert("stale-callbacks-ignored",received.length===0);

second.onText("current");
second.onEnd();
assert("current-session-callbacks-pass",
  received.join("|")==="second:current|second:end"
);

const appSource=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
const imaginationSource=fs.readFileSync(new URL("../imagination-controller.js",import.meta.url),"utf8");
const supportSource=fs.readFileSync(new URL("../interaction-support-controller.js",import.meta.url),"utf8");
const listenCalls=(supportSource.match(/SnapPopVoice\.listen\(/g)||[]).length+(imaginationSource.match(/SnapPopVoice\.listen\(/g)||[]).length;
assert("explicit-mic-entry-only",
  listenCalls===2&&
  !appSource.includes("autoVoice")&&!supportSource.includes("autoVoice")&&
  imaginationSource.includes('q("#imaginationVoiceBtn").onclick=listenVoice')&&
  supportSource.includes('q("#voiceBtn").onclick')&&
  ((supportSource.match(/source:"USER_MIC"/g)||[]).length+(imaginationSource.match(/source:"USER_MIC"/g)||[]).length)===2
);
assert("home-radio-does-not-auto-start-mic",
  imaginationSource.includes('q("#homeRadio").onclick=()=>openImagination({language:"ko",source:"HOME_RADIO"})')
);
console.log("STT_SESSION_OWNERSHIP_PASS");
