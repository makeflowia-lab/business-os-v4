import json
from datetime import datetime
import os

def save_report(report, base_path):
    os.makedirs("audits", exist_ok=True)

    filename = f"audits/audit_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

    with open(filename, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=4)

    return filename
