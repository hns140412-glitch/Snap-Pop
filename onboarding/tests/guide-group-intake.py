#!/usr/bin/env python3
"""GUIDE 07..24 lineage and full24 work-order integrity without fictional art."""
import copy,importlib.util,json,pathlib
root=pathlib.Path(__file__).resolve().parents[1]
def module(name,path):
    spec=importlib.util.spec_from_file_location(name,path)
    value=importlib.util.module_from_spec(spec);spec.loader.exec_module(value)
    return value
g=module('group_intake',root/'tools/guide-group-intake.py')
b=module('art_batch',root/'tools/visual-id-art-batch.py')
evidence=g.check(root)
assert evidence['mapped_members']==18 and evidence['individual_reference_views_ready']==18 and not evidence['group_bytes_verified_this_run']
full=b.plan(root,include_guide=True)
assert full['scope']=='FULL_24_APPROVED_GROUP_INTAKE'
legacy=json.loads((root/'visual-id-batch-production.v1.json').read_text(encoding='utf8'))
assert legacy['productionAuthority'] is False and legacy['replacementAuthority']=='onboarding/crew-composable-asset-manifest.v1.json'
assert len(full['members'])==24 and full['total_required']==216
assert [x['visual_id'] for x in full['members'][:6]]==['dubi','lori','ink','nova','take','zero']
additional=full['members'][6:]
assert [x['visual_id'] for x in additional]==[f'guide-{n:02d}' for n in range(7,25)]
assert all(x['status']=='AWAITING_INDEPENDENT_CUTOUT_SHA' and
 x['source_lock'] is None and x['verified_final_art_count']==0 and
 x['source_reference_view']['not_individual_original'] and x['source_reference_view']['not_final_art'] and
 len(x['source_reference_view']['sha256'])==64 for x in additional)
assert additional[-1]['code']=='VIVI' and additional[-1]['numeric_visual_id']==24
registry=json.loads((root/'guide-07-24-independent-source-registry.v1.json').read_text(encoding='utf8'))
assert registry['schema']=='TAKY_GUIDE_07_24_INDEPENDENT_SOURCE_REGISTRY_V1'
assert len(registry['members'])==18
assert all(x['cutout_sha256'] is None and x['mask_spec_sha256'] is None and x['approval_ref'] is None for x in registry['members'])
assert registry['members'][-1]['code']=='VIVI'
stage=json.loads((root/'guide-07-24-production-stage-gate.v1.json').read_text(encoding='utf8'))
assert stage['invariant']['id24']['canonical_code']=='VIVI'
assert stage['invariant']['id24']['derived_display_code']=='VIVI'
assert stage['invariant']['id24']['forbid_derived_code']==['NOVA']
assert stage['execution_policy']['next_stage']==3
cohort=stage['execution_policy']['mixed_core6_cohort_style_gate']
assert cohort['required'] is True and cohort['fail_closed_on_obvious_style_drift'] is True
assert cohort['anchors']==['dubi','lori','ink','nova','take','zero']
flags=stage['execution_policy']['known_visual_review_flags']
assert 'guide-21_TESS' in flags and 'LEFT_HAND' in flags['guide-21_TESS']
assert 'guide-23_ZEKE' in flags and 'LOWER_LEG' in flags['guide-23_ZEKE']
assert all(x['numeric_visual_id']>=19 for x in additional[-6:])
assert len({x['source_group_lock']['sha256'] for x in additional})==3
assert all(x['source_group_lock']['scope']=='GROUP_NOT_PER_MEMBER' for x in additional)
audited=b.audit(root,include_guide=True)
assert audited['target']==216 and audited['machine_verified_files']==0
assert all(x['verified_files']==0 and not x['release_ready'] for x in audited['members'])
assert all(x['status']=='AWAITING_INDEPENDENT_CUTOUT_SHA' for x in audited['members'][6:])
assert len(b.plan(root,'guide-19',include_guide=True)['members'])==1
try:b.plan(root,'imaginary',include_guide=True)
except AssertionError as e:assert 'UNKNOWN_OR_UNAPPROVED' in str(e)
else:raise AssertionError('UNAPPROVED_ID_ALLOWED')
original=g.load
def tampered(root):
    data=copy.deepcopy(original(root))
    data['members'][-1]['code']='NOVA'
    return data
g.load=tampered
try:g.check(root)
except AssertionError:pass
else:raise AssertionError('LEGACY_24_NOVA_NAME_ACCEPTED')
g.load=original
print('GUIDE_GROUP_FULL24_PASS: immutable group/source lineage preserved for 24-member regression coverage; legacy 216 slots have no production authority; 19..24 special + VIVI preserved; no individual art or activation')
