#!/usr/bin/env python3
from __future__ import annotations
import json, subprocess, sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"ui-audit/design-to-ui-contract-validation.json"
cp=subprocess.run([sys.executable,str(ROOT/"tools/taky-design-to-ui-validate.py"),str(ROOT/"design-to-ui.json"),"--root",str(ROOT),"--out",str(OUT)],text=True,capture_output=True)
if cp.returncode:
    print(cp.stdout); print(cp.stderr,file=sys.stderr); raise SystemExit(cp.returncode)
r=json.loads(OUT.read_text(encoding="utf-8"))
assert r["contract_valid"] is True, r
assert r["design_pass_ready"] is False, r
assert r["errors"] == [], r["errors"]
b=r["blockers"]
assert "home:GOLDEN_IMPORT_OPEN" in b, b
assert "home:ASSET_IMPORT_OPEN:BACKGROUND" not in b, b
assert any(x.startswith("home:IMPLEMENTATION_OPEN:") for x in b), b
a=json.loads((ROOT/"design/authority-open.json").read_text(encoding="utf-8"))
assert len(a["screens"])==10
assert all(x["status"]=="PER_SCREEN_GOLDEN_FREEZE_OPEN" for x in a["screens"])
print(json.dumps({"schema":"SNAP_DESIGN_TO_UI_ADOPTION_CHECK_V1","contract_valid":True,"design_pass_ready":False,"blockers":b,"approved_background_bound":True,"image_generation_required_for_current_import":False},indent=2))
