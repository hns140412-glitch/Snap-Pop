import fs from "node:fs";

const voice=fs.readFileSync(new URL("../voice-runtime.js",import.meta.url),"utf8");
const app=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
const index=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const imagination=fs.readFileSync(new URL("../imagination-controller.js",import.meta.url),"utf8");
const support=fs.readFileSync(new URL("../interaction-support-controller.js",import.meta.url),"utf8");

function assert(name,condition){
  if(!condition) throw new Error("FAIL "+name);
  console.log("PASS",name);
}

assert("tts-and-stt-are-separate-runtime-functions",
  voice.includes("async function speak(")&&
  voice.includes("async function listen(")&&
  voice.includes("function stopSpeaking()")&&
  voice.includes("function stopListening()")
);

assert("listen-is-one-shot-not-always-listening",
  voice.includes("VOICE_ALWAYS_LISTENING_NOT_ALLOWED")&&
  voice.includes("oneShot:true")&&
  voice.includes("continuous:false")&&
  voice.includes("realtime:false")
);

assert("listening-button-only-reads-current-prompt",
  index.includes('id="listenBtn"')&&
  support.includes('q("#listenBtn").onclick')&&
  support.includes('await speak(p[0]+" "+(s.crewState?.hintLevel?p[1]:"")')
);

assert("voice-input-is-explicit-separate-control",
  index.includes('id="voiceBtn"')&&
  index.includes("말해서 쓰기")&&
  support.includes('q("#voiceBtn").onclick')
);

assert("voice-input-appends-child-transcript-to-draft",
  support.includes('q("#answer").value+=((q("#answer").value?" ":"")+t)')&&
  support.includes('q("#answer").dispatchEvent(new Event("input"))')
);

assert("radio-is-imagination-entry-not-writing-landmark",
  index.includes('id="homeRadio"')&&
  imagination.includes('q("#homeRadio").onclick=()=>openImagination({language:"ko",source:"HOME_RADIO"})')&&
  !app.includes('landmark:"radio"')
);

assert("radio-is-not-sixth-writing-tool",
  !index.includes('data-landmark="radio"')&&
  !app.includes('marks.push({id:"radio"')&&
  !app.includes('QUESTION_BANK.radio')
);

assert("voice-fallback-does-not-block-text-flow",
  support.includes("지금은 음성으로 읽어주기 어려워요. 글로 계속 볼 수 있어요.")&&
  support.includes("이 기기에서는 지금 음성 입력을 사용할 수 없어요.")
);

assert("external-provider-remains-optional",
  voice.includes("window.SnapPopVoiceProvider")&&
  voice.includes('mode:external?"external":"browser-fallback"')
);

console.log("VOICE_BOUNDARY_CONTRACT_PASS");
