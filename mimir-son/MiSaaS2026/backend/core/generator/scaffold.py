from pathlib import Path

def generate_project_structure(base_path, stack):
    base = Path(base_path) / "generated_project"
    base.mkdir(exist_ok=True)

    backend = base / "backend"
    frontend = base / "frontend"

    backend.mkdir(exist_ok=True)
    frontend.mkdir(exist_ok=True)

    # Backend scaffold
    (backend / "app").mkdir(exist_ok=True)
    (backend / "app" / "__init__.py").touch()
    (backend / "app" / "main.py").write_text(
        "# Backend entrypoint\n\nprint('Backend ready')\n"
    )

    # Frontend scaffold
    (frontend / "src").mkdir(exist_ok=True)
    (frontend / "src" / "main.jsx").write_text(
        "// Frontend entrypoint\nconsole.log('Frontend ready');\n"
    )

    # README
    (base / "README.md").write_text(
        f"""# Proyecto Generado por ANTIGRAVITY_AI

## Stack recomendado
- Backend: {stack['backend']}
- Frontend: {stack['frontend']}
- Database: {stack['database']}
"""
    )

    print(f"\n🏗️ Proyecto generado en: {base}")
