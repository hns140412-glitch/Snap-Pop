#!/usr/bin/env python3
"""Batch scaler preflights 6 inherited IDs; 20 technical capacity is not a roster release."""
import importlib.util,pathlib
root=pathlib.Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('visual_id_batch',root/'tools/visual-id-batch.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
assert m.validate_ids(['member_'+str(i) for i in range(20)])==tuple('member_'+str(i) for i in range(20))
def denied(fn):
    try:fn();raise AssertionError('UNAUTHORIZED_BATCH_WAS_ACCEPTED')
    except AssertionError as e:assert str(e)!='UNAUTHORIZED_BATCH_WAS_ACCEPTED'
denied(lambda:m.validate_ids(['member_'+str(i) for i in range(21)]))
denied(lambda:m.validate_ids(['a_valid','a_valid']))
denied(lambda:m.validate_ids(['../traversal']))
denied(lambda:m.validate_ids(['UPPERCASE']))
result=m.discover(root)
assert result['existingOriginalIds']==('dubi','lori','ink','nova','take','zero')
assert result['ids'][:6]==result['existingOriginalIds']
assert result['autoArtApproval'] is False and result['autoRuntimeActivation'] is False and result['activeRosterModified'] is False
assert result['capacityIsTechnicalNotRosterAuthorization']
for row in result['rows']:assert row['stage'] in ('ORIGINAL_CORE6','STAGED_APPROVED_SOURCE_NOT_ACTIVE')
print('BATCH_PREFLIGHT_PASS: existing original 6 preserved, 20 technical processing slots validated, 21/duplicate/traversal/unknown source rejected; zero invented new art or roster activation')
