# Bucle Agentico: Modo BLUEPRINT

> *"No planifiques lo que no entiendes. Mapea contexto, luego planifica."*

El modo BLUEPRINT es para sistemas complejos que requieren construccion por fases con mapeo de contexto just-in-time.

---

## Cuando Usar BLUEPRINT

- [ ] La tarea requiere multiples componentes coordinados
- [ ] Involucra cambios en DB + codigo + UI
- [ ] Tiene fases que dependen una de otra
- [ ] Requiere entender contexto antes de implementar
- [ ] El sistema final tiene multiples partes integradas

---

## La Innovacion Clave: Mapeo de Contexto Just-In-Time

### El Problema del Enfoque Tradicional

```
Recibir problema
    ↓
Generar TODAS las tareas y subtareas
    ↓
Ejecutar linealmente
```

**Problema**: Las subtareas se generan basandose en SUPOSICIONES, no en contexto real.

### El Enfoque BLUEPRINT

```
Recibir problema
    ↓
Generar solo FASES (sin subtareas)
    ↓
ENTRAR en Fase 1
    ↓
MAPEAR contexto real de Fase 1
    ↓
GENERAR subtareas basadas en contexto REAL
    ↓
Ejecutar Fase 1
    ↓
ENTRAR en Fase 2
    ↓
MAPEAR contexto (incluyendo lo construido en Fase 1)
    ↓
GENERAR subtareas de Fase 2
    ↓
... repetir ...
```

**Ventaja**: Cada fase se planifica con informacion REAL del estado actual del sistema.

---

