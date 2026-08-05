class BaseAgent:
    def __init__(self, name):
        self.name = name

    def run(self):
        raise NotImplementedError("El agente debe implementar run()")

