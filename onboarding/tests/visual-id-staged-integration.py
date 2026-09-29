#!/usr/bin/env python3
"""Temporary, wholly synthetic 7th Visual ID E2E fixture, then 20/21 capacity checks.

NEVER check these fixture pictures into the art folder or claim real user approval.
The six approved Core6 source originals and production registry are read-only.
"""
import hashlib,importlib.util,json,pathlib,shutil,tempfile
from PIL import Image,ImageDraw

HERE=pathlib.Path(__file__).resolve().parents[1]
ORIGINAL_IDS=('dubi','lori','ink','nova','take','zero')
W,H=1122,1402
def load(path,name):
    spec=importlib.util.spec_from_file_location(name,path)
    mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod);return mod
batch=load(HERE/'tools/visual-id-batch.py','qa_visual_id_batch')
exposure=load(HERE/'tools/visual-id-occlusion-qa.py','qa_source_exposure')
underpaint=load(HERE/'tools/visual-id-partial-underpaint-qa.py','qa_partial_underpaint')
def sha(p):return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
def denied(fn,needle):
    try:fn()
    except AssertionError as e:
        assert needle in str(e),(needle,str(e));return
    raise AssertionError('FORBIDDEN_CASE_ACCEPTED:'+needle)
def fixture(root,sid,i,staged,has_spec=True):
    # These geometric CI-only figures are intentionally NOT product illustration or
    # proxies for any of the missing 14 real characters. Each owns its own source/spec.
    image=Image.new('RGBA',(W,H),(0,0,0,0));d=ImageDraw.Draw(image)
    prop=(308+i*9,653+i,490+i*9,818+i)
    gear=(610-i*5,290+i*2,792-i*5,444+i*2)
    d.rectangle((180,150,955,1215),fill=(65+i*7%180,105+i*11%130,110+i*3%140,255))
    d.rectangle(prop,fill=(198+i*3%50,151+i*5%60,73+i*2%80,255))
    d.rectangle(gear,fill=(69+i*4%100,152+i*3%100,210-i*2%75,255))
    path=root/'characters/ui_cutouts'/f'{sid}.png'
    image.save(path,optimize=True)
    cutsha=sha(path)
    manifest['characters/ui_cutouts/'+sid+'.png']=cutsha
    if staged:
        src=root/'characters/originals'/f'{sid}_source.png'
        shutil.copyfile(path,src)
        source_sha=sha(src)
        manifest['characters/originals/'+sid+'_source.png']=source_sha
        approval={'id':sid,'stage':'STAGED_SOURCE_LOCKED',
            'visualApproval':{'status':'LOCKED',
              'reference':'CI_SYNTHETIC_FIXTURE_ONLY_NOT_USER_ART',
              'sourcePath':'characters/originals/'+sid+'_source.png',
              'sha256':source_sha}}
        (root/'visual-id-candidates'/f'{sid}.json').write_text(json.dumps(approval),encoding='utf8')
    if has_spec:
        def rect(r):
            x0,y0,x1,y1=r
            return [[x0,y0],[x1,y0],[x1,y1],[x0,y1]]
        spec={'visual_id':sid,'cutout_sha256':cutsha,'size':[W,H],
            'status':'SOURCE_PARTITION_PROTOTYPE_NOT_ANIMATION_READY',
            'independent_roles':{
                'PERSONALITY_PROP':{'identity':'OWN_CI_ONLY_GEOMETRIC_PROP','include':[rect(prop)],'exclude':[]},
                'THEME_GEAR':{'identity':'OWN_CI_ONLY_GEOMETRIC_GEAR','include':[rect(gear)],'exclude':[]}}}
        (root/'characters/layer_specs'/f'{sid}.json').write_text(json.dumps(spec),encoding='utf8')
    return path

