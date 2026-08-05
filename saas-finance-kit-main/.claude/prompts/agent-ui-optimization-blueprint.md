# Blueprint: Agent UI Optimization - Layout Estatico Mobile-First

> Optimizacion de la UI del CFO Virtual para layout estatico, input fijo, y UX mobile mejorada.

**Contexto**: La pagina del agente tiene scroll general y elementos que saturan la vista en mobile.

---

## Estado Actual

- [x] Pagina del agente funcional (`src/app/(main)/agent/page.tsx`)
- [x] Model selector en el header (lineas 325-364)
- [x] Quick suggestions visibles siempre (lineas 385-402)
- [x] Input bar con "X transacciones en contexto" (lineas 404-447)
- [ ] Layout permite scroll general (problema)
- [ ] Input bar no esta fijo al fondo (problema)
- [ ] Quick suggestions saturan mobile (problema)

---

## Objetivo

1. **Layout estatico**: Sin scroll general, solo scroll en chat messages
2. **Input bar fijo**: Siempre visible en la parte inferior con margen
3. **Mobile optimizado**: Ocultar quick suggestions en mobile
4. **Model selector reubicado**: Dentro del input bar, izquierda del boton enviar
5. **Eliminar clutter**: Quitar "X transacciones en contexto"

---

## Fase 1: Layout Estatico (Contenedor Principal)

### 1.1 Modificar Contenedor Principal

```typescript
// src/app/(main)/agent/page.tsx
// ANTES (linea ~296):
<div className="min-h-screen bg-neu-bg flex">

// DESPUES:
<div className="h-screen bg-neu-bg flex overflow-hidden">
```

### 1.2 Modificar Contenedor del Chat

```typescript
// ANTES (linea ~306):
<div className="flex-1 p-4 md:p-6">

// DESPUES:
<div className="flex-1 flex flex-col h-full overflow-hidden p-4 md:p-6">
```

### 1.3 Modificar NeuCard Container

```typescript
// ANTES (linea ~368):
<NeuCard className="...">

// DESPUES:
<NeuCard className="flex-1 flex flex-col overflow-hidden ...">
```

### Checklist Fase 1
- [ ] Contenedor principal: `h-screen overflow-hidden`
- [ ] Contenedor del chat: `flex flex-col h-full overflow-hidden`
- [ ] NeuCard: `flex-1 flex flex-col overflow-hidden`
- [ ] Solo el area de mensajes tiene scroll

---

## Fase 2: Input Bar Fijo con Model Selector

### 2.1 Mover Model Selector al Input Bar

```typescript
// src/app/(main)/agent/page.tsx
// ELIMINAR del header (lineas 325-364): El dropdown completo del model selector

// AGREGAR en el input bar footer (linea ~430):
<div className="flex items-center justify-between px-2">

  {/* MODEL SELECTOR - Nuevo */}
  <div className="relative">
    <button
      onClick={() => setModelMenuOpen(!modelMenuOpen)}
      className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 transition-colors"
    >
      <Zap className="w-3 h-3" />
      <span className="hidden sm:inline">{AGENT_MODELS[selectedModel].name}</span>
      <ChevronDown className={`w-3 h-3 transition-transform ${modelMenuOpen ? 'rotate-180' : ''}`} />
    </button>

    {modelMenuOpen && (
      <div className="absolute bottom-full left-0 mb-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
        {Object.entries(AGENT_MODELS).map(([key, model]) => (
          <button
            key={key}
            onClick={() => {
              setSelectedModel(key as AgentModelKey)
              setModelMenuOpen(false)
            }}
            className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-50 flex items-center gap-2 ${
              selectedModel === key ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
            }`}
          >
            <Zap className="w-3 h-3" />
            <div>
              <div className="font-medium">{model.name}</div>
              <div className="text-gray-400 text-[10px]">{model.provider}</div>
            </div>
          </button>
        ))}
      </div>
    )}
  </div>

  {/* BOTON ENVIAR */}
  <button type="submit" ...>
    ...
  </button>
</div>
```

### 2.2 Eliminar Texto de Transacciones

```typescript
// ELIMINAR (lineas ~433-436):
<div className="flex items-center gap-2 text-xs text-gray-400">
  <Activity className="w-3 h-3" />
  <span>{transactions.length} transacciones en contexto</span>
