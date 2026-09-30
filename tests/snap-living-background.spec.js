const {test,expect}=require('@playwright/test');

test('approved Snap coast and living FX render on the regional HOME',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('http://127.0.0.1:4173/');
  const scene=page.locator('.mapWorld.livingCoast>.scene');
  await expect(scene).toHaveAttribute('src','assets/world/snap_pop_beach_asset.png');
  const visual=await page.locator('.mapWorld.livingCoast').getAttribute('data-visual-id');
  expect(visual).toBe('TAKY-LAF-SNAP-HOME-COAST-20260927-A');
  const source=await scene.evaluate(el=>({w:el.naturalWidth,h:el.naturalHeight}));
  expect(source).toEqual({w:941,h:1672});
  const fx=await page.locator('.coastFx').evaluate(el=>({
    display:getComputedStyle(el).display,
    foam:getComputedStyle(el.querySelector('.coastFoamA')).animationName,
    water:getComputedStyle(el.querySelector('.coastWaterLight')).animationName
  }));
  expect(fx.display).not.toBe('none');
  expect(fx.foam).toBe('coastFoamNormal');
  expect(fx.water).toBe('coastWaterLight');
  await page.locator('#settingsBtn').click();
  await page.locator('#reduceMotion').check();
  await expect(page.locator('html')).toHaveClass(/reduce-motion/);
  expect(await page.locator('.coastFx').evaluate(el=>getComputedStyle(el).display)).toBe('none');
});
