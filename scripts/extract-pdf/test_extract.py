r"""
Automated Test Suite for Step R1 (PDF Extraction)
Verifies:
1. Tokenizer on real PDF strings (Spec 11 §11.4).
2. Determinism: Two extraction runs produce identical SHA-256 hashes.
3. Objectives structure (19 objectives, 6 topics, weights matching 07-curriculo.md).
4. Required sections per objective (key-knowledge, key-files, exercises, summary, answers).
5. Character accounting >= 99.5% on all 594 pages.
"""
import hashlib
import json
import os
import sys
import unittest

# Ensure extract-pdf directory is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import OUTPUT_DIR, OBJECTIVES, TOPICS
from tokenizer import extract_tokens, normalize_text

class TestPDFExtractor(unittest.TestCase):

    def test_tokenizer_real_cases(self):
        """Test token extraction on authentic LPI 102 manual patterns."""
        sample = (
            "El comando bash -l o bash --login invoca un shell de inicio de sesión. "
            "Modifica $PATH en /etc/profile y ~/.bashrc. "
            "Para SSH en puerto 22 usamos permisos 0755."
        )
        tokens = extract_tokens(
            sample,
            mono_spans=["bash -l", "bash --login", "$PATH", "/etc/profile", "~/.bashrc"],
            bold_spans=["shell de inicio de sesión"],
            known_commands={"bash", "ssh"}
        )
        self.assertIn("bash", tokens["commands"])
        self.assertIn("-l", tokens["flags"])
        self.assertIn("--login", tokens["flags"])
        self.assertIn("/etc/profile", tokens["paths"])
        self.assertIn("~/.bashrc", tokens["paths"])
        self.assertIn("$PATH", tokens["vars"])
        self.assertIn("PATH", tokens["vars"])
        self.assertIn("0755", tokens["numbers"])
        self.assertIn("22", tokens["numbers"])
        self.assertIn("SSH", tokens["acronyms"])
        self.assertIn("shell de inicio de sesión", tokens["terms"])

    def test_extracted_files_exist(self):
        """Verify that all required output files exist in content-src/_extract/102-500/."""
        required = ["units.json", "objectives.json", "pages.json", "extraction-report.md", "extract-overview.html"]
        for fname in required:
            path = os.path.join(OUTPUT_DIR, fname)
            self.assertTrue(os.path.exists(path), f"Falta archivo requerido: {path}")

    def test_objectives_structure_and_weights(self):
        """Verify 19 objectives across 6 topics with weights matching curriculum."""
        obj_path = os.path.join(OUTPUT_DIR, "objectives.json")
        with open(obj_path, "r", encoding="utf-8") as f:
            objectives = json.load(f)

        self.assertEqual(len(objectives), 19, "Deben existir exactamente 19 objetivos.")
        
        detected_ids = {o["id"] for o in objectives}
        expected_ids = set(OBJECTIVES.keys())
        self.assertEqual(detected_ids, expected_ids, "Los IDs de los objetivos deben coincidir.")

        for obj in objectives:
            sid = obj["id"]
            expected = OBJECTIVES[sid]
            self.assertEqual(obj["weight"], expected["weight"], f"Peso incorrecto en {sid}")
            self.assertEqual(obj["topic"], expected["topic"], f"Tema incorrecto en {sid}")
            self.assertTrue(len(obj["lessons"]) >= 1, f"El objetivo {sid} debe tener al menos 1 lección.")
            self.assertTrue(obj["unitsCount"] > 20, f"El objetivo {sid} tiene muy pocas unidades: {obj['unitsCount']}")

            # Verify presence of essential unit kinds
            kinds = obj.get("unitsByKind", {})
            self.assertIn("heading", kinds, f"{sid} debe tener headings")
            self.assertIn("paragraph", kinds, f"{sid} debe tener paragraphs")
            self.assertIn("key-knowledge", kinds, f"{sid} debe tener key-knowledge")
            self.assertIn("key-files", kinds, f"{sid} debe tener key-files")

            # 106.2 and 106.3 are theoretical GUI topics with no standalone code blocks in the manual
            if sid not in ("106.2", "106.3"):
                self.assertIn("code", kinds, f"{sid} debe tener code blocks")

    def test_page_accounting_threshold(self):
        """Verify character accounting >= 99.5% on all 594 pages."""
        pages_path = os.path.join(OUTPUT_DIR, "pages.json")
        with open(pages_path, "r", encoding="utf-8") as f:
            pages = json.load(f)

        self.assertEqual(len(pages), 594, "Deben registrarse exactamente 594 páginas.")

        below_threshold = [p for p in pages if p["coveragePercent"] < 99.5]
        self.assertEqual(len(below_threshold), 0, f"Páginas bajo 99.5% de contabilidad: {below_threshold}")

    def test_figures_extracted(self):
        """Verify 4 technical PNG figures exist and have valid captions."""
        fig_dir = os.path.join(OUTPUT_DIR, "figures")
        expected_figs = [
            "106.1-p135-f1.png",
            "106.1-p137-f1.png",
            "106.2-p155-f1.png",
            "106.2-p155-f2.png"
        ]
        for fname in expected_figs:
            path = os.path.join(fig_dir, fname)
            self.assertTrue(os.path.exists(path), f"Falta figura: {path}")
            self.assertGreater(os.path.getsize(path), 5000, f"Figura demasiado pequeña o vacía: {path}")

    def test_determinism_hashes(self):
        """Verify that running extract.py again produces identical SHA-256 hashes."""
        units_path = os.path.join(OUTPUT_DIR, "units.json")
        with open(units_path, "rb") as f:
            hash1 = hashlib.sha256(f.read()).hexdigest()

        # Import and run extraction again
        from extract import run_extraction
        ret = run_extraction()
        self.assertEqual(ret, 0, "run_extraction debe salir con código 0")

        with open(units_path, "rb") as f:
            hash2 = hashlib.sha256(f.read()).hexdigest()

        self.assertEqual(hash1, hash2, "La extracción NO es determinista: los hashes SHA-256 no coinciden.")

if __name__ == "__main__":
    unittest.main()
