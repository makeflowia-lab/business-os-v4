# Sistema PRP (Product Requirements Proposal)

> **Contrato humano-IA antes de escribir codigo**

---

## Que es un PRP?

Un PRP es un documento estructurado que actua como **contrato** entre el humano (product owner) y la IA (execution engine). Define el **QUE** se construira y proporciona suficiente contexto para que la IA determine el **COMO**.

```
Humano: "Quiero X" (idea de negocio)
   |
   v
[PRP] <-- Contrato de lo que se construira
   |
   v
IA: Ejecuta Blueprint fase por fase
   |
   v
Producto funcional + Changelog
```

---

## Anatomia de un PRP

| Seccion | Proposito | Responsable |
|---------|-----------|-------------|
| **Objetivo** | Que se construye (estado final deseado) | Humano define |
| **Por Que** | Valor de negocio, problemas que resuelve | Humano define |
| **Que** | Comportamiento visible, criterios de exito | Humano + IA |
| **Contexto** | Docs, referencias, gotchas del codebase | IA investiga |
| **Blueprint** | Fases de implementacion con tareas | IA genera |
| **Validacion** | Tests, linting, verificacion manual | IA ejecuta |
| **Anti-Patrones** | Errores comunes a evitar | IA documenta |

---

## Flujo de Trabajo PRP

```
1. SOLICITUD
   Humano: "Necesito [feature/integracion/fix]"

2. INVESTIGACION (si es necesario)
   IA: Explora codebase, APIs externas, dependencias
   IA: Documenta hallazgos en PRP

3. GENERACION PRP
   IA: Crea PRP-XXX-nombre-descriptivo.md
   IA: Incluye todo el contexto necesario
   Estado: "PENDIENTE APROBACION"

4. REVISION HUMANA
   Humano: Revisa, solicita cambios o aprueba
   Estado: "APROBADO" o "EN REVISION"

5. EJECUCION BLUEPRINT
   IA: Implementa fase por fase
   IA: Valida cada fase antes de continuar
   Estado: "EN PROGRESO"

6. VALIDACION FINAL
   IA: Ejecuta todos los tests
   IA: Verifica criterios de exito
   Estado: "COMPLETADO"

7. CHANGELOG
   IA: Documenta cambios en changelog/
   IA: Actualiza PRP con fecha de completacion
```

---

## Estructura de Carpetas

```
.claude/PRPs/
├── README.md                    # Este archivo
├── templates/
│   └── prp_base.md             # Template base para nuevos PRPs
├── changelog/
│   └── YYYY-MM-DD-PRP-XXX.md   # Registro de PRPs completados
├── PRP-001-*.md                 # PRPs activos
├── PRP-002-*.md
└── ...
```

---

## Convenciones de Nomenclatura

### Archivos PRP
```
PRP-[NUMERO]-[descripcion-kebab-case].md

Ejemplos:
- PRP-001-integracion-sistema-financiero.md
- PRP-002-sistema-prp-changelog.md
- PRP-003-dashboard-analytics.md
```

### Estados del PRP
| Estado | Significado |
|--------|-------------|
| `INVESTIGACION` | IA explorando antes de generar PRP |
| `PENDIENTE APROBACION` | PRP generado, esperando revision |
| `APROBADO` | Humano aprobo, listo para ejecutar |
| `EN PROGRESO` | Blueprint en ejecucion |
| `COMPLETADO` | Todas las fases terminadas |
| `ARCHIVADO` | PRP cancelado o reemplazado |

---

## Changelog Automatico

Cada PRP completado genera una entrada en `changelog/`:

```markdown
# Changelog: PRP-001

**Fecha**: 2024-12-12
**PRP**: PRP-001-integracion-sistema-financiero.md
**Estado**: COMPLETADO

## Resumen de Cambios
- [Lista de archivos creados/modificados]
- [Features implementadas]
- [Migraciones aplicadas]

## Commit(s) Asociados
- abc1234: feat(finances): add transactions table
- def5678: feat(finances): add KPI components
```

---

## Mejores Practicas

### Para Humanos
1. **Se especifico** en el objetivo - "Quiero X para lograr Y"
2. **Define criterios de exito** medibles
3. **Revisa el PRP** antes de aprobar
4. **Itera** si algo no esta claro

### Para la IA
1. **Investiga primero** si el scope no esta claro
2. **Incluye todo el contexto** necesario en el PRP
3. **Valida cada fase** antes de continuar
4. **Documenta gotchas** encontrados durante implementacion
5. **Actualiza changelog** al completar

---

## Stack Tecnico (Golden Path)

Este sistema PRP esta optimizado para el siguiente stack:

| Capa | Tecnologia |
|------|------------|
| Framework | Next.js 16 (App Router + Turbopack) |
| UI | React 19 + TypeScript |
| Estilos | Tailwind CSS 3.4 |
| Estado | Zustand |
| Backend | Supabase (Auth + DB + Storage) |
| AI | Vercel AI SDK + OpenRouter |
| Testing | Playwright MCP |
| Validacion | Zod |

---

*Ultima actualizacion: 2024-12-12*
