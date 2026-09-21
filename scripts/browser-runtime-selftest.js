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
      assert("shared-release-loaded",globalThis.SnapPopReleaseDescriptor?.app_id==="snap-pop");
      assert("shared-pwa-loaded",globalThis.SnapPopPwaUpdate?.capability==="CAP-PWA-UPDATE-001");
      assert("shared-event-envelope-loaded",typeof globalThis.TakyEventEnvelope?.create==="function");
      assert("pwa-safe-point-contract-loaded",typeof globalThis.SnapPopPwaSafePoint?.()==="boolean");

      const landmarksReady=await waitFor(()=>document.querySelectorAll("#landmarks .landmark").length===5,4000,80);
      assert("map-has-five-landmarks",landmarksReady);

      click(document.querySelector("#landmarks .landmark"),"first-landmark");
      click(document.querySelector("#startBtn"),"start-writing");
      await wait(180);
      assert("writing-view-active",document.querySelector("#explore")?.classList.contains("active")===true);
      assert("active-writing-blocks-pwa-activation",globalThis.SnapPopPwaSafePoint?.()===false);

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
      assert("completed-writing-reopens-pwa-safe-point",globalThis.SnapPopPwaSafePoint?.()===true);
      const envelope=globalThis.SnapPopBridge.emit("TASK_PROGRESS",{sharedRuntimeSelftest:true});
      assert("shared-event-envelope-valid",globalThis.TakyEventEnvelope.validate(envelope).ok===true);

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
      const firstChildId=document.querySelector("#familyChildSelect")?.value||"";
      assert("family-child-created",firstChildId.startsWith("child_"));

      const diary=document.querySelector("#familyDiaryText");
      diary.value="오늘 가족과 함께 작은 탐험을 했다.";
      click(document.querySelector("#familyDiarySave"),"family-diary-save");
      await wait(160);

      const letter=document.querySelector("#familyLetterText");
      letter.value="오늘 함께해서 즐거웠어.";
      click(document.querySelector("#familyLetterSave"),"family-letter-save");
      await wait(160);

      const support=document.querySelector("#familySupportText");
      support.value="내일도 천천히 해보자.";
      click(document.querySelector("#familySupportSave"),"family-support-save");
      await wait(160);

      const shared=document.querySelector("#familySharedSpecialText");
      shared.value="가족과 별빛 지도를 만들었다.";
      click(document.querySelector("#familySharedSpecialSave"),"family-shared-special-save");
      await wait(220);

      const firstTimeline=document.querySelector("#familyTimeline")?.textContent||"";
      assert("family-diary-in-timeline",firstTimeline.includes("오늘 가족과 함께 작은 탐험을 했다."));
      assert("family-letter-in-timeline",firstTimeline.includes("오늘 함께해서 즐거웠어."));
      assert("family-support-card-in-timeline",firstTimeline.includes("내일도 천천히 해보자."));
      assert("family-shared-special-in-timeline",firstTimeline.includes("가족과 별빛 지도를 만들었다."));
      assert("family-conflict-lock-visible",document.querySelector("#familyFeatureGrid")?.textContent?.includes("CONFLICT_LOCKED")===true);
      assert("family-recovery-lock-visible",document.querySelector("#familyFeatureGrid")?.textContent?.includes("RECOVERY_LOCKED")===true);

      name.value="런타임둘째";
      click(document.querySelector("#familyChildAdd"),"family-second-child-add");
      await wait(180);
      const secondChildId=document.querySelector("#familyChildSelect")?.value||"";
      assert("family-second-child-created",secondChildId.startsWith("child_")&&secondChildId!==firstChildId);

      diary.value="둘째 아이만의 기록";
      click(document.querySelector("#familyDiarySave"),"family-second-child-diary-save");
      await wait(180);
      assert("second-child-timeline-isolated",document.querySelector("#familyTimeline")?.textContent?.includes("둘째 아이만의 기록")===true&&!document.querySelector("#familyTimeline")?.textContent?.includes("오늘 가족과 함께 작은 탐험을 했다."));

      const selector=document.querySelector("#familyChildSelect");
      selector.value=firstChildId;
      selector.dispatchEvent(new Event("change",{bubbles:true}));
      await wait(180);
      const restoredTimeline=document.querySelector("#familyTimeline")?.textContent||"";
      assert("first-child-timeline-restored",restoredTimeline.includes("오늘 가족과 함께 작은 탐험을 했다.")&&!restoredTimeline.includes("둘째 아이만의 기록"));

      const R=window.SnapPopFamilyExpansion;
      assert("family-runtime-present",!!R);
      assert("child-permission-isolation",R.can({groupId:"family_a",role:"CHILD",memberId:firstChildId},"READ_SELF",secondChildId)===false);
      assert("parent-contract-present",Array.isArray(R.roles.PARENT)&&R.roles.PARENT.includes("READ_FAMILY_TIMELINE"));

      for(const featureId of ["FAMILY_GROUP","MAILBOX_DECOR","COMPOSITE_DIARY_ILLUSTRATION","GEM_GIFT"]){
        let blocked=false;
        try{R.assertAvailable(featureId)}catch{blocked=true}
        assert("locked-feature-blocked-"+featureId.toLowerCase(),blocked);
      }
      assert("gem-gift-economy-mutation-blocked",R.contracts.gemGiftEconomyMutationAllowed===false);

      toggle.checked=false;
      toggle.dispatchEvent(new Event("change",{bubbles:true}));
      await wait(120);
      assert("original-mode-restored",document.querySelector("#familyExpansionMode")?.textContent==="ORIGINAL"&&document.querySelector("#familyDiaryText")?.disabled===true);
      toggle.checked=true;
      toggle.dispatchEvent(new Event("change",{bubbles:true}));
      await wait(120);
      assert("family-mode-reenabled",document.querySelector("#familyExpansionMode")?.textContent==="FAMILY_EXPANSION");

      document.body.dataset.runtimeSmoke="PASS";
      result.textContent+="\nBROWSER_RUNTIME_SELFTEST_PASS";
    }catch(error){
      document.body.dataset.runtimeSmoke="FAIL";
      result.textContent+="\nBROWSER_RUNTIME_SELFTEST_FAIL "+(error?.message||String(error));
    }
  }

  run();
})();
