from core.auditor import Auditor
from core.reporter import Reporter
from core.mailer import Mailer
import logging

logging.basicConfig(level=logging.INFO, format='[%(levelname)s] %(message)s')

class AuditorAgent:
    def __init__(self, project_path="."):
        self.project_path = project_path
        self.auditor = Auditor(self.project_path)
        self.mailer = Mailer()

    def run_audit(self):
        logging.info("🚀 Iniciando auditoría avanzada...")
        report_json, has_critical = self.auditor.generate_report()
        logging.info("✅ Auditoría completada")

        logging.info("📄 Generando reportes Markdown y PDF automáticamente...")
        reporter = Reporter(report_json)
        md_file = reporter.generate_markdown()
        pdf_file = reporter.generate_pdf()
        logging.info(f"📊 Reporte Markdown: {md_file}")
        logging.info(f"📊 Reporte PDF: {pdf_file}")

        logging.info("✉️ Enviando reporte por correo automáticamente...")
        self.mailer.send_report(pdf_file, md_file)
        logging.info("✅ Correo enviado con éxito!")

        if has_critical:
            logging.warning("⚠️ Se detectaron alertas críticas en el código. Revisa el PDF/Markdown y el histórico.")

        return report_json, md_file, pdf_file
