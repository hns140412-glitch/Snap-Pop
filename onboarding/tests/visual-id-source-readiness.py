#!/usr/bin/env python3
"""Unified 24-member source arming gate plus synthetic SHA-registration transition."""
import hashlib,importlib.util,json,pathlib,shutil,tempfile
from PIL import Image,ImageDraw
root=pathlib.Path(__file__).resolve().parents[1]
def module(name,path):
    spec=importlib.util.spec_from_file_location(name,path)
    m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
m=module('readiness',root/'tools/visual-id-source-readiness.py')
art=module('art_batch_test',root/'tools/visual-id-art-batch.py')
r=m.status(root)
assert r['core6_source_lock_ready']==6 and r['source_lock_ready_total']==6
assert r['core6_art_slots']==54 and r['final_art_slots_total']==216
assert r['expansion_group_identity_ready']==18
assert r['expansion_independent_cutout_sha_locked']==0
assert r['expansion_cutout_plus_mask_source_lock_ready']==0
assert r['verified_final_art_files']==0 and r['full24_art_batch_armed'] is False
assert len(r['blocked_expansion'])==18
assert r['blocked_expansion'][-1]=={'visual_id':'guide-24','code':'VIVI','status':'AWAITING_INDEPENDENT_CUTOUT_SHA'}
with tempfile.TemporaryDirectory(prefix='guide_sha_arm_') as td:
    t=pathlib.Path(td)
    for rel in ['tools','qa','characters/ui_cutouts','characters/layer_specs']:
        (t/rel).mkdir(parents=True,exist_ok=True)
    for rel in ['guide-07-24-group-intake.v1.json','guide-07-24-reference-view-manifest.v1.json',
                'guide-07-24-production-stage-gate.v1.json','guide-07-24-independent-source-registry.v1.json',
                'visual-id-batch-production.v1.json','qa/guide-source-package-proof.v1.json']:
        shutil.copyfile(root/rel,t/rel)
    shutil.copyfile(root/'tools/guide-group-intake.py',t/'tools/guide-group-intake.py')
    image=Image.new('RGBA',(1122,1402),(0,0,0,0));d=ImageDraw.Draw(image);d.rectangle((300,250,800,1200),fill=(80,120,160,255))
    cut=t/'characters/ui_cutouts/guide-07.png';image.save(cut)
    cutsha=hashlib.sha256(cut.read_bytes()).hexdigest()
    specdata={'visual_id':'guide-07','cutout_sha256':cutsha,'size':[1122,1402],
              'status':'SOURCE_PARTITION_PROTOTYPE_NOT_ANIMATION_READY','independent_roles':{}}
    specpath=t/'characters/layer_specs/guide-07.json';specpath.write_text(json.dumps(specdata),encoding='utf8')
    specsha=hashlib.sha256(specpath.read_bytes()).hexdigest()
    reg=json.loads((t/'guide-07-24-independent-source-registry.v1.json').read_text(encoding='utf8'))
    row=next(x for x in reg['members'] if x['visual_id']==7)
    row.update(cutout_sha256=cutsha,mask_spec_sha256=specsha,approval_ref='CI_SYNTHETIC_INDEPENDENT_SHA_ARM_ONLY',status='SOURCE_LOCK_INPUT_READY')
    (t/'guide-07-24-independent-source-registry.v1.json').write_text(json.dumps(reg),encoding='utf8')
    ready=art.guide_pending(t,'guide-07')[0]
    assert ready['status']=='ART_PRODUCTION_OPEN_NOT_AUTO_GENERATED'
    assert ready['source_lock']['cutout_sha256']==cutsha and ready['source_lock']['mask_spec_sha256']==specsha
    assert ready['source_lock']['source_reference_view_sha256']==ready['source_reference_view']['sha256']
    assert ready['release_approved'] is False and ready['active_runtime'] is False
    row['cutout_sha256']='0'*64
    (t/'guide-07-24-independent-source-registry.v1.json').write_text(json.dumps(reg),encoding='utf8')
    try:art.guide_pending(t,'guide-07')
    except AssertionError as e:assert 'SOURCE_OR_OUTPUT_SHA_DRIFT' in str(e)
    else:raise AssertionError('WRONG_INDEPENDENT_SHA_ARMED_PIPELINE')
print('VISUAL_ID_24_READINESS_PASS: Core6 6/6 source locks queued; real matching independent SHA+mask arms a GUIDE member; wrong SHA rejected; full24 216-art batch remains gated')
