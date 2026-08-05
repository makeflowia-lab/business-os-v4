import sharp from 'sharp'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { writeFileSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const publicDir = join(__dirname, '..', 'public')

async function generateIcons() {
  const logoPath = join(publicDir, 'logo.png')

  console.log('Generating PWA icons from logo.png...')

  // Generate 192x192 icon
  await sharp(logoPath)
    .resize(192, 192)
    .png()
    .toFile(join(publicDir, 'icon-192.png'))
  console.log('Created icon-192.png')

  // Generate 512x512 icon
  await sharp(logoPath)
    .resize(512, 512)
    .png()
    .toFile(join(publicDir, 'icon-512.png'))
  console.log('Created icon-512.png')

  // Generate favicon (32x32 PNG - modern browsers support PNG favicons)
  await sharp(logoPath)
    .resize(32, 32)
    .png()
    .toFile(join(publicDir, 'favicon.png'))
  console.log('Created favicon.png')

  // Generate Apple Touch Icon (180x180)
  await sharp(logoPath)
    .resize(180, 180)
    .png()
    .toFile(join(publicDir, 'apple-touch-icon.png'))
  console.log('Created apple-touch-icon.png')

  console.log('All icons generated successfully!')
}

generateIcons().catch(console.error)
