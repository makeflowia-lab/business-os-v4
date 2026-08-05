# Blueprint: Agent Page Header Optimization

## Objetivo
Reemplazar el logo "Finanzas OS" por el menu hamburger icon SOLO en la page del agente.

## Estado: COMPLETADO

## Implementacion Final

### 1. Context para Sidebar State
**Archivo**: `src/shared/context/AgentSidebarContext.tsx`

```typescript
// Provee estado del sidebar compartido entre NavBar y Agent Page
export function AgentSidebarProvider({ children })
export function useAgentSidebar() // Hook para acceder al estado
```

### 2. NavBar Component
**Archivo**: `src/shared/components/ui/NavBar.tsx`

- Detecta automaticamente cuando esta en `/agent` via `usePathname()`
- Si `isCFOActive`: muestra boton hamburger con "Historial"
- Si no: muestra logo normal "Finanzas OS"
- Usa `useAgentSidebar()` para abrir el sidebar

### 3. AgentSidebar - Logo en Header
**Archivo**: `src/features/agent/components/AgentSidebar.tsx`

- Header incluye logo "Finanzas OS" + titulo "Historial" + boton X
- Sidebar es drawer-only (no sticky en desktop)

### 4. Main Layout
**Archivo**: `src/app/(main)/layout.tsx`

- Wrappea todo en `AgentSidebarProvider`
- Layout usa `h-screen flex flex-col` para altura completa
- `<main>` tiene `flex-1 min-h-0` para contenido con scroll

### 5. Agent Page
**Archivo**: `src/app/(main)/agent/page.tsx`

- Usa `useAgentSidebar()` para controlar sidebar
- Sin header interno (NavBar lo maneja)
- Container usa `h-full` para llenar el espacio

## Layout Structure

**Otras paginas (Dashboard, Finanzas)**:
```
[Logo: Finanzas OS] [CFO] [Dashboard] [Finanzas] [User menu]
```

**Agent page**:
```
[Hamburger: Historial] [CFO] [Dashboard] [Finanzas] [User menu]
         |
         v
    [Sidebar Drawer]
    ├── [Logo: Finanzas OS] [X]
    ├── [+ Nueva conversacion]
    └── [Lista de sesiones]
```

## Archivos Modificados

1. `src/shared/context/AgentSidebarContext.tsx` - NUEVO: Context compartido
2. `src/shared/components/ui/NavBar.tsx` - Usa context, muestra hamburger en agent
3. `src/app/(main)/layout.tsx` - Provider + layout flex
4. `src/app/(main)/agent/page.tsx` - Usa context, sin header interno
5. `src/features/agent/components/AgentSidebar.tsx` - Logo en header, drawer-only

## Resultado

- Agent page: Hamburger "Historial" en lugar de logo
- Otras paginas: Logo normal, sin cambios
- Toggle funciona en movil Y escritorio
- Sidebar es drawer que se abre/cierra
- Logo visible en sidebar header cuando se abre
