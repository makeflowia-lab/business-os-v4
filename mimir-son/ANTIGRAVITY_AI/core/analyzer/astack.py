def analyze_stack(files):
    stack = set()
    frameworks = set()

    for file in files:
        if file.endswith(".py"):
            stack.add("Python")
        if file.endswith(".js"):
            stack.add("JavaScript")
        if file.endswith(".ts"):
            stack.add("TypeScript")
        if file.endswith(".java"):
            stack.add("Java")
        if file.endswith(".cs"):
            stack.add("C#")

        # Frameworks
        if "django" in file.lower():
            frameworks.add("Django")
        if "flask" in file.lower():
            frameworks.add("Flask")
        if "fastapi" in file.lower():
            frameworks.add("FastAPI")
        if "react" in file.lower():
            frameworks.add("React")
        if "vue" in file.lower():
            frameworks.add("Vue")

    return {
        "stack": sorted(stack),
        "frameworks": sorted(frameworks)
    }
