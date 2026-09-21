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
    const recoveryKey="__runtime_recovery_probe__";
    const probe=await evalValue(`(async()=>{const value={status:"PERSISTED",token:"snap-pop-runtime-recovery-v1"};await window.SnapPopStorage.set("${recoveryKey}",value);return await window.SnapPopStorage.get("${recoveryKey}")})()`);
    if(probe?.status!=="PERSISTED") throw new Error("PWA_RECOVERY_PROBE_WRITE_FAILED");
    const recoveryUrl=new URL(target.url);
    recoveryUrl.searchParams.delete("runtime-smoke");
    recoveryUrl.searchParams.set("runtime-recovery","1");
    await send("Page.navigate",{url:recoveryUrl.href});
    let recovery=null;
    for(let j=0;j<240;j++){
      try{
        recovery=await evalValue(`(async()=>({readyState:document.readyState,init:window.__SNAP_RUNTIME_STATUS?.init||null,db:window.__SNAP_RUNTIME_STATUS?.db||null,probe:await window.SnapPopStorage?.get?.("${recoveryKey}")}))()`);
        if(recovery?.readyState==="complete"&&recovery?.init==="PASS"&&recovery?.db==="OPEN"&&recovery?.probe?.token==="snap-pop-runtime-recovery-v1"){
          const pwa=await evalValue(`(async()=>{
            if(!("serviceWorker" in navigator)) return {ok:false,reason:"NO_SERVICE_WORKER"};
            const reg=await navigator.serviceWorker.ready;
            const scriptURL=reg?.active?.scriptURL||reg?.waiting?.scriptURL||reg?.installing?.scriptURL||"";
            const cacheNames=await caches.keys();
            const shellChecks=[];
            for(const name of cacheNames){
              const cache=await caches.open(name);
              const indexHit=await cache.match("index.html");
              const cssHit=await cache.match("styles.css");
              const appHit=await cache.match("app.js");
              if(indexHit&&cssHit&&appHit)shellChecks.push(name);
            }
            return {ok:/\\/sw\\.js(?:$|\\?)/.test(scriptURL)&&shellChecks.length>0,scriptURL,cacheNames,shellCaches:shellChecks,controlled:!!navigator.serviceWorker.controller};
          })()`);
          if(!pwa?.ok){
            console.error("PWA_OFFLINE_SHELL_FAIL");
            console.error(JSON.stringify(pwa));
            ws.close();
            process.exit(4);
          }
          await evalValue(`window.SnapPopStorage.set("${recoveryKey}",null)`);
          console.log("PWA_RELOAD_RECOVERY_PASS");
          console.log(JSON.stringify(recovery));
          console.log("PWA_OFFLINE_SHELL_PASS");
          console.log(JSON.stringify(pwa));
          console.log("BROWSER_RUNTIME_CDP_PASS");
          console.log(JSON.stringify(last));
          ws.close();
          process.exit(0);
        }
      }catch{}
      await sleep(100);
    }
    console.error("PWA_RELOAD_RECOVERY_FAIL");
    console.error(JSON.stringify(recovery));
    ws.close();
    process.exit(3);
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
