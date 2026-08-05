# RAZIEL — Documento Master de Arquitectura

> *"I am Raziel, first-born of His lieutenants."*
> Asesor comercial con IA — Sistema completo de 7 módulos.

---

## Tabla de Contenidos

1. [Qué es Raziel](#qué-es-raziel)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Stack Técnico](#stack-técnico)
4. [Módulos Implementados](#módulos-implementados)
5. [Sistema de Avatar Dual](#sistema-de-avatar-dual)
6. [Sistema de Voz](#sistema-de-voz)
7. [Seguridad Implementada](#seguridad-implementada)
8. [Variables de Entorno](#variables-de-entorno)
9. [Rutas Disponibles](#rutas-disponibles)
10. [Glosario Técnico](#glosario-técnico)

---

## Qué es Raziel

Raziel es un **agente de asesoría comercial con IA** construido sobre Next.js 16. Combina:

- Un **chat conversacional** con un LLM (Claude/GPT via OpenRouter)
- Un **avatar dual** que cambia de estado según el contexto
- **Voz bidireccional**: el agente habla (TTS) y escucha (STT)
- **7 módulos de documentación** generados con inteligencia de negocio real

No es un chatbot genérico. Es una herramienta de trabajo construida sobre la metodología de marketing de Hormozi, finanzas de SaaS, auditoría de seguridad, y arquitectura tecnológica.

---

## Arquitectura del Sistema

```
Raziel/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts          # Streaming AI con sistema de estados
│   │   │   └── auth/[...nextauth]/    # Autenticación NextAuth v4
│   │   ├── avatar/page.tsx            # Módulo 1: Avatar & Oferta
│   │   ├── oferta/page.tsx            # Módulo 2: Oferta Irresistible
│   │   ├── propuesta/page.tsx         # Módulo 3: Propuesta Tecnológica
│   │   ├── auditoria/page.tsx         # Módulo 4: Auditoría de Seguridad
│   │   ├── legal/page.tsx             # Módulo 5: Documentación Legal
│   │   ├── contenido/page.tsx         # Módulo 6: Estrategia de Contenido
│   │   ├── docs-proyecto/page.tsx     # Módulo 7a: Docs por Tipo de Proyecto
│   │   ├── branding/page.tsx          # Módulo 7b: Identidad de Marca
│   │   ├── business-os/page.tsx       # Módulo 8: Business OS
│   │   ├── cfo/page.tsx               # Módulo 9: CFO Virtual
│   │   ├── login/page.tsx             # Pantalla de login protegida
│   │   ├── layout.tsx                 # Root layout (tema oscuro)
│   │   ├── page.tsx                   # Chat principal con avatar dual
│   │   └── globals.css                # Estilos globales + clases custom
│   │
│   ├── features/
│   │   └── raziel/
│   │       ├── components/
│   │       │   ├── RazielAvatar.tsx   # Avatar dual con crossfade
│   │       │   └── ChatMessage.tsx    # Mensajes + TypingIndicator
│   │       ├── hooks/
│   │       │   └── useVoice.ts        # TTS + STT push-to-talk
│   │       └── lib/
│   │           └── system-prompt.ts   # Prompt maestro del agente
│   │
│   └── shared/
│       └── lib/
│           ├── rate-limit.ts          # Rate limiter en memoria
│           └── auth.ts                # Configuración NextAuth
│
├── proxy.ts                           # Middleware de protección de rutas
├── next.config.ts                     # Config + Security Headers
├── RAZIEL_MASTER.md                   # Este archivo
└── CLAUDE.md                          # Instrucciones para el agente AI
```

---

## Stack Técnico

| Capa | Tecnología | Versión | Propósito |
|------|-----------|---------|-----------|
| Framework | Next.js | 16 (Turbopack) | App Router + SSR + API Routes |
| UI | React | 19 | Componentes con Server/Client split |
| Tipado | TypeScript | 5.7 | Type safety en todo el proyecto |
| Estilos | Tailwind CSS | 3.4 | Utility-first, tema oscuro |
| AI Engine | Vercel AI SDK | v4 (ai@4.x) | Streaming de LLMs |
| LLM Provider | OpenRouter | — | Acceso a Claude/GPT/Gemini |
| Auth | NextAuth.js | v4 | Sesiones JWT, protección de rutas |
| Base de Datos | Neon | PostgreSQL serverless | Sin servidor, escala automático |
| Íconos | Lucide React | — | SVG icons consistentes |
| Validación | Zod | — | Schema validation en API |

---

## Módulos Implementados

### Módulo 1 — Avatar & Identidad (`/avatar`)
Perfil de cliente ideal con 8 dimensiones: demografía, psicografía, problemas, emociones, objeciones, canales, lenguaje y arquetipos Jungian.

### Módulo 2 — Oferta Irresistible (`/oferta`)
Metodología Hormozi aplicada: Core Offer, Dream Outcome, Garantías, Bonos, Prueba social. Incluye calculadora de valor y análisis de precio psicológico.

### Módulo 3 — Propuesta Tecnológica (`/propuesta`)
Formulario de 3 etapas (Cliente → Arquitectura → Infraestructura). Genera propuesta técnica profesional con stack recomendado y estimación de costos. Exportable a PDF.

### Módulo 4 — Auditoría de Seguridad (`/auditoria`)
Reporte de vulnerabilidades con severidad CRÍTICA/ALTA/MEDIA/BAJA. 8 hallazgos documentados con vector de ataque, impacto y remediación. Las 7 fixes fueron implementadas en el código.

### Módulo 5 — Documentación Legal (`/legal`)
4 documentos con tabs: Contrato de Servicios, NDA, Aviso de Privacidad (LFPDPPP 2026), Términos y Condiciones. Todos exportables a PDF.

### Módulo 6 — Estrategia de Contenido (`/contenido`)
Plataformas, pilares de contenido, embudo (TOFU/MOFU/BOFU), sistema de repurposing, calendario 90 días, KPIs de contenido.

### Módulo 7a — Docs por Proyecto (`/docs-proyecto`)
Checklist interactivo de 21 documentos para infraestructura LOCAL con toggle de estado, barra de progreso y filtros por estado.

### Módulo 7b — Branding (`/branding`)
Identidad de marca completa: esencia (propósito/misión/visión/valores), posicionamiento, identidad verbal (arquetipos, vocabulario SÍ/NO, frases de marca), identidad visual (paleta, tipografía), diferenciación vs competencia, visión 3 años.

### Módulo 8 — Business OS (`/business-os`)
Sistema operativo del negocio: Mission Control con KPIs y pipeline, gestión de proyectos con 4 carriles, arquitectura de automatización (flujos priorizados), sistema de decisiones (Eisenhower + ROI), stack tecnológico recomendado ($15/mes total), plan de implementación 30 días.

### Módulo 9 — CFO Virtual (`/cfo`)
Análisis financiero completo: diagnóstico de salud, modelo de pricing (3 tiers de servicios + 3 planes SaaS), runway y breakeven por escenario, 6 KPIs financieros con fórmulas, tracker de ingresos, estrategia 90 días con regla de distribución 50/20/20/10.

---

## Sistema de Avatar Dual

El agente tiene dos estados visuales que cambian automáticamente:

| Estado | Marcador en respuesta | Visual | Cuándo |
|--------|----------------------|--------|--------|
| Humano | `[ESTADO:humano]` | `estado-a.png`, borde cálido | Saludo, análisis, preguntas |
| Soul Reaver | `[ESTADO:soul_reaver]` | `estado-b.png`, glow azul | Ejecución, tareas, entregas |

**Flujo técnico:**
1. El LLM incluye `[ESTADO:humano]` o `[ESTADO:soul_reaver]` en la primera línea de su respuesta
2. La función `detectState()` parsea el marcador con regex: `/^\[ESTADO:(humano|soul_reaver)\]/`
3. `cleanContent()` elimina el marcador antes de mostrar el texto al usuario
4. El estado se detecta en streaming (efecto `useEffect` sobre `messages`) y también en `onFinish`
5. La transición es un **crossfade CSS** de 700ms (opacity) — sin animaciones sinistras

**Imágenes requeridas:**
```
public/avatars/estado-a.png   # Raziel humano (400×520px, fondo oscuro)
public/avatars/estado-b.png   # Raziel Soul Reaver (400×520px, fondo oscuro)
```

---

## Sistema de Voz

### Text-to-Speech (TTS) — El agente habla
- **API:** `window.SpeechSynthesis` (Web Speech API, nativa del browser)
- **Voz:** Prioriza voces en español por nombre: Raúl, Jorge, Pablo, Diego (Windows)
- **Parámetros:** `rate=1.0`, `pitch=1.0` (naturales, sin distorsión)
- **Auto-speak:** Toggle en el header. Si está activo, cada respuesta del agente se lee en voz alta
- **Control:** Botón "stop" aparece solo mientras está hablando

### Speech-to-Text (STT) — El agente escucha
- **API:** `window.SpeechRecognition` (Web Speech API, nativa del browser)
- **Modo:** Push-to-talk. El micrófono graba hasta que el usuario presiona "enviar"
- **Configuración:** `continuous: true`, `interimResults: true`, `lang: es-MX`
- **Reinicio automático:** Si el browser corta la sesión (comportamiento nativo), `onend` reinicia si `activeRef.current` sigue en `true`
- **UI:** Textarea muestra texto en tiempo real mientras graba. Barras animadas indican grabación activa.

---

## Seguridad Implementada

Las 7 medidas de seguridad implementadas tras la auditoría:

| Fix | Dónde | Qué hace |
|-----|-------|----------|
| Validación Zod | `api/chat/route.ts` | Valida schema de cada request antes de procesarlo |
| Rate limiting | `shared/lib/rate-limit.ts` | Máx 20 requests/min por IP. Limpieza automática cada 5 min |
| Request logging | `api/chat/route.ts` | Registra timestamp, IP parcial, conteo de mensajes |
| Security Headers | `next.config.ts` | X-Frame-Options, CSP, X-XSS-Protection, Referrer-Policy, etc. |
| MCP solo en dev | `next.config.ts` | `mcpServer` solo se activa con `NODE_ENV !== 'production'` |
| Autenticación | `lib/auth.ts` + `login/page.tsx` | NextAuth v4, contraseña desde env var, JWT 7 días |
| Protección de rutas | `proxy.ts` | Todas las rutas requieren sesión válida excepto `/login`, `/api/auth`, assets |

---

## Variables de Entorno

```bash
# .env.local

# AI
OPENROUTER_API_KEY=sk-or-...          # Clave de OpenRouter (obligatoria)

# Base de datos (activar para producción)
# DATABASE_URL=postgresql://...@neon.tech/raziel?sslmode=require

# Autenticación
NEXTAUTH_SECRET=tu-secret-aqui        # String aleatorio largo (mínimo 32 chars)
NEXTAUTH_URL=http://localhost:3001    # URL base de la app
RAZIEL_PASSWORD=tu-password           # Contraseña de acceso a Raziel
```

**Generar `NEXTAUTH_SECRET`:**
```bash
openssl rand -base64 32
```

---

## Rutas Disponibles

| Ruta | Módulo | Descripción |
|------|--------|-------------|
| `/` | Chat | Chat principal con Raziel + avatar dual + voz |
| `/avatar` | 1 | Perfil de cliente ideal |
| `/oferta` | 2 | Oferta irresistible (Hormozi) |
| `/propuesta` | 3 | Propuesta tecnológica 3 etapas |
| `/auditoria` | 4 | Reporte de auditoría de seguridad |
| `/legal` | 5 | 4 documentos legales (Contrato, NDA, Privacidad, T&C) |
| `/contenido` | 6 | Estrategia de contenido + calendario 90 días |
| `/docs-proyecto` | 7a | Checklist interactivo de documentación LOCAL |
| `/branding` | 7b | Identidad de marca completa |
| `/business-os` | 8 | Sistema operativo del negocio |
| `/cfo` | 9 | CFO Virtual + análisis financiero |
| `/login` | — | Pantalla de acceso protegida |
| `/api/chat` | — | Endpoint de streaming AI (protegido + rate limited) |
| `/api/auth/[...nextauth]` | — | Handler de autenticación NextAuth |

---

## Glosario Técnico

### A

**API Route (Next.js)**
Archivo dentro de `src/app/api/*/route.ts` que define un endpoint HTTP. Next.js lo convierte en una función serverless. Raziel usa `/api/chat` para procesar los mensajes del usuario y `/api/auth` para la autenticación.

**App Router (Next.js)**
Sistema de enrutamiento de Next.js 13+. Cada carpeta dentro de `src/app/` con un archivo `page.tsx` se convierte en una ruta accesible. Reemplaza al `pages/` router anterior. Permite layouts anidados, loading states y Server Components.

**Auto-memory**
Sistema de memoria persistente de Claude Code. Guarda contexto entre conversaciones en `~/.claude/projects/`. En este proyecto se usa para mantener el historial de decisiones de arquitectura entre sesiones.

### B

**Burn Rate**
Cuánto dinero gasta un negocio por mes en costos operativos. En Raziel: ~$15 USD/mes (solo OpenRouter). Un burn rate bajo da más tiempo para encontrar clientes sin presión financiera.

**Build (Next.js)**
Proceso de compilación que convierte el código TypeScript/React en JavaScript optimizado para producción. Se ejecuta con `npm run build`. Vercel lo ejecuta automáticamente en cada push a `main`.

### C

**CI/CD**
*Continuous Integration / Continuous Deployment*. Sistema que automáticamente ejecuta tests y deploya la app cada vez que hay un commit. Vercel implementa CI/CD nativo con GitHub: push → build → deploy automático.

**Client Component**
En Next.js App Router, componente marcado con `'use client'` al inicio del archivo. Se ejecuta en el browser. Necesario para cualquier componente que use hooks (`useState`, `useEffect`), eventos del browser (clicks, teclado) o APIs del browser (SpeechSynthesis, SpeechRecognition).

**Content Security Policy (CSP)**
Header HTTP que le dice al browser qué recursos puede cargar y desde dónde. Previene ataques XSS al bloquear scripts no autorizados. Configurado en `next.config.ts`.

**Continuous Mode (SpeechRecognition)**
Parámetro `continuous: true` que le indica a la API de reconocimiento de voz que no se detenga después de la primera pausa. Sin esto, el browser cierra el micrófono en ~1-3 segundos de silencio. Esencial para push-to-talk.

**Crossfade**
Transición visual donde un elemento se desvanece (opacity 0→1) mientras otro aparece (opacity 1→0). En Raziel: ambas imágenes del avatar están superpuestas; la activa tiene `opacity-100` y la inactiva `opacity-0`, con `transition-opacity duration-700` para suavizar el cambio.

**CSR (Client-Side Rendering)**
Renderizado que ocurre en el browser del usuario, no en el servidor. Los componentes con `'use client'` en Next.js son CSR. Necesario para interactividad y APIs del browser.

### D

**Dashboard**
Interfaz que concentra métricas e información clave en una sola vista. El módulo Mission Control del Business OS es un dashboard con KPIs, pipeline y estado de proyectos.

**Deploy**
Proceso de publicar la aplicación en un servidor de producción accesible por internet. Raziel se deploya en Vercel. El comando es `npm run build && npm run start` (o automático via Vercel).

**Dream Outcome (Hormozi)**
El resultado final que el cliente imagina al comprar. No el feature, sino la transformación. Parte central de la metodología de oferta irresistible implementada en `/oferta`.

### E

**Edge Runtime**
Entorno de ejecución más ligero que Node.js, que se ejecuta en servidores distribuidos geográficamente (CDN edge nodes). Next.js soporta edge runtime para middleware. Raziel usa `proxy.ts` en edge para proteger rutas con latencia mínima.

**Endpoint**
URL específica de una API que recibe requests y devuelve responses. `/api/chat` es el endpoint principal de Raziel. Acepta POST con mensajes y devuelve un stream de texto.

**ENV Variables (Variables de Entorno)**
Variables de configuración que se cargan al proceso desde el sistema operativo, no están en el código. Se definen en `.env.local` (nunca se commitea a git). Raziel usa `OPENROUTER_API_KEY`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `RAZIEL_PASSWORD`.

### F

**Feature-First Architecture**
Estructura de carpetas donde el código se organiza por funcionalidad de negocio, no por tipo de archivo. `src/features/raziel/` agrupa todos los archivos relacionados al agente Raziel (componentes, hooks, lógica).

**Flujo de Streaming**
En lugar de esperar a que el LLM termine toda la respuesta antes de mostrarla, el streaming envía el texto token por token (palabra por palabra) al frontend. Esto crea el efecto de "escritura en tiempo real". Implementado con Vercel AI SDK `streamText`.

### G

**Golden Path**
El stack tecnológico único y perfeccionado del proyecto. En SaaS Factory: Next.js + React + TypeScript + Tailwind + Supabase + OpenRouter. Seguir el Golden Path significa no reinventar la rueda para cada proyecto.

### H

**Hook (React)**
Función que empieza con `use` y permite a los componentes usar estado, efectos y otras funcionalidades de React. `useVoice` es un hook personalizado que encapsula toda la lógica de TTS y STT. `useChat` de Vercel AI SDK maneja el estado del chat.

**HTTP Headers**
Metadatos enviados con cada response HTTP. Los security headers de Raziel (`X-Frame-Options`, `X-XSS-Protection`, `Content-Security-Policy`) le dicen al browser cómo comportarse para proteger al usuario.

### I

**Interim Results (SpeechRecognition)**
Texto "en progreso" que la API de reconocimiento de voz devuelve mientras el usuario sigue hablando, antes de que la frase esté completa. Con `interimResults: true`, el textarea muestra lo que el usuario dice en tiempo real (texto gris/cursiva).

**ISR (Incremental Static Regeneration)**
Técnica de Next.js que regenera páginas estáticas en el servidor en background, sin necesidad de rebuild completo. Útil para páginas con contenido que cambia poco. No usado activamente en Raziel pero disponible.

### J

**JWT (JSON Web Token)**
Token de autenticación que codifica información del usuario (ID, email, expiración) en un string firmado. NextAuth en Raziel usa JWT para mantener la sesión sin necesidad de base de datos. Se almacena en una cookie httpOnly.

### L

**LFPDPPP**
*Ley Federal de Protección de Datos Personales en Posesión de los Particulares*. Ley mexicana de privacidad de datos equivalente al GDPR europeo. El módulo legal de Raziel incluye plantillas de Aviso de Privacidad compatibles con la versión 2026.

**LLM (Large Language Model)**
Modelo de inteligencia artificial entrenado en grandes corpus de texto que puede generar, resumir y razonar sobre lenguaje natural. Claude (Anthropic), GPT-4 (OpenAI) y Gemini (Google) son LLMs. Raziel los usa via OpenRouter.

### M

**Merchant of Record**
Entidad legal responsable de la transacción de venta ante el cliente, impuestos y regulaciones. Lemon Squeezy actúa como Merchant of Record para ventas internacionales de SaaS, eliminando la complejidad de IVA, VAT y taxes locales para el vendor.

**Middleware**
Código que se ejecuta entre el request del usuario y la respuesta del servidor. En Next.js 16, se llama `proxy.ts` (antes `middleware.ts`). Raziel lo usa para verificar autenticación y redirigir al login si no hay sesión válida.

**MCP (Model Context Protocol)**
Protocolo de Anthropic para extender las capacidades de Claude Code con herramientas externas (bases de datos, APIs, sistemas de archivos). En Raziel se activa solo en desarrollo (`mcpServer: isDev`).

**Mock**
Objeto o función falsa usada en tests que simula el comportamiento de dependencias reales sin ejecutarlas. Ejemplo: un mock de la API de OpenRouter que devuelve respuestas predefinidas para tests unitarios.

**MRR (Monthly Recurring Revenue)**
Ingresos mensuales recurrentes y predecibles, generalmente de suscripciones o retainers. Es la métrica más importante para un negocio SaaS. $1 de MRR vale más que $1 de proyecto porque es predecible y acumulable.

### N

**Neon**
Base de datos PostgreSQL serverless. "Serverless" significa que no hay que administrar un servidor de base de datos: escala automáticamente, se suspende cuando no hay tráfico (0 costo en inactividad) y se activa en milisegundos. Raziel usa Neon para producción.

**NextAuth.js**
Librería de autenticación para Next.js. Maneja login, sesiones, JWT y protección de rutas. En Raziel se usa NextAuth v4 con un `CredentialsProvider` (usuario/contraseña manual, sin OAuth). La contraseña viene de la variable de entorno `RAZIEL_PASSWORD`.

### O

**onFinish (Vercel AI SDK)**
Callback que se ejecuta cuando el LLM termina de generar toda la respuesta. Raziel lo usa para detectar el estado final del avatar y para activar el TTS (auto-speak) con el texto completo limpio.

**OpenRouter**
Servicio que unifica el acceso a múltiples LLMs (Claude, GPT-4, Gemini, Llama, etc.) bajo una sola API con el formato de OpenAI. Permite cambiar de modelo sin modificar el código. Raziel usa OpenRouter como AI Engine.

### P

**Payload**
El cuerpo de datos de un request HTTP. En Raziel, el payload del `/api/chat` es un JSON con el array de mensajes del chat. Zod valida que el payload tenga la estructura correcta antes de procesarlo.

**Pipeline de Ventas**
Representación visual del proceso de ventas dividido en etapas: Lead → Calificado → Propuesta → Negociación → Cerrado → Entrega. Permite ver en qué etapa está cada oportunidad y qué acción tomar.

**PostgreSQL**
Sistema de gestión de bases de datos relacional (SQL) de código abierto. Soporta JSON, full-text search, y extensiones avanzadas. Es la base de datos que usa Neon. Ideal para SaaS por su robustez y ecosistema.

**Prompt (System Prompt)**
Instrucciones iniciales que se le dan al LLM antes de que el usuario escriba algo. Define la personalidad, capacidades y restricciones del agente. El `system-prompt.ts` de Raziel contiene los 7 módulos de capacidades y las instrucciones de formato `[ESTADO:...]`.

**Push-to-Talk**
Modo de grabación de voz donde el micrófono graba mientras el usuario lo activa manualmente, no automáticamente. Raziel usa push-to-talk: el usuario presiona el botón de micrófono para empezar a grabar y presiona "enviar" para terminar y enviar el texto.

### R

**Rate Limiting**
Técnica de seguridad que limita cuántos requests puede hacer un usuario/IP en un período de tiempo. Raziel limita a 20 requests por minuto por IP. Si se excede, devuelve HTTP 429 (Too Many Requests). Previene abusos y costos excesivos de API.

**Regex (Regular Expression)**
Patrón de búsqueda en texto. Raziel usa `/^\[ESTADO:(humano|soul_reaver)\]/` para detectar el marcador de estado del avatar al inicio de cada respuesta del LLM.

**Retainer**
Contrato de servicios recurrente donde el cliente paga una cantidad fija mensual por un número de horas/servicios garantizados. Es la forma más estable de ingresos en servicios: convierte un proyecto (único) en MRR.

**Route Handler (Next.js)**
Archivo `route.ts` dentro de `src/app/api/` que exporta funciones HTTP (`GET`, `POST`, `PUT`, `DELETE`). Reemplaza a las API Routes del `pages/api/` de Next.js anterior.

**Runway**
Cuánto tiempo puede operar un negocio con el dinero/recursos que tiene antes de necesitar ingresos o inversión externa. Con burn rate de $15/mes, el runway del negocio de Raziel es prácticamente infinito.

### S

**Scope Creep**
Fenómeno donde el alcance de un proyecto se expande más allá de lo acordado inicialmente, generalmente sin compensación adicional. El cliente pide "pequeños cambios" que suman horas no cobradas. La solución: contrato claro y proceso de change requests.

**Server Component (Next.js)**
Componente de React que se renderiza en el servidor, no en el browser. No puede usar hooks ni APIs del browser. Es el comportamiento por defecto en Next.js App Router. Los Server Components no aumentan el JavaScript que el browser descarga.

**Serverless**
Modelo de infraestructura donde el servidor se provisiona automáticamente según demanda. No hay un servidor siempre encendido: el código se ejecuta solo cuando hay un request. Vercel y Neon son serverless. Ventaja: costo 0 cuando no hay tráfico.

**Streaming (AI)**
Técnica donde la respuesta del LLM se envía al cliente en fragmentos (tokens) conforme se genera, en lugar de esperar a que complete toda la respuesta. Reduce el tiempo de primera respuesta visible de segundos a milisegundos.

### T

**Tailwind CSS**
Framework de CSS utility-first. En lugar de escribir clases CSS con nombres semánticos, se usan clases atómicas directamente en el HTML: `flex`, `gap-4`, `text-sm`, `bg-[#060810]`. Raziel usa `@tailwind` directives en `globals.css` (no `@import 'tailwindcss'`).

**Token (LLM)**
Unidad básica de texto que procesa un LLM. Aproximadamente 1 token = 0.75 palabras en inglés. Los modelos tienen un límite de tokens de contexto (cuánto pueden "recordar" en una conversación) y cobran por tokens procesados.

**TTS (Text-to-Speech)**
Tecnología que convierte texto escrito en audio hablado. Raziel usa la API `window.SpeechSynthesis` nativa del browser, sin costos adicionales de API. La calidad depende de las voces instaladas en el sistema operativo del usuario.

**Turbopack**
Bundler de nueva generación desarrollado por Vercel, escrito en Rust. Es el reemplazo de Webpack en Next.js 16. Mucho más rápido en desarrollo: compilación incremental que puede ser 10x más rápida que Webpack.

**TypeScript**
Superset de JavaScript que agrega tipado estático. Permite definir qué tipo de datos acepta cada función, variable y componente. Los errores de tipos se detectan en tiempo de compilación, no en runtime. Toda la base de código de Raziel es TypeScript.

### U

**useChat (Vercel AI SDK)**
Hook de React que maneja toda la lógica del chat con LLMs: estado de mensajes, input del usuario, loading state, streaming de respuestas y callbacks `onFinish`. Raziel lo usa en `page.tsx` conectado al endpoint `/api/chat`.

### V

**Vercel**
Plataforma de deploy para aplicaciones Next.js. Deploy automático desde GitHub, CDN global, SSL automático, variables de entorno, preview deployments por PR, y analytics. El plan Hobby es gratuito para proyectos personales.

**Vercel AI SDK**
Librería oficial de Vercel para integrar LLMs en aplicaciones Next.js. Abstrae el streaming, manejo de mensajes y conexión con múltiples providers (OpenAI, Anthropic, OpenRouter). Raziel usa v4 (`ai@4.x`).

### W

**Web Speech API**
API nativa del browser (sin instalación, sin costo) que proporciona capacidades de síntesis de voz (TTS) y reconocimiento de voz (STT). Disponible en Chrome, Edge y Safari modernos. Firefox tiene soporte limitado. Raziel la usa para voz bidireccional.

**Webhook**
Request HTTP automático que un servicio envía a otro cuando ocurre un evento. Ejemplo: cuando un lead llena el formulario de Tally, Tally envía un webhook a Make, que automáticamente crea un registro en Notion. La base de las automatizaciones sin código.

### X

**XSS (Cross-Site Scripting)**
Ataque donde código JavaScript malicioso se inyecta en una página web y se ejecuta en el browser de otros usuarios. Los security headers CSP de Raziel lo previenen bloqueando la ejecución de scripts no autorizados.

### Z

**Zod**
Librería de validación y parsing de esquemas TypeScript. En Raziel valida que cada request al `/api/chat` tenga el formato correcto antes de procesarlo. Si el payload no cumple el esquema, devuelve HTTP 400 sin llegar al LLM.

---

## Comandos de Desarrollo

```bash
npm run dev     # Servidor de desarrollo con Turbopack (puerto 3001 por defecto)
npm run build   # Compilación para producción
npm run start   # Servidor de producción (requiere build previo)
npm run lint    # Revisión de código con ESLint
```

---

*Raziel — Sistema completo. 9 módulos. 1 agente.*
*Generado: 2026-03-21*
