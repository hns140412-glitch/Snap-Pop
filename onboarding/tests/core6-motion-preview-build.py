#!/usr/bin/env python3
"""True SIX original SHA-locked asset bundles; zero art/release overclaim."""
import hashlib,json,pathlib
from PIL import Image
root=pathlib.Path(__file__).resolve().parents[1];out=root/'qa-original-rig'
m=json.loads((out/'MANIFEST.json').read_text(encoding='utf8'))
ids=('dubi','lori','ink','nova','take','zero')
assert tuple(x['visual_id'] for x in m['members'])==ids
assert m['idle_approved_source_rgba_exact'] and m['total_art_file_copies']==30
assert not m['actual_independent_reaction_art'] and not m['independent_motion_ready_art_approved']
assert not m['userVisualApproval'] and not m['main_merge'] and not m['netlify']
assert '__CORE6_JSON__' not in (out/'index.html').read_text(encoding='utf8')
for x in m['members']:
 id=x['visual_id'];assert x['source_locked'] and x['idle_visible_rgba_exact']
 assert x['qa_motion']=={'prop':[24,-12],'gear':[-18,13]}
 assert x['animation_art_approved'] is False and x['genuine_independent_reactions']==0
 for role in ('underpaint','body','prop','gear','original'):
  p=out/x['art'][role]['uri']
  assert p.is_file() and hashlib.sha256(p.read_bytes()).hexdigest()==x['art'][role]['sha256']
  with Image.open(p) as im:assert im.mode=='RGBA' and im.size==(1122,1402)
print('CORE6_REAL_APPROVED_ORIGINAL_LAYER_VIEWER_PASS SIX_IDS_THIRTY_SHA_EXACT_PNGS_0_FAKE_FINAL_ART')
