# Mejora: Onboarding de Contexto del Negocio

> **Fecha:** 2026-03-24
> **Archivo modificado:** `src/features/raziel/lib/system-prompt.ts`
> **Respaldo:** `src/features/raziel/lib/system-prompt_opinión_de_Raziel.ts`

---

## Contexto

Se analizó un prompt externo de "Agente de Estrategia de Negocios" (estilo Hormozi) para evaluar si Raziel podía mejorarse con algo de lo propuesto.

---

## Análisis Comparativo

### Lo que Raziel ya tenía bien cubierto

**Filosofía Hormozi** — Ya integrada en los PRINCIPIOS DE RAZIEL (enfoque, apalancamiento, interés compuesto, velocidad de ejecución) y la Ecuación de Valor explícita en el módulo de Marketing.

**Comportamiento desafiante** — Ya presente como "CLARIDAD IMPLACABLE: Di la verdad aunque duela."

**7 módulos operativos** — Raziel supera al prompt genérico en profundidad técnica (CFO, Legal, Seguridad, Propuesta Tecnológica — cosas que el prompt externo ni menciona).

### La brecha real identificada: Personalización del negocio

El prompt externo tenía algo que Raziel **no tenía**: un mecanismo para capturar el contexto específico del negocio del usuario.

Raziel era un excelente asesor genérico. Pero no sabía:
- El nombre del usuario ni su empresa
- Cuál es su oferta actual y su modelo de negocio
- Cuáles son sus metas a 12 meses
- Su historia de origen
- Sus restricciones actuales (equipo, presupuesto, canal)

Sin eso, los consejos son buenos pero no son **tuyos**. La diferencia entre:

❌ "Haz contenido de valor"
✅ "Con tu audiencia de desarrolladores indie en Twitter, publica los jueves a las 9am sobre el error que casi te quiebra el mes pasado."

### Lo secundario (decisión de diseño, no brecha)

El prompt externo propone el estilo energético/casual de Hormozi ("bro", ritmo rápido, digresiones). Raziel tiene el opuesto: tono grave, sentencioso, Soul Reaver. Eso es una **decisión intencional de diseño**, no un problema.

---

## Decisión Tomada

Agregar un **flujo de onboarding** donde Raziel, en la primera sesión estratégica, captura el contexto del negocio del usuario y lo usa como base para personalizar todos los consejos posteriores.

---

## Cambio Aplicado

Se insertó la siguiente sección en `system-prompt.ts`, antes de `=== PRINCIPIOS DE RAZIEL ===`:

```
=== CONTEXTO DEL NEGOCIO (ONBOARDING) ===

Si el usuario NUNCA ha compartido información sobre su negocio en esta conversación,
y la consulta es de asesoría estratégica (no una tarea técnica específica),
activa el protocolo de onboarding:

Haz UNA sola pregunta a la vez. No lances un formulario completo. El orden es:

1. "¿Cómo te llamas y qué hace tu negocio en una línea?"
2. "¿Cuál es tu oferta principal y cómo generas ingresos?"
3. "¿Cuál es tu mayor obstáculo ahora mismo?"
4. "¿Qué quieres construir en los próximos 12 meses?"

Una vez que tengas estas 4 respuestas, úsalas como contexto en TODOS los consejos
posteriores. No vuelvas a preguntar lo que ya sabes.

Si el usuario ya compartió su contexto, NO repitas el onboarding.
Úsalo directamente para personalizar tus respuestas.

Ejemplo de respuesta personalizada con contexto:
❌ "Necesitas definir tu avatar ideal."
✅ "Con tu agencia de software para PYMEs en CDMX, tu avatar no es el dueño —
   es el gerente de operaciones que está harto de los Excel.
   Habla con él, no con el que firma."
```

---

## Razonamiento del Diseño

- **Una pregunta a la vez** — evita el efecto formulario que rompe la conversación natural
- **4 preguntas mínimas** — suficiente para personalizar sin abrumar al usuario
- **No repetir onboarding** — Raziel recuerda dentro de la sesión, no interroga de nuevo
- **El ejemplo concreto** en el prompt enseña al modelo la diferencia entre genérico vs personalizado mediante few-shot
- **Condicional estratégico** — solo se activa en consultas de asesoría, no interrumpe tareas técnicas

---

## Archivos

| Archivo | Estado |
|---------|--------|
| `src/features/raziel/lib/system-prompt.ts` | Modificado — versión activa con onboarding |
| `src/features/raziel/lib/system-prompt_opinión_de_Raziel.ts` | Respaldo — estado anterior sin onboarding |
