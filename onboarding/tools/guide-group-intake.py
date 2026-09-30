#!/usr/bin/env python3
"""Stage approved GUIDE 07..24 GROUP-source evidence; no invented per-ID art."""
import argparse,hashlib,json,pathlib,zipfile
ROOT=pathlib.Path(__file__).resolve().parents[1]
EXPECTED={'GUIDE-07-12':'ed84df450b7b3fafce56534fd304d2b02fa628d8c83f1d7635aeadbbd93a72ec',
'GUIDE-13-18':'2f19b01b366d2a59d5b8e2494dad6edaa32428882dfbcd5daed6c61a7a8fed35',
'GUIDE-19-24':'ed485ede7b0653b0a9cd70b53a243240aad66429b79eb52ad44d5bdc8181ece1'}
CODES=('SOLA','BELO','MOCA','NIA','KIRO','PEACH','MINT','TOTO','RUNE','POPO',
'MARU','BORI','RIN','LUMI','TESS','SEL','ZEKE','VIVI')
GROUPS=('GUIDE-07-12','GUIDE-13-18','GUIDE-19-24')
CORE=('dubi','lori','ink','nova','take','zero')
def load(root=ROOT):
    return json.loads((root/'guide-07-24-group-intake.v1.json').read_text(encoding='utf8'))
def check(root=ROOT,zip_path=None):
    data=load(root)
    assert data['schema']=='TAKY_SNAP_GUIDE_07_24_APPROVED_GROUP_INTAKE_V1'
    assert data['hard_gates']['core6_ids_immutable']==list(CORE)
    assert data['hard_gates']['special_human_numeric_ids']==list(range(19,25))
    assert data['hard_gates']['numeric_24_code']=='VIVI'
    assert data['scope']=='DRAFT_PR_ONLY_NOT_CENTRAL_REGISTRY_NOT_RUNTIME_ACTIVE'
    assert len(data['source_groups'])==3 and len(data['members'])==18
    groups={x['group_id']:x for x in data['source_groups']}
    assert set(groups)==set(GROUPS)
    for key in GROUPS:
        g=groups[key]
        assert g['sha256']==EXPECTED[key] and g['source_scope']=='GROUP_IMAGE_EXACT_BYTES_NOT_INDIVIDUAL_ART'
        assert isinstance(g['byte_size'],int) and g['byte_size']>1000
    for i,m in enumerate(data['members']):
        number=i+7
        assert m['visual_id']==number and m['pipeline_key']==f'guide-{number:02d}'
        assert m['code']==CODES[i] and m['source_group_id']==GROUPS[i//6]
        assert m['source_group_sha256']==groups[m['source_group_id']]['sha256']
        assert m['panel_position_left_to_right']==i%6+1
        assert m['stage']=='GROUP_SOURCE_LOCKED_INDIVIDUAL_SOURCE_PREPARATION_OPEN'
        assert all(m[k] is None for k in ('original_individual_sha256','approved_individual_cutout_sha256',
                    'mask_spec_sha256','independent_art_sha256'))
        assert not m['active_runtime'] and not m['release_art']
    assert groups['GUIDE-19-24']['kind']=='special_human'
    assert groups['GUIDE-07-12']['kind']==groups['GUIDE-13-18']['kind']=='animal'
    assert data['total_target']=={'core6':6,'expansion':18,'total':24,
                  'per_member_independent_final_art':9,'total_final_art_slots':216}
    proof_path=root/'qa/guide-source-package-proof.v1.json'
    receipt=json.loads(proof_path.read_text(encoding='utf8'))
    assert receipt['schema']=='TAKY_GUIDE_SOURCE_BYTE_VERIFICATION_2026_09_30_V1'
    assert receipt['package_zip_sha256']=='b998a8450fe386c6aa07860756cb5e74f1831b4cbe848c6b80af21863b7c6f4c'
    assert receipt['standalone_manifest_sha256']=='1b67ae1666a0440fe1c3a036ca0f22ef57900845e9fef388c487026755113c73'
    assert receipt['zip_internal_manifest_byte_exact'] is True
    assert {x['id']:x['sha256'] for x in receipt['group_records']}==EXPECTED
    assert receipt['per_member_original_sha_verified']==receipt['independently_authored_art_approved']==0
    assert receipt['verified_in']=='THIS_CHAT_CONTAINER_AGAINST_LIBRARY_RAW_PACKAGE_NOT_IN_GITHUB_ACTIONS'
    binary_verified=False
    if zip_path:
        with zipfile.ZipFile(zip_path) as source_zip:
            for g in groups.values():
                contents=source_zip.read(g['library_zip_entry'])
                assert len(contents)==g['byte_size'],'GROUP_BYTE_SIZE_DRIFT'
                assert hashlib.sha256(contents).hexdigest()==g['sha256'],'APPROVED_GROUP_SHA_DRIFT'
        binary_verified=True
    return {'group_manifest_valid':True,'group_bytes_verified_this_run':binary_verified,
          'approved_group_ids':list(GROUPS),'mapped_members':18,'per_member_source_ready':0,
          'individual_final_art_sha_ready':0,'core6_unchanged':True,'active_roster_changed':False,
          'root_activation':False,'main_merge':False,'netlify':False}
if __name__=='__main__':
    cli=argparse.ArgumentParser()
    cli.add_argument('--zip',dest='zip_path')
    a=cli.parse_args()
    print(json.dumps(check(zip_path=a.zip_path),indent=2))
