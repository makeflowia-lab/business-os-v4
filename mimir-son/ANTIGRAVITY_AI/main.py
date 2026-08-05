# main.py
import sys
from pathlib import Path
import shutil
from core.auditor import Auditor
import json

def run_audit(folder):
    """Ejecuta auditoría completa en una carpeta"""
    folder_path = Path(folder)
    if not folder_path.exists():
        print(f"❌ Carpeta {folder} no encontrada")
        return

    print(f"🔎 Ejecutando auditoría en {folder_path.resolve()}...")
    auditor = Auditor(project_path=folder_path)
    stats = auditor.collect_stats()
    print(f"📊 Estadísticas:")
    for k, v in stats.items():
        print(f"  {k}: {v}")

    report_file, critical = auditor.generate_report()
    print(f"✅ Reporte generado: {report_file}")
    if critical:
        print("⚠️ Se detectaron alertas críticas")
    else:
        print("No se detectaron alertas críticas")

def create_saas(name):
    """Crea SaaS/App desde la estructura de ANTIGRAVITY_AI"""
    base_path = Path(".").resolve()  # carpeta madre ANTIGRAVITY_AI
    saas_path = base_path.parent / name

    if saas_path.exists():
        print(f"⚠️ SaaS '{name}' ya existe en {saas_path.resolve()}")
        return

    print(f"🚀 Creando SaaS '{name}' desde {base_path} ...")

    # 1️⃣ Verificar archivos y generar auditoría
    auditor = Auditor(project_path=base_path)
    stats = auditor.collect_stats()
    print(f"[INFO] Archivos en proyecto: {stats['total_files']}, Python: {stats['total_py_files']}")
    report_file, critical = auditor.generate_report()
    if critical:
        print(f"[WARN] Alertas críticas detectadas: {report_file}")
    else:
        print("[OK] Auditoría completada sin alertas críticas")

    # 2️⃣ Crear estructura SaaS
    for folder in ["backend", "frontend", "database", "config"]:
        (saas_path / folder).mkdir(parents=True, exist_ok=True)

    # 3️⃣ Copiar core y agentes internos
    shutil.copytree(base_path / "core", saas_path / "backend" / "core", dirs_exist_ok=True)
    shutil.copytree(base_path / "agents", saas_path / "backend" / "agents", dirs_exist_ok=True)

    # 4️⃣ Crear configuración de agentes externos
    ext_config = {
        "Claude": True,
        "Copilot": True,
        "MCP": True
    }
    (saas_path / "backend" / "agents" / "external_agents_config.json").write_text(
        json.dumps(ext_config, indent=4)
    )

    print(f"✅ SaaS '{name}' creado exitosamente en {saas_path.resolve()}")
    print("Estructura de carpetas: backend/, frontend/, database/, config/")

def main():
    """CLI principal"""
    print("🚀 ANTIGRAVITY_AI CLI interactivo")
    print("Escribe 'help' para ver comandos disponibles")
    while True:
        cmd = input(">> ").strip()
        if cmd == "exit":
            print("Saliendo...")
            break
        elif cmd == "help":
            print("""
Comandos:
  help                  Mostrar esta ayuda
  exit                  Salir del CLI
  audit <carpeta>       Ejecutar auditoría de la carpeta indicada
  create_saas <nombre>  Crear un SaaS/App usando la estructura de ANTIGRAVITY_AI
""")
        elif cmd.startswith("audit"):
            parts = cmd.split()
            if len(parts) != 2:
                print("Error: usa audit <carpeta>")
                continue
            run_audit(parts[1])
        elif cmd.startswith("create_saas"):
            parts = cmd.split()
            if len(parts) != 2:
                print("Error: usa create_saas <nombre>")
                continue
            create_saas(parts[1])
        else:
            print("Comando no reconocido. Escribe 'help' para ver la lista de comandos")

if __name__ == "__main__":
    main()
