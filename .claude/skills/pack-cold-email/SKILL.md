---
name: pack-cold-email
description: |
  Pack vertical REUSABLE extraido del proyecto Prospecta (servidor de cold email para vender
  SaaS). Agrega a un proyecto nuevo: motor de correo (Resend con dry-run), redaccion con IA
  (OpenRouter + cost-optimizer), template HTML con footer legal, compliance (unsubscribe +
  suppression), y modelo de datos (leads, campaigns, sends, events, unsubscribes).
  Usar cuando el usuario quiere mandar correo en frio / outreach / campanas de email a leads.
  Triggers: cold email, correo en frio, outreach, campana de correo, mandar correos a leads,
  email marketing B2B, prospeccion por correo, pack cold email, Resend.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Pack Cold Email — Nucleo Reusable de Prospecta

> Destilado del proyecto Prospecta (probado en produccion: envio real via Resend, copy con IA,
> compliance con opt-out respetado). La fabrica come su propio output (skill vertical-pack).

---

## Que agrega

| Pieza | Archivo de referencia | Skill base |
|-------|----------------------|------------|
| Motor de correo (Resend + dry-run) | `references/email.ts` | add-emails |
| Redaccion con IA + costo-IA | `references/copy.ts` + `references/ai-cost.ts` | ai + cost-optimizer |
| Template HTML + footer legal + pixel | `references/template.ts` | compliance + outcomes |
| Modelo de datos (5 tablas RLS) | `references/migration.sql` | supabase |

---

## Pre-requisitos
- `/add-login` (el panel de campanas requiere auth + owner por usuario)
- Variables: `RESEND_API_KEY` (+ remitente verificado para enviar a cualquiera),
  `OPENROUTER_API_KEY` (opcional; sin ella usa plantilla), `NEXT_PUBLIC_SITE_URL`

---

## Pasos de integracion

### 1. Base de datos
Aplicar `references/migration.sql` (tablas leads, campaigns, email_sends, email_events,
unsubscribes — todas con RLS). Via Supabase MCP `apply_migration` o el pooler session (5432).

### 2. Librerias core
Copiar a `src/features/<feature>/lib/`:
- `email.ts` — `sendEmail()` (dry-run si no hay RESEND_API_KEY)
- `copy.ts` — `generateColdEmail()` (IA con fallback a plantilla, mide costo-IA)
- `ai-cost.ts` — tabla de precios + `computeCostUsd()` (cost-optimizer)
- `template.ts` — `renderColdEmail()` (footer con identidad + unsubscribe + pixel de apertura)

### 3. Endpoints
- `/api/leads` (captura publica con consentimiento)
- `/api/unsubscribe` (opt-out, publico)
- `/api/track/open` (pixel de apertura → email_events)
- Server action `createAndSendCampaign` (envia respetando suppression list)

### 4. Panel
- `/app` (dashboard con metricas), `/app/campaigns/new` (crear + enviar)

---

## Gotchas ya resueltos (el oro del pack)

1. **Resend en modo prueba SOLO entrega al dueno de la cuenta.** Para enviar a cualquier lead,
   verificar dominio en resend.com/domains y setear `RESEND_FROM_EMAIL` al dominio propio.
2. **Compliance NO es opcional en cold email.** El template SIEMPRE incluye footer con identidad
   + link de baja. El envio respeta la tabla `unsubscribes` (suppression automatica).
3. **Costo-IA: 1 generacion por campana, no por lead.** Se redacta una plantilla con
   `{{name}}`/`{{company}}` y se sustituye por lead — barato (cost-optimizer).
4. **Dry-run por defecto sin RESEND_API_KEY** — permite construir/deployar y probar el pipeline
   sin enviar correos reales.

---

## Reglas de Oro
1. **Nunca cold email sin unsubscribe + identidad** (CAN-SPAM / LFPDPPP).
2. **Respetar el opt-out global** antes de cada envio.
3. **Modelo barato por defecto** (gpt-4o-mini); medir costo-IA por correo.
4. **Dry-run hasta tener dominio verificado.**
