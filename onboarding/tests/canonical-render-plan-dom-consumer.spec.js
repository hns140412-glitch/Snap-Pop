const {test,expect}=require('@playwright/test');
const BASE=process.env.SNAP_TEST_BASE_URL||'http://127.0.0.1:4173';

test('canonical render-plan is the only legacy presenter input',async({page})=>{
  test.setTimeout(30000);
  await page.goto(BASE+'/onboarding/');
  await page.evaluate(()=>localStorage.clear());
  await page.reload();

  const seeded=await page.evaluate(async()=>{
    const crew=globalThis.TakyExplorerCrewBrowserHost;
    const host=crew.create({app_id:'DOM_TEST',storage:localStorage});
    const id='lori';
    host.unlockStoryGate({
      character_id:id,story_gate_id:'DOM_CONSUMER_TEST',
      evidence_ref:'playwright:canonical-render-plan-dom-consumer',
      at:'2026-09-30T14:00:00.000Z'
    });
    await host.runtime.cycle({
      app_id:'DOM_TEST',scene_id:'FIRST_ENCOUNTER_SEQUENCE',
      character_pool:[...crew.ALL_CREW],active_crew:[id],current_main_character_id:id,
      interaction_result:{relation_event:{character_id:id,type:'FIRST_MET',at:'2026-09-30T14:00:01.000Z'}}
    });
    await host.runtime.cycle({
      app_id:'DOM_TEST',scene_id:'SHARED_ACTIVITY',
      character_pool:[...crew.ALL_CREW],active_crew:[id],current_main_character_id:id,
      companion_gate:{affinity_requirement_met:true},
      interaction_result:{relation_event:{character_id:id,type:'SHARED_ACTIVITY',event_id:'dom_consumer_shared_lori',at:'2026-09-30T14:00:02.000Z'}}
    });
    await host.runtime.cycle({
      app_id:'DOM_TEST',scene_id:'COMPANION_SELECTION',
      character_pool:[...crew.ALL_CREW],active_crew:[id],current_main_character_id:id,
      interaction_result:{relation_event:{character_id:id,type:'MAIN_SELECTED',at:'2026-09-30T14:00:03.000Z'}}
    });

    const ledger=globalThis.CompanionCrewState.firstMeeting(
      globalThis.CompanionCrewState.initial(),'2026-09-30T14:00:04.000Z'
    );
    localStorage.setItem('expedition_ui_draft',JSON.stringify({
      step:10,encounterIndex:5,crew:[],primaryCompanionId:'',selectionPhase:'crew',
      crewLedger:ledger,name:'테스트아이',color:'#a46d59',items:['map'],
      travel:'cloud',island:'테스트섬',camp:'테스트캠프',tab:'오늘',
      photoSourceId:'',photoSha256:''
    }));
    return host.snapshot();
  });
  expect(seeded.relation.main_character_id).toBe('lori');

  await page.reload();
  await expect(page.locator('#app')).toHaveAttribute('data-step','10');
  await expect(page.locator('.home-crew-line')).toBeVisible();

  const before=await page.evaluate(()=>{
    const h=globalThis.TakyExplorerCrewBrowserHost.create({app_id:'DOM_TEST_VERIFY',storage:localStorage});
    const s=h.snapshot();
    return {
      main:s.relation.main_character_id,
      affinity:s.relation.members.lori.affinity,
      relation:s.relation.members.lori.relation_state,
      memoryCount:Object.keys(s.memory.memories||{}).length,
      presenter:{
        version:globalThis.CompanionCrewVisualPresenter.version,
        behaviorOwner:globalThis.CompanionCrewVisualPresenter.behaviorOwner,
        assetResolver:globalThis.CompanionCrewVisualPresenter.assetResolver
      }
    };
  });
  expect(before.presenter).toEqual({
    version:'CANONICAL_RENDER_PLAN_COMPATIBILITY_CONSUMER_V2',
    behaviorOwner:false,assetResolver:false
  });

  await page.locator('.home-crew-line').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('#app')).toHaveAttribute('data-explorer-crew-render-plan','STATIC_APPROVED_COMPAT');
  await expect(page.locator('#app')).toHaveAttribute('data-explorer-crew-render-character','lori');
  await expect(page.locator('.crew-radio-cover')).toHaveAttribute('data-visual-id','lori');
  await expect(page.locator('[data-approved-crew-art]')).toHaveAttribute('data-art-status','CANONICAL_STATIC_RENDER_PLAN');
  await expect(page.locator('[data-approved-crew-art] img')).toHaveAttribute('src','characters/ui_cutouts/lori.png');
  await expect.poll(()=>page.locator('[data-approved-crew-art] img').evaluate(img=>img.complete&&img.naturalWidth>0),{timeout:10000}).toBe(true);

  const after=await page.evaluate(()=>{
    const h=globalThis.TakyExplorerCrewBrowserHost.create({app_id:'DOM_TEST_VERIFY',storage:localStorage});
    const s=h.snapshot();
    return {
      main:s.relation.main_character_id,
      affinity:s.relation.members.lori.affinity,
      relation:s.relation.members.lori.relation_state,
      memoryCount:Object.keys(s.memory.memories||{}).length
    };
  });
  expect(after).toEqual({
    main:before.main,affinity:before.affinity,relation:before.relation,memoryCount:before.memoryCount
  });
});
