import importlib.util,unittest
from pathlib import Path
P=Path(__file__).parents[1]/"tools/visual-id-logic-only-mode.py"
s=importlib.util.spec_from_file_location("m",P);m=importlib.util.module_from_spec(s);s.loader.exec_module(m)

class T(unittest.TestCase):
  def test_logic_allowed(self):
    self.assertTrue(m.check("VALIDATE_BEHAVIOR_CONTRACT")["pass"])
  def test_art_blocked(self):
    x=m.check("BODY_PROP_GEAR_FINAL_ART")
    self.assertFalse(x["pass"]);self.assertEqual("ART_STAGE_BLOCKED_LOGIC_ONLY_HOLD",x["error"])
  def test_generation_never_enabled(self):
    self.assertFalse(m.policy()["generation_allowed"])
    self.assertFalse(m.policy()["art_evidence_mutation_allowed"])
if __name__=="__main__":unittest.main()
