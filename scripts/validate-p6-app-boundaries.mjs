import fs from "node:fs";

const app=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
const voice=fs.readFileSync(new URL("../voice-runtime.js",import.meta.url),"utf8");
const guard=fs.readFileSync(new URL("../crew-presentation-guard.js",import.meta.url),"utf8");
const imagination=fs.readFileSync(new URL("../imagination-controller.js",import.meta.url),"utf8");
const support=fs.readFileSync(new URL("../interaction-support-controller.js",import.meta.url),"utf8");

function assert(name,condition){
  if(!condition) throw new Error("FAIL "+name);
  console.log("PASS",name);
}

assert("no-verified-not-false-in-app",!/verified\s*!==\s*false/.test(app));
assert("no-autoVoice-in-app",!/\bautoVoice\b/.test(app));
assert("no-direct-browser-tts-in-app",
  !/new\s+SpeechSynthesisUtterance/.test(app)&&
  !/speechSynthesis\.speak/.test(app)
);
assert("browser-tts-only-inside-voice-runtime",
  /new\s+SpeechSynthesisUtterance/.test(voice)&&
  /function browserSpeak/.test(voice)
);
assert("history-uses-tri-state-labels",
  (app.includes("FACT_VERIFIED")||imagination.includes("FACT_VERIFIED")||support.includes("FACT_VERIFIED"))&&
  (app.includes("FACT_NEEDS_CHECK")||imagination.includes("FACT_NEEDS_CHECK")||support.includes("FACT_NEEDS_CHECK"))&&
  (app.includes("NOT_APPLICABLE")||imagination.includes("NOT_APPLICABLE")||support.includes("NOT_APPLICABLE"))&&
  support.includes("생각 기록")
);
assert("provider-not-shown-in-cloud-history",
  !app.includes('html(x.provider||"")')&&!imagination.includes('esc(x.provider||"")')&&!support.includes('esc(x.provider||"")')
);
assert("provider-provenance-still-internal",
  imagination.includes('provider:rawResult.provider||"unknown"')
);
assert("presentation-guard-removes-system-meta",
  guard.includes("delete next.system_message")&&
  guard.includes("delete next.developer_message")&&
  guard.includes("delete next.model_name")&&
  guard.includes("delete next.raw_response")
);
assert("exact-two-user-mic-listen-calls",
  ((support.match(/SnapPopVoice\.listen\(/g)||[]).length+(imagination.match(/SnapPopVoice\.listen\(/g)||[]).length)===2&&
  ((support.match(/source:"USER_MIC"/g)||[]).length+(imagination.match(/source:"USER_MIC"/g)||[]).length)===2
);
assert("home-radio-does-not-auto-listen",
  imagination.includes('q("#homeRadio").onclick=()=>openImagination({language:"ko",source:"HOME_RADIO"})')
);

console.log("P6_APP_BOUNDARY_STATIC_PASS");
