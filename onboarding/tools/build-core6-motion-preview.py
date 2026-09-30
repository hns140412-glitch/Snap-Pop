#!/usr/bin/env python3
"""Bundle six ACTUAL approved-source role PNGs into an isolated interactive QA-only viewer.

Does not draw characters, invent expressions, approve final rigs or change runtime.
"""
import argparse,hashlib,json,pathlib,shutil
from PIL import Image
IDS=('dubi','lori','ink','nova','take','zero')
ROLES={'body':'IDENTITY_BODY','prop':'PERSONALITY_PROP','gear':'THEME_GEAR'}
NAMES={'dubi':'두비','lori':'로리','ink':'잉크','nova':'노바','take':'테이크','zero':'제로'}
MOVES={'prop':(24,-12),'gear':(-18,13)}
def sha(p):return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
def source_visible(p):
 im=Image.open(p).convert('RGBA');data=bytearray(im.tobytes())
 for i in range(0,len(data),4):
  if data[i+3]==0:data[i:i+3]=b'\x00\x00\x00'
 return bytes(data),im.size
def build(root,out):
 root,out=pathlib.Path(root).resolve(),pathlib.Path(out).resolve()
 source=root/'characters/ui_cutouts';parts=root/'visual-prototypes';patches=root/'underpaint-qa'
 gate=json.loads((root/'asset-and-release-gate.json').read_text(encoding='utf8'))['required_assets']
 owner=json.loads((root/'crew-scope-contract.json').read_text(encoding='utf8'))
 assert tuple(owner['roster']['original_ids'])==IDS,'SOURCE_OWNER_OR_ID_DRIFT'
 patch=json.loads((patches/'MANIFEST.json').read_text(encoding='utf8'))
 batch=json.loads((parts/'BATCH_MANIFEST.json').read_text(encoding='utf8'))
 assert tuple(batch['ids'][:6])==IDS and not patch['runtimeAssetApproval'] and patch['independentReactionDrawingsCompleted']==0
 assert tuple(patch['members'])==IDS,'UNAPPROVED_OR_MISSING_MEMBER'
 out.mkdir(parents=True,exist_ok=True);members=[]
 for id in IDS:
  source_file=source/(id+'.png');v=patch['members'][id]
  assert v['visual_id']==id and sha(source_file)==v['approved_original_sha256']==gate['characters/ui_cutouts/'+id+'.png'],'ORIGINAL_SOURCE_SHA_DRIFT:'+id
  proof=json.loads((parts/id/'provenance.json').read_text(encoding='utf8'))
  assert proof['visual_id']==id and proof['source_cutout_sha256']==v['approved_original_sha256'],'SOURCE_ROLE_PROVENANCE_DRIFT:'+id
  back=patches/id/v['underpaint_png']
  assert sha(back)==v['underpaint_sha256'] and not v['artistApproved'] and not v['full_hidden_anatomy_complete'],'UNREVIEWED_ART_PROMOTION:'+id
  stack=Image.new('RGBA',(1122,1402));under=Image.open(back).convert('RGBA')
  assert under.size==(1122,1402);stack.alpha_composite(under)
  files={'underpaint':back,'original':source_file}
  for short,long in ROLES.items():
   file=parts/id/(long.lower()+'.png')
   assert sha(file)==v['per_role_sha256'][long]==proof['independent_roles'][long]['sha256'],'ROLE_SHA_DRIFT:'+id+':'+short
   layer=Image.open(file).convert('RGBA');assert layer.size==(1122,1402)
   stack.alpha_composite(layer);files[short]=file
  visible,size=source_visible(source_file)
  assert size==(1122,1402) and stack.tobytes()==visible,'EXACT_APPROVED_VISIBLE_SOURCE_PIXEL_MISMATCH:'+id
  dest=out/'assets'/id;dest.mkdir(parents=True,exist_ok=True);assets={}
  for role,file in files.items():
   target=dest/(role+'.png');shutil.copyfile(file,target)
   assert sha(target)==sha(file),'COPY_SHA_DRIFT:'+id
   assets[role]={'uri':'assets/'+id+'/'+role+'.png','sha256':sha(target)}
  members.append({'visual_id':id,'display_name':NAMES[id],'art':assets,
    'source_locked':True,'idle_visible_rgba_exact':True,'animation_art_approved':False,
    'genuine_independent_reactions':0,'qa_motion':{k:list(v) for k,v in MOVES.items()}})
 template=(root/'qa/core6-motion-preview.template.html').read_text(encoding='utf8')
 assert template.count('__CORE6_JSON__')==1
 (out/'index.html').write_text(template.replace('__CORE6_JSON__',json.dumps(members,ensure_ascii=False,separators=(',',':'))),encoding='utf8')
 result={'scope':'ISOLATED_QA_ONLY_NOT_PRODUCTION_UI','members':members,
  'total_art_file_copies':30,'idle_approved_source_rgba_exact':True,
  'actual_independent_reaction_art':0,'independent_motion_ready_art_approved':0,
  'fixed_qa_poses_only':True,'main_merge':False,'netlify':False,'userVisualApproval':False}
 (out/'MANIFEST.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
 return result
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--root',default=str(pathlib.Path(__file__).resolve().parents[1]));p.add_argument('--out',required=True);a=p.parse_args()
 r=build(a.root,a.out);print(json.dumps({'ids':[v['visual_id'] for v in r['members']],'actualApprovedSourceImageCopies':30,'sourceExact':True,'completedMotionArt':0,'completedIndependentReactions':0},indent=2))
