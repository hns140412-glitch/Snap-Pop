import fs from "node:fs";

const index=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const family=fs.readFileSync(new URL("../family-expansion-app.js",import.meta.url),"utf8");

function assert(name,condition){
  if(!condition) throw new Error("FAIL "+name);
  console.log("PASS",name);
}

const bannedVisible=[
  "MASTER GEM ASSET",
  "기존 승인 원본 연결 대기",
  "ORIGINAL과 분리된 선택 확장",
  "아이별 기록은 childId로 분리",
  "Character Master 기록 보존",
  "Snap & Pop 탐험대원 MASTER",
  "정확한 조우 주기는 아직 OPEN",
  "WORKING ROLE SLOT",
  "WORKING 설계판",
  "미발견/설계 슬롯",
  "실제 인원 OPEN"
];
for(const phrase of bannedVisible) assert("internal-copy-hidden-"+phrase.replace(/\s+/g,"-"),!index.includes(phrase));

assert("family-mode-copy-is-user-facing",
  index.includes('id="familyExpansionMode">사용 안 함')&&
  family.includes('?"사용 중":"사용 안 함"')
);
assert("family-feature-state-is-translated",
  family.includes('f.state==="ACTIVE"?"사용 가능":"준비 중"')&&
  !family.includes("'+escape(f.state)+'</span>")
);
assert("gem-surface-is-user-facing",
  index.includes("나의 보석 도감")&&
  index.includes("탐험하며 모은 보석과 기록을 한곳에서 확인해요.")
);
assert("character-surface-is-user-facing",
  index.includes("내 탐험가")&&
  index.includes("나만의 탐험가를 꾸며요.")
);

assert("mobile-writing-tools-wrap",/\.tools\{[^}]*flex-wrap:wrap/.test(fs.readFileSync(new URL("../styles.css",import.meta.url),"utf8")));
console.log("USER_FACING_SURFACE_PASS");
