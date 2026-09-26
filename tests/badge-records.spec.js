const {test,expect}=require('@playwright/test');
test('Snap records tabs show truthful unconnected state and never mint local badges',async({page})=>{
  await page.goto('http://127.0.0.1:4173/');
  await page.locator('#nav [data-view="records"]').click();
  await expect(page.locator('#recordJournalPanel')).toBeVisible();
  await page.locator('[data-record-mode="collection"]').click();
  await expect(page.locator('#badgeCollectionPanel')).toBeVisible();
  await expect(page.locator('#badgeCollectionItems')).toContainText('서버 연결 전');
  await expect(page.locator('.badgeCollectionItem')).toHaveCount(0);
  await page.locator('[data-record-mode="calendar"]').click();
  await expect(page.locator('#badgeCalendarGrid')).toContainText('서버 연결 전');
  await expect(page.locator('.badgeCalendarCell')).toHaveCount(0);
  expect(await page.evaluate(()=>SnapBadgeRecordUI.connectReadAdapter({}))).toEqual({
    ok:false,reason:'TRUSTED_SERVER_READ_ADAPTER_REQUIRED'
  });
});
test('Test-only verified view adapter opens approved collection, month day and full badge timeline',async({page})=>{
  await page.goto('http://127.0.0.1:4173/');
  await page.locator('#nav [data-view="records"]').click();
  const ready=await page.evaluate(()=>SnapBadgeRecordUI.connectReadAdapter({
    contract:'TAKY_AUTHENTICATED_BADGE_READ_ADAPTER_V1',
    getViewer:async()=>({
      ok:true,contract:'TAKY_AUTHENTICATED_CHILD_BADGE_VIEWER_V1',
      authenticated:true,source:'NETLIFY_IDENTITY',role:'CHILD',
      family_id:'FAMILY_A',child_id:'CHILD_A'
    }),
    getCollection:async()=>({
      ok:true,contract:'TAKY_CHILD_APPROVED_BADGE_COLLECTION_V1',
      family_id:'FAMILY_A',child_id:'CHILD_A',
      items:[
       {badge_id:'APPROVED_A',title:'실수 청소부',active:true,approved:true,earned:true},
       {badge_id:'APPROVED_B',title:'그래도 출발',active:true,approved:true,earned:false}
      ]
    }),
    getMonth:async({month})=>{
      const [year,mon]=month.split('-').map(Number);
      const n=new Date(Date.UTC(year,mon,0)).getUTCDate();
      return {ok:true,contract:'TAKY_CHILD_BADGE_CALENDAR_V1',
       family_id:'FAMILY_A',child_id:'CHILD_A',time_zone:'Asia/Seoul',month,
       days:Array.from({length:n},(_,i)=>{
         const date=month+'-'+String(i+1).padStart(2,'0');
         const events=i===0?[{
            award_id:'TEST_APPROVED_A_1',badge_id:'APPROVED_A',
            badge_title:'실수 청소부',calendar_date:date,
            event_type:'FIRST_ACQUISITION',date_status:'VERIFIED_AWARD_TIME',
            awarded_at:date+'T01:00:00.000Z'
         }]:[];
         return {date,award_count:events.length,events};
       }),undated_history:[]};
    },
    getBadgeHistory:async({badge_id})=>({
      ok:true,contract:'TAKY_FAMILY_BADGE_DETAIL_HISTORY_V1',
      family_id:'FAMILY_A',child_id:'CHILD_A',badge_id,
      history:[{child_id:'CHILD_A',badge_id,award_id:'TEST_APPROVED_A_1',
        event_type:'FIRST_ACQUISITION',date_status:'VERIFIED_AWARD_TIME',
        awarded_at:'2026-09-26T01:00:00.000Z'}]
    })
  }));
  expect(ready.ok).toBe(true);
  await page.locator('[data-record-mode="collection"]').click();
  await expect(page.locator('.badgeCollectionItem')).toHaveCount(2);
  await expect(page.locator('.badgeHistoryOpen')).toHaveCount(1);
  await expect(page.locator('#badgeCollectionItems')).toContainText('실수 청소부');
  await page.locator('.badgeHistoryOpen').click();
  await expect(page.locator('#badgeDetailPanel')).toBeVisible();
  await expect(page.locator('#badgeDetailHistory')).toContainText('첫 획득');
  await page.locator('#badgeDetailBack').click();
  await expect(page.locator('#badgeCollectionPanel')).toBeVisible();
  await page.locator('[data-record-mode="calendar"]').click();
  await expect(page.locator('.badgeCalendarCell')).toHaveCount(28);
  // Month length is time-dependent; assert one verified day marker, not fabricated awards.
  await expect(page.locator('.badgeDayCount')).toHaveCount(1);
  await page.locator('.badgeCalendarCell').first().click();
  await expect(page.locator('#badgeCalendarDay')).toContainText('실수 청소부');
  await page.locator('#nav [data-view="map"]').click();
  await expect(page.locator('.badgeCollectionItem')).toHaveCount(0);
});
test('Forged viewer/scope fails closed and never renders other child award history',async({page})=>{
  await page.goto('http://127.0.0.1:4173/');
  await page.locator('#nav [data-view="records"]').click();
  await page.evaluate(()=>SnapBadgeRecordUI.connectReadAdapter({
    contract:'TAKY_AUTHENTICATED_BADGE_READ_ADAPTER_V1',
    getViewer:async()=>({ok:true,contract:'TAKY_AUTHENTICATED_CHILD_BADGE_VIEWER_V1',
      authenticated:true,source:'TEST_ONLY',role:'CHILD',family_id:'FAMILY_A',child_id:'CHILD_A'}),
    getCollection:async()=>({ok:true,contract:'TAKY_CHILD_APPROVED_BADGE_COLLECTION_V1',
      family_id:'FAMILY_A',child_id:'CHILD_A',items:[]}),
    getMonth:async()=>({ok:true}),
    getBadgeHistory:async()=>({ok:true})
  }));
  await page.locator('[data-record-mode="collection"]').click();
  await expect(page.locator('#badgeCollectionItems')).toContainText('인증된 아이의 배지 기록을 확인할 수 없어요');
  await expect(page.locator('.badgeCollectionItem')).toHaveCount(0);
});
