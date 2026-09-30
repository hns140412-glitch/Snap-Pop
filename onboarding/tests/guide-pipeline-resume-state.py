import importlib.util,unittest
from pathlib import Path
P=Path(__file__).parents[1]/"tools/guide-pipeline-resume-state.py"
s=importlib.util.spec_from_file_location("g",P);g=importlib.util.module_from_spec(s);s.loader.exec_module(g)
class T(unittest.TestCase):
 def test_current_resume_stage_is_cutout(self):
  x=g.build(); self.assertEqual("TAKY_SPECIALIST_PIPELINE_RESUME_V1",x["schema"])
  first=next(s for s in x["stages"] if s["status"]!="PASS")
  self.assertEqual("INDIVIDUAL_TRANSPARENT_CUTOUT",first["name"])
  self.assertEqual("IMAGE_GENERATION_UNAVAILABLE_LOGIC_ONLY_HOLD",first["resume_reason"])
if __name__=="__main__":unittest.main()
