-- Habilitar extensión pgvector
CREATE EXTENSION IF NOT EXISTS vector;
-- Tabla para fragmentos de conocimiento legal
CREATE TABLE legal_knowledge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    -- NULL para base de conocimientos global
    topic TEXT NOT NULL,
    content TEXT NOT NULL,
    embedding VECTOR(1536),
    -- Para embeddings de OpenAI/all-MiniLM
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Índice para búsqueda de similitud de coseno
CREATE INDEX ON legal_knowledge USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
-- Insertar chunks iniciales basados en transcripciones
INSERT INTO legal_knowledge (topic, content, metadata)
VALUES (
        'patente_vs_derecho_autor',
        'El software en México se protege por INDAUTOR como obra literaria. IMPI solo aplica para soluciones técnicas con efecto técnico.',
        '{"article": "47 LFPPI"}'
    ),
    (
        'clausulas_saas',
        'Mínimo 3 cláusulas: Licencia no exclusiva, Responsabilidad limitada, Portabilidad/Borrado.',
        '{"law": "Código Civil Federal"}'
    );