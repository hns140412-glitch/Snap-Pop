const assert=require('node:assert/strict');
const {chromium}=require('D:/Git PWA/Play Camp/node_modules/playwright-core');
const {spawn}=require('node:child_process');
const path=require('node:path');

(async()=>{
 // Start a fresh loopback fixture: the regression must not pass only because
 // another process happened to serve port 4340 on this machine.
 const root=path.resolve(__dirname,'..');
 const fixture=path.resolve('D:/Git PWA/TAKY/ENFORCEMENT/family_qa_local_static_host.cjs');
 const port=47000+Math.floor(Math.random()*1000);
 const server=spawn(process.execPath,[fixture,root,String(port)],{windowsHide:true,stdio:['ignore','pipe','pipe']});
 let browser;
 try {
   await new Promise((resolve,reject)=>{
     const timer=setTimeout(()=>reject(new Error('Snap local QA host did not start')),8000);
     server.stdout.on('data',bytes=>{
       if(String(bytes).includes('TAKY_QA_FIXTURE_READY')){clearTimeout(timer);resolve();}
     });
     server.once('error',err=>{clearTimeout(timer);reject(err)});
     server.once('exit',code=>{clearTimeout(timer);reject(new Error('Snap local QA host exited: '+code))});
   });
   browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const context=await browser.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
 const page=await context.newPage();
 const errors=[];
 page.on('pageerror',e=>errors.push('PAGE:'+String(e)));
 page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('/favicon.ico'))errors.push('HTTP_'+r.status()+':'+r.url())});
 await page.goto('http://127.0.0.1:'+port+'/',{waitUntil:'domcontentloaded',timeout:12000});
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
 // Negative control: merely repeating the same meaningless answer in an
 // expansion flow must not advance to completion/rewards as if validated.
 const expBefore=await page.evaluate(()=>get('exp'));
 const promptAtStart=await page.locator('#question').innerText();
 await page.locator('#answer').fill('qzxqzx');
 await page.locator('#nextBtn').click();
 assert.equal(await page.locator('#question').innerText(),promptAtStart,
   'Meaningless repeated characters advanced the initial expression stage');
 assert.equal(await page.evaluate(()=>get('exp')),expBefore,
   'Meaningless initial content earned EXP');
 // A real short first idea remains allowed, but copying it into the next
 // expansion step must request new detail instead of pretending learning.
 const firstIdea='오늘 기억나는 건 운동장에서 친구를 만난 일이야.';
 await page.locator('#answer').fill(firstIdea);
 await page.locator('#nextBtn').click();
 const promptAfterFirst=await page.locator('#question').innerText();
 assert.notEqual(promptAfterFirst,promptAtStart,'Valid initial idea did not advance');
 await page.locator('#answer').fill(firstIdea);
 await page.locator('#nextBtn').click();
 assert.equal(await page.locator('#question').innerText(),promptAfterFirst,
   'Repeated unchanged answer advanced the expression stage without new evidence');
 const expAfter=await page.evaluate(()=>get('exp'));
 assert.equal(expAfter,expBefore,'Unverified repeated text earned exploration EXP');
 assert.deepEqual(errors,[]);
 console.log(JSON.stringify({pass:true,landmarks:7,mind_diary_completed:true,record_provenance:true,secret_note_opened:true,errors:0},null,2));
 await context.close();
 } finally {
   await browser?.close().catch(()=>{});
   server.kill();
 }
})().catch(e=>{console.error(e);process.exitCode=1});
