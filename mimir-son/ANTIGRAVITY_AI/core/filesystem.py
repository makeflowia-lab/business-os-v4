from core.scanner.filesystem import scan_project


def scan_project(path: str):
    base = Path(path)

    if not base.exists():
        print("❌ Ruta no válida")
        return []

    files = []

    for file in base.rglob("*"):
        if file.is_file():
            files.append(str(file))

    return files
