# Desplegar Raziel en el VPS (Easypanel) — paso a paso

> **Nota honesta:** el transcript original de la primera instalación no quedó guardado. Esta guía
> es la reconstrucción **precisa para el stack de Raziel** (Next.js 16 + NextAuth + LiveAvatar) con
> Easypanel, que es el método que usas en el VPS. Confirma los datos de TU servidor donde se indica.

---

## Qué es Raziel (para entender qué desplegamos)
- App **Next.js 16** (React 19 + Tailwind). En local corre en `http://localhost:3003`.
- Login propio por contraseña (NextAuth + `RAZIEL_PASSWORD`), protegido por middleware (`proxy.ts`).
- Avatar en tiempo real **LiveAvatar** (HeyGen) + voz (ElevenLabs) + cerebro OpenRouter.
- En el VPS se sirve detrás de un dominio con HTTPS (Easypanel lo gestiona).

## Requisitos previos
- Un VPS (Hostinger/Contabo/DigitalOcean/etc.) con Ubuntu.
- **Easypanel instalado** en el VPS. Si no lo está, en el VPS por SSH:
  ```bash
  curl -sSL https://get.easypanel.io | sh
  ```
  Luego abre `http://IP-DEL-VPS:3000` y crea tu cuenta de Easypanel.
- El código de Raziel en un repo de GitHub (privado).

---

## Paso 1 — Crear el proyecto/app en Easypanel
1. Entra a Easypanel → **Create Project** (ej. `raziel`).
2. Dentro del proyecto → **+ Service → App**.
3. **Source:** GitHub → conecta tu cuenta y elige el repo de Raziel (rama `main`/`master`).
   - (Alternativa sin git: subir el código o usar una imagen Docker.)

## Paso 2 — Build (Next.js)
Easypanel usa **Nixpacks** y autodetecta Next.js. Si pide comandos, usa:
- **Install:** `npm ci`
- **Build:** `npm run build`
- **Start:** `npm start`
- **Puerto:** Next escucha el `$PORT` que inyecta Easypanel (no fijes 3003 en producción).

## Paso 3 — Variables de entorno
En el servicio → pestaña **Environment**, pega TODAS (sin comillas). Las que dependen del dominio
deben apuntar a tu dominio de producción (NO a localhost):

```bash
# Cerebro
OPENROUTER_API_KEY=...
ANTHROPIC_API_KEY=...            # fallback opcional

# Voz (ElevenLabs)
ELEVENLABS_API_KEY=...
ELEVENLABS_VOICE_ID=...

# Auth (NextAuth) — OJO: usar el DOMINIO de producción
NEXTAUTH_SECRET=...              # secreto largo y propio
NEXTAUTH_URL=https://tu-dominio.com
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
RAZIEL_PASSWORD=...              # la clave para entrar

# Avatar LiveAvatar (HeyGen) — el hiperrealista
LIVEAVATAR_API_KEY=...
NEXT_PUBLIC_LIVEAVATAR_AVATAR_ID=...
LIVEAVATAR_VOICE_ID=...
LIVEAVATAR_MAX_SESSION_DURATION=120
```
> `HEYGEN_API_KEY` (la vieja Streaming API) ya NO sirve para el avatar — el avatar usa `LIVEAVATAR_*`.

## Paso 4 — Dominio + HTTPS
1. En el servicio → **Domains** → añade tu dominio (o el subdominio `raziel.tudominio.com`).
2. Apunta el DNS (registro A) del dominio a la **IP del VPS**.
3. Easypanel emite el certificado **HTTPS (Let's Encrypt)** automáticamente.
4. Asegúrate de que `NEXTAUTH_URL` y `NEXT_PUBLIC_APP_URL` sean **ese mismo dominio https**.

## Paso 5 — Deploy y verificación
1. **Deploy** en Easypanel → mira los logs hasta `Ready`.
2. Abre `https://tu-dominio.com` → te lleva al login → entra con `RAZIEL_PASSWORD`.
3. Prueba el avatar (pulsa "Activar"): si LiveAvatar da error, revisa `LIVEAVATAR_API_KEY` y crédito.

## Actualizar (cada cambio)
- Haz `git push` a la rama conectada → en Easypanel pulsa **Deploy** (o activa auto-deploy por webhook de GitHub).
- Si cambias variables de entorno, **redeploy** para que tomen efecto.

## Problemas comunes
- **Login no funciona / redirige mal:** `NEXTAUTH_URL` debe ser exactamente el dominio https de producción.
- **El avatar no carga:** falta `LIVEAVATAR_API_KEY` o sin crédito; verifica también que el CSP de
  `next.config.ts` permita `*.liveavatar.com` y `*.livekit.cloud` (ya está configurado).
- **502/no arranca:** revisa que `npm start` use `$PORT` (Next lo hace solo) y los logs del build.

---

*Reconstruido 2026-06-18. Si tu instalación real difiere (otra ruta, Docker, PM2+Nginx en vez de
Easypanel), dímelo y ajusto esta guía a tu proceso exacto.*
