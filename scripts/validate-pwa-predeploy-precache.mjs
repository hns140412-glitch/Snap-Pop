import fs from "node:fs";

const index=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const sw=fs.readFileSync(new URL("../sw.js",import.meta.url),"utf8");
const app=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
const manifest=JSON.parse(fs.readFileSync(new URL("../manifest.json",import.meta.url),"utf8"));

function assert(name,condition){
  if(!condition) throw new Error("FAIL "+name);
  console.log("PASS",name);
}

const scriptSrc=[...index.matchAll(/<script\s+src="([^"]+)"/g)]
  .map(x=>x[1])
  .filter(x=>!/^https?:/i.test(x));
const precacheMatch=sw.match(/const A=(\[[\s\S]*?\]);/);
if(!precacheMatch) throw new Error("FAIL pwa-precache-array-present");
const precache=JSON.parse(precacheMatch[1]);

assert("active-service-worker-is-sw-js",
  app.includes('navigator.serviceWorker.register("sw.js")')&&
  !app.includes('navigator.serviceWorker.register("service-worker.js")')
);
const cacheKeyMatch=sw.match(/const C=['"]([^'"]+)['"]/);
assert("precache-version-is-current-predeploy",
  cacheKeyMatch?.[1]==="snap-pop-2026-10-02-badge-multisource-v1"
);
assert("all-production-runtime-scripts-are-precached",
  scriptSrc.every(src=>precache.includes(src))
);
assert("runtime-selftests-not-loaded-in-normal-user-path",
  !index.includes('<script src="scripts/browser-runtime-selftest.js"></script>')&&
  !index.includes('<script src="scripts/badge-catalog-binding-selftest.js"></script>')&&
  index.includes('has("runtime-smoke")')&&
  index.includes('"scripts/browser-runtime-selftest.js"')&&
  index.includes('"scripts/badge-catalog-binding-selftest.js"')
);
assert("runtime-selftests-are-available-offline-when-requested",
  ["scripts/browser-runtime-selftest.js","scripts/badge-catalog-binding-selftest.js"].every(x=>precache.includes(x))
);
assert("badge-shard-runtime-is-precached",
  precache.includes("badge-art-pack-runtime.js")&&
  precache.includes("data/badge-art-shard-manifest.json")&&
  Array.from({length:10},(_,i)=>`assets/badges/current/shards/taky-badge-art-shard-${String(i+1).padStart(2,"0")}.bin`).every(x=>precache.includes(x))
);
assert("core-shell-is-precached",
  ["./","index.html","styles.css","manifest.json","app.js","snap-bridge.js"].every(x=>precache.includes(x))
);
assert("manifest-install-icons-are-declared",
  Array.isArray(manifest.icons)&&
  manifest.icons.some(x=>x.src==="icons/icon-192.png"&&x.sizes==="192x192"&&x.type==="image/png")&&
  manifest.icons.some(x=>x.src==="icons/icon-512.png"&&x.sizes==="512x512"&&x.type==="image/png")
);
assert("install-icons-are-precached",
  ["icons/icon-192.png","icons/icon-512.png"].every(x=>precache.includes(x))
);
assert("apple-touch-icon-is-declared",
  index.includes('rel="apple-touch-icon" href="icons/icon-192.png"')
);
assert("legacy-service-worker-is-not-registered",
  !index.includes('service-worker.js')&&!app.includes('service-worker.js')
);

console.log("PWA_PREDEPLOY_PRECACHE_COVERAGE_PASS");
