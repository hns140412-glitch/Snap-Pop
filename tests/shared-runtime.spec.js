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
  await expect(page.locator('#question')).toHaveText('그 생각 옆에는 뭐가 더 있을까?');
  await page.locator('#answer').fill('생각 넓히기');
  await page.locator('#nextBtn').click();
  await expect(page.locator('#question')).toHaveText('이제 네 문장으로 마무리해볼까?');
  await expect(page.locator('#nextBtn')).toHaveText('탐험 완료');
  await page.locator('#answer').fill('표현 완성');
  await page.locator('#nextBtn').click();
  await expect(page.locator('#growth')).toHaveClass(/active/);
  const finalState=await page.evaluate(async()=>{
    const active=await new Promise((resolve,reject)=>{
      const q=indexedDB.open('snap_pop_rev10',1);
      q.onsuccess=()=>{
        const db=q.result;
        const r=db.transaction('state').objectStore('state').get('active');
        r.onsuccess=()=>resolve(r.result??null);
        r.onerror=()=>reject(r.error);
      };
      q.onerror=()=>reject(q.error);
    });
    return {active,safe:globalThis.SnapPopPwaSafePoint(),href:location.href};
  });
  expect(finalState).toEqual({active:null,safe:true,href:'http://127.0.0.1:4173/'});
});

test('Snap service worker controls app without install-time forced activation',async({page})=>{
  await page.goto('http://127.0.0.1:4173/');
  await page.evaluate(()=>navigator.serviceWorker.ready);
  await page.reload();
  await expect.poll(()=>page.evaluate(()=>!!navigator.serviceWorker.controller)).toBe(true);
});
