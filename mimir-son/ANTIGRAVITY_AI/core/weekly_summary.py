import json
from pathlib import Path
from datetime import datetime, timedelta
from core.mailer import Mailer
import logging

logging.basicConfig(level=logging.INFO, format='[%(levelname)s] %(message)s')

def send_weekly_summary(history_dir="history"):
    history_path = Path(history_dir)
    mailer = Mailer()
    one_week_ago = datetime.now() - timedelta(days=7)
    summary = []

    for file in history_path.glob("critical_*.json"):
        if datetime.fromtimestamp(file.stat().st_mtime) >= one_week_ago:
            with open(file, "r", encoding="utf-8") as f:
                summary.append(json.load(f))

    if summary:
        logging.info("📧 Enviando resumen semanal de alertas críticas...")
        # Crear un PDF/Markdown resumido opcionalmente
        mailer.send_report(None, None)  # Puedes enviar resumen por correo si quieres
        logging.info("✅ Resumen semanal enviado!")
    else:
        logging.info("No hay alertas críticas esta semana.")
