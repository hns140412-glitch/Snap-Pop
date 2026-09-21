import fs from "node:fs";

const app=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
const index=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");

function assert(name,condition){
  if(!condition) throw new Error("FAIL "+name);
  console.log("PASS",name);
}

const direct=[...app.matchAll(/\$\("#([^"]+)"\)\.(?:onclick|onchange|oninput|onkeydown|onsubmit)\s*=/g)].map(m=>m[1]);
const ids=new Set([...index.matchAll(/id="([^"]+)"/g)].map(m=>m[1]));
const missing=[...new Set(direct)].filter(id=>!ids.has(id));

assert("all-direct-dom-bindings-have-index-targets",missing.length===0);
assert("querySelector-collection-misuse-blocked",!/\$\([^\n;]+\)\.forEach\s*\(/.test(app));
assert("explicit-help-request-control-exists",ids.has("hintBtn"));
assert("hint-control-is-wired-to-explicit-help-path",
  app.includes('$("#hintBtn").onclick=revealHint')&&
  app.includes('recordBadgeBehaviorObservation("HELP_REQUEST"')
);

console.log("DOM_BINDING_INTEGRITY_PASS");
