# Contexto del Agente CFO Virtual - Business App

> Documento de contexto denso para continuidad de sesion.

---

## 1. ARQUITECTURA DEL AGENTE (Action Stream Pattern)

### Concepto Core
El agente usa **"Action Stream"** - un patron donde el usuario VE cada paso del razonamiento del agente en tiempo real. No es un chatbot tradicional que responde y ya. Es transparente.

### Flujo Completo
```
Usuario escribe -> POST /api/agent -> OpenRouter (Claude/GPT) ->
streamText() genera JSON -> closeAndParseJson() parsea parcial ->
SSE envia acciones una por una -> Cliente renderiza en tiempo real
```

### Archivos Clave

| Archivo | Proposito |
|---------|-----------|
| `src/app/api/agent/route.ts` | API que hace streaming SSE |
| `src/lib/ai/closeAndParseJson.ts` | Parser de JSON incompleto (NUNCA MODIFICAR) |
| `src/app/(main)/agent/page.tsx` | UI del agente con ActionItem components |
| `src/features/agent/hooks/useAgentHistory.ts` | Persistencia de sesiones en Supabase |
| `src/features/agent/services/historyService.ts` | CRUD de agent_sessions y agent_actions |
| `src/lib/supabase/client.ts` | Cliente Supabase SINGLETON |
| `src/lib/ai/models.ts` | Configuracion de modelos (Claude Haiku, Sonnet, GPT-4o) |

---

## 2. TIPOS DE ACCIONES

El agente responde en JSON con este formato:
```json
{
  "actions": [
    { "_type": "think", "text": "razonamiento" },
    { "_type": "analyze", "metric": "X", "value": 123, "status": "good|warning|critical", "insight": "..." },
    { "_type": "calculate", "label": "X", "formula": "a+b", "result": 123, "unit": "MXN" },
    { "_type": "recommend", "priority": "high|medium|low", "title": "X", "description": "...", "impact": "..." },
    { "_type": "alert", "severity": "info|warning|critical", "message": "..." },
    { "_type": "message", "text": "mensaje final" }
  ]
}
```

Cada accion tiene `complete: boolean` para saber si esta completa durante streaming.

---

## 3. CAMBIOS REALIZADOS EN ESTA SESION

### 3.1 Cliente Supabase Singleton
**Archivo:** `src/lib/supabase/client.ts`
**Problema:** Cada llamada a `createClient()` creaba nueva instancia, perdiendo la sesion.
**Solucion:** Patron singleton - una sola instancia reutilizada.

```typescript
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (!supabaseClient) {
    supabaseClient = createBrowserClient(...)
  }
  return supabaseClient
}
```

### 3.2 Auth Listener en useAgentHistory
**Archivo:** `src/features/agent/hooks/useAgentHistory.ts`
**Problema:** Si expiraba la sesion, el usuario veia error "No autenticado" en lugar de redirigir.
**Solucion:**
- Verificar auth al montar
- Listener `onAuthStateChange` que redirige a `/login` si sesion expira
- Estado `isAuthenticated` expuesto

### 3.3 Validacion Defensiva en ActionItem
**Archivo:** `src/app/(main)/agent/page.tsx`
**Problema:** Si el modelo no enviaba un campo esperado (ej: `action.text`), la UI crasheaba.
**Solucion:** Agregar `?.` y fallbacks a TODOS los campos:
```typescript
{action.text?.trim() || 'Pensando...'}
{action.status || 'good'}
{action.priority || 'medium'}
```

### 3.4 Filtrado de Acciones Vacias
**Archivo:** `src/app/(main)/agent/page.tsx`
**Problema:** Acciones vacias renderizaban espacios en blanco.
**Solucion:** Filtrar antes de map:
```typescript
actions.filter((action) => {
  if (action._type === 'message' && !(action as MessageAction).text?.trim()) return false
  if (action._type === 'think' && !(action as ThinkAction).text?.trim()) return false
  return true
})
```

### 3.5 Think Colapsable
**Archivo:** `src/app/(main)/agent/page.tsx`
**Componente:** `ThinkItem`
**Comportamiento:** Por defecto muestra solo "pensando..." en italicas. Al hacer clic expande el contenido completo.

### 3.6 Suppress Hydration Warning
**Archivo:** `src/app/layout.tsx`
**Problema:** Extensiones del navegador (ColorZilla, etc) modifican el DOM y causan errores de hidratacion.
**Solucion:** `suppressHydrationWarning` en `<html>` y `<body>`.

