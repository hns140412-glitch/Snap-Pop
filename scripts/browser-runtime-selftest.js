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

      const appRoot=document.querySelector("#app");
      assert("mobile-root-has-no-horizontal-overflow",appRoot.scrollWidth<=appRoot.clientWidth+1);
      assert("mobile-document-has-no-horizontal-overflow",document.documentElement.scrollWidth<=window.innerWidth+1);
      const toolButtons=[...document.querySelectorAll("#explore .tools button")].filter(b=>!b.hidden&&getComputedStyle(b).display!=="none");
      assert("writing-tools-present",toolButtons.length>=6);
      const toolHeights=toolButtons.map(b=>({id:b.id,height:Math.round(b.getBoundingClientRect().height*10)/10}));
      if(!toolButtons.every(b=>b.getBoundingClientRect().height>=44))throw new Error("FAIL writing-tools-touch-height "+JSON.stringify(toolHeights));
      result.textContent+="\nPASS writing-tools-touch-height";
      assert("writing-tools-stay-inside-viewport",toolButtons.every(b=>{const r=b.getBoundingClientRect();return r.left>=0&&r.right<=window.innerWidth+1}));
      assert("primary-next-touch-height",document.querySelector("#nextBtn")?.getBoundingClientRect().height>=44);


      const answer=document.querySelector("#answer"),next=document.querySelector("#nextBtn");
      assert("hint-control-restored",!!document.querySelector("#hintBtn"));
      const draft1="오늘은 숲에서 작은 빛을 봤어.";
      answer.value=draft1;
      answer.dispatchEvent(new Event("input",{bubbles:true}));
      await wait(120);
      let activeState=await window.SnapPopStorage.get("active");
      assert("writing-draft-persists-step-0",activeState?.draft===draft1);
      click(next,"writing-step-1");
      await wait(180);
      activeState=await window.SnapPopStorage.get("active");
      assert("writing-advances-to-step-1",activeState?.step===1);
      assert("writing-same-draft-carried-to-step-1",activeState?.draft===draft1&&answer.value===draft1);

      const draft2="오늘은 숲에서 작은 빛을 봤어. 가까이 가니 잎 사이에서 반짝였어.";
      answer.value=draft2;
      answer.dispatchEvent(new Event("input",{bubbles:true}));
      await wait(120);
      activeState=await window.SnapPopStorage.get("active");
      assert("writing-draft-persists-step-1",activeState?.draft===draft2);

      click(document.querySelector("#cloudBtn"),"writing-cloud-open");
      await wait(120);
      assert("writing-cloud-opens-on-demand",document.querySelector("#imaginationLayer")?.hidden===false);
      click(document.querySelector("#imaginationClose"),"writing-cloud-close");
      await wait(180);
      activeState=await window.SnapPopStorage.get("active");
      assert("writing-cloud-return-preserves-draft",activeState?.draft===draft2&&answer.value===draft2);
      assert("writing-cloud-return-restores-writing-view",document.querySelector("#explore")?.classList.contains("active")===true);

      click(next,"writing-step-2");
      await wait(180);
      activeState=await window.SnapPopStorage.get("active");
      assert("writing-advances-to-step-2",activeState?.step===2);
      assert("writing-same-draft-carried-to-step-2",activeState?.draft===draft2);

      const draft3="오늘은 숲에서 작은 빛을 봤어. 가까이 가니 잎 사이에서 반짝였어. 다음에도 천천히 살펴보고 싶어.";
      answer.value=draft3;
      answer.dispatchEvent(new Event("input",{bubbles:true}));
      click(next,"writing-complete");
      await wait(500);
      assert("writing-result-active",document.querySelector("#result")?.classList.contains("active")===true);
      const completedRecord=(await window.SnapPopStorage.get("lastResult"))||null;
      assert("writing-completion-preserves-final-draft",completedRecord?.finalDraft===draft3);
      assert("writing-completion-has-three-snapshots",Array.isArray(completedRecord?.snapshots)&&completedRecord.snapshots.length===3);

      click(document.querySelector("#resultGrowth"),"result-growth");
      await wait(160);
      assert("growth-view-active",document.querySelector("#growth")?.classList.contains("active")===true);
      assert("single-growth-tree-present",document.querySelectorAll("#growth #treeImage").length===1);

      click(document.querySelector("#resultBack"),"result-back-map");
      await wait(120);
      assert("map-restored-after-result",document.querySelector("#map")?.classList.contains("active")===true);
      assert("imagination-hidden-by-default",document.querySelector("#imaginationLayer")?.hidden===true);
      click(document.querySelector("#homeRadio"),"home-radio");
      await wait(120);
      assert("home-radio-opens-imagination",document.querySelector("#imaginationLayer")?.hidden===false);
      click(document.querySelector("#imaginationClose"),"home-radio-close");
      await wait(120);
      assert("home-radio-close-restores-map",document.querySelector("#imaginationLayer")?.hidden===true&&document.querySelector("#map")?.classList.contains("active")===true);

      click(document.querySelector("#familyExpansionBtn"),"family-open");
      await wait(180);
      assert("family-view-active",document.querySelector("#familyExpansion")?.classList.contains("active")===true);

      const toggle=document.querySelector("#familyExpansionToggle");
      toggle.checked=true;
      toggle.dispatchEvent(new Event("change",{bubbles:true}));
      await wait(120);
      assert("family-mode-enabled",document.querySelector("#familyExpansionMode")?.textContent==="사용 중");

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
      assert("family-conflict-lock-hidden-from-user",document.querySelector("#familyFeatureGrid")?.textContent?.includes("CONFLICT_LOCKED")===false);
      assert("family-recovery-lock-hidden-from-user",document.querySelector("#familyFeatureGrid")?.textContent?.includes("RECOVERY_LOCKED")===false);

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
      assert("original-mode-restored",document.querySelector("#familyExpansionMode")?.textContent==="사용 안 함"&&document.querySelector("#familyDiaryText")?.disabled===true);
      toggle.checked=true;
      toggle.dispatchEvent(new Event("change",{bubbles:true}));
      await wait(120);
      assert("family-mode-reenabled",document.querySelector("#familyExpansionMode")?.textContent==="사용 중");

      document.body.dataset.runtimeSmoke="PASS";
      result.textContent+="\nBROWSER_RUNTIME_SELFTEST_PASS";
    }catch(error){
      document.body.dataset.runtimeSmoke="FAIL";
      result.textContent+="\nBROWSER_RUNTIME_SELFTEST_FAIL "+(error?.message||String(error));
    }
  }

  run();
})();
