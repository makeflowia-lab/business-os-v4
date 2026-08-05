# PRP-002: Admin Panel - Configuracion Centralizada

> **Estado**: PENDIENTE APROBACION
> **Fecha**: 2024-12-24
> **Autor**: Claude Opus 4.5
> **Proyecto**: Finanzas OS

---

## Objetivo

Crear un **Admin Panel** centralizado donde el usuario pueda:
1. Gestionar categorias de gastos/ingresos (CRUD)
2. Personalizar el System Prompt del CFO Agent
3. Modificar variables de la Calculadora ROI
4. Cerrar sesion (movido desde header)

Ademas, **forzar autenticacion** para acceder al dashboard (corregir inconsistencia local vs produccion).

---

## Por Que

| Problema Actual | Solucion Propuesta |
|-----------------|-------------------|
| Categorias hardcodeadas en codigo | Categorias dinamicas en Supabase, editables por usuario |
| System Prompt del agente es estatico | Permitir personalizacion con valor default |
| Variables ROI solo en localStorage | Persistir en BD para consistencia |
| "Cerrar Sesion" ocupa espacio en header | Mover a Admin Panel, mejor UX |
| Local no pide login, produccion si | Forzar auth en middleware consistentemente |
| Cuentas bancarias hardcodeadas | (Futuro) Cuentas dinamicas por usuario |

**Valor de negocio**:
- Usuarios pueden adaptar el sistema a SU negocio sin tocar codigo
- Mejor experiencia de usuario con configuracion centralizada
- Preparacion para multi-tenancy (cada usuario sus categorias/cuentas)

---

## Que

### Comportamiento Esperado

1. **Dropdown "Finanzas"** ahora incluye:
   - Calculadora ROI
   - Mensuales
   - Anuales
   - Reportes
   - **--- Separador ---**
   - **Admin Panel** (nuevo)

2. **Pagina `/admin`** con tabs:
   - **Categorias**: Lista de categorias de gastos/ingresos con color picker
   - **CFO Agent**: Editor de system prompt con preview
   - **Calculadora**: Variables y defaults del ROI calculator
   - **Cuenta**: Info del usuario + Cerrar Sesion

3. **Auth Enforcement**:
   - Todas las rutas `/` requieren login
   - Solo rutas `/(auth)/*` son publicas

### Criterios de Exito

- [ ] Usuario puede agregar/editar/eliminar categorias de gastos
- [ ] Usuario puede agregar/editar/eliminar categorias de ingresos
- [ ] Categorias nuevas aparecen en modal de transacciones y graficas
- [ ] Usuario puede editar system prompt del agente (con boton "Reset to Default")
- [ ] Variables del wizard se guardan en BD (no solo localStorage)
- [ ] Auth funciona igual en local y produccion
- [ ] "Cerrar Sesion" movido a Admin Panel

---

## Contexto Necesario

### Documentacion & Referencias

```yaml
# LECTURA OBLIGATORIA
- file: src/lib/categoryColors.ts
  why: Fuente actual de categorias hardcodeadas

- file: src/app/api/agent/route.ts
  why: SYSTEM_PROMPT actual del agente (lineas 105-126)

- file: src/features/calculator/store/calculatorStore.ts
  why: Estado actual del wizard ROI

- file: src/lib/supabase/middleware.ts
  why: Logica de auth y rutas publicas

- file: src/shared/components/ui/NavBar.tsx
  why: Estructura actual del dropdown Finanzas
```

### Arquitectura Actual (Relevante)

```
src/
├── lib/
│   ├── categoryColors.ts         # Categorias HARDCODED
│   └── supabase/
│       └── middleware.ts         # Auth logic
├── features/
│   ├── calculator/
│   │   └── store/calculatorStore.ts  # ROI state (localStorage)
│   └── finances/
│       └── types/index.ts        # Re-export categorias
├── app/
│   ├── api/agent/route.ts        # SYSTEM_PROMPT estatico
│   └── (main)/
│       └── [rutas protegidas]
└── shared/
    └── components/ui/NavBar.tsx  # Dropdown Finanzas
```

### Arquitectura Propuesta

