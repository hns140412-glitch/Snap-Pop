(() => {
  "use strict";
  let db=null;
  const DB_NAME="snap_pop_rev10";
  const DB_VERSION=1;
  const STORE="state";

  function runtimeDbState(state){
    if(window.__SNAP_RUNTIME_STATUS)window.__SNAP_RUNTIME_STATUS.db=state;
  }

  function open(){
    if(db)return Promise.resolve();
    runtimeDbState("OPENING");
    return new Promise((resolve,reject)=>{
      const request=indexedDB.open(DB_NAME,DB_VERSION);
      request.onupgradeneeded=()=>{
        if(!request.result.objectStoreNames.contains(STORE))request.result.createObjectStore(STORE);
      };
      request.onsuccess=()=>{
        db=request.result;
        runtimeDbState("OPEN");
        resolve();
      };
      request.onerror=()=>{
        runtimeDbState("ERROR");
        reject(request.error);
      };
      request.onblocked=()=>runtimeDbState("BLOCKED");
    });
  }

  function requireDb(){
    if(!db)throw new Error("SNAP_STORAGE_NOT_OPEN");
    return db;
  }

  function get(key){
    return new Promise((resolve,reject)=>{
      try{
        const request=requireDb().transaction(STORE).objectStore(STORE).get(key);
        request.onsuccess=()=>resolve(request.result);
        request.onerror=()=>reject(request.error);
      }catch(error){reject(error)}
    });
  }

  function set(key,value){
    return new Promise((resolve,reject)=>{
      try{
        const request=requireDb().transaction(STORE,"readwrite").objectStore(STORE).put(value,key);
        request.onsuccess=()=>resolve();
        request.onerror=()=>reject(request.error);
      }catch(error){reject(error)}
    });
  }

  function setMany(entries){
    return new Promise((resolve,reject)=>{
      try{
        const tx=requireDb().transaction(STORE,"readwrite");
        const store=tx.objectStore(STORE);
        entries.forEach(([key,value])=>store.put(value,key));
        tx.oncomplete=()=>resolve();
        tx.onerror=()=>reject(tx.error);
        tx.onabort=()=>reject(tx.error);
      }catch(error){reject(error)}
    });
  }

  window.SnapPopStorage=Object.freeze({
    contract:"SNAP_POP_STORAGE_V1",
    open,get,set,setMany,
    isOpen:()=>!!db
  });
})();
