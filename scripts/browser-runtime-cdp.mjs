const sleep=ms=>new Promise(r=>setTimeout(r,ms));

async function getTarget(){
  for(let i=0;i<200;i++){
    try{
      const targets=await fetch("http://127.0.0.1:9222/json").then(r=>r.json());
      const page=targets.find(x=>x.type==="page"&&/index\\.html/.test(x.url))||targets.find(x=>x.type==="page");
      if(page?.webSocketDebuggerUrl)return page;
    }catch{}
    await sleep(100);
  }
  let version=null; try{version=await fetch("http://127.0.0.1:9222/json/version").then(r=>r.text())}catch{}
  throw new Error("CDP_TARGET_NOT_FOUND version="+String(version||"UNAVAILABLE"));
}

const target=await getTarget();
const ws=new WebSocket(target.webSocketDebuggerUrl);
const pending=new Map();
let seq=0;
ws.onmessage=event=>{
  const msg=JSON.parse(String(event.data));
  if(msg.id&&pending.has(msg.id)){
    const p=pending.get(msg.id);pending.delete(msg.id);
    if(msg.error)p.reject(new Error(msg.error.message||"CDP_ERROR"));else p.resolve(msg.result);
  }
};
await new Promise((resolve,reject)=>{
  ws.onopen=resolve;
  ws.onerror=()=>reject(new Error("CDP_SOCKET_ERROR"));
});

function send(method,params={}){
  return new Promise((resolve,reject)=>{
    const id=++seq;pending.set(id,{resolve,reject});
    ws.send(JSON.stringify({id,method,params}));
  });
}
async function evalValue(expression){
  const out=await send("Runtime.evaluate",{expression,returnByValue:true,awaitPromise:true});
  if(out.exceptionDetails) throw new Error(out.exceptionDetails.text||"RUNTIME_EVAL_EXCEPTION");
  return out.result?.value;
}

await send("Runtime.enable");
await send("Page.enable");

const snapshotExpr='({readyState:document.readyState,smoke:document.body?.dataset?.runtimeSmoke||null,runtime:window.__SNAP_RUNTIME_STATUS||null,result:document.querySelector("#browserRuntimeSelfTest")?.textContent||null,landmarks:document.querySelectorAll("#landmarks .landmark").length})';
let last=null;
for(let i=0;i<240;i++){
  last=await evalValue(snapshotExpr);
  if(last?.smoke==="PASS"){
    console.log("BROWSER_RUNTIME_CDP_PASS");
    console.log(JSON.stringify(last));
    ws.close();
    process.exit(0);
  }
  if(last?.smoke==="FAIL"){
    console.error("BROWSER_RUNTIME_CDP_FAIL");
    console.error(JSON.stringify(last));
    ws.close();
    process.exit(1);
  }
  await sleep(100);
}
console.error("BROWSER_RUNTIME_CDP_TIMEOUT");
console.error(JSON.stringify(last));
ws.close();
process.exit(2);
