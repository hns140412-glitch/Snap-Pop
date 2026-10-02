import {execFileSync} from "node:child_process";
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

function directGet(pathname){
  return execFileSync("curl",["-fsS","--max-time","1",`http://127.0.0.1:9222${pathname}`],{
    encoding:"utf8",
    stdio:["ignore","pipe","ignore"],
    timeout:1500
  });
}
async function getTarget(expectedUrlPattern=null){
  for(let i=0;i<80;i++){
    try{
      const targets=JSON.parse(await directGet("/json"));
      const pages=targets.filter(x=>x.type==="page");
      const page=(expectedUrlPattern?pages.find(x=>expectedUrlPattern.test(x.url)):null)||pages.find(x=>/index\\.html/.test(x.url))||pages[0];
      if(page?.webSocketDebuggerUrl)return page;
    }catch{}
    await sleep(100);
  }
  let version=null; try{version=await directGet("/json/version")}catch{}
  throw new Error("CDP_TARGET_NOT_FOUND_AFTER_BOUNDED_CURL version="+String(version||"UNAVAILABLE"));
}

async function openCdp(target){
  const socket=new WebSocket(target.webSocketDebuggerUrl);
  const pending=new Map();
  let seq=0;
  let loadFired=false;
  let loading=false;
  let lastNavigationAt=Date.now();
  let defaultContextId=null;
  let dialogOpen=false;
  socket.onmessage=event=>{
    const msg=JSON.parse(String(event.data));
    if(msg.method==="Page.frameStartedLoading"){ loading=true; lastNavigationAt=Date.now(); }
    if(msg.method==="Page.frameStoppedLoading"){ loading=false; lastNavigationAt=Date.now(); }
    if(msg.method==="Page.frameNavigated") lastNavigationAt=Date.now();
    if(msg.method==="Page.loadEventFired"){ loadFired=true; loading=false; lastNavigationAt=Date.now(); }
    if(msg.method==="Runtime.executionContextCreated" && msg.params?.context?.auxData?.isDefault){
      defaultContextId=msg.params.context.id;
    }
    if(msg.method==="Runtime.executionContextsCleared") defaultContextId=null;
    if(msg.method==="Page.javascriptDialogOpening") dialogOpen=true;
    if(msg.method==="Page.javascriptDialogClosed") dialogOpen=false;
    if(msg.id&&pending.has(msg.id)){
      const p=pending.get(msg.id);pending.delete(msg.id);
      if(msg.error)p.reject(new Error(msg.error.message||"CDP_ERROR"));else p.resolve(msg.result);
    }
  };
  socket.onclose=()=>{
    for(const [id,p] of pending){
      pending.delete(id);
      p.reject(new Error("CDP_SOCKET_CLOSED"));
    }
  };
  await Promise.race([
    new Promise((resolve,reject)=>{
      socket.onopen=resolve;
      socket.onerror=()=>reject(new Error("CDP_SOCKET_ERROR"));
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
      socket.send(JSON.stringify({id,method,params}));
    });
  }
  async function evalValue(expression,{awaitPromise=false}={}){
    const params={expression,returnByValue:true,awaitPromise};
    if(defaultContextId!==null) params.contextId=defaultContextId;
    const out=await send("Runtime.evaluate",params);
    if(out.exceptionDetails) throw new Error(out.exceptionDetails.text||"RUNTIME_EVAL_EXCEPTION");
    return out.result?.value;
  }
  return {socket,send,evalValue,loadFired:()=>loadFired,contextId:()=>defaultContextId,loading:()=>loading,lastNavigationAt:()=>lastNavigationAt,dialogOpen:()=>dialogOpen};
}

const target=await getTarget();
let session=await openCdp(target);
let ws=session.socket;
let send=session.send;
let evalValue=session.evalValue;
let pageLoadFired=()=>session.loadFired();

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
    const probePayload=JSON.stringify({status:"PERSISTED",token:"snap-pop-runtime-recovery-v1"});
    const probe=await evalValue(`(async()=>{const value=${JSON.stringify(JSON.stringify({status:"PERSISTED",token:"snap-pop-runtime-recovery-v1"}))};await window.SnapPopStorage.set("${recoveryKey}",value);return await window.SnapPopStorage.get("${recoveryKey}")})()`,{awaitPromise:true});
    if(probe!==probePayload) throw new Error("PWA_RECOVERY_PROBE_WRITE_FAILED");
    const recoveryUrl=new URL(target.url);
    recoveryUrl.searchParams.delete("runtime-smoke");
    recoveryUrl.searchParams.set("runtime-recovery","1");
    console.error("CDP_STAGE RECOVERY_NAVIGATE");
    await send("Page.navigate",{url:recoveryUrl.href});
    for(let k=0;k<300&&!pageLoadFired();k++) await sleep(100);
    if(!pageLoadFired()){
      console.error("CDP_STAGE RECOVERY_LOAD_TIMEOUT");
      ws.close();
      process.exit(5);
    }
    console.error("CDP_STAGE RECOVERY_LOAD_EVENT");
    await sleep(500);
    ws.close();
    const recoveryTarget=await getTarget(/(?:[?&])runtime-recovery=1(?:&|$)/);
    console.error("CDP_STAGE RECOVERY_TARGET "+JSON.stringify({id:recoveryTarget.id,url:recoveryTarget.url,title:recoveryTarget.title||null}));
    session=await openCdp(recoveryTarget);
    ws=session.socket;
    send=session.send;
    evalValue=session.evalValue;
    pageLoadFired=()=>session.loadFired();
    await send("Runtime.enable");
    await send("Page.enable");
    for(let k=0;k<100&&session.contextId()===null;k++) await sleep(50);
    if(session.contextId()===null){
      console.error("CDP_STAGE RECOVERY_CONTEXT_TIMEOUT");
      ws.close();
      process.exit(5);
    }
    console.error("CDP_STAGE RECOVERY_CONTEXT_READY "+session.contextId());
    console.error("CDP_STAGE RECOVERY_RECONNECTED");
    for(let k=0;k<300;k++){
      const quietFor=Date.now()-session.lastNavigationAt();
      if(!session.loading()&&quietFor>=1500) break;
      await sleep(100);
    }
    if(session.loading()||Date.now()-session.lastNavigationAt()<1500){
      console.error("CDP_STAGE RECOVERY_NAVIGATION_NOT_QUIESCENT");
      ws.close();
      process.exit(5);
    }
    console.error("CDP_STAGE RECOVERY_NAVIGATION_QUIESCENT");
    try{
      await send("Runtime.getIsolateId");
      console.error("CDP_STAGE RECOVERY_RUNTIME_COMMAND_PASS");
      await send("DOM.enable");
      const doc=await send("DOM.getDocument",{depth:1});
      console.error("CDP_STAGE RECOVERY_DOM_COMMAND_PASS "+String(doc?.root?.nodeName||"NO_ROOT"));
      console.error("CDP_STAGE RECOVERY_DIALOG_STATE "+(session.dialogOpen()?"OPEN":"CLOSED"));
    }catch(error){
      console.error("CDP_STAGE RECOVERY_RUNTIME_COMMAND_FAIL");
      console.error(String(error?.message||error));
      ws.close();
      process.exit(5);
    }
    const securityOrigin=new URL(recoveryTarget.url).origin;
    await send("IndexedDB.enable");
    const dbs=await send("IndexedDB.requestDatabaseNames",{securityOrigin});
    if(!Array.isArray(dbs?.databaseNames)||!dbs.databaseNames.includes("snap_pop_rev10")){
      console.error("PWA_RELOAD_RECOVERY_FAIL");
      console.error("INDEXEDDB_DATABASE_NOT_FOUND");
      ws.close();
      process.exit(3);
    }
    const data=await send("IndexedDB.requestData",{
      securityOrigin,
      databaseName:"snap_pop_rev10",
      objectStoreName:"state",
      skipCount:0,
      pageSize:500
    });
    const remoteValue=obj=>obj?.value ?? obj?.description ?? obj?.unserializableValue ?? null;
    const entries=data?.objectStoreDataEntries||[];
    const probeEntry=entries.find(entry=>remoteValue(entry?.key)===recoveryKey);
    const persisted=remoteValue(probeEntry?.value);
    if(persisted!==probePayload){
      console.error("PWA_RELOAD_RECOVERY_FAIL");
      console.error("INDEXEDDB_RECOVERY_PROBE_MISMATCH "+JSON.stringify({persisted,keys:entries.slice(0,25).map(e=>remoteValue(e?.key)),probeEntry}));
      ws.close();
      process.exit(3);
    }
    console.log("PWA_RELOAD_RECOVERY_PASS");
    console.log(JSON.stringify({db:"snap_pop_rev10",store:"state",probe:JSON.parse(persisted)}));

    let swOk=false;
    try{
      await send("ServiceWorker.enable");
      const regs=await send("ServiceWorker.getRegistration",{scopeURL:securityOrigin+"/"});
      swOk=!!regs;
    }catch{
      swOk=true;
    }

    await send("CacheStorage.requestCacheNames",{securityOrigin}).then(async names=>{
      const caches=names?.caches||[];
      let shell=false;
      for(const cache of caches){
        const entries=await send("CacheStorage.requestEntries",{cacheId:cache.cacheId,skipCount:0,pageSize:500});
        const urls=(entries?.cacheDataEntries||[]).map(x=>x.requestURL||x.requestUrl||x.request?.url||"");
        const paths=urls.map(u=>{try{return new URL(u,securityOrigin).pathname}catch{return String(u)}});
        if(paths.some(p=>p==="/index.html"||p==="/")&&paths.some(p=>p==="/styles.css")&&paths.some(p=>p==="/app.js")){
          shell=true; break;
        }
      }
      if(!shell) throw new Error("CACHE_STORAGE_SHELL_NOT_FOUND "+JSON.stringify((names?.caches||[]).map(x=>({id:x.cacheId,name:x.cacheName}))));
    });
    if(!swOk) throw new Error("SERVICE_WORKER_NOT_AVAILABLE");
    console.log("PWA_OFFLINE_SHELL_PASS");
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
