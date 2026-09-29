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
        assert res['visual_id']==id and res['reconstruction']=='CANONICAL_VISIBLE_RGBA_PIXEL_EQUALITY_PASS'
        assert res['alpha_zero_rgb']=='ALL_DERIVED_LAYERS_CLEARED'
        assert res['source_original_bytes']=='IMMUTABLE_NO_REWRITE'
        assert res['status']=='SOURCE_PARTITION_PROTOTYPE_NOT_ANIMATION_READY'
        assert set(res['independent_roles'])=={'IDENTITY_BODY','PERSONALITY_PROP','THEME_GEAR'}
        assert all(v['nontransparent_pixels']>1000 for v in res['independent_roles'].values())
        if id=='lori':assert 5500 <= res['independent_roles']['THEME_GEAR']['nontransparent_pixels'] <= 6300,'LORI_STAR_HAIR_CONTAMINATION_REGRESSION'
        if id=='nova':assert 50000 <= res['independent_roles']['PERSONALITY_PROP']['nontransparent_pixels'] <= 55000,'NOVA_GOGGLE_FUR_CONTAMINATION_REGRESSION'
        roles=[Image.open(dst/(n+'.png')).convert('RGBA') for n in ('identity_body','personality_prop','theme_gear')]
        orig=Image.open(src).convert('RGBA');assert len({hashlib.sha256(x.tobytes()).hexdigest() for x in roles})==3
        # Source cutouts use RGB(255,255,255) at fully transparent points;
        # derived assets instead use true (0,0,0,0) to prevent hidden RGB bleed.
        visible=orig.getchannel('A').point(lambda a:255 if a else 0)
        canonical=Image.merge('RGBA',tuple(ImageChops.multiply(c,visible) for c in orig.split()[:3])+(orig.getchannel('A'),))
        composed=Image.new('RGBA',orig.size)
        for role in roles:
            payload=role.tobytes()
            assert not any((payload[i] or payload[i+1] or payload[i+2]) and payload[i+3]==0 for i in range(0,len(payload),4)),'ROLE_HIDDEN_RGB_LEAK:'+id
            composed.alpha_composite(role)
        assert composed.tobytes()==canonical.tobytes(),'VISIBLE_PIXEL_MISMATCH:'+id
    src=root/'characters/ui_cutouts/dubi.png';spec=root/'characters/layer_specs/dubi.json'
    orig=Image.open(src).convert('RGBA');bad=pathlib.Path(td)/'wrong_source.png';orig.putpixel((0,0),(255,0,0,255));orig.save(bad)
    try:m.run(bad,spec,pathlib.Path(td)/'bad');raise AssertionError('Wrong source must fail closed')
    except AssertionError as e:assert str(e)=='APPROVED_SOURCE_SHA256_MISMATCH',str(e)
    wrong_name=pathlib.Path(td)/'wrong_name.png';wrong_name.write_bytes(src.read_bytes())
    try:m.run(wrong_name,spec,pathlib.Path(td)/'wrong_id');raise AssertionError('Renamed source must fail Visual ID')
    except AssertionError as e:assert str(e)=='VISUAL_ID_SOURCE_OR_SPEC_FILENAME_MISMATCH',str(e)
print('SIX_VISUAL_IDS_INDEPENDENT_RGBA_PASS: six original SHA locks, 18 per-role isolated PNGs, every zero-alpha RGB cleared, all visible original pixels byte-exact, wrong-source and wrong-ID rejected; no animation-art approval')
