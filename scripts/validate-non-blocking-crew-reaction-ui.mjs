import fs from "node:fs";

const index=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const css=fs.readFileSync(new URL("../styles.css",import.meta.url),"utf8");
const app=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");

function assert(name,condition){
  if(!condition) throw new Error("FAIL "+name);
  console.log("PASS",name);
}

assert("reaction-slot-exists-and-hidden-by-default",
  index.includes('id="crewReactionOverlay"')&&
  index.includes('class="crewReactionOverlay" hidden')
);
assert("reaction-slot-is-live-region-not-input",
  index.includes('aria-live="polite"')&&
  !index.includes('<textarea id="crewReactionOverlay"')
);
assert("reaction-slot-non-blocking",
  /\.crewReactionOverlay\{[^}]*pointer-events:none/.test(css)
);
assert("reaction-slot-height-bounded",
  /\.crewReactionOverlay\{[^}]*max-height:86px[^}]*overflow:hidden/.test(css)
);
assert("reaction-slot-sits-after-main-textarea",
  index.indexOf('id="answer"')<index.indexOf('id="crewReactionOverlay"')
);
assert("reaction-is-hidden-when-cleared",
  app.includes('function hideCrewReaction(){')&&
  app.includes('box.hidden=true')
);
assert("reaction-auto-collapses-after-short-display",
  app.includes('setTimeout(()=>{box.classList.remove("show")},2200)')
);

console.log("NON_BLOCKING_CREW_REACTION_UI_PASS");
