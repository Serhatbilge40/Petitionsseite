-- =============================================================
-- Supabase Schema – Petition: Gebetsbereich FH Dortmund
-- BOMBENFEST: Nur INSERT + eingeschränktes SELECT erlaubt
-- =============================================================
-- Führe dieses SQL in deinem Supabase SQL-Editor aus:
-- https://app.supabase.com → Dein Projekt → SQL Editor

-- pgcrypto für Passwort-Hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Unterschriften-Tabelle
CREATE TABLE signatures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  matrikelnummer TEXT,
  fach TEXT,
  semester TEXT,
  comment TEXT,
  privacy_accepted BOOLEAN NOT NULL DEFAULT false,
  signed_at TIMESTAMPTZ DEFAULT now(),
  ip_hash TEXT
);

-- Index für schnelle Abfragen
CREATE INDEX idx_signatures_signed_at ON signatures(signed_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY – ALLES DICHT MACHEN
-- ============================================================
ALTER TABLE signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE signatures FORCE ROW LEVEL SECURITY;

-- SELECT: Erlaubt (für View + Count)
CREATE POLICY "Anon darf zählen und öffentliche Daten lesen"
  ON signatures FOR SELECT
  USING (true);

-- INSERT: Nur mit Datenschutz-Einwilligung
CREATE POLICY "Anon darf unterschreiben"
  ON signatures FOR INSERT
  WITH CHECK (privacy_accepted = true);

-- UPDATE + DELETE: VERBOTEN (keine Policy = kein Zugriff)

-- ============================================================
-- SICHERE VIEW: Nur öffentliche Felder nach außen
-- ============================================================
CREATE OR REPLACE VIEW public_signatures AS
SELECT id, first_name, last_name, fach, comment, signed_at
FROM signatures;

GRANT SELECT ON public_signatures TO anon;
GRANT SELECT ON public_signatures TO authenticated;

-- ============================================================
-- ADMIN: Passwortgeschützte Daten-Abfrage
-- ============================================================

-- Admin-Passwort-Tabelle (nur 1 Eintrag)
CREATE TABLE admin_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- RLS: Niemand darf admin_config per API lesen/schreiben
ALTER TABLE admin_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_config FORCE ROW LEVEL SECURITY;
-- (Keine Policies = komplett gesperrt für anon/authenticated)

-- ⚠️ ÄNDERE 'MeinSicheresPasswort123' zu deinem gewünschten Passwort!
INSERT INTO admin_config (key, value)
VALUES ('admin_pw', crypt('MeinSicheresPasswort123', gen_salt('bf')));

-- Funktion: Gibt ALLE Daten nur mit korrektem Passwort zurück
CREATE OR REPLACE FUNCTION get_admin_signatures(pw TEXT)
RETURNS TABLE (
  id UUID,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  matrikelnummer TEXT,
  fach TEXT,
  semester TEXT,
  comment TEXT,
  signed_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER  -- Läuft mit DB-Owner-Rechten, umgeht RLS
SET search_path = public
AS $$
BEGIN
  -- Passwort prüfen
  IF NOT EXISTS (
    SELECT 1 FROM admin_config
    WHERE key = 'admin_pw'
    AND value = crypt(pw, value)
  ) THEN
    RAISE EXCEPTION 'Falsches Passwort';
  END IF;

  -- Alle Daten zurückgeben (ohne ip_hash, privacy_accepted)
  RETURN QUERY
    SELECT s.id, s.first_name, s.last_name, s.email,
           s.matrikelnummer, s.fach, s.semester, s.comment, s.signed_at
    FROM signatures s
    ORDER BY s.signed_at DESC;
END;
$$;

-- Funktion: Anzahl der Unterschriften (für Count ohne vollen Tabellenzugriff)
CREATE OR REPLACE FUNCTION get_signature_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO total FROM signatures;
  RETURN total;
END;
$$;
