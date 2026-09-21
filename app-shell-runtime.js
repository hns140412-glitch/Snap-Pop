(() => {
  "use strict";
  const one=q=>document.querySelector(q);
  const all=q=>[...document.querySelectorAll(q)];
  const SUB_VIEWS=new Set(["settings","shop","result","special","recordEdit","familyExpansion"]);

  function escapeHtml(value){
    return String(value||"").replace(/[&<>"']/g,c=>({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    }[c]));
  }

  function toast(message,{duration=1800}={}){
    const el=one("#toast");
    if(!el)return;
    el.textContent=message;
    el.classList.add("show");
    clearTimeout(window.__snapToastTimer);
    window.__snapToastTimer=setTimeout(()=>el.classList.remove("show"),duration);
  }

  function activateView(id){
    const target=one("#"+id);
    if(!target)throw new Error("SNAP_VIEW_NOT_FOUND:"+id);
    all(".view").forEach(v=>v.classList.remove("active"));
    target.classList.add("active");

    const isSub=SUB_VIEWS.has(id);
    const nav=one("#nav");
    if(nav)nav.hidden=isSub;
    if(!isSub){
      all(".nav button").forEach(b=>b.classList.toggle("on",b.dataset.view===id));
    }
    window.scrollTo(0,0);
    return Object.freeze({id,isSub,isMain:!isSub});
  }

  window.SnapPopUIShell=Object.freeze({
    contract:"SNAP_POP_UI_SHELL_V1",
    escapeHtml,
    toast,
    activateView,
    isSubView:id=>SUB_VIEWS.has(id)
  });
})();
