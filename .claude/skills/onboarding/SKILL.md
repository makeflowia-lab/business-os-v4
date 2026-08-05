---
name: onboarding
description: |
  Construye el first-run experience que decide la retencion: empty states, tour de bienvenida,
  tooltips, checklist de activacion y funnel al primer-valor. La fabrica construia features pero
  dejaba al usuario nuevo frente a una pantalla vacia. La retencion se gana o pierde en los
  primeros 60 segundos. Usar despues de tener features + auth, antes de buscar usuarios.
  Triggers: onboarding, primer uso, first run, bienvenida, empty state, estado vacio, tour,
  tooltips, activacion, checklist de inicio, guia inicial, retencion, primeros pasos,
  experiencia de nuevo usuario, time to value.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Onboarding — Activacion y Primer Valor

> Construir la feature no basta. Si el usuario nuevo llega a una pantalla vacia, se va.
> El onboarding lleva al usuario del registro al PRIMER VALOR lo mas rapido posible.
> La retencion se decide en los primeros 60 segundos.

---

## El principio: Time-To-Value (TTV)

El onboarding existe para minimizar el tiempo entre "me registre" y "ya vi el valor".
Todo lo que construyas aqui sirve a esa metrica.

```
Signup → [ONBOARDING] → Primer valor visible → Activado
```

`outcomes` mide el evento `activated`. El onboarding es lo que mueve ese numero.

---

## Los 5 componentes del onboarding

### 1. Empty states con accion (no pantallas vacias)
Cada lista/dashboard vacio debe:
- Explicar que va aqui.
- Tener UN call-to-action claro para crear el primer item.
- Idealmente, ofrecer datos de ejemplo o un "crear demo".

Mal: tabla vacia. Bien: "Aun no tienes X. [Crear tu primer X] — toma 30 segundos."

### 2. Checklist de activacion
Lista de 3-5 pasos hacia el primer valor, con progreso visible:
```
[✓] Crea tu cuenta
[✓] Completa tu perfil
[ ] Crea tu primer <item>   ← siguiente
[ ] Invita a alguien
```
Persistir el progreso (tabla `onboarding_progress` o flag en profile).

### 3. Tour de bienvenida (breve)
Modal o spotlight de 3-4 pasos en el primer login. Corto. Saltable. Nunca repetir.
Marca `has_seen_tour` en profile para no mostrarlo de nuevo.

### 4. Tooltips contextuales
Pistas en features no obvias, la primera vez que el usuario las encuentra. Dismissable.

### 5. Primer valor "sembrado"
Cuando se pueda, pre-cargar algo para que la app no se sienta vacia:
- Datos demo, una plantilla, un ejemplo pre-hecho.
- El usuario edita algo existente en vez de crear de cero (mucho mas facil).

---

## Como se implementa

### Paso 1 — Definir el "momento aha"
Cual es el primer valor real de ESTA app? (el primer chat respondido, el primer video
generado, el primer miembro identificado). Todo apunta ahi.

### Paso 2 — Instrumentar el evento `activated`
Disparar `track('activated')` (skill outcomes) cuando el usuario alcanza el momento aha.
Sin esto, no sabes si el onboarding funciona.

### Paso 3 — Construir los componentes
```
features/onboarding/
├── components/
│   ├── OnboardingChecklist.tsx
│   ├── WelcomeTour.tsx
│   └── EmptyState.tsx          (reusable, parametrizado)
├── hooks/useOnboarding.ts
└── store/onboarding.ts
```

### Paso 4 — Persistir estado
Tabla `onboarding_progress` (Supabase, RLS) o columnas en profile:
`has_seen_tour`, `completed_steps jsonb`, `activated_at`.

### Paso 5 — Medir y ajustar
Con `outcomes`: tasa de activacion = activated / signups. Si es baja, acortar el TTV.

---

## Reglas de Oro

1. **Cero pantallas vacias.** Todo empty state tiene explicacion + accion.
2. **Apunta al momento aha.** El onboarding minimiza el tiempo al primer valor.
3. **Corto y saltable.** Nadie quiere un tour de 10 pasos. 3-4 maximo.
4. **No repetir.** Persiste que ya lo vio; nunca lo muestres dos veces.
5. **Mide la activacion.** Sin el evento `activated`, vuelas a ciegas.