```
src/
├── features/
│   └── admin/                    # NUEVA FEATURE
│       ├── components/
│       │   ├── CategoryManager.tsx      # CRUD categorias
│       │   ├── AgentPromptEditor.tsx    # Editor system prompt
│       │   ├── CalculatorSettings.tsx   # Variables ROI
│       │   └── AccountSection.tsx       # Info usuario + logout
│       ├── services/
│       │   └── adminService.ts          # CRUD Supabase
│       ├── hooks/
│       │   └── useAdminConfig.ts        # Hook para cargar config
│       ├── types/
│       │   └── index.ts
│       └── index.ts
├── app/
│   └── (main)/
│       └── admin/
│           └── page.tsx          # Admin Panel page
└── lib/
    └── categoryColors.ts         # MODIFICAR: leer de BD o usar defaults
```

### Modelos de Datos (Supabase)

```sql
-- Tabla: user_config (configuracion por usuario)
CREATE TABLE user_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Categorias personalizadas (JSON arrays)
  expense_categories JSONB DEFAULT '[]'::jsonb,
  income_categories JSONB DEFAULT '[]'::jsonb,

  -- System prompt personalizado (null = usar default)
  agent_system_prompt TEXT DEFAULT NULL,

  -- Variables calculator (JSON object)
  calculator_defaults JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices
CREATE INDEX idx_user_config_user_id ON user_config(user_id);

-- RLS
ALTER TABLE user_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own config"
  ON user_config FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Estructura de expense_categories/income_categories:
-- [
--   { "name": "Nomina", "color": "#6366F1" },
--   { "name": "Software", "color": "#8B5CF6" },
--   ...
-- ]

-- Estructura de calculator_defaults:
-- {
--   "monthlyRevenue": 50000,
--   "fixedCosts": 15000,
--   ...
-- }
```

---

## Blueprint de Implementacion

### Fase 1: Migracion BD + Auth Fix
**Objetivo**: Crear tabla user_config y asegurar auth consistente

