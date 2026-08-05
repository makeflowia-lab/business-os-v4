# 🛡️ Registro de Auto-Blindaje — Business OS

Este archivo es el "Escudo" del sistema. Cada error técnico, de lógica o de comunicación detectado por el agente o el usuario debe ser registrado aquí con su solución para que el sistema sea inmune a ese error en el futuro.

## 📋 Registro de Impactos y Refuerzos

| Fecha | Error Detectado | Solución Implementada | Estado |
|-------|-----------------|-----------------------|--------|
| 2026-05-04 | Fragmentación de Business OS en subcarpetas | Creación de infraestructura centralizada en `.claude/` | ✅ Blindado |
| 2026-05-04 | Falta de visión diaria de KPIs | Implementación de `Morning Briefing` skill | ✅ Blindado |
| 2026-05-04 | Dependencia de dashboards externos | Implementación de `Neon Mission Control` skill | ✅ Blindado |
| 2026-05-04 | **Raziel no responde — modelo IA inexistente + provider incorrecto** | Migración completa a OpenRouter + documentación de modelo válido | ✅ Blindado |

---

## 🔴 Incidente Crítico: Raziel No Responde (2026-05-04)

### Síntomas
- El chat de Raziel no devolvía ninguna respuesta
- La API retornaba HTTP 200 pero el stream estaba vacío (error silencioso)
- Sin mensajes de error visibles para el usuario

### Causa Raíz (Triple fallo)

1. **Modelo inexistente:** El código usaba `claude-sonnet-4-5`, que no existe en ninguna API
2. **API key inválida:** La `ANTHROPIC_API_KEY` configurada devolvía 404 para TODOS los modelos (cuenta expirada o sin acceso)
3. **Provider incorrecto:** El sistema fue diseñado para OpenRouter (ver `RAZIEL_MASTER.md` línea 92), pero se había hardcodeado Anthropic directo sin `OPENROUTER_API_KEY`

### Diagnóstico (logs del servidor)
```
[Raziel] Stream Error: {
  statusCode: 404,
  responseBody: '{"type":"error","error":{"type":"not_found_error","message":"model: claude-3-5-sonnet-20241022"}}'
}
```
El error era **silencioso** porque el stream se creaba exitosamente (HTTP 200) pero fallaba internamente sin propagar el error al frontend.

### Solución Aplicada

1. **Reescritura de `src/app/api/chat/route.ts`:**
   - Provider principal: **OpenRouter** (`OPENROUTER_API_KEY`) → `google/gemini-2.5-flash`
   - Fallback: Anthropic (`ANTHROPIC_API_KEY`) → `claude-sonnet-4-20250514`
   - Error explícito si no hay ninguna key configurada
   - Logging detallado: keys detectadas, provider seleccionado, tokens consumidos, errores de stream

2. **Variables de entorno actualizadas:**
   - `.env.local`: Agregada `OPENROUTER_API_KEY` como primera línea
   - Vercel: Agregada `OPENROUTER_API_KEY` en producción via `vercel env add`

3. **Deploy a producción:** `npx vercel --prod` exitoso

### Reglas de Blindaje (NUNCA violar)

> ⚠️ **REGLA 1:** NUNCA hardcodear un model ID sin verificar que existe en la API del provider actual.
>
> ⚠️ **REGLA 2:** `OPENROUTER_API_KEY` es el provider PRINCIPAL de Raziel. Anthropic es solo fallback.
>
> ⚠️ **REGLA 3:** Siempre implementar `onError` en `streamText()` para capturar errores de stream.
>
> ⚠️ **REGLA 4:** Al cambiar de modelo, probar localmente Y verificar logs antes de deployar.

### Provider y Modelos Válidos (Mayo 2026)

| Provider | Variable de Entorno | Modelo | Uso |
|----------|-------------------|--------|-----|
| **OpenRouter** (principal) | `OPENROUTER_API_KEY` | `google/gemini-2.5-flash` | Chat principal |
| Anthropic (fallback) | `ANTHROPIC_API_KEY` | `claude-sonnet-4-20250514` | Solo si no hay OR key |

### Flujo de Selección de Provider
```
¿Existe OPENROUTER_API_KEY?
  ├── SÍ → OpenRouter → google/gemini-2.5-flash
  └── NO → ¿Existe ANTHROPIC_API_KEY?
              ├── SÍ → Anthropic → claude-sonnet-4-20250514
              └── NO → Error 500: "No hay proveedor de IA configurado"
```

---

## 🛠️ Instrucciones para el Agente
1.  **Analizar:** Cuando ocurra un error, busca la causa raíz.
2.  **Arreglar:** Aplica el fix en el código o en los prompts.
3.  **Documentar:** Añade una entrada en este archivo.
4.  **Reforzar:** Actualiza `CLAUDE.md` o `GEMINI.md` si el error es crítico para la operativa global.
