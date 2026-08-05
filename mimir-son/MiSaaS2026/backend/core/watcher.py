import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from agents.auditor_agent import AuditorAgent
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO, format='[%(levelname)s] %(message)s')

class ProjectChangeHandler(FileSystemEventHandler):
    def __init__(self, project_path="."):
        self.project_path = Path(project_path)
        self.agent = AuditorAgent(self.project_path)

    def on_modified(self, event):
        if event.is_directory:
            return
        if event.src_path.endswith(".py"):
            logging.info(f"🔄 Cambio detectado en {event.src_path}")
            self.agent.run_audit()

    def on_created(self, event):
        if event.is_directory:
            return
        if event.src_path.endswith(".py"):
            logging.info(f"🆕 Nuevo archivo detectado: {event.src_path}")
            self.agent.run_audit()

def watch_project(project_path="."):
    event_handler = ProjectChangeHandler(project_path)
    observer = Observer()
    observer.schedule(event_handler, path=project_path, recursive=True)
    observer.start()
    logging.info(f"👀 Observando cambios en el proyecto {project_path}...")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
