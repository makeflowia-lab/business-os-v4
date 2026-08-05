import { NextResponse } from 'next/server'

/**
 * Crea un Session Token de LiveAvatar (HeyGen) en el servidor.
 *
 * IMPORTANTE: La antigua "Streaming/Interactive Avatar API" de HeyGen
 * (/v1/streaming.*) fue APAGADA (sunset). El sucesor oficial es LiveAvatar,
 * que usa SU PROPIA API key (NO la API key normal de HeyGen) y creditos
 * independientes. La key se obtiene en: https://app.liveavatar.com/developers
 *
 * Flujo: backend crea session_token -> frontend lo usa con el SDK
 * @heygen/liveavatar-web-sdk para abrir la videollamada en tiempo real.
 */
export async function POST() {
  const apiKey = process.env.LIVEAVATAR_API_KEY
  const avatarId =
    process.env.NEXT_PUBLIC_LIVEAVATAR_AVATAR_ID || process.env.LIVEAVATAR_AVATAR_ID

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          'Falta LIVEAVATAR_API_KEY. Obtenla en https://app.liveavatar.com/developers ' +
          '(ojo: la API key de HeyGen NO sirve para LiveAvatar).',
      },
      { status: 500 },
    )
  }

  if (!avatarId) {
    return NextResponse.json(
      {
        error:
          'Falta NEXT_PUBLIC_LIVEAVATAR_AVATAR_ID. Debe ser el UUID de un avatar de LiveAvatar ' +
          '(lo eliges en https://app.liveavatar.com).',
      },
      { status: 500 },
    )
  }

  try {
    const res = await fetch('https://api.liveavatar.com/v1/sessions/token', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        avatar_id: avatarId,
        mode: 'FULL',
        avatar_persona: {
          // El avatar habla en espanol. voice_id es opcional: si no se pasa,
          // usa la voz por defecto del avatar.
          language: process.env.LIVEAVATAR_LANGUAGE || 'es',
          ...(process.env.LIVEAVATAR_VOICE_ID
            ? { voice_id: process.env.LIVEAVATAR_VOICE_ID }
            : {}),
        },
        // Duracion maxima de sesion (segundos). En el plan Free de LiveAvatar
        // el limite es 120s (2 min). Configurable via LIVEAVATAR_MAX_SESSION_DURATION.
        max_session_duration: Number(process.env.LIVEAVATAR_MAX_SESSION_DURATION) || 120,
      }),
    })

    const data = await res.json().catch(() => null)
    const sessionToken = data?.data?.session_token

    if (!res.ok || !sessionToken) {
      console.error('[LiveAvatar] token error:', res.status, data)
      return NextResponse.json(
        {
          error:
            data?.message ||
            `LiveAvatar rechazo la solicitud de token (HTTP ${res.status}).`,
          code: data?.code,
        },
        { status: res.status >= 400 ? res.status : 502 },
      )
    }

    return NextResponse.json({
      sessionToken,
      sessionId: data.data.session_id,
    })
  } catch (error) {
    console.error('[LiveAvatar] Error al crear session token:', error)
    return NextResponse.json(
      { error: 'No se pudo contactar con LiveAvatar.' },
      { status: 500 },
    )
  }
}
