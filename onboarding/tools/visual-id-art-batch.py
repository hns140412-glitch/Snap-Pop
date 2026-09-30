#!/usr/bin/env python3
"""One source-authoritative 3-layer + 6-reaction batch contract; NEVER fabricates art."""
import argparse, hashlib, importlib.util, json, pathlib, re
from PIL import Image
ROOT=pathlib.Path(__file__).resolve().parents[1]
HEX=re.compile(r'[0-9a-f]{64}')
def digest(path): return hashlib.sha256(path.read_bytes()).hexdigest()
def load(path): return json.loads(path.read_text(encoding='utf-8'))
def within(root,rel):
    assert isinstance(rel,str) and rel and not pathlib.PurePosixPath(rel).is_absolute() and '\\\\' not in rel and '..' not in pathlib.PurePosixPath(rel).parts,'UNSAFE_ASSET_PATH'
    p=root.joinpath(*pathlib.PurePosixPath(rel).parts)
    assert p.resolve().is_relative_to(root.resolve()) and not p.is_symlink(),'OUTSIDE_SOURCE_ROOT'
    return p
def check(root,rel,expected):
    assert isinstance(expected,str) and HEX.fullmatch(expected),'MISSING_SHA256'
    p=within(root,rel)
    assert p.is_file() and digest(p)==expected,'SOURCE_OR_OUTPUT_SHA_DRIFT:'+rel
    return p
def config(root=ROOT):
    c=load(root/'visual-id-batch-production.v1.json')
    assert c['schema']=='TAKY_VISUAL_ID_BATCH_PRODUCTION_V1'
    assert set(c['perIdOutputs']['layers'])=={'IDENTITY_BODY','PERSONALITY_PROP','THEME_GEAR'}
    assert set(c['perIdOutputs']['reactions'])=={'OBSERVE','LISTEN','IDEA','REACT','WAIT','COMPLETE'}
    return c
def discover(root=ROOT):
    mpath=root/'tools/visual-id-batch.py'
    spec=importlib.util.spec_from_file_location('visual_batch_source',mpath)
    module=importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.discover(root)
def slots(c,id):
    roles={**c['perIdOutputs']['layers'],**c['perIdOutputs']['reactions']}
    return {key:value.replace('<id>',id) for key,value in roles.items()}
def source_lock(root,row,gate):
    id=row['visual_id']
    original='characters/originals/'+id+'_source.jpeg'
    if row['stage']=='STAGED_APPROVED_SOURCE_NOT_ACTIVE':
        v=load(root/'visual-id-candidates'/(id+'.json'))['visualApproval']
        original=v['sourcePath']
        approval=v['reference']
        expected=v['sha256']
    else:
        expected=gate[original]
        approval='INHERITED_CORE6_APPROVED_MANIFEST'
    check(root,original,expected)
    cut='characters/ui_cutouts/'+id+'.png'
    check(root,cut,row['source_sha256'])
    spec='characters/layer_specs/'+id+'.json'
    check(root,spec,row['mask_spec_sha256'])
    return {'original':original,'original_sha256':expected,'cutout':cut,
            'cutout_sha256':row['source_sha256'],'mask_spec':spec,
            'mask_spec_sha256':row['mask_spec_sha256'],'visual_approval_ref':approval}
