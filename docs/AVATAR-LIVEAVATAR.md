# Avatar hiperrealista en tiempo real (HeyGen LiveAvatar)

Guía completa de la integración del **avatar interactivo en tiempo real** de Raziel:
qué es, cómo funciona, los errores que encontramos, sus soluciones, y cómo reproducir
o desplegar todo desde cero. Pensada para que **cualquiera pueda implementarlo** sin
volver a pisar las mismas minas.

> **Fecha de implementación:** 2026-06-17 · **Estado:** ✅ Funcionando

---

## 1. Qué hace

Cuando entras a Raziel, en el centro de la pantalla aparece un **avatar humano realista**
(video por WebRTC, como una videollamada). Espera en estado *idle* (respirando, parpadeando)
y, cuando le hablas o le escribes, **el avatar dice en voz alta y con los labios sincronizados**
la respuesta que genera el cerebro de Raziel (OpenRouter). El menú superior y la barra de
micrófono/escribir de abajo se mantienen intactos.

- **Cerebro:** OpenRouter (igual que antes). El avatar NO usa el LLM de HeyGen.
- **Voz + cara:** HeyGen LiveAvatar (`repeat()` = el avatar dice exactamente nuestro texto).
- **Voz de entrada (micrófono):** reconocimiento de voz del navegador (`useVoice`), no el de HeyGen.

---

## 2. ⚠️ Lo más importante: NO es el SDK viejo de HeyGen

HeyGen **apagó (sunset)** su antigua *Streaming/Interactive Avatar API* (`/v1/streaming.*`).
Hoy ese endpoint devuelve **HTTP 410** (`endpoint_sunset`). El SDK `@heygen/streaming-avatar`
quedó **muerto**.

El sucesor oficial es **LiveAvatar**, que es un producto **separado**:

| | HeyGen (viejo) | **LiveAvatar (nuevo)** |
|---|---|---|
| SDK | `@heygen/streaming-avatar` ❌ | **`@heygen/liveavatar-web-sdk`** ✅ |
| API base | `api.heygen.com/v1/streaming.*` ❌ (410) | **`api.liveavatar.com`** ✅ |
| API key | la de HeyGen `sk_...` | **OTRA distinta**, de `app.liveavatar.com/developers` |
| Créditos | los de HeyGen | **independientes** (los de HeyGen NO sirven) |

> **La API key de HeyGen NO funciona en LiveAvatar y viceversa.** Los créditos también son
> monederos separados. Esto está confirmado por el propio HeyGen Help Center.

---

## 3. Errores que encontramos y cómo se resolvieron

| # | Síntoma | Causa real | Solución |
|---|---------|-----------|----------|
| 1 | El avatar nunca arrancaba | La Streaming API de HeyGen está **apagada (410)** | Migrar a **LiveAvatar** (`@heygen/liveavatar-web-sdk` + `api.liveavatar.com`) |
| 2 | `import` del SDK fallaba / sin `lib/` | El tarball de `@heygen/streaming-avatar@2.1.1` se publicó **roto** (sin la carpeta `lib/`) | Irrelevante tras migrar; el SDK nuevo trae su `lib/` completo |
| 3 | `HEYGEN_API_KEY` no se leía | En `.env.local` estaba **corrupta**: `H E Y G E N...` con espacios entre cada carácter | Reescribir la línea limpia |
| 4 | `401 Invalid API key` en LiveAvatar | Se usaba la API key de **HeyGen**, incompatible con LiveAvatar | Usar la API key de **LiveAvatar** (`app.liveavatar.com/developers`) |
| 5 | `400 Avatar not found` | Los IDs viejos (ej. `Wayne_20240711`) no sirven; LiveAvatar usa **UUID** | Usar un UUID de `GET /v1/avatars/public` |
| 6 | El video sería bloqueado por el navegador | El `Content-Security-Policy` (`connect-src`) no permitía LiveAvatar/LiveKit | Agregar `api.liveavatar.com`, `*.liveavatar.com`, `*.livekit.cloud` (https + wss) al CSP |
| 7 | Posible doble sesión / error de concurrencia en dev | React StrictMode monta 2 veces; el plan Free permite **1 sesión** | `reactStrictMode: false` + cerrar la sesión sobrante tras `start()` |
| 8 | La voz se oía rara en español | La voz por defecto del avatar está etiquetada "en" | `avatar_persona.language: 'es'` + `voice_id` de una voz latina (Pedro - IA) |
| 9 | Riesgo de fuga de secretos | `.gitignore` no excluía `.env.local` | Agregar `.env` y `.env*.local` al `.gitignore` |

