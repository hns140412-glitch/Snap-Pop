(() => {
  "use strict";
  const VERSION="2026.09.21-b";
  let currentRecognition=null;
  function guardedSpeechText(text){
    const value=typeof text==="string"?text.trim().slice(0,1600):"";
    if(!value) throw new Error("VOICE_EMPTY_TEXT");
    const presentation=window.SnapPopCrewPresentationGuard;
    if(presentation&&typeof presentation.hasSelfIdentityLeak==="function"&&presentation.hasSelfIdentityLeak(value)){
      throw new Error("VOICE_IDENTITY_LEAK");
    }
    return value;
  }
  function browserSpeak(text,language="ko"){
    if(!("speechSynthesis" in window)) return Promise.reject(new Error("TTS_UNAVAILABLE"));
    speechSynthesis.cancel();
    return new Promise((resolve,reject)=>{
      const u=new SpeechSynthesisUtterance(text);
      u.lang=language==="en"?"en-US":"ko-KR";
      u.rate=0.96;
      u.onend=()=>resolve({provider:"browser-tts"});
      u.onerror=e=>reject(e.error||new Error("TTS_ERROR"));
      speechSynthesis.speak(u);
    });
  }
  async function speak(text,{language="ko",voiceRole="crew",interrupt=true}={}){
    const safeText=guardedSpeechText(text);
    const safeLanguage=language==="en"?"en":"ko";
    const safeRole=voiceRole==="crew"?"crew":"crew";
    if(interrupt) stopSpeaking();
    const external=window.SnapPopVoiceProvider;
    if(external && typeof external.speak==="function"){
      return external.speak({
        text:safeText,
        language:safeLanguage,
        voiceRole:safeRole,
        responseOwner:"EXPLORATION_CREW"
      });
    }
    return browserSpeak(safeText,safeLanguage);
  }
  function stopSpeaking(){
    try{ window.SnapPopVoiceProvider?.stop?.(); }catch{}
    try{ speechSynthesis?.cancel?.(); }catch{}
  }
  function browserListen({language="ko",onStart,onText,onError,onEnd}={}){
    const R=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!R) throw new Error("STT_UNAVAILABLE");
    if(currentRecognition){try{currentRecognition.abort()}catch{}}
    const r=new R(); currentRecognition=r;
    r.lang=language==="en"?"en-US":"ko-KR";
    r.interimResults=false; r.continuous=false;
    r.onstart=()=>onStart?.({provider:"browser-stt"});
    r.onresult=e=>{const text=e.results?.[0]?.[0]?.transcript||""; if(text) onText?.(text,{provider:"browser-stt"});};
    r.onerror=e=>onError?.(e.error||"STT_ERROR");
    r.onend=()=>{if(currentRecognition===r)currentRecognition=null;onEnd?.()};
    r.start();
    return ()=>{try{r.abort()}catch{}};
  }
  async function listen(opts={}){
    const external=window.SnapPopVoiceProvider;
    if(external && typeof external.listen==="function") return external.listen(opts);
    return browserListen(opts);
  }
  function stopListening(){
    try{ window.SnapPopVoiceProvider?.stopListening?.(); }catch{}
    if(currentRecognition){try{currentRecognition.abort()}catch{} currentRecognition=null;}
  }
  window.SnapPopVoice=Object.freeze({version:VERSION,speak,listen,stopSpeaking,stopListening,guardedSpeechText,get mode(){return window.SnapPopVoiceProvider?"external":"browser-fallback";}});
})();