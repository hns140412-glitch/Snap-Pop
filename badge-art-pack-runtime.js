(() => {
"use strict";
const VERSION="2026.10.02-a";
const MAGIC="TKYSHD01";
let loading=null;
let loaded=false;
const urls=new Map();
const meta=new Map();

function hex(buf){return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,"0")).join("")}
async function sha256(bytes){return hex(await crypto.subtle.digest("SHA-256",bytes))}
function readU32LE(view,off){return view.getUint32(off,true)}

async function parseShard(shard){
  const res=await fetch(shard.path,{cache:"force-cache"});
  if(!res.ok)throw new Error("BADGE_ART_SHARD_FETCH_FAILED:"+shard.shard);
  const buf=await res.arrayBuffer();
  if(buf.byteLength!==shard.bytes)throw new Error("BADGE_ART_SHARD_SIZE_MISMATCH:"+shard.shard);
  const digest=await sha256(buf);
  if(digest!==shard.sha256)throw new Error("BADGE_ART_SHARD_SHA_MISMATCH:"+shard.shard);
  const bytes=new Uint8Array(buf);
  const magic=new TextDecoder().decode(bytes.slice(0,8));
  if(magic!==MAGIC)throw new Error("BADGE_ART_SHARD_MAGIC_INVALID:"+shard.shard);
  const view=new DataView(buf);
  const headerLength=readU32LE(view,8);
  const headerStart=12, payloadStart=headerStart+headerLength;
  const header=JSON.parse(new TextDecoder().decode(bytes.slice(headerStart,payloadStart)));
  if(!Array.isArray(header.entries)||header.entries.length!==6)throw new Error("BADGE_ART_SHARD_HEADER_INVALID:"+shard.shard);
  for(const entry of header.entries){
    const start=payloadStart+entry.offset,end=start+entry.length;
    if(start<payloadStart||end>bytes.length)throw new Error("BADGE_ART_ENTRY_RANGE_INVALID:"+entry.asset_slot_id);
    const assetBytes=bytes.slice(start,end);
    const entrySha=await sha256(assetBytes);
    if(entrySha!==entry.sha256)throw new Error("BADGE_ART_ENTRY_SHA_MISMATCH:"+entry.asset_slot_id);
    const blob=new Blob([assetBytes],{type:entry.mime||"image/webp"});
    urls.set(entry.asset_slot_id,URL.createObjectURL(blob));
    meta.set(entry.asset_slot_id,Object.freeze({...entry,shard:shard.shard}));
  }
}

async function load(){
  if(loaded)return {ok:true,count:urls.size};
  if(loading)return loading;
  loading=(async()=>{
    const res=await fetch("data/badge-art-shard-manifest.json",{cache:"no-cache"});
    if(!res.ok)throw new Error("BADGE_ART_SHARD_MANIFEST_LOAD_FAILED");
    const manifest=await res.json();
    if(manifest.total!==60||manifest.shard_count!==10)throw new Error("BADGE_ART_SHARD_MANIFEST_INVALID");
    await Promise.all(manifest.shards.map(parseShard));
    if(urls.size!==60)throw new Error("BADGE_ART_SHARD_COUNT_MISMATCH");
    loaded=true;
    return {ok:true,count:urls.size,manifest};
  })();
  try{return await loading}finally{loading=null}
}
function resolve(assetSlotId){return urls.get(assetSlotId)||null}
function inspect(assetSlotId){return meta.get(assetSlotId)||null}
function status(){return Object.freeze({version:VERSION,loaded,count:urls.size})}

window.SnapPopBadgeArtPack=Object.freeze({version:VERSION,load,resolve,inspect,status});
})();