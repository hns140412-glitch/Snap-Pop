const assert=require('node:assert/strict');
global.SnapPopBridge={context:()=>({child_id:'CHILD_A'})};
const bridge=require('../snap-badge-read-bridge-v01.js');

(async()=>{
  bridge.disconnect();
  let ctx=await bridge.resolveGateContext({candidate_badge_ids:['B1']});
  assert.equal(ctx.award_snapshot.verified,false);
  assert.equal(ctx.award_snapshot.reason,'BADGE_READ_ADAPTER_NOT_CONNECTED');

  assert.equal(bridge.connectReadAdapter({contract:'BAD'}).ok,false);

  const adapter={
    contract:bridge.ADAPTER,
    async getProgress({badge_id}){
      return {
        ok:true,contract:bridge.PROGRESS,family_id:'FAMILY_A',child_id:'CHILD_A',
        badge_id,checkpoint:'cp-'+badge_id,verified_awards:badge_id==='B1'?1:0,
        ownership_state:badge_id==='B1'?'EARNED':'LOCKED',
        state:badge_id==='B1'?{tier:'GREEN',star_count:0}:null,history:[]
      };
    },
    async getApprovedBindings({badge_ids}){
      return {ok:true,contract:bridge.BINDINGS,family_id:'FAMILY_A',child_id:'CHILD_A',
        bindings:badge_ids.map(badge_id=>({badge_id,approved:badge_id==='B1',runtime_active:badge_id==='B1'}))};
    }
  };
  assert.equal(bridge.connectReadAdapter(adapter).ok,true);
  ctx=await bridge.resolveGateContext({candidate_badge_ids:['B1','B2']});
  assert.equal(ctx.award_snapshot.verified,true);
  assert.deepEqual(ctx.award_snapshot.badge_ids,['B1']);
  assert.equal(ctx.approved_badge_bindings.find(x=>x.badge_id==='B1').runtime_active,true);
  assert.equal(ctx.approved_badge_bindings.find(x=>x.badge_id==='B2').runtime_active,false);

  bridge.connectReadAdapter({...adapter,async getProgress({badge_id}){return {
    ok:true,contract:bridge.PROGRESS,family_id:'FAMILY_A',child_id:'CHILD_B',
    badge_id,checkpoint:'cp',verified_awards:1,ownership_state:'EARNED',
    state:{tier:'GREEN',star_count:0},history:[]
  }}});
  ctx=await bridge.resolveGateContext({candidate_badge_ids:['B1']});
  assert.equal(ctx.award_snapshot.verified,false);
  assert.equal(ctx.award_snapshot.reason,'VERIFIED_BADGE_PROGRESS_CONTRACT_REQUIRED');

  bridge.connectReadAdapter({...adapter,async getApprovedBindings({badge_ids}){return {
    ok:true,contract:bridge.BINDINGS,family_id:'FAMILY_A',child_id:'CHILD_A',
    bindings:badge_ids.slice(0,1).map(badge_id=>({badge_id,approved:true,runtime_active:true}))
  }}});
  ctx=await bridge.resolveGateContext({candidate_badge_ids:['B1','B2']});
  assert.equal(ctx.award_snapshot.verified,false);
  assert.equal(ctx.award_snapshot.reason,'APPROVED_BADGE_BINDING_CONTRACT_REQUIRED');

  console.log('snap badge read bridge: ok');
})().catch(e=>{console.error(e);process.exitCode=1});