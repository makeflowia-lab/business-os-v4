/**
 * generate-image.ts — Generate or edit images via OpenRouter (Gemini image models).
 *
 * Usage:
 *   npx tsx scripts/generate-image.ts --prompt "A cat in space"
 *   npx tsx scripts/generate-image.ts --prompt "Make it blue" --image /path/to/input.png
 *   npx tsx scripts/generate-image.ts --prompt "Logo design" --output /path/to/output.png
 *   npx tsx scripts/generate-image.ts --prompt "Hi-res landscape" --size 2K --aspect 16:9
 *   npx tsx scripts/generate-image.ts --prompt "Business chart" --upload  # Uploads to Supabase Storage
 *   npx tsx scripts/generate-image.ts --prompt "Logo design" --draw                     # Generate + new Draw page
 *   npx tsx scripts/generate-image.ts --prompt "Logo design" --draw --page-id abc-123   # Generate + inject into existing canvas
 *   npx tsx scripts/generate-image.ts --prompt "Logo design" --upload --draw             # Upload + Draw (both)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname, extname, basename } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PROJECT_ROOT = join(__dirname, '..')
const OUTPUT_DIR = join(PROJECT_ROOT, 'workspace', 'generated')

// ─── Read .env ───────────────────────────────────────────────────────────────

function readEnv(): Record<string, string> {
  try {
    const content = readFileSync(join(PROJECT_ROOT, '.env'), 'utf-8')
    const env: Record<string, string> = {}
    for (const line of content.split('\n')) {
      const match = line.match(/^([^#=]+)=(.*)$/)
      if (match) env[match[1].trim()] = match[2].trim()
    }
    return env
  } catch {
    return {}
  }
}

const env = readEnv()
const API_KEY = env['OPENROUTER_API_KEY'] ?? process.env['OPENROUTER_API_KEY'] ?? ''
const API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const DEFAULT_MODEL = 'google/gemini-3.1-flash-image-preview'

// Supabase Storage (Mission Control project)
const MC_SUPABASE_URL = env['MC_SUPABASE_URL'] ?? process.env['MC_SUPABASE_URL'] ?? ''
const MC_SUPABASE_KEY = env['MC_SUPABASE_KEY'] ?? process.env['MC_SUPABASE_KEY'] ?? ''
const STORAGE_BUCKET = 'generated-images'

// Draw API (Mission Control)
const OPENCLAW_GATEWAY_TOKEN = env['OPENCLAW_GATEWAY_TOKEN'] ?? process.env['OPENCLAW_GATEWAY_TOKEN'] ?? ''
const MC_DRAW_API_URL = env['MC_DRAW_API_URL'] ?? process.env['MC_DRAW_API_URL'] ?? 'http://localhost:3000'

// ─── Supabase Storage Upload ─────────────────────────────────────────────────

async function uploadToSupabase(filePath: string, fileBuffer: Buffer, mimeType: string): Promise<string | null> {
  if (!MC_SUPABASE_URL || !MC_SUPABASE_KEY) {
    console.error('WARN: MC_SUPABASE_URL or MC_SUPABASE_KEY not set, skipping upload')
    return null
  }

  const filename = basename(filePath)
  const storagePath = `${filename}`

  // Upload to Supabase Storage
  const uploadUrl = `${MC_SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${storagePath}`
  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${MC_SUPABASE_KEY}`,
      'Content-Type': mimeType,
      'x-upsert': 'true',
    },
    body: fileBuffer,
  })

  if (!res.ok) {
    const error = await res.text()
    console.error(`Storage upload error (${res.status}): ${error}`)
    return null
  }

  // Return public URL
  return `${MC_SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${storagePath}`
}

// ─── PNG Dimensions ─────────────────────────────────────────────────────────

function readPngDimensions(buffer: Buffer): { width: number; height: number } | null {
  const PNG_SIG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  if (buffer.length < 24 || !buffer.subarray(0, 8).equals(PNG_SIG)) return null
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) }
}

// ─── Excalidraw Image Builder ───────────────────────────────────────────────

function buildExcalidrawImage(
  fileBuffer: Buffer,
  mimeType: string,
  dimensions: { width: number; height: number },
  position: { x: number; y: number },
): { element: Record<string, unknown>; fileEntry: Record<string, unknown>; fileId: string } {
  const ts = Date.now()
  const fileId = `img-file-${ts}`
  const elemId = `img-elem-${ts}`

  let w = dimensions.width
  let h = dimensions.height
  const MAX_WIDTH = 800
  if (w > MAX_WIDTH) {
    const scale = MAX_WIDTH / w
    w = MAX_WIDTH
    h = Math.round(h * scale)
  }

  const base64 = fileBuffer.toString('base64')
  const dataURL = `data:${mimeType};base64,${base64}`

  const element: Record<string, unknown> = {
    type: 'image',
    id: elemId,
    fileId,
    x: position.x,
    y: position.y,
    width: w,
    height: h,
    angle: 0,
    opacity: 100,
    strokeColor: 'transparent',
    backgroundColor: 'transparent',
    fillStyle: 'solid',
    strokeWidth: 0,
    strokeStyle: 'solid',
    roughness: 0,
    roundness: null,
    isDeleted: false,
    boundElements: null,
    groupIds: [],
    frameId: null,
    seed: Math.floor(Math.random() * 2000000000),
    version: 1,
    versionNonce: Math.floor(Math.random() * 2000000000),
    updated: ts,
    link: null,
    locked: false,
    status: 'saved',
    scale: [1, 1],
  }

  const fileEntry: Record<string, unknown> = {
    mimeType,
    id: fileId,
    dataURL,
    created: ts,
    lastRetrieved: ts,
  }

  return { element, fileEntry, fileId }
}

// ─── Draw Injection ─────────────────────────────────────────────────────────

async function injectIntoDraw(
  element: Record<string, unknown>,
  fileId: string,
  fileEntry: Record<string, unknown>,
  pageId?: string,
  drawName?: string,
): Promise<{ pageId: string; url: string } | null> {
  if (!OPENCLAW_GATEWAY_TOKEN) {
    console.error('WARN: OPENCLAW_GATEWAY_TOKEN not set, skipping Draw injection')
    return null
  }

  const files = { [fileId]: fileEntry }
  const headers = {
    'Authorization': `Bearer ${OPENCLAW_GATEWAY_TOKEN}`,
    'Content-Type': 'application/json',
  }

  if (pageId) {
    // Read existing canvas for positioning
    const getRes = await fetch(`${MC_DRAW_API_URL}/api/draw/${pageId}`, {
      method: 'GET',
      headers,
    })

    if (getRes.ok) {
      const canvasData = await getRes.json() as {
        bounding_box?: { maxY: number } | null
      }
      if (canvasData.bounding_box) {
        element.x = 100
        element.y = canvasData.bounding_box.maxY + 100
      }
    }

    // PATCH inject into existing canvas
    const patchRes = await fetch(`${MC_DRAW_API_URL}/api/draw/${pageId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ elements: [element], files }),
    })

    if (!patchRes.ok) {
      const err = await patchRes.text()
      console.error(`Draw PATCH error (${patchRes.status}): ${err}`)
      return null
    }

    const result = await patchRes.json() as { page_id: string; url: string }
    return { pageId: result.page_id, url: result.url }
  } else {
    // POST create new Draw page
    const postRes = await fetch(`${MC_DRAW_API_URL}/api/draw`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: drawName || 'Generated Image',
        elements: [element],
        files,
      }),
    })

    if (!postRes.ok) {
      const err = await postRes.text()
      console.error(`Draw POST error (${postRes.status}): ${err}`)
      return null
    }

    const result = await postRes.json() as { page_id: string; url: string }
    return { pageId: result.page_id, url: result.url }
  }
}

// ─── Parse args ──────────────────────────────────────────────────────────────

interface Args {
  prompt: string
  imagePath?: string
  outputPath?: string
  model?: string
  size?: string
  aspect?: string
  upload?: boolean
  draw?: boolean
  pageId?: string
  drawName?: string
}

function parseArgs(): Args {
  const args = process.argv.slice(2)
  let prompt = ''
  let imagePath: string | undefined
  let outputPath: string | undefined
  let model: string | undefined
  let size: string | undefined
  let aspect: string | undefined
  let upload = false
  let draw = false
  let pageId: string | undefined
  let drawName: string | undefined

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--prompt' && args[i + 1]) { prompt = args[++i]; continue }
    if (args[i] === '--image' && args[i + 1]) { imagePath = args[++i]; continue }
    if (args[i] === '--output' && args[i + 1]) { outputPath = args[++i]; continue }
    if (args[i] === '--model' && args[i + 1]) { model = args[++i]; continue }
    if (args[i] === '--size' && args[i + 1]) { size = args[++i]; continue }
    if (args[i] === '--aspect' && args[i + 1]) { aspect = args[++i]; continue }
    if (args[i] === '--upload') { upload = true; continue }
    if (args[i] === '--draw') { draw = true; continue }
    if (args[i] === '--page-id' && args[i + 1]) { pageId = args[++i]; continue }
    if (args[i] === '--draw-name' && args[i + 1]) { drawName = args[++i]; continue }
    if (!prompt) prompt = args[i]
  }

  return { prompt, imagePath, outputPath, model, size, aspect, upload, draw, pageId, drawName }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  if (!API_KEY) {
    console.error('ERROR: OPENROUTER_API_KEY not set in .env')
    process.exit(1)
  }

  const { prompt, imagePath, outputPath, model, size, aspect, upload, draw, pageId, drawName } = parseArgs()
  if (!prompt) {
    console.error('Usage: npx tsx scripts/generate-image.ts --prompt "description" [--image input.png] [--output out.png] [--size 2K] [--aspect 16:9]')
    process.exit(1)
  }

  // Build message content
  type ContentPart =
    | { type: 'text'; text: string }
    | { type: 'image_url'; image_url: { url: string } }

  const content: ContentPart[] = [{ type: 'text', text: prompt }]

  if (imagePath) {
    const imageBuffer = readFileSync(imagePath)
    const base64 = imageBuffer.toString('base64')
    const ext = extname(imagePath).slice(1).toLowerCase()
    const mimeType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg'
      : ext === 'webp' ? 'image/webp'
      : ext === 'gif' ? 'image/gif'
      : 'image/png'
    content.push({
      type: 'image_url',
      image_url: { url: `data:${mimeType};base64,${base64}` },
    })
  }

  const body: Record<string, unknown> = {
    model: model ?? DEFAULT_MODEL,
    messages: [{ role: 'user', content }],
    modalities: ['image', 'text'],
    ...(size || aspect ? {
      image_config: {
        ...(size && { image_size: size }),
        ...(aspect && { aspect_ratio: aspect }),
      },
    } : {}),
  }

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const error = await res.text()
    console.error(`OpenRouter API error (${res.status}): ${error}`)
    process.exit(1)
  }

  const data = await res.json() as {
    choices?: Array<{
      message?: {
        content?: string
        images?: Array<{
          type: string
          image_url: { url: string }
        }>
      }
    }>
  }

  const message = data.choices?.[0]?.message
  if (!message) {
    console.error('No response from OpenRouter')
    console.error(JSON.stringify(data, null, 2))
    process.exit(1)
  }

  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true })

  let savedPath = ''
  const responseText = message.content ?? ''

  // Extract image from message.images array
  if (message.images?.length) {
    for (const img of message.images) {
      const dataUrl = img.image_url?.url ?? ''
      const match = dataUrl.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/)
      if (match) {
        const ext = match[1] === 'jpeg' ? 'jpg' : match[1]
        const filename = outputPath ?? join(OUTPUT_DIR, `img-${Date.now()}.${ext}`)

        const parentDir = dirname(filename)
        if (!existsSync(parentDir)) mkdirSync(parentDir, { recursive: true })

        writeFileSync(filename, Buffer.from(match[2], 'base64'))
        savedPath = filename
      }
    }
  }

  // Upload to Supabase Storage if --upload flag is set
  if (savedPath && upload) {
    const fileBuffer = readFileSync(savedPath)
    const ext = extname(savedPath).slice(1).toLowerCase()
    const mimeType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg'
      : ext === 'webp' ? 'image/webp'
      : 'image/png'
    const publicUrl = await uploadToSupabase(savedPath, fileBuffer, mimeType)
    if (publicUrl) {
      console.log(`URL:${publicUrl}`)
    }
  }

  // Inject into Draw if --draw flag is set
  if (savedPath && draw) {
    const drawBuffer = readFileSync(savedPath)
    const drawExt = extname(savedPath).slice(1).toLowerCase()
    const drawMime = drawExt === 'jpg' || drawExt === 'jpeg' ? 'image/jpeg'
      : drawExt === 'webp' ? 'image/webp'
      : 'image/png'

    const dims = drawMime === 'image/png'
      ? readPngDimensions(drawBuffer) ?? { width: 800, height: 600 }
      : { width: 800, height: 600 }

    const { element, fileEntry, fileId } = buildExcalidrawImage(
      drawBuffer, drawMime, dims, { x: 100, y: 100 },
    )

    const drawResult = await injectIntoDraw(element, fileId, fileEntry, pageId, drawName)
    if (drawResult) {
      console.log(`DRAW:${drawResult.pageId}`)
      console.log(`DRAW_URL:${drawResult.url}`)
    }
  }

  if (savedPath) console.log(`IMAGE:${savedPath}`)
  if (responseText) console.log(`TEXT:${responseText}`)
  if (!savedPath && !responseText) console.log('No image or text generated')
}

main().catch((err) => {
  console.error(`Error: ${err}`)
  process.exit(1)
})
