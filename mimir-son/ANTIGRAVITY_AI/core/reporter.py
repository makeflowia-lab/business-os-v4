import json
from pathlib import Path
import markdown
from weasyprint import HTML

class Reporter:
    def __init__(self, report_json_path):
        self.report_json_path = Path(report_json_path)
        with open(self.report_json_path, "r", encoding="utf-8") as f:
            self.data = json.load(f)
        self.report_dir = self.report_json_path.parent
        self.md_file = self.report_dir / f"{self.report_json_path.stem}.md"
        self.pdf_file = self.report_dir / f"{self.report_json_path.stem}.pdf"

    def generate_markdown(self):
        md = f"# Auditoría ANTIGRAVITY_AI\n\n"
        md += f"**Generado en:** {self.data.get('generated_at')}\n\n"

        # Estadísticas
        stats = self.data.get("stats", {})
        md += "## Estadísticas del Proyecto\n"
        md += f"- Archivos totales: {stats.get('total_files')}\n"
        md += f"- Directorios totales: {stats.get('total_dirs')}\n"
        md += f"- Archivos Python: {stats.get('total_py_files')}\n\n"

        # Análisis semántico
        md += "## Análisis Semántico de Archivos\n"
        for file, content in self.data.get("semantic_analysis", {}).items():
            md += f"### {file}\n"
            if content.get("classes"):
                md += "#### Clases\n"
                for cls in content["classes"]:
                    md += f"- {cls['name']} (Métodos: {', '.join(cls['methods'])})\n"
            if content.get("functions"):
                md += "#### Funciones\n"
                for func in content["functions"]:
                    md += f"- {func['name']} (Líneas: {func['lines']}, Args: {', '.join(func['args'])})\n"
            md += "\n"

        # Recomendaciones
        md += "## Recomendaciones de Arquitecto Senior\n"
        for rec in self.data.get("recommendations", []):
            md += f"- {rec}\n"

        with open(self.md_file, "w", encoding="utf-8") as f:
            f.write(md)
        return self.md_file

    def generate_pdf(self):
        self.generate_markdown()
        html_content = markdown.markdown(Path(self.md_file).read_text(encoding="utf-8"))
        HTML(string=html_content).write_pdf(self.pdf_file)
        return self.pdf_file
