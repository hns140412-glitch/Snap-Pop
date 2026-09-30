importScripts('./snap-release-v01.js');
const RELEASE=globalThis.SnapPopReleaseDescriptor;
const C='snap-pop:'+RELEASE.release_id;
const EXPLORER_CREW_V2_CORE=[
'./vendor/taky/explorer-crew/app-consumer-v2.js',
'./vendor/taky/explorer-crew/asset-engine-pr10-v1.js',
'./vendor/taky/explorer-crew/asset-render-adapter-v1.js',
'./vendor/taky/explorer-crew/behavior-patterns-v1.js',
'./vendor/taky/explorer-crew/browser-host-v1.js',
'./vendor/taky/explorer-crew/canonical-runtime-v1.js',
'./vendor/taky/explorer-crew/companion-gate-policy-v1.js',
'./vendor/taky/explorer-crew/companion-gate-registry-v1.js',
'./vendor/taky/explorer-crew/companion-gate-registry-v1.json',
'./vendor/taky/explorer-crew/composable-asset-manifest-pr10-v1.js',
'./vendor/taky/explorer-crew/composable-asset-manifest-pr10-v1.json',
'./vendor/taky/explorer-crew/composable-promotion-gate-v1.js',
'./vendor/taky/explorer-crew/contracts-v1.js',
'./vendor/taky/explorer-crew/dialogue-personality-v1.js',
'./vendor/taky/explorer-crew/handoff-v1.js',
'./vendor/taky/explorer-crew/manifest-registry-pr10-v1.js',
'./vendor/taky/explorer-crew/personality-behavior-v1.js',
'./vendor/taky/explorer-crew/personality-registry-v1.js',
'./vendor/taky/explorer-crew/personality-registry-v2.js',
'./vendor/taky/explorer-crew/personality-source-board-v1.js',
'./vendor/taky/explorer-crew/relation-affinity-v1.js',
'./vendor/taky/explorer-crew/render-plan-dom-consumer-v1.js',
'./vendor/taky/explorer-crew/role-behavior-policy-v1.js',
'./vendor/taky/explorer-crew/runtime-log-adapter-v1.js',
'./vendor/taky/explorer-crew/runtime-log-pr10-v1.js',
'./vendor/taky/explorer-crew/runtime-policy-adapter-v1.js',
'./vendor/taky/explorer-crew/runtime-policy-pr10-v1.js',
'./vendor/taky/explorer-crew/runtime-v1.js',
'./vendor/taky/explorer-crew/semantic-command-compat-v1.js',
'./vendor/taky/explorer-crew/shared-memory-episode-v1.js',
'./vendor/taky/explorer-crew/state-store-v1.js',
'./vendor/taky/explorer-crew/story-gate-v1.js',
'./vendor/taky/explorer-crew/system-v2.js',
'./vendor/taky/explorer-crew/ui-renderer-pr10-v1.js',
'./vendor/taky/explorer-crew/source-lock-v2.json',
'./snap-explorer-crew-authority-consumer-v2.js',
'./characters/ui_cutouts/dubi.png',
'./characters/ui_cutouts/ink.png',
'./characters/ui_cutouts/lori.png',
'./characters/ui_cutouts/nova.png',
'./characters/ui_cutouts/take.png',
'./characters/ui_cutouts/zero.png'
];
const A=[...EXPLORER_CREW_V2_CORE,'./','index.html','styles.css','app.js','snap-bridge.js','vendor/taky/release-contract.js','vendor/taky/pwa-update-state.js','snap-release-v01.js','snap-pwa-update-v01.js','manifest.json','Snap_Pop_UI_MASTER_LOGIC_REV_12.md','data/landmarks.json','data/growth.json','assets/world/golden_world_scene.jpg','assets/growth/stage_01.png','assets/growth/stage_02.png','assets/growth/stage_03.png','assets/growth/stage_04.png','assets/growth/stage_05.png','assets/growth/stage_06.png','assets/growth/stage_07.png','assets/icons/map.svg','assets/icons/records.svg','assets/icons/explore.svg','assets/icons/gems.svg','assets/icons/growth.svg','assets/icons/radio.svg','assets/icons/gear.svg','assets/icons/speaker.svg'];
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
