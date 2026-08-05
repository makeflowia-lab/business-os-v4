# Changelog — SaaS Factory

Todas las versiones notables de la fabrica. Formato basado en Keep a Changelog.

---

## [Raziel] — 2026-06-17 — Avatar en tiempo real (HeyGen LiveAvatar)

Avatar hiperrealista interactivo en la interfaz de Raziel. Guía completa: `docs/AVATAR-LIVEAVATAR.md`.

### Added
- Avatar en tiempo real por WebRTC con `@heygen/liveavatar-web-sdk` (centro de la pantalla;
  menú superior y barra de micrófono/escribir intactos). El cerebro sigue siendo OpenRouter:
  `session.repeat(texto)` hace que el avatar diga la respuesta generada.
- Ruta `/api/heygen-token` que crea el `session_token` en LiveAvatar (`api.liveavatar.com/v1/sessions/token`).
- Botón "Activar Raziel en vivo" (ahorra créditos del plan Free + habilita el autoplay del audio)
  y botón de reconexión al cumplirse el límite de sesión.
- Toggle (👁) para mostrar/ocultar la transcripción de la conversación (oculta por defecto).
- Voz en español "Pedro - IA" (`LIVEAVATAR_VOICE_ID`) + `avatar_persona.language: 'es'`.

### Changed
- `next.config.ts`: CSP `connect-src` permite LiveAvatar/LiveKit; `reactStrictMode: false`
  (evita 2 sesiones simultáneas en dev, incompatibles con el límite de 1 del plan Free).
- `.gitignore`: ahora excluye `.env` y `.env*.local` (evita fuga de secretos).

### Fixed / Migración
- La Streaming Avatar API de HeyGen quedó APAGADA (HTTP 410). Migrado al sucesor **LiveAvatar**
  (SDK, API y créditos distintos; la API key de HeyGen NO es compatible). Ver tabla de 9
  errores y soluciones en `docs/AVATAR-LIVEAVATAR.md`.

---

## [5.0.0] — 2026-06-06

> **El salto:** V4 construia apps (0→1). V5 OPERA negocios (1→100).
> El loop ya no termina en "deployado".

### Filosofia
- Reframulacion central: *"V4 construye apps. V5 opera negocios."*
- La fabrica era brillante de 0→1 y ciega de 1→100. V5 cierra el loop:
  **construye → lanza → opera → mide → aprende.**
- Nada de esto reescribe la fabrica: son capas nuevas sobre skills, memoria y orquestacion existentes.

### Added — 12 skills nuevos (7 pilares)

**Pilar 1 — Aprendizaje compuesto**
- `factory-brain` — meta-memoria GLOBAL cross-proyecto (`~/.saas-factory/brain/`). La fabrica
  aprende ENTRE proyectos, no solo dentro de cada uno. Efecto compuesto.

**Pilar 2 — Cierre del loop**
- `outcomes` — ingiere metricas reales (revenue, conversion, activacion, churn) de Vercel
  Analytics / Supabase / Polar y las retroalimenta. Incluye A/B testing.

**Pilar 3 — Distribucion**
- `acquisition` — SEO programatico + motor de contenido + auto-post a redes + ads.
  De "deployado" a "primeros usuarios".

**Pilar 4 — Operacion autonoma**
- `guardian` — vigila produccion, auto-arregla builds en ramas, errores → PRs, QA periodico.
  Con freno humano (no mergea a produccion sin aprobacion).
- `mission-control` — dashboard del portafolio: todas las apps en una vista.

**Pilar 5 — Compounding del output**
- `vertical-pack` — convierte un proyecto terminado en un pack/skill reusable. La fabrica
  come su propio output.

**Pilar 6 — Velocidad y calidad**
- `parallel-build` — construccion multi-agente en paralelo + verificacion adversarial (Workflow).
- `quality-gates` — gates duros: typecheck, a11y, Core Web Vitals, conversion, costo-IA.
- `cost-optimizer` — unit economics: modelo mas barato que cumple, costo-IA por usuario.

**Pilar 7 — Blind spots resueltos**
- `compliance` — privacidad, terminos, cookies, borrado de datos (derecho al olvido),
  consentimiento biometrico. OBLIGATORIO antes de deploy con datos.
- `onboarding` — first-run experience: empty states, tour, checklist de activacion.
- `i18n` — internacionalizacion LatAm-first (es-MX default, en-US listo).

### Changed
- `CLAUDE.md` y `GEMINI.md` (cerebro): nueva seccion "El Loop Cerrado", Decision Tree
  extendido con 12 triggers nuevos, tabla de 30 skills, **Flujos 4 y 5** (Operacion de
  Negocio + Construccion Paralela).
- `README.md` y `SKILLS_README.md`: rebrand V5, narrativa "construye Y opera".
- Golden Path ampliado: i18n (next-intl) + Analytics (Vercel + tabla `events`) + routing
  de modelos por costo.
- Conteo de skills reconciliado: V4 real = 18 (no 15). V5 = 18 + 12 = **30**.

### Notes
- Los skills V5 son definiciones funcionales (markdown). Algunos (`guardian`,
  `parallel-build`, `acquisition`) materializan infraestructura adicional al ejecutarse en
  un proyecto real (Sentry, orquestacion Workflow, conexiones a redes).
- Plan estrategico completo en `PLAN-V5.md`.

---

## [4.0.0] — 2026-03-15

### Added
- 22 skills unificados (reemplaza commands + agents + prompts de V3).
- Memoria persistente POR PROYECTO (`.claude/memory/`, git-versioned).
- Landing cinematica scroll-stop + copy AIDA/PAS.
- Image generation con OpenRouter + Gemini.
- Autoresearch: auto-optimizacion de skills (patron Karpathy).
- 5 design systems · 11 AI templates · 3 MCPs configurados.

### Changed
- `.claude/commands/*.md` → `.claude/skills/*/SKILL.md`.
- System prompt de "lista de herramientas" → decision tree (input → skill activation).