- [ ] Aplicar migracion SQL para `user_config`
- [ ] Verificar RLS policies
- [ ] Revisar middleware.ts - asegurar que TODAS las rutas requieren auth excepto /(auth)/*
- [ ] Probar en local que redirige a /login sin sesion

**Validacion**:
- Tabla visible en Supabase Dashboard
- `localhost:3000/` sin sesion → redirige a `/login`

### Fase 2: Admin Service + Types
**Objetivo**: Backend para CRUD de configuracion

- [ ] Crear `src/features/admin/types/index.ts`
- [ ] Crear `src/features/admin/services/adminService.ts`
  - `getUserConfig()` - obtener config o crear default
  - `updateCategories(type, categories)` - actualizar categorias
  - `updateAgentPrompt(prompt)` - actualizar system prompt
  - `updateCalculatorDefaults(defaults)` - actualizar variables ROI
- [ ] Crear `src/features/admin/hooks/useAdminConfig.ts`

**Validacion**:
- Llamadas a Supabase funcionan desde consola

### Fase 3: UI Admin Panel
**Objetivo**: Pagina /admin con tabs

- [ ] Crear `src/app/(main)/admin/page.tsx`
- [ ] Crear `CategoryManager.tsx`
  - Lista de categorias con color picker
  - Agregar/Editar/Eliminar
  - Separar por tipo (gasto/ingreso)
- [ ] Crear `AgentPromptEditor.tsx`
  - Textarea con syntax highlighting (opcional)
  - Boton "Reset to Default"
  - Preview del prompt final
- [ ] Crear `CalculatorSettings.tsx`
  - Formulario con variables ROI
  - Valores default editables
- [ ] Crear `AccountSection.tsx`
  - Info del usuario (email, nombre)
  - Boton "Cerrar Sesion"

**Validacion**:
- Navegacion a /admin funciona
- Tabs funcionan
- UI renderiza sin errores

### Fase 4: Integracion Categorias Dinamicas
**Objetivo**: El sistema usa categorias de BD en lugar de hardcoded

- [ ] Modificar `categoryColors.ts`:
  - Mantener defaults como fallback
  - Exportar funcion `getCategories(userId)` async
  - Hook `useCategories()` que carga de BD
- [ ] Modificar `AddTransactionModal.tsx`:
  - Usar hook para cargar categorias
  - Loading state mientras carga
- [ ] Modificar `CategoryDistribution.tsx`:
  - Colores dinamicos segun config usuario
- [ ] Modificar graficas que usan categorias

**Validacion**:
- Agregar categoria en Admin → aparece en modal de transaccion
- Eliminar categoria → desaparece del modal
- Colores personalizados se reflejan en graficas

### Fase 5: Integracion System Prompt
**Objetivo**: El agente usa prompt personalizado

- [ ] Modificar `src/app/api/agent/route.ts`:
  - Obtener user_id del request
  - Cargar config de usuario
  - Usar prompt personalizado o DEFAULT_SYSTEM_PROMPT
- [ ] En Admin Panel:
  - Guardar prompt personalizado
  - Boton para resetear a default

**Validacion**:
- Cambiar prompt en Admin → siguiente chat usa nuevo prompt
- Reset → vuelve al comportamiento default

### Fase 6: NavBar Update
**Objetivo**: Agregar Admin Panel al dropdown

- [ ] Modificar `NavBar.tsx`:
  - Agregar separador visual
  - Agregar item "Admin Panel" con icono Settings
  - Remover "Cerrar Sesion" del header
- [ ] Ajustar estilos mobile

**Validacion**:
- "Admin Panel" aparece en dropdown Finanzas
- Navega a /admin correctamente
- "Cerrar Sesion" ya no esta en header

### Fase 7: Validacion E2E
**Objetivo**: Testing completo del sistema

- [ ] Validar flujo completo con Playwright
- [ ] Verificar que no hay errores de TypeScript
- [ ] Probar en navegador manualmente
- [ ] Fix de cualquier error detectado
- [ ] Probar auth en modo produccion (npm run build && npm start)

---

## Bucle de Validacion

### Nivel 1: TypeScript & Linting
```bash
# Ejecuta PRIMERO - corrige errores antes de continuar
npx tsc --noEmit
npm run lint

# Esperado: Sin errores
```

### Nivel 2: Build
```bash
npm run build

# Esperado: Build exitoso sin warnings criticos
```

### Nivel 3: Auth Test
```bash
# Iniciar server
npm run dev

# Abrir incognito
# Navegar a localhost:3000
# DEBE redirigir a /login

# Esperado: Auth funciona igual que produccion
```

### Nivel 4: Validacion Visual (Playwright)
```typescript
// 1. Navegar a /admin
// 2. Verificar tabs visibles
// 3. Agregar categoria
// 4. Verificar aparece en /admin
// 5. Ir a agregar transaccion
// 6. Verificar categoria nueva aparece
```

---

## Gotchas Conocidos

```typescript
// CRITICO: Categorias tienen colores asociados
// Cuando el usuario crea una categoria, DEBE elegir un color
// Si no, usar color default (#6B7280)

// CRITICO: System prompt tiene estructura esperada
// El agente REQUIERE formato JSON de respuesta
// Si el usuario rompe el formato, puede causar errores
// Solucion: Validar que el prompt incluya "FORMATO DE RESPUESTA"

// CRITICO: Calculator defaults deben ser numeros validos
// Validar con Zod antes de guardar

// CRITICO: Auth en desarrollo
// next dev usa cookies HTTP-only que pueden no funcionar igual
// Probar siempre con npm run build && npm start para simular prod
```

---

## Anti-Patrones a Evitar

- NO crear endpoints API separados para cada accion - usar un solo endpoint con acciones
- NO duplicar logica de categorias - centralizar en hook useCategories()
- NO hardcodear el DEFAULT_SYSTEM_PROMPT en multiples lugares
- NO ignorar el tema de migracion - usuarios existentes deben seguir funcionando
- NO olvidar RLS - cada usuario solo ve SU configuracion
- NO mezclar estado local con BD - definir fuente unica de verdad

---

## Dependencias a Instalar

```bash
# Color picker para categorias
npm install react-colorful

# (Opcional) Editor de codigo para system prompt
npm install @uiw/react-textarea-code-editor
```

---

## Variables de Entorno (si aplica)

```env
# No se requieren nuevas variables
# Supabase ya esta configurado
```

---

## Flujo de Usuario Final

```
1. Usuario abre dropdown "Finanzas"
2. Ve nuevo item "Admin Panel"
3. Click → navega a /admin
4. Ve 4 tabs: Categorias | CFO Agent | Calculadora | Cuenta
5. En Categorias:
   - Ve sus categorias actuales (default si es nuevo)
   - Puede agregar "Publicidad" con color naranja
   - Puede editar color de "Software"
   - Puede eliminar "Entretenimiento"
6. En CFO Agent:
   - Ve el system prompt actual
   - Puede modificarlo
   - Puede resetear a default
7. En Calculadora:
   - Ve variables del wizard
   - Puede cambiar defaults
8. En Cuenta:
   - Ve su email y nombre
   - Boton "Cerrar Sesion"
```

---

## Migracion para Usuarios Existentes

```sql
-- Los usuarios existentes NO tienen row en user_config
-- Cuando getUserConfig() no encuentra config:
-- 1. Crea una nueva row con defaults vacios
-- 2. expense_categories = [] significa "usar defaults del codigo"
-- 3. income_categories = [] significa "usar defaults del codigo"
-- 4. agent_system_prompt = NULL significa "usar DEFAULT_SYSTEM_PROMPT"

-- Esto permite backwards compatibility perfecta
```

---

## UI/UX Mockup (ASCII)

```
┌─────────────────────────────────────────────────────────────────┐
│  Finanzas OS          CFO   Dashboard   [Finanzas ▼]    @user  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Admin Panel                                                    │
│  ═══════════════════════════════════════════════════════════   │
│                                                                 │
│  [Categorias]  [CFO Agent]  [Calculadora]  [Cuenta]            │
│  ─────────────────────────────────────────────────────────      │
│                                                                 │
│  Categorias de Gastos                        [+ Agregar]       │
│  ┌──────────────────────────────────────────────────────┐      │
│  │  ● Nomina          #6366F1    [Editar] [Eliminar]   │      │
│  │  ● Equipo          #0EA5E9    [Editar] [Eliminar]   │      │
│  │  ● Renta           #EF4444    [Editar] [Eliminar]   │      │
│  │  ● Software        #8B5CF6    [Editar] [Eliminar]   │      │
│  │  ...                                                 │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                 │
│  Categorias de Ingresos                      [+ Agregar]       │
│  ┌──────────────────────────────────────────────────────┐      │
│  │  ● AlquimIA        #F97316    [Editar] [Eliminar]   │      │
│  │  ● SaaS Factory    #8B5CF6    [Editar] [Eliminar]   │      │
│  │  ...                                                 │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Dropdown Finanzas (actualizado):
┌─────────────────────┐
│ Calculadora ROI     │
│ Mensuales           │
│ Anuales             │
│ Reportes            │
├─────────────────────┤
│ ⚙ Admin Panel      │  ← NUEVO
└─────────────────────┘
```

---

## Referencias

- **Proyecto**: `./`
- **Stack**: Next.js 16 + React 19 + TypeScript + Tailwind + Supabase
- **Produccion**: your-app.vercel.app

---

## Estimacion de Complejidad

| Fase | Complejidad | Archivos |
|------|-------------|----------|
| 1. BD + Auth | Baja | 2 |
| 2. Service + Types | Media | 4 |
| 3. UI Admin | Alta | 5 |
| 4. Categorias Dinamicas | Alta | 4 |
| 5. System Prompt | Media | 2 |
| 6. NavBar | Baja | 1 |
| 7. E2E | Media | - |

**Total archivos nuevos/modificados**: ~15-18

---

## Decision Points (Requieren Input del Usuario)

1. **Categorias default**: Cuando usuario no tiene config personalizada, mostrar las actuales hardcodeadas? O empezar vacio?
   - **Recomendacion**: Mostrar defaults, permitir eliminar

2. **System Prompt validation**: Que pasa si usuario rompe el formato JSON?
   - **Recomendacion**: Agregar validacion + preview de respuesta

3. **Cuentas bancarias**: Incluir en Admin Panel?
   - **Recomendacion**: Fase 2, por ahora solo categorias

4. **Multi-usuario**: Cada usuario sus propias categorias, o compartidas?
   - **Recomendacion**: Por usuario (RLS ya lo maneja)

---

*Este PRP es el resultado de investigacion exhaustiva. No se ha modificado codigo todavia.*
