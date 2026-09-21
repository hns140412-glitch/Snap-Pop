importScripts('./snap-release-v01.js');
const RELEASE=globalThis.SnapPopReleaseDescriptor;
const C='snap-pop:'+RELEASE.release_id;
const A=['./','index.html','styles.css','app.js','snap-bridge.js','vendor/taky/release-contract.js','vendor/taky/pwa-update-state.js','vendor/taky/event-envelope.js','snap-release-v01.js','snap-pwa-update-v01.js','manifest.json','Snap_Pop_UI_MASTER_LOGIC_REV_12.md','SNAP_EXPLORATION_CREW_MASTER_2026-09-20.md','SNAP_EXPLORATION_CREW_SOURCE_LEDGER_2026-09-20.md','data/landmarks.json','data/growth.json','data/exploration-crew-rules.json','assets/world/golden_world_scene.jpg','assets/growth/stage_01.png','assets/growth/stage_02.png','assets/growth/stage_03.png','assets/growth/stage_04.png','assets/growth/stage_05.png','assets/growth/stage_06.png','assets/icons/map.svg','assets/icons/records.svg','assets/icons/explore.svg','assets/icons/gems.svg','assets/icons/growth.svg','assets/icons/radio.svg','assets/icons/gear.svg','assets/icons/speaker.svg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(x=>x.addAll(A))));
self.addEventListener('message',e=>{
  if(e.data?.type==='APPLY_UPDATE')e.waitUntil(self.skipWaiting());
});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>(x.startsWith('snap-pop-')||x.startsWith('snap-pop:'))&&x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 const u=new URL(e.request.url);if(u.origin!==location.origin)return;
 if(e.request.mode==='navigate'){
   e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(C).then(c=>c.put('index.html',copy));return r}).catch(()=>caches.match('index.html')));return;
 }
 e.respondWith(fetch(e.request).then(r=>{if(r.ok){const copy=r.clone();caches.open(C).then(c=>c.put(e.request,copy));}return r}).catch(()=>caches.match(e.request)));
});