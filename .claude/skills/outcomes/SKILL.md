---
name: outcomes
description: |
  Cierra el loop: ingiere metricas REALES de produccion (Vercel Analytics, Supabase, Polar)
  y las retroalimenta a las decisiones de la fabrica. La fabrica deja de ser ciega a si lo
  que construye funciona. Instala eventos de activacion y A/B testing para tener data que
  optimizar. Usar cuando el usuario pregunta como va una app, que convierte, cuanto factura,
  o cuando quiere instrumentar metricas.
  Triggers: como va, cuanto convierte, cuanto factura, revenue, conversion, metricas reales,
  outcomes, resultados, instala analytics, A/B test, experimento, que funciona mejor,
  activacion, retencion, churn, mide esto, dashboard de metricas.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Outcomes — Cerrar el Loop con la Realidad

> V4 construye y deploya, luego queda CIEGA. Outcomes ingiere lo que pasa en produccion
> y lo devuelve a la fabrica: "gradient-mesh convirtio 2x mejor que bento-grid".
> Sin datos reales, optimizar es adivinar.

---

## Las 3 capas de outcomes

```
1. INSTRUMENTAR  → poner eventos en la app (signup, activacion, pago, churn)
2. INGERIR       → leer las metricas de las fuentes reales
3. RETROALIMENTAR → mandar el aprendizaje a factory-brain
```

---

## Capa 1 — Instrumentar (eventos que importan)

La mayoria de apps miden pageviews (vanidad). Outcomes mide el funnel real:

| Evento | Que responde | Donde |
|--------|--------------|-------|
| `signup` | Llegan usuarios? | Supabase auth / tabla profiles |
| `activated` | Llegan al primer valor? | Evento custom (ver onboarding) |
| `paid` | Pagan? | Polar webhook → tabla |
| `churned` | Se van? | Falta de actividad N dias |

Instrumentacion minima sin dependencias pesadas:
- Tabla `events` en Supabase (`user_id`, `name`, `props jsonb`, `created_at`, RLS activa).
- Helper `track(name, props)` en `shared/lib/analytics.ts`.
- Vercel Analytics para web vitals + pageviews (gratis, cero config).

## Capa 2 — A/B testing (para tener QUE optimizar)

Sin variantes no hay nada que comparar. Instala un toggle simple de variantes:
- Asignacion estable por `user_id` (hash → variante A/B).
- Registra la variante en cada evento (`props.variant`).
- Asi `outcomes` puede decir "variante B convierte mejor" con evidencia.

Casos tipicos: copy de landing (AIDA vs PAS), design system, posicion del CTA, pricing.

## Capa 3 — Ingerir y leer las metricas

Fuentes reales (preferir MCP/CLI sobre scraping):
- **Supabase MCP** (`execute_sql`): funnel de eventos, signups, activacion, churn.
- **Polar:** revenue, MRR, suscripciones activas, cancelaciones.
- **Vercel Analytics:** web vitals, paginas top, fuentes de trafico.

Consultas tipicas:
```sql
-- Conversion del funnel
select name, count(distinct user_id)
from events
where created_at > now() - interval '30 days'
group by name order by count desc;

-- Conversion por variante A/B
select props->>'variant' as variant,
       count(*) filter (where name='signup') as signups
from events group by 1;
```

## Capa 3.5 — Retroalimentar a factory-brain

Cuando un resultado es claro y medible, promoverlo:
- Conversion notable de un design system → `factory-brain/patterns/design-conversions.md`
- Patron de pricing que funciono → `factory-brain/patterns/`
- Siempre con evidencia (el numero), nunca corazonada.

---

## Reporte de outcomes (formato)

Cuando el usuario pregunta "como va X":

```
APP: apoyo-legal · ultimos 30 dias
─────────────────────────────────
Signups:        142   (+18% vs mes previo)
Activacion:     61%   (87 de 142 llegaron al primer chat)
Pagos:          9     (6.3% de signups)
MRR:            $89
Churn:          11%
Web Vitals:     LCP 1.2s · CLS 0.02 · OK
Aprendizaje →   gradient-mesh: 4.1% signup (mejor que vetfunnel bento 1.9%)
                [promovido a factory-brain]
```

---

## Reglas de Oro

1. **Mide el funnel, no la vanidad.** Pageviews no es un resultado; activacion y pago si.
2. **Sin variantes no hay optimizacion.** Instala A/B desde el inicio.
3. **Evidencia al brain.** Solo datos medibles suben a factory-brain.
4. **RLS en la tabla events.** Datos de usuario, siempre protegidos.
5. **Honestidad con numeros bajos.** Si no convierte, decirlo claro — ese es el valor.
