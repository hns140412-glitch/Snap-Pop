import handler from "../netlify/functions/snap-pop-knowledge.mjs";

const originalFetch=globalThis.fetch;
const originalKey=process.env.OPENAI_API_KEY;
const originalModel=process.env.SNAP_POP_KNOWLEDGE_MODEL;

function assert(name,condition){
  if(!condition) throw new Error("FAIL "+name);
  console.log("PASS",name);
}

async function call(question_lens,fixture){
  globalThis.fetch=async()=>new Response(JSON.stringify(fixture),{
    status:200,
    headers:{"content-type":"application/json"}
  });
  const request=new Request("https://local.test/.netlify/functions/snap-pop-knowledge",{
    method:"POST",
    headers:{"content-type":"application/json"},
    body:JSON.stringify({
      contract_version:"SNAP_POP_KNOWLEDGE_V1",
      input:"어원 질문",
      language:"ko",
      question_lens
    })
  });
  const response=await handler(request);
  return {status:response.status,body:await response.json()};
}

function fixture(urls){
  const text="이 말의 뿌리는 A에서 왔어. 이후 B 뜻으로 넓어졌어.";
  const firstEnd=text.indexOf(".")+1;
  const sources=urls.map((url,i)=>({type:"url",url,title:"Source "+(i+1)}));
  const citations=[
    {start_index:0,end_index:firstEnd,title:"Source 1",url:urls[0]},
    {start_index:firstEnd+1,end_index:text.length,title:"Source 2",url:urls[1]||urls[0]}
  ];
  return {
    output:[
      {type:"web_search_call",action:{sources}},
      {type:"message",content:[{type:"output_text",text,annotations:citations.map(x=>({type:"url_citation",url_citation:x}))}]}
    ]
  };
}

try{
  process.env.OPENAI_API_KEY="test-key";
  process.env.SNAP_POP_KNOWLEDGE_MODEL="test-model";

  let result=await call("ETYMOLOGY",fixture([
    "https://example.com/a",
    "https://example.com/b"
  ]));
  assert("same-host-etymology-not-full-coverage",
    result.status===200&&
    result.body.answer.verification.coverage==="CLAIM_SET_ONLY"&&
    result.body.answer.verification.unresolved.includes("ETYMOLOGY_SOURCE_DIVERSITY_INSUFFICIENT")&&
    result.body.answer.verification.sourceHostCount===1
  );

  result=await call("ETYMOLOGY",fixture([
    "https://source-a.example/a",
    "https://source-b.example/b"
  ]));
  assert("two-host-etymology-can-reach-full-coverage",
    result.status===200&&
    result.body.answer.verification.coverage==="FULL_FACTUAL_CONTENT"&&
    result.body.answer.verification.sourceHostCount===2&&
    result.body.answer.verification.etymologySourceDiversityRequired===true
  );

  result=await call("CONCEPT",fixture([
    "https://example.com/a",
    "https://example.com/b"
  ]));
  assert("general-concept-keeps-normal-coverage-rule",
    result.status===200&&
    result.body.answer.verification.coverage==="FULL_FACTUAL_CONTENT"&&
    result.body.answer.verification.etymologySourceDiversityRequired===false
  );

  console.log("ETYMOLOGY_SOURCE_DIVERSITY_PASS");
} finally {
  globalThis.fetch=originalFetch;
  if(originalKey===undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY=originalKey;
  if(originalModel===undefined) delete process.env.SNAP_POP_KNOWLEDGE_MODEL; else process.env.SNAP_POP_KNOWLEDGE_MODEL=originalModel;
}
