import fs from "node:fs";
const app=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
const index=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const storage=fs.readFileSync(new URL("../app-storage-runtime.js",import.meta.url),"utf8");
const shell=fs.readFileSync(new URL("../app-shell-runtime.js",import.meta.url),"utf8");

function assert(name,condition){
  if(!condition)throw new Error("FAIL "+name);
  console.log("PASS",name);
}

assert("storage-runtime-loaded-before-app",
  index.indexOf('src="app-storage-runtime.js"')<index.indexOf('src="app.js"')
);
assert("ui-shell-loaded-before-app",
  index.indexOf('src="app-shell-runtime.js"')<index.indexOf('src="app.js"')
);
assert("app-no-longer-owns-indexeddb",
  !app.includes('indexedDB.open("snap_pop_rev10"')
);
assert("app-has-no-legacy-db-variable",!/\\bdb\\b/.test(app));
assert("storage-runtime-owns-indexeddb",
  storage.includes('indexedDB.open(DB_NAME,DB_VERSION)')&&storage.includes("SNAP_POP_STORAGE_V1")&&storage.includes("isOpen:()=>!!db")
);
assert("app-uses-storage-only-as-thin-orchestration",
  app.includes('window.SnapPopStorage.get("active")')&&
  !app.includes("function openDB")&&
  !app.includes("function get(k)")&&
  !app.includes("function set(k,v)")&&
  !app.includes("function setMany")
);
assert("app-delegates-view-shell",
  app.includes("SnapPopUIShell.activateView(id)")&&
  app.includes("SnapPopUIShell.toast(t)")&&
  !app.includes("function html(s)")
);
assert("ui-shell-owns-view-class-switching",
  shell.includes('all(".view").forEach')&&shell.includes("SNAP_POP_UI_SHELL_V1")
);
console.log("REWRITE_FOUNDATION_BOUNDARY_PASS");
