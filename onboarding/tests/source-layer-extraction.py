#!/usr/bin/env python3
import importlib.util,pathlib,tempfile,hashlib
from PIL import Image,ImageChops
root=pathlib.Path(__file__).resolve().parents[1]
sp=importlib.util.spec_from_file_location('extract',root/'tools/extract-source-layers.py');m=importlib.util.module_from_spec(sp);sp.loader.exec_module(m)
ids=('dubi','ink','lori','nova','take','zero')
with tempfile.TemporaryDirectory() as td:
    for id in ids:
        src=root/f'characters/ui_cutouts/{id}.png';spec=root/f'characters/layer_specs/{id}.json'
        dst=pathlib.Path(td)/id;res=m.run(src,spec,dst)
        assert res['visual_id']==id and res['reconstruction']=='LOSSLESS_RGBA_PIXEL_EQUALITY_PASS'
        assert res['status']=='SOURCE_PARTITION_PROTOTYPE_NOT_ANIMATION_READY'
        assert set(res['independent_roles'])=={'IDENTITY_BODY','PERSONALITY_PROP','THEME_GEAR'}
        assert all(v['nontransparent_pixels']>1000 for v in res['independent_roles'].values())
        roles=[Image.open(dst/(n+'.png')).convert('RGBA') for n in ('identity_body','personality_prop','theme_gear')]
        orig=Image.open(src).convert('RGBA');assert len({hashlib.sha256(x.tobytes()).hexdigest() for x in roles})==3
        composed=Image.new('RGBA',orig.size)
        for r in roles:composed.alpha_composite(r)
        assert ImageChops.difference(composed,orig).getbbox() is None
    src=root/'characters/ui_cutouts/dubi.png';spec=root/'characters/layer_specs/dubi.json'
    orig=Image.open(src).convert('RGBA');bad=pathlib.Path(td)/'wrong_source.png';orig.putpixel((0,0),(255,0,0,255));orig.save(bad)
    try:m.run(bad,spec,pathlib.Path(td)/'bad');raise AssertionError('Wrong source must fail closed')
    except AssertionError as e:assert str(e)=='APPROVED_SOURCE_SHA256_MISMATCH',str(e)
print('ALL_SIX_SOURCE_PARTITION_PROTOTYPES_PASS: six source hashes, 18 distinct full-canvas PNG roles, exact RGBA reconstruction, no motion/art approval')
