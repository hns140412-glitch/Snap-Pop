#!/usr/bin/env python3
"""SOURCE-LOCAL partial underpaint draft, not complete anatomy or approved motion art."""
import argparse,hashlib,json,pathlib
import cv2,numpy as np
from PIL import Image,ImageDraw
IDS=('dubi','lori','ink','nova','take','zero')
ROLES=('IDENTITY_BODY','PERSONALITY_PROP','THEME_GEAR')
MOVES={'PERSONALITY_PROP':(24,-12),'THEME_GEAR':(-18,13)}
def sha(p):return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
def canonical(im):
 a=np.array(im.convert('RGBA'));a[a[:,:,3]==0,:3]=0
 return Image.fromarray(a,'RGBA')
def composite(items):
 out=Image.new('RGBA',items[0].size)
 for im in items:out.alpha_composite(im)
 return out
def moved(im,dx,dy):
 out=Image.new('RGBA',im.size);out.paste(im,(dx,dy));return out
def card(im,title,red=None):
 bg=Image.new('RGBA',im.size,(243,237,224,255));bg.alpha_composite(im)
 if red is not None:
  overlay=Image.new('RGBA',im.size);overlay.paste((218,31,57,215),(0,0,*im.size),red);bg.alpha_composite(overlay)
 out=Image.new('RGB',(336,452),(249,246,236));out.paste(bg.convert('RGB').resize((336,420)),(0,32))
 ImageDraw.Draw(out).text((8,7),title,fill=(45,38,33));return out
