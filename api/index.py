from __future__ import annotations

import os
from datetime import UTC, datetime
from functools import lru_cache
from io import BytesIO
from typing import Any
from urllib.parse import quote

import requests
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, Field
from PIL import Image

from ai.pipeline import LostFoundPipeline


app = FastAPI(title="Lost & Found AI API", version="1.0.0")


class FoundAnalyzeRequest(BaseModel):
    draftImageSignedUrl: str = Field(min_length=1)
    draftImageStoragePath: str = Field(min_length=1)
    userDescription: str = Field(min_length=1)
    locationFound: str = "Unknown"
    language: str = "en"


class LostSearchRequest(BaseModel):
    query: str = Field(min_length=1)
    topK: int = Field(default=3, ge=1, le=10)
    language: str = "en"


def _require_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


@lru_cache(maxsize=1)
def get_pipeline() -> LostFoundPipeline:
    return LostFoundPipeline()


def extract_bearer_token(authorization: str | None) -> str:
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header.")
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token.strip():
        raise HTTPException(status_code=401, detail="Invalid Authorization header.")
    return token.strip()


def verify_user_token(token: str) -> dict[str, Any]:
    supabase_url = _require_env("SUPABASE_URL").rstrip("/")
    supabase_anon_key = _require_env("SUPABASE_ANON_KEY")
    response = requests.get(
        f"{supabase_url}/auth/v1/user",
        headers={
            "apikey": supabase_anon_key,
            "Authorization": f"Bearer {token}",
        },
        timeout=20,
    )
    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid or expired Supabase token.")
    return response.json()


def build_review_hint(language: str, confidence: str) -> str:
    is_arabic = str(language).lower().startswith("ar")
    if confidence == "high":
        return (
            "اقترح الذكاء الاصطناعي هذه التفاصيل بناءً على الصورة. راجعها قبل النشر."
            if is_arabic
            else "AI suggested these details from the photo. Review them before publishing."
        )
    if confidence == "medium":
        return (
            "الصورة مفيدة لكن بعض التفاصيل تحتاج تأكيدك قبل النشر."
            if is_arabic
            else "The photo helped, but some details still need your confirmation before publishing."
        )
    return (
        "الصورة غير واضحة بالكامل، فعدّل التفاصيل يدويًا قبل النشر."
        if is_arabic
        else "The image was only partially clear, so edit the details manually before publishing."
    )


def map_confidence(value: str | None) -> str:
    normalized = str(value or "").strip().lower()
    if normalized == "high":
        return "high"
    if normalized == "medium":
        return "medium"
    return "low"


def map_category(value: str | None) -> str:
    normalized = str(value or "").strip().lower()
    if normalized in {"electronics", "bags", "documents", "accessories"}:
        return normalized
    return "accessories"