## El Flujo BLUEPRINT Completo

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  PASO 1: DELIMITAR Y DESCOMPONER EN FASES                  │
│                                                             │
│  - Entender el problema FINAL completo                      │
│  - Romper en FASES ordenadas cronologicamente               │
│  - Identificar dependencias entre fases                     │
│  - NO generar subtareas todavia                             │
│  - Usar TaskCreate para registrar las fases                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  PASO 2: ENTRAR EN FASE N - MAPEAR CONTEXTO                │
│                                                             │
│  ANTES de generar subtareas, explorar:                      │
│                                                             │
│  Codebase:                                                  │
│     - Que archivos/componentes existen relacionados?        │
│     - Que patrones usa el proyecto actualmente?             │
│     - Hay codigo que puedo reutilizar?                      │
│     - Que hay en Mission-Control/ de referencia?   │
│                                                             │
│  Base de Datos (Supabase MCP):                              │
│     - Que tablas existen?                                   │
│     - Que estructura tienen?                                │
│     - Hay RLS policies configuradas?                        │
│                                                             │
│  Agent Server:                                              │
│     - Que config tiene el agente?                           │
│     - Que hooks estan configurados?                         │
│     - Que cron jobs estan activos?                          │
│                                                             │
│  Dependencias:                                              │
│     - Que construi en fases anteriores?                     │
│     - Que puedo asumir que ya existe?                       │
│     - Que restricciones tengo?                              │
│                                                             │
│  DESPUES de mapear, generar subtareas especificas           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  PASO 3: EJECUTAR SUBTAREAS DE LA FASE                     │
│                                                             │
│  WHILE subtareas pendientes en fase actual:                 │
│                                                             │
│    1. Marcar subtarea como in_progress                      │
│                                                             │
│    2. Ejecutar la subtarea                                  │
│                                                             │
│    3. [Dinamico] Usar herramientas si el juicio lo indica:  │
│       - Next.js MCP → Ver errores en tiempo real            │
│       - Playwright MCP → Validar visualmente                │
│       - Supabase MCP → Consultar/modificar DB               │
│       - Agent Server → Verificar config y estado            │
│                                                             │
│    4. Validar resultado                                     │
│       - Si hay error → AUTO-BLINDAJE (ver paso 3.5)         │
│       - Si esta bien → Marcar completed                     │
│                                                             │
│    5. Siguiente subtarea                                    │
│                                                             │
│  Fase completada cuando todas las subtareas done            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  PASO 3.5: AUTO-BLINDAJE (cuando hay errores)              │
│                                                             │
│  1. ARREGLA el codigo                                       │
│  2. TESTEA que funcione                                     │
│  3. DOCUMENTA el aprendizaje:                               │
│     - En el PRP actual (seccion "Aprendizajes")             │
│     - O en el prompt relevante (.claude/prompts/*.md)       │
│     - O en CLAUDE.md si aplica a TODO                       │
│  4. Continua con la subtarea                                │
│                                                             │
│  El conocimiento persiste. El mismo error NUNCA ocurre      │
│  dos veces en este proyecto ni en proyectos futuros.        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  PASO 4: TRANSICION A SIGUIENTE FASE                       │
│                                                             │
│  - Confirmar que fase actual esta REALMENTE completa        │
│  - NO asumir que todo salio como se planeo                  │
│  - Volver a PASO 2 con la siguiente fase                    │
│  - El contexto ahora INCLUYE lo construido                  │
│                                                             │
│  Repetir hasta completar todas las fases                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  PASO 5: VALIDACION FINAL                                  │
│                                                             │
│  - Testing end-to-end del sistema completo                  │
│  - Validacion visual con Playwright MCP                     │
│  - Confirmar que el problema ORIGINAL esta resuelto         │
│  - Reportar al usuario que se construyo                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Uso de MCPs en BLUEPRINT

Los MCPs se usan **durante la ejecucion**, no como pasos del plan.

### Durante Mapeo de Contexto

```
Supabase MCP:
   - list_tables → Ver que tablas existen
   - execute_sql → Verificar estructura actual

Codebase (Grep/Glob/Read):
   - Buscar patrones existentes en the project
   - Leer referencia en Mission-Control/
   - Consultar source de agent-server/ si se necesita

Agent Server:
   - Leer config for hooks and cron jobs
   - Verificar estado de agentes
   - Consultar logs
```

### Durante Ejecucion de Subtareas

```
Next.js MCP:
   - get_errors → Despues de escribir codigo
   - get_logs → Si algo no funciona como esperado

Playwright MCP:
   - navigate → Cargar pagina
   - screenshot → Validar UI despues de cambios
   - snapshot → Ver accessibility tree para interactuar

Supabase MCP:
   - apply_migration → Crear/modificar tablas
   - execute_sql → Verificar datos, seed, queries
```

---

## Errores Comunes a Evitar

### Error 1: Generar todas las subtareas al inicio

```
MAL:
Fase 1: DB Schema
   └─ 10 subtareas detalladas
Fase 2: API Routes
   └─ 8 subtareas (basadas en SUPOSICIONES sobre Fase 1)

BIEN:
Fase 1: DB Schema (sin subtareas)
Fase 2: API Routes (sin subtareas)

→ Entrar en Fase 1 → MAPEAR → GENERAR subtareas → Ejecutar
→ Entrar en Fase 2 → MAPEAR (ahora incluye lo REAL) → GENERAR → Ejecutar
```

### Error 2: MCPs como pasos obligatorios

```
MAL:
1. Tomar screenshot
2. Escribir codigo
3. Tomar screenshot
4. Verificar errores

BIEN:
1. Implementar componente KanbanColumn
2. Implementar drag & drop
3. Conectar con Supabase Realtime

(Usar MCPs cuando el JUICIO lo indique)
```

### Error 3: Copiar codigo de referencia directamente

```
MAL:
Copiar codigo de otro proyecto tal cual

BIEN:
Leer la LOGICA del handler
Adaptar a Next.js API Route + Supabase
Mantener el patron de eventos pero con nuestro stack
```

---

## Principios BLUEPRINT

1. **Fases primero, subtareas despues**: Solo generar subtareas cuando entras a la fase
2. **Mapeo obligatorio**: Siempre mapear contexto antes de generar subtareas
3. **MCPs como herramientas**: Usar cuando el juicio lo indique, no como pasos fijos
4. **Validacion por fase**: Confirmar que cada fase esta completa antes de avanzar
5. **Contexto acumulativo**: Cada fase hereda el contexto de las anteriores
6. **Referencia, no copia**: Usar existing components as architectural inspiration, NOT as source code to copy

---

## Checklist de Calidad BLUEPRINT

Antes de marcar una fase como completada:

- [ ] Todas las subtareas estan realmente terminadas?
- [ ] Verifique errores con Next.js MCP?
- [ ] La funcionalidad hace lo que se esperaba?
- [ ] Hay algo que deberia ajustar antes de avanzar?

Antes de transicionar a siguiente fase:

- [ ] Mapee el contexto actualizado?
- [ ] Las subtareas de la nueva fase consideran lo que YA existe?
- [ ] Hay dependencias que debo tener en cuenta?

---

## Auto-Blindaje: El Sistema que se Fortalece Solo

### Donde Documentar Aprendizajes

| Tipo de Error | Donde Documentar |
|---------------|------------------|
| Especifico de esta feature | PRP actual (seccion Aprendizajes) |
| Aplica a multiples features | `.claude/prompts/` relevante |
| Aplica a TODO el proyecto | `CLAUDE.md` (seccion No Hacer / Aprendizajes) |

### Formato

```markdown
### [YYYY-MM-DD]: [Titulo corto]
- **Error**: [Que fallo exactamente]
- **Fix**: [Como se arreglo]
- **Aplicar en**: [Donde mas aplica]
```

---

*"La precision viene de mapear la realidad, no de imaginar el futuro."*
*"El sistema que se blinda solo es invencible."*
