from core.ai.rag_engine import RAGEngine

def semantic_analysis(files: dict) -> dict:
    rag = RAGEngine()

    for path, content in files.items():
        if len(content.strip()) > 50:
            rag.add_document(content)

    insights = rag.query(
        "Analyze architectural quality, scalability risks, and code organization issues"
    )

    return {
        "semantic_insights": insights
    }
