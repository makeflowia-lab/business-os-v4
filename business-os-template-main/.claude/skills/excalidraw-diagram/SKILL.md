---
name: excalidraw-diagram
description: |
  Generate Excalidraw diagrams as JSON files and render them to PNG. Use when the user asks for
  architecture diagrams, flowcharts, system diagrams, process maps, or any visual diagram.
  Triggers: diagram, flowchart, architecture diagram, system diagram, draw diagram, excalidraw,
  process map, sequence diagram, visualize, sketch.
---

# Excalidraw Diagram Generator

Generate Excalidraw-compatible JSON diagrams and render them to PNG images.

## How It Works

1. Generate valid Excalidraw JSON with all required element properties
2. Save as `.excalidraw` file
3. Render to PNG using the bundled Python renderer

## Generating Diagrams

### Step 1: Design the Layout

Plan the diagram on a coordinate grid:
- Start elements at (100, 100)
- Use 200px horizontal spacing between elements
- Use 150px vertical spacing between rows
- Standard element size: 180x90px for rectangles

### Step 2: Create the JSON

Read `references/json-schema.md` for the complete schema reference.
Read `references/element-templates.md` for copy-paste JSON templates.

Every diagram needs this wrapper:

```json
{
  "type": "excalidraw",
  "version": 2,
  "source": "agent",
  "elements": [ ... ],
  "appState": {
    "viewBackgroundColor": "#ffffff",
    "gridSize": null
  },
  "files": {}
}
```

### Step 3: Color Palette

Use these default colors (or customize per project):

| Purpose | Stroke | Fill |
|---------|--------|------|
| Primary elements | `#1971c2` | `#a5d8ff` |
| Secondary elements | `#2f9e44` | `#b2f2bb` |
| Warning/attention | `#e8590c` | `#ffc078` |
| Neutral/structural | `#868e96` | `#dee2e6` |
| Text on light fills | `#1e1e1e` | - |
| Arrows/connections | `#1971c2` | - |

### Step 4: Save and Render

```bash
# Save the JSON to a .excalidraw file
# Then render to PNG:
cd .claude/skills/excalidraw-diagram/references
uv run python render_excalidraw.py /path/to/diagram.excalidraw --output /path/to/output.png --scale 2
```

First-time setup (only needed once):
```bash
cd .claude/skills/excalidraw-diagram/references
uv sync
uv run playwright install chromium
```

## Critical Rules

1. **Every shape with text** needs TWO elements: the shape + a text element with `containerId` pointing to the shape
2. **Every shape with contained text** needs `boundElements: [{"id": "textId", "type": "text"}]`
3. **Arrows** need `startBinding` and `endBinding` with the connected element IDs
4. **All IDs must be unique** across the entire diagram
5. **Always set** `roughness: 0` for clean, professional diagrams
6. **Use `fontFamily: 3`** (monospace) for consistent text rendering

## Reference Files

- `references/json-schema.md` - Complete Excalidraw JSON schema
- `references/element-templates.md` - Copy-paste element templates
- `references/render_excalidraw.py` - PNG renderer script
- `references/render_template.html` - HTML template for rendering
- `references/pyproject.toml` - Python dependencies
