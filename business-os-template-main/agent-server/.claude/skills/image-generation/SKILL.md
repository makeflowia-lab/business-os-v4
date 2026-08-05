---
name: image-generation
description: Generate and edit images using OpenRouter + Gemini. Use when the user asks to create, generate, or edit images.
triggers: image, generate image, create image, picture, edit image, thumbnail, banner, illustration, draw, design
---

# Image Generation (OpenRouter + Gemini)

Generate images from text prompts or edit existing images via OpenRouter's Gemini image models.

## Command

```bash
npx tsx scripts/generate-image.ts --prompt "PROMPT" [--image /path/to/input.png] [--output /path/to/output.png] [--size 2K] [--aspect 16:9]
```

## Arguments

| Arg | Required | Description |
|-----|----------|-------------|
| `--prompt` | YES | Text description of what to generate or how to edit |
| `--image` | NO | Path to input image (for editing/transforming an existing image) |
| `--output` | NO | Custom output path. Default: `workspace/generated/img-{timestamp}.png` |
| `--size` | NO | Image size: `1K` (default), `2K`, `4K` |
| `--aspect` | NO | Aspect ratio: `1:1`, `16:9`, `9:16`, `4:3`, `3:2`, etc. |
| `--model` | NO | Model ID. Default: `google/gemini-3.1-flash-image-preview` |

### Available Models

| Model | Best for |
|-------|----------|
| `google/gemini-3.1-flash-image-preview` | Fast generation, editing (default) |
| `google/gemini-2.0-flash-exp:free` | Free tier, text + image |

## Output Format

The script prints to stdout:
- `IMAGE:/path/to/generated.png` — path to saved image
- `TEXT:response text` — any text the model returned

## Examples

```bash
# Text to image
npx tsx scripts/generate-image.ts --prompt "A futuristic city at sunset, cyberpunk style"

# High resolution with aspect ratio
npx tsx scripts/generate-image.ts --prompt "Mountain landscape" --size 2K --aspect 16:9

# Edit an existing image
npx tsx scripts/generate-image.ts --prompt "Add a rainbow in the sky" --image photo.png

# Custom output path
npx tsx scripts/generate-image.ts --prompt "Logo design" --output ./my-logo.png
```

## Requirements

- `OPENROUTER_API_KEY` in `.env` — get one at https://openrouter.ai/keys

## How to Use in Conversation

When the user asks to generate or edit an image:
1. Run the script with their description as the `--prompt`
2. If they provide an image to edit, use `--image` with the file path
3. Show them the generated image path from the `IMAGE:` output
4. Use the `Read` tool to display the image to the user
