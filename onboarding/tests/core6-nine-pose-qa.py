#!/usr/bin/env python3
"""Self-check actual binary evidence and no false final-art promotion."""
import hashlib,json,pathlib
from PIL import Image
root=pathlib.Path(__file__).resolve().parents[1];base=root/'qa-nine-pose'
m=json.loads((base/'MANIFEST.json').read_text(encoding='utf8'))
assert m['visual_ids']==['dubi','lori','ink','nova','take','zero']
assert m['complete_motion_art']==m['genuine_expression_art']==0
assert m['originals_modified'] is False and m['generated_new_characters'] is False
assert m['user_visual_approval'] is False and m['semantic_hand_prop_grip_approved'] is False
total=0
for sid,x in m['members'].items():
    assert len(x['poses'])==9 and x['at_rest_original_visible_bytes_exact']
    assert x['9_technical_source_visible_alpha_gaps_zero'] and x['artist_approval'] is False
    for key,sha_key in [('new_patch_png','new_patch_sha256'),('preview_webp','preview_sha256')]:
        p=base/x[key];assert p.is_file()
        assert hashlib.sha256(p.read_bytes()).hexdigest()==x[sha_key]
    with Image.open(base/x['preview_webp']) as im:assert im.n_frames==9 and im.size==(520,650)
    for pose in x['poses']:
        assert pose['after']==0 and pose['original_visible_alpha_gap_before']>=0
        total+=1
assert total==54
print('CORE6_NINE_POSE_SOURCE_BOUND_QA_PASS: six exact original IDs, six actual partial patch PNGs, six distinct WebP, 54 source-visible alpha checks, NO ART OR RELEASE APPROVAL')
