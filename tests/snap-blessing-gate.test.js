const assert=require('node:assert/strict');
const gate=require('../snap-blessing-gate.js');
const blessing={
  gate:{
    type:'ANY_OF_APPROVED_AWARDED_BADGES',
    candidate_badges:[{badge_id:'BDG-DRAFT-009',stable_name:'몰래 시작'}]
  }
};

assert.equal(gate.evaluate(blessing,{}).reason,'AWARD_LEDGER_NOT_VERIFIED');
assert.equal(gate.evaluate(blessing,{
  award_snapshot:{verified:true,badge_ids:['BDG-DRAFT-009']},
  approved_badge_bindings:[]
}).reason,'NO_APPROVED_RUNTIME_BADGE_BINDING');
assert.equal(gate.evaluate(blessing,{
  award_snapshot:{verified:true,badge_ids:[]},
  approved_badge_bindings:[{badge_id:'BDG-DRAFT-009',approved:true,runtime_active:true}]
}).reason,'REQUIRED_BADGE_NOT_AWARDED');
const ok=gate.evaluate(blessing,{
  award_snapshot:{verified:true,badge_ids:['BDG-DRAFT-009']},
  approved_badge_bindings:[{badge_id:'BDG-DRAFT-009',approved:true,runtime_active:true}]
});
assert.equal(ok.ok,true);
assert.deepEqual(ok.matched_badge_ids,['BDG-DRAFT-009']);
assert.equal(gate.evaluate({gate:{type:'NONE'}},{}).ok,true);
console.log('snap-blessing-gate: ok');