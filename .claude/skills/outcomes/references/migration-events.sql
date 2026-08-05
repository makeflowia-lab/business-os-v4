-- Migracion: tabla `events` para el skill `outcomes`.
-- Aplicar via Supabase MCP (apply_migration) o supabase CLI.
-- Mide el funnel real con RLS por usuario.

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  props JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS: cada usuario solo ve/inserta sus propios eventos.
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users insert own events" ON events;
CREATE POLICY "users insert own events" ON events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users read own events" ON events;
CREATE POLICY "users read own events" ON events
  FOR SELECT USING (auth.uid() = user_id);

-- Indice para consultas de funnel por evento y fecha.
CREATE INDEX IF NOT EXISTS idx_events_name_created ON events (name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_user ON events (user_id);

-- ─────────────────────────────────────────────────────────────
-- Consultas de referencia (correr con execute_sql para el reporte)
-- ─────────────────────────────────────────────────────────────

-- Funnel ultimos 30 dias:
-- SELECT name, COUNT(DISTINCT user_id) AS usuarios
-- FROM events
-- WHERE created_at > NOW() - INTERVAL '30 days'
-- GROUP BY name ORDER BY usuarios DESC;

-- Conversion por variante A/B:
-- SELECT props->>'variant' AS variante,
--        COUNT(*) FILTER (WHERE name = 'signup')   AS signups,
--        COUNT(*) FILTER (WHERE name = 'paid')      AS pagos
-- FROM events
-- WHERE props ? 'variant'
-- GROUP BY 1 ORDER BY 1;
