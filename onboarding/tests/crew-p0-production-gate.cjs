'use strict';
const assert=require('node:assert/strict');
const {evaluate}=require('../crew-p0-production-gate.js');
const contract=require('../crew-p0-production-contract.v1.json');
const manifest=require('../crew-composable-asset-manifest.v1.json');
const r=evaluate(contract,manifest,{verifyFiles:true});
assert.equal(r.schema,'TAKY_CREW_P0_GATE_REPORT_V1');
assert.equal(r.summary.members,6);
assert.equal(r.summary.total_outputs,18);
assert.equal(r.summary.ready_outputs,0);
assert.equal(r.summary.ready_members,0);
for(const id of ['dubi','lori','ink','nova','take','zero']){
 assert.equal(r.members[id].ready,false);
 assert.equal(r.members[id].outputs.length,3);
 const spec=contract.members.find(x=>x.visual_id===id);assert.deepEqual(spec.canvas_size,[1122,1402]);
 assert.deepEqual(r.members[id].outputs.map(x=>x.group+':'+x.key),[
  'PUPPET_BODY:FIELD_NEUTRAL','FACE_STATES:neutral','DEPTH_SHADOW:field_default'
 ]);
 assert.ok(r.members[id].outputs.every(x=>x.reason==='OUTPUT_NOT_REGISTERED'));
}
assert.equal(contract.rules.automatic_image_generation,false);
assert.equal(contract.rules.name_based_generation,false);
assert.equal(contract.output_format.file_type,'PNG');
assert.equal(contract.output_format.color_mode,'RGBA');
assert.equal(contract.output_format.coordinate_space,'MATCH_APPROVED_STATIC_CUTOUT');
assert.equal(contract.output_format.canvas_policy,'USE_LAYER_SPEC_SIZE_NO_RESIZE_NO_CROP');
assert.equal(contract.summary.total_p0_outputs,18);
console.log('CREW_P0_GATE_PASS: 18 outputs specified, 0 falsely promoted, 0 runtime-ready members');
