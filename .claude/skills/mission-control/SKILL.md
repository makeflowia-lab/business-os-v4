---
name: mission-control
description: |
  Dashboard de PORTAFOLIO: el pulso de TODAS las apps en una sola vista — salud, deploy,
  revenue, errores. De N carpetas dispersas a un centro de comando. Usar cuando el usuario
  quiere ver el estado global de todos sus proyectos, no solo el actual.
  Triggers: mission control, panel de proyectos, estado de todas mis apps, portafolio,
  como van todos, dashboard global, centro de comando, resumen de proyectos, vista general,
  que apps tengo, salud de mis proyectos.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Mission Control — Centro de Comando del Portafolio

> Se corren varios proyectos en carpetas separadas. Mission Control los une en UNA vista.
> No es una app deployada — es un registro + reporte que vive en la fabrica.

---

## Que es

Mission Control mantiene un **registro del portafolio** y genera un **reporte de estado**
bajo demanda. Lee de un registro central + las fuentes reales de cada proyecto.

```
~/.saas-factory/brain/registry/projects.md   <- inventario (compartido con factory-brain)
```

Cada proyecto registrado:
```markdown
## apoyo-legal
- Ruta: d:\saas-factory-v4\... (o repo)
- Stack: Next.js + Neon + OpenRouter
- Deploy: https://apoyo-legal.vercel.app
- Estado: LIVE
- Fuentes: Vercel (deploy), Supabase/Neon (db), Polar (pagos)
- Notas: webpack obligatorio (SWC nativo corrupto)
```

---

## Como generar el reporte

### Paso 1 — Leer el registro
Leer `~/.saas-factory/brain/registry/projects.md`. Si no existe, construirlo escaneando
las carpetas de proyectos conocidas + la memoria global.

### Paso 2 — Consultar fuentes (las que esten disponibles)
Por cada proyecto, recolectar señales rapidas:
- **Deploy/salud:** `vercel ls` / estado del ultimo deploy, ping al dominio.
- **Build local:** ultimo `npm run build` (verde/rojo).
- **Revenue:** Polar (si tiene pagos) via outcomes.
- **Errores:** logs (Sentry/Vercel) si esta integrado guardian.
- **Git:** rama, ultimo commit, si hay cambios sin commitear.

### Paso 3 — Render del tablero

```
MISSION CONTROL · 2026-06-06 · 8 proyectos
══════════════════════════════════════════════════════════════
PROYECTO          ESTADO   DEPLOY    REVENUE   ERRORES  ULTIMO
──────────────────────────────────────────────────────────────
apoyo-legal       ● LIVE   OK        $89 MRR   0        hace 2d
raziel            ● LIVE   OK        —         0        hace 1d
video-generator   ● LIVE   OK        —         2 warn   hace 5d
funeralis         ◐ DEV    —         —         —        hace 3d
vetfunnel         ⚠ BLOCK  build x   —         —        falta KEY
captura-facial    ● LIVE   OK        —         0        hace 1d
bizfinder         ● LIVE   OK        —         0        hace 4d
petmemorial       ◐ DEV    —         —         —        nuevo
──────────────────────────────────────────────────────────────
ACCION SUGERIDA: vetfunnel bloqueado por OPENROUTER_API_KEY faltante.
```

Leyenda: ● LIVE · ◐ DEV · ⚠ atencion · ○ archivado.

### Paso 4 — Accion sugerida
Siempre cerrar con la accion de mayor palanca: el proyecto que esta bloqueado,
el que perdio el deploy, el que tiene errores nuevos.

---

## Integracion con otros skills

- **factory-brain:** comparte el registro `projects.md`.
- **outcomes:** provee revenue/conversion por proyecto.
- **guardian:** provee estado de errores y auto-fixes.

---

## Reglas de Oro

1. **Una vista, todo el portafolio.** El valor es no tener que entrar carpeta por carpeta.
2. **Señales rapidas, no auditoria.** Estado de un vistazo, no analisis profundo.
3. **Siempre una accion sugerida.** El tablero termina en "que hacer ahora".
4. **El registro es la fuente.** Mantenlo al dia cuando nace o muere un proyecto.
5. **Honesto con lo desconocido.** Si una fuente no esta disponible, marcar "—", no inventar.
