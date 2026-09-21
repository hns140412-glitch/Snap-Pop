import fs from "node:fs";
import vm from "node:vm";

const guardSource=fs.readFileSync(new URL("../badge-catalog-guard-runtime.js",import.meta.url),"utf8");
const badgeSource=fs.readFileSync(new URL("../badge-runtime.js",import.meta.url),"utf8");
const workingCatalog=JSON.parse(fs.readFileSync(new URL("../data/badge-catalog-working.json",import.meta.url),"utf8"));

const window={};
vm.runInNewContext(guardSource,{window,Object,Array,String,Number,Math,Error});
const guard=window.SnapPopBadgeCatalogGuard;

function assert(name,condition){
  if(!condition) throw new Error("FAIL "+name);
  console.log("PASS",name);
}

assert("current-working-catalog-valid",
  guard.validateCatalog(workingCatalog)===true
);
assert("working-catalog-cannot-activate-items",
  workingCatalog.items.every(item=>guard.canActivate(item,workingCatalog)===false)
);

let blocked=false;
try{
  guard.validateCatalog({
    status:"WORKING_DRAFT_NOT_ACTIVE",
    items:[{id:"x",status:"WORKING_DRAFT",active:true}]
  });
}catch(error){
  blocked=error?.message==="BADGE_WORKING_DRAFT_ACTIVATION_FORBIDDEN";
}
assert("active-working-draft-fails-closed",blocked);

assert("reviewed-active-item-can-pass",
  guard.canActivate(
    {id:"reviewed",status:"CANONICAL_ACTIVE",active:true},
    {status:"ACTIVE_REVIEWED"}
  )===true
);

assert("badge-runtime-calls-catalog-validation",
  badgeSource.includes("guard.validateCatalog(catalog)")
);
assert("badge-runtime-active-items-use-guard",
  badgeSource.includes("guard.canActivate(x,catalog||{})")
);

console.log("BADGE_CATALOG_ACTIVATION_GUARD_PASS");
