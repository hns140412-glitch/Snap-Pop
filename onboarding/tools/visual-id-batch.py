#!/usr/bin/env python3
"""One authorized Visual-ID batch for source-pixel drafts. NEVER auto-approves art/roster."""
import argparse,hashlib,importlib.util,json,pathlib,re
MAX_TECHNICAL_ID_CAPACITY=24
ID_RE=re.compile(r'[a-z][a-z0-9_-]{1,40}\Z')
def sha(p):return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
def inside(root,rel):
    p=pathlib.PurePosixPath(rel)
    assert rel and not p.is_absolute() and '..' not in p.parts and '\\' not in rel,'UNSAFE_SOURCE_PATH'
    full=(root/pathlib.Path(*p.parts)).resolve()
    assert full.is_relative_to(root.resolve()) and full.is_file() and not (root/pathlib.Path(*p.parts)).is_symlink(),'SOURCE_NOT_OWNED_FILE'
    return full
def validate_ids(ids):
    ids=tuple(ids)
    assert len(ids)<=MAX_TECHNICAL_ID_CAPACITY,'BATCH_TECHNICAL_CAPACITY_EXCEEDED'
    assert len(set(ids))==len(ids),'DUPLICATE_VISUAL_ID'
    assert all(isinstance(i,str) and ID_RE.fullmatch(i) for i in ids),'INVALID_VISUAL_ID'
    return ids
def discover(root):
    root=pathlib.Path(root).resolve()
    contract=json.loads((root/'crew-scope-contract.json').read_text(encoding='utf8'))
    original=tuple(contract['roster']['original_ids'])
    assert len(original)==6 and len(set(original))==6,'EXISTING_CORE6_AUTHORITY_DRIFT'
    manifest=json.loads((root/'asset-and-release-gate.json').read_text(encoding='utf8'))['required_assets']
    staged_dir=root/'visual-id-candidates'
    candidates={}
    if staged_dir.exists():
        for f in sorted(staged_dir.glob('*.json')):
            assert not f.is_symlink(),'STAGED_CANDIDATE_SYMLINK'
            candidate=json.loads(f.read_text(encoding='utf8'))
            sid=f.stem
            assert ID_RE.fullmatch(sid) and candidate['id']==sid and sid not in original,'STAGED_ID_INVALID_OR_COLLISION'
            approval=candidate.get('visualApproval',{})
            assert candidate.get('stage')=='STAGED_SOURCE_LOCKED' and approval.get('status')=='LOCKED' and len(str(approval.get('reference','')).strip())>=6,'STAGED_SOURCE_NOT_APPROVED:'+sid
            sr=approval.get('sourcePath')
            assert sr in ('characters/originals/'+sid+'_source.png','characters/originals/'+sid+'_source.jpg','characters/originals/'+sid+'_source.jpeg'),'STAGED_SOURCE_PATH_ID_MISMATCH:'+sid
            assert manifest.get(sr)==approval.get('sha256')==sha(inside(root,sr)),'STAGED_ORIGINAL_MANIFEST_DRIFT:'+sid
            assert sid not in candidates,'DUPLICATE_STAGED_VISUAL_ID:'+sid
            candidates[sid]=candidate
    validate_ids(original+tuple(sorted(candidates)))
    spec_root=root/'characters/layer_specs'
    specs={f.stem:f for f in sorted(spec_root.glob('*.json'))}
    assert len(specs)>=len(original),'BASELINE_SPECS_MISSING'
    assert all(s in specs for s in original),'BASELINE_SPEC_MISSING'
    assert all(not f.is_symlink() for f in specs.values()),'MASK_SPEC_SYMLINK'
    assert set(specs)<=set(original)|set(candidates),'UNAUTHORIZED_MASK_SPEC'
    ids=validate_ids(original+tuple(sorted(set(specs)-set(original))))
    rows=[]
    for sid in ids:
        specfile=specs[sid]
        spec=json.loads(specfile.read_text(encoding='utf8'))
        cutout='characters/ui_cutouts/'+sid+'.png'
        src=inside(root,cutout)
        assert spec['visual_id']==sid and spec['status']=='SOURCE_PARTITION_PROTOTYPE_NOT_ANIMATION_READY','MASK_ID_OR_STATUS_MISMATCH:'+sid
        assert sha(src)==spec['cutout_sha256']==manifest.get(cutout),'APPROVED_CUTOUT_HASH_DRIFT:'+sid
        if sid not in original:assert sid in candidates,'NEW_ID_SOURCE_NOT_LOCKED:'+sid
        rows.append({'visual_id':sid,'source_sha256':spec['cutout_sha256'],'mask_spec_sha256':sha(specfile),
                     'stage':'ORIGINAL_CORE6' if sid in original else 'STAGED_APPROVED_SOURCE_NOT_ACTIVE'})
    return {'ids':ids,'rows':rows,'openStagedWithoutAuthoredMasks':[sid for sid in sorted(candidates) if sid not in specs],
            'existingOriginalIds':original,'totalNamed':len(original)+len(candidates),
            'activeRosterModified':False,'autoArtApproval':False,'autoRuntimeActivation':False,'capacityIsTechnicalNotRosterAuthorization':True}
def run(root,out,check_only=False):
    root,out=pathlib.Path(root).resolve(),pathlib.Path(out)
    result=discover(root)
    if check_only:return result
    module=importlib.util.spec_from_file_location('source_layer_extract',root/'tools/extract-source-layers.py')
    assert module and module.loader
    m=importlib.util.module_from_spec(module);module.loader.exec_module(m)
    out.mkdir(parents=True,exist_ok=True)
    produced=[]
    for row in result['rows']:
        sid=row['visual_id']
        actual=m.run(root/'characters/ui_cutouts'/f'{sid}.png',root/'characters/layer_specs'/f'{sid}.json',out/sid)
        assert actual['visual_id']==sid and actual['source_cutout_sha256']==row['source_sha256'] and actual['source_mask_spec_sha256']==row['mask_spec_sha256'],'BATCH_OUTPUT_SOURCE_ID_DRIFT:'+sid
        assert actual['status']=='SOURCE_PARTITION_PROTOTYPE_NOT_ANIMATION_READY','BATCH_FALSE_ART_APPROVAL:'+sid
        produced.append({'visual_id':sid,'role_draft_sha256':{key:val['sha256'] for key,val in actual['independent_roles'].items()},
                         'technicalSourcePixelDraftOnly':True})
    result['produced']=produced
    (out/'BATCH_MANIFEST.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    return result
if __name__=='__main__':
    p=argparse.ArgumentParser()
    p.add_argument('--root',default=str(pathlib.Path(__file__).resolve().parents[1]))
    p.add_argument('--out',default='onboarding/visual-prototypes')
    p.add_argument('--check-only',action='store_true')
    a=p.parse_args()
    r=run(a.root,a.out,a.check_only)
    print(json.dumps({'ids':list(r['ids']),'sourcePixelDrafts':0 if a.check_only else len(r['produced']),
      'stagedAwaitingIndividualMask':r['openStagedWithoutAuthoredMasks'],'noArtOrRosterAutoApproval':True},indent=2))
