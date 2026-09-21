(() => {
  "use strict";

  const VERSION="2026.09.21-b";
  const LENSES=Object.freeze({
    MEANING:{ko:"뜻부터",en:"Meaning first"},
    ETYMOLOGY:{ko:"말의 뿌리",en:"Word roots"},
    CAUSE_EFFECT:{ko:"왜 → 그래서",en:"Why → what happened"},
    MECHANISM:{ko:"어떻게 작동해?",en:"How it works"},
    COMPARE:{ko:"같은 점 · 다른 점",en:"Same · different"},
    TIME_FLOW:{ko:"시간 순서",en:"Time flow"},
    PERSON_EVENT:{ko:"사람 · 사건",en:"Person · event"},
    PLACE_CONTEXT:{ko:"어디 · 왜 중요해?",en:"Where · why it matters"},
    CONCEPT:{ko:"핵심 개념",en:"Core concept"}
  });

  function classifyQuestion(input=""){
    const t=input.trim();
    if(!t) return "CONCEPT";
    if(/어원|유래|어근|한자|말.*어디서|word root|etymolog|origin of (the )?word/i.test(t)) return "ETYMOLOGY";
    if(/차이|비교|같은 점|다른 점|vs\.?|versus|difference|compare/i.test(t)) return "COMPARE";
    if(/언제|순서|먼저|다음|역사|시대|연표|when|timeline|history|before|after/i.test(t)) return "TIME_FLOW";
    if(/왜|이유|원인|때문|결과|그래서|why|cause|effect|result/i.test(t)) return "CAUSE_EFFECT";
    if(/어떻게.*(?:작동|움직|되는지|이루어)|원리|과정|how does|how do|mechanism|process/i.test(t)) return "MECHANISM";
    if(/뜻|의미|뭐야|무엇이야|what does .* mean|meaning of|what is /i.test(t)) return "MEANING";
    if(/누가|인물|왕|대통령|작가|과학자|who |person|inventor/i.test(t)) return "PERSON_EVENT";
    if(/어디|지역|나라|도시|위치|where|country|city|place/i.test(t)) return "PLACE_CONTEXT";
    return "CONCEPT";
  }

  function nextCuriosity(lens,language="ko"){
    const ko={
      MEANING:"이 뜻이 실제로 쓰이는 예를 하나 찾아볼까?",
      ETYMOLOGY:"이 뿌리가 들어간 다른 말도 하나 찾아볼까?",
      CAUSE_EFFECT:"원인이 하나 바뀌면 결과도 어떻게 달라질까?",
      MECHANISM:"과정 중 가장 중요한 한 단계를 골라볼까?",
      COMPARE:"둘 중 공통점 하나와 가장 큰 차이 하나를 잡아볼까?",
      TIME_FLOW:"앞뒤 사건 중 연결되는 한 장면을 더 볼까?",
      PERSON_EVENT:"이 사람이 한 행동이 어떤 변화를 만들었는지 볼까?",
      PLACE_CONTEXT:"이 장소가 왜 중요한지 한 가지 이유를 더 볼까?",
      CONCEPT:"이 개념을 네가 아는 것 하나와 연결해볼까?"
    };
    const en={
      MEANING:"Want to find one real example of how this meaning is used?",
      ETYMOLOGY:"Want to find one more word that shares this root?",
      CAUSE_EFFECT:"If one cause changed, how might the result change?",
      MECHANISM:"Which one step in the process seems most important?",
      COMPARE:"Can we pick one similarity and one biggest difference?",
      TIME_FLOW:"Want to connect one event before or after this?",
      PERSON_EVENT:"What change came from this person’s action?",
      PLACE_CONTEXT:"What is one reason this place matters?",
      CONCEPT:"What is one thing you already know that connects to this?"
    };
    return (language==="en"?en:ko)[lens]||(language==="en"?en.CONCEPT:ko.CONCEPT);
  }

  function scaffoldKnowledge(result={},input="",language="ko"){
    const lens=classifyQuestion(input);
    const label=LENSES[lens]?.[language==="en"?"en":"ko"]||LENSES.CONCEPT[language==="en"?"en":"ko"];
    const verifiedCount=Number(result?.verification?.verifiedClaimCount)||0;
    const coverage=result?.verification?.coverage||"UNKNOWN";
    const mental=window.SnapPopMentalModel;
    const mentalModel=mental&&typeof mental.build==="function"
      ? mental.build(result,lens,language)
      : null;
    return {
      ...result,
      mentalModel,
      understanding:{
        version:VERSION,
        lens,
        label,
        verifiedClaimCount:verifiedCount,
        coverage,
        nextCuriosity:nextCuriosity(lens,language),
        source:"QUESTION_STRUCTURE_ONLY"
      }
    };
  }

  window.SnapPopCuriosityScaffold=Object.freeze({
    version:VERSION,
    classifyQuestion,
    scaffoldKnowledge
  });
})();