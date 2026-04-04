# BACKEND-INTEGRATIONS-BRIEFING: KI-Potenzial-Check

**Ziel-Repo:** `api-ki-backend-neu` (Railway)  
**Erstellt:** 04.04.2026  
**Session:** KIS-1112  
**Grundregel:** Bestehende Konfiguration NICHT ändern — nur ergänzen.

---

## TL;DR

3 neue Dateien + 1 Zeile in `main.py` + 1 SQL-Migration. Keine Änderung an bestehenden Dateien außer der Router-Registrierung. Neuer Endpoint: `POST /api/appetizer/generate`.

---

## Schritt 0: Ist-Zustand analysieren

**VOR jeder Änderung** muss der aktuelle Zustand des Backend-Repos verstanden werden:

1. **`main.py` lesen** — Wie ist die FastAPI-App aufgebaut? Wie werden bestehende Router registriert?
2. **Verzeichnisstruktur prüfen** — Existieren `routes/`, `services/`, `prompts/` Ordner bereits? Falls ja: dem bestehenden Pattern folgen.
3. **DB-Session prüfen** — Wie wird die PostgreSQL-Verbindung gehandhabt?
   - SQLAlchemy? asyncpg? psycopg2? 
   - Dependency Injection via `Depends(get_db)`?
   - Connection Pool?
4. **CORS prüfen** — Erlaubt die CORS-Config bereits `report.ki-sicherheit.jetzt`?
5. **`requirements.txt` / `pyproject.toml`** — Ist `anthropic` bereits als Dependency vorhanden?
6. **Environment Variables** — Ist `ANTHROPIC_API_KEY` auf Railway gesetzt?

**Nichts Bestehendes ändern. Nur ergänzen.**

---

## Schritt 1: Drei neue Dateien anlegen

### Datei 1: `services/appetizer_score.py`

Einfach 1:1 kopieren — keine Abhängigkeiten zu bestehenden Modulen.

```python
"""
Deterministic score calculation for KI-Business-Appetizer.
The LLM is NEVER used for score calculation.
"""


def calculate_appetizer_score(
    ki_erfahrung: str,
    zeitaufwand_repetitiv: str,
    branche: str,
    mitarbeiter: str,
) -> dict:
    """Calculate KI-Readiness score from lookup tables. Returns dict with wert and einordnung."""

    ki_punkte = {
        "keine": 8,
        "erste_versuche": 18,
        "regelmaessig": 30,
    }

    repetitiv_punkte = {
        "unter_25": 10,
        "25_50": 20,
        "ueber_50": 30,
    }

    branchen_punkte = {
        "marketing": 18, "medien": 18, "it": 18, "beratung": 18,
        "finanzen": 15, "handel": 15, "bildung": 15, "logistik": 15,
        "gesundheit": 12, "verwaltung": 12, "industrie": 12,
        "bau": 9, "gastronomie": 9,
    }

    groesse_punkte = {
        "1": 10,
        "2-10": 16,
        "11-100": 20,
    }

    score = (
        ki_punkte.get(ki_erfahrung, 8)
        + repetitiv_punkte.get(zeitaufwand_repetitiv, 10)
        + branchen_punkte.get(branche, 12)
        + groesse_punkte.get(mitarbeiter, 10)
    )

    if score <= 50:
        einordnung = "STARTER"
    elif score <= 65:
        einordnung = "EXPLORER"
    elif score <= 80:
        einordnung = "READY"
    else:
        einordnung = "ADVANCED"

    return {"wert": score, "einordnung": einordnung}
```

### Datei 2: `prompts/appetizer_prompts.py`

Einfach 1:1 kopieren — keine Abhängigkeiten zu bestehenden Modulen.

```python
"""
Prompt templates for the KI-Business-Appetizer LLM call (Claude Sonnet).
"""

APPETIZER_SYSTEM_PROMPT = """\
Du bist ein KI-Strategieberater für deutsche KMU. Du erhältst Unternehmensdaten und einen bereits berechneten KI-Score. Du lieferst branchenspezifische Analyse.

Dein Output ist AUSSCHLIESSLICH valides JSON. Kein Markdown, keine Backticks, kein Text vor oder nach dem JSON.

HEBEL-REGELN:
- Genau 3 Hebel. Jeder MUSS branchenspezifisch sein — keine generischen Tipps.
- Beschreibung: exakt 2 Sätze. Satz 1: Problem/Chance. Satz 2: Was konkret möglich wird.
- zeitersparnis_pro_woche_stunden = Gesamtunternehmen, nicht Einzelperson.
- Segment "1": max 15h/Woche. Segment "2-10": max 25h/Woche. Segment "11-100": max 60h/Woche.
- Mindestens ein Hebel muss Kategorie UMSATZ oder SKALIERUNG sein.

MONETARISIERUNGS-REGELN:
- Genau 3 Ideen: je eine STUFE_1, STUFE_2, STUFE_3.
- umsatzpotenzial_monat_eur Caps:
  Solo (1): STUFE_1 max 2.000, STUFE_2 max 4.000, STUFE_3 max 8.000
  Team (2-10): STUFE_1 max 5.000, STUFE_2 max 10.000, STUFE_3 max 20.000
  KMU (11-100): STUFE_1 max 10.000, STUFE_2 max 20.000, STUFE_3 max 40.000
- Teaser verweist auf "vollen Report" oder "KI-Strategiebericht".
- KEINE spezifischen Tool- oder Produktnamen.

POSITIONIERUNG: Ein Satz. Muss die genannte Herausforderung adressieren und Branche/Leistung enthalten.

CTA:
- headline: Max 10 Wörter. Greift Herausforderung ODER Zeitersparnis-Summe auf.
- subline: 1 Satz. Verweist auf vollen KI-Strategiebericht.

FALLBACK: Wenn hauptleistung <10 Zeichen oder unklar → branchenspezifisch formulieren. Wenn herausforderung unklar → branchentypische Herausforderung verwenden.\
"""

APPETIZER_USER_PROMPT_TEMPLATE = """\
Analysiere:

FIRMA: {firma}
BRANCHE: {branche}
MITARBEITER: {mitarbeiter}
HAUPTLEISTUNG: {hauptleistung}
REPETITIVER ANTEIL: {zeitaufwand_repetitiv}
KI-ERFAHRUNG: {ki_erfahrung}
HERAUSFORDERUNG: {groesste_herausforderung}

BEREITS BERECHNETER SCORE: {score_wert} ({score_einordnung})

Schreibe den einordnung_text passend zum Score und liefere die Analyse.

JSON:

{{
  "score": {{
    "wert": {score_wert},
    "einordnung": "{score_einordnung}",
    "einordnung_text": "<1 Satz, erklärt was der Score für dieses Unternehmen bedeutet>"
  }},
  "hebel": [
    {{
      "titel": "<kurzer Name>",
      "kategorie": "<EFFIZIENZ|QUALITÄT|UMSATZ|SKALIERUNG>",
      "beschreibung": "<exakt 2 Sätze>",
      "aufwand": "<GERING|MITTEL|HOCH>",
      "wirkung": "<GERING|MITTEL|HOCH>",
      "zeitersparnis_pro_woche_stunden": "<number>",
      "prioritaet": "<SOFORT|QUARTAL_1|QUARTAL_2>"
    }}
  ],
  "monetarisierung": [
    {{
      "titel": "<Name>",
      "stufe": "<STUFE_1|STUFE_2|STUFE_3>",
      "beschreibung": "<1 Satz>",
      "umsatzpotenzial_monat_eur": "<number>",
      "teaser": "<1 Satz>"
    }}
  ],
  "positionierung": "<1 Satz>",
  "cta": {{
    "headline": "<max 10 Wörter>",
    "subline": "<1 Satz>"
  }}
}}\
"""


def build_user_prompt(
    firma: str,
    branche: str,
    mitarbeiter: str,
    hauptleistung: str,
    zeitaufwand_repetitiv: str,
    ki_erfahrung: str,
    groesste_herausforderung: str,
    score_wert: int,
    score_einordnung: str,
) -> str:
    return APPETIZER_USER_PROMPT_TEMPLATE.format(
        firma=firma,
        branche=branche,
        mitarbeiter=mitarbeiter,
        hauptleistung=hauptleistung,
        zeitaufwand_repetitiv=zeitaufwand_repetitiv,
        ki_erfahrung=ki_erfahrung,
        groesste_herausforderung=groesste_herausforderung,
        score_wert=score_wert,
        score_einordnung=score_einordnung,
    )
```

### Datei 3: `routes/appetizer.py`

**ACHTUNG:** Diese Datei hat 2 Stellen, die an die bestehende DB-Architektur angepasst werden müssen (markiert mit `# >>> ANPASSEN`). Der Rest wird 1:1 übernommen.

```python
"""
FastAPI route for KI-Potenzial-Check (Appetizer).
Register with: app.include_router(router, prefix="/api/appetizer")
"""

import json
import logging
from enum import Enum
from typing import Optional

import anthropic
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator

# >>> ANPASSEN: Import-Pfade an bestehende Projektstruktur anpassen
# Beispiel: Wenn das Projekt "from app.services.xxx" nutzt, entsprechend ändern.
from prompts.appetizer_prompts import APPETIZER_SYSTEM_PROMPT, build_user_prompt
from services.appetizer_score import calculate_appetizer_score

logger = logging.getLogger(__name__)

router = APIRouter()


# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------

class BrancheEnum(str, Enum):
    marketing = "marketing"
    beratung = "beratung"
    it = "it"
    finanzen = "finanzen"
    handel = "handel"
    bildung = "bildung"
    verwaltung = "verwaltung"
    gesundheit = "gesundheit"
    bau = "bau"
    medien = "medien"
    industrie = "industrie"
    logistik = "logistik"
    gastronomie = "gastronomie"


class MitarbeiterEnum(str, Enum):
    solo = "1"
    team = "2-10"
    kmu = "11-100"


class ZeitaufwandEnum(str, Enum):
    unter_25 = "unter_25"
    halb = "25_50"
    ueber_50 = "ueber_50"


class KiErfahrungEnum(str, Enum):
    keine = "keine"
    erste_versuche = "erste_versuche"
    regelmaessig = "regelmaessig"


class AppetizerRequest(BaseModel):
    firma: str = Field(default="Unternehmen", max_length=100)
    branche: BrancheEnum
    mitarbeiter: MitarbeiterEnum
    hauptleistung: str = Field(..., max_length=200)
    zeitaufwand_repetitiv: ZeitaufwandEnum
    ki_erfahrung: KiErfahrungEnum
    groesste_herausforderung: str = Field(..., max_length=200)
    email: Optional[str] = None
    newsletter_optin: bool = False

    @field_validator("hauptleistung", "groesste_herausforderung")
    @classmethod
    def not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Feld darf nicht leer sein")
        return v.strip()

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: Optional[str]) -> Optional[str]:
        if v is None or v == "":
            return None
        v = v.strip()
        if "@" not in v or "." not in v.split("@")[-1]:
            raise ValueError("Ungültige E-Mail-Adresse")
        return v


# ---------------------------------------------------------------------------
# LLM call
# ---------------------------------------------------------------------------

async def call_claude_sonnet(system_prompt: str, user_prompt: str) -> str:
    """Call Claude Sonnet and return the raw text response."""
    client = anthropic.Anthropic()  # uses ANTHROPIC_API_KEY env var
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2048,
        system=system_prompt,
        messages=[{"role": "user", "content": user_prompt}],
    )
    return message.content[0].text


def parse_and_validate_json(raw: str) -> dict:
    """Parse LLM output as JSON, stripping markdown fences if present."""
    text = raw.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1] if "\n" in text else text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()

    result = json.loads(text)

    # Basic structural validation
    assert "score" in result, "Missing score"
    assert "hebel" in result and len(result["hebel"]) == 3, "Need exactly 3 hebel"
    assert "monetarisierung" in result and len(result["monetarisierung"]) == 3, "Need exactly 3 monetarisierung"
    assert "positionierung" in result, "Missing positionierung"
    assert "cta" in result, "Missing cta"

    return result


# ---------------------------------------------------------------------------
# Database helpers
# >>> ANPASSEN: Die beiden Funktionen unten müssen an eure bestehende
# >>> DB-Session-Architektur angepasst werden.
# >>>
# >>> OPTION A: Wenn ihr SQLAlchemy + Depends(get_db) nutzt:
# >>>   - Parameter "db: AsyncSession" zu den Funktionen hinzufügen
# >>>   - db.execute(text("INSERT INTO ...")) + await db.commit()
# >>>
# >>> OPTION B: Wenn ihr asyncpg direkt nutzt:
# >>>   - Connection Pool importieren
# >>>   - async with pool.acquire() as conn: await conn.execute(...)
# >>>
# >>> OPTION C: Wenn ihr erstmal ohne DB starten wollt:
# >>>   - Die Funktionen so lassen wie sie sind (nur Logging)
# >>>   - DB-Integration später nachrüsten
# ---------------------------------------------------------------------------

async def save_appetizer_lead(request, result: dict, score: dict):
    """Save lead with email to appetizer_leads table."""
    # >>> ANPASSEN: DB-Insert hier einbauen
    # INSERT INTO appetizer_leads
    #   (firma, branche, mitarbeiter, hauptleistung, zeitaufwand_repetitiv,
    #    ki_erfahrung, groesste_herausforderung, email, newsletter_optin,
    #    score_wert, score_einordnung, result_json)
    # VALUES (...)
    logger.info("Appetizer lead: branche=%s, score=%s, email=%s",
                request.branche.value, score["wert"], request.email)


async def save_appetizer_analytics(branche: str, mitarbeiter: str, score: dict):
    """Save anonymous analytics to appetizer_analytics table."""
    # >>> ANPASSEN: DB-Insert hier einbauen
    # INSERT INTO appetizer_analytics (branche, mitarbeiter, score_wert, score_einordnung)
    # VALUES (...)
    logger.info("Appetizer analytics: branche=%s, mitarbeiter=%s, score=%s",
                branche, mitarbeiter, score["wert"])


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------

@router.post("/generate")
async def generate_appetizer(request: AppetizerRequest):
    # 1. Score berechnen (deterministic, no LLM)
    score = calculate_appetizer_score(
        ki_erfahrung=request.ki_erfahrung.value,
        zeitaufwand_repetitiv=request.zeitaufwand_repetitiv.value,
        branche=request.branche.value,
        mitarbeiter=request.mitarbeiter.value,
    )

    # 2. Build prompt and call LLM for content
    user_prompt = build_user_prompt(
        firma=request.firma,
        branche=request.branche.value,
        mitarbeiter=request.mitarbeiter.value,
        hauptleistung=request.hauptleistung,
        zeitaufwand_repetitiv=request.zeitaufwand_repetitiv.value,
        ki_erfahrung=request.ki_erfahrung.value,
        groesste_herausforderung=request.groesste_herausforderung,
        score_wert=score["wert"],
        score_einordnung=score["einordnung"],
    )

    try:
        raw_response = await call_claude_sonnet(APPETIZER_SYSTEM_PROMPT, user_prompt)
        result = parse_and_validate_json(raw_response)
    except json.JSONDecodeError as e:
        logger.error("LLM returned invalid JSON: %s", e)
        raise HTTPException(status_code=500, detail="Analyse konnte nicht erstellt werden. Bitte versuchen Sie es erneut.")
    except (AssertionError, KeyError) as e:
        logger.error("LLM response validation failed: %s", e)
        raise HTTPException(status_code=500, detail="Analyse konnte nicht erstellt werden. Bitte versuchen Sie es erneut.")
    except anthropic.APIError as e:
        logger.error("Anthropic API error: %s", e)
        raise HTTPException(status_code=500, detail="Analyse konnte nicht erstellt werden. Bitte versuchen Sie es erneut.")

    # 3. Enforce backend-calculated score (override LLM values)
    result["score"]["wert"] = score["wert"]
    result["score"]["einordnung"] = score["einordnung"]

    # 4. Save lead if email provided
    if request.email:
        await save_appetizer_lead(request, result, score)

    # 5. Always save anonymous analytics
    await save_appetizer_analytics(request.branche.value, request.mitarbeiter.value, score)

    return {"status": "success", "result": result}
```

