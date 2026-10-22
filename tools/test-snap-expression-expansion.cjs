const assert=require('node:assert/strict');
const fs=require('node:fs');

const marks=JSON.parse(fs.readFileSync('data/landmarks.json','utf8'));
const app=fs.readFileSync('app.js','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const canonical=['idea','emotion','description','viewpoint','final'];

assert.deepEqual(marks.slice(0,5).map(x=>x.id),canonical);
assert.equal(marks.length,7);
for(const [id,pack,ref,sha] of [
 ['mind-diary','MIND_DIARY','1l-aFFOuDS0ECThDcgx8QDL0aswMw4Q6d','74e68d2e0de124b284c5bfbfb52505f5499c8b49ada706bf82ae04624dfbccd6'],
 ['secret-note','SECRET_NOTE','1axQn-UqC6S1bfhH5YCzP5RqEvQwp0bfP','e8fc4b6540bb6833d72653c1790afe5d77734a4882da360548fb9c33fa235a16'],
]){
 const m=marks.find(x=>x.id===id);
 assert.ok(m,id);
 assert.equal(m.expansionPack,pack);
 assert.equal(m.sourceRef,ref);
 assert.equal(m.sourceSha256,sha);
 assert.equal(m.steps.length,3);
 for(const step of m.steps){assert.equal(step.length,3);step.forEach(v=>assert.ok(String(v).trim()))}
}
for(const marker of ['function stepsFor(m)','steps=stepsFor(m)','expansionPack:m.expansionPack||null','sourceRef:m.sourceRef||null','sourceSha256:m.sourceSha256||null']){
 assert.ok(app.includes(marker),'app missing '+marker);
}
// Retain expression expansion while binding the actually approved coastal
// home background. Image identity is established by the existing visual ID.
const path=require('node:path'),crypto=require('node:crypto');
const index=fs.readFileSync('index.html','utf8');
const styles=fs.readFileSync('styles.css','utf8');
const coast=path.resolve('assets/world/snap_pop_beach_asset.png');
assert.ok(fs.existsSync(coast),'approved coastal image must be in the app');
assert.equal(crypto.createHash('sha256').update(fs.readFileSync(coast)).digest('hex'),
  'f15af01680e2db44ef8af1dff749169f1082ddd15b3760a96da7ff2211eb8259');
assert.ok(index.includes('class="scene" src="assets/world/snap_pop_beach_asset.png"'));
assert.ok(sw.includes("snap-pop-rev12-approved-coast-source-20261023"));
assert.ok(sw.includes("'assets/world/snap_pop_beach_asset.png'"));
assert.ok(!sw.includes("'assets/world/golden_world_scene.jpg'"));
assert.match(styles,/\.mapWorld:before,\.mapWorld:after\{content:none;display:none\}/);
console.log(JSON.stringify({pass:true,canonical_preserved:5,expansion_added:2,total:7,engine:'EXISTING_3_STEP'},null,2));
