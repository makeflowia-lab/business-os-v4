# Business OS — Avatar hiperrealista / LiveAvatar (v4)

> **Basado en el Business OS, creado por Makeflowia Lab.**
> Licencia BO-AT 1.0 — uso libre y comercial **con atribución obligatoria**. Ver [`LICENCIA.md`](LICENCIA.md) y [`ORIGEN.md`](ORIGEN.md).

Esta versión añade un **avatar hiperrealista en tiempo real** (HeyGen LiveAvatar,
por WebRTC) a la interfaz del asesor de negocio: video del avatar al centro,
transcripción en vivo y voz en español. La guía técnica completa está en
[`docs/AVATAR-LIVEAVATAR.md`](docs/AVATAR-LIVEAVATAR.md).

---

## Qué recibes

Este paquete es una **copia de marca blanca**: el sistema completo y funcional,
**sin credenciales, sin bases de datos y sin los datos de ningún negocio**. Está
pensado para que lo hagas tuyo.

| Incluye | No incluye (a propósito) |
|---|---|
| Todo el código fuente, listo para instalar | Claves, tokens ni archivos de entorno reales |
| Plantillas de configuración (`.env*.example`) | Bases de datos ni memoria acumulada |
| La capa de contexto en blanco | Datos, clientes ni cifras de ninguna empresa |
| La integración de avatar en tiempo real (LiveAvatar) | Créditos ni cuenta de LiveAvatar/HeyGen |

## Cómo lo enciendes

```bash
# 1 · dependencias
npm install

# 2 · configuración: copia la plantilla y rellénala con TUS claves
cp .env.local.example .env.local

# 3 · arranca
npm run dev
```

Para el avatar en tiempo real necesitas además una cuenta propia en
`https://app.liveavatar.com` y completar las variables `LIVEAVATAR_API_KEY`,
`NEXT_PUBLIC_LIVEAVATAR_AVATAR_ID`, `LIVEAVATAR_MAX_SESSION_DURATION` y
`LIVEAVATAR_VOICE_ID` — el detalle paso a paso está en
[`docs/AVATAR-LIVEAVATAR.md`](docs/AVATAR-LIVEAVATAR.md).

## Ponerle tu marca

Está permitido y es lo esperado: cambia el nombre, el logo, los colores y los
textos. La licencia te lo permite expresamente, incluso para vender el resultado.

Lo único que debe permanecer es **de dónde viene**. La fórmula es aditiva:

> «Mi Producto, de Mi Empresa — basado en el Business OS de Makeflowia Lab.»

Para comprobar en cualquier momento que tu copia sigue cumpliendo:

```bash
node verificar-origen.mjs
```

Te dice en qué puntos está la atribución y en cuáles falta. Sale con código `0`
si cumple y `1` si no.

## Si lo personalizas con un asistente de IA

El paquete incluye `CLAUDE.md` y `AGENTS.md` con una regla de verificación que el
asistente debe atender **antes** de empezar cualquier trabajo de personalización o
rebranding: comprobar que la declaración de origen sigue en pie y, si falta,
restituirla antes de continuar. No es un obstáculo para tu trabajo — puedes pedirle
que cambie lo que quieras — solo evita que la atribución se pierda por descuido.

## Licencia en una frase

**Haz casi todo: úsalo, cámbialo, ponle tu marca y cóbralo. Solo di de dónde viene.**

---

*Business OS — Avatar hiperrealista / LiveAvatar (v4) · creado por Makeflowia Lab · 2026*
