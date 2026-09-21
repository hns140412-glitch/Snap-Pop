import handler from "../netlify/functions/snap-pop-knowledge.mjs";

const originalFetch=globalThis.fetch;
const originalKey=process.env.OPENAI_API_KEY;
const originalModel=process.env.SNAP_POP_KNOWLEDGE_MODEL;

function assert(name,condition){
  if(!condition) throw new Error("FAIL "+name);
  console.log("PASS",name);
}

async function call(body){
  const request=new Request("https://local.test/.netlify/functions/snap-pop-knowledge",{
    method:"POST",
    headers:{"content-type":"application/json"},
    body:JSON.stringify(body)
  });
  const response=await handler(request);
  return {status:response.status,body:await response.json()};
}

function responseFixture({text,citations=[],sources=[]}){
  return {
    output:[
      {
        type:"web_search_call",
        action:{sources}
      },
      {
        type:"message",
        content:[{
          type:"output_text",
          text,
          annotations:citations.map(x=>({
            type:"url_citation",
            url_citation:x
          }))
        }]
      }
    ]
  };
}

try{
  process.env.OPENAI_API_KEY="";
  process.env.SNAP_POP_KNOWLEDGE_MODEL="test-model";
  let result=await call({contract_version:"SNAP_POP_KNOWLEDGE_V1",input:"질문",language:"ko"});
  assert("missing-key-fails-closed",result.status===503&&result.body.error==="OPENAI_BACKEND_NOT_CONFIGURED");

  process.env.OPENAI_API_KEY="test-key";
  process.env.SNAP_POP_KNOWLEDGE_MODEL="test-model";

  const text="세종대왕은 1397년에 태어났어. 훈민정음은 1443년에 창제됐어.";
  const firstEnd=text.indexOf("。")>=0?text.indexOf("。")+1:text.indexOf(".")+1;
  globalThis.fetch=async()=>new Response(JSON.stringify(responseFixture({
    text,
    citations:[
      {start_index:0,end_index:firstEnd,title:"Source A",url:"https://example.com/a"},
      {start_index:firstEnd+1,end_index:text.length,title:"Source B",url:"https://example.com/b"}
    ],
    sources:[
      {type:"url",url:"https://example.com/a",title:"Source A"},
      {type:"url",url:"https://example.com/b",title:"Source B"}
    ]
  })),{status:200,headers:{"content-type":"application/json"}});

  result=await call({contract_version:"SNAP_POP_KNOWLEDGE_V1",input:"질문",language:"ko"});
  assert("all-cited-sentences-get-full-coverage",
    result.status===200&&
    result.body.answer.verification.coverage==="FULL_FACTUAL_CONTENT"&&
    result.body.answer.verification.claims.every(x=>x.status==="VERIFIED")
  );

  globalThis.fetch=async()=>new Response(JSON.stringify(responseFixture({
    text,
    citations:[
      {start_index:0,end_index:firstEnd,title:"Source A",url:"https://invented.example/fake"},
      {start_index:firstEnd+1,end_index:text.length,title:"Source B",url:"https://example.com/b"}
    ],
    sources:[
      {type:"url",url:"https://example.com/a",title:"Source A"},
      {type:"url",url:"https://example.com/b",title:"Source B"}
    ]
  })),{status:200,headers:{"content-type":"application/json"}});

  result=await call({contract_version:"SNAP_POP_KNOWLEDGE_V1",input:"질문",language:"ko"});
  assert("citation-url-must-exist-in-retrieved-source-set",
    result.status===200&&
    result.body.answer.verification.coverage==="CLAIM_SET_ONLY"&&
    result.body.answer.verification.claims[0].status==="UNVERIFIED"
  );

  globalThis.fetch=async()=>new Response(JSON.stringify(responseFixture({
    text,
    citations:[
      {start_index:0,end_index:firstEnd,title:"Source A",url:"https://example.com/a"}
    ],
    sources:[
      {type:"url",url:"https://example.com/a",title:"Source A"},
      {type:"url",url:"https://example.com/b",title:"Source B"}
    ]
  })),{status:200,headers:{"content-type":"application/json"}});

  result=await call({contract_version:"SNAP_POP_KNOWLEDGE_V1",input:"질문",language:"ko"});
  assert("uncited-sentence-blocks-full-coverage",
    result.status===200&&
    result.body.answer.verification.coverage==="CLAIM_SET_ONLY"&&
    result.body.answer.verification.unresolved.includes("UNCITED_SENTENCE_2")
  );

  console.log("KNOWLEDGE_SEARCH_CITATION_BOUNDARY_PASS");
} finally {
  globalThis.fetch=originalFetch;
  if(originalKey===undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY=originalKey;
  if(originalModel===undefined) delete process.env.SNAP_POP_KNOWLEDGE_MODEL; else process.env.SNAP_POP_KNOWLEDGE_MODEL=originalModel;
}