def guide_pending(root,only_id=None):
    module_path=root/'tools/guide-group-intake.py'
    spec=importlib.util.spec_from_file_location('guide_group',module_path)
    module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
    evidence=module.check(root)
    assert evidence['mapped_members']==18,'GUIDE_18_SOURCE_MAPPINGS_MISSING'
    data=module.load(root);groups={x['group_id']:x for x in data['source_groups']}
    refs=load(root/'guide-07-24-reference-view-manifest.v1.json')
    registry=load(root/'guide-07-24-independent-source-registry.v1.json')
    assert registry['schema']=='TAKY_GUIDE_07_24_INDEPENDENT_SOURCE_REGISTRY_V1'
    ref_by_id={x['visual_id']:x for x in refs['members']}
    reg_by_id={x['visual_id']:x for x in registry['members']}
    assert set(ref_by_id)==set(reg_by_id)==set(range(7,25)),'GUIDE_INDEPENDENT_REGISTRY_ID_DRIFT'
    c=config(root);result=[]
    for member in data['members']:
        id=member['pipeline_key']
        if only_id and only_id!=id:continue
        g=groups[member['source_group_id']]
        rv=ref_by_id[member['visual_id']]
        reg=reg_by_id[member['visual_id']]
        assert reg['pipeline_key']==id and reg['code']==member['code'],'GUIDE_REGISTRY_IDENTITY_DRIFT:'+id
        assert reg['source_group_sha256']==g['sha256'] and reg['source_reference_view_sha256']==rv['reference_view_sha256'],'GUIDE_REGISTRY_SOURCE_DRIFT:'+id
        expected_cut='characters/ui_cutouts/'+id+'.png'
        expected_spec='characters/layer_specs/'+id+'.json'
        assert reg['cutout_path']==expected_cut and reg['mask_spec_path']==expected_spec,'GUIDE_REGISTRY_PATH_DRIFT:'+id
        cutsha=reg.get('cutout_sha256');masksha=reg.get('mask_spec_sha256');approval=reg.get('approval_ref')
        source_lock=None
        status='AWAITING_INDEPENDENT_CUTOUT_SHA'
        if cutsha is not None:
            check(root,expected_cut,cutsha)
            if masksha is None or not str(approval or '').strip():
                status='INDEPENDENT_CUTOUT_SHA_LOCKED_MASK_SPEC_OPEN'
            else:
                check(root,expected_spec,masksha)
                specdata=load(root/expected_spec)
                assert specdata.get('visual_id')==id,'GUIDE_MASK_ID_DRIFT:'+id
                assert specdata.get('cutout_sha256')==cutsha,'GUIDE_MASK_CUTOUT_SHA_DRIFT:'+id
                assert specdata.get('status')=='SOURCE_PARTITION_PROTOTYPE_NOT_ANIMATION_READY','GUIDE_MASK_STATUS_DRIFT:'+id
                source_lock={'original':'LIBRARY_GROUP:'+member['source_group_id'],
                    'original_sha256':g['sha256'],'original_scope':'APPROVED_GROUP_IMAGE',
                    'source_reference_view_sha256':rv['reference_view_sha256'],
                    'cutout':expected_cut,'cutout_sha256':cutsha,
                    'mask_spec':expected_spec,'mask_spec_sha256':masksha,
                    'visual_approval_ref':approval}
                status='ART_PRODUCTION_OPEN_NOT_AUTO_GENERATED'
        result.append({'visual_id':id,'numeric_visual_id':member['visual_id'],
          'code':member['code'],'name_ko':member['name_ko'],
          'source_group_lock':{'sha256':g['sha256'],'zip_entry':g['library_zip_entry'],
                               'panel_position':member['panel_position_left_to_right'],
                               'scope':'GROUP_NOT_PER_MEMBER'},
          'source_reference_view':{'sha256':rv['reference_view_sha256'],'path':rv['reference_view_path'],
                                   'pixel_box':rv['exact_source_pixel_box'],'status':rv['status'],
                                   'not_individual_original':True,'not_final_art':True},
          'outputs':slots(c,id),'package_manifest':c['perIdOutputs']['manifest'].replace('<id>',id),
          'required_art_count':9,'verified_final_art_count':0,'status':status,
          'source_lock':source_lock,'active_runtime':False,'release_approved':False})
    return result
