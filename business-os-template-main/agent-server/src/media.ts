import { writeFileSync, readdirSync, statSync, unlinkSync } from 'fs'
import { join, extname } from 'path'
import { UPLOADS_DIR, TELEGRAM_BOT_TOKEN } from './config.js'
import { logger } from './logger.js'
import { validateUrl, MAX_DOWNLOAD_SIZE } from './security.js'

/**
 * Downloads a file from Telegram to the uploads directory.
 * Returns the local path of the downloaded file.
 */
export async function downloadMedia(fileId: string, originalFilename?: string): Promise<string> {
  // 1. Get file_path from Telegram
  const fileInfoRes = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileId}`
  )
  const fileInfo = (await fileInfoRes.json()) as { ok: boolean; result?: { file_path: string } }

  if (!fileInfo.ok || !fileInfo.result?.file_path) {
    throw new Error(`getFile failed for fileId ${fileId}`)
  }

  const remotePath = fileInfo.result.file_path
  const ext = extname(remotePath) || (originalFilename ? extname(originalFilename) : '')

  // 2. Download the file
  const downloadRes = await fetch(
    `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${remotePath}`
  )

  if (!downloadRes.ok) {
    throw new Error(`download failed: ${downloadRes.status}`)
  }

  // 3. Sanitize filename: only [a-zA-Z0-9._-]
  const rawName = originalFilename ?? remotePath.split('/').pop() ?? 'file'
  const sanitized = rawName.replace(/[^a-zA-Z0-9._-]/g, '-')
  const localPath = join(UPLOADS_DIR, `${Date.now()}_${sanitized}${ext && !sanitized.includes('.') ? ext : ''}`)

  const buffer = await downloadRes.arrayBuffer()
  writeFileSync(localPath, Buffer.from(buffer))

  logger.debug({ localPath, bytes: buffer.byteLength }, 'media downloaded')
  return localPath
}

/**
 * Builds the message for Claude when a photo is sent.
 */
export function buildPhotoMessage(localPath: string, caption?: string): string {
  const lines = [`Analyze this image: ${localPath}`]
  if (caption) lines.push(`Caption: ${caption}`)
  return lines.join('\n')
}

/**
 * Builds the message for Claude when a document is sent.
 */
export function buildDocumentMessage(localPath: string, filename: string, caption?: string): string {
  const lines = [`Read and analyze this file: ${localPath} (filename: ${filename})`]
  if (caption) lines.push(`Caption: ${caption}`)
  return lines.join('\n')
}

/**
 * Downloads an image from a public URL (e.g. Supabase Storage) to the uploads directory.
 * Returns the local path of the downloaded file.
 */
export async function downloadFromUrl(url: string): Promise<string> {
  // Validate URL before downloading (SSRF protection)
  const urlError = validateUrl(url)
  if (urlError) throw new Error(urlError)

  const res = await fetch(url)
  if (!res.ok) throw new Error(`download failed: ${res.status} ${res.statusText}`)

  // Check content-length before downloading body
  const contentLength = parseInt(res.headers.get('content-length') ?? '0', 10)
  if (contentLength > MAX_DOWNLOAD_SIZE) {
    throw new Error(`download blocked: file too large (${contentLength} bytes, max ${MAX_DOWNLOAD_SIZE})`)
  }

  const contentType = res.headers.get('content-type') ?? 'image/png'
  const extMap: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
  }
  const ext = extMap[contentType] ?? '.png'
  const localPath = join(UPLOADS_DIR, `web-${Date.now()}${ext}`)

  const buffer = await res.arrayBuffer()
  if (buffer.byteLength > MAX_DOWNLOAD_SIZE) {
    throw new Error(`download blocked: file too large (${buffer.byteLength} bytes, max ${MAX_DOWNLOAD_SIZE})`)
  }
  writeFileSync(localPath, Buffer.from(buffer))

  logger.debug({ localPath, bytes: buffer.byteLength, url }, 'image downloaded from URL')
  return localPath
}

/**
 * Cleans up uploads older than maxAgeMs (default: 24h).
 * Called at startup.
 */
export function cleanupOldUploads(maxAgeMs = 24 * 60 * 60 * 1000): void {
  try {
    const now = Date.now()
    const files = readdirSync(UPLOADS_DIR)
    let cleaned = 0

    for (const file of files) {
      const filePath = join(UPLOADS_DIR, file)
      const stat = statSync(filePath)
      if (now - stat.mtimeMs > maxAgeMs) {
        unlinkSync(filePath)
        cleaned++
      }
    }

    if (cleaned > 0) {
      logger.info({ cleaned }, 'old uploads cleaned')
    }
  } catch {
    // UPLOADS_DIR may not exist yet on first boot — not an error
  }
}
