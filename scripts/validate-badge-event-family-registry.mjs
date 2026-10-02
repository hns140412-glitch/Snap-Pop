import fs from "node:fs";
function read(path){return fs.readFileSync(new URL("../"+path,import.meta.url),"utf8")}
function assert(name,condition){if(!condition)throw new Error("FAIL "+name);console.log("PASS",name)}

const registry=JSON.parse(read("data/badge-event-family-registry.json"));
const source=read("badge-source-observation-runtime.js");
const familyBlock=(source.match(/const ALLOWED_FAMILIES=new Set\(\[([\s\S]*?)\]\);/)||[])[1]||"";
const runtimeFamilies=[...familyBlock.matchAll(/"([A-Z_]+)"/g)].map(x=>x[1]);
const registryFamilies=(registry.families||[]).map(x=>x.id);

assert("badge-family-registry-has-25",registry.family_count===25&&registryFamilies.length===25);
assert("badge-family-runtime-matches-registry",JSON.stringify(runtimeFamilies)===JSON.stringify(registryFamilies));
assert("badge-family-registry-observation-only",registry.activation_authority===false&&registry.economy_authority===false&&registry.families.every(x=>x.observation_only===true));
assert("badge-extension-semantics-human-approved",(registry.families||[]).filter(x=>x.origin==="2026-10-02_EXTENSION").length===11&&(registry.families||[]).filter(x=>x.origin==="2026-10-02_EXTENSION").every(x=>x.semantic_status==="HUMAN_APPROVED"));
assert("badge-family-approval-does-not-activate",registry.families.every(x=>x.activation_status==="SEPARATE_GATE_REQUIRED"));

console.log("BADGE_EVENT_FAMILY_REGISTRY_PASS");