---

## 4. Arquitectura

```
Navegador (cliente)                         Servidor (Next.js)            LiveAvatar
─────────────────                          ─────────────────             ──────────
HeyGenAvatar.tsx                            /api/heygen-token
  │  fetch POST /api/heygen-token  ───────▶  POST api.liveavatar.com/v1/sessions/token
  │                                          (header X-API-KEY)      ───▶  devuelve session_token
  │  ◀─────────────────────────  { sessionToken }
  │
  │  new LiveAvatarSession(sessionToken,{voiceChat:false})
  │  session.start()  ──────────────────────────────────────────────▶  abre sala LiveKit (WebRTC)
  │  on(SESSION_STREAM_READY) → session.attach(<video>)
  │
Chat (page.tsx) → onFinish → window.heygenSpeak(texto)
  │  session.repeat(texto)  ────────────────────────────────────────▶  el avatar lo dice (TTS)
  │  on(AVATAR_SPEAK_STARTED/ENDED) → indicador "Hablando"
```

**Archivos clave:**

| Archivo | Rol |
|---------|-----|
| `src/app/api/heygen-token/route.ts` | Crea el `session_token` en el servidor con la API key (header `X-API-KEY`, modo `FULL`, `avatar_persona.language='es'`). |
| `src/features/raziel/components/HeyGenAvatar.tsx` | Componente cliente (`'use client'`). Crea `LiveAvatarSession`, hace `attach()` al `<video>`, expone `window.heygenSpeak/heygenStop`. |
| `src/app/page.tsx` | Layout: video al centro, menú arriba, barra abajo. Botón **"Activar Raziel en vivo"**, toggle de transcripción, reconexión. |
| `next.config.ts` | CSP `connect-src` con dominios de LiveAvatar/LiveKit + `reactStrictMode:false`. |
| `.env.local` | `LIVEAVATAR_API_KEY`, `NEXT_PUBLIC_LIVEAVATAR_AVATAR_ID`, `LIVEAVATAR_MAX_SESSION_DURATION`, `LIVEAVATAR_VOICE_ID`. |

**Decisiones confirmadas (verificadas contra la API y el demo oficial):**

- `mode: "FULL"` en el **token** (no en el constructor — el SDK lo deduce del JWT).
- Sin `context_id` → "modo restringido": el avatar **solo** habla lo que mandamos con `repeat()`.
- `voiceChat: false` → no pide micrófono (usamos el STT del navegador).
- `session.repeat(texto)` (NO `session.message()`, que metería el LLM de HeyGen).
- `attach(videoEl)` en el evento `SESSION_STREAM_READY` (engancha video + audio).

---

## 5. Variables de entorno (`.env.local`)

```bash
# API key de LiveAvatar (de app.liveavatar.com/developers — NO la de HeyGen)
LIVEAVATAR_API_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
# UUID del avatar (de GET /v1/avatars/public)
NEXT_PUBLIC_LIVEAVATAR_AVATAR_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
# Duración máx. de sesión en SEGUNDOS (plan Free = 120 = 2 min)
LIVEAVATAR_MAX_SESSION_DURATION=120
# (Opcional) Voz específica, p. ej. una voz masculina latina multilingüe del catálogo
LIVEAVATAR_VOICE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
# (Opcional) Idioma. Default: es
# LIVEAVATAR_LANGUAGE=es
```

> En producción (VPS/Easypanel) hay que **volver a poner estas variables** en el panel de
> entorno. El `.env.local` NO viaja al servidor (es local y está en `.gitignore`).

---

## 6. Cómo conseguir cuenta, clave, avatar y voz

1. **Cuenta + créditos:** entra a `https://app.liveavatar.com`, crea cuenta y (en *Pricing*,
   abajo a la izquierda) elige plan. El **Free** da 10 créditos/mes, sesiones de máx. 2 min,
   1 sesión a la vez y marca de agua.
