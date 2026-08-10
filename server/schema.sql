-- Questionários — Neon / Postgres
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS questionnaires (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT NOT NULL UNIQUE,
  title         TEXT NOT NULL,
  subtitle      TEXT NOT NULL DEFAULT '',
  description   TEXT NOT NULL DEFAULT '',
  layout        TEXT NOT NULL DEFAULT 'list' CHECK (layout IN ('wheel', 'list')),
  questions     JSONB NOT NULL DEFAULT '[]'::jsonb,
  password_hash TEXT NOT NULL,
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS questionnaire_submissions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  questionnaire_id  UUID NOT NULL REFERENCES questionnaires(id) ON DELETE CASCADE,
  cpf               CHAR(11) NOT NULL,
  answers           JSONB NOT NULL,
  submitted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submissions_questionnaire
  ON questionnaire_submissions (questionnaire_id);

CREATE INDEX IF NOT EXISTS idx_submissions_cpf
  ON questionnaire_submissions (cpf);

CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at
  ON questionnaire_submissions (submitted_at DESC);
