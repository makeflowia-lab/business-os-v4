-- Producto "Prospecta": correo en frio para vender SaaS a la medida.
-- Skills: supabase (tablas+RLS), outcomes (eventos), compliance (unsubscribes).
-- Todas las tablas de negocio son owner-based (cada usuario ve solo lo suyo).

-- LEADS (capturados desde campana Facebook u otra fuente)
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  company TEXT,
  source TEXT DEFAULT 'facebook',
  status TEXT NOT NULL DEFAULT 'new',     -- new | queued | sent | replied | bounced | unsubscribed
  consent BOOLEAN NOT NULL DEFAULT false, -- consentimiento de contacto (compliance)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (owner_id, email)
);
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "owner all leads" ON leads;
CREATE POLICY "owner all leads" ON leads
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- CAMPAIGNS (una campana = un mensaje base a una lista)
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,                     -- plantilla con {{name}} {{company}}
  from_name TEXT NOT NULL DEFAULT 'Equipo SaaS',
  status TEXT NOT NULL DEFAULT 'draft',   -- draft | sending | sent
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "owner all campaigns" ON campaigns;
CREATE POLICY "owner all campaigns" ON campaigns
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- EMAIL SENDS (un envio a un lead dentro de una campana)
CREATE TABLE IF NOT EXISTS email_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  to_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',  -- queued | sent | failed | dryrun
  provider_id TEXT,                       -- id de Resend
  error TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE email_sends ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "owner all sends" ON email_sends;
CREATE POLICY "owner all sends" ON email_sends
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- EMAIL EVENTS (tracking: open, click, reply, bounce) — skill outcomes
CREATE TABLE IF NOT EXISTS email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  send_id UUID REFERENCES email_sends(id) ON DELETE CASCADE,
  type TEXT NOT NULL,                     -- open | click | reply | bounce
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;
-- El tracking pixel/click es publico (sin sesion): permitir insert anonimo de eventos.
DROP POLICY IF EXISTS "anyone insert events" ON email_events;
CREATE POLICY "anyone insert events" ON email_events
  FOR INSERT WITH CHECK (true);

-- UNSUBSCRIBES (opt-out global, publico) — skill compliance (CAN-SPAM/LFPDPPP)
CREATE TABLE IF NOT EXISTS unsubscribes (
  email TEXT PRIMARY KEY,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE unsubscribes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anyone can unsubscribe" ON unsubscribes;
CREATE POLICY "anyone can unsubscribe" ON unsubscribes
  FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_leads_owner ON leads (owner_id, status);
CREATE INDEX IF NOT EXISTS idx_sends_campaign ON email_sends (campaign_id);
CREATE INDEX IF NOT EXISTS idx_events_send ON email_events (send_id, type);
