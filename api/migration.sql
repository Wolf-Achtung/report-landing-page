-- KI-Business-Appetizer Database Migration
-- Run against the Railway PostgreSQL database

-- Tabelle 1: Leads (mit E-Mail)
CREATE TABLE IF NOT EXISTS appetizer_leads (
    id SERIAL PRIMARY KEY,
    firma VARCHAR(100),
    branche VARCHAR(50) NOT NULL,
    mitarbeiter VARCHAR(10) NOT NULL,
    hauptleistung TEXT,
    zeitaufwand_repetitiv VARCHAR(20) NOT NULL,
    ki_erfahrung VARCHAR(20) NOT NULL,
    groesste_herausforderung TEXT,
    email VARCHAR(200),
    newsletter_optin BOOLEAN DEFAULT FALSE,
    score_wert INTEGER NOT NULL,
    score_einordnung VARCHAR(20) NOT NULL,
    result_json JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    converted_to_report BOOLEAN DEFAULT FALSE,
    converted_at TIMESTAMP
);

-- Tabelle 2: Anonyme Analytics (immer, auch ohne E-Mail)
CREATE TABLE IF NOT EXISTS appetizer_analytics (
    id SERIAL PRIMARY KEY,
    branche VARCHAR(50) NOT NULL,
    mitarbeiter VARCHAR(10) NOT NULL,
    score_wert INTEGER NOT NULL,
    score_einordnung VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_appetizer_leads_email ON appetizer_leads(email);
CREATE INDEX IF NOT EXISTS idx_appetizer_analytics_branche ON appetizer_analytics(branche);
