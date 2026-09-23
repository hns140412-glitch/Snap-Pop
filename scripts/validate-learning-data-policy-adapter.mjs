import assert from "node:assert/strict";
import {createRequire} from "node:module";
const require=createRequire(import.meta.url);
const Adapter=require("../learning-data-policy-adapter.js");

const ok=Adapter.apply({
 decision:{policy_version:"2026-09-23.1",policy_id:"P-F06-SNAP",function_id:"LE-F06",consumer_app:"SNAP_POP",authorization_class:"CONDITIONAL",decision:"ALLOW_CONDITIONAL",cannot_claim:["GLOBAL_WRITING_ABILITY"]},
 truthVerified:true,
 childAuthored:true
});
assert.equal(ok.child_authored,true);
assert.ok(ok.policy.cannot_claim.includes("GLOBAL_WRITING_ABILITY"));

assert.throws(()=>Adapter.apply({decision:{policy_version:"2026-09-23.1",function_id:"LE-F06",consumer_app:"SNAP_POP",decision:"ALLOW_CONDITIONAL"},truthVerified:false,childAuthored:true}),/SNAP_TRUTH_GUARD_REQUIRED/);
assert.throws(()=>Adapter.apply({decision:{policy_version:"2026-09-23.1",function_id:"LE-F06",consumer_app:"SNAP_POP",decision:"ALLOW_CONDITIONAL"},truthVerified:true,childAuthored:false}),/SNAP_CHILD_AUTHORSHIP_REQUIRED/);
assert.throws(()=>Adapter.apply({decision:{policy_version:"2026-09-23.1",function_id:"LE-H01",consumer_app:"SNAP_POP",decision:"DENY",reason:"DENY_HOLD"},truthVerified:true,childAuthored:true}),/DENY_HOLD/);

console.log("SNAP_LEARNING_DATA_POLICY_ADAPTER_PASS");
