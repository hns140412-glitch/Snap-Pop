const {test,expect}=require('@playwright/test');
test('Snap main consumes Explorer Crew V2 without replacing approved UI',async({page})=>{
  await page.goto('http://127.0.0.1:4173/',{waitUntil:'load'});
  const result=await page.evaluate(()=>{
    localStorage.clear();
    const c=globalThis.SnapExplorerCrewAuthorityConsumer;
    const canonical={version:'EXPLORER_CREW_STATE_STORE_V1',updated_at:'2026-10-01T00:00:00.000Z',state:{relation:{main_character_id:'lori',members:{lori:{character_id:'lori',relation_state:'MAIN_COMPANION'}}},memory:{}}};
    const raw=JSON.stringify(canonical);
    localStorage.setItem(c.CANONICAL_STATE_KEY,raw);
    c.consumeCanonicalStore(localStorage);
    c.syncDom({storage:localStorage,host:document.querySelector('#app'),radio:document.querySelector('#homeRadio')});
    const after=localStorage.getItem(c.CANONICAL_STATE_KEY);
    return {
      system:globalThis.TakyExplorerCrewSystemV2?.VERSION,
      consumer:c?.VERSION,
      main:c?.snapshot(localStorage)?.character_id,
      raw,after,
      runtime:document.querySelector('#app')?.dataset?.explorerCrewRuntime,
      owner:document.querySelector('#app')?.dataset?.explorerCrewRuntimeOwner,
      radioCharacter:document.querySelector('#homeRadio')?.dataset?.explorerCrewCharacter,
      radioLabel:document.querySelector('#homeRadio')?.getAttribute('aria-label'),
      cutoutCount:document.querySelectorAll('img[src*="characters/ui_cutouts"]').length
    };
  });
  expect(result.system).toBe('EXPLORER_CREW_SYSTEM_V2');
  expect(result.consumer).toBe('SNAP_EXPLORER_CREW_AUTHORITY_CONSUMER_V2');
  expect(result.main).toBe('lori');
  expect(result.runtime).toBe('CANONICAL_ONLY');
  expect(result.owner).toBe('false');
  expect(result.radioCharacter).toBe('lori');
  expect(result.radioLabel).toContain('주 동행 무전');
  expect(result.after).toBe(result.raw);
  expect(result.cutoutCount).toBe(0);
  await expect(page.locator('#map')).toHaveClass(/active/);
});
