import handler from "../netlify/functions/snap-pop-knowledge.mjs";

const originalFetch=globalThis.fetch;
const originalKey=process.env.OPENAI_API_KEY;
const originalModel=process.env.SNAP_POP_KNOWLEDGE_MODEL;

function assert(name,condition){
  if(!condition) throw new Error("FAIL "+name);
  console.log("PASS",name);
}
async function call(question_lens,fixture){
  globalThis.fetch=async()=>new Response(JSON.stringify(fixture),{status:200,headers:{"content-type":"application/json"}});
  const request=new Request("https://local.test/.netlify/functions/snap-pop-knowledge",{
    method:"POST",
    headers:{"content-type":"application/json"},
    body:JSON.stringify({contract_version:"SNAP_POP_KNOWLEDGE_V1",input:"질문",language:"ko",question_lens})
  });
  const response=await handler(request);
  return {status:response.status,body:await response.json()};
}
function fixture(urls){
  const text="첫 번째 사실이야. 두 번째 사실이야.";
  const firstEnd=text.indexOf(".")+1;
  const citations=[
    {start_index:0,end_index:firstEnd,title:"Source 1",url:urls[0]},
    {start_index:firstEnd+1,end_index:text.length,title:"Source 2",url:urls[1]||urls[0]}
  ];
  const sources=[...new Set(urls)].map((url,i)=>({type:"url",url,title:"Source "+(i+1)}));
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

  let result=await call("CONCEPT",fixture(["https://reddit.com/r/a","https://reddit.com/r/b"]));
  assert("community-only-cannot-reach-full-coverage",
    result.status===200&&
    result.body.answer.verification.coverage==="CLAIM_SET_ONLY"&&
    result.body.answer.verification.unresolved.includes("LOW_AUTHORITY_ONLY")&&
    result.body.answer.verification.communityOnlyBlocked===true&&
    result.body.answer.verification.eligibleSourceHostCount===0
  );
  assert("community-evidence-is-labelled",
    result.body.answer.verification.claims.flatMap(x=>x.evidence||[]).every(x=>x.source_quality==="COMMUNITY")
  );

  result=await call("CONCEPT",fixture(["https://example.edu/a","https://reddit.com/r/b"]));
  assert("eligible-plus-community-can-pass-when-fully-cited",
    result.status===200&&
    result.body.answer.verification.coverage==="FULL_FACTUAL_CONTENT"&&
    result.body.answer.verification.communityOnlyBlocked===false&&
    result.body.answer.verification.eligibleSourceHostCount===1
  );
  assert("institutional-source-is-labelled",
    result.body.answer.verification.claims.flatMap(x=>x.evidence||[]).some(x=>x.source_quality==="INSTITUTIONAL")
  );

  result=await call("ETYMOLOGY",fixture(["https://reddit.com/r/words","https://dictionary.example/root"]));
  assert("community-does-not-count-for-etymology-diversity",
    result.status===200&&
    result.body.answer.verification.coverage==="CLAIM_SET_ONLY"&&
    result.body.answer.verification.unresolved.includes("ETYMOLOGY_SOURCE_DIVERSITY_INSUFFICIENT")&&
    result.body.answer.verification.eligibleSourceHostCount===1
  );

  result=await call("ETYMOLOGY",fixture(["https://dictionary-a.example/root","https://linguistics.example.edu/root"]));
  assert("two-independent-non-community-etymology-sources-can-pass",
    result.status===200&&
    result.body.answer.verification.coverage==="FULL_FACTUAL_CONTENT"&&
    result.body.answer.verification.eligibleSourceHostCount===2
  );

  console.log("KNOWLEDGE_SOURCE_QUALITY_PASS");
}finally{
  globalThis.fetch=originalFetch;
  if(originalKey===undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY=originalKey;
  if(originalModel===undefined) delete process.env.SNAP_POP_KNOWLEDGE_MODEL; else process.env.SNAP_POP_KNOWLEDGE_MODEL=originalModel;
}