def relative_time_label(value: str | None, language: str) -> str:
    is_arabic = str(language).lower().startswith("ar")
    if not value:
        return "الآن" if is_arabic else "Just now"
    try:
        parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except ValueError:
        return "الآن" if is_arabic else "Just now"

    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=UTC)

    diff_minutes = int((datetime.now(UTC) - parsed.astimezone(UTC)).total_seconds() // 60)
    if diff_minutes <= 0:
        return "الآن" if is_arabic else "Just now"
    if diff_minutes < 60:
        return f"قبل {diff_minutes} دقيقة" if is_arabic else f"{diff_minutes} minute{'s' if diff_minutes != 1 else ''} ago"

    diff_hours = diff_minutes // 60
    if diff_hours < 24:
        return f"قبل {diff_hours} ساعة" if is_arabic else f"{diff_hours} hour{'s' if diff_hours != 1 else ''} ago"

    diff_days = diff_hours // 24
    return f"قبل {diff_days} يوم" if is_arabic else f"{diff_days} day{'s' if diff_days != 1 else ''} ago"


def sign_storage_path(storage_path: str, token: str) -> str | None:
    if not storage_path:
        return None

    supabase_url = _require_env("SUPABASE_URL").rstrip("/")
    supabase_anon_key = _require_env("SUPABASE_ANON_KEY")
    encoded_path = quote(storage_path, safe="/")
    response = requests.post(
        f"{supabase_url}/storage/v1/object/sign/post-images/{encoded_path}",
        headers={
            "apikey": supabase_anon_key,
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        json={"expiresIn": 3600},
        timeout=20,
    )
    if response.status_code != 200:
        return None

    payload = response.json()
    signed_url = payload.get("signedURL") or payload.get("signedUrl")
    if not signed_url:
        return None
    if str(signed_url).startswith("http"):
        return str(signed_url)
    return f"{supabase_url}/storage/v1{signed_url}"


def download_image(image_url: str) -> Image.Image:
    response = requests.get(image_url, timeout=30)
    response.raise_for_status()
    return Image.open(BytesIO(response.content)).convert("RGB")


@app.get("/api/health")
def healthcheck() -> dict[str, bool]:
    return {"ok": True}


@app.post("/api/found/analyze")
def analyze_found_item(
    payload: FoundAnalyzeRequest,
    authorization: str | None = Header(default=None),
) -> dict[str, Any]:
    try:
        token = extract_bearer_token(authorization)
        verify_user_token(token)
        pipeline = get_pipeline()
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"API setup failed: {error}") from error

    try:
        image = download_image(payload.draftImageSignedUrl)
        analysis = pipeline.analyze_found_item(image=image, user_description=payload.userDescription.strip())
    except Exception as error:  # pragma: no cover - network/model failures vary
        raise HTTPException(status_code=502, detail=f"Found-item analysis failed: {error}") from error

    confidence = map_confidence(analysis.get("attribute_confidence"))
    return {
        "title": analysis.get("generated_title") or "Found item",
        "summary": analysis.get("generated_summary") or payload.userDescription.strip(),
        "itemType": analysis.get("subcategory") or "Unknown",
        "category": map_category(analysis.get("category")),
        "brand": analysis.get("brand") or "Unknown",
        "primaryColor": analysis.get("primary_color") or "Unknown",
        "material": analysis.get("material") or "Unknown",
        "distinctiveFeatures": analysis.get("notable_features") or [],
        "searchKeywords": analysis.get("search_keywords") or [],
        "confidence": confidence,
        "reviewHint": build_review_hint(payload.language, confidence),
    }


@app.post("/api/lost/search")
def search_lost_item(
    payload: LostSearchRequest,
    authorization: str | None = Header(default=None),
) -> dict[str, Any]:
    try:
        token = extract_bearer_token(authorization)
        user = verify_user_token(token)
        user_id = str(user.get("id") or "")
        if not user_id:
            raise HTTPException(status_code=401, detail="Supabase user id missing from token.")

        pipeline = get_pipeline()
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"API setup failed: {error}") from error

    try:
        result = pipeline.run_lost_item_search(
            lost_user_id=user_id,
            lost_description=payload.query.strip(),
            top_k=payload.topK,
        )
    except Exception as error:  # pragma: no cover - network/model failures vary
        raise HTTPException(status_code=502, detail=f"Lost-item search failed: {error}") from error

    matches: list[dict[str, Any]] = []
    for match in result.get("matches", []):
        score = float(match.get("score", 0.0))
        confidence = map_confidence(match.get("confidence_label"))
        signed_image = sign_storage_path(str(match.get("primary_image_path") or ""), token)
        matches.append(
            {
                "item": {
                    "id": str(match.get("id") or ""),
                    "userId": str(match.get("user_id") or ""),
                    "type": "found",
                    "title": match.get("generated_title") or "Found item",
                    "description": match.get("generated_summary") or match.get("user_description") or "Found item",
                    "location": match.get("public_location_label") or match.get("city_slug") or "Unknown location",
                    "category": map_category(match.get("category")),
                    "time": relative_time_label(match.get("posted_at"), payload.language),
                    "contactName": match.get("finder_name") or "Community member",
                    "status": "open",
                    "image": signed_image,
                },
                "score": score,
                "confidence": confidence,
                "reason": match.get("explanation")
                or "This looks like a possible match. Ask the finder to verify the most distinctive details before claiming it.",
                "grouping": "likely" if score >= 0.72 else "possible",
            }
        )

    return {
        "id": result.get("lost_query", {}).get("id") or f"run-{int(datetime.now(UTC).timestamp())}",
        "query": payload.query.strip(),
        "createdAtLabel": "الآن" if str(payload.language).lower().startswith("ar") else "Just now",
        "matches": matches,
    }
