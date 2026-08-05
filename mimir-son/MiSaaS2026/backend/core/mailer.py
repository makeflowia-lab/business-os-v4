import smtplib, os
from email.message import EmailMessage
from pathlib import Path

class Mailer:
    def __init__(self):
        self.email_user = os.getenv("makeflowia@gmail.com")
        self.email_pass = os.getenv("RijoChiapas2025")
        self.email_to = os.getenv("makeflowia@gmail.com")

    def send_report(self, pdf_path: Path, md_path: Path):
        msg = EmailMessage()
        msg['Subject'] = '📊 Reporte ANTIGRAVITY_AI Generado'
        msg['From'] = self.email_user
        msg['To'] = self.email_to
        msg.set_content(
            f"Se ha generado un nuevo reporte de auditoría.\n\nMarkdown: {md_path}\nPDF: {pdf_path}"
        )

        # Adjuntar PDF
        with open(pdf_path, "rb") as f:
            pdf_data = f.read()
        msg.add_attachment(pdf_data, maintype='application', subtype='pdf', filename=pdf_path.name)

        # Adjuntar Markdown
        with open(md_path, "rb") as f:
            md_data = f.read()
        msg.add_attachment(md_data, maintype='text', subtype='plain', filename=md_path.name)

        # Enviar correo
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
            smtp.login(self.email_user, self.email_pass)
            smtp.send_message(msg)
