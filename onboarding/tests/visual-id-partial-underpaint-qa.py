#!/usr/bin/env python3
"""Technical scope is partial inferred opaque pixels only: six IDs, 12 fixed poses, no art approval."""
import hashlib,json,pathlib
from PIL import Image
root=pathlib.Path(__file__).resolve().parents[1];out=root/'underpaint-qa'
m=json.loads((out/'MANIFEST.json').read_text(encoding='utf8'))
ids=('dubi','lori','ink','nova','take','zero')
assert tuple(m['members'])==ids
assert m['noFullAnatomyOrExpressionClaim'] and m['originalFilesModified'] is False
assert m['runtimeAssetApproval'] is False and m['independentReactionDrawingsCompleted']==0
count=0
for sid in ids:
 info=m['members'][sid];src=root/'characters/ui_cutouts'/f'{sid}.png'
 assert info['visual_id']==sid and info['approved_original_sha256']==hashlib.sha256(src.read_bytes()).hexdigest()
 assert info['static_original_byte_identical'] and info['full_hidden_anatomy_complete'] is False and info['artistApproved'] is False
 patch=out/sid/info['underpaint_png']
 assert patch.exists() and hashlib.sha256(patch.read_bytes()).hexdigest()==info['underpaint_sha256']
 with Image.open(patch) as im:
  assert im.mode=='RGBA' and im.size==(1122,1402)
  assert im.getchannel('A').histogram()[255]==info['inferred_opaque_pixel_count']
 assert info['inferred_opaque_pixel_count']>0 and info['exposure_union_pixel_count']>=info['inferred_opaque_pixel_count']
 assert (out/sid/(sid+'_underpaint_before_after_QA_HOLD.jpg')).is_file()
 assert tuple(info['poses'])==('PERSONALITY_PROP','THEME_GEAR')
 for role,p in info['poses'].items():
  assert p['tested_placement_only'] and p['missing_before']>0 and p['remaining_after']==0
  assert p['covered_source_visible_exposure']==p['missing_before']
  assert (out/sid/(role.lower()+'_moving_before.png')).is_file()
  assert (out/sid/(role.lower()+'_moving_partial_underpaint_QA_HOLD.png')).is_file()
  count+=1
assert count==12
print('CORE6_SOURCE_LOCAL_PARTIAL_UNDERPAINT_QA_PASS: six actual underlay PNGs, 12 fixed translations no full opaque hole, zero-shift source exact; NOT 6 art-complete characters or 36 reactions')
