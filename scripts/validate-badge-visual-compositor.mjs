import fs from "node:fs";
import vm from "node:vm";

const runtime=fs.readFileSync(new URL("../badge-visual-runtime.js",import.meta.url),"utf8");
const index=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const css=fs.readFileSync(new URL("../styles.css",import.meta.url),"utf8");
const app=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");

const window={};
vm.runInNewContext(runtime,{window,Object,Array,String,Number,Math,Set});
const visual=window.SnapPopBadgeVisual;

function assert(name,condition){
  if(!condition) throw new Error("FAIL "+name);
  console.log("PASS",name);
}

const identity={profile:{name:"민서",photo:"data:image/png;base64,abc"}};
const a=visual.model({title:"탐험",theme:"A",tier:"BLUE",stars:3,identity});
const b=visual.model({title:"탐험",theme:"B",tier:"GOLD",stars:5,identity});

assert("five-tier-model",visual.tiers.join(",")==="GREEN,BLUE,RED,GOLD,PLATINUM");
assert("stars-clamped-one-to-five",
  visual.starSlots(0).filter(x=>x.active).length===1&&
  visual.starSlots(7).filter(x=>x.active).length===5
);
assert("identity-stable-across-theme",
  a.identity.name===b.identity.name&&a.identity.photo===b.identity.photo&&
  a.identity.stable===true&&b.identity.stable===true
);
assert("composition-has-three-layers",
  a.composition.commonBadgeArt===true&&
  a.composition.childIdentityLayer===true&&
  a.composition.badgeGrowthLayer===true
);
assert("preview-never-awards-badge",
  a.awardState==="PREVIEW_ONLY"&&a.badgeAwarded===false&&a.catalogItemId===null
);
assert("preview-surface-explicitly-not-owned",
  index.includes('id="badgePreview"')&&
  index.includes("획득 배지 아님")
);
assert("circle-pastel-visual-contract",
  a.shape==="CIRCLE"&&a.illustration==="HAND_DRAWN_PASTEL"&&
  css.includes(".badgeMedallion")&&css.includes("border-radius:50%")
);
assert("upper-semicircle-five-gem-stars",
  a.growthAdornment==="FIVE_GEM_STARS_UPPER_SEMICIRCLE"&&
  css.includes(".badgeGemArc")&&
  css.includes("nth-child(5)")
);
assert("profile-character-rendered-as-identity-layer",
  app.includes("model.identity.photo")&&
  app.includes("badgeIdentity")
);
assert("growth-view-renders-preview-not-catalog-award",
  app.includes("async function renderBadgePreview()")&&
  app.includes("획득/수여 아님")&&
  !app.includes("badgeAwarded=true")
);

console.log("BADGE_VISUAL_LAYER_COMPOSITOR_PASS");
