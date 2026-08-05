---
name: guardian
description: |
  Agentes guardianes: operacion AUTONOMA de las apps en produccion. Monitorea deploys, errores
  y dependencias; auto-arregla builds rotos; convierte errores de produccion en PRs de fix;
  corre QA periodico. La fabrica deja de ser reactiva ("construye X") y empieza a operar sola.
  Construye sobre el patron autonomo de autoresearch. Usar para vigilar apps live y reaccionar
  sin intervencion manual.
  Triggers: guardian, monitorea, vigila mis apps, auto-fix, arregla solo, errores en produccion,
  sentry, build roto, dependencias, mantenimiento automatico, QA nocturno, operacion autonoma,
  alertas, salud de produccion, autoheal.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Guardian — Operacion Autonoma de Produccion

> autoresearch mejora SKILLS solo. Guardian opera APPS solo.
> La fabrica trabaja mientras duermes: detecta, diagnostica, arregla, reporta.

---

## Que vigila guardian

| Señal | Fuente | Accion autonoma |
|-------|--------|-----------------|
| Build roto | Vercel / `npm run build` | Diagnosticar → fix → re-deploy |
| Error de runtime | Sentry / Vercel logs | Reproducir → PR de fix |
| Dependencia vulnerable/vieja | `npm audit` / dependabot | Actualizar → correr gates → PR |
| Regresion de performance | Vercel Analytics (CWV) | Alertar + sugerir fix |
| Caida del dominio | ping/healthcheck | Alertar inmediato |

---

## El loop del guardian (patron autonomo)

```
1. DETECTAR   → leer señales (logs, build status, audit, vitals)
2. TRIAR      → es real? severidad? que app?
3. DIAGNOSTICAR → reproducir el problema, encontrar causa raiz
4. ARREGLAR   → fix en una rama, NUNCA en main directo
5. VERIFICAR  → quality-gates (typecheck + build + tests) sobre el fix
6. PROPONER   → PR + reporte. El humano aprueba el merge.
7. APRENDER   → si el error se repite, documentarlo (auto-blindaje + factory-brain)
```

### Linea roja: autonomia con freno
- Guardian ARREGLA en ramas y PROPONE PRs. **No mergea a produccion sin aprobacion humana**
  por default (cambios outward-facing necesitan confirmacion).
- Excepcion opt-in: el usuario puede autorizar auto-merge para clases de fix triviales
  (ej: bump de patch de dependencia que pasa todos los gates).

---

## Modos de operacion

### Modo bajo demanda (default)
El usuario pide "revisa la salud de mis apps" → guardian corre el loop una vez y reporta.

### Modo programado (opt-in)
Para vigilancia continua, el usuario puede agendar el guardian (cron/scheduled agent):
- QA nocturno + audit de dependencias.
- Cada firing: detectar → triar → si hay algo, diagnosticar/arreglar/proponer.
- Requiere autorizacion explicita (corre solo, consume recursos).

---

## Como se implementa por app

### Paso 1 — Asegurar observabilidad
Si la app no tiene error tracking, instalarlo (Sentry o equivalente liviano) + healthcheck.
Sin señales, guardian esta ciego.

### Paso 2 — Definir el runbook
Por app, que se puede auto-arreglar vs que solo se alerta:
- Auto-fix: build por typo, import roto, env faltante conocida, bump de patch.
- Solo alerta: caida de infra, fuga de datos, cambio de pricing, nada destructivo.

### Paso 3 — Conectar a mission-control
Guardian alimenta el estado de errores que mission-control muestra en el tablero.

### Paso 4 — Cerrar con aprendizaje
Cada fix que aplica → si es patron, sube a factory-brain (pitfalls) para prevenirlo en
proyectos futuros.

---

## Lo que guardian NUNCA hace solo

- Mergear a main/produccion sin aprobacion (salvo clases auto-merge autorizadas).
- Tocar datos de usuarios (borrar, migrar) sin confirmacion.
- Cambiar pricing, secrets, o config de infra critica.
- Operaciones destructivas o irreversibles.

---

## Reglas de Oro

1. **Arregla en ramas, propone PRs.** Produccion necesita aprobacion humana.
2. **Sin observabilidad no hay guardian.** Primero las señales.
3. **Verifica antes de proponer.** Todo fix pasa quality-gates.
4. **Runbook explicito.** Que se auto-arregla vs que solo se alerta, definido por app.
5. **Aprende del error.** Patron recurrente → factory-brain, para que no se repita.
