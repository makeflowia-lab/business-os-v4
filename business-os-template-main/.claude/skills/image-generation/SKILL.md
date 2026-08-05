---
name: image-generation
description: Generate and edit images using OpenRouter + Gemini. Use when the user asks to create, generate, or edit images. Can also inject generated images into the Draw/whiteboard canvas. Triggers on image generation, editing, thumbnails, banners, illustrations, logos, or placing images on the Draw canvas.
---

# Image Generation (OpenRouter -> Gemini)

Generate images from text prompts or edit existing images via OpenRouter's Gemini image models. Optionally inject the result into the Draw/whiteboard canvas.

## Command

```bash
cd agent-server
npx tsx scripts/generate-image.ts --prompt "PROMPT" --upload [--image /path/to/input.png] [--output /path/to/output.png] [--size 2K] [--aspect 16:9] [--draw] [--page-id ID] [--draw-name NAME]
```

## Arguments

| Arg | Required | Description |
|-----|----------|-------------|
| `--prompt` | YES | Text description of what to generate or how to edit |
| `--upload` | **ALWAYS USE** | Uploads to Supabase Storage and prints public URL. **MANDATORY for chat display.** |
| `--image` | NO | Path to input image (for editing/transforming an existing image) |
| `--output` | NO | Custom output path. Default: `workspace/generated/img-{timestamp}.png` |
| `--size` | NO | Image size: `1K` (default), `2K`, `4K` |
| `--aspect` | NO | Aspect ratio: `1:1`, `16:9`, `9:16`, `4:3`, `3:2`, etc. |
| `--model` | NO | Model ID. Default: `google/gemini-3.1-flash-image-preview` |
| `--draw` | NO | After generating, inject the image into a Draw/whiteboard canvas |
| `--page-id` | NO | Target existing canvas (PATCH injection). If omitted with `--draw`, creates a new page (POST) |
| `--draw-name` | NO | Name for the new draw page. Only used when creating a new page (no `--page-id`). Default: "Generated Image" |

### Available Models

| Model | Best for |
|-------|----------|
| `google/gemini-3.1-flash-image-preview` | Default. Best quality at flash speed |
| `google/gemini-2.5-flash-image` | Fast, good quality |
| `google/gemini-3-pro-image-preview` | Pro quality, supports 4K |

## Output

The script prints:
- `URL:https://...` -- **public URL** from Supabase Storage (when `--upload` is used)
- `IMAGE:/path/to/generated/img-1234567890.png` -- local path to saved image
- `TEXT:description` -- any text the model included
- `DRAW:page-id` -- Draw page UUID (when `--draw` is used)
- `DRAW_URL:https://...` -- Full Draw page URL (when `--draw` is used)

Generated images are saved locally to `agent-server/workspace/generated/` AND uploaded to Supabase Storage.

## Examples

```bash
# Text to image (with upload for chat display)
npx tsx scripts/generate-image.ts --prompt "A minimalist logo with the letter S in cyan on dark background" --upload

# Edit existing image
npx tsx scripts/generate-image.ts --prompt "Remove the background" --image /path/to/photo.png --upload

# High resolution widescreen
npx tsx scripts/generate-image.ts --prompt "Futuristic city at sunset, cyberpunk" --size 2K --aspect 16:9 --upload

# Generate image + inject into current Draw canvas
npx tsx scripts/generate-image.ts --prompt "System architecture diagram" --upload --draw --page-id abc-123

# Generate image + create new Draw page
npx tsx scripts/generate-image.ts --prompt "Logo concepts" --upload --draw --draw-name "Logo Concepts"

# Generate + Draw only (no chat display needed)
npx tsx scripts/generate-image.ts --prompt "Architecture sketch" --draw
```

## When to Use

Use this skill when the user:
- Asks to **create** or **generate** an image, illustration, design, or visual
- Asks to **edit** or **modify** an existing image (pass original with `--image`)
- Needs a thumbnail, banner, logo, or any visual asset
- Sends an image and asks to change something about it
- Asks to put a generated image on the **Draw/whiteboard** canvas (add `--draw` flag)

## Draw / Whiteboard Integration

Generate an image AND place it on the Draw whiteboard in one command.

### When to Add `--draw`

Add the `--draw` flag when the user asks to place the image on the canvas/whiteboard/draw page.

### Context-Aware Page Targeting

When the user chats from a Draw page, the system may automatically inject context like:
`[Context: user is viewing draw page (page_id: abc-123)...]`

- **If context with page_id is present** -> use `--draw --page-id <page_id>` to inject into the current canvas
- **If NO context is present** -> use just `--draw` to create a new Draw page
- **If the user names a page** -> use `--draw --draw-name "Name Here"`

### Combining with `--upload`

`--draw` and `--upload` can BOTH be used together:
- `--upload` gives a public URL for displaying the image in the chat message
- `--draw` puts the image on the canvas

When both are used, include the markdown image in your response AND confirm the Draw injection.

### After Generating with `--draw`

1. If `--upload` was also used, include the image in your response as markdown: `![Description](URL)`
2. Confirm the Draw injection in plain text:
   - Injected into existing canvas: "Image added to canvas."
   - New page created: "Image created on new Draw page."

## Default Style

Unless the user specifies a different style, prepend this to the prompt:

> **"Bold thick strokes, simple shapes, didactic and dynamic illustration style, no clutter, high contrast."**

This produces clear, educational visuals that work for presentations and teaching. Override when the user explicitly asks for a different style (e.g., "photorealistic", "cyberpunk", "watercolor").

## Prompt Tips

- Be specific: "A golden retriever wearing sunglasses on a beach at sunset" > "a dog"
- Specify style: "photorealistic", "illustration", "watercolor", "pixel art", "minimalist", "3D render"
- For edits: describe the change clearly: "Make the sky purple" or "Add a hat to the person"
- For logos/text: Gemini can render text in images, specify what text to include

## After Generating -- CRITICAL

**ALWAYS include the image in your response as markdown so it renders in the chat:**

```markdown
![Description of the image](URL_FROM_SCRIPT_OUTPUT)
```

Extract the URL from the `URL:https://...` line in the script output and embed it as a markdown image.
This way the user sees the image directly in chat without having to find it on the filesystem.
