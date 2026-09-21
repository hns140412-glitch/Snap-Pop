import fs from "node:fs";
const css=fs.readFileSync(new URL("../styles.css",import.meta.url),"utf8");
const index=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");

function assert(name,condition){
  if(!condition) throw new Error("FAIL "+name);
  console.log("PASS",name);
}

assert("viewport-mobile-configured",index.includes('name="viewport"')&&index.includes("width=device-width"));
assert("app-mobile-max-width",/#app\{[^}]*width:min\(100%,430px\)/.test(css));
assert("writing-tools-wrap",/\.tools\{[^}]*flex-wrap:wrap/.test(css));
assert("writing-soft-controls-two-column-capable",/\.tools \.soft\{[^}]*flex:1 1 calc\(50% - 4px\)/.test(css));
assert("voice-control-full-row",/\.voice\{[^}]*flex:1 1 100%/.test(css));
assert("writing-controls-min-height",/\.tools button\{[^}]*min-height:44px/.test(css));
assert("safe-area-top-used",css.includes("env(safe-area-inset-top)"));
assert("safe-area-bottom-used",css.includes("env(safe-area-inset-bottom)"));
console.log("MOBILE_USER_SURFACE_STATIC_PASS");
