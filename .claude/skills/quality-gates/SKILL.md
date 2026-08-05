---
name: quality-gates
description: |
  Gates de calidad DUROS antes de dar por buena una feature o un deploy. Playwright dice
  "funciona"; quality-gates dice "es bueno Y rentable": typecheck/build, accesibilidad (a11y),
  Core Web Vitals, conversion minima y costo-IA por usuario. Si un gate falla, no pasa. Usar
  antes de cada deploy y al cerrar features importantes.
  Triggers: quality gates, gates de calidad, esta listo para deploy, checa la calidad,
  accesibilidad, a11y, core web vitals, performance, lighthouse, esta bien hecho,
  validacion de calidad, requisitos minimos, listo para produccion.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Quality Gates — Calidad como Requisito, no como Opinion

> "Funciona" no es suficiente. Una feature pasa solo si cruza TODOS los gates.
> Si un gate falla, no se deploya. Sin excepciones silenciosas.

---

## Los gates (todos obligatorios)

### Gate 1 — Compila y construye
```bash
npm run typecheck   # cero errores, cero `any`
npm run build       # build de produccion verde
npm run lint        # sin errores de lint
```
Bloqueante. Si no compila, nada mas importa.

### Gate 2 — Accesibilidad (a11y)
- Roles ARIA y labels en inputs/botones.
- Contraste de color suficiente (WCAG AA).
- Navegacion por teclado (focus visible, orden logico).
- Imagenes con `alt`.
Verificar con Playwright (snapshot del arbol de accesibilidad) o axe.

### Gate 3 — Core Web Vitals
| Metrica | Umbral |
|---------|--------|
| LCP (Largest Contentful Paint) | < 2.5s |
| CLS (Cumulative Layout Shift) | < 0.1 |
| INP (Interaction to Next Paint) | < 200ms |
Medir con Vercel Analytics (real) o Lighthouse (lab). No deployar regresiones.

### Gate 4 — Conversion minima (si aplica)
Para landings/funnels: no romper la conversion existente. Si hay un cambio que la baja
(dato de `outcomes`), revertir o iterar. Para features nuevas, instrumentar el evento.

### Gate 5 — Costo-IA por usuario (si usa IA)
De `cost-optimizer`: el costo-IA/usuario debe estar por debajo del ingreso/usuario.
Una feature de IA que pierde dinero al escalar no pasa.

### Gate 6 — Seguridad basica
- RLS activa en toda tabla nueva (verificar con `get_advisors`).
- Sin secrets en codigo.
- Inputs validados con Zod.
- Considerar correr la review de seguridad si el cambio toca auth/datos.

---

## Como correr los gates

### Al cerrar una feature
1. Gate 1 (compila) — siempre.
2. Gates 2-3 (a11y, CWV) — si toca UI.
3. Gate 4 (conversion) — si toca landing/funnel.
4. Gate 5 (costo-IA) — si toca IA.
5. Gate 6 (seguridad) — si toca datos/auth.

### Reporte de gates
```
QUALITY GATES · feature: chat-soporte
──────────────────────────────────────
[✓] Gate 1  typecheck + build + lint
[✓] Gate 2  a11y (axe: 0 violaciones criticas)
[✓] Gate 3  CWV (LCP 1.4s · CLS 0.03 · INP 120ms)
[—] Gate 4  conversion (no aplica)
[✓] Gate 5  costo-IA/usuario $0.02 < $9.90 ingreso
[✓] Gate 6  RLS activa · sin secrets · Zod OK
──────────────────────────────────────
RESULTADO: PASA · listo para deploy
```

Si cualquier gate marca [✗], el resultado es BLOQUEADO y se explica que arreglar.

---

## Auto-Blindaje

Cuando un gate detecta un problema recurrente (mismo tipo de fallo en >1 feature),
documentarlo en el skill relevante o en CLAUDE.md para que no vuelva a pasar.

---

## Reglas de Oro

1. **Un gate falla → no pasa.** Sin excepciones silenciosas.
2. **"Funciona" no es "esta bueno".** A11y, performance y costo tambien cuentan.
3. **Mide, no asumas.** CWV reales, costo real, conversion real.
4. **Sin caps silenciosos.** Si saltas un gate, dilo explicitamente y por que.
5. **Seguridad es un gate, no un extra.** RLS y validacion siempre.
