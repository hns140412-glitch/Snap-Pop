import fs from "node:fs";
import vm from "node:vm";

const themeSource=fs.readFileSync(new URL("../badge-theme-expression-runtime.js",import.meta.url),"utf8");
const visualSource=fs.readFileSync(new URL("../badge-visual-runtime.js",import.meta.url),"utf8");
const appSource=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
const indexSource=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const window={};
vm.runInNewContext(themeSource,{window,Object,Array,String,Number,Math,Error,RegExp,Set});
vm.runInNewContext(visualSource,{window,Object,Array,String,Number,Math,Error,RegExp,Set});
const theme=window.SnapPopBadgeThemeExpression;
const visual=window.SnapPopBadgeVisual;

function assert(name,condition){
  if(!condition) throw new Error("FAIL "+name);
  console.log("PASS",name);
}
function blocked(name,fn,code){
  let ok=false;
  try{fn()}catch(error){ok=error?.message===code}
  assert(name,ok);
}

const identity={profile:{name:"민서",photo:"data:image/png;base64,abc"}};
const unresolved=theme.normalize({themeId:"EXPLORATION",assetState:"UNRESOLVED"});
const reviewed=theme.normalize({themeId:"REVIEWED_THEME",assetState:"REVIEWED_ASSET_SET",assetRefs:["asset:badge/theme/reviewed-01"],poseRef:"pose:01",propRefs:["prop:01"]});
const a=visual.model({themeExpression:unresolved,tier:"GREEN",stars:1,identity});
const b=visual.model({themeExpression:reviewed,tier:"PLATINUM",stars:5,identity});

assert("identity-stable-across-theme-expression",a.identity.name===b.identity.name&&a.identity.photo===b.identity.photo&&a.identity.stable===true&&b.identity.stable===true);
assert("theme-expression-is-cosmetic-only",reviewed.cosmeticOnly===true&&reviewed.identityMutationAllowed===false&&reviewed.growthMutationAllowed===false&&reviewed.economyMutationAllowed===false&&reviewed.awardMutationAllowed===false&&reviewed.powerMutationAllowed===false);
assert("visual-composition-separates-theme-layer",a.composition.childIdentityLayer===true&&a.composition.themeExpressionLayer===true&&a.composition.badgeGrowthLayer===true);
assert("unresolved-assets-are-explicit-not-invented",unresolved.assetState==="UNRESOLVED"&&unresolved.assetRefs.length===0&&appSource.includes('assetState:"UNRESOLVED"')&&appSource.includes("테마 표현 자산 검토 전"));
assert("reviewed-assets-require-reference",reviewed.assetState==="REVIEWED_ASSET_SET"&&reviewed.assetRefs.length===1);
blocked("reviewed-theme-without-asset-ref-blocked",()=>theme.normalize({themeId:"X",assetState:"REVIEWED_ASSET_SET"}),"BADGE_THEME_EXPRESSION_REVIEWED_ASSET_REQUIRED");
blocked("identity-mutation-through-theme-blocked",()=>theme.normalize({themeId:"X",assetState:"UNRESOLVED",identity:{name:"other"}}),"BADGE_THEME_EXPRESSION_AUTHORITY_VIOLATION");
blocked("power-or-growth-mutation-through-theme-blocked",()=>theme.normalize({themeId:"X",assetState:"UNRESOLVED",power:2,tier:"GOLD"}),"BADGE_THEME_EXPRESSION_AUTHORITY_VIOLATION");
assert("theme-runtime-loaded-before-visual",indexSource.indexOf("badge-theme-expression-runtime.js")<indexSource.indexOf("badge-visual-runtime.js"));
assert("preview-still-not-award-authority",a.badgeAwarded===false&&a.awardState==="PREVIEW_ONLY"&&a.catalogItemId===null);

console.log("BADGE_THEME_EXPRESSION_CONTRACT_PASS");
