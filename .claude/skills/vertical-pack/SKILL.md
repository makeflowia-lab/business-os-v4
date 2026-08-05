---
name: vertical-pack
description: |
  Convierte un proyecto TERMINADO en un pack vertical REUSABLE (un skill nuevo). La fabrica
  come su propio output: cada app exitosa se destila en una capacidad reusable para las
  siguientes. Ej: captura-facial → pack de reconocimiento facial; apoyo-legal → pack RAG legal;
  video-generator → pack de generacion de video. Usar cuando un proyecto madura y su nucleo
  vale la pena reutilizar.
  Triggers: convierte esto en skill, pack vertical, vertical pack, hazlo reusable, extrae
  este patron, plantilla de este proyecto, reutilizar este proyecto, generaliza esto,
  empaqueta esta feature, convierte en template.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Vertical Pack — Proyecto Terminado → Skill Reusable

> La fabrica come su propio output. Cada proyecto exitoso deja un pack que acelera el siguiente.
> captura-facial, video-generator, apoyo-legal: packs latentes esperando ser extraidos.

---

## Que es un pack vertical

Un pack vertical es un **skill** que encapsula el nucleo reusable de un proyecto: la logica
de dominio, las integraciones, los gotchas ya resueltos. No copia el proyecto entero — destila
lo GENERALIZABLE y deja afuera lo especifico del cliente.

| Proyecto fuente | Pack vertical resultante | Nucleo reusable |
|-----------------|--------------------------|-----------------|
| captura-facial | `pack-face-recognition` | face-api models, matcher, captura, identify route |
| apoyo-legal | `pack-rag-legal` | ingest de docs, embeddings, chat RAG citado |
| video-generator | `pack-video-viral` | pipeline Pixabay + TTS + Creatomate + share |

---

## Proceso de extraccion

### Paso 1 — Identificar el nucleo vs lo especifico
Lee el proyecto fuente y separa:
- **Nucleo reusable:** logica de dominio, integraciones, gotchas resueltos, estructura de datos.
- **Especifico (NO va al pack):** branding del cliente, copy concreto, secrets, datos semilla.

### Paso 2 — Anonimizar y parametrizar
- Reemplaza valores hardcodeados por parametros/variables de entorno.
- Quita secrets (van a `.env.local.example` con placeholder).
- Convierte copy especifico en plantillas con `{{variables}}`.

### Paso 3 — Crear el skill del pack
Crear `.claude/skills/pack-<nombre>/`:
```
pack-<nombre>/
├── SKILL.md           <- Cuando usar el pack + pasos de integracion
├── references/        <- Codigo de referencia del nucleo (templates)
└── scripts/           <- Scripts de setup (descargar modelos, migraciones, etc.)
```

El `SKILL.md` debe documentar:
- Que capacidad agrega
- Pre-requisitos (ej: add-login, OPENROUTER_API_KEY)
- Pasos de integracion en un proyecto nuevo
- Gotchas ya resueltos (el oro del pack — los commits de dolor)

### Paso 4 — Registrar en factory-brain
Anota el nuevo pack en `~/.saas-factory/brain/registry/projects.md` para que
proyectos futuros sepan que existe.

### Paso 5 — Validar
Idealmente, probar el pack integrandolo en un proyecto limpio. Si no, dejar
documentado que esta sin validar en limpio.

---

## Que hace bueno a un pack

1. **Gotchas documentados.** El valor real es el dolor ya resuelto (los 14 commits de add-mobile, los models de captura-facial). Capturalos.
2. **Cero secrets.** Nunca un secret real en el pack.
3. **Parametrizado, no copiado.** Variables, no valores fijos.
4. **Pre-requisitos claros.** Que necesita el proyecto antes de integrar el pack.
5. **Integrable en pasos.** Como add-login: un flujo claro, no "copia esta carpeta y reza".

---

## Relacion con otros skills

- **skill-creator:** vertical-pack es un caso especializado — usa su scaffolding si ayuda.
- **factory-brain:** registra el pack como activo reusable global.
- **eject-sf:** lo opuesto — eject quita la fabrica; vertical-pack extrae valor hacia la fabrica.

---

## Reglas de Oro

1. **Destila, no copies.** El pack es el nucleo generalizable, no el proyecto entero.
2. **El oro son los gotchas.** Documenta el dolor ya resuelto.
3. **Cero secrets, siempre parametrizado.**
4. **Registra en el brain.** Un pack que nadie sabe que existe no sirve.
5. **Lo especifico del cliente NO entra.** Branding y copy concreto se quedan en el proyecto.
