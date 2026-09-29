#!/usr/bin/env python3
"""Per-Visual-ID source-motion exposure QA only. Not invented hidden artwork or active animation."""
import argparse,hashlib,json,pathlib
from PIL import Image,ImageChops,ImageDraw
# IDs are dynamically inherited from approved-source batch manifest, never hardcoded here.
MOVES={'PERSONALITY_PROP':(24,-12),'THEME_GEAR':(-18,13)}
FILES={'IDENTITY_BODY':'identity_body.png','PERSONALITY_PROP':'personality_prop.png','THEME_GEAR':'theme_gear.png'}
def sha(p):return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
def vis(im):return im.getchannel('A').point(lambda a:255 if a else 0)
def count(im):return im.histogram()[255]
def canonical(im):
    mask=vis(im)
    return Image.merge('RGBA',tuple(ImageChops.multiply(c,mask) for c in im.split()[:3])+(im.getchannel('A'),))
def shifted(img,dx,dy):
    out=Image.new('RGBA',img.size);out.paste(img,(dx,dy));return out
def panel(im,mark,title):
    bg=Image.new('RGBA',im.size,(243,238,224,255));bg.alpha_composite(im)
    overlay=Image.new('RGBA',im.size)
    overlay.paste((222,37,61,215),(0,0,*im.size),mark)
    bg.alpha_composite(overlay)
    card=Image.new('RGB',(336,452),(241,238,227))
    card.paste(bg.convert('RGB').resize((336,420),Image.Resampling.LANCZOS),(0,32))
    ImageDraw.Draw(card).text((9,9),title,fill=(47,43,37))
    return card
def run(sources,roles,specs,out):
    sources,roles,specs,out=map(pathlib.Path,(sources,roles,specs,out));out.mkdir(parents=True,exist_ok=True)
    report={'schema':'TAKY_VISUAL_ID_SOURCE_MOTION_EXPOSURE_QA_V1',
      'scope':'SOURCE_VISIBLE_PIXELS_EXPOSED_ON_MOVING_APPROVED_VISIBLE_ROLE_NOT_AUTHORED_HIDDEN_BODY',
      'artApproval':'NOT_APPROVED','motionAssetReady':False,'independentReactionAssets':0,
      'sourceOriginalModified':False,'members':{}}
    batch=json.loads((roles/'BATCH_MANIFEST.json').read_text(encoding='utf8'))
    ids=tuple(batch['ids']);assert len(ids)==len(set(ids)) and ids,'BAD_SOURCE_BATCH_IDS'
    for sid in ids:
        spec_path=specs/(sid+'.json');spec=json.loads(spec_path.read_text(encoding='utf8'))
        source=sources/(sid+'.png')
        assert spec.get('visual_id')==sid and source.name==sid+'.png','VISUAL_ID_SPEC_FILE_MISMATCH:'+sid
        assert sha(source)==spec['cutout_sha256'],'APPROVED_SOURCE_SHA_MISMATCH:'+sid
        original=Image.open(source).convert('RGBA')
        assert list(original.size)==spec['size'],'SOURCE_DIMENSIONS_MISMATCH:'+sid
        folder=roles/sid;prov=json.loads((folder/'provenance.json').read_text(encoding='utf8'))
        assert prov['visual_id']==sid and prov['source_cutout_sha256']==spec['cutout_sha256'],'DERIVED_ID_MISMATCH:'+sid
        assert prov['source_mask_spec_sha256']==sha(spec_path),'STALE_ID_MASK_SPEC:'+sid
        layer={}
        for key,name in FILES.items():
            file=folder/name
            assert sha(file)==prov['independent_roles'][key]['sha256'],'DERIVED_LAYER_HASH_MISMATCH:'+sid+':'+key
            im=Image.open(file).convert('RGBA')
            assert im.size==original.size,'DERIVED_LAYER_DIMENSIONS_MISMATCH:'+sid+':'+key
            absent=im.getchannel('A').point(lambda v:255 if v==0 else 0)
            assert all(ImageChops.multiply(c,absent).getbbox() is None for c in im.split()[:3]),'HIDDEN_RGB_LEAK:'+sid+':'+key
            layer[key]=im
        base=Image.new('RGBA',original.size)
        for key in FILES:base.alpha_composite(layer[key])
        assert base.tobytes()==canonical(original).tobytes(),'SOURCE_VISIBLE_RECOMPOSITION_MISMATCH:'+sid
        root=out/sid;root.mkdir(parents=True,exist_ok=True)
        own={'visual_id':sid,'approved_static_source_sha256':spec['cutout_sha256'],'mask_spec_sha256':sha(spec_path),
             'source_role_sha256':{key:sha(folder/name) for key,name in FILES.items()},
             'zero_shift_source_visible_exact':True,'moved_roles':{}}
        cards=[panel(base,Image.new('L',original.size,0),sid+' SOURCE-VISIBLE AT REST')]
        original_visible=vis(original)
        for key,(dx,dy) in MOVES.items():
            pose=Image.new('RGBA',original.size)
            for role in FILES:pose.alpha_composite(shifted(layer[role],dx,dy) if role==key else layer[role])
            exposed=ImageChops.subtract(original_visible,vis(pose))
            # A character BODY bbox is a broad audit hint only, NEVER a painted body mask.
            bbox_mask=Image.new('L',original.size)
            ImageDraw.Draw(bbox_mask).rectangle(layer['IDENTITY_BODY'].getbbox(),fill=255)
            rough=ImageChops.multiply(exposed,bbox_mask)
            n=count(exposed);nr=count(rough)
            assert n>0 and 0<=nr<=n,'INVALID_SOURCE_EXPOSURE:'+sid+':'+key
            ep=key.lower()+'_exposed_source_pixels.png'
            rp=key.lower()+'_body_bbox_candidate_only.png'
            exposed.save(root/ep,optimize=True);rough.save(root/rp,optimize=True)
            cards.append(panel(pose,exposed,key+' shifted '+str((dx,dy))+'; red='+str(n)+'px'))
            own['moved_roles'][key]={'translation_qa_pixels':[dx,dy],
              'missing_source_visible_pixels':n,'body_bbox_possible_NOT_ART':nr,
              'exposure_mask_png':ep,'bbox_audit_only_png':rp,
              'exposure_bbox':exposed.getbbox(),'is_independent_motion_art':False}
        sheet=Image.new('RGB',(1008,452),(255,255,255))
        for i,c in enumerate(cards):sheet.paste(c,(i*336,0))
        sheet.save(root/(sid+'_source_motion_exposure_QA.png'),optimize=True)
        (root/'provenance.json').write_text(json.dumps(own,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
        report['members'][sid]=own
    (out/'MANIFEST.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    return report
if __name__=='__main__':
    a=argparse.ArgumentParser()
    a.add_argument('--source-root',required=True);a.add_argument('--layer-root',required=True)
    a.add_argument('--spec-root',required=True);a.add_argument('--out',required=True);args=a.parse_args()
    r=run(args.source_root,args.layer_root,args.spec_root,args.out)
    print(json.dumps({'ids':list(r['members']),'exposureMasks':sum(len(m['moved_roles']) for m in r['members'].values()),
                      'artApproved':r['motionAssetReady']},indent=2))
