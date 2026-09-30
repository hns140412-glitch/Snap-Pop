#!/usr/bin/env python3
"""GUIDE 07..24 lineage and full24 work-order integrity without fictional art."""
import copy,importlib.util,pathlib
root=pathlib.Path(__file__).resolve().parents[1]
def module(name,path):
    spec=importlib.util.spec_from_file_location(name,path)
    value=importlib.util.module_from_spec(spec);spec.loader.exec_module(value)
    return value
g=module('group_intake',root/'tools/guide-group-intake.py')
b=module('art_batch',root/'tools/visual-id-art-batch.py')
evidence=g.check(root)
assert evidence['mapped_members']==18 and not evidence['group_bytes_verified_this_run']
full=b.plan(root,include_guide=True)
assert full['scope']=='FULL_24_APPROVED_GROUP_INTAKE'
assert len(full['members'])==24 and full['total_required']==216
assert [x['visual_id'] for x in full['members'][:6]]==['dubi','lori','ink','nova','take','zero']
additional=full['members'][6:]
assert [x['visual_id'] for x in additional]==[f'guide-{n:02d}' for n in range(7,25)]
assert all(x['status']=='GROUP_SOURCE_LOCKED_PER_MEMBER_CUTOUT_MASK_OPEN' and
 x['source_lock'] is None and x['verified_final_art_count']==0 for x in additional)
assert additional[-1]['code']=='VIVI' and additional[-1]['numeric_visual_id']==24
assert all(x['numeric_visual_id']>=19 for x in additional[-6:])
assert len({x['source_group_lock']['sha256'] for x in additional})==3
assert all(x['source_group_lock']['scope']=='GROUP_NOT_PER_MEMBER' for x in additional)
audited=b.audit(root,include_guide=True)
assert audited['target']==216 and audited['machine_verified_files']==0
assert all(x['verified_files']==0 and not x['release_ready'] for x in audited['members'])
assert all(x['status']=='GROUP_SOURCE_LOCKED_PER_MEMBER_CUTOUT_MASK_OPEN' for x in audited['members'][6:])
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
print('GUIDE_GROUP_FULL24_PASS: 3 immutable group SHA records, 18 unique source-bound IDs, 24 plan members / 216 slots, 19..24 special + VIVI, no individual art or activation')
