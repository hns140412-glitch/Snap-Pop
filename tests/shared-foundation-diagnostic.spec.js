const {test,expect}=require('@playwright/test');

test('diagnose active Snap initialization before shared safe-point flow',async({page})=>{
  const errors=[];
  page.on('pageerror',e=>errors.push('pageerror:'+e.message));
  page.on('console',m=>{ if(m.type()==='error') errors.push('console:'+m.text()); });
  const response=await page.goto('http://127.0.0.1:4173/');
  await page.waitForTimeout(1500);
  const snapshot=await page.evaluate(()=>({
    title:document.title,
    readyState:document.readyState,
    landmarks:document.querySelectorAll('.landmark').length,
    selection:!!document.querySelector('#selection'),
    toast:document.querySelector('#toast')?.textContent||'',
    safePoint:typeof globalThis.SnapPopPwaSafePoint==='function'?globalThis.SnapPopPwaSafePoint():null,
    release:globalThis.SnapPopReleaseDescriptor?.release_id||null,
    bridge:!!globalThis.SnapPopBridge
  }));
  console.log('SNAP_INIT_DIAGNOSTIC',JSON.stringify({status:response?.status(),snapshot,errors}));
  expect(errors,'page initialization errors: '+errors.join(' | ')).toEqual([]);
  expect(snapshot.landmarks,'landmark buttons should be rendered after init').toBeGreaterThan(0);
});
