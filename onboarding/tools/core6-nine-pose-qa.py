#!/usr/bin/env python3
"""Six EXISTING approved-source original-art 9-pose QA samples. NOT finished character art."""
import hashlib,json,pathlib
import cv2,numpy as np
from PIL import Image
IDS=('dubi','lori','ink','nova','take','zero')
ROLES=('underpaint','body','prop','gear')
POSES=[('rest',(0,0),(0,0)),('prop1',(8,-4),(0,0)),('prop2',(16,-8),(0,0)),('prop3',(24,-12),(0,0)),('rest',(0,0),(0,0)),('gear1',(0,0),(-6,4)),('gear2',(0,0),(-12,8)),('gear3',(0,0),(-18,13)),('rest',(0,0),(0,0))]
DURATIONS=[750,170,170,700,500,170,170,700,650]
def sha(path):return hashlib.sha256(pathlib.Path(path).read_bytes()).hexdigest()
def canonical(im):
    a=np.array(im.convert('RGBA'));a[a[:,:,3]==0,:3]=0;return Image.fromarray(a,'RGBA')
def move(im,xy):
    target=Image.new('RGBA',im.size);target.paste(im,xy);return target
def compose(layers,prop=(0,0),gear=(0,0)):
    out=Image.new('RGBA',(1122,1402))
    for role in ROLES:
        im=move(layers[role],prop if role=='prop' else gear) if role in ('prop','gear') else layers[role]
        out.alpha_composite(im)
    return out
def run(root,out):
    root,out=pathlib.Path(root),pathlib.Path(out);out.mkdir(parents=True,exist_ok=True)
    baseline=json.loads((root/'MANIFEST.json').read_text(encoding='utf8'))
    assert tuple(x['visual_id'] for x in baseline['members'])==IDS and baseline['total_art_file_copies']==30,'CORE6_APPROVED_SOURCE_DRIFT'
    assert baseline['actual_independent_reaction_art']==baseline['independent_motion_ready_art_approved']==0,'FALSE_ART_APPROVAL'
    report={'scope':'SOURCE_LOCKED_INTERMEDIATE_POSE_ALPHA_QA_ONLY','visual_ids':list(IDS),'members':{},
            'originals_modified':False,'generated_new_characters':False,'complete_motion_art':0,
            'genuine_expression_art':0,'semantic_hand_prop_grip_approved':False,'user_visual_approval':False}
    for member in baseline['members']:
        sid=member['visual_id'];folder=out/sid;folder.mkdir(parents=True,exist_ok=True)
        layers={}
        for role in (*ROLES,'original'):
            entry=member['art'][role];path=root/entry['uri']
            assert sha(path)==entry['sha256'],'APPROVED_OR_DERIVED_SHA_MISMATCH:'+sid+':'+role
            layers[role]=Image.open(path).convert('RGBA')
            assert layers[role].size==(1122,1402),'SOURCE_SIZE_DRIFT:'+sid+':'+role
        orig=canonical(layers['original'])
        assert compose(layers).tobytes()==orig.tobytes(),'AT_REST_VISIBLE_PIXEL_MISMATCH:'+sid
        src_visible=np.asarray(orig.getchannel('A'))>0
        old_masks=[]
        for _,p,g in POSES:old_masks.append(src_visible&~(np.asarray(compose(layers,p,g).getchannel('A'))>0))
        union=np.logical_or.reduce(old_masks)
        patch=np.array(layers['underpaint'])
        # Only add pixels originally hidden under approved opaque source artwork.
        safe=union&(patch[:,:,3]==0)&(np.asarray(orig.getchannel('A'))==255)
        if safe.any():
            visible=Image.new('RGBA',(1122,1402))
            visible.alpha_composite(layers['underpaint']);visible.alpha_composite(layers['body'])
            donor=np.array(visible)
            count,labels,stats,_=cv2.connectedComponentsWithStats(safe.astype('uint8'),connectivity=8)
            for label in range(1,count):
                x,y,w,h,_=stats[label];x0=max(0,x-48);x1=min(1122,x+w+48);y0=max(0,y-48);y1=min(1402,y+h+48)
                crop=donor[y0:y1,x0:x1];unknown=np.ascontiguousarray((crop[:,:,3]<230).astype('uint8')*255)
                rgb=cv2.inpaint(np.ascontiguousarray(crop[:,:,:3][:,:,::-1]),unknown,5,cv2.INPAINT_TELEA)[:,:,::-1]
                targeted=(labels[y0:y1,x0:x1]==label)&safe[y0:y1,x0:x1];local=patch[y0:y1,x0:x1]
                local[targeted,:3]=rgb[targeted];local[targeted,3]=255
        extension=Image.fromarray(patch,'RGBA')
        extended={**layers,'underpaint':extension}
        assert compose(extended).tobytes()==orig.tobytes(),'AT_REST_PIXEL_DRIFT_AFTER_PATCH:'+sid
        under=folder/'source_local_nine_pose_partial_underpaint_QA_HOLD.png';extension.save(under,optimize=True)
        Image.fromarray((safe*255).astype('uint8'),'L').save(folder/'extra_intermediate_exposure_mask.png',optimize=True)
        frames=[];poses=[]
        for (name,p,g),before in zip(POSES,old_masks):
            scene=compose(extended,p,g)
            remaining=src_visible&~(np.asarray(scene.getchannel('A'))>0)
            before_n,after_n=int(before.sum()),int(remaining.sum())
            assert after_n==0,(sid,name,before_n,after_n)
            frames.append(scene.resize((520,650),Image.Resampling.LANCZOS))
            poses.append({'name':name,'prop_xy':list(p),'gear_xy':list(g),
                          'original_visible_alpha_gap_before':before_n,'after':after_n})
        movie=folder/(sid+'_approved_source_nine_pose_QA_HOLD.webp')
        frames[0].save(movie,save_all=True,append_images=frames[1:],duration=DURATIONS,loop=0,lossless=True,method=6)
        with Image.open(movie) as check:
            assert check.n_frames==9 and check.size==(520,650),'WEBP_FRAME_LOSS:'+sid
        report['members'][sid]={
            'source_sha256':member['art']['original']['sha256'],'previous_underpaint_sha256':member['art']['underpaint']['sha256'],
            'new_patch_sha256':sha(under),'preview_sha256':sha(movie),'new_patch_png':str(under.relative_to(out)),
            'preview_webp':str(movie.relative_to(out)),'extra_local_inferred_pixels':int(safe.sum()),
            'at_rest_original_visible_bytes_exact':True,'9_technical_source_visible_alpha_gaps_zero':True,
            'artist_approval':False,'poses':poses}
    (out/'MANIFEST.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    return report
if __name__=='__main__':
    root=pathlib.Path(__file__).resolve().parents[1]
    r=run(root/'qa-original-rig',root/'qa-nine-pose')
    print(json.dumps({'ids':r['visual_ids'],'additionalInferredPixels':{k:v['extra_local_inferred_pixels'] for k,v in r['members'].items()},
                      'totalCheckedFrames':54,'finalRigApproved':0,'realExpressionArtApproved':0},ensure_ascii=False,indent=2))
