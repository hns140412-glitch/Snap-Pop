(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports) module.exports=api;
  if(root) root.SnapReviewedVisualBinding=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const VERSION='SP_BADGE_008_REVIEWED_VISUAL_BINDING_V1';
  const WORLD_BINDING=Object.freeze({
    world_state:'BASE_WORLD',
    theme_expression:'GOLDEN_WORLD',
    runtime_asset:'assets/world/golden_world_scene.jpg',
    review_source:'docs/UI_REVIEW_REV10.md',
    lineage_source:'assets/reference/approved_visual_source.png',
    review_status:'REVIEWED_RUNTIME_CANDIDATE',
    release_pass:false,
    replacement_rule:'REPLACE_ONLY_WITH_REVIEWED_CLEAN_WORLD_SOURCE'
  });
  const CREW_BINDING=Object.freeze({
    crew_visual:'STATIC_REFERENCE_LINEAGE_ONLY',
    runtime_asset:null,
    review_status:'HOLD_NO_APPROVED_INDIVIDUAL_ASSET',
    dynamic_binding_allowed:false
  });
  const FORBIDDEN_DIRECT_RUNTIME_ASSETS=Object.freeze([
    'assets/reference/approved_visual_source.png',
    'assets/rewards/gem_chest_reference_hd.jpg',
    'assets/rewards/wish_shop_reference_hd.jpg'
  ]);

  function normalizePath(value=''){
    try{
      const url=new URL(value,globalThis.location?.href||'https://snap.invalid/');
      return url.pathname.replace(/^\//,'');
    }catch{return String(value||'').replace(/^\.\//,'').replace(/^\//,'');}
  }

  function resolve(input={}){
    const world_state=String(input.world_state||'').trim();
    const theme_expression=String(input.theme_expression||'').trim();
    const crew_visual=String(input.crew_visual||'').trim();

    if(world_state&&world_state!==WORLD_BINDING.world_state){
      return {ok:false,reason:'WORLD_STATE_NOT_REVIEWED',world_state};
    }
    if(theme_expression&&theme_expression!==WORLD_BINDING.theme_expression){
      return {ok:false,reason:'THEME_EXPRESSION_NOT_REVIEWED',theme_expression};
    }
    if(crew_visual&&crew_visual!==CREW_BINDING.crew_visual){
      return {ok:false,reason:'CREW_VISUAL_REQUIRES_REVIEWED_ASSET',crew_visual};
    }
    return {
      ok:true,
      version:VERSION,
      world:{...WORLD_BINDING},
      crew:{...CREW_BINDING},
      guards:{
        reference_board_direct_binding:false,
        reward_reference_direct_binding:false,
        auto_asset_promotion:false,
        auto_release_pass:false
      }
    };
  }

  function bind(rootNode){
    const doc=rootNode||globalThis.document;
    const scene=doc?.querySelector?.('.mapWorld .scene');
    if(!scene)return {ok:false,reason:'WORLD_SCENE_NODE_MISSING'};
    const actual=normalizePath(scene.getAttribute('src')||scene.src||'');
    if(FORBIDDEN_DIRECT_RUNTIME_ASSETS.includes(actual)){
      return {ok:false,reason:'REFERENCE_ASSET_DIRECT_BINDING_FORBIDDEN',actual};
    }
    if(actual!==WORLD_BINDING.runtime_asset){
      return {ok:false,reason:'UNREVIEWED_WORLD_ASSET',actual,expected:WORLD_BINDING.runtime_asset};
    }
    scene.dataset.visualBinding=VERSION;
    scene.dataset.reviewStatus=WORLD_BINDING.review_status;
    scene.dataset.releasePass='false';
    if(doc.documentElement){
      doc.documentElement.dataset.snapWorldVisual=WORLD_BINDING.review_status;
      doc.documentElement.dataset.snapCrewVisual=CREW_BINDING.review_status;
    }
    return resolve({
      world_state:WORLD_BINDING.world_state,
      theme_expression:WORLD_BINDING.theme_expression,
      crew_visual:CREW_BINDING.crew_visual
    });
  }

  if(typeof document!=='undefined'){
    const run=()=>bind(document);
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});
    else run();
  }

  return Object.freeze({
    VERSION,
    WORLD_BINDING,
    CREW_BINDING,
    FORBIDDEN_DIRECT_RUNTIME_ASSETS,
    resolve,
    bind
  });
});
