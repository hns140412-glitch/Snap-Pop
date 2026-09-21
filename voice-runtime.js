(() => {
  "use strict";
  const VERSION="2026.09.21-d";
  let currentRecognition=null;
  let currentExternalListenStop=null;
  let listenSessionSeq=0;
  const SPEECH_SOURCES=new Set(["USER_TAP","AUTO_READ"]);
  const LISTEN_SOURCES=new Set(["USER_MIC"]);
  function voicePolicy({language="ko",source="USER_TAP",interrupt}={}){
    const safeLanguage=language==="en"?"en":"ko";
    const safeSource=SPEECH_SOURCES.has(source)?source:"USER_TAP";
    const userInitiated=safeSource==="USER_TAP";
    return Object.freeze({
      language:safeLanguage,
      source:safeSource,
      userInitiated,
      autoAllowed:safeSource==="AUTO_READ",
      interrupt:typeof interrupt==="boolean"?interrupt:userInitiated,
      browserRate:safeLanguage==="en"?0.98:0.94,
      browserPitch:1,
      maxChars:userInitiated?1600:700
    });
  }
  function guardedSpeechText(text,maxChars=1600){
    const value=typeof text==="string"?text.trim().slice(0,Math.max(1,Math.min(1600,maxChars))):"";
    if(!value) throw new Error("VOICE_EMPTY_TEXT");
    const presentation=window.SnapPopCrewPresentationGuard;
    if(presentation&&typeof presentation.hasSelfIdentityLeak==="function"&&presentation.hasSelfIdentityLeak(value)){
      throw new Error("VOICE_IDENTITY_LEAK");
    }
    return value;
  }
  function browserSpeak(text,policy){
    if(!("speechSynthesis" in window)) return Promise.reject(new Error("TTS_UNAVAILABLE"));
    if(policy.interrupt) speechSynthesis.cancel();
    return new Promise((resolve,reject)=>{
      const u=new SpeechSynthesisUtterance(text);
      u.lang=policy.language==="en"?"en-US":"ko-KR";
      u.rate=policy.browserRate;
      u.pitch=policy.browserPitch;
      u.onend=()=>resolve({provider:"browser-tts",policy});
      u.onerror=e=>reject(e.error||new Error("TTS_ERROR"));
      speechSynthesis.speak(u);
    });
  }
  async function speak(text,{language="ko",voiceRole="crew",interrupt,source="USER_TAP"}={}){
    const policy=voicePolicy({language,source,interrupt});
    const safeText=guardedSpeechText(text,policy.maxChars);
    const safeRole=voiceRole==="crew"?"crew":"crew";
    if(policy.interrupt) stopSpeaking();
    const external=window.SnapPopVoiceProvider;
    if(external && typeof external.speak==="function"){
      return external.speak({
        text:safeText,
        language:policy.language,
        voiceRole:safeRole,
        responseOwner:"EXPLORATION_CREW",
        source:policy.source,
        interrupt:policy.interrupt,
        pacing:{
          rate:policy.browserRate,
          pitch:policy.browserPitch
        }
      });
    }
    return browserSpeak(safeText,policy);
  }
  function stopSpeaking(){
    try{ window.SnapPopVoiceProvider?.stop?.(); }catch{}
    try{ speechSynthesis?.cancel?.(); }catch{}
  }
  function listenPolicy({language="ko",source="USER_MIC",continuous=false,realtime=false}={}){
    const safeLanguage=language==="en"?"en":"ko";
    const safeSource=LISTEN_SOURCES.has(source)?source:"USER_MIC";
    if(continuous===true||realtime===true) throw new Error("VOICE_ALWAYS_LISTENING_NOT_ALLOWED");
    return Object.freeze({
      language:safeLanguage,
      source:safeSource,
      oneShot:true,
      continuous:false,
      realtime:false,
      responseOwner:"EXPLORATION_CREW"
    });
  }
  function browserListen({policy,onStart,onText,onError,onEnd,sessionId}={}){
    const R=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!R) throw new Error("STT_UNAVAILABLE");
    if(currentRecognition){try{currentRecognition.abort()}catch{}}
    const r=new R(); currentRecognition=r;
    r.lang=policy.language==="en"?"en-US":"ko-KR";
    r.interimResults=false; r.continuous=false;
    r.onstart=()=>onStart?.({provider:"browser-stt",sessionId,source:policy.source});
    r.onresult=e=>{const text=e.results?.[0]?.[0]?.transcript||""; if(text) onText?.(text,{provider:"browser-stt",sessionId,source:policy.source});};
    r.onerror=e=>onError?.(e.error||"STT_ERROR");
    r.onend=()=>{if(currentRecognition===r)currentRecognition=null;onEnd?.({sessionId});};
    r.start();
    return ()=>{try{r.abort()}catch{}};
  }
  async function listen(opts={}){
    const policy=listenPolicy(opts);
    stopListening();
    const sessionId=++listenSessionSeq;
    const external=window.SnapPopVoiceProvider;
    if(external && typeof external.listen==="function"){
      const result=await external.listen({
        language:policy.language,
        source:policy.source,
        oneShot:true,
        continuous:false,
        realtime:false,
        responseOwner:"EXPLORATION_CREW",
        sessionId,
        onStart:opts.onStart,
        onText:opts.onText,
        onError:opts.onError,
        onEnd:opts.onEnd
      });
      currentExternalListenStop=typeof result==="function"
        ? result
        : typeof result?.stop==="function"
          ? ()=>result.stop()
          : null;
      return result;
    }
    return browserListen({...opts,policy,sessionId});
  }
  function stopListening(){
    try{ currentExternalListenStop?.(); }catch{}
    currentExternalListenStop=null;
    try{ window.SnapPopVoiceProvider?.stopListening?.(); }catch{}
    if(currentRecognition){try{currentRecognition.abort()}catch{} currentRecognition=null;}
  }
  function capabilities(){
    const external=window.SnapPopVoiceProvider;
    const extCaps=external&&typeof external.capabilities==="object"?external.capabilities:{};
    return Object.freeze({
      mode:external?"external":"browser-fallback",
      tts:!!(external?.speak||("speechSynthesis" in window)),
      stt:!!(external?.listen||window.SpeechRecognition||window.webkitSpeechRecognition),
      realtime:extCaps.realtime===true,
      browserFallback:!external
    });
  }
  window.SnapPopVoice=Object.freeze({version:VERSION,speak,listen,stopSpeaking,stopListening,guardedSpeechText,voicePolicy,listenPolicy,capabilities,get mode(){return capabilities().mode;}});
})();