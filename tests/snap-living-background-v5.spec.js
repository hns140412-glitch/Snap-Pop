const {test,expect}=require('@playwright/test');
test('Snap V5 living background binds approved master and respects motion-off',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('http://127.0.0.1:4173/');
  await expect(page.locator('img.sceneStatic')).toHaveAttribute('src','assets/world/snap_pop_beach_asset.png');
  await expect(page.locator('#snapLivingMotion source')).toHaveAttribute('src','assets/world/snap_pop_beach_motion_v5.mp4');
  const master=await page.locator('img.sceneStatic').evaluate(el=>({w:el.naturalWidth,h:el.naturalHeight}));
  expect(master).toEqual({w:941,h:1672});
  await page.locator('#settingsBtn').click();
  await page.locator('#reduceMotion').check();
  await expect(page.locator('html')).toHaveAttribute('data-snap-living-motion','off');
  await expect(page.locator('#snapLivingMotion')).toHaveCSS('display','none');
});
