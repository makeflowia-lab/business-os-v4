---
name: acquisition
description: |
  Motor de adquisicion: la fabrica deja de parar en "deployado" y llega a "primeros usuarios".
  SEO programatico (miles de paginas indexables), motor de contenido SEO, auto-post a redes,
  y generacion de ads. Resuelve el problema #1 del SaaS: conseguir usuarios. Usar despues de
  tener producto + onboarding listos, cuando el objetivo es trafico y registros.
  Triggers: como consigo usuarios, trafico, SEO, posicionamiento, contenido, blog,
  programmatic SEO, auto-post, redes sociales, marketing, adquisicion, acquisition,
  conseguir clientes, ads, anuncios, distribucion, growth, primeros usuarios, launch.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Acquisition — De "Deployado" a "Primeros Usuarios"

> El producto perfecto sin usuarios no es un negocio. La parte mas dificil del SaaS es la
> distribucion, y la fabrica la ignoraba. Esta skill lleva la app de "live" a "con trafico".

---

## Los 4 motores de adquisicion

```
1. SEO PROGRAMATICO   → miles de paginas indexables (escala)
2. MOTOR DE CONTENIDO → blog/recursos que rankean (autoridad)
3. AUTO-POST REDES    → presencia social constante (alcance)
4. ADS                → trafico pagado medible (velocidad)
```

Empieza por lo mas barato y compuesto (SEO + contenido) antes de gastar en ads.

---

## Motor 1 — SEO Programatico

Generar muchas paginas a partir de datos + una plantilla. El patron que hace rankear a los
directorios y marketplaces.

Ejemplos por proyecto:
- **bizfinder:** una pagina por ciudad/categoria ("dentistas en Guadalajara").
- **apoyo-legal:** una pagina por tipo de tramite/duda legal frecuente.
- **funeralis:** una pagina por servicio/ubicacion.

Implementacion:
- Ruta dinamica `app/[segmento]/page.tsx` con `generateStaticParams`.
- Datos desde Supabase o un dataset.
- `generateMetadata` por pagina (title, description, OG unicos).
- `sitemap.ts` que liste todas las paginas.
- Contenido REAL y util por pagina (no thin content — Google lo penaliza).

### Gate anti-spam
Cada pagina programatica debe aportar valor real (datos, respuesta util). Paginas vacias
clonadas = penalizacion. Calidad sobre cantidad.

---

## Motor 2 — Motor de contenido SEO

- Identificar keywords de cola larga con intencion (problemas que busca tu usuario).
- Generar articulos utiles (no relleno) que respondan esas busquedas.
- Estructura: H1 claro, respuesta arriba, profundidad despues, CTA al producto.
- Linking interno hacia las features del producto.
- Programar publicacion constante (mejor 1/semana sostenido que 10 de golpe).

---

## Motor 3 — Auto-post a redes

- Generar variantes de post por plataforma (X, LinkedIn, Instagram) desde un mismo nucleo.
- Reutilizar `image-generation` para los visuales y `video-generator` para clips.
- Calendario de publicacion.
- Nota: el auto-POSTEO real (publicar sin intervencion) requiere conexiones/API de cada red;
  por defecto generar el contenido + intents de compartir (Nivel 1). El posteo autonomo
  (Nivel 2) es opt-in explicito.

---

## Motor 4 — Ads (cuando hay presupuesto)

- Generar variantes de copy (AIDA/PAS) + creativos para campanas.
- Definir el evento de conversion (signup/paid via outcomes) para medir CAC.
- Empezar chico, medir CAC vs LTV, escalar solo lo que es rentable.

---

## Como se prioriza

1. SEO programatico + contenido (compuesto, barato, tarda pero escala).
2. Redes (alcance organico mientras el SEO madura).
3. Ads (velocidad, solo cuando CAC < LTV esta validado).

`outcomes` cierra el loop: que canal trajo usuarios que CONVIRTIERON, no solo clicks.

---

## Reglas de Oro

1. **Distribucion es parte del producto.** No termina en "deployado".
2. **Calidad sobre cantidad en SEO.** Thin content programatico = penalizacion.
3. **Compuesto antes que pagado.** SEO/contenido primero, ads despues.
4. **Mide el canal, no el click.** outcomes dice que canal trajo conversiones.
5. **Auto-post real es opt-in.** Por default generar contenido + share intents.
