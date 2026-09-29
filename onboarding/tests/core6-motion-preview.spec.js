'use strict';
const {test,expect}=require('@playwright/test');const ids=['dubi','lori','ink','nova','take','zero'];
for(const [width,height] of [[375,667],[390,844],[1024,768]]){
 test('real Core6 layer image and safe QA controls '+width+'x'+height,async({page})=>{
  test.setTimeout(120000);await page.setViewportSize({width,height});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const response=await page.goto('http://127.0.0.1:4197/',{waitUntil:'networkidle'});expect(response.status()).toBe(200);
  await expect(page.locator('#choose button')).toHaveCount(6);
  const used=new Set();
  for(const id of ids){
   await page.locator('#choose button[data-id="'+id+'"]').click();
   await expect(page.locator('#rig')).toHaveAttribute('data-visual-id',id);
   await expect(page.locator('#choose button[aria-pressed="true"]')).toHaveCount(1);
   for(const role of ['underpaint','body','prop','gear','source']){
    const image=page.locator('#rig img.'+role);
    await expect(image).toHaveAttribute('src',new RegExp('^assets/'+id+'/'));
    await expect.poll(()=>image.evaluate(img=>img.complete&&img.naturalWidth===1122&&img.naturalHeight===1402),{timeout:20000}).toBe(true);
   }
   used.add(await page.locator('#rig .source').getAttribute('src'));
   for(const state of ['prop','gear','rest']){
    await page.locator('button[data-motion="'+state+'"]').click();
    await expect(page.locator('#rig')).toHaveAttribute('data-motion',state);
    await expect(page.locator('button[data-motion="'+state+'"]')).toHaveAttribute('aria-pressed','true');
   }
   await page.locator('#sourceSwitch').click();await expect(page.locator('#rig')).toHaveAttribute('data-mode','source');
   await page.locator('#sourceSwitch').click();await expect(page.locator('#rig')).toHaveAttribute('data-mode','layers');
   await page.locator('button[data-motion="prop"]').click();
   await page.screenshot({path:'onboarding/qa-original-rig/render-evidence/'+id+'-'+width+'x'+height+'.png'});
  }
  expect(used.size).toBe(6);expect(errors).toEqual([]);
  const geo=await page.evaluate(()=>({viewport:innerWidth,scroll:document.documentElement.scrollWidth}));
  expect(geo.scroll).toBeLessThanOrEqual(geo.viewport+1);
 });
}