2. **API key:** `https://app.liveavatar.com/developers` → copia la key (formato UUID).
3. **Avatar (UUID):** lista los avatares preset con:
   ```bash
   curl -H "X-API-KEY: <tu-key>" https://api.liveavatar.com/v1/avatars/public
   ```
   Hay ~83 avatares. Cada uno trae su propio UUID en la respuesta del endpoint; copia el
   que prefieras a `NEXT_PUBLIC_LIVEAVATAR_AVATAR_ID`.
4. **Voz (UUID):** lista las voces con:
   ```bash
   curl -H "X-API-KEY: <tu-key>" https://api.liveavatar.com/v1/voices
   ```
   El catálogo incluye varias voces masculinas y femeninas en español latino; copia el UUID
   de la que prefieras a `LIVEAVATAR_VOICE_ID`.

---

## 7. Límites del plan Free (importante)

- **2 minutos por sesión.** Al cumplirse, la sesión se desconecta y aparece **"Reconectar"**.
- **1 sesión concurrente.** No abras dos pestañas a la vez.
- **10 créditos/mes** → el crédito se consume mientras el avatar está conectado (no solo al hablar).
- **Marca de agua** en el video.

Por eso el avatar **NO se conecta solo** al cargar la página: hay un botón
**"▶ Activar Raziel en vivo"** que lo conecta con un clic (ahorra créditos y, de paso,
ese clic habilita el audio que el navegador bloquea por autoplay). En un plan de pago se
puede dejar en automático (ver sección 10).

---

## 8. Correr en local

```bash
cd Raziel
npm run dev
# Abrir la URL que muestre (ej. http://localhost:3000)
# Login → contraseña RAZIEL_PASSWORD (.env.local), ej. maestro2024
# Pulsar "▶ Activar Raziel en vivo"
```

## 9. Desplegar al VPS (Easypanel)

1. Subir el código (el repo es privado).
2. En Easypanel → **Environment**, agregar: `LIVEAVATAR_API_KEY`,
   `NEXT_PUBLIC_LIVEAVATAR_AVATAR_ID`, `LIVEAVATAR_MAX_SESSION_DURATION`, `LIVEAVATAR_VOICE_ID`
   (y las demás claves del proyecto).
3. Build: `npm run build` · Start: `npm start`.
4. El sitio debe servirse por **HTTPS** (WebRTC/getUserMedia lo exigen).

---

## 10. Troubleshooting

| Problema | Qué revisar |
|----------|-------------|
| `401 Invalid API key` | Estás usando la key de HeyGen, no la de LiveAvatar. |
| `400 Avatar not found` | El `avatar_id` no es un UUID válido de `/v1/avatars/public`. |
| **403 al conectar** (`/v1/sessions/start`) | El servidor debe devolver el `session_token` correcto (en `route.ts`: `data.data.session_token`). Un token mal extraído causa este 403. |
| El video carga pero **sin audio** | Autoplay del navegador: el clic en "Activar" debe preceder al audio. Si sigue mudo, toca el botón de voz (🔊) en el header. |
| Error de **concurrencia** | Plan Free = 1 sesión. Cierra otras pestañas; `reactStrictMode:false` evita la doble sesión en dev. |
| La voz suena **poco natural** | Cambia `LIVEAVATAR_VOICE_ID` por otra voz (sección 6) y prueba. |
| El stream se corta a los **2 min** | Es el límite del plan Free. Pulsa "Reconectar" o sube de plan. |
| CSP bloquea conexiones | Revisa la consola del navegador y agrega el host bloqueado a `connect-src` en `next.config.ts`. |

---

## 11. Modificaciones futuras

- [x] **Ocultar la transcripción** — hecho: oculta por defecto, con toggle (👁) en el header.
- [x] **Transcripción fuera del video** — hecho: ahora se muestra en un **panel aparte DEBAJO**
      del video (no superpuesta sobre el avatar). Ver `page.tsx` (zona central en `flex-col`).
- [x] **Reducir el retardo** — hecho: el avatar **habla por frases mientras se genera** la
      respuesta (no espera a terminar). Ver `speakStream()` en `page.tsx`: durante el stream se
      envían las frases completas a `repeat()`; en `onFinish` se vacía la última frase parcial.
