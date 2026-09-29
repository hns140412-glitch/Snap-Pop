#!/usr/bin/env python3
"""Source-pixel-only semantic partition. NOT image generation or occlusion restoration.
Requires independently authored, reviewed polygon spec PER immutable Visual ID.
Reassembled output must match the immutable source bytes at every RGBA pixel.
"""
import argparse, hashlib, json, pathlib
from PIL import Image, ImageDraw, ImageChops

ROLES=('IDENTITY_BODY','PERSONALITY_PROP','THEME_GEAR')
def sha(b):return hashlib.sha256(b).hexdigest()
def mask_for(size, polygons):
    m=Image.new('L',size,0);d=ImageDraw.Draw(m)
    for s in polygons.get('include',[]):d.polygon(s,fill=255)
    for s in polygons.get('exclude',[]):d.polygon(s,fill=0)
    return m

def run(source, spec_path, output):
    source,spec_path,output=map(pathlib.Path,(source,spec_path,output))
    spec=json.loads(spec_path.read_text(encoding='utf-8'))
    sid=spec.get('visual_id'); assert isinstance(sid,str) and sid and sid not in {'.','..'},'BAD_VISUAL_ID'
    assert spec.get('status')=='SOURCE_PARTITION_PROTOTYPE_NOT_ANIMATION_READY','NO_UNREVIEWED_AUTOMATIC_ASSET_PROMOTION'
    assert sha(source.read_bytes())==spec['cutout_sha256'],'APPROVED_SOURCE_SHA256_MISMATCH'
    im=Image.open(source).convert('RGBA')
    assert list(im.size)==spec['size'] and im.getchannel('A').getextrema()==(0,255),'SOURCE_DIMENSION_OR_ALPHA_MISMATCH'
    assert set(spec['independent_roles'])=={'PERSONALITY_PROP','THEME_GEAR'},'UNSUPPORTED_ROLE_MASKS'
    masks={role:mask_for(im.size,spec['independent_roles'][role]) for role in ('PERSONALITY_PROP','THEME_GEAR')}
    assert ImageChops.multiply(*masks.values()).getbbox() is None,'MASK_OVERLAP'
    masks['IDENTITY_BODY']=ImageChops.invert(ImageChops.lighter(*masks.values()))
    output.mkdir(parents=True,exist_ok=True)
    rgba=Image.new('RGBA',im.size); report={}
    for key in ROLES:
        part=im.copy();part.putalpha(ImageChops.multiply(im.getchannel('A'),masks[key]));name=key.lower()+'.png';p=output/name;part.save(p,optimize=True)
        count=sum(v>0 for v in part.getchannel('A').tobytes());assert count>1000,'EMPTY_SEMANTIC_ASSET:'+key
        report[key]={'file':name,'sha256':sha(p.read_bytes()),'nontransparent_pixels':count}
        rgba.alpha_composite(part)
    assert ImageChops.difference(rgba,im).getbbox() is None,'ORIGINAL_PIXEL_FIDELITY_REGRESSION'
    assert len({item['sha256'] for item in report.values()})==len(ROLES),'DUPLICATE_LAYERS_FORBIDDEN'
    source_preview=Image.new('RGBA',im.size,(222,218,205,255));source_preview.alpha_composite(rgba)
    source_preview.resize((448,560)).convert('RGB').save(output/'composite_preview.jpg',quality=93)
    provenance={'visual_id':sid,'source_cutout_sha256':spec['cutout_sha256'],'source_dimensions':spec['size'],
      'source_mask_spec_sha256':sha(spec_path.read_bytes()),'independent_roles':report,
      'method':'SEMANTIC_SOURCE_PIXEL_PARTITION_FULL_CANVAS_NO_CROP_NO_REPAINT',
      'reconstruction':'LOSSLESS_RGBA_PIXEL_EQUALITY_PASS','status':spec['status'],
      'incomplete':['occlusion_inpainting','face_expression_animation','motion_ready_body','runtime_asset_approval','independent_6_reaction_art','11_screen_1_to_1_approval']}
    (output/'provenance.json').write_text(json.dumps(provenance,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    return provenance

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--source',required=True);p.add_argument('--spec',required=True);p.add_argument('--out',required=True)
    args=p.parse_args();print(json.dumps(run(args.source,args.spec,args.out),ensure_ascii=False,indent=2))