with tempfile.TemporaryDirectory(prefix='visual_id_seventh_CI_ONLY_') as td:
    root=pathlib.Path(td)/'onboarding'
    for rel in ('characters/ui_cutouts','characters/originals','characters/layer_specs',
                'visual-id-candidates','tools'):
        (root/rel).mkdir(parents=True)
    shutil.copyfile(HERE/'tools/extract-source-layers.py',root/'tools/extract-source-layers.py')
    source_scope={'roster':{'original_ids':list(ORIGINAL_IDS)}}
    (root/'crew-scope-contract.json').write_text(json.dumps(source_scope),encoding='utf8')
    manifest={}
    def write_manifest():
        (root/'asset-and-release-gate.json').write_text(json.dumps({'required_assets':manifest}),encoding='utf8')
    for i,sid in enumerate(ORIGINAL_IDS):fixture(root,sid,i,False)
    write_manifest()
    baseline=batch.discover(root)
    assert tuple(baseline['ids'])==ORIGINAL_IDS and baseline['totalNamed']==6

    seventh='fixture_seventh'
    fixture(root,seventh,6,True,has_spec=False)
    write_manifest()
    intake=batch.discover(root)
    assert tuple(intake['ids'])==ORIGINAL_IDS and intake['totalNamed']==7
    assert intake['openStagedWithoutAuthoredMasks']==[seventh]
    assert intake['autoRuntimeActivation'] is False
    # The seventh source gets NO role pack until an independently authored
    # source-ID-locked per-member polygon spec is present.
    role_spec=root/'characters/layer_specs'/f'{seventh}.json'
    fixture(root,seventh,6,True,has_spec=True)
    write_manifest()
    valid=batch.discover(root)
    assert valid['ids']==ORIGINAL_IDS+(seventh,)
    assert valid['rows'][-1]['stage']=='STAGED_APPROVED_SOURCE_NOT_ACTIVE'
    assert valid['openStagedWithoutAuthoredMasks']==[]

    # Invalid user-source bytes, invalid exact mask ID and invalid cutout SHA
    # independently fail before ANY new derived asset can be accepted.
    original_file=root/'characters/originals'/f'{seventh}_source.png'
    original_bytes=original_file.read_bytes()
    original_file.write_bytes(original_bytes+b'CI_TAMPER')
    denied(lambda:batch.discover(root),'STAGED_ORIGINAL_MANIFEST_DRIFT')
    original_file.write_bytes(original_bytes)
    good=role_spec.read_bytes()
    changed=json.loads(good);changed['visual_id']='wrong_member'
    role_spec.write_text(json.dumps(changed),encoding='utf8')
    denied(lambda:batch.discover(root),'MASK_ID_OR_STATUS_MISMATCH')
    role_spec.write_bytes(good)
    changed=json.loads(good);changed['cutout_sha256']='0'*64
    role_spec.write_text(json.dumps(changed),encoding='utf8')
    denied(lambda:batch.discover(root),'APPROVED_CUTOUT_HASH_DRIFT')
    role_spec.write_bytes(good)

    produced=batch.run(root,root/'visual-prototypes')
    assert len(produced['produced'])==7 and len(set(produced['ids']))==7
    assert produced['activeRosterModified'] is False and produced['autoArtApproval'] is False
    from PIL import ImageChops
    for row in produced['produced']:
        sid=row['visual_id'];folder=root/'visual-prototypes'/sid
        pngs=tuple(folder/(role.lower()+'.png') for role in
                    ('IDENTITY_BODY','PERSONALITY_PROP','THEME_GEAR'))
        assert all(p.is_file() for p in pngs),'MISSING_7TH_ACTUAL_ROLE_PNG'
        assert len({sha(p) for p in pngs})==3,'DUPLICATED_ROLE_ASSET'
        assert row['technicalSourcePixelDraftOnly']
        real_original=Image.open(root/'characters/ui_cutouts'/f'{sid}.png').convert('RGBA')
        combined=Image.new('RGBA',(W,H))
        for role,png in zip(('IDENTITY_BODY','PERSONALITY_PROP','THEME_GEAR'),pngs):
            assert sha(png)==row['role_draft_sha256'][role]
            combined.alpha_composite(Image.open(png).convert('RGBA'))
        assert combined.tobytes()==real_original.tobytes(),'7TH_REAL_ROUNDTRIP_FAILED:'+sid

    exposure_result=exposure.run(root/'characters/ui_cutouts',root/'visual-prototypes',
                                 root/'characters/layer_specs',root/'occlusion-qa')
    assert len(exposure_result['members'])==7
    assert sum(len(x['moved_roles']) for x in exposure_result['members'].values())==14
    paint=underpaint.run(root/'characters/ui_cutouts',root/'visual-prototypes',
                         root/'occlusion-qa',root/'underpaint-qa')
    assert len(paint['members'])==7 and paint['independentReactionDrawingsCompleted']==0
    assert not paint['runtimeAssetApproval']
    for sid,item in paint['members'].items():
        assert item['inferred_opaque_pixel_count']>0
        assert item['static_original_byte_identical'] and not item['artistApproved']
        assert set(item['poses'])=={'PERSONALITY_PROP','THEME_GEAR'}
        assert all(x['remaining_after']==0 for x in item['poses'].values()),sid

    # Now test 20 actually source-validated IDs with individual CI-only source/
    # polygon metadata. This is DISCOVERY/CAPACITY, not 20 painted game sprites.
    for i in range(7,20):
        sid=f'fixture_{i+1:02d}'
        fixture(root,sid,i,True)
    write_manifest()
    full=batch.run(root,root/'unused_check_only',check_only=True)
    assert len(full['ids'])==20 and len(full['rows'])==20 and full['totalNamed']==20
    assert not full['autoRuntimeActivation'] and not full['autoArtApproval']
    assert all(r['stage']=='STAGED_APPROVED_SOURCE_NOT_ACTIVE' for r in full['rows'][6:])
    assert not (root/'unused_check_only').exists(),'CHECK_ONLY_MUTATED_ASSETS'
    fixture(root,'fixture_21',20,True,has_spec=False)
    write_manifest()
    denied(lambda:batch.discover(root),'BATCH_TECHNICAL_CAPACITY_EXCEEDED')
    assert not (HERE/'visual-id-candidates'/f'{seventh}.json').exists(),'CI_FIXTURE_LEAKED_INTO_REAL_ROSTER'
print(json.dumps({
  'result':'PASS_TEMP_FIXTURE_ONLY',
  'real_original_source_modified':False,
  'new_real_character_authored':False,
  'seven_person_end_to_end':'7 independent SHA-locked source-role triplets + 14 shifted exposure checks + 7 partial underpaint drafts',
  'staged_seventh_without_spec':'OPEN_NOT_PRODUCED',
  '20_real_source_spec_preflight':'PASS_TEST_FIXTURE_ONLY',
  '21st':'REJECTED',
  'source_tamper_mask_id_cutout_sha':'ALL_REJECTED',
  'runtime_roster_activation':False,'art_or_36_reaction_completion':False
},indent=2))
