import ast
import json
import logging
from pathlib import Path
from datetime import datetime

logging.basicConfig(level=logging.INFO, format='[%(levelname)s] %(message)s')

class SemanticAnalyzer:
    def __init__(self, path="."):
        self.path = Path(path)

    def analyze_file(self, file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        tree = ast.parse(content)
        functions = []
        classes = []
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                functions.append({
                    "name": node.name,
                    "lines": len(node.body),
                    "args": [arg.arg for arg in node.args.args]
                })
            elif isinstance(node, ast.ClassDef):
                classes.append({
                    "name": node.name,
                    "methods": [n.name for n in node.body if isinstance(n, ast.FunctionDef)]
                })
        return {"functions": functions, "classes": classes}

    def analyze_project(self):
        results = {}
        py_files = list(self.path.rglob("*.py"))
        for file in py_files:
            logging.info(f"Analizando {file}")
            results[str(file)] = self.analyze_file(file)
        return results

class Auditor:
    def __init__(self, project_path="."):
        self.project_path = Path(project_path)
        self.semantic_analyzer = SemanticAnalyzer(self.project_path)
        self.report_dir = self.project_path / "audits"
        self.history_dir = self.project_path / "history"
        self.report_dir.mkdir(exist_ok=True)
        self.history_dir.mkdir(exist_ok=True)

    def collect_stats(self):
        files = list(self.project_path.rglob("*"))
        py_files = [f for f in files if f.suffix == ".py"]
        dirs = [f for f in files if f.is_dir()]
        return {
            "total_files": len(files),
            "total_dirs": len(dirs),
            "total_py_files": len(py_files)
        }

    def generate_report(self):
        stats = self.collect_stats()
        semantic = self.semantic_analyzer.analyze_project()
        recommendations, critical_alerts = self.generate_recommendations(semantic)

        report = {
            "stats": stats,
            "semantic_analysis": semantic,
            "recommendations": recommendations,
            "critical_alerts": critical_alerts,
            "generated_at": datetime.now().isoformat()
        }

        filename = self.report_dir / f"audit_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=4)
        logging.info(f"Reporte JSON generado: {filename}")

        # Guardar alertas críticas en histórico
        if critical_alerts:
            hist_file = self.history_dir / f"critical_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            with open(hist_file, "w", encoding="utf-8") as f:
                json.dump({"critical_alerts": critical_alerts, "generated_at": datetime.now().isoformat()}, f, indent=4)
            logging.info(f"⚠️ Alertas críticas guardadas en histórico: {hist_file}")

        return filename, bool(critical_alerts)

    def generate_recommendations(self, semantic):
        recs = []
        critical = []
        for file, content in semantic.items():
            for func in content.get("functions", []):
                if func["lines"] > 20:
                    msg = f"Función '{func['name']}' en {file} tiene muchas líneas ({func['lines']}). Considera refactorizar."
                    recs.append(msg)
                    if func["lines"] > 50:  # Función muy grande = alerta crítica
                        critical.append(msg)
            for cls in content.get("classes", []):
                if len(cls.get("methods", [])) > 10:
                    msg = f"Clase '{cls['name']}' en {file} tiene muchos métodos ({len(cls['methods'])}). Considera dividir responsabilidades."
                    recs.append(msg)
                    if len(cls.get("methods", [])) > 20:  # Clase demasiado grande = alerta crítica
                        critical.append(msg)
        if not recs:
            recs.append("No se detectaron problemas críticos. Buen trabajo!")
        return recs, critical
