const {test,expect}=require('@playwright/test');

test('Snap loads shared release/PWA contracts and keeps safe point product-owned',async({page})=>{
  await page.goto('http://127.0.0.1:4173/');
  await expect.poll(()=>page.evaluate(()=>!!globalThis.SnapPopReleaseDescriptor)).toBe(true);
  await expect.poll(()=>page.evaluate(()=>!!globalThis.SnapPopPwaUpdate)).toBe(true);
  const initial=await page.evaluate(()=>({
    app:globalThis.SnapPopReleaseDescriptor.app_id,
    safe:globalThis.SnapPopPwaSafePoint(),
    cap:globalThis.SnapPopPwaUpdate.capability
  }));
  expect(initial).toEqual({app:'snap-pop',safe:true,cap:'CAP-PWA-UPDATE-001'});
});

test('Snap active exploration blocks safe update and completion reopens it',async({page})=>{
  await page.goto('http://127.0.0.1:4173/');
  await page.locator('.landmark').first().click();
  await page.locator('#startBtn').click();
  await expect.poll(()=>page.evaluate(()=>globalThis.SnapPopPwaSafePoint())).toBe(false);
  await page.locator('#answer').fill('첫 생각');
  await page.locator('#nextBtn').click();
  await page.locator('#answer').fill('생각 넓히기');
  await page.locator('#nextBtn').click();
  await page.locator('#answer').fill('표현 완성');
  await page.locator('#nextBtn').click();
  await expect.poll(()=>page.evaluate(()=>globalThis.SnapPopPwaSafePoint())).toBe(true);
});

test('Snap service worker controls app without install-time forced activation',async({page})=>{
  await page.goto('http://127.0.0.1:4173/');
  await page.evaluate(()=>navigator.serviceWorker.ready);
  await page.reload();
  await expect.poll(()=>page.evaluate(()=>!!navigator.serviceWorker.controller)).toBe(true);
});