---

## Schritt 2: Router in `main.py` registrieren

**Eine Zeile hinzufügen.** Nicht an bestehenden Routen ändern.

Erst den Ist-Zustand von `main.py` lesen. Dann dort, wo die anderen Router registriert sind, ergänzen:

```python
# >>> Bestehende Router-Registrierungen NICHT ändern <<<

# Neuer Appetizer-Router
from routes.appetizer import router as appetizer_router
app.include_router(appetizer_router, prefix="/api/appetizer")
```

**Import-Pfad anpassen:** Falls das Projekt z.B. `from app.routes.xxx` nutzt, entsprechend `from app.routes.appetizer import router as appetizer_router`.

---

## Schritt 3: CORS prüfen

Falls die CORS-Middleware noch nicht `report.ki-sicherheit.jetzt` erlaubt, muss die Origin hinzugefügt werden. **Nur ergänzen, nicht ersetzen:**

```python
# Prüfen ob diese Origin schon in allow_origins ist:
# "https://report.ki-sicherheit.jetzt"
# Falls nicht: hinzufügen.
```

---

## Schritt 4: Dependencies prüfen

Prüfen ob `anthropic` in `requirements.txt` oder `pyproject.toml` steht. Falls nicht:

```
anthropic>=0.40.0
```

Prüfen ob `ANTHROPIC_API_KEY` als Environment Variable auf Railway gesetzt ist.

