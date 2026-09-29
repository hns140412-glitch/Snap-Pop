const {test,expect}=require('@playwright/test');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
test.use({ignoreHTTPSErrors:true});
const base='https://127.0.0.1:4174/onboarding/';
test('real HTTPS secure-origin photo-source bytes persist through reload, then clear without upload',async({page})=>{
  test.setTimeout(60000);
  const outbound=[];const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{try{if(new URL(r.url()).hostname!=='127.0.0.1')outbound.push(r.url());}catch{}});
  await page.goto(base);
  const secure=await page.evaluate(()=>({secure:isSecureContext,crypto:!!globalThis.crypto?.subtle,idb:!!indexedDB,scheme:location.protocol}));
  expect(secure).toEqual({secure:true,crypto:true,idb:true,scheme:'https:'});
  await page.locator('.welcome-cta').click();
  await page.locator('button.approved-tap.cta').click();
  for(let i=0;i<5;i++)await page.locator('button.approved-tap.portrait').nth(i).click();
  await page.locator('button.approved-tap.cta').click();
  await page.locator('button.approved-tap.portrait').nth(1).click();
  await page.locator('button.approved-tap.cta').click();
  await expect(page.locator('#app')).toHaveAttribute('data-step','3');
  await page.locator('.mobile-profile input.field').fill('합성테스트');
  // A repository illustration is a non-personal technical JPEG fixture, never a real child's photo.
  // This exercise only proves secure-origin original-byte receipt, not avatar conversion.
  const fixture=fs.readFileSync(path.resolve(__dirname,'../characters/originals/dubi_source.jpeg'));
  const expected=crypto.createHash('sha256').update(fixture).digest('hex');
  await page.locator('#child-source-input').setInputFiles({name:'synthetic-test-fixture.jpg',mimeType:'image/jpeg',buffer:fixture});
  await expect(page.locator('.photo-status')).toContainText('등록했어요');
  const state=JSON.parse(await page.evaluate(()=>localStorage.getItem('expedition_ui_draft')));
  expect(state.photoSourceId).toBe('CHILD_VISUAL_SOURCE_SHA256_'+expected);
  expect(state.photoSha256).toBe(expected);
  const stored=await page.evaluate(async()=>{
    const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('expedition_child_visual_sources_v1',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
    try {
      const row=await new Promise((resolve,reject)=>{const r=db.transaction('visual_sources').objectStore('visual_sources').getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
      const bytes=await row[0].blob.arrayBuffer();
      const digest=await crypto.subtle.digest('SHA-256',bytes);
      return {count:row.length,hash:[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join(''),mime:row[0].mime,size:row[0].size};
    } finally{db.close();}
  });
  expect(stored).toEqual({count:1,hash:expected,mime:'image/jpeg',size:fixture.length});
  await page.reload();
  await expect(page.locator('#app')).toHaveAttribute('data-step','3');
  await expect(page.locator('.photo-state').first()).toContainText('사진 원본 확인됨');
  await expect(page.locator('.photo-frame img')).toBeVisible();
  expect(JSON.parse(await page.evaluate(()=>localStorage.getItem('expedition_ui_draft'))).photoSha256).toBe(expected);
  page.once('dialog',dialog=>dialog.accept());
  await page.locator('.photo-remove').click();
  await expect.poll(async()=>JSON.parse(await page.evaluate(()=>localStorage.getItem('expedition_ui_draft'))).photoSourceId).toBe('');
  await page.reload();
  await expect(page.locator('.photo-state').first()).toContainText('아직 사진을 넣지 않았어요');
  const count=await page.evaluate(async()=>{
    const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('expedition_child_visual_sources_v1',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
    try{return await new Promise((resolve,reject)=>{const r=db.transaction('visual_sources').objectStore('visual_sources').count();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
    finally{db.close();}
  });
  expect(count).toBe(0);expect(outbound).toEqual([]);expect(errors).toEqual([]);
});
