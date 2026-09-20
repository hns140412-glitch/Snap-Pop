import fs from "node:fs";

const matrixPath = "data/snap-pop-requirement-matrix.json";
const appPath = "app.js";
const bridgePath = "snap-bridge.js";

const matrix = JSON.parse(fs.readFileSync(matrixPath,"utf8"));
const app = fs.readFileSync(appPath,"utf8");
const bridge = fs.readFileSync(bridgePath,"utf8");

const failures = [];
const ids = matrix.requirements.map(r=>r.id);
const uniq = new Set(ids);
if (ids.length !== uniq.size) failures.push("DUPLICATE_REQUIREMENT_ID");

const requiredDomains = [
  "ORIGINAL_CORE",
  "GUIDE_RULES",
  "EXPLORATION_CREW",
  "VOICE_ACCESSIBILITY",
  "IMAGINATION_CLOUD",
  "SPECIAL_EXPLORATION",
  "RECORDS",
  "GROWTH_REWARD",
  "CONNECTED_APP",
  "PWA_DATA",
  "UI_ASSET",
  "FAMILY_EXPANSION"
];
for (const d of requiredDomains) {
  if (!matrix.requirements.some(r=>r.domain===d)) failures.push("MISSING_DOMAIN:"+d);
}

for (const r of matrix.requirements) {
  if (!r.id || !r.domain || !r.title || !r.classification) failures.push("MALFORMED:"+r.id);
  if (!Array.isArray(r.authority) || r.authority.length===0) failures.push("NO_AUTHORITY:"+r.id);
}

const family = matrix.requirements.filter(r=>r.domain==="FAMILY_EXPANSION");
if (family.length < 8) failures.push("FAMILY_SCOPE_UNDERCOUNT");
if (family.some(r=>r.coded===true) && !app.includes("FAMILY_EXPANSION")) {
  failures.push("FALSE_FAMILY_CODED_CLAIM");
}

const invariants = new Set(matrix.invariants||[]);
for (const required of [
  "CORE_6_IS_PROVISIONAL_REFERENCE_NOT_PROJECT_CENTER",
  "GUIDE_RULES_ARE_PROJECT_WIDE_BEHAVIOR_STANDARD",
  "DOCUMENTED != CODED",
  "CODED != RUNTIME_VERIFIED",
  "EXPANSION_PACK_INCLUDED_IN_FULL_SCOPE_IMPLEMENTATION_RATE",
  "CONFLICT != PERMISSION_TO_GUESS"
]) {
  if (!invariants.has(required)) failures.push("MISSING_INVARIANT:"+required);
}

for (const token of ["session_id","task_id","lap_id","return_target"]) {
  if (!bridge.includes(token)) failures.push("BRIDGE_CONTEXT_MISSING:"+token);
}

if (!app.includes("renderLandmarks")) failures.push("ORIGINAL_RUNTIME_MISSING:renderLandmarks");
if (!app.includes("renderExplore")) failures.push("ORIGINAL_RUNTIME_MISSING:renderExplore");
if (!app.includes("recordCrewExperience")) failures.push("CREW_RUNTIME_MISSING:recordCrewExperience");
if (!app.includes("synthesizeCrewWorldState")) failures.push("CREW_RUNTIME_MISSING:synthesizeCrewWorldState");

if (failures.length) {
  console.error("SNAP_POP_REQUIREMENT_MATRIX_FAIL");
  for (const f of failures) console.error("- "+f);
  process.exit(1);
}
console.log("SNAP_POP_REQUIREMENT_MATRIX_PASS");
console.log("requirements="+matrix.requirements.length);
console.log("domains="+new Set(matrix.requirements.map(r=>r.domain)).size);
console.log("family_requirements="+family.length);
