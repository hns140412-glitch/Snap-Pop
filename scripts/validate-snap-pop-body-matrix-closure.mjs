import fs from "node:fs";

const matrix=JSON.parse(fs.readFileSync(new URL("../data/snap-pop-requirement-matrix.json",import.meta.url),"utf8"));
const rows=matrix.requirements||[];
const byId=Object.fromEntries(rows.map(x=>[x.id,x]));

function assert(name,condition){
  if(!condition) throw new Error("FAIL "+name);
  console.log("PASS",name);
}

const unresolved=rows.filter(x=>x.coded!==true);
const bodyUnresolved=unresolved.filter(x=>x.domain!=="FAMILY_EXPANSION");
const familyUnresolved=unresolved.filter(x=>x.domain==="FAMILY_EXPANSION");

assert("snap-pop-body-has-no-coded-residue",bodyUnresolved.length===0);
assert("remaining-unimplemented-is-family-expansion-only",unresolved.length===familyUnresolved.length&&familyUnresolved.length===11);
assert("badge-006-coded-static-only",byId["SP-BADGE-006"].coded===true&&byId["SP-BADGE-006"].staticVerified===true&&byId["SP-BADGE-006"].runtimeVerified===false&&byId["SP-BADGE-006"].deviceVerified===false);
assert("badge-008-coded-static-only",byId["SP-BADGE-008"].coded===true&&byId["SP-BADGE-008"].staticVerified===true&&byId["SP-BADGE-008"].runtimeVerified===false&&byId["SP-BADGE-008"].deviceVerified===false);
assert("theme-assets-remain-explicitly-open",/UNRESOLVED|OPEN/i.test(byId["SP-BADGE-008"].gap||""));
assert("runtime-and-device-not-falsely-converged",rows.filter(x=>x.coded===true).every(x=>x.deviceVerified!==true));

console.log("SNAP_POP_BODY_MATRIX_CLOSURE_PASS");