def plan(root=ROOT,only_id=None,include_guide=False):
    c=config(root); discovered=discover(root)
    gate=load(root/'asset-and-release-gate.json')['required_assets']
    work=[]
    for row in discovered['rows']:
        id=row['visual_id']
        if only_id and id!=only_id: continue
        proof=source_lock(root,row,gate)
        work.append({'visual_id':id,'source_lock':proof,'outputs':slots(c,id),
          'package_manifest':c['perIdOutputs']['manifest'].replace('<id>',id),
          'restore_existing_prototypes':id in discovered['existingOriginalIds'],
          'status':'ART_PRODUCTION_OPEN_NOT_AUTO_GENERATED',
          'required_art_count':9,'verified_final_art_count':0,
          'scene_surfaces':c['sceneSurfaces'],'screen_stages':c['screenStages'],
          'release_approved':False})
    for id in discovered['openStagedWithoutAuthoredMasks']:
        if only_id and id!=only_id: continue
        work.append({'visual_id':id,'outputs':slots(c,id),'status':'BLOCKED_INDIVIDUAL_CUTOUT_OR_MASK_SPEC',
                     'required_art_count':9,'verified_final_art_count':0,'release_approved':False})
    if include_guide:
        additional=guide_pending(root,only_id)
        assert set(x['visual_id'] for x in work).isdisjoint(x['visual_id'] for x in additional),'CORE6_GUIDE_ID_COLLISION'
        work.extend(additional)
    assert not only_id or any(w['visual_id']==only_id for w in work),'UNKNOWN_OR_UNAPPROVED_VISUAL_ID'
    assert len(work)<=24,'GUIDE_BATCH_CAPACITY_24_EXCEEDED'
    return {'schema':c['schema'],'scope':'FULL_24_APPROVED_GROUP_INTAKE' if include_guide else 'CORE6_EXISTING',
        'members':work,'per_member':9,
        'total_required':len(work)*9,'all_assets_auto_generated':False,
        'human_art_review_required':True,'root_activation':False,'main_merge':False,'netlify':False}
def canonical(im):
    rgba=im.convert('RGBA')
    data=bytearray(rgba.tobytes())
    for i in range(0,len(data),4):
        if data[i+3]==0:data[i:i+3]=bytes(3)
    return bytes(data),rgba.size
def audit_one(root,item,c):
    id=item['visual_id']
    if not item.get('source_lock'):
        return {'visual_id':id,'verified_files':0,'target':9,'status':item['status'],'release_ready':False}
    pkg_path=within(root,item['package_manifest'])
    if not pkg_path.is_file():
        return {'visual_id':id,'verified_files':0,'target':9,'status':'NINE_REAL_ART_FILES_NOT_SUBMITTED',
                'missing':list(item['outputs']),'release_ready':False}
    pkg=load(pkg_path);src=item['source_lock']
    assert pkg.get('schema')==c['packageManifest']['schema'] and pkg.get('visual_id')==id,'ART_PACKAGE_WRONG_SCHEMA_OR_VISUAL_ID'
    checks=[('source_original_sha256',src['original_sha256']),
            ('source_cutout_sha256',src['cutout_sha256']),
            ('source_mask_spec_sha256',src['mask_spec_sha256']),
            ('visual_approval_ref',src['visual_approval_ref'])]
    if src.get('source_reference_view_sha256'):
        checks.append(('source_reference_view_sha256',src['source_reference_view_sha256']))
    for key,expected in checks:
        assert pkg.get(key)==expected,'ART_PACKAGE_SOURCE_PROVENANCE_DRIFT:'+id+':'+key
    records=pkg.get('assets')
    assert isinstance(records,dict) and set(records)==set(item['outputs']),'NINE_DISTINCT_ASSET_RECORDS_REQUIRED'
    seen=set();images={};verified=0
    approved=Image.open(check(root,src['cutout'],src['cutout_sha256']))
    baseline,size=canonical(approved)
    assert size==tuple(c['imageContract']['canvasPixels']),'APPROVED_SOURCE_SIZE_DRIFT'
    for slot,rel in item['outputs'].items():
        rec=records[slot]
        assert rec.get('path')==rel,'WRONG_OR_REUSED_OUTPUT_PATH:'+slot
        assert rec.get('source_sha256')==src['cutout_sha256'],'DERIVATIVE_SOURCE_DRIFT:'+slot
        assert rec.get('method') in c['packageManifest']['allowedMethods'],'UNTRACED_ART_METHOD:'+slot
        assert len(str(rec.get('fidelity_review_ref','')).strip())>=6,'SOURCE_FIDELITY_REVIEW_MISSING:'+slot
        path=check(root,rel,rec.get('sha256'))
        with Image.open(path) as im:
            assert im.format=='PNG' and im.mode=='RGBA','INDEPENDENT_RGBA_PNG_REQUIRED:'+slot
            rgba=im.copy()
        raw=rgba.tobytes();normalized,dims=canonical(rgba)
        assert dims==size,'CANVAS_OR_COORDINATE_MISMATCH:'+slot
        assert normalized==raw,'HIDDEN_RGB_IN_TRANSPARENT_PIXELS:'+slot
        alpha=rgba.getchannel('A').getextrema()
        assert alpha[0]==0 and alpha[1]>0,'NOT_NONEMPTY_TRANSPARENT_ART:'+slot
        pixelhash=hashlib.sha256(normalized).hexdigest()
        assert pixelhash not in seen and pixelhash!=hashlib.sha256(baseline).hexdigest(),'DUPLICATE_OR_REPACKAGED_ASSET:'+slot
        seen.add(pixelhash);images[slot]=rgba;verified+=1
    composition=Image.new('RGBA',size)
    for role in c['perIdOutputs']['layers']:
        composition.alpha_composite(images[role])
    assert composition.tobytes()==baseline,'AT_REST_APPROVED_SOURCE_VISIBLE_RGBA_DIFFERENCE:'+id
    return {'visual_id':id,'verified_files':verified,'target':9,
            'status':'NINE_ART_FILES_MACHINE_CHECKED_ARTISTIC_AND_UI_QA_OPEN',
            'still_source_visible_exact':True,'independent_reaction_art_human_review':'OPEN',
            'real_device':'OPEN','screen_reference_parity':'OPEN',
            'pixel_sha256':sorted(seen),'release_ready':False}
