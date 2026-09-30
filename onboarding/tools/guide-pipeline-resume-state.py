#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/"guide-07-24-production-stage-gate.v1.json"

MAP={
 "PASS":"PASS",
 "CORE6_PASS_EXPANSION_OPEN":"OPEN",
 "CORE6_PASS_EXPANSION_BLOCKED_BY_STAGE_3":"BLOCKED",
 "BLOCKED_UNTIL_FULL24_SOURCE_LOCK":"BLOCKED",
 "BLOCKED_BY_STAGE_5":"BLOCKED",
 "BLOCKED":"BLOCKED",
 "HOLD":"HOLD"
}
NAMES=[
 "AUTHORITY_RESTORE","GROUP_SOURCE_SHA_LOCK","MEMBER_ID_REFERENCE_BINDING",
 "INDIVIDUAL_TRANSPARENT_CUTOUT","INDIVIDUAL_MASK_SPEC","BODY_PROP_GEAR_FINAL_ART",
 "SIX_REACTION_FINAL_ART","PER_ID_PACKAGE_AUDIT","UI_BINDING_AND_RENDER",
 "VIEWPORT_DEVICE_VISUAL_QA","RELEASE"
]
SOURCE_NAME_ALIASES={
 "UI_BINDING_AND_RENDER":"UI_BINDING_AND_11_SCREEN_RENDER"
}

def build():
    src=json.loads(SRC.read_text(encoding="utf8"))
    by={x["name"]:x for x in src.get("stages",[])}
    stages=[]
    for name in NAMES:
        source_name=SOURCE_NAME_ALIASES.get(name,name)
        original=by[source_name]
        status=MAP.get(original.get("status"),"FAILED")
        row={"name":name,"status":status}
        if status=="PASS":
            row["evidence_ref"]="SNAP_POP:onboarding/guide-07-24-production-stage-gate.v1.json#"+name
        else:
            if name=="INDIVIDUAL_TRANSPARENT_CUTOUT":
                row["resume_reason"]="IMAGE_GENERATION_UNAVAILABLE_LOGIC_ONLY_HOLD"
            elif name=="RELEASE":
                row["resume_reason"]="EXPLICIT_APPROVAL_REQUIRED"
            else:
                row["resume_reason"]=original.get("note") or original.get("exit") or "UPSTREAM_STAGE_NOT_PASS"
        stages.append(row)
    return {
      "schema":"TAKY_SPECIALIST_PIPELINE_RESUME_V1",
      "pipeline_owner":"SNAP_POP_GUIDE_VISUAL_ID_PIPELINE",
      "source_stage_gate":"onboarding/guide-07-24-production-stage-gate.v1.json",
      "stages":stages
    }

if __name__=="__main__":
    print(json.dumps(build(),ensure_ascii=False,indent=2))
