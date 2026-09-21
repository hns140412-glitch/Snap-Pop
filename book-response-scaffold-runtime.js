(() => {
  "use strict";
  const VERSION="2026.09.22-a";
  const clean=(v,max=6000)=>typeof v==="string"?v.trim().slice(0,max):"";
  function isBookResponseContext(ctx={}){
    const hay=[ctx.subject,ctx.concept_skill_target,...(ctx.activity_types||[])].map(x=>String(x||"").toLowerCase()).join(" | ");
    return /(독후|독서|감상|book\s*report|book\s*response|reading\s*response)/i.test(hay);
  }
  function signals(text="",language="ko"){
    const t=clean(text);
    const en=language==="en";
    return {
      selectionReason:(en?/because|chose|picked|selected|wanted to read/i:/고른|선택|읽고 싶|이유|때문/).test(t),
      storyOrScene:(en?/story|scene|happened|character|part|moment/i:/줄거리|장면|인물|일어났|부분|내용/).test(t),
      memorableWhy:(en?/memorable|remember|stood out|because|made me feel/i:/기억에 남|인상|마음에 남|왜|때문/).test(t),
      ownPosition:(en?/i think|i feel|in my view|i would|i learned/i:/나는|내 생각|느꼈|나라면|배운|생각한다/).test(t)
    };
  }
  function nextMove({draft="",language="ko",learnerContext=null}={}){
    if(!isBookResponseContext(learnerContext||{})) return null;
    const s=signals(draft,language);
    const en=language==="en";
    if(!s.selectionReason) return {
      kind:"BOOK_RESPONSE_SCAFFOLD",focus:"SELECTION_REASON",
      question:en?"Why did you choose this book?":"이 책을 고른 이유를 네 말로 한 가지만 적어볼까?",
      hint:en?"One real reason is enough.":"멋진 이유보다 실제 이유 하나면 충분해."
    };
    if(!s.storyOrScene) return {
      kind:"BOOK_RESPONSE_SCAFFOLD",focus:"SCENE_OR_STORY",
      question:en?"What scene or part do you want to remember first?":"가장 먼저 떠오르는 장면이나 내용 한 부분은 뭐야?",
      hint:en?"Choose one part instead of retelling everything.":"전체 줄거리보다 한 장면이나 한 부분만 골라도 돼."
    };
    if(!s.memorableWhy) return {
      kind:"BOOK_RESPONSE_SCAFFOLD",focus:"WHY_MEMORABLE",
      question:en?"Why did that part stay with you?":"그 장면이나 부분이 왜 기억에 남았는지 한 가지만 붙여볼까?",
      hint:en?"A feeling, surprise, or connection is enough.":"느낌·놀라움·내 경험과의 연결 중 하나면 충분해."
    };
    if(!s.ownPosition) return {
      kind:"BOOK_RESPONSE_SCAFFOLD",focus:"OWN_POSITION",
      question:en?"What do you think about it in your own words?":"이 책이나 그 장면에 대한 네 생각을 네 말로 한 문장 남겨볼까?",
      hint:en?"It does not need to sound like a model answer.":"모범답안처럼 쓰지 않아도 돼. 네 생각이면 돼."
    };
    return {
      kind:"BOOK_RESPONSE_SCAFFOLD",focus:"TARGETED_REVISION",
      question:en?"Which one part would you like to make clearer?":"지금 글에서 더 분명하게 만들고 싶은 한 곳만 고쳐볼까?",
      hint:en?"Revise one place, not the whole draft.":"전체를 다시 쓰지 말고 한 곳만 다듬어봐."
    };
  }
  window.SnapPopBookResponseScaffold=Object.freeze({version:VERSION,isBookResponseContext,signals,nextMove});
})();