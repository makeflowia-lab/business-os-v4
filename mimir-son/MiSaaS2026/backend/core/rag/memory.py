class Memory:
    def __init__(self):
        self.data = []

    def add(self, item):
        self.data.append(item)

    def get_all(self):
        return self.data
