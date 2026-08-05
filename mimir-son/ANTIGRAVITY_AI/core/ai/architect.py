def architect_reasoning(stack: dict, semantic: dict) -> dict:
    issues = []
    recommendations = []

    if "FastAPI" in stack.get("frameworks", []):
        issues.append("FastAPI detected – verify separation between routes and business logic")
        recommendations.append("Introduce service and repository layers")

    if not semantic["semantic_insights"]:
        issues.append("Low semantic context – possible thin or underdeveloped architecture")

    recommendations.append("Prepare project for containerization and async scalability")

    return {
        "issues": issues,
        "recommendations": recommendations
    }