- [x] **Voz en español** — `LIVEAVATAR_VOICE_ID` = Pedro - IA + `language: 'es'`.
- [ ] **Voz natural es-MX / es-VE específica**: las voces preset NO exponen región (todas
      `language: "en"`, multilingües). Para acento mexicano/venezolano real, lo más natural es
      una voz de **ElevenLabs** (vía el plugin ElevenLabs Agent de LiveAvatar) o una **voz clonada**
      (planes de pago). Pendiente de evaluar costo.
- [ ] **Auto-conectar al cargar** (con plan de pago): quitar el botón y montar `HeyGenAvatar`
      directo (ya con un gesto previo para el audio).
- [ ] **Avatar/voz clonada propia** (el "hombre de traje" real): crear avatar y/o clonar voz
      en `app.liveavatar.com` y poner sus UUID en `.env.local`.
- [ ] **Avatar siempre vivo** (idle largo): subir `LIVEAVATAR_MAX_SESSION_DURATION` y usar
      `session.keepAlive()` periódicamente (consume más crédito).

---

## 12. Viabilidad y costos (investigación 2026-06-17)

> Cifras de investigación; **confirmar precios vigentes en `app.liveavatar.com`** antes de
> escalar (los planes cambian).

### Costo del cerebro (OpenRouter · gemini-2.5-flash) — DESPRECIABLE
- ~$0.30 / 1M tokens entrada · ~$2.50 / 1M salida.
- Una respuesta (~2.100 tokens de prompt + reply corta) ≈ **$0.0014** (≈ 0,14 centavos).
- 100 conversaciones (~500 turnos) ≈ **~$1/mes**.
- ⚠️ Gemini 2.5 Flash cobra tokens de "thinking" ocultos a precio de salida. Para un cerebro
  que solo habla (TTS), conviene **desactivar/limitar el reasoning** o el costo se multiplica.

### Costo del avatar (LiveAvatar) — ES EL COSTO REAL
- Se cobra por **minuto conectado**, no por mensaje. 1 crédito ≈ **$0.10**.
- **Modo FULL** (el que usamos — necesario para hablar español con voz elegida) ≈ **2 créditos/min ≈ $0.20/min**.
  (LITE sería 1 crédito/min pero NO permite elegir voz/idioma → no sirve para español.)
- Conversación de ~2,5 min ≈ **$0.50**. 100 conversaciones/mes ≈ ~500 créditos.
- Plan realista para producción (sin marca de agua, multiusuario): **~$99/mes** (≈1.000 créditos,
  ~20 sesiones simultáneas). Escalera aprox: Free $0 (10 cr, 1 simult.) → Starter ~$19 (150 cr,
  5 simult.) → Pro ~$99 (1.000 cr, 20 simult.) → Business ~$475 (5.000 cr).
- **Total realista 100 conv/mes ≈ ~$100/mes** (casi todo es el avatar; el cerebro es ~$1).

### Lag
- A la primera palabra: **~1-2 s** con transporte WebRTC + calidad media. Arranque de sesión: ~1-3 s.
- La mayor mejora ya está hecha: **hablar por frases** durante el stream (no esperar la respuesta
  completa) → recorta 2-4x el retardo percibido en respuestas largas.
- Otras palancas: menor resolución de video, pre-conectar la sesión detrás de la UI.

### Voz natural MX / Venezuela
- Las 70 voces preset de LiveAvatar son TODAS "en" (sin etiqueta regional). Con `language:'es'`
  hablan español **genérico/neutro**, no acento mexicano/venezolano puro.
- **Vía recomendada para acento latino real:** voz de **ElevenLabs** vinculada a LiveAvatar.
  El proyecto ya tiene **"Karim Voz"** (`wSFJ1H2XywFI0wLdTylp`, español, acento latinoamericano).
  Binding: `POST /v1/secrets` (key de ElevenLabs **de pago**) → `POST /v1/voices/third_party`
  (provider_voice_id + secret_id) → usar el `voice_id` resultante en `avatar_persona.voice_id`.
  El flujo `repeat()` no cambia. Evitar el "ElevenLabs Agent plugin" (reemplazaría el cerebro OpenRouter).

### Veredicto
**Viable para piloto / PYME.** El cuello de botella NO es la tecnología ni el cerebro, sino el
**costo por minuto del avatar** y la **concurrencia** del plan. Para acento MX/VE natural se
necesita ElevenLabs de pago. Recostear antes de cientos de usuarios simultáneos.
