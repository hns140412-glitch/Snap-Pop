(() => {
  "use strict";

  const VERSION="2026.09.21-a";

  function state({emptyAdvanceAttempts=0,hintLevel=0,language="ko"}={}){
    const attempts=Math.max(0,Number(emptyAdvanceAttempts)||0);
    const hintShown=(Number(hintLevel)||0)>0;
    const en=language==="en";

    if(hintShown){
      return {
        stage:"WAIT_AFTER_HINT",
        autoRevealHint:false,
        autoWrite:false,
        message:en
          ?"You already have one hint. Take your time with it."
          :"힌트 하나는 이미 있어. 천천히 생각해도 돼."
      };
    }

    if(attempts<=1){
      return {
        stage:"WAIT",
        autoRevealHint:false,
        autoWrite:false,
        message:en
          ?"No rush. I’ll wait here."
          :"급할 건 없어. 여기서 기다릴게."
      };
    }

    if(attempts===2){
      return {
        stage:"HINT_OFFER",
        autoRevealHint:false,
        autoWrite:false,
        message:en
          ?"If you want, you can open just one small hint."
          :"원하면 작은 힌트 하나만 열어봐도 돼."
      };
    }

    return {
      stage:"MINIMAL_REASK",
      autoRevealHint:false,
      autoWrite:false,
      message:en
        ?"What is the smallest piece you want to start with?"
        :"가장 작은 한 조각부터 시작한다면 뭐가 떠올라?"
    };
  }

  window.SnapPopCrewIntervention=Object.freeze({
    version:VERSION,
    state
  });
})();