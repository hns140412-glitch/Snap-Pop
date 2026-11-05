const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');

const root=path.resolve(__dirname,'..');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const bridge=fs.readFileSync(path.join(root,'snap-bridge.js'),'utf8');
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
const manifest=require(path.join(root,'vendor/taky/explorer-crew/composable-asset-manifest-pr10-v1.js'));

const consumer='snap-explorer-crew-authority-consumer-v2.js';
const consumerPos=index.indexOf(consumer);
const appPos=index.indexOf('<script src="app.js"></script>');
assert.ok(consumerPos>=0 && appPos>consumerPos,'Explorer Crew consumer must load before app.js');

for(const marker of [
  "SnapExplorerCrewInboundCrewEvent",
  "TakyExplorerCrewAppConsumerV2",
  "SnapExplorerCrewAuthorityConsumer?.boot",
  "renderCrewCompanion('SNAP_BOOT')",
  "STATIC_APPROVED_COMPAT",
  "TakyExplorerCrewRenderPlanDomConsumer"
]) assert.ok(app.includes(marker),'app missing '+marker);

for(const marker of [
  "'return_target','crew_event'",
  "window.SnapExplorerCrewInboundCrewEvent",
  "incoming.crew_event",
  "context.crew_event",
  "url.searchParams.set('crew_event', context.crew_event)"
]) assert.ok(bridge.includes(marker),'bridge missing '+marker);

for(const marker of [
  consumer,
  "vendor/taky/explorer-crew/app-consumer-v2.js",
  "vendor/taky/explorer-crew/handoff-v1.js",
  "vendor/taky/explorer-crew/render-plan-dom-consumer-v1.js"
]) assert.ok(sw.includes(marker),'sw missing '+marker);

for(const id of ['dubi','lori','ink','nova','take','zero']){
  const row=manifest.members[id];
  assert.equal(row?.source_sha_verified,true,id+' source SHA not verified');
  const asset=row?.groups?.PROFILE?.assets?.find(x=>x.key==='static_cutout'&&x.approved===true);
  assert.ok(asset,id+' static cutout missing from manifest');
  const file=path.join(root,asset.path);
  assert.ok(fs.existsSync(file),id+' cutout missing on disk');
  const actual=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  assert.equal(actual,asset.sha256,id+' cutout SHA drift');
  assert.ok(sw.includes(asset.path),id+' cutout missing from SW cache');
}
console.log('SNAP_EXPLORER_CREW_ACTUAL_RUNTIME_CONTRACT_PASS');
