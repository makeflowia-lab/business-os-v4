---
name: cost-optimizer
description: |
  Optimiza la unit economics de cada app: elige el modelo mas barato que cumple la tarea,
  rutea por costo en OpenRouter, pone presupuestos de tokens y calcula el costo-IA por usuario.
  La fabrica construia features de IA sin pensar en cuanto cuestan por usuario. Usar al agregar
  IA, antes de escalar, o cuando el usuario pregunta cuanto cuesta operar una app.
  Triggers: cuanto cuesta, costo por usuario, optimiza costos, modelo mas barato, routing de
  modelos, presupuesto de tokens, unit economics, cost optimizer, reducir costos de IA,
  margen, rentabilidad, abaratar, openrouter precios.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Cost Optimizer — Inteligencia Economica de la App

> Cada llamada a un LLM cuesta dinero. Si no sabes el costo-IA por usuario, no sabes si
> tu SaaS es rentable. Esta skill hace que cada app sea rentable POR DISENO.

---

## El principio: el modelo mas barato que CUMPLE

No uses el modelo mas potente por default. Usa el mas barato que pasa la tarea.

| Tarea | Modelo sugerido (tier) |
|-------|------------------------|
| Clasificacion / extraccion / formato | Haiku / modelos chicos |
| Chat de soporte, resumenes | Sonnet / mid-tier |
| Razonamiento complejo, codigo, agentes | Opus / top-tier (solo si hace falta) |

OpenRouter permite rutear por costo y poner fallbacks. Usalo: empieza barato, escala el
modelo solo si la calidad no alcanza (medido, no asumido).

---

## Las 4 palancas de costo

### 1. Seleccion de modelo por tarea
Mapear cada llamada de IA de la app a la tarea real y asignar el tier minimo viable.
Documentar en `shared/lib/ai-config.ts` que modelo usa cada feature y por que.

### 2. Routing y fallback en OpenRouter
- Modelo primario barato → fallback a uno mejor solo si falla/baja calidad.
- Aprovechar el price-routing de OpenRouter.

### 3. Presupuesto de tokens
- Limitar `max_tokens` de salida a lo necesario (no dejar default alto).
- Acortar prompts: system prompts concisos, contexto solo lo relevante.
- Cache de prompts cuando el SDK lo permita (contexto repetido).

### 4. Costo-IA por usuario (la metrica clave)
```
costo-IA por usuario = (tokens_in * precio_in + tokens_out * precio_out) / usuarios_activos
```
Si esto supera lo que paga el usuario → la app pierde dinero al escalar. Alerta temprana.

---

## Como se implementa

### Paso 1 — Inventariar las llamadas de IA
Escanear el proyecto: cuantas llamadas a LLM hay, en que features, con que modelo.

### Paso 2 — Reasignar tiers
Bajar cada llamada al tier minimo viable. Documentar el mapeo.

### Paso 3 — Instrumentar costo
Registrar tokens_in/tokens_out por llamada (evento en tabla `events`, via outcomes).
Calcular costo-IA por usuario en el reporte.

### Paso 4 — Poner guardrails
- `max_tokens` razonable por endpoint.
- Rate limit por usuario (evitar abuso que dispara costos).
- Fallback de modelo configurado.

### Paso 5 — Reportar
```
COSTO-IA · apoyo-legal · 30 dias
─────────────────────────────────
Llamadas:           3,420
Modelo principal:   gpt-4o-mini (via OpenRouter)
Tokens:             2.1M in / 480K out
Costo total:        ~$3.80
Usuarios activos:   142
Costo-IA/usuario:   $0.027   ← sano (paga $9.90/mes)
```

---

## Integracion

- **ai:** cost-optimizer revisa los templates de IA antes de dar por buena una feature.
- **outcomes:** provee los tokens reales para calcular costo/usuario.
- **factory-brain:** registra que tier funciono para que tarea (aprendizaje global).
- **quality-gates:** costo-IA/usuario es uno de los gates duros.

---

## Reglas de Oro

1. **El mas barato que cumple, no el mas potente.** Escala el modelo solo con evidencia.
2. **Mide tokens reales.** Sin instrumentacion, el costo es invisible.
3. **Costo-IA/usuario es la metrica.** Si supera el ingreso/usuario, hay que actuar.
4. **Limita max_tokens y rate.** Un loop sin limite vacia la cuenta.
5. **Fallback, no single point.** Modelo barato primero, mejor solo si falla.
