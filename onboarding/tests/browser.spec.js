const {test,expect}=require('@playwright/test');
const sizes=[[375,667],[390,844],[430,932],[1024,768]];
const expectedScreens=16;
const BASE=process.env.SNAP_TEST_BASE_URL||'http://127.0.0.1:4173';
const encounterIds=['dubi','lori','ink','nova','take','zero'];

for(const [width,height] of sizes){
test('canonical sequential onboarding, assets, restore and rename '+width+'x'+height,async({page})=>{
  test.setTimeout(60000);
  await page.setViewportSize({width,height});
  const failures=[];page.on('pageerror',e=>failures.push(e.message));
  const captured=new Set();
  async function capture(id){
    await page.screenshot({path:'onboarding/render-evidence/'+id+'-'+width+'x'+height+'.png'});
    captured.add(id);
  }

  await page.goto(BASE+'/onboarding/');
  await page.evaluate(()=>localStorage.clear());
  await page.reload();
  await expect(page.locator('#app')).toHaveAttribute('data-step','0');
  await expect(page.locator('.welcome-cta')).toBeVisible();
  await capture('00-welcome');

  expect(await page.evaluate(()=>!!globalThis.CompanionCrewState)).toBe(true);
  const visualGate=await page.evaluate(()=>({
    ids:globalThis.CompanionVisualAssets.memberIds,
    states:globalThis.CompanionVisualAssets.memberIds.map(id=>globalThis.CompanionVisualAssets.renderPlan(id))
  }));
  expect(visualGate.ids).toEqual(encounterIds);
  expect(visualGate.states.every(x=>x.staticPreviewReady&&!x.actionReady&&!x.releaseReady)).toBe(true);

  await page.locator('.welcome-cta').click();
  for(const id of encounterIds){
    await expect(page.locator('#app')).toHaveAttribute('data-step','1');
    await expect(page.locator('.approved-stage')).toHaveAttribute('data-selection-phase','encounter');
    const art=page.locator('.approved-stage img');
    await expect(art).toHaveAttribute('src','characters/ui_cutouts/'+id+'.png');
    await expect.poll(()=>art.evaluate(img=>img.complete&&img.naturalWidth>0),{timeout:10000}).toBe(true);
    await capture('01-encounter-'+id);
    await page.locator('button.approved-tap.cta').click();
  }

  await expect(page.locator('#app')).toHaveAttribute('data-step','3');
  const first=JSON.parse(await page.evaluate(()=>localStorage.getItem('expedition_ui_draft')));
  expect(Object.values(first.crewLedger.members).every(x=>!!x.firstMetAt)).toBe(true);
  expect(first.primaryCompanionId).toBe('');

  const relationAfterEncounter=await page.evaluate(()=>{
    const h=globalThis.TakyExplorerCrewBrowserHost.create({app_id:'BROWSER_TEST',storage:localStorage});
    const s=h.snapshot();
    return {
      main:s.relation.main_character_id,
      states:['dubi','lori','ink','nova','take','zero'].map(id=>s.relation.members[id].relation_state)
    };
  });
  expect(relationAfterEncounter.main).toBe(null);
  expect(relationAfterEncounter.states.every(x=>x==='KNOWN')).toBe(true);

  await capture('03-profile');
  await page.locator('.mobile-profile input.field').fill('테스트아이');
  await page.locator('#profileNext').click();
  await expect(page.locator('#app')).toHaveAttribute('data-step','4');

  await page.locator('.object[data-item="map"]').click();
  await page.locator('#bag').click();
  await capture('04-packing');
  await page.locator('.mobile-packing .mobile-cta').click();
  await expect(page.locator('#app')).toHaveAttribute('data-step','5');
  await capture('05-voyage-choice');

  await page.locator('.world-option').first().click();
  await expect(page.locator('#app')).toHaveAttribute('data-step','6');
  await capture('06-island-arrival');
  await page.locator('.world-cta').click();

  await page.locator('#islandName').fill('테스트섬');
  await capture('07-island-naming');
  await page.locator('#islandNext').click();
  await expect(page.locator('#app')).toHaveAttribute('data-step','8');
  await capture('08-camp-discovery');

  await page.locator('.world-cta').click();
  await page.locator('#campName').fill('테스트캠프');
  await capture('09-camp-naming');
  await page.locator('#campNext').click();
  await expect(page.locator('#app')).toHaveAttribute('data-step','10');
  await expect(page.locator('.home-drawer')).toContainText('오늘의 동행 아직 정하지 않았어요');
  await expect(page.locator('.home-crew-line')).toHaveCount(0);
  await capture('10-home-today');

  await page.locator('.home-navigation button').filter({hasText:'탐험대'}).click();
  await expect(page.locator('.crew-primary')).toContainText('아직 정하지 않았어요');
  const lori=page.locator('.crewlist>div').filter({hasText:'로리'}).first();
  await lori.getByRole('button',{name:'이름 바꾸기'}).click();
  await page.locator('#rename-lori').fill('별로리');
  await lori.getByRole('button',{name:'저장'}).click();
  await expect(page.locator('.crewlist')).toContainText('별로리');

  const geometry=await page.evaluate(()=>{
    const root=document.querySelector('main[data-step="10"]');
    const content=root.querySelector('.content'),drawer=root.querySelector('.home-drawer'),nav=root.querySelector('.home-navigation');
    const r=drawer.getBoundingClientRect();
    return {
      contentWidth:content.getBoundingClientRect().width,
      drawerWidth:r.width,drawerLeft:r.left,drawerRight:r.right,
      navWidth:nav.getBoundingClientRect().width,
      overflow:document.documentElement.scrollWidth-innerWidth
    };
  });
  expect(geometry.overflow).toBeLessThanOrEqual(1);
  expect(geometry.drawerLeft).toBeGreaterThanOrEqual(-1);
  expect(geometry.drawerRight).toBeLessThanOrEqual(width+1);
  if(width>=700){
    expect(geometry.contentWidth).toBeGreaterThan(700);
    expect(geometry.drawerWidth).toBeGreaterThanOrEqual(340);
    expect(geometry.navWidth).toBeGreaterThanOrEqual(360);
  }else{
    expect(geometry.drawerWidth).toBeGreaterThanOrEqual(width-3);
  }

  const actionView=await page.evaluate(()=>{
    const drawer=document.querySelector('.home-drawer'),button=drawer.querySelector('button.sub'),nav=document.querySelector('.home-navigation');
    const r=drawer.getBoundingClientRect(),b=button.getBoundingClientRect(),n=nav.getBoundingClientRect();
    return {
      overflow:drawer.scrollHeight-drawer.clientHeight,
      actionInside:b.top>=r.top&&b.bottom<=r.bottom+1,
      actionAboveNav:b.bottom<n.top+1
    };
  });
  expect(actionView.overflow).toBeLessThanOrEqual(1);
  expect(actionView.actionInside).toBe(true);
  expect(actionView.actionAboveNav).toBe(true);
  await capture('10-home-crew');
  expect(captured.size).toBe(expectedScreens);

  await page.reload();
  await expect(page.locator('#app')).toHaveAttribute('data-step','10');
  const persisted=JSON.parse(await page.evaluate(()=>localStorage.getItem('expedition_ui_draft')));
  expect(persisted.crewLedger.members.lori.id).toBe('lori');
  expect(persisted.crewLedger.members.lori.firstName).toBe('로리');
  expect(persisted.crewLedger.members.lori.currentName).toBe('별로리');
  expect(persisted.crewLedger.members.lori.nameHistory).toHaveLength(1);
  expect(persisted.crewLedger.primaryHistory).toHaveLength(0);
  expect(persisted.primaryCompanionId).toBe('');
  expect(failures).toEqual([]);
  expect(page.url()).toContain('/onboarding/');
});
}
