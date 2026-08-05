---
name: parallel-build
description: |
  Construccion multi-agente en PARALELO con verificacion adversarial. Mientras bucle-agentico
  ejecuta fases en SERIE, parallel-build descompone una feature en pistas independientes
  (frontend + backend + tests + landing) y las construye simultaneamente, con un agente
  verificador que revisa cada salida antes de aceptarla. Usar para features grandes y bien
  delimitadas donde las partes no dependen entre si momento a momento.
  Triggers: construye en paralelo, parallel build, hazlo rapido con varios agentes,
  multi-agente, varios agentes a la vez, construccion concurrente, fan-out, orquesta esto,
  build paralelo, acelera la construccion.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Parallel Build — Construccion Multi-Agente con Verificacion Adversarial

> `bucle-agentico` es secuencial (fase 1 → fase 2 → fase 3).
> `parallel-build` es concurrente (frontend ‖ backend ‖ tests ‖ landing) + verificacion.
> Tiempo de pared = la pista mas lenta, no la suma de todas.

---

## Cuando usar parallel-build vs bucle-agentico

| Usa bucle-agentico cuando... | Usa parallel-build cuando... |
|------------------------------|------------------------------|
| Las fases dependen una de otra | Las pistas son independientes |
| Necesitas mapear contexto real entre fases | El contrato (tipos/API) ya esta claro |
| Es exploratorio, no sabes la forma final | Sabes exactamente que construir |
| Cambios acoplados en pocos archivos | Frontend + backend + tests + docs a la vez |

**Regla:** primero define el CONTRATO (tipos compartidos, shape de la API). Una vez fijo el
contrato, las pistas pueden construirse en paralelo sin pisarse.

---

## El patron (con la herramienta Workflow)

Esta skill usa la herramienta `Workflow` para orquestar agentes deterministicamente.

### Paso 1 — Fijar el contrato (secuencial, una sola vez)
Antes de paralelizar, define en codigo el contrato compartido:
- Tipos TypeScript (`types/`) y esquema Zod
- Shape de la(s) ruta(s) API
- Modelo de datos (tabla Supabase + RLS)

Esto es la barrera. Sin contrato claro, las pistas colisionan.

### Paso 2 — Fan-out por pistas (paralelo)
Descompon la feature en pistas que tocan archivos distintos:

```
Pista A: Backend   → Server Actions / API routes / queries Supabase
Pista B: Frontend  → componentes, hooks, store (consume el contrato)
Pista C: Tests     → Playwright CLI sobre el contrato
Pista D: Landing   → seccion de la feature en la landing (si aplica)
```

Cada pista corre como un agente independiente. Como tocan carpetas distintas
(`features/<f>/services` vs `features/<f>/components` vs tests), no hay conflicto de archivos.

> Si dos pistas DEBEN escribir los mismos archivos, aislalas en git worktree
> (`isolation: 'worktree'` en Workflow) y haz merge al final. Solo si es necesario.

### Paso 3 — Verificacion adversarial (pipeline)
Cada pista, al terminar, pasa por un agente verificador con instruccion de REFUTAR:
- "Este codigo cumple el contrato? Compila? Respeta RLS? Tiene `any`?"
- Si el verificador encuentra fallo → la pista se re-trabaja.
- Default a "rechazado" si hay duda.

### Paso 4 — Integracion y gate final
1. Merge de las pistas.
2. `npm run typecheck` + `npm run build` (debe pasar).
3. `quality-gates` si esta disponible (conversion/a11y/CWV/costo-IA).
4. `playwright-cli` para validar el flujo end-to-end.

---

## Esqueleto de orquestacion (referencia conceptual)

```
1. CONTRATO  → escribir types + zod + shape API + migracion (secuencial)
2. FAN-OUT   → Workflow: parallel([backend, frontend, tests, landing])
3. VERIFY    → cada salida → agente refutador (pipeline, sin barrera)
4. GATE      → typecheck + build + quality-gates + playwright
```

La herramienta `Workflow` SOLO se invoca cuando el usuario ha optado explicitamente por
orquestacion multi-agente, o cuando esta skill se activa por su trigger. Escala el numero
de pistas a la feature: una feature pequena no necesita 4 agentes.

---

## Auto-Blindaje

- Si una pista falla repetidamente en el verificador, NO la fuerces en paralelo:
  cae de vuelta a `bucle-agentico` para esa parte (probablemente tiene dependencias ocultas).
- Documenta el conflicto en el PRP actual.

---

## Reglas de Oro

1. **Contrato primero, paralelo despues.** Sin contrato no hay paralelismo seguro.
2. **Pistas tocan archivos distintos.** Si chocan, worktree o serie.
3. **Verificacion adversarial siempre.** Velocidad sin verificacion es deuda.
4. **El gate final es innegociable.** typecheck + build + tests deben pasar.
5. **No paralelices lo exploratorio.** Si no sabes la forma, usa bucle-agentico.
