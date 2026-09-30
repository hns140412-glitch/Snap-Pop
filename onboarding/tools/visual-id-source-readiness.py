#!/usr/bin/env python3
"""Read-only arming gate for the 24-member Visual ID art pipeline."""
import argparse,importlib.util,json,pathlib
ROOT=pathlib.Path(__file__).resolve().parents[1]
def load_batch(root=ROOT):
    path=root/'tools/visual-id-art-batch.py'
    spec=importlib.util.spec_from_file_location('art_batch_readiness',path)
    m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
def status(root=ROOT):
    m=load_batch(root)
    full=m.plan(root,include_guide=True)
    assert len(full['members'])==24 and full['total_required']==216
    core=full['members'][:6];guide=full['members'][6:]
    assert all(x.get('source_lock') for x in core),'CORE6_SOURCE_LOCK_REGRESSION'
    cutout_locked=sum(x['status'] in ('INDEPENDENT_CUTOUT_SHA_LOCKED_MASK_SPEC_OPEN','LEGACY_REGRESSION_SOURCE_READY_DO_NOT_PRODUCE') for x in guide)
    art_source_ready=sum(x.get('source_lock') is not None for x in guide)
    blocked=[{'visual_id':x['visual_id'],'code':x['code'],'status':x['status']} for x in guide if x.get('source_lock') is None]
    return {'schema':'TAKY_VISUAL_ID_24_SOURCE_READINESS_V1',
      'core6_source_lock_ready':6,'core6_art_slots':54,
      'expansion_group_identity_ready':18,
      'expansion_independent_cutout_sha_locked':cutout_locked,
      'expansion_cutout_plus_mask_source_lock_ready':art_source_ready,
      'source_lock_ready_total':6+art_source_ready,
      'legacy_final_art_slots_total':216,'verified_final_art_files':0,
      'legacy_full24_source_ready':art_source_ready==18,
      'full24_art_batch_armed':False,
      'production_authority':False,
      'replacement_authority':'onboarding/crew-composable-asset-manifest.v1.json',
      'next_gate':'VALIDATE_COMPOSABLE_7_GROUP_MANIFEST' if art_source_ready==18 else 'CREATE_AND_REGISTER_INDEPENDENT_CUTOUT_SHA_THEN_MASK_SPEC_SHA_FOR_SOURCE_PROVENANCE',
      'blocked_expansion':blocked,
      'root_activation':False,'main_merge':False,'netlify':False}
def cli():
    p=argparse.ArgumentParser()
    p.add_argument('--require-full24',action='store_true')
    p.add_argument('--out')
    a=p.parse_args();result=status(ROOT)
    if a.require_full24:
        raise SystemExit('LEGACY_FULL24_PRODUCTION_DISABLED_USE_COMPOSABLE_MANIFEST:'+str(result['source_lock_ready_total'])+'/24')
    payload=json.dumps(result,ensure_ascii=False,indent=2)+'\n'
    if a.out:
        dest=pathlib.Path(a.out).resolve()
        assert dest.is_relative_to((ROOT/'qa').resolve()),'READINESS_REPORT_MUST_BE_QA_ONLY'
        dest.parent.mkdir(parents=True,exist_ok=True);dest.write_text(payload,encoding='utf8')
    print(payload)
if __name__=='__main__':cli()
