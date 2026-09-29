#!/usr/bin/env python3
import importlib.util,pathlib,tempfile,hashlib
from PIL import Image,ImageChops
root=pathlib.Path(__file__).resolve().parents[1]
sp=importlib.util.spec_from_file_location('extract',root/'tools/extract-source-layers.py');m=importlib.util.module_from_spec(sp);sp.loader.exec_module(m)
src=root/'characters/ui_cutouts/dubi.png'; spec=root/'characters/layer_specs/dubi.json'
with tempfile.TemporaryDirectory() as td:
    res=m.run(src,spec,pathlib.Path(td));assert res['reconstruction']=='LOSSLESS_RGBA_PIXEL_EQUALITY_PASS'
    roles=[Image.open(pathlib.Path(td)/(n+'.png')).convert('RGBA') for n in ('identity_body','personality_prop','theme_gear')]
    original=Image.open(src).convert('RGBA');assert len({hashlib.sha256(x.tobytes()).hexdigest() for x in roles})==3
    composed=Image.new('RGBA',original.size);[composed.alpha_composite(x) for x in roles]
    assert ImageChops.difference(composed,original).getbbox() is None
    bad=pathlib.Path(td)/'wrong_source.png';original.putpixel((0,0),(255,0,0,255));original.save(bad)
    try:m.run(bad,spec,pathlib.Path(td)/'bad');raise AssertionError('Wrong source must fail closed')
    except AssertionError as e:assert str(e)=='APPROVED_SOURCE_SHA256_MISMATCH',str(e)
print('SOURCE_LAYER_PROTOTYPE_PASSED: original exact RGBA reconstruction, three distinct roles, wrong SHA blocked, no active scene/animation claim')
