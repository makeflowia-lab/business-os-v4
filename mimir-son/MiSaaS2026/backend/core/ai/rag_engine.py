import faiss
import numpy as np
from core.ai.embedder import embed_text

class RAGEngine:
    def __init__(self):
        self.index = faiss.IndexFlatL2(1536)
        self.documents = []

    def add_document(self, text: str):
        vector = np.array([embed_text(text)], dtype="float32")
        self.index.add(vector)
        self.documents.append(text)

    def query(self, question: str, k: int = 3) -> list:
        q_vector = np.array([embed_text(question)], dtype="float32")
        _, indices = self.index.search(q_vector, k)
        return [self.documents[i] for i in indices[0]]

