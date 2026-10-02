import {execFileSync} from "node:child_process";
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

function directGet(pathname){
  return execFileSync("curl",["-fsS","--max-time","1",`http://127.0.0.1:9222${pathname}`],{
    encoding:"utf8",
    stdio:["ignore","pipe","ignore"],
    timeout:1500
  });
}
async function getTarget(){
  for(let i=0;i<80;i++){
    try{
      const targets=JSON.parse(await directGet("/json"));
      const page=targets.find(x=>x.type==="page"&&/index\\.html/.test(x.url))||targets.find(x=>x.type==="page");
      if(page?.webSocketDebuggerUrl)return page;
    }catch{}
    await sleep(100);
  }
  let version=null; try{version=await directGet("/json/version")}catch{}
  throw new Error("CDP_TARGET_NOT_FOUND_AFTER_BOUNDED_CURL version="+String(version||"UNAVAILABLE"));
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
ws.onclose=()=>{
  for(const [id,p] of pending){
    pending.delete(id);
    p.reject(new Error("CDP_SOCKET_CLOSED"));
  }
};
await Promise.race([
  new Promise((resolve,reject)=>{
    ws.onopen=resolve;
    ws.onerror=()=>reject(new Error("CDP_SOCKET_ERROR"));
  }),
  new Promise((_,reject)=>setTimeout(()=>reject(new Error("CDP_SOCKET_OPEN_TIMEOUT target="+target.webSocketDebuggerUrl)),5000))
]);

function send(method,params={}){
  return new Promise((resolve,reject)=>{
    const id=++seq;
    const timer=setTimeout(()=>{
      pending.delete(id);
      reject(new Error("CDP_COMMAND_TIMEOUT "+method));
    },5000);
    pending.set(id,{
      resolve:value=>{clearTimeout(timer);resolve(value)},
      reject:error=>{clearTimeout(timer);reject(error)}
    });
    ws.send(JSON.stringify({id,method,params}));
  });
}
async function evalValue(expression){
  const out=await send("Runtime.evaluate",{expression,returnByValue:true,awaitPromise:true});
  if(out.exceptionDetails) throw new Error(out.exceptionDetails.text||"RUNTIME_EVAL_EXCEPTION");
  return out.result?.value;
}

console.error("CDP_STAGE CONNECTED");
await send("Runtime.enable");
await send("Page.enable");
console.error("CDP_STAGE DOM_SELFTEST_WAIT");

const snapshotExpr='({readyState:document.readyState,smoke:document.body?.dataset?.runtimeSmoke||null,runtime:window.__SNAP_RUNTIME_STATUS||null,result:document.querySelector("#browserRuntimeSelfTest")?.textContent||null,landmarks:document.querySelectorAll("#landmarks .landmark").length})';
let last=null;
for(let i=0;i<240;i++){
  last=await evalValue(snapshotExpr);
  if(last?.smoke==="PASS"){
    console.error("CDP_STAGE DOM_SELFTEST_PASS");
    const recoveryKey="__runtime_recovery_probe__";
    const probe=await evalValue(`(async()=>{const value={status:"PERSISTED",token:"snap-pop-runtime-recovery-v1"};await window.SnapPopStorage.set("${recoveryKey}",value);return await window.SnapPopStorage.get("${recoveryKey}")})()`);
    if(probe?.status!=="PERSISTED") throw new Error("PWA_RECOVERY_PROBE_WRITE_FAILED");
    const recoveryUrl=new URL(target.url);
    recoveryUrl.searchParams.delete("runtime-smoke");
    recoveryUrl.searchParams.set("runtime-recovery","1");
    console.error("CDP_STAGE RECOVERY_NAVIGATE");
    await send("Page.navigate",{url:recoveryUrl.href});
    await sleep(500);
    let recovery=null;
    let recoveryLastError=null;
    let recoveryTransientTimeouts=0;
    for(let j=0;j<240;j++){
      try{
        recovery=await evalValue(`({readyState:document.readyState,init:window.__SNAP_RUNTIME_STATUS?.init||null,db:window.__SNAP_RUNTIME_STATUS?.db||null,storageReady:typeof window.SnapPopStorage?.get==="function"})`);
        if(recovery?.readyState==="complete"&&recovery?.init==="PASS"&&recovery?.db==="OPEN"&&recovery?.storageReady){
          const recoveredProbe=await evalValue(`window.SnapPopStorage.get("${recoveryKey}")`);
          recovery={...recovery,probe:recoveredProbe};
        }
        if(recovery?.readyState==="complete"&&recovery?.init==="PASS"&&recovery?.db==="OPEN"&&recovery?.probe?.token==="snap-pop-runtime-recovery-v1"){
          const pwa=await evalValue(`(async()=>{
            if(!("serviceWorker" in navigator)) return {ok:false,reason:"NO_SERVICE_WORKER"};
            let reg=null;
            const started=Date.now();
            while(Date.now()-started<8000 && !reg){
              reg=await navigator.serviceWorker.getRegistration();
              if(!reg) await new Promise(resolve=>setTimeout(resolve,100));
            }
            if(!reg) throw new Error("SERVICE_WORKER_REGISTRATION_TIMEOUT");
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
      }catch(error){
        recoveryLastError=error;
        const message=String(error?.message||error);
        if(/CDP_COMMAND_TIMEOUT Runtime\.evaluate/.test(message)){
          recoveryTransientTimeouts+=1;
          console.error("CDP_STAGE RECOVERY_TRANSIENT_EVAL_TIMEOUT "+recoveryTransientTimeouts);
          if(recoveryTransientTimeouts<=3){
            await sleep(500);
            continue;
          }
        }
        if(/CDP_COMMAND_TIMEOUT|CDP_SOCKET_CLOSED|CDP_SOCKET_ERROR/.test(message)){
          console.error("CDP_STAGE RECOVERY_FATAL");
          console.error(message);
          ws.close();
          process.exit(5);
        }
      }
      await sleep(100);
    }
    console.error("PWA_RELOAD_RECOVERY_FAIL");
    if(recoveryLastError) console.error(String(recoveryLastError?.message||recoveryLastError));
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
