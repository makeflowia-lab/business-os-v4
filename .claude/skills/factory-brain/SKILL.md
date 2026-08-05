---
name: factory-brain
description: |
  Meta-memoria GLOBAL cross-proyecto. Mientras memory-manager recuerda UN proyecto,
  factory-brain destila aprendizajes de TODOS los proyectos construidos con la fabrica
  y los convierte en mejores defaults. La fabrica se vuelve mas lista con cada app.
  Usar PROACTIVAMENTE: al iniciar un proyecto nuevo (para heredar sabiduria), al cerrar
  una feature (para aportar un aprendizaje), o cuando el usuario pregunta que ha funcionado
  historicamente.
  Triggers: que ha funcionado, que design system convierte, aprendizaje global, cerebro
  de la fabrica, factory brain, sabiduria de proyectos, defaults inteligentes, que stack uso,
  cross-proyecto, entre proyectos, mejores practicas aprendidas.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Factory Brain — Meta-Memoria Global Cross-Proyecto

> `memory-manager` recuerda UN proyecto. `factory-brain` aprende de TODOS.
> Cada proyecto terminado deja al siguiente mas inteligente. Efecto compuesto.

---

## Diferencia clave con memory-manager

| | memory-manager | factory-brain |
|---|----------------|---------------|
| Alcance | Un proyecto | Todos los proyectos |
| Ubicacion | `.claude/memory/` (en el repo) | `~/.saas-factory/brain/` (global, fuera del repo) |
| Pregunta que responde | "Que paso en ESTE proyecto?" | "Que ha funcionado en TODOS mis proyectos?" |
| Cuando se consulta | Inicio de sesion del proyecto | Inicio de proyecto NUEVO + decisiones de arquitectura |

---

## Arquitectura

```
~/.saas-factory/brain/
├── BRAIN.md                  <- Indice global (se carga al iniciar proyecto nuevo)
├── patterns/                 <- Patrones que funcionaron (con evidencia)
│   ├── auth-patterns.md
│   ├── design-conversions.md <- Que design system convirtio mejor y donde
│   └── stack-choices.md
├── pitfalls/                 <- Errores que se repitieron en >1 proyecto
│   └── recurring-bugs.md
└── registry/
    └── projects.md           <- Inventario de proyectos: stack, estado, metricas
```

Crear con: `mkdir -p ~/.saas-factory/brain/{patterns,pitfalls,registry}`

---

## Cuando CONSULTAR el brain

### Al iniciar un proyecto nuevo (automatico, antes de new-app)
1. Leer `~/.saas-factory/brain/BRAIN.md`.
2. Si hay un patron relevante al tipo de proyecto, aplicarlo como default.
   Ejemplo: *"En proyectos LatAm de servicios, gradient-mesh convirtio 2x mejor — lo propongo como default."*
3. Si hay un pitfall conocido para el stack, prevenirlo desde el inicio.

### Antes de una decision de arquitectura
Verificar que no se este repitiendo un error ya documentado en `pitfalls/`.

---

## Cuando APORTAR al brain (proactivo)

| Trigger | Donde guardar |
|---------|---------------|
| Una feature/proyecto se completa con exito medible | `patterns/` |
| Un design system tuvo conversion notable (dato de `outcomes`) | `patterns/design-conversions.md` |
| El mismo bug aparecio en un 2do proyecto | `pitfalls/recurring-bugs.md` |
| Una eleccion de stack resulto claramente mejor/peor | `patterns/stack-choices.md` |
| Se publica un nuevo proyecto | `registry/projects.md` |

### Regla de promocion (clave)
Un aprendizaje sube de `memory-manager` (local) a `factory-brain` (global) SOLO cuando:
1. Aplica a MAS de un proyecto (es generalizable), **o**
2. Hay evidencia medible (un dato de `outcomes`, no una corazonada).

Lo especifico de un proyecto se queda en su `.claude/memory/`. Lo generalizable sube al brain.

---

## Formato de un aprendizaje (con evidencia)

```markdown
## [2026-06-06] gradient-mesh > bento-grid en servicios B2C LatAm

**Evidencia:** apoyo-legal (gradient-mesh) 4.1% signup vs vetfunnel (bento-grid) 1.9%.
**Generalizable a:** landings de servicios dirigidas a consumidor final en MX/LatAm.
**Default sugerido:** proponer gradient-mesh primero en este tipo de proyecto.
**Confianza:** media (2 proyectos). Subir confianza con mas datos.
```

Siempre fecha absoluta. Siempre evidencia. Sin evidencia no es aprendizaje, es opinion.

---

## Integracion con otros skills

- **new-app:** consulta el brain antes de la entrevista para heredar defaults.
- **outcomes:** alimenta el brain con datos reales de conversion/revenue.
- **vertical-pack:** cuando un proyecto se convierte en pack reusable, se registra aqui.
- **memory-manager:** es la fuente local; el brain es el destilado global.

---

## Reglas de Oro

1. **Evidencia > opinion.** Un aprendizaje sin dato medible no entra al brain.
2. **Generalizable o no entra.** Lo de un solo proyecto vive en su memoria local.
3. **El brain es global, vive fuera del repo.** No se commitea a ningun proyecto.
4. **Confianza explicita.** Marca cuantos proyectos respaldan cada patron.
5. **El usuario es el dueno.** Puede editar o borrar cualquier aprendizaje global.
