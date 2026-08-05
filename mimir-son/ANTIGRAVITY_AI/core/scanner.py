import os

def scan_project(path):
    project_data = {
        "files": [],
        "directories": [],
        "extensions": {}
    }

    for root, dirs, files in os.walk(path):
        for d in dirs:
            project_data["directories"].append(os.path.join(root, d))

        for f in files:
            full_path = os.path.join(root, f)
            project_data["files"].append(full_path)

            ext = os.path.splitext(f)[1] or "NO_EXT"
            project_data["extensions"][ext] = project_data["extensions"].get(ext, 0) + 1

    return project_data