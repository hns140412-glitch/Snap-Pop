const assert=require('node:assert/strict');
const {chromium}=require('D:/Git PWA/Play Camp/node_modules/playwright-core');

(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const context=await browser.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
 const page=await context.newPage();
 const errors=[];
 page.on('pageerror',e=>errors.push('PAGE:'+String(e)));
 page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('/favicon.ico'))errors.push('HTTP_'+r.status()+':'+r.url())});
 await page.goto('http://127.0.0.1:4340/',{waitUntil:'domcontentloaded',timeout:12000});
 await page.waitForFunction(()=>document.querySelectorAll('#landmarks .landmark').length===7,{timeout:10000});

 const mind=page.locator('#landmarks .landmark').filter({hasText:'마음 기상대'});
 await mind.click();
 await page.click('#startBtn');
 await page.waitForFunction(()=>document.getElementById('explore')?.classList.contains('active'),{timeout:8000});
 let q=await page.locator('#question').innerText();
 assert.match(q,/마음을 날씨|마음.*날씨/);
 const expected=[
   /마음을 날씨|마음.*날씨/,
   /어디서 누구와|무슨 일이/,
   /한 문장|해시태그/
 ];
 const answers=['오늘 마음은 맑음이었다.','학교에서 친구와 웃긴 일이 있었고 기분이 좋았다.','오늘은 웃음이 많았던 날. #기분좋음'];
 for(let i=0;i<3;i++){
   q=await page.locator('#question').innerText();assert.match(q,expected[i]);
   await page.fill('#answer',answers[i]);
   await page.click('#nextBtn');
   await page.waitForTimeout(250);
 }
 await page.waitForFunction(()=>document.getElementById('growth')?.classList.contains('active'),{timeout:8000});
 const saved=await page.evaluate(async()=>{
   const records=await get('records')||[],gems=await get('gems')||{};
   return {latest:records[0],gem:gems['mind-diary']||0,active:await get('active')};
 });
 assert.equal(saved.latest.landmark,'mind-diary');
 assert.equal(saved.latest.expansionPack,'MIND_DIARY');
 assert.equal(saved.latest.sourceRef,'1l-aFFOuDS0ECThDcgx8QDL0aswMw4Q6d');
 assert.equal(saved.latest.sourceSha256,'74e68d2e0de124b284c5bfbfb52505f5499c8b49ada706bf82ae04624dfbccd6');
 assert.deepEqual(saved.latest.answers,answers);
 assert.equal(saved.gem,1);
 assert.equal(saved.active,null);

 await page.evaluate(()=>show('map'));
 const secret=page.locator('#landmarks .landmark').filter({hasText:'비밀 무전국'});
 await secret.click();
 await page.click('#startBtn');
 await page.waitForFunction(()=>document.getElementById('explore')?.classList.contains('active'),{timeout:8000});
 const secretQ=await page.locator('#question').innerText();
 assert.match(secretQ,/기억나는 장면|단어 하나/);
 const steps=await page.locator('#steps').innerText();
 assert.match(steps,/기억 포착/);assert.match(steps,/무전기 탐문/);assert.match(steps,/비밀 글 완성/);
 assert.deepEqual(errors,[]);
 console.log(JSON.stringify({pass:true,landmarks:7,mind_diary_completed:true,record_provenance:true,secret_note_opened:true,errors:0},null,2));
 await context.close();await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
