#!/usr/bin/env python3
"""Assert all six source-locked motion exposure guides exist and remain unapproved."""
import hashlib,json,pathlib
from PIL import Image
base=pathlib.Path(__file__).resolve().parents[1]
out=base/'occlusion-qa';r=json.loads((out/'MANIFEST.json').read_text(encoding='utf8'))
ids=tuple(json.loads((base/'visual-prototypes/BATCH_MANIFEST.json').read_text(encoding='utf8'))['ids'])
assert ids[:6]==('dubi','lori','ink','nova','take','zero')
assert tuple(r['members'])==ids,'INCOMPLETE_VISUAL_ID_COVERAGE'
assert r['motionAssetReady'] is False and r['independentReactionAssets']==0 and r['artApproval']=='NOT_APPROVED','INVALID_ART_PROMOTION'
seen=0
for sid in ids:
    item=r['members'][sid]
    original=base/'characters/ui_cutouts'/f'{sid}.png'
    spec=base/'characters/layer_specs'/f'{sid}.json'
    sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
    assert item['visual_id']==sid and item['approved_static_source_sha256']==sha(original),'VISUAL_ID_OR_SOURCE_SHA_DRIFT:'+sid
    assert item['mask_spec_sha256']==sha(spec) and item['zero_shift_source_visible_exact'],'SPEC_SHA_OR_SOURCE_COMPOSITION_DRIFT:'+sid
    assert (out/sid/(sid+'_source_motion_exposure_QA.png')).is_file(),'MISSING_OWN_QA_PANEL:'+sid
    assert tuple(item['moved_roles'])==('PERSONALITY_PROP','THEME_GEAR'),'INCOMPLETE_ROLE_COVERAGE:'+sid
    for role,m in item['moved_roles'].items():
        for key in ('exposure_mask_png','bbox_audit_only_png'):
            p=out/sid/m[key]
            assert p.is_file(),'MISSING_MASK:'+sid+':'+role
            with Image.open(p) as im:
                assert im.mode=='L' and im.size==(1122,1402),'INVALID_MASK_DIMENSIONS:'+sid+':'+role
                assert set(im.getdata()).issubset({0,255}),'MASK_NOT_BINARY:'+sid+':'+role
                expected=m['missing_source_visible_pixels'] if key=='exposure_mask_png' else m['body_bbox_possible_NOT_ART']
                assert im.histogram()[255]==expected,'MASK_COUNT_MISMATCH:'+sid+':'+role
        assert m['missing_source_visible_pixels']>0 and 0<=m['body_bbox_possible_NOT_ART']<=m['missing_source_visible_pixels'],'INVALID_EXPOSURE_COUNT:'+sid+':'+role
        assert m['is_independent_motion_art'] is False,'PROHIBIT_FAKE_MOTION_ART'
        seen+=1
assert seen==2*len(ids)
print(f'{len(ids)} APPROVED/STAGED SOURCE VISUAL IDs / {seen} source-visible exposure masks / immutable originals / NO ART OR RUNTIME APPROVAL: PASS')
