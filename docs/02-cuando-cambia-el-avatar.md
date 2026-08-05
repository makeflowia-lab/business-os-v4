# Cuándo Cambia el Avatar al Estado B

## Los dos estados

| Estado | Imagen | Indicador en header |
|--------|--------|-------------------|
| A — Humano | Cara humana, borde cálido | punto dorado · "Modo humano" |
| B — Soul Reaver | Cara skull, glow azul | punto azul · "Soul Reaver activo" |

## Cómo funciona

Raziel decide su propio estado en cada respuesta. No es el usuario quien lo activa — es el agente quien lo declara según el tono de la conversación.

Al inicio de cada respuesta, el modelo incluye un marcador invisible:
- `[ESTADO:humano]` → permanece en forma humana
- `[ESTADO:soul_reaver]` → transiciona a Soul Reaver

La app lo detecta, elimina el marcador del texto visible, y cambia el avatar con un crossfade suave de 700ms.

## Cuándo aparece el Estado B

El avatar cambia a Soul Reaver cuando Raziel entra en modo de ejecución:

- Cuando le das luz verde para construir algo ("procede", "sí", "hazlo")
- Cuando está entregando un análisis profundo o un reporte
- Cuando genera documentación completa
- Cuando identifica un problema crítico y propone la solución
- Cuando el tono de la conversación es operativo, no exploratorio

## Cuándo permanece en Estado A

- Saludos e introducciones
- Preguntas abiertas o exploratorias
- Cuando el usuario está decidiendo o dudando
- Respuestas cortas o conversacionales
- Cuando pide aclaraciones antes de actuar

## En resumen

Estado A = Raziel escucha y analiza.
Estado B = Raziel ejecuta y entrega.
