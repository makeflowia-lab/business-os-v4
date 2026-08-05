import { Bot, Context, InputFile } from 'grammy'
import { TELEGRAM_BOT_TOKEN, ALLOWED_CHAT_ID, TYPING_REFRESH_MS, MAX_MESSAGE_LENGTH } from './config.js'
import { getSession, setSession, clearSession, getMemoriesByChatId, clearMemories } from './db.js'
// Note: clearMemories added to db.ts
import { runAgent } from './agent.js'
import { buildMemoryContext, saveConversationTurn } from './memory.js'
import { voiceCapabilities, transcribeAudio, synthesizeSpeech } from './voice.js'
import { downloadMedia, buildPhotoMessage, buildDocumentMessage } from './media.js'
import { listTasks } from './db.js'
import { logger } from './logger.js'
import { mcStart, mcEnd, mcError } from './mc-client.js'
import { validateInput } from './security.js'

// ─── Formatting ─────────────────────────────────────────────────────────────

/**
 * Convierte markdown a HTML compatible con Telegram (modo HTML).
 * Protege code blocks primero para evitar doble-escape.
 */
export function formatForTelegram(text: string): string {
  // Extraer code blocks con placeholders
  const codeBlocks: string[] = []
  let result = text.replace(/```[\s\S]*?```/g, (match) => {
    const lang = match.match(/^```(\w+)/)?.[1] ?? ''
    const code = match.replace(/^```\w*\n?/, '').replace(/```$/, '')
    const escaped = escapeHtml(code)
    codeBlocks.push(`<pre><code class="language-${lang}">${escaped}</code></pre>`)
    return `\x00CODEBLOCK${codeBlocks.length - 1}\x00`
  })

  // Inline code
  const inlineCodes: string[] = []
  result = result.replace(/`([^`]+)`/g, (_, code) => {
    inlineCodes.push(`<code>${escapeHtml(code)}</code>`)
    return `\x00INLINE${inlineCodes.length - 1}\x00`
  })

  // Escapar HTML en texto normal
  result = escapeHtml(result)

  // Bold y italic (en texto ya escapado, solo afectan ** y *)
  result = result
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/\*(.+?)\*/g, '<i>$1</i>')
    .replace(/__(.+?)__/g, '<b>$1</b>')
    .replace(/_(.+?)_/g, '<i>$1</i>')

  // Restaurar code blocks e inline codes
  result = result.replace(/\x00INLINE(\d+)\x00/g, (_, i) => inlineCodes[parseInt(i)])
  result = result.replace(/\x00CODEBLOCK(\d+)\x00/g, (_, i) => codeBlocks[parseInt(i)])

  return result
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/**
 * Divide un mensaje largo en chunks que respetan el límite de Telegram.
 * Corta en newlines, nunca en medio de una palabra.
 */
export function splitMessage(text: string, limit = MAX_MESSAGE_LENGTH): string[] {
  if (text.length <= limit) return [text]

  const chunks: string[] = []
  const lines = text.split('\n')
  let current = ''

  for (const line of lines) {
    const candidate = current ? current + '\n' + line : line
    if (candidate.length > limit) {
      if (current) chunks.push(current)
      // Si una sola línea excede el límite, cortarla por palabras
      if (line.length > limit) {
        const words = line.split(' ')
        let wordChunk = ''
        for (const word of words) {
          const wc = wordChunk ? wordChunk + ' ' + word : word
          if (wc.length > limit) {
            if (wordChunk) chunks.push(wordChunk)
            wordChunk = word
          } else {
            wordChunk = wc
          }
        }
        current = wordChunk
      } else {
        current = line
      }
    } else {
      current = candidate
    }
  }

  if (current) chunks.push(current)
  return chunks
}

// ─── Auth ────────────────────────────────────────────────────────────────────

function isAuthorised(chatId: number | string): boolean {
  return String(chatId) === String(ALLOWED_CHAT_ID)
}

// ─── Core message handler ────────────────────────────────────────────────────

export async function handleMessage(
  ctx: Context,
  rawText: string,
  forceVoiceReply = false
): Promise<void> {
  const chatId = String(ctx.chat?.id)
  if (!isAuthorised(chatId)) {
    await ctx.reply('Unauthorized.')
    return
  }

  // Indicador de escritura en loop
  let typingActive = true
  const sendTyping = async () => {
    if (!typingActive) return
    try {
      await ctx.api.sendChatAction(ctx.chat!.id, 'typing')
    } catch {
      // ignorar errores de typing
    }
  }
  await sendTyping()
  const typingInterval = setInterval(() => { void sendTyping() }, TYPING_REFRESH_MS)

  // Input validation (logs suspicious patterns, truncates if too long)
  rawText = validateInput(rawText, 'telegram')

  // Unique run ID per conversation (for Mission Control)
  const runId = `tg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  mcStart(runId, rawText, 'telegram')

  try {
    // Contexto de memoria
    const memoryCtx = await buildMemoryContext(chatId, rawText)
    const fullMessage = memoryCtx ? `${memoryCtx}\n\n${rawText}` : rawText

    // Sesión Claude Code (getSession returns string | undefined directly)
    const sessionId = getSession(chatId)

    const result = await runAgent(
      fullMessage,
      sessionId,
      sendTyping
    )

    typingActive = false
    clearInterval(typingInterval)

    const responseText = result.text?.trim() ?? ''

    if (result.newSessionId) {
      setSession(chatId, result.newSessionId)
    }

    // Guardar turno en memoria
    if (responseText) {
      await saveConversationTurn(chatId, rawText, responseText)
    }

    // Notificar Mission Control — conversación completada
    mcEnd(runId, responseText)

    // TTS si el mensaje fue por voz
    const caps = voiceCapabilities()
    logger.info({ forceVoiceReply, tts: caps.tts, responseLen: responseText.length }, 'TTS check')
    if (forceVoiceReply && caps.tts && responseText) {
      try {
        logger.info('synthesizing speech via ElevenLabs...')
        const audioBuffer = await synthesizeSpeech(responseText)
        logger.info({ bytes: audioBuffer.length }, 'TTS ok, sending voice')
        await ctx.replyWithVoice(new InputFile(audioBuffer, 'response.mp3'))
        return
      } catch (err) {
        logger.error({ err }, 'TTS failed, falling back to text')
      }
    }

    // Respuesta de texto (chunks si es largo)
    if (!responseText) {
      await ctx.reply('(sin respuesta)')
      return
    }

    const formatted = formatForTelegram(responseText)
    const chunks = splitMessage(formatted)

    for (const chunk of chunks) {
      await ctx.reply(chunk, { parse_mode: 'HTML' })
    }
  } catch (err) {
    clearInterval(typingInterval)
    typingActive = false
    logger.error({ err, chatId }, 'handleMessage error')
    mcError(runId, String(err))
    await ctx.reply(`Error: ${String(err)}`)
  }
}

// ─── Bot creation ────────────────────────────────────────────────────────────

export function createBot(): Bot {
  const bot = new Bot(TELEGRAM_BOT_TOKEN)
  const caps = voiceCapabilities()

  // /start
  bot.command('start', async (ctx) => {
    if (!isAuthorised(String(ctx.chat.id))) {
      await ctx.reply('Unauthorized.')
      return
    }
    await ctx.reply(
      'Hello! I\'m your personal AI assistant.\n\n' +
      'Available commands:\n' +
      '/newchat — Start a new conversation\n' +
      '/memory — View saved memories\n' +
      '/forget — Clear all memories\n' +
      '/voice — Voice status (STT/TTS)\n' +
      '/schedule — View scheduled tasks\n' +
      '/chatid — Show your chat ID\n\n' +
      `STT: ${caps.stt ? '✓' : '✗'}  TTS: ${caps.tts ? '✓' : '✗'}`
    )
  })

  // /chatid — útil para confirmar el ID correcto
  bot.command('chatid', async (ctx) => {
    await ctx.reply(`Chat ID: ${ctx.chat.id}`)
  })

  // /newchat — limpia sesión de Claude Code (nueva conversación)
  bot.command('newchat', async (ctx) => {
    if (!isAuthorised(String(ctx.chat.id))) return
    clearSession(String(ctx.chat.id))
    await ctx.reply('Nueva conversación iniciada. Contexto previo borrado.')
  })

  // /forget — borra memorias
  bot.command('forget', async (ctx) => {
    if (!isAuthorised(String(ctx.chat.id))) return
    clearMemories(String(ctx.chat.id))
    await ctx.reply('Memorias borradas.')
  })

  // /memory — muestra memorias guardadas
  bot.command('memory', async (ctx) => {
    if (!isAuthorised(String(ctx.chat.id))) return
    const memories = getMemoriesByChatId(String(ctx.chat.id), 20)

    if (memories.length === 0) {
      await ctx.reply('No hay memorias guardadas.')
      return
    }

    const lines = memories.map(
      (m, i) => `${i + 1}. [${m.sector}] ${m.content.slice(0, 100).replace(/\n/g, ' ')}`
    )
    const text = `Memorias (${memories.length}):\n\n${lines.join('\n')}`
    await ctx.reply(text)
  })

  // /voice — estado de capacidades de voz
  bot.command('voice', async (ctx) => {
    if (!isAuthorised(String(ctx.chat.id))) return
    const c = voiceCapabilities()
    await ctx.reply(
      `Estado de voz:\n` +
      `STT (Groq Whisper): ${c.stt ? '✓ activo' : '✗ sin GROQ_API_KEY'}\n` +
      `TTS (ElevenLabs): ${c.tts ? '✓ activo' : '✗ sin ELEVENLABS_API_KEY/VOICE_ID'}`
    )
  })

  // /schedule — lista tareas programadas
  bot.command('schedule', async (ctx) => {
    if (!isAuthorised(String(ctx.chat.id))) return
    const tasks = listTasks()

    if (tasks.length === 0) {
      await ctx.reply('No hay tareas programadas.')
      return
    }

    const lines = tasks.map((t) => {
      const tz = process.env['SCHEDULER_TZ'] ?? 'UTC'
      const nextDate = t.next_run
        ? new Date(t.next_run * 1000).toLocaleString('en-US', { timeZone: tz })
        : 'N/A'
      const status = t.status === 'active' ? '✓' : '⏸'
      return `${status} <b>${t.id}</b>\n   ${t.schedule} → ${nextDate}`
    })

    const text = `<b>Tareas programadas (${tasks.length})</b>\n\n${lines.join('\n\n')}`
    const chunks = splitMessage(text)
    for (const chunk of chunks) {
      await ctx.reply(chunk, { parse_mode: 'HTML' })
    }
  })

  // Mensajes de texto normales
  bot.on('message:text', async (ctx) => {
    if (!isAuthorised(String(ctx.chat.id))) return
    await handleMessage(ctx, ctx.message.text)
  })

  // Voice notes (STT → Claude → opcional TTS)
  bot.on('message:voice', async (ctx) => {
    if (!isAuthorised(String(ctx.chat.id))) return

    if (!caps.stt) {
      await ctx.reply('STT no disponible. Configura GROQ_API_KEY.')
      return
    }

    try {
      await ctx.api.sendChatAction(ctx.chat.id, 'typing')
      const fileId = ctx.message.voice.file_id
      const localPath = await downloadMedia(fileId, 'voice.oga')
      const transcript = await transcribeAudio(localPath)

      logger.info({ length: transcript.length }, 'voice transcribed')

      // Indicar que fue transcrito (útil para debugging)
      await handleMessage(ctx, `[Nota de voz]: ${transcript}`, true)
    } catch (err) {
      logger.error({ err }, 'voice handler error')
      await ctx.reply(`Error procesando nota de voz: ${String(err)}`)
    }
  })

  // Fotos
  bot.on('message:photo', async (ctx) => {
    if (!isAuthorised(String(ctx.chat.id))) return

    try {
      await ctx.api.sendChatAction(ctx.chat.id, 'upload_photo')
      // Tomar la foto de mayor resolución
      const photos = ctx.message.photo
      const best = photos[photos.length - 1]
      const localPath = await downloadMedia(best.file_id, 'photo.jpg')
      const caption = ctx.message.caption
      const message = buildPhotoMessage(localPath, caption)
      await handleMessage(ctx, message)
    } catch (err) {
      logger.error({ err }, 'photo handler error')
      await ctx.reply(`Error procesando foto: ${String(err)}`)
    }
  })

  // Documentos
  bot.on('message:document', async (ctx) => {
    if (!isAuthorised(String(ctx.chat.id))) return

    try {
      await ctx.api.sendChatAction(ctx.chat.id, 'upload_document')
      const doc = ctx.message.document
      const localPath = await downloadMedia(doc.file_id, doc.file_name ?? 'document')
      const caption = ctx.message.caption
      const message = buildDocumentMessage(localPath, doc.file_name ?? 'document', caption)
      await handleMessage(ctx, message)
    } catch (err) {
      logger.error({ err }, 'document handler error')
      await ctx.reply(`Error procesando documento: ${String(err)}`)
    }
  })

  // Error handler global
  bot.catch((err) => {
    logger.error({ err: err.error, ctx: err.ctx?.update }, 'bot error')
  })

  return bot
}

// ─── Sender para el scheduler ────────────────────────────────────────────────

/**
 * Retorna una función sender que el scheduler usa para enviar mensajes al grupo/DM.
 */
export function createSender(bot: Bot) {
  return async (chatId: string, text: string, threadId?: number): Promise<void> => {
    const formatted = formatForTelegram(text)
    const chunks = splitMessage(formatted)

    for (const chunk of chunks) {
      await bot.api.sendMessage(chatId, chunk, {
        parse_mode: 'HTML',
        ...(threadId ? { message_thread_id: threadId } : {}),
      })
    }
  }
}
