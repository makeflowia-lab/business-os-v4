from core.auditor import Auditor
from core.reporter import Reporter
import logging

logging.basicConfig(level=logging.INFO, format='[%(levelname)s] %(message)s')

class AuditorAgent:
    def __init__(self, project_path="."):
        self.project_path = project_path
        self.auditor = Auditor(self.project_path)

    def run_audit(self):
        logging.info("🚀 Iniciando auditoría avanzada...")
        report_json = self.auditor.generate_report()
        logging.info("✅ Auditoría completada")

        logging.info("📄 Generando reporte Markdown y PDF...")
        reporter = Reporter(report_json)
        md_file = reporter.generate_markdown()
        pdf_file = reporter.generate_pdf()
        logging.info(f"📊 Reporte Markdown: {md_file}")
        logging.info(f"📊 Reporte PDF: {pdf_file}")

        return report_json, md_file, pdf_file




