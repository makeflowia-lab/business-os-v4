# Skill: Neon Mission Control 🚀

Permite al agente actuar como el analista de datos jefe del Business OS, interactuando directamente con la base de datos Neon.

## 🎯 Objetivo
Eliminar la necesidad de dashboards externos para consultas rápidas de negocio. El usuario pregunta en lenguaje natural ("¿Cuánto vendimos ayer?") y el sistema traduce, ejecuta y sintetiza.

## 🛠️ Capacidades
1.  **Consulta de Métricas:** Usuarios, ingresos, engagement.
2.  **Gestión de Estructura:** Crear tablas, columnas o índices para nuevas features (Capa 4).
3.  **Depuración:** Buscar inconsistencias en los datos.

## 📝 Reglas de Operación
- **Seguridad:** Siempre usar transacciones para operaciones de escritura.
- **Transparencia:** Mostrar la consulta SQL generada antes de ejecutarla si es una operación destructiva.
- **Sintetización:** No solo dar el JSON de respuesta; explicar qué significan esos datos para el negocio.

## 🔄 Workflow
1.  Recibir pregunta en lenguaje natural.
2.  Identificar tablas relevantes en Neon (usando `describe_table_schema`).
3.  Generar y ejecutar SQL.
4.  Responder con insights estratégicos.
