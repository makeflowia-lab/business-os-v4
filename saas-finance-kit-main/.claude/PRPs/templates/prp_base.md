# PRP-XXX: [Titulo Descriptivo]

> **Estado**: PENDIENTE APROBACION
> **Fecha**: YYYY-MM-DD
> **Autor**: Claude [Model]
> **Proyecto**: [nombre-proyecto]

---

## Objetivo

[Que se construye - estado final deseado. Se especifico.]

---

## Por Que

| Problema Actual | Solucion Propuesta |
|-----------------|-------------------|
| [Problema 1] | [Como lo resuelve] |
| [Problema 2] | [Como lo resuelve] |

**Valor de negocio**: [Impacto medible en usuarios/negocio]

---

## Que

### Comportamiento Esperado
[Descripcion del comportamiento visible para el usuario]

### Criterios de Exito
- [ ] [Criterio 1 - medible]
- [ ] [Criterio 2 - medible]
- [ ] [Criterio 3 - medible]

---

## Contexto Necesario

### Documentacion & Referencias
```yaml
# LECTURA OBLIGATORIA
- url: [URL de documentacion oficial]
  why: [Secciones especificas necesarias]

- file: [src/features/existente/...]
  why: [Patron a seguir]

- doc: [URL de libreria]
  critical: [Gotcha importante]
```

### Arquitectura Actual (Feature-First)
```
src/features/
├── [feature-existente]/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   ├── store/
│   └── types/
```

### Arquitectura Propuesta
```
src/features/
├── [nueva-feature]/
│   ├── components/
│   │   └── [Componentes a crear]
│   ├── hooks/
│   │   └── [Hooks a crear]
│   ├── services/
│   │   └── [Servicios a crear]
│   ├── store/
│   │   └── [Store si es necesario]
│   └── types/
│       └── index.ts
```

### Modelos de Datos (Supabase)
```sql
-- Tabla: [nombre_tabla]
CREATE TABLE [nombre_tabla] (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  -- [campos...]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices
CREATE INDEX idx_[tabla]_[campo] ON [tabla]([campo]);

-- RLS
ALTER TABLE [tabla] ENABLE ROW LEVEL SECURITY;
```

---

## Blueprint de Implementacion

### Fase 1: [Nombre de Fase]
**Objetivo**: [Que se logra en esta fase]

- [ ] Tarea 1.1
- [ ] Tarea 1.2
- [ ] Tarea 1.3

**Validacion**: [Como verificar que esta fase esta completa]

### Fase 2: [Nombre de Fase]
**Objetivo**: [Que se logra en esta fase]

- [ ] Tarea 2.1
- [ ] Tarea 2.2

**Validacion**: [Como verificar]

### Fase N: Validacion E2E
**Objetivo**: Testing completo del sistema

- [ ] Validar flujo completo con Playwright
- [ ] Verificar que no hay errores de TypeScript
- [ ] Probar en navegador manualmente
- [ ] Fix de cualquier error detectado

---

## Bucle de Validacion

### Nivel 1: TypeScript & Linting
```bash
# Ejecuta PRIMERO - corrige errores antes de continuar
npm run typecheck
npm run lint

# Esperado: Sin errores
```

### Nivel 2: Build
```bash
npm run build

# Esperado: Build exitoso sin warnings criticos
```

### Nivel 3: Tests (si aplica)
```bash
npm run test

# Esperado: Todos los tests pasan
```

### Nivel 4: Validacion Visual (Playwright)
```typescript
// Navegar a la ruta
// Tomar screenshot
// Verificar elementos visibles
// Interactuar con UI
```

---

## Gotchas Conocidos

```typescript
// CRITICO: [Libreria] requiere [configuracion especifica]
// Ejemplo: Chart.js + SSR requiere dynamic import

// CRITICO: [Patron] debe seguir [convencion]
// Ejemplo: Neumorphism usa bg-neu-bg y shadow-neu

// CRITICO: [API] tiene [limitacion]
// Ejemplo: Supabase RLS debe habilitarse en produccion
```

---

## Anti-Patrones a Evitar

- NO crear nuevos patrones si los existentes funcionan
- NO duplicar logica (usar stores/services existentes)
- NO hardcodear valores (usar constantes/config)
- NO ignorar errores de TypeScript
- NO mezclar estilos (mantener Neumorphism consistente)
- NO omitir validacion Zod en inputs de usuario

---

## Dependencias a Instalar

```bash
npm install [dependencia-1] [dependencia-2]
```

---

## Variables de Entorno (si aplica)

```env
# .env.local
NUEVA_VAR=valor
```

---

## Referencias

- **Proyecto**: `/path/to/project`
- **Docs**: [URLs relevantes]
- **Stack**: Next.js 16 + React 19 + TypeScript + Tailwind + Supabase

---

*Este PRP es el resultado de investigacion. No se ha modificado codigo todavia.*
