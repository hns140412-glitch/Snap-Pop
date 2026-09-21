(() => {
  "use strict";

  const VERSION="2026.09.21-a";
  const TIERS=["GREEN","BLUE","RED","GOLD","PLATINUM"];

  function clean(value,max=120){
    return typeof value==="string"?value.trim().slice(0,max):"";
  }

  function normalizeTier(tier="GREEN"){
    const key=clean(tier,24).toUpperCase();
    return TIERS.includes(key)?key:"GREEN";
  }

  function normalizeStars(stars=1){
    const n=Math.floor(Number(stars)||0);
    return Math.min(5,Math.max(1,n||1));
  }

  function model({
    title="경험 배지 미리보기",
    theme="EXPLORATION",
    tier="GREEN",
    stars=1,
    identity={},
    themeExpression=null
  }={}){
    const profile=identity?.profile||{};
    const themeLayer=themeExpression&&window.SnapPopBadgeThemeExpression
      ?window.SnapPopBadgeThemeExpression.normalize(themeExpression)
      :null;
    return Object.freeze({
      contract_version:"SNAP_POP_BADGE_VISUAL_V1",
      title:clean(title,80)||"경험 배지 미리보기",
      theme:themeLayer?.themeId||clean(theme,60)||"EXPLORATION",
      themeExpression:themeLayer,
      tier:normalizeTier(tier),
      stars:normalizeStars(stars),
      shape:"CIRCLE",
      illustration:"HAND_DRAWN_PASTEL",
      growthAdornment:"FIVE_GEM_STARS_UPPER_SEMICIRCLE",
      identity:{
        name:clean(profile.name,40)||"나의 탐험가",
        photo:clean(profile.photo,200000)||null,
        stable:true
      },
      composition:{
        commonBadgeArt:true,
        childIdentityLayer:true,
        themeExpressionLayer:true,
        badgeGrowthLayer:true
      },
      awardState:"PREVIEW_ONLY",
      badgeAwarded:false,
      catalogItemId:null
    });
  }

  function starSlots(stars=1){
    const count=normalizeStars(stars);
    return [0,1,2,3,4].map((index)=>({
      index,
      active:index<count
    }));
  }

  window.SnapPopBadgeVisual=Object.freeze({
    version:VERSION,
    tiers:Object.freeze([...TIERS]),
    model,
    starSlots
  });
})();