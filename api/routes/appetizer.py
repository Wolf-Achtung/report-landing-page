"""
FastAPI route for KI-Business-Appetizer.
Register with: app.include_router(router, prefix="/api/appetizer")
"""

import json
import logging
from enum import Enum
from typing import Optional

import anthropic
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator

from api.prompts.appetizer_prompts import APPETIZER_SYSTEM_PROMPT, build_user_prompt
from api.services.appetizer_score import calculate_appetizer_score

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
# Database helpers (placeholder — integrate with your DB session)
# ---------------------------------------------------------------------------

async def save_appetizer_lead(request: AppetizerRequest, result: dict, score: dict):
    """Save lead with email to appetizer_leads table."""
    # TODO: integrate with existing DB session/pool
    logger.info("Appetizer lead saved: branche=%s, score=%s", request.branche.value, score["wert"])


async def save_appetizer_analytics(branche: str, mitarbeiter: str, score: dict):
    """Save anonymous analytics to appetizer_analytics table."""
    logger.info("Appetizer analytics: branche=%s, mitarbeiter=%s, score=%s", branche, mitarbeiter, score["wert"])


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
