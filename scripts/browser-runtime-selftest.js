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

      const originalUniversalOpenAIProvider=window.SnapPopOpenAIProvider;
      const originalKnowledgeRuntime=window.SnapPopKnowledge;
      window.SnapPopOpenAIProvider=null;
      window.SnapPopKnowledge=null;
      const localThinkKo=await window.SnapPopIntelligence.ask({input:"비 오는 날 창문을 보며 떠오른 생각",language:"ko"});
      const localThinkEn=await window.SnapPopIntelligence.ask({input:"A quiet thought while watching rain",language:"en"});
      assert("think-express-local-runtime-kind",localThinkKo?.kind==="THINK_EXPRESS"&&localThinkKo?.verification?.mode==="NOT_APPLICABLE");
      assert("think-express-local-runtime-has-scaffold",Array.isArray(localThinkKo?.nodes)&&localThinkKo.nodes.length>=3&&!localThinkKo?.finalDraft&&!localThinkKo?.answer);
      assert("think-express-korean-supported",/생각|장면|마음/.test([localThinkKo?.title,localThinkKo?.core,...(localThinkKo?.nodes||[]).map(x=>x.label)].join(" ")));
      assert("think-express-english-supported",localThinkEn?.kind==="THINK_EXPRESS"&&/[A-Za-z]/.test([localThinkEn?.title,localThinkEn?.core,...(localThinkEn?.nodes||[]).map(x=>x.label)].join(" ")));
      assert("think-express-response-owner-is-crew",localThinkKo?.responseOwner==="EXPLORATION_CREW"&&localThinkEn?.responseOwner==="EXPLORATION_CREW");
      const noGuess=await window.SnapPopIntelligence.ask({input:"조선은 언제 시작됐어?",language:"ko"});
      assert("ask-without-knowledge-provider-does-not-guess",noGuess?.kind==="ASK_UNDERSTAND"&&noGuess?.verified===false&&/추측|확인|사실/.test((noGuess?.core||"")+" "+(noGuess?.title||"")));
      assert("ask-no-guess-response-owner-is-crew",noGuess?.responseOwner==="EXPLORATION_CREW");

      window.SnapPopKnowledge=originalKnowledgeRuntime;
      const originalKnowledgeBackend=window.SnapPopKnowledgeBackend;
      window.SnapPopKnowledgeBackend={
        async ask(){
          return {
            kind:"ASK_UNDERSTAND",
            intent:"ASK_UNDERSTAND",
            title:"왜 하늘이 파랄까?",
            core:"햇빛이 공기 분자와 만나 산란될 때 파란빛이 더 잘 퍼져 보여.",
            nodes:[
              {label:"원인",value:"햇빛이 대기를 통과함"},
              {label:"과정",value:"공기 분자에서 짧은 파장의 빛이 더 많이 산란됨"},
              {label:"결과",value:"여러 방향에서 파란빛이 더 많이 눈에 들어옴"}
            ],
            provider:"runtime-verified-backend",
            verification:{
              mode:"CLAIM_EVIDENCE",
              coverage:"FULL_FACTUAL_CONTENT",
              claims:[{
                claim:"짧은 파장의 가시광은 대기 분자에서 더 강하게 산란된다.",
                status:"VERIFIED",
                evidence:[{source_type:"WEB",source_url:"https://example.org/sky",title:"Runtime Evidence",excerpt:"verified runtime probe"}]
              }],
              unresolved:[]
            }
          };
        }
      };
      const verifiedAsk=await window.SnapPopIntelligence.ask({input:"왜 하늘이 파래?",language:"ko",context:"GLOBAL"});
      assert("ask-verified-runtime-is-understand",verifiedAsk?.kind==="ASK_UNDERSTAND"&&verifiedAsk?.verified===true);
      assert("ask-verified-runtime-has-full-coverage",verifiedAsk?.verification?.coverage==="FULL_FACTUAL_CONTENT"&&verifiedAsk?.verification?.verifiedClaimCount===1);
      assert("ask-verified-response-owner-is-crew",verifiedAsk?.responseOwner==="EXPLORATION_CREW");
      assert("ask-verified-followup-only-after-full-coverage",verifiedAsk?.understanding?.followUpAvailable===true);

      window.SnapPopKnowledgeBackend={
        async ask(){
          return {
            kind:"ASK_UNDERSTAND",
            intent:"ASK_UNDERSTAND",
            title:"아직 확인 중",
            core:"확인되지 않은 부분이 남아 있어.",
            provider:"runtime-partial-backend",
            verification:{
              mode:"CLAIM_EVIDENCE",
              coverage:"PARTIAL",
              claims:[{
                claim:"일부 주장",
                status:"VERIFIED",
                evidence:[{source_type:"WEB",source_url:"https://example.org/partial",title:"Partial Evidence"}]
              }],
              unresolved:["추가 확인 필요"]
            }
          };
        }
      };
      const partialAsk=await window.SnapPopIntelligence.ask({input:"왜 그런 일이 생겼어?",language:"ko",context:"GLOBAL"});
      assert("ask-partial-runtime-stays-unverified",partialAsk?.kind==="ASK_UNDERSTAND"&&partialAsk?.verified===false);
      assert("ask-partial-runtime-blocks-followup",partialAsk?.understanding?.followUpAvailable===false);
      assert("ask-partial-runtime-keeps-crew-owner",partialAsk?.responseOwner==="EXPLORATION_CREW");
      window.SnapPopKnowledgeBackend=originalKnowledgeBackend;
      window.SnapPopOpenAIProvider=originalUniversalOpenAIProvider;
      window.SnapPopKnowledge=originalKnowledgeRuntime;

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
      await crewRuntime.synthesizeCrewWorldState();
      let runtimeRegistry=await window.SnapPopStorage.get("crewRegistry")||{};
      let runtimeMainId=Object.keys(runtimeRegistry).find(id=>runtimeRegistry[id]?.worldState?.state==="MAIN_COMPANION")||Object.keys(runtimeRegistry)[0];
      assert("crew-runtime-main-id-present",!!runtimeMainId&&runtimeRegistry[runtimeMainId]?.memberId===runtimeMainId);

      const reunionEventId="reunion_"+runtimeMainId+"_"+new Date().toISOString().slice(0,10);
      runtimeRegistry[runtimeMainId].lastMetAt=new Date(Date.now()-4*86400000).toISOString();
      runtimeRegistry[runtimeMainId].memories=(runtimeRegistry[runtimeMainId].memories||[]).filter(m=>m.eventId!==reunionEventId);
      runtimeRegistry[runtimeMainId].worldState={state:"AT_HUB",generatedAt:new Date().toISOString(),synthetic:true};
      await window.SnapPopStorage.set("crewRegistry",runtimeRegistry);
      const returnedMainState=await crewRuntime.synthesizeCrewWorldState();
      runtimeRegistry=await window.SnapPopStorage.get("crewRegistry")||{};
      assert("crew-world-return-restores-main-companion",returnedMainState?.state==="MAIN_COMPANION"&&runtimeRegistry[runtimeMainId]?.worldState?.state==="MAIN_COMPANION");
      assert("crew-world-return-records-reunion-memory",(runtimeRegistry[runtimeMainId]?.memories||[]).some(m=>m.type==="REUNION"&&m.eventId===reunionEventId&&m.daysAway>=2));

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

      const originalVoiceRuntime=window.SnapPopVoice;
      const voiceCalls=[];
      window.SnapPopVoice={
        async speak(text,options={}){voiceCalls.push({kind:"speak",text,source:options.source||null});return {ok:true}},
        async listen(options={}){voiceCalls.push({kind:"listen",source:options.source||null});options.onStart?.();options.onEnd?.();return {ok:true}}
      };
      click(document.querySelector("#listenBtn"),"writing-listen-question");
      await wait(80);
      assert("writing-listen-uses-speak-only",voiceCalls.some(x=>x.kind==="speak")&&!voiceCalls.some(x=>x.kind==="listen"));
      voiceCalls.length=0;
      click(document.querySelector("#voiceBtn"),"writing-voice-input");
      await wait(80);
      assert("writing-voice-input-uses-listen-only",voiceCalls.some(x=>x.kind==="listen"&&x.source==="USER_MIC")&&!voiceCalls.some(x=>x.kind==="speak"));
      window.SnapPopVoice=originalVoiceRuntime;
      reactionOverlay.hidden=true;
      reactionOverlay.textContent="";

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

      const badgeLoaded=await window.SnapPopBadges.load();
      assert("badge-working-catalog-has-sixty-drafts",badgeLoaded?.catalog?.status==="WORKING_DRAFT_NOT_ACTIVE"&&badgeLoaded.catalog.items?.length===60);
      assert("badge-working-catalog-has-no-active-items",window.SnapPopBadges.activeItems().length===0);
      const badgeObservation=window.SnapPopBadgeBehavior.normalize({
        eventId:"runtime_badge_help",
        family:"HELP_REQUEST",
        source:"RUNTIME_SELFTEST",
        payload:{explicitChildAction:true}
      });
      assert("badge-observation-is-observation-only",badgeObservation.disposition==="OBSERVATION_ONLY"&&badgeObservation.badgeAwardAuthorized===false&&badgeObservation.penaltyAllowed===false);
      const sharedBadgeEvent=window.TakyBadgeExperienceContract.fromSnapObservation(badgeObservation);
      assert("badge-shared-envelope-has-no-economy-authority",sharedBadgeEvent.badge_award_authorized===false&&sharedBadgeEvent.economy_mutation_authorized===false);
      assert("badge-shared-envelope-keeps-app-owned-identity",sharedBadgeEvent.identity_scope==="APP_OWNED_NOT_SHARED"&&sharedBadgeEvent.role_scope==="APP_OWNED_NOT_SHARED"&&sharedBadgeEvent.permission_scope==="APP_OWNED_NOT_SHARED");

      const badgeCandidate=window.SnapPopBadgeCandidate.propose({
        id:"runtime_candidate",
        title:"런타임 후보",
        families:["HELP_REQUEST"],
        evidenceEventIds:["runtime_badge_help"],
        reason:"runtime review-only check"
      });
      assert("badge-candidate-is-review-only",badgeCandidate.status==="REVIEW_REQUIRED"&&badgeCandidate.active===false&&badgeCandidate.awardAuthorized===false&&badgeCandidate.autoCatalogInsertAllowed===false&&badgeCandidate.autoTriggerActivationAllowed===false);

      const p1=window.SnapPopBadges.progressFromCount(1),p5=window.SnapPopBadges.progressFromCount(5),p6=window.SnapPopBadges.progressFromCount(6),p25=window.SnapPopBadges.progressFromCount(25);
      assert("badge-five-tier-progression-runtime",p1.tier==="GREEN"&&p5.tier==="GREEN"&&p6.tier==="BLUE"&&p25.tier==="PLATINUM");
      assert("badge-stars-clamped-one-to-five-runtime",p1.stars===1&&p5.stars===5&&window.SnapPopBadgeVisual.starSlots(3).filter(x=>x.active).length===3);

      const runtimeIdentity={profile:{name:"런타임 탐험가",photo:""}};
      const theme=window.SnapPopBadgeThemeExpression.normalize({themeId:"EXPLORATION",assetState:"UNRESOLVED"});
      const composed=window.SnapPopBadgeThemeExpression.compose(runtimeIdentity,{themeId:"EXPLORATION",assetState:"UNRESOLVED"});
      assert("badge-theme-is-cosmetic-only",theme.cosmeticOnly===true&&theme.identityMutationAllowed===false&&theme.growthMutationAllowed===false&&theme.economyMutationAllowed===false&&theme.awardMutationAllowed===false&&theme.powerMutationAllowed===false);
      assert("badge-theme-keeps-identity-stable",composed.identity===runtimeIdentity&&composed.identityStable===true&&composed.powerEffect===null&&composed.rewardEffect===null&&composed.economyEffect===null);

      const visual=window.SnapPopBadgeVisual.model({title:"런타임 미리보기",identity:runtimeIdentity,tier:"GOLD",stars:4,themeExpression:{themeId:"EXPLORATION",assetState:"UNRESOLVED"}});
      assert("badge-visual-is-preview-only",visual.shape==="CIRCLE"&&visual.illustration==="HAND_DRAWN_PASTEL"&&visual.growthAdornment==="FIVE_GEM_STARS_UPPER_SEMICIRCLE"&&visual.awardState==="PREVIEW_ONLY"&&visual.badgeAwarded===false);
      assert("badge-visual-composes-common-identity-theme-growth-layers",visual.composition.commonBadgeArt===true&&visual.composition.childIdentityLayer===true&&visual.composition.themeExpressionLayer===true&&visual.composition.badgeGrowthLayer===true&&visual.identity.name==="런타임 탐험가");
      assert("growth-badge-preview-is-not-award",!!document.querySelector("#badgePreviewVisual .badgeMedallion")&&document.querySelector("#badgePreviewVisual")?.textContent?.includes("획득/수여 아님")===true);

      let workingActivationBlocked=false;
      try{window.SnapPopBadgeCatalogGuard.validateCatalog({status:"WORKING_DRAFT_NOT_ACTIVE",items:[{id:"x",status:"WORKING_DRAFT",active:true}]})}catch{workingActivationBlocked=true}
      assert("badge-working-draft-activation-fails-closed",workingActivationBlocked===true&&window.SnapPopBadgeCatalogGuard.canActivate(badgeLoaded.catalog.items[0],badgeLoaded.catalog)===false);

      const evidenceContract=window.SnapPopBadgeEvidenceContract;
      const errorEvidence=evidenceContract.verify("ERROR_DISCOVERY",{explicitChildAction:true,evidenceRef:"runtime_error",sourceContractId:"SNAP_POP_CHILD_SELF_CORRECTION_V1",errorMarkedByChild:true,beforeArtifactRef:"before",afterArtifactRef:"after"});
      const thinkEvidence=evidenceContract.verify("DEEP_THINKING",{explicitChildAction:true,evidenceRef:"runtime_think",sourceContractId:"SNAP_POP_CHILD_REFLECTION_ARTIFACT_V1",childChoseToReflect:true,reflectionArtifactRef:"reflection"});
      const specialEvidence=evidenceContract.verify("SPECIAL_BEHAVIOR",{explicitChildAction:true,evidenceRef:"runtime_special",sourceContractId:"SNAP_POP_DECLARED_SPECIAL_ACTION_V1",declaredByFeature:true,featureContractId:"SNAP_POP_SPECIAL_EXPLORATION_V1",behaviorCode:"SPECIAL_EXPLORATION_COMPLETED"},{allowedFeatureContracts:["SNAP_POP_SPECIAL_EXPLORATION_V1"],allowedSpecialBehaviorCodes:["SPECIAL_EXPLORATION_COMPLETED"]});
      assert("badge-strong-behavior-families-require-explicit-evidence",errorEvidence.explicitChildAction===true&&thinkEvidence.explicitChildAction===true&&specialEvidence.explicitChildAction===true);
      let weakProxyBlocked=false;
      try{evidenceContract.verify("DEEP_THINKING",{explicitChildAction:true,evidenceRef:"weak",sourceContractId:"SNAP_POP_CHILD_REFLECTION_ARTIFACT_V1",childChoseToReflect:true,reflectionArtifactRef:"r",elapsedMs:9999})}catch{weakProxyBlocked=true}
      assert("badge-weak-proxy-evidence-is-blocked",weakProxyBlocked===true);

      click(document.querySelector("#resultBack"),"result-back-map");
      await wait(120);
      assert("map-restored-after-result",document.querySelector("#map")?.classList.contains("active")===true);
      assert("imagination-hidden-by-default",document.querySelector("#imaginationLayer")?.hidden===true);
      click(document.querySelector("#homeRadio"),"home-radio");
      await wait(120);
      assert("home-radio-opens-imagination",document.querySelector("#imaginationLayer")?.hidden===false);

      const originalImaginationKnowledgeBackend=window.SnapPopKnowledgeBackend;
      window.SnapPopKnowledgeBackend={
        async ask(){
          return {
            kind:"ASK_UNDERSTAND",
            intent:"ASK_UNDERSTAND",
            title:"왜 하늘이 파랄까?",
            core:"확인된 근거를 바탕으로 원인과 과정을 나눠 볼 수 있어.",
            provider:"runtime-ui-verified-backend",
            verification:{
              mode:"CLAIM_EVIDENCE",
              coverage:"FULL_FACTUAL_CONTENT",
              claims:[
                {claim:"햇빛은 여러 파장의 가시광을 포함한다.",status:"VERIFIED",evidence:[{source_type:"WEB",source_url:"https://example.org/light",title:"Light"}]},
                {claim:"대기 분자는 짧은 파장의 빛을 더 강하게 산란시킨다.",status:"VERIFIED",evidence:[{source_type:"WEB",source_url:"https://example.org/scatter",title:"Scatter"}]},
                {claim:"여러 방향에서 산란된 파란빛이 관찰자의 눈에 많이 들어온다.",status:"VERIFIED",evidence:[{source_type:"WEB",source_url:"https://example.org/sky",title:"Sky"}]}
              ],
              unresolved:[]
            }
          };
        }
      };
      document.querySelector("#imaginationInput").value="왜 하늘이 파래?";
      click(document.querySelector("#imaginationAskBtn"),"imagination-verified-ask");
      assert("imagination-verified-answer-rendered",await waitFor(()=>document.querySelector("#imaginationAnswer")?.hidden===false&&document.querySelector("#imaginationAnswer")?.textContent?.includes("확인 완료"),2500,25));
      assert("imagination-full-verified-allows-expression-transition",!!document.querySelector("#imaginationAnswer .cloudExpressBtn"));
      assert("imagination-verified-mental-model-renders",document.querySelectorAll("#imaginationAnswer .mentalStep").length>=2);
      assert("imagination-verified-mental-model-is-flow",!!document.querySelector("#imaginationAnswer .mentalModelFLOW"));

      window.SnapPopKnowledgeBackend={
        async ask(){
          return {
            kind:"ASK_UNDERSTAND",
            intent:"ASK_UNDERSTAND",
            title:"아직 확인 중",
            core:"확인되지 않은 부분이 남아 있어.",
            provider:"runtime-ui-partial-backend",
            verification:{
              mode:"CLAIM_EVIDENCE",
              coverage:"PARTIAL",
              claims:[{claim:"일부 확인된 주장",status:"VERIFIED",evidence:[{source_type:"WEB",source_url:"https://example.org/partial",title:"Partial"}]}],
              unresolved:["추가 확인 필요"]
            }
          };
        }
      };
      document.querySelector("#imaginationInput").value="왜 그런 일이 생겼어?";
      click(document.querySelector("#imaginationAskBtn"),"imagination-partial-ask");
      assert("imagination-partial-answer-rendered",await waitFor(()=>document.querySelector("#imaginationAnswer")?.hidden===false&&document.querySelector("#imaginationAnswer")?.textContent?.includes("일부 근거 확인"),2500,25));
      assert("imagination-partial-blocks-expression-transition",!document.querySelector("#imaginationAnswer .cloudExpressBtn"));
      assert("imagination-partial-blocks-structural-flow-model",!document.querySelector("#imaginationAnswer .mentalModelFLOW"));
      window.SnapPopKnowledgeBackend=originalImaginationKnowledgeBackend;

      const originalCloudVoice=window.SnapPopVoice;
      const cloudVoiceCalls=[];
      window.SnapPopVoice={
        async speak(text,options={}){cloudVoiceCalls.push({kind:"speak",source:options.source||null});return {ok:true}},
        async listen(options={}){cloudVoiceCalls.push({kind:"listen",source:options.source||null});options.onStart?.();options.onEnd?.();return {ok:true}}
      };
      click(document.querySelector("#imaginationVoiceBtn"),"home-radio-voice-question");
      await wait(80);
      assert("home-radio-voice-question-uses-user-mic",cloudVoiceCalls.some(x=>x.kind==="listen"&&x.source==="USER_MIC"));
      assert("home-radio-voice-question-does-not-use-speak",!cloudVoiceCalls.some(x=>x.kind==="speak"));
      window.SnapPopVoice=originalCloudVoice;
      click(document.querySelector("#imaginationClose"),"home-radio-close");
      await wait(120);
      assert("home-radio-close-restores-map",document.querySelector("#imaginationLayer")?.hidden===true&&document.querySelector("#map")?.classList.contains("active")===true);

      const identityBeforeRename=await window.SnapPopStorage.get("identityFallback");
      const registryBeforeRename=await window.SnapPopStorage.get("crewRegistry")||{};
      const mainMemberId=identityBeforeRename?.crewMember?.type||Object.keys(registryBeforeRename)[0];
      const mainEntryBefore=JSON.parse(JSON.stringify(registryBeforeRename[mainMemberId]||{}));
      click(document.querySelector("#settingsBtn"),"settings-open-for-crew-rename");
      await wait(120);
      click(document.querySelector("#crewMemberBtn"),"crew-member-panel-open");
      await wait(100);
      const crewNameInput=document.querySelector("#crewMemberName");
      const runtimeRenamed=(mainEntryBefore.currentName||mainEntryBefore.firstName||"탐험대원")+"-런타임";
      crewNameInput.value=runtimeRenamed;
      click(document.querySelector("#crewMemberSave"),"crew-member-rename-save");
      await wait(180);
      const identityAfterRename=await window.SnapPopStorage.get("identityFallback");
      const registryAfterRename=await window.SnapPopStorage.get("crewRegistry")||{};
      const renamedEntry=registryAfterRename[mainMemberId];
      assert("crew-explorer-id-stable-after-rename",identityAfterRename?.crewMember?.type===mainMemberId&&renamedEntry?.memberId===mainMemberId);
      assert("crew-name-history-appended",renamedEntry?.currentName===runtimeRenamed&&Array.isArray(renamedEntry?.nameHistory)&&renamedEntry.nameHistory.some(x=>x.to===runtimeRenamed));
      assert("crew-relationship-memory-preserved-after-rename",
        JSON.stringify(renamedEntry?.memories||[])===JSON.stringify(mainEntryBefore.memories||[])&&
        JSON.stringify(renamedEntry?.affinity||{})===JSON.stringify(mainEntryBefore.affinity||{})
      );
      await window.SnapPopStorage.setMany([
        ["identityFallback",identityBeforeRename],
        ["crewRegistry",registryBeforeRename]
      ]);
      click(document.querySelector("#settingsBack"),"settings-back-after-crew-rename");
      await wait(120);

      const guestMainBefore=(await window.SnapPopStorage.get("identityFallback"))?.crewMember?.type;
      await window.SnapPopStorage.set("activeCrewGuestTrigger",{scene:"SPECIAL_EXPLORATION",authorized:true});
      click(document.querySelector("#specialInvite"),"authorized-special-open");
      await wait(180);
      const guestPresence=document.querySelector("#specialCrewPresence");
      const appearedGuestId=guestPresence?.dataset?.memberId||"";
      assert("authorized-special-guest-appears",guestPresence?.hidden===false&&!!appearedGuestId&&appearedGuestId!==guestMainBefore);
      assert("authorized-guest-keeps-main-identity",(await window.SnapPopStorage.get("identityFallback"))?.crewMember?.type===guestMainBefore);
      assert("authorized-guest-trigger-consumed",(await window.SnapPopStorage.get("activeCrewGuestTrigger"))==null);
      click(document.querySelector("#specialLater"),"authorized-special-skip");
      await wait(120);

      const specialSnapshot={
        exp:await window.SnapPopStorage.get("exp"),
        gems:JSON.stringify(await window.SnapPopStorage.get("gems")||{}),
        records:JSON.stringify(await window.SnapPopStorage.get("records")||[]),
        memories:JSON.stringify(await window.SnapPopStorage.get("specialMemories")||[])
      };
      click(document.querySelector("#specialInvite"),"special-open");
      await wait(160);
      assert("special-view-opens-explicitly",document.querySelector("#special")?.classList.contains("active")===true);
      click(document.querySelector("#specialLater"),"special-skip");
      await wait(140);
      assert("special-skip-returns-map",document.querySelector("#map")?.classList.contains("active")===true);
      assert("special-skip-does-not-change-exp",(await window.SnapPopStorage.get("exp"))===specialSnapshot.exp);
      assert("special-skip-does-not-change-gems",JSON.stringify(await window.SnapPopStorage.get("gems")||{})===specialSnapshot.gems);
      assert("special-skip-does-not-add-records",JSON.stringify(await window.SnapPopStorage.get("records")||[])===specialSnapshot.records);
      assert("special-skip-does-not-add-memory",JSON.stringify(await window.SnapPopStorage.get("specialMemories")||[])===specialSnapshot.memories);

      const wishSnapshot={
        gems:await window.SnapPopStorage.get("gems")||{},
        gemLedger:await window.SnapPopStorage.get("gemLedger")||[],
        wishTransactions:await window.SnapPopStorage.get("wishTransactions")||[]
      };
      const seededGems={...wishSnapshot.gems,idea:12};
      await window.SnapPopStorage.set("gems",seededGems);
      click(document.querySelector('#nav button[data-view="gems"]'),"gems-nav");
      await wait(160);
      click(document.querySelector("#shopBtn"),"wish-shop-open");
      await wait(120);
      click(document.querySelector("#useWish"),"wish-open-confirm");
      await wait(80);
      assert("wish-confirmation-is-explicit",document.querySelector("#blessing")?.hidden===false);
      click(document.querySelector("#confirmBlessing"),"wish-confirm");
      await wait(220);
      const wishGems=await window.SnapPopStorage.get("gems")||{};
      const wishTxns=await window.SnapPopStorage.get("wishTransactions")||[];
      const wishLedger=await window.SnapPopStorage.get("gemLedger")||[];
      const newWish=wishTxns.slice(wishSnapshot.wishTransactions.length).find(x=>x.status==="COMPLETED");
      assert("wish-spends-exactly-two-complete-gems",(wishGems.idea||0)===0);
      assert("wish-transaction-recorded",!!newWish&&newWish.completedGemCount===2);
      assert("wish-spend-ledger-recorded",wishLedger.slice(wishSnapshot.gemLedger.length).some(x=>x.type==="GEM_SPENT"&&x.sourceShards===-12));
      await window.SnapPopStorage.setMany([
        ["gems",wishSnapshot.gems],
        ["gemLedger",wishSnapshot.gemLedger],
        ["wishTransactions",wishSnapshot.wishTransactions]
      ]);
      assert("wish-test-state-restored",JSON.stringify(await window.SnapPopStorage.get("gems")||{})===JSON.stringify(wishSnapshot.gems));

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