</div>
```

### 2.3 Input Bar Sticky con Margen Inferior

```typescript
// ANTES (linea ~404):
<div className="border-t border-gray-200/50 pt-4 px-2">

// DESPUES:
<div className="sticky bottom-0 border-t border-gray-200/50 pt-3 pb-4 px-2 bg-white/80 backdrop-blur-sm">
```

### Checklist Fase 2
- [ ] Model selector movido al input bar (izquierda)
- [ ] Eliminado "X transacciones en contexto"
- [ ] Input bar sticky con padding inferior
- [ ] Dropdown del model abre hacia arriba (`bottom-full`)

---

## Fase 3: Quick Suggestions Mobile-Hidden

### 3.1 Ocultar en Mobile

```typescript
// ANTES (linea ~385):
{actions.length <= 2 && (
  <div className="px-2 pb-4">

// DESPUES:
{actions.length <= 2 && (
  <div className="hidden md:block px-2 pb-4">
```

### Checklist Fase 3
- [ ] Quick suggestions ocultas en mobile (`hidden md:block`)
- [ ] Visibles en tablet/desktop

---

## Fase 4: Header Simplificado

### 4.1 Limpiar Header

```typescript
// ANTES: Header con titulo + model selector
// DESPUES: Solo titulo y subtitulo

<div className="flex items-center justify-between mb-4 px-2">
  <div>
    <h1 className="text-xl font-semibold text-gray-800">CFO Virtual</h1>
    <p className="text-xs text-gray-400">
      {currentSession?.title || 'Nueva conversacion'}
    </p>
  </div>

  {/* Model selector ELIMINADO de aqui */}
</div>
```

### Checklist Fase 4
- [ ] Header simplificado (solo titulo)
- [ ] Model selector removido del header

---

## Resumen de Cambios por Archivo

### `src/app/(main)/agent/page.tsx`

| Linea Aprox | Cambio | Descripcion |
|-------------|--------|-------------|
| ~296 | Edit | `min-h-screen` → `h-screen overflow-hidden` |
| ~306 | Edit | Agregar `flex flex-col h-full overflow-hidden` |
| ~325-364 | Delete | Remover model selector del header |
| ~368 | Edit | NeuCard con `flex-1 flex flex-col overflow-hidden` |
| ~385 | Edit | Agregar `hidden md:block` a quick suggestions |
| ~404 | Edit | Input bar `sticky bottom-0` con padding |
| ~430 | Add | Model selector compacto (dropdown hacia arriba) |
| ~433-436 | Delete | Eliminar "X transacciones en contexto" |

---

## Resultado Esperado

### Mobile
```
+---------------------------+
| [=] CFO Virtual           |
|     Nueva conversacion    |
+---------------------------+
|                           |
|   [Chat Messages]         |
|   (scrollable)            |
|                           |
+---------------------------+
| [Textarea input...]       |
| [Model v]      [Enviar >] |
+---------------------------+
```

### Desktop
```
+-------+----------------------------------+
|       | CFO Virtual                      |
| Side  | Nueva conversacion               |
| bar   +----------------------------------+
|       |                                  |
|       |   [Chat Messages]                |
|       |   (scrollable)                   |
|       |                                  |
|       +----------------------------------+
|       |   Consultas frecuentes           |
|       |   [btn] [btn] [btn]              |
|       +----------------------------------+
|       | [Textarea input...]              |
|       | [Haiku 4.5 v]        [Enviar >]  |
+-------+----------------------------------+
```

---

## Metricas de Exito

- [ ] No hay scroll general en la pagina
- [ ] Chat messages es la unica area scrollable
- [ ] Input bar siempre visible en el fondo
- [ ] Model selector funcional en el input bar
- [ ] Quick suggestions ocultas en mobile
- [ ] Layout responsive sin saturar la vista

---

## Notas de Implementacion

1. **Click outside**: El model selector necesita cerrar al hacer click fuera
2. **Keyboard**: Enter sigue enviando, el dropdown no interfiere
3. **Z-index**: El dropdown del model debe estar sobre el input
4. **Backdrop blur**: Input bar con blur para que se vea el scroll detras

---

## Archivos a Modificar

```
src/app/(main)/agent/page.tsx  # Unico archivo a modificar
```

No se requieren nuevos componentes ni hooks.
