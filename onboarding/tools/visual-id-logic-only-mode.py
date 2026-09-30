#!/usr/bin/env python3
"""Logic-only execution policy for GUIDE Visual ID production.

Allows state-machine, contract, routing, eligibility and CI work while
art generation is unavailable. It never advances art-production evidence.
"""
from __future__ import annotations
import argparse,json
from pathlib import Path

SCHEMA="TAKY_VISUAL_ID_LOGIC_ONLY_MODE_V1"
ART_STAGES={
 "INDIVIDUAL_TRANSPARENT_CUTOUT",
 "INDIVIDUAL_MASK_SPEC",
 "BODY_PROP_GEAR_FINAL_ART",
 "SIX_REACTION_FINAL_ART",
 "PER_ID_PACKAGE_AUDIT",
 "UI_BINDING_AND_11_SCREEN_RENDER",
 "VIEWPORT_DEVICE_VISUAL_QA",
 "RELEASE"
}
LOGIC_ACTIONS={
 "VALIDATE_AUTHORITY","VALIDATE_STATE_MACHINE","VALIDATE_VISUAL_ID_MAPPING",
 "VALIDATE_RUNTIME_ELIGIBILITY","VALIDATE_BEHAVIOR_CONTRACT",
 "VALIDATE_COMPOSITION_CONTRACT","VALIDATE_FALLBACK_RULES",
 "VALIDATE_CONSUMER_POINTERS","RUN_UNIT_TESTS","RUN_INTEGRATION_TESTS",
 "GENERATE_PLAN_ONLY","REPORT_STATUS"
}

def policy()->dict:
    return {
      "schema":SCHEMA,
      "mode":"LOGIC_ONLY_HOLD",
      "image_generation_available":False,
      "art_evidence_mutation_allowed":False,
      "allowed_logic_actions":sorted(LOGIC_ACTIONS),
      "blocked_art_stages":sorted(ART_STAGES),
      "state_advance_rule":"NO_ART_STAGE_ADVANCE_WITHOUT_REAL_APPROVED_BINARY_AND_SHA",
      "taky_assets_rule":"APPROVED_RESULTS_AND_POINTERS_ONLY",
      "generation_allowed":False,
      "main_merge":False,
      "netlify":False
    }

def check(action:str)->dict:
    p=policy()
    if action in LOGIC_ACTIONS:
        return {"pass":True,"action":action,"mode":p["mode"],"generation_allowed":False}
    if action in ART_STAGES:
        return {"pass":False,"action":action,"error":"ART_STAGE_BLOCKED_LOGIC_ONLY_HOLD","generation_allowed":False}
    return {"pass":False,"action":action,"error":"UNKNOWN_ACTION","generation_allowed":False}

def main()->int:
    ap=argparse.ArgumentParser()
    ap.add_argument("--action")
    ap.add_argument("--out")
    a=ap.parse_args()
    result=check(a.action) if a.action else policy()
    payload=json.dumps(result,ensure_ascii=False,indent=2)+"\n"
    if a.out:Path(a.out).write_text(payload,encoding="utf8")
    print(payload,end="")
    return 0 if result.get("pass",True) else 1
if __name__=="__main__":raise SystemExit(main())
