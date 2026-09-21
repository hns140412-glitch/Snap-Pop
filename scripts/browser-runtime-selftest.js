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
      assert("live-dom-map-surface",!!document.querySelector("#map .mapWorld")&&document.querySelectorAll("#landmarks button.landmark").length===5);
      assert("live-dom-primary-navigation",document.querySelectorAll("#nav button[data-view]").length>=5);
      assert("live-dom-writing-surface-present",!!document.querySelector("#answer")&&document.querySelector("#answer") instanceof HTMLTextAreaElement);
      assert("runtime-mockup-background-not-used",![...document.images].some(img=>/mockup|wireframe|screenshot|prototype/i.test(img.getAttribute("src")||"")));

      const crewRules=await fetch("data/exploration-crew-rules.json").then(r=>r.json());
      assert("affinity-runtime-is-internal-expression-only",
        crewRules?.affinityEngine?.scoreIsInternal===true&&
        crewRules?.affinityEngine?.noPowerBoost===true&&
        crewRules?.affinityEngine?.expressionOnlyUnlocks===true
      );

      const specialRole=window.SnapPopCrewRoleGuard.assertRoleContract({role:"SPECIAL"});
      assert("special-role-runtime-is-encounter-only",
        specialRole.role==="SPECIAL"&&
        specialRole.roleMeaning==="ENCOUNTER_STYLE_ONLY"&&
        specialRole.functionalAbility==="EQUAL"&&
        specialRole.rewardMultiplier===1&&
        specialRole.expMultiplier===1
      );
      let specialPowerBlocked=false;
      try{window.SnapPopCrewRoleGuard.assertRoleContract({role:"SPECIAL",powerBoost:true})}catch{specialPowerBlocked=true}
      assert("special-role-power-boost-is-blocked",specialPowerBlocked===true);

      const core6=window.SnapPopCrewCore6.baseline(crewRules);
      assert("core6-runtime-working-baseline",
        core6.status==="WORKING_STARTER_BASELINE"&&
        core6.memberCount===6&&
        core6.globalAuthority===false&&
        core6.rosterLock===false&&
        core6.futureExpansionAllowed===true
      );

      const guestMembers={
        dooby:crewRules.definedCharacterLineages.dooby,
        lori:crewRules.definedCharacterLineages.lori,
        ink:crewRules.definedCharacterLineages.ink
      };
      const guestRegistry={
        dooby:{encounterStatus:"STARTER_AVAILABLE",worldState:{state:"MAIN_COMPANION"}},
        lori:{encounterStatus:"STARTER_AVAILABLE",worldState:{state:"AT_HUB"}},
        ink:{encounterStatus:"STARTER_AVAILABLE",worldState:{state:"AT_HUB"}}
      };
      const guestPick=window.SnapPopCrewOrchestration.chooseGuest({
        mainId:"dooby",
        registry:guestRegistry,
        members:guestMembers,
        recentAppearances:[
          {memberId:"lori",sceneKey:"A"},
          {memberId:"lori",sceneKey:"B"},
          {memberId:"lori",sceneKey:"C"}
        ],
        sceneKey:"RUNTIME_GUEST_WEIGHT"
      });
      assert("guest-weighting-prefers-less-recent-non-main",
        guestPick?.memberId==="ink"&&guestPick?.mainContinuityPreserved===true&&guestPick?.functionalAdvantage===false
      );

      const crewRuntime=window.SnapPopCrewRuntimeController.instance({});
      let runtimeRegistry=await window.SnapPopStorage.get("crewRegistry")||{};
      let runtimeMainId=Object.keys(runtimeRegistry).find(id=>runtimeRegistry[id]?.worldState?.state==="MAIN_COMPANION")||Object.keys(runtimeRegistry)[0];
      assert("crew-runtime-main-id-present",!!runtimeMainId&&runtimeRegistry[runtimeMainId]?.memberId===runtimeMainId);

      runtimeRegistry[runtimeMainId].lastMetAt=new Date(Date.now()-3*86400000).toISOString();
      runtimeRegistry[runtimeMainId].worldState={state:"AT_HUB",generatedAt:new Date().toISOString(),synthetic:true};
      await window.SnapPopStorage.set("crewRegistry",runtimeRegistry);
      const returnedMainState=await crewRuntime.synthesizeCrewWorldState();
      runtimeRegistry=await window.SnapPopStorage.get("crewRegistry")||{};
      assert("crew-world-return-restores-main-companion",returnedMainState?.state==="MAIN_COMPANION"&&runtimeRegistry[runtimeMainId]?.worldState?.state==="MAIN_COMPANION");
      assert("crew-world-return-records-reunion-memory",(runtimeRegistry[runtimeMainId]?.memories||[]).some(m=>m.type==="REUNION"));

      const affinityBefore=runtimeRegistry[runtimeMainId]?.affinity?.scoreInternal||0;
      const expBeforeAffinity=await window.SnapPopStorage.get("exp");
      const gemsBeforeAffinity=JSON.stringify(await window.SnapPopStorage.get("gems")||{});
      const affinityEntry=await crewRuntime.recordCrewMemberExperience(runtimeMainId,"SHARED_MICRO_EPISODE",{eventId:"runtime_affinity_probe"});
      assert("affinity-memory-increments-relationship-score",(affinityEntry?.affinity?.scoreInternal||0)===affinityBefore+1);
      assert("affinity-memory-does-not-change-exp",(await window.SnapPopStorage.get("exp"))===expBeforeAffinity);
      assert("affinity-memory-does-not-change-gems",JSON.stringify(await window.SnapPopStorage.get("gems")||{})===gemsBeforeAffinity);

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
      const safety=window.SnapPopCrewInteractionSafety;
      assert("unsafe-child-mock-is-blocked",safety?.inspect("넌 또 틀렸어",{mode:"CHILD_REACTION"})?.safe===false);
      assert("unsafe-child-mock-falls-back-neutral",safety?.safeReaction("넌 또 틀렸어",{language:"ko"})==="작은 한 조각만 같이 보자.");
      const reactionOverlay=document.querySelector("#crewReactionOverlay");
      assert("crew-reaction-hidden-by-default",reactionOverlay?.hidden===true);
      assert("crew-reaction-does-not-capture-input",getComputedStyle(reactionOverlay).pointerEvents==="none");
      assert("crew-reaction-is-height-bounded",parseFloat(getComputedStyle(reactionOverlay).maxHeight)<=86);

      click(next,"empty-advance-1");
      await wait(120);
      let interventionState=await window.SnapPopStorage.get("active");
      assert("empty-first-attempt-stays-on-step-0",interventionState?.step===0);
      assert("empty-first-attempt-waits",interventionState?.crewState?.interventionStage==="WAIT");
      assert("empty-first-attempt-does-not-write",answer.value==="");

      click(next,"empty-advance-2");
      await wait(120);
      interventionState=await window.SnapPopStorage.get("active");
      assert("empty-second-attempt-stays-on-step-0",interventionState?.step===0);
      assert("empty-second-attempt-offers-hint",interventionState?.crewState?.interventionStage==="HINT_OFFER");
      assert("hint-is-not-auto-revealed",document.querySelector("#hint")?.hidden===true);
      assert("empty-second-attempt-does-not-write",answer.value==="");

      const originalSemanticProvider=window.SnapPopSemanticWritingProvider;
      const staleProbeCalls=[];
      window.SnapPopSemanticWritingProvider={
        async analyzeWriting(payload){
          const draft=payload.draft||"";
          staleProbeCalls.push(draft);
          const isOld=draft.includes("오래된 분석");
          await wait(isOld?1500:10);
          return {
            focus:isOld?"OLD":"LATEST",
            question:isOld?"오래된 분석 결과가 보이나?":"최신 분석 결과만 남아 있나?",
            hint:"",
            suggestedLens:null,
            rationale:"runtime stale-result probe",
            confidence:1,
            semanticSignals:{present:[],missing:[]},
            grounded:true,
            provider:"runtime-probe"
          };
        }
      };
      answer.value="오래된 분석 초안";
      answer.dispatchEvent(new Event("input",{bubbles:true}));
      assert("stale-probe-old-analysis-started",await waitFor(()=>staleProbeCalls.some(x=>x.includes("오래된 분석")),2500,25));
      answer.value="최신 분석 초안";
      answer.dispatchEvent(new Event("input",{bubbles:true}));
      assert("stale-probe-latest-analysis-started",await waitFor(()=>staleProbeCalls.some(x=>x.includes("최신 분석")),2500,25));
      await wait(1700);
      const staleFinalQuestion=document.querySelector("#question")?.textContent||"";
      if(staleFinalQuestion!=="최신 분석 결과만 남아 있나?")throw new Error("FAIL stale-writing-analysis-cannot-overwrite-latest actual="+staleFinalQuestion+" calls="+JSON.stringify(staleProbeCalls));
      result.textContent+="\nPASS stale-writing-analysis-cannot-overwrite-latest";
      window.SnapPopSemanticWritingProvider=originalSemanticProvider;

      const providerForFallback=window.SnapPopSemanticWritingProvider;
      window.SnapPopSemanticWritingProvider=null;
      const fallbackAnalysis=await window.SnapPopWriting.analyze({
        landmark:"idea",step:0,language:"ko",
        draft:"나는 숲에서 본 작은 빛이 왜 기억나는지 궁금해."
      });
      assert("semantic-provider-unavailable-falls-back-locally",fallbackAnalysis?.provider==="local-writing-fallback"&&typeof fallbackAnalysis?.question==="string"&&fallbackAnalysis.question.length>0);
      assert("local-fallback-keeps-child-authorship",!("finalDraft" in fallbackAnalysis)&&!("rewrite" in fallbackAnalysis)&&!("answer" in fallbackAnalysis));

      const lowTrustContext={
        source:"READY_SET_LEARNING_MASTER",
        confidence:0.2,
        unresolved_flags:["UNCONFIRMED_A","UNCONFIRMED_B","UNCONFIRMED_C"],
        cognitive_load_profile:["LANGUAGE_PRODUCTION"],
        concept_skill_target:"확인 전 목표"
      };
      const lowTrustPolicy=window.SnapPopWriting.contextPolicy({learnerContext:lowTrustContext,step:0});
      assert("low-trust-learning-context-is-detected",lowTrustPolicy?.used===true&&lowTrustPolicy?.reason==="LOW_CONTEXT_CONFIDENCE");
      assert("low-trust-learning-context-cannot-force-cross-lens",lowTrustPolicy?.allowCrossLens===false);
      const lowTrustAnalysis=await window.SnapPopWriting.analyze({
        landmark:"idea",step:0,language:"ko",
        draft:"내가 직접 쓰고 싶은 생각이 있어.",
        learnerContext:lowTrustContext
      });
      assert("low-trust-analysis-keeps-local-child-direction",lowTrustAnalysis?.provider==="local-writing-fallback"&&lowTrustAnalysis?.suggestedLens===null&&lowTrustAnalysis?.learningContextUsed===true);
      window.SnapPopSemanticWritingProvider=providerForFallback;

      const lensProbeDraft="나는 오늘 학교에서 친구와 이야기했어. 왜냐하면 궁금했어.";
      const lensIds=["idea","emotion","description","viewpoint","final"];
      const lensMoves=lensIds.map(landmark=>window.SnapPopWriting.move({landmark,step:0,draft:lensProbeDraft,language:"ko"}));
      assert("five-writing-lenses-return-five-moves",lensMoves.length===5&&lensMoves.every(m=>typeof m?.question==="string"&&m.question.length>0));
      assert("five-writing-lenses-are-distinct",new Set(lensMoves.map(m=>m.focus+"|"+m.question)).size===5);
      assert("writing-lens-next-move-remains-single",lensMoves.every(m=>(m.question.match(/[?？]/g)||[]).length===1));

      const originalOpenAIProvider=window.SnapPopOpenAIProvider;
      window.SnapPopOpenAIProvider={
        async analyzeWriting(){
          return {
            focus:"BAD_REWRITE",
            question:"다음 한 가지를 생각해볼까?",
            hint:"",
            finalDraft:"AI가 대신 완성한 글",
            provider:"runtime-forbidden-provider"
          };
        }
      };
      let rewriteBlocked=false;
      try{
        await window.SnapPopSemanticWritingProvider.analyzeWriting({
          draft:"내가 직접 쓴 문장",
          landmark:"idea",step:0,language:"ko"
        });
      }catch{rewriteBlocked=true}
      assert("semantic-provider-blocks-final-draft-generation",rewriteBlocked===true);

      window.SnapPopOpenAIProvider={
        async analyzeWriting(){
          return {
            focus:"ONE_NEXT_MOVE",
            question:"이 생각이 떠오른 이유 하나만 붙여볼까?",
            hint:"이유 하나면 충분해.",
            suggestedLens:null,
            rationale:"runtime analysis-only probe",
            confidence:0.9,
            semanticSignals:{present:["idea"],missing:["reason"]},
            grounded:true,
            provider:"runtime-analysis-only-provider"
          };
        }
      };
      const analysisOnly=await window.SnapPopSemanticWritingProvider.analyzeWriting({
        draft:"내가 직접 쓴 문장",
        landmark:"idea",step:0,language:"ko"
      });
      assert("semantic-provider-analysis-only-output",analysisOnly?.question==="이 생각이 떠오른 이유 하나만 붙여볼까?"&&!("finalDraft" in analysisOnly)&&!("rewrite" in analysisOnly)&&!("answer" in analysisOnly));
      window.SnapPopOpenAIProvider=originalOpenAIProvider;

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

      click(document.querySelector("#resultRecords"),"result-records");
      await wait(180);
      assert("records-view-active",document.querySelector("#records")?.classList.contains("active")===true);
      const recordBefore=(await window.SnapPopStorage.get("records"))?.[0]||null;
      const originalText=recordBefore?.answers?.join(" ")||"";
      const originalExp=recordBefore?.expAward;
      click(document.querySelector(".recordEditBtn"),"record-edit-open");
      await wait(120);
      assert("record-edit-view-active",document.querySelector("#recordEdit")?.classList.contains("active")===true);
      const edit=document.querySelector("#recordEditText");
      edit.value=(edit.value||"")+" 수정한 한 문장.";
      click(document.querySelector("#recordEditSave"),"record-edit-save");
      await wait(180);
      const recordsAfter=await window.SnapPopStorage.get("records");
      const revisionsAfter=await window.SnapPopStorage.get("recordRevisions");
      const preserved=recordsAfter?.find(x=>x.id===recordBefore?.id);
      assert("record-original-preserved-after-revision",preserved?.answers?.join(" ")===originalText);
      assert("record-revision-added",Array.isArray(revisionsAfter?.[recordBefore?.id])&&revisionsAfter[recordBefore.id].length>=1);
      assert("record-revision-does-not-recompute-reward",preserved?.expAward===originalExp);

      const expBeforeCloud=await window.SnapPopStorage.get("exp");
      const gemsBeforeCloud=JSON.stringify(await window.SnapPopStorage.get("gems")||{});
      const cloudBefore=await window.SnapPopStorage.get("cloudHistory")||[];
      const runtimeCloudEntry={
        id:"runtime_cloud_history",
        input:"왜 잎 사이의 빛이 반짝여 보였을까?",
        intent:"ASK_UNDERSTAND",
        verificationStatus:"FACT_NEEDS_CHECK",
        verified:false,
        title:"런타임 궁금증",
        core:"확인이 필요한 궁금증 기록",
        nodes:[],
        language:"ko",
        source:"RUNTIME_SELFTEST",
        at:new Date().toISOString()
      };
      await window.SnapPopStorage.set("cloudHistory",[runtimeCloudEntry,...cloudBefore.filter(x=>x.id!=="runtime_cloud_history")]);
      click(document.querySelector('#nav button[data-view="records"]'),"records-nav");
      await wait(180);
      assert("records-and-cloud-history-render-together",
        document.querySelector("#recordList")?.textContent?.includes(originalText.slice(0,12))===true&&
        document.querySelector("#cloudHistoryList")?.textContent?.includes("왜 잎 사이의 빛이 반짝여 보였을까?")===true
      );

      click(document.querySelector("#resultGrowth"),"result-growth");
      await wait(160);
      assert("growth-view-active",document.querySelector("#growth")?.classList.contains("active")===true);
      assert("single-growth-tree-present",document.querySelectorAll("#growth #treeImage").length===1);
      assert("cloud-activity-appears-in-growth-summary",document.querySelector("#growthActivitySummary")?.textContent?.includes("궁금증")===true);
      assert("cloud-activity-does-not-change-exp",(await window.SnapPopStorage.get("exp"))===expBeforeCloud);
      assert("cloud-activity-does-not-change-gems",JSON.stringify(await window.SnapPopStorage.get("gems")||{})===gemsBeforeCloud);

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
