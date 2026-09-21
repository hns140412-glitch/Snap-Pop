(() => {
  "use strict";
  if(!new URLSearchParams(location.search).has("runtime-smoke")) return;

  const result=document.createElement("pre");
  result.id="browserRuntimeSelfTest";
  result.hidden=true;
  result.textContent="BROWSER_RUNTIME_SELFTEST_PENDING";
  document.body.appendChild(result);

  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  async function waitFor(check,timeout=12000,interval=100){
    const started=Date.now();
    while(Date.now()-started<timeout){
      try{if(check())return true}catch{}
      await wait(interval);
    }
    return false;
  }
  function assert(name,condition){
    if(!condition) throw new Error("FAIL "+name);
    result.textContent+="\nPASS "+name;
  }
  function click(el,name){assert(name+"-exists",!!el);el.click()}

  async function run(){
    try{
      const initReady=await waitFor(()=>window.__SNAP_RUNTIME_STATUS?.init==="PASS",12000,100);
      if(!initReady) throw new Error("FAIL app-init runtime="+JSON.stringify(window.__SNAP_RUNTIME_STATUS||null));
      assert("app-init-pass",true);
      assert("indexeddb-open",window.__SNAP_RUNTIME_STATUS?.db==="OPEN");

      const landmarksReady=await waitFor(()=>document.querySelectorAll("#landmarks .landmark").length===5,4000,80);
      assert("map-has-five-landmarks",landmarksReady);

      click(document.querySelector("#landmarks .landmark"),"first-landmark");
      click(document.querySelector("#startBtn"),"start-writing");
      await wait(180);
      assert("writing-view-active",document.querySelector("#explore")?.classList.contains("active")===true);

      const answer=document.querySelector("#answer"),next=document.querySelector("#nextBtn");
      assert("hint-control-restored",!!document.querySelector("#hintBtn"));
      answer.value="오늘은 숲에서 작은 빛을 봤어.";
      answer.dispatchEvent(new Event("input",{bubbles:true}));
      click(next,"writing-step-1");
      await wait(180);

      answer.value="오늘은 숲에서 작은 빛을 봤어. 가까이 가니 잎 사이에서 반짝였어.";
      answer.dispatchEvent(new Event("input",{bubbles:true}));
      click(next,"writing-step-2");
      await wait(180);

      answer.value="오늘은 숲에서 작은 빛을 봤어. 가까이 가니 잎 사이에서 반짝였어. 다음에도 천천히 살펴보고 싶어.";
      answer.dispatchEvent(new Event("input",{bubbles:true}));
      click(next,"writing-complete");
      await wait(500);
      assert("writing-result-active",document.querySelector("#result")?.classList.contains("active")===true);

      click(document.querySelector("#familyExpansionBtn"),"family-open");
      await wait(180);
      assert("family-view-active",document.querySelector("#familyExpansion")?.classList.contains("active")===true);

      const toggle=document.querySelector("#familyExpansionToggle");
      toggle.checked=true;
      toggle.dispatchEvent(new Event("change",{bubbles:true}));
      await wait(120);
      assert("family-mode-enabled",document.querySelector("#familyExpansionMode")?.textContent==="FAMILY_EXPANSION");

      const name=document.querySelector("#familyChildName");
      name.value="런타임아이";
      click(document.querySelector("#familyChildAdd"),"family-child-add");
      await wait(180);
      assert("family-child-created",document.querySelector("#familyChildSelect")?.value?.startsWith("child_")===true);

      const diary=document.querySelector("#familyDiaryText");
      diary.value="오늘 가족과 함께 작은 탐험을 했다.";
      click(document.querySelector("#familyDiarySave"),"family-diary-save");
      await wait(220);
      assert("family-diary-in-timeline",document.querySelector("#familyTimeline")?.textContent?.includes("오늘 가족과 함께 작은 탐험을 했다.")===true);
      assert("family-conflict-lock-visible",document.querySelector("#familyFeatureGrid")?.textContent?.includes("CONFLICT_LOCKED")===true);
      assert("family-recovery-lock-visible",document.querySelector("#familyFeatureGrid")?.textContent?.includes("RECOVERY_LOCKED")===true);

      document.body.dataset.runtimeSmoke="PASS";
      result.textContent+="\nBROWSER_RUNTIME_SELFTEST_PASS";
    }catch(error){
      document.body.dataset.runtimeSmoke="FAIL";
      result.textContent+="\nBROWSER_RUNTIME_SELFTEST_FAIL "+(error?.message||String(error));
    }
  }

  run();
})();
