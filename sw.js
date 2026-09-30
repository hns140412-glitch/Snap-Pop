importScripts('./snap-release-v01.js');
const RELEASE=globalThis.SnapPopReleaseDescriptor;
const C='snap-pop:'+RELEASE.release_id;
const A=['./','index.html','styles.css','snap-scene-policy-adapter-v1.js','snap-character-runtime-adapter-v1.js','snap-character-scene-bridge-v1.js','snap-character-binding-registry-v1.js','snap-character-ui-binding-planner-v1.js','snap-character-ui-binding-bridge-v1.js','snap-character-dom-binder-v1.js','snap-approved-asset-resolver-v1.js','snap-character-registry-state-v1.js','vendor/taky/explorer-crew-browser-relation-v1.js','vendor/taky/explorer-crew-browser-behavior-v1.js','snap-crew-live-runtime-v1.js','snap-crew-dialogue-consumer-v1.js','snap-crew-evidence-runtime-v1.js','snap-crew-identity-bridge-v1.js','snap-blessing-lock-v1.js','vendor/taky/explorer-crew-evidence-handoff-v1.js','snap-crew-evidence-handoff-install-v1.js','app.js','snap-bridge.js','vendor/taky/release-contract.js','vendor/taky/pwa-update-state.js','snap-release-v01.js','snap-pwa-update-v01.js','manifest.json','Snap_Pop_UI_MASTER_LOGIC_REV_12.md','data/landmarks.json','data/growth.json','assets/world/golden_world_scene.jpg','assets/growth/stage_01.png','assets/growth/stage_02.png','assets/growth/stage_03.png','assets/growth/stage_04.png','assets/growth/stage_05.png','assets/growth/stage_06.png','assets/growth/stage_07.png','assets/icons/map.svg','assets/icons/records.svg','assets/icons/explore.svg','assets/icons/gems.svg','assets/icons/growth.svg','assets/icons/radio.svg','assets/icons/gear.svg','assets/icons/speaker.svg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(x=>x.addAll(A))));
self.addEventListener('message',e=>{
  if(e.data?.type==='APPLY_UPDATE')e.waitUntil(self.skipWaiting());
});
self.addEventListener('activate',e=>e.waitUntil(
  caches.keys().then(k=>Promise.all(k.filter(x=>(x.startsWith('snap-pop-rev12-')||x.startsWith('snap-pop:'))&&x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim())
));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 const u=new URL(e.request.url);if(u.origin!==location.origin)return;
 if(e.request.mode==='navigate'){
   e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(C).then(c=>c.put('index.html',copy));return r}).catch(()=>caches.match('index.html')));return;
 }
 e.respondWith(fetch(e.request).then(r=>{if(r.ok){const copy=r.clone();caches.open(C).then(c=>c.put(e.request,copy));}return r}).catch(()=>caches.match(e.request)));
});
