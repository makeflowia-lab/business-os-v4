def recommend_stack(analysis):
    stack = analysis["stack"]
    frameworks = analysis["frameworks"]

    recommendation = {
        "backend": None,
        "frontend": None,
        "database": "SQLite",
        "reason": []
    }

    # Backend
    if "Python" in stack:
        if "FastAPI" in frameworks:
            recommendation["backend"] = "FastAPI"
        elif "Flask" in frameworks:
            recommendation["backend"] = "Flask"
        else:
            recommendation["backend"] = "FastAPI"
            recommendation["reason"].append("Python detectado, FastAPI recomendado por rendimiento")
    elif "JavaScript" in stack:
        recommendation["backend"] = "Node.js (Express)"

    # Frontend
    if "React" in frameworks:
        recommendation["frontend"] = "React"
    elif "Vue" in frameworks:
        recommendation["frontend"] = "Vue"
    else:
        recommendation["frontend"] = "React"
        recommendation["reason"].append("Frontend no claro, React recomendado como estándar")

    return recommendation