---

## Schritt 5: DB-Migration ausführen

**Nur ausführen, nicht bestehende Tabellen ändern.**

Gegen die Railway PostgreSQL-Datenbank:

```sql
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
```

---

## Schritt 6: Testen

### Smoke-Test nach Deploy

```bash
curl -X POST https://api-ki-backend-neu-production.up.railway.app/api/appetizer/generate \
  -H "Content-Type: application/json" \
  -d '{
    "branche": "medien",
    "mitarbeiter": "11-100",
    "hauptleistung": "Video- und Audioproduktion für Unternehmen",
    "zeitaufwand_repetitiv": "25_50",
    "ki_erfahrung": "erste_versuche",
    "groesste_herausforderung": "Zu viel manuelle Nachbearbeitung"
  }'
```

**Erwartetes Ergebnis:**
- HTTP 200
- `result.score.wert` = **76**
- `result.score.einordnung` = **"READY"**
- 3 Hebel, 3 Monetarisierungs-Ideen, 1 Positionierung, 1 CTA

### Score-Referenztabelle

| Testcase | Request-Body | Erwarteter Score | Einordnung |
|----------|-------------|:---:|---|
| Medien-KMU | `medien, 11-100, erste_versuche, 25_50` | 76 | READY |
| Solo-Steuerberater | `finanzen, 1, keine, unter_25` | 43 | STARTER |
| IT-Agentur | `it, 2-10, regelmaessig, ueber_50` | 94 | ADVANCED |
| Bau-KMU | `bau, 11-100, keine, unter_25` | 47 | STARTER |

---

## Zusammenfassung: Was wird geändert

| Datei | Aktion | Risiko |
|-------|--------|--------|
| `services/appetizer_score.py` | **NEU** — keine Abhängigkeiten | Keins |
| `prompts/appetizer_prompts.py` | **NEU** — keine Abhängigkeiten | Keins |
| `routes/appetizer.py` | **NEU** — Import-Pfade + DB-Wiring anpassen | Gering |
| `main.py` | **1 Zeile ergänzen** (Router-Registrierung) | Gering |
| `requirements.txt` | **Ggf. ergänzen** (`anthropic`) | Keins |
| DB | **2 neue Tabellen** + 2 Indices | Keins |
| Bestehende Dateien | **NICHT ANFASSEN** | — |

---

## Anleitung für die neue Claude Code Session

```
Handover: KI-Potenzial-Check Backend-Integration.

Aufgabe: Neuen Endpoint POST /api/appetizer/generate integrieren.
Briefing liegt bei (dieses Dokument).

WICHTIG:
1. Zuerst Ist-Zustand analysieren (main.py, Verzeichnisstruktur, DB-Session-Architektur)
2. An bestehender Konfiguration NICHTS ändern
3. 3 neue Dateien anlegen (services/, prompts/, routes/)
4. Import-Pfade an bestehende Projektstruktur anpassen
5. Router in main.py registrieren (1 Zeile)
6. DB-Wiring an bestehende Session-Architektur anpassen
7. Migration ausführen
8. Smoke-Test mit curl (Score muss 76 sein für Medien-KMU-Testcase)
```

---

*Erstellt: 04.04.2026 — Claude Code KIS-1112*
