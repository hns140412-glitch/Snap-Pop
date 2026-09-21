import fs from "node:fs";
const index=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const css=fs.readFileSync(new URL("../styles.css",import.meta.url),"utf8");
function assert(name,condition){if(!condition) throw new Error("FAIL "+name); console.log("PASS",name)}
assert("result-leads-with-child-work",index.includes('class="resultCard resultStoryCard"')&&index.includes("내가 만든 글"));
assert("result-separates-progress-from-work",index.includes('class="resultProgressCard"')&&index.includes("오늘 쌓인 흔적")&&index.includes("오늘 발견한 힘"));
assert("result-next-actions-link-records-and-growth",index.includes('class="resultNextActions"')&&index.includes('id="resultRecords"')&&index.includes('id="resultGrowth"'));
assert("bonus-is-optional-collapsed",index.includes('class="resultOptional"')&&index.includes("한 문장 더 해볼까?"));
assert("records-copy-is-reflection-first",index.includes("내가 남긴 것")&&index.includes("탐험 기록"));
assert("growth-has-three-step-narrative",index.includes('class="growthStoryFlow"')&&index.includes("탐험하고")&&index.includes("기록하고")&&index.includes("조금씩 자라"));
assert("growth-summary-is-readable-grid",css.includes(".growthActivitySummary{display:grid")&&css.includes("grid-template-columns:repeat(2,1fr)"));
console.log("INTEGRATED_RESULT_RECORDS_GROWTH_PASS");