def run(source_root,layer_root,exposure_root,out):
 source_root,layer_root,exposure_root,out=map(pathlib.Path,(source_root,layer_root,exposure_root,out))
 out.mkdir(parents=True,exist_ok=True)
 manifest=json.loads((exposure_root/'MANIFEST.json').read_text(encoding='utf8'))
 assert manifest['artApproval']=='NOT_APPROVED' and manifest['motionAssetReady'] is False,'SOURCE_GUIDE_PREMATURE_ART_PROMOTION'
 assert tuple(manifest['members'])==IDS,'SOURCE_GUIDE_VISUAL_ID_MISMATCH'
 result={'schema':'TAKY_CORE6_SOURCE_LOCAL_PARTIAL_OPAQUE_UNDERPAINT_DRAFT',
         'noFullAnatomyOrExpressionClaim':True,'originalFilesModified':False,
         'independentReactionDrawingsCompleted':0,'runtimeAssetApproval':False,'members':{}}
 for sid in IDS:
  original_file=source_root/(sid+'.png');guide=manifest['members'][sid]
  prov=json.loads((layer_root/sid/'provenance.json').read_text(encoding='utf8'))
  assert sid==guide['visual_id']==prov['visual_id'],'WRONG_VISUAL_ID:'+sid
  assert sha(original_file)==guide['approved_static_source_sha256']==prov['source_cutout_sha256'],'APPROVED_ORIGINAL_SHA_MISMATCH:'+sid
  assert guide['mask_spec_sha256']==prov['source_mask_spec_sha256'],'STALE_MASK_SPEC:'+sid
  layers={}
  for role in ROLES:
   file=layer_root/sid/(role.lower()+'.png')
   assert sha(file)==prov['independent_roles'][role]['sha256']==guide['source_role_sha256'][role],'STALE_ART_LAYER:'+sid+':'+role
   layers[role]=Image.open(file).convert('RGBA')
  original=canonical(Image.open(original_file).convert('RGBA'))
  assert composite([layers[k] for k in ROLES]).tobytes()==original.tobytes(),'STATIC_SOURCE_RECOMPOSITION_FAILED:'+sid
  base=np.asarray(original);body=np.asarray(layers['IDENTITY_BODY'])
  exposures={}
  for role in MOVES:
   detail=guide['moved_roles'][role]
   assert tuple(detail['translation_qa_pixels'])==MOVES[role] and detail['is_independent_motion_art'] is False,'INVALID_GUIDE:'+sid+':'+role
   mask=np.array(Image.open(exposure_root/sid/detail['exposure_mask_png']).convert('L'))>0
   assert int(mask.sum())==detail['missing_source_visible_pixels'] and mask.shape==base.shape[:2],'EXPOSURE_GUIDE_MISMATCH:'+sid+':'+role
   exposures[role]=mask
  exposure_union=exposures['PERSONALITY_PROP']|exposures['THEME_GEAR']
  role_alpha=np.maximum(np.asarray(layers['PERSONALITY_PROP'])[:,:,3],np.asarray(layers['THEME_GEAR'])[:,:,3])
  # Rest image must be byte-identical: fill only previously empty BODY pixels
  # covered at rest by a FULLY OPAQUE prop/gear and approved original alpha=255.
  safe=exposure_union&(base[:,:,3]==255)&(role_alpha==255)&(body[:,:,3]==0)
  yy,xx=np.where(safe);assert len(xx)>0,'NO_OPAQUE_SAFE_EXPOSURE:'+sid
  x0=max(0,int(xx.min())-70);x1=min(base.shape[1],int(xx.max())+71)
  y0=max(0,int(yy.min())-70);y1=min(base.shape[0],int(yy.max())+71)
  area=np.s_[y0:y1,x0:x1];crop=body[area]
  donor=np.ascontiguousarray(crop[:,:,:3][:,:,::-1])
  unknown=np.ascontiguousarray((crop[:,:,3]<230).astype('uint8')*255)
  inpaint=cv2.inpaint(donor,unknown,5,cv2.INPAINT_TELEA)[:,:,::-1]
  patch=np.zeros_like(body);local=patch[area];on=safe[area]
  local[on,:3]=inpaint[on];local[on,3]=255
  patch_image=Image.fromarray(patch,'RGBA')
  assert composite([patch_image]+[layers[k] for k in ROLES]).tobytes()==original.tobytes(),'ORIGINAL_REST_PIXELS_CHANGED:'+sid
  folder=out/sid;folder.mkdir(exist_ok=True)
  patch_file=folder/'source_local_partial_body_underpaint_QA_HOLD.png';patch_image.save(patch_file,optimize=True)
  Image.fromarray((safe*255).astype('uint8'),'L').save(folder/'actual_inferred_pixels_binary_mask.png',optimize=True)
  cards=[card(original,sid+' ORIGINAL / REST')]
  state={'visual_id':sid,'approved_original_sha256':sha(original_file),'source_mask_spec_sha256':prov['source_mask_spec_sha256'],
         'per_role_sha256':{k:prov['independent_roles'][k]['sha256'] for k in ROLES},
         'underpaint_png':'source_local_partial_body_underpaint_QA_HOLD.png','underpaint_sha256':sha(patch_file),
         'inferred_opaque_pixel_count':int(safe.sum()),'exposure_union_pixel_count':int(exposure_union.sum()),
         'static_original_byte_identical':True,'full_hidden_anatomy_complete':False,'artistApproved':False,'poses':{}}
  for role,(dx,dy) in MOVES.items():
   all_roles=[moved(layers[k],dx,dy) if k==role else layers[k] for k in ROLES]
   raw=composite(all_roles);repaired=composite([patch_image]+all_roles)
   visible_original=base[:,:,3]>0
   raw_exposed=visible_original&(np.asarray(raw)[:,:,3]==0)
   after_exposed=visible_original&(np.asarray(repaired)[:,:,3]==0)
   before=int(raw_exposed.sum());after=int(after_exposed.sum())
   assert before==int(exposures[role].sum()) and 0<=after<before,'POSE_EXPOSURE_REGRESSION:'+sid+':'+role
   raw.save(folder/(role.lower()+'_moving_before.png'),optimize=True)
   repaired.save(folder/(role.lower()+'_moving_partial_underpaint_QA_HOLD.png'),optimize=True)
   cards.append(card(raw,role+' BEFORE '+str(before),Image.fromarray((raw_exposed*255).astype('uint8'),'L')))
   cards.append(card(repaired,role+' AFTER '+str(after),Image.fromarray((after_exposed*255).astype('uint8'),'L')))
   state['poses'][role]={'translation_qa_px':[dx,dy],'missing_before':before,'remaining_after':after,
                        'covered_source_visible_exposure':before-after,'tested_placement_only':True}
  panel=Image.new('RGB',(336*5,452),(249,246,236))
  for k,c in enumerate(cards):panel.paste(c,(336*k,0))
  panel.save(folder/(sid+'_underpaint_before_after_QA_HOLD.jpg'),quality=92)
  (folder/'provenance.json').write_text(json.dumps(state,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
  result['members'][sid]=state
 (out/'MANIFEST.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
 return result
if __name__=='__main__':
 p=argparse.ArgumentParser()
 for a in ('source-root','layer-root','exposure-root','out'):p.add_argument('--'+a,required=True)
 a=p.parse_args();report=run(a.source_root,a.layer_root,a.exposure_root,a.out)
 print(json.dumps({sid:{role:x['poses'][role]['remaining_after'] for role in MOVES} for sid,x in report['members'].items()},indent=2))