def reject_cross_visual_duplicates(results):
    owner={};conflict=set()
    for row in results:
        if row.get('verified_files')!=9:continue
        for pixel in row.get('pixel_sha256',[]):
            if pixel in owner:
                conflict.add(owner[pixel]);conflict.add(row['visual_id'])
            else:owner[pixel]=row['visual_id']
    for row in results:
        if row['visual_id'] in conflict:
            row.update(verified_files=0,status='FAIL_CLOSED_CROSS_VISUAL_ID_DUPLICATE',
                       error='CROSS_ID_REUSED_ART_PIXELS',release_ready=False)
    return results
def audit(root=ROOT,only_id=None,include_guide=False):
    c=config(root);queue=plan(root,only_id,include_guide=include_guide)
    results=[]
    for member in queue['members']:
        try: results.append(audit_one(root,member,c))
        except (AssertionError,KeyError,TypeError,ValueError,OSError) as e:
            results.append({'visual_id':member['visual_id'],'verified_files':0,'target':9,
                            'status':'FAIL_CLOSED','error':str(e),'release_ready':False})
    reject_cross_visual_duplicates(results)
    return {'schema':c['schema'],'members':results,'target':len(results)*9,
            'machine_verified_files':sum(m['verified_files'] for m in results),
            'artistic_human_approval':'OPEN','screen_binding_qa':'OPEN',
            'real_device_qa':'OPEN','root_activation':False,'main_merge':False,'netlify':False}
def cli():
    arg=argparse.ArgumentParser()
    arg.add_argument('--mode',choices=['plan','audit'],required=True)
    arg.add_argument('--scope',choices=['core6','full24'],default='core6')
    arg.add_argument('--id')
    arg.add_argument('--out')
    a=arg.parse_args()
    result=plan(ROOT,a.id,include_guide=a.scope=='full24') if a.mode=='plan' else audit(ROOT,a.id,include_guide=a.scope=='full24')
    serial=json.dumps(result,ensure_ascii=False,indent=2)+'\n'
    if a.out:
        dest=pathlib.Path(a.out).resolve()
        assert dest.is_relative_to((ROOT/'qa').resolve()),'REPORT_MUST_BE_IN_ISOLATED_QA_FOLDER'
        dest.parent.mkdir(parents=True,exist_ok=True)
        dest.write_text(serial,encoding='utf8')
    print(serial)
if __name__=='__main__':cli()