### 3.7 Fix de Burbujas Fantasma
**Archivo:** `src/app/(main)/agent/page.tsx`
**Problema:** El modelo enviaba acciones con `_type` no reconocido o vacias, que pasaban el filtro y renderizaban burbujas vacias (con Bot icon pero sin contenido).
**Solucion:**
1. Agregado `VALID_ACTION_TYPES` Set para validar tipos reconocidos
2. Filtro mejorado que rechaza `_type` no valido Y acciones vacias de cada tipo
3. Switch case 'message' retorna `null` si el texto esta vacio
4. Switch default retorna `null` y logea warning para tipos desconocidos

```typescript
const VALID_ACTION_TYPES = new Set(['think', 'analyze', 'calculate', 'recommend', 'alert', 'message'])

actions.filter((action) => {
  if (!VALID_ACTION_TYPES.has(action._type)) return false
  if (action._type === 'message' && !(action as MessageAction).text?.trim()) return false
  // ... validaciones adicionales
  return true
})
```

### 3.8 Toggle de Modo Compacto
**Archivo:** `src/app/(main)/agent/page.tsx`
**Feature:** Toggle para mostrar/ocultar pasos intermedios del agente (think, analyze, calculate).
**Implementacion:**
1. Nuevo estado `showDetails` (default: true)
2. Filtro extendido que oculta think/analyze/calculate cuando `showDetails` es false
3. Boton Eye/EyeOff en el area de input (junto a Globe e ImagePlus)
4. Color purpura cuando esta activo

**UX:**
- Eye (purpura): Modo detallado - ve todo el razonamiento
- EyeOff (gris): Modo compacto - solo message, recommend, alert

---

## 4. PLANTILLA BASE

The original template contains the base action stream pattern.

Contiene:
- `closeAndParseJson.ts` - NUNCA MODIFICAR
- `actionSchemas.ts` - Schemas Zod de acciones
- `useActionStream.ts` - Hook cliente para streaming
- `ActionFeed.tsx` - Componente de renderizado
- API route ejemplo

---

## 5. COMPARACION: Business vs Miniaturas

| Aspecto | Business (CFO) | Miniaturas |
|---------|---------------|------------|
| Acciones | think, analyze, calculate, recommend, alert, message | think, message, tool_call, tool_result, progress |
| Tools reales | NO (todo es "narrado" por el modelo) | SI (Replicate para avatares, Gemini para imagenes) |
| Persistencia | Supabase (agent_sessions, agent_actions) | Zustand localStorage |
| Contexto | Datos financieros (Calculator + Finances stores) | Imagenes seleccionadas |

**Punto importante:** El CFO no tiene "tools" reales. Los "calculos" son inventados por el modelo basandose en el contexto. Para calculos reales necesitaria tools que ejecuten logica de verdad.

---

## 6. PROBLEMAS CONOCIDOS / FRAGILIDADES

1. **JSON dependiente del modelo**: Si el modelo no responde en JSON valido, todo falla
2. **Sin validacion de schema**: Se asume que el JSON tiene la estructura correcta
3. **Calculos "de mentira"**: El modelo inventa numeros, no hay tools que calculen realmente
4. **Buffer en memoria**: Si la respuesta es muy larga, el buffer crece indefinidamente

---

## 7. TABLAS SUPABASE

```sql
-- Sesiones del agente
agent_sessions (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  title text,
  model text,
  created_at timestamptz,
  updated_at timestamptz
)

-- Acciones de cada sesion
agent_actions (
  id uuid PRIMARY KEY,
  session_id uuid REFERENCES agent_sessions ON DELETE CASCADE,
  action_type text,
  content jsonb,
  created_at timestamptz
)
```

RLS automatico filtra por `user_id`.

---

## 8. VARIABLES DE ENTORNO REQUERIDAS

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENROUTER_API_KEY=  # <-- Debe ser valida, si no da error "User not found"
```

---

## 9. PROXIMOS PASOS SUGERIDOS

1. **Tools reales para el CFO**: Implementar herramientas que calculen metricas con datos de Supabase en lugar de que el modelo invente
2. **Validacion con Zod**: Validar respuestas del modelo antes de renderizar
3. **Retry/fallback**: Si el modelo falla, reintentar o mostrar mensaje amigable
4. **Mejorar UX del streaming**: Mostrar progreso mas granular durante generacion

---

## 10. RELATED PATTERNS

The same action stream pattern can be extended with real tools (e.g., Replicate for image generation, external APIs for data processing) instead of model-narrated actions.
