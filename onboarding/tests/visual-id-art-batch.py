#!/usr/bin/env python3
"""Regression: batch is source-locked and never treats copied art or QA previews as final."""
import hashlib, importlib.util, json, pathlib, shutil, tempfile
from PIL import Image
root=pathlib.Path(__file__).resolve().parents[1]
module_path=root/'tools/visual-id-art-batch.py'
sp=importlib.util.spec_from_file_location('visual_id_art_batch',module_path)
m=importlib.util.module_from_spec(sp);sp.loader.exec_module(m)
cfg=m.config(root);queue=m.plan(root)
assert len(queue['members'])==6 and queue['total_required']==54
assert [x['visual_id'] for x in queue['members']]==['dubi','lori','ink','nova','take','zero']
assert all(len(x['outputs'])==9 and x['verified_final_art_count']==0 for x in queue['members'])
assert all(x['restore_existing_prototypes'] and not x['release_approved'] for x in queue['members'])
assert m.plan(root,'dubi')['total_required']==9
try:m.plan(root,'imaginary')
except AssertionError as e:assert 'UNKNOWN_OR_UNAPPROVED' in str(e)
else:raise AssertionError('UNKNOWN_VISUAL_ID_ACCEPTED')
original_discover=m.discover
m.discover=lambda source_root:{**original_discover(source_root),'openStagedWithoutAuthoredMasks':['new_approved_source']}
blocked=m.plan(root,'new_approved_source')
assert blocked['members'][0]['status']=='BLOCKED_INDIVIDUAL_CUTOUT_OR_MASK_SPEC'
assert blocked['members'][0]['verified_final_art_count']==0
m.discover=original_discover
r=m.audit(root)
assert r['target']==54 and r['machine_verified_files']==0
assert all(x['status']=='NINE_REAL_ART_FILES_NOT_SUBMITTED' for x in r['members'])
assert r['artistic_human_approval']==r['screen_binding_qa']=='OPEN'
assert not r['root_activation'] and not r['netlify'] and not r['main_merge']
try:m.check(root,'characters/ui_cutouts/dubi.png','0'*64)
except AssertionError:pass
else:raise AssertionError('SOURCE_HASH_DRIFT_ACCEPTED')
# A deliberately forged all-nine manifest must not count copied baseline cutouts as independent art.
with tempfile.TemporaryDirectory() as directory:
    isolated=pathlib.Path(directory);member=queue['members'][0];proof=member['source_lock']
    source=root/proof['cutout'];dest=isolated/proof['cutout']
    dest.parent.mkdir(parents=True);shutil.copyfile(source,dest)
    fake={'schema':cfg['packageManifest']['schema'],'visual_id':'dubi',
          'source_original_sha256':proof['original_sha256'],
          'source_cutout_sha256':proof['cutout_sha256'],
          'source_mask_spec_sha256':proof['mask_spec_sha256'],
          'visual_approval_ref':proof['visual_approval_ref'],'assets':{}}
    for slot,rel in member['outputs'].items():
        output=isolated/rel;output.parent.mkdir(parents=True,exist_ok=True)
        pixels,size=m.canonical(Image.open(source))
        Image.frombytes('RGBA',size,pixels).save(output)
        fake['assets'][slot]={'path':rel,'sha256':hashlib.sha256(output.read_bytes()).hexdigest(),
            'source_sha256':proof['cutout_sha256'],'method':'EXTRACT_APPROVED_SOURCE',
            'fidelity_review_ref':'fixture-not-approved'}
    pkg=isolated/member['package_manifest']
    pkg.write_text(json.dumps(fake),encoding='utf8')
    try:m.audit_one(isolated,member,cfg)
    except AssertionError as e:assert 'DUPLICATE_OR_REPACKAGED_ASSET' in str(e)
    else:raise AssertionError('FAKE_COPIED_NINE_ART_FILES_ACCEPTED')
rows=[{'visual_id':'dubi','verified_files':9,'pixel_sha256':['a']},
      {'visual_id':'lori','verified_files':9,'pixel_sha256':['a']}]
m.reject_cross_visual_duplicates(rows)
assert all(r['verified_files']==0 and r['status']=='FAIL_CLOSED_CROSS_VISUAL_ID_DUPLICATE' for r in rows)
print('BATCH_ART_CONTRACT_PASS: six source-locked IDs, 54 mandatory unique art slots, absent art stays OPEN, fake copied source rejected, no release activation')
