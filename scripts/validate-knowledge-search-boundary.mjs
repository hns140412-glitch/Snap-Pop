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

try{
  process.env.OPENAI_API_KEY="";
  process.env.SNAP_POP_KNOWLEDGE_MODEL="test-model";
  let result=await call({contract_version:"SNAP_POP_KNOWLEDGE_V1",input:"질문",language:"ko"});
  assert("missing-key-fails-closed",result.status===503&&result.body.error==="OPENAI_BACKEND_NOT_CONFIGURED");

  process.env.OPENAI_API_KEY="test-key";
  process.env.SNAP_POP_KNOWLEDGE_MODEL="test-model";

  globalThis.fetch=async()=>new Response(JSON.stringify({
    output:[
      {
        type:"web_search_call",
        action:{sources:[{type:"url",url:"https://example.com/real",title:"Real source"}]}
      },
      {
        type:"message",
        content:[{
          type:"output_text",
          text:JSON.stringify({
            title:"확인한 답",
            core:"검증된 설명",
            nodes:[],
            example:null,
            speakable:"검증된 설명",
            claims:[{claim:"검증 주장",source_urls:["https://example.com/real"]}],
            unresolved:[]
          })
        }]
      }
    ]
  }),{status:200,headers:{"content-type":"application/json"}});

  result=await call({contract_version:"SNAP_POP_KNOWLEDGE_V1",input:"질문",language:"ko"});
  assert("retrieved-source-promotes-evidence",
    result.status===200&&
    result.body.answer.verification.coverage==="CLAIM_SET_ONLY"&&
    result.body.answer.verification.claims[0].status==="VERIFIED"&&
    result.body.answer.verification.claims[0].evidence[0].source_url==="https://example.com/real"
  );

  globalThis.fetch=async()=>new Response(JSON.stringify({
    output:[
      {
        type:"web_search_call",
        action:{sources:[{type:"url",url:"https://example.com/real",title:"Real source"}]}
      },
      {
        type:"message",
        content:[{
          type:"output_text",
          text:JSON.stringify({
            title:"답",
            core:"설명",
            nodes:[],
            example:null,
            speakable:"설명",
            claims:[{claim:"주장",source_urls:["https://invented.example/fake"]}],
            unresolved:[]
          })
        }]
      }
    ]
  }),{status:200,headers:{"content-type":"application/json"}});

  result=await call({contract_version:"SNAP_POP_KNOWLEDGE_V1",input:"질문",language:"ko"});
  assert("invented-url-cannot-promote",
    result.status===200&&
    result.body.answer.verification.claims[0].status==="UNVERIFIED"&&
    result.body.answer.verification.claims[0].evidence.length===0&&
    result.body.answer.verification.unresolved.includes("CLAIM_SOURCE_NOT_IN_RETRIEVED_SET")
  );

  globalThis.fetch=async()=>new Response(JSON.stringify({
    output:[{
      type:"message",
      content:[{
        type:"output_text",
        text:JSON.stringify({
          title:"답",
          core:"설명",
          nodes:[],
          example:null,
          speakable:"설명",
          claims:[{claim:"주장",source_urls:["https://example.com/real"]}],
          unresolved:[]
        })
      }]
    }]
  }),{status:200,headers:{"content-type":"application/json"}});

  result=await call({contract_version:"SNAP_POP_KNOWLEDGE_V1",input:"질문",language:"ko"});
  assert("no-search-source-remains-unverified",
    result.status===200&&
    result.body.answer.verification.claims[0].status==="UNVERIFIED"
  );

  console.log("KNOWLEDGE_SEARCH_BOUNDARY_STATIC_CONTRACT_PASS");
} finally {
  globalThis.fetch=originalFetch;
  if(originalKey===undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY=originalKey;
  if(originalModel===undefined) delete process.env.SNAP_POP_KNOWLEDGE_MODEL; else process.env.SNAP_POP_KNOWLEDGE_MODEL=originalModel;
}
