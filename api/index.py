from __future__ import annotations

import os
import time
from datetime import UTC, datetime
from functools import lru_cache
from io import BytesIO
from typing import Any
from urllib.parse import quote
import traceback

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


class FoundNormalizeRequest(BaseModel):
    title: str = ""
    summary: str = ""
    description: str = ""
    locationFound: str = ""
    category: str = ""
    itemType: str = ""
    primaryColor: str = ""
    material: str = ""
    brand: str = ""
    distinctiveFeatures: list[str] = Field(default_factory=list)
    searchKeywords: list[str] = Field(default_factory=list)


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
            "\u0627\u0642\u062a\u0631\u062d \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a \u0647\u0630\u0647 \u0627\u0644\u062a\u0641\u0627\u0635\u064a\u0644 \u0645\u0646 \u0627\u0644\u0635\u0648\u0631\u0629. \u0631\u0627\u062c\u0639\u0647\u0627 \u0642\u0628\u0644 \u0627\u0644\u0646\u0634\u0631."
            if is_arabic
            else "AI suggested these details from the photo. Review them before publishing."
        )
    if confidence == "medium":
        return (
            "\u0633\u0627\u0639\u062f\u062a \u0627\u0644\u0635\u0648\u0631\u0629\u060c \u0644\u0643\u0646 \u0628\u0639\u0636 \u0627\u0644\u062a\u0641\u0627\u0635\u064a\u0644 \u0645\u0627 \u0632\u0627\u0644\u062a \u062a\u062d\u062a\u0627\u062c \u0644\u0645\u0631\u0627\u062c\u0639\u062a\u0643 \u0642\u0628\u0644 \u0627\u0644\u0646\u0634\u0631."
            if is_arabic
            else "The photo helped, but some details still need your confirmation before publishing."
        )
    return (
        "\u0644\u0645 \u062a\u0643\u0646 \u0627\u0644\u0635\u0648\u0631\u0629 \u0648\u0627\u0636\u062d\u0629 \u0628\u0634\u0643\u0644 \u0643\u0627\u0641\u064d\u060c \u0641\u064a\u064f\u0641\u0636\u0644 \u062a\u0639\u062f\u064a\u0644 \u0627\u0644\u062a\u0641\u0627\u0635\u064a\u0644 \u064a\u062f\u0648\u064a\u064b\u0627 \u0642\u0628\u0644 \u0627\u0644\u0646\u0634\u0631."
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
    if normalized in {"electronics", "bags", "documents", "accessories", "other"}:
        return normalized
    return "other"


def is_arabic_language(language: str | None) -> bool:
    return str(language or "").strip().lower().startswith("ar")


def is_transient_ai_overload_error(message: str) -> bool:
    low = str(message or "").lower()
    return (
        "engine_overloaded_error" in low
        or "error code: 429" in low
        or ("429" in low and "overload" in low)
        or "rate limit" in low
        or "temporarily unavailable" in low
    )


def build_fallback_found_analysis(
    payload: FoundAnalyzeRequest,
    pipeline: LostFoundPipeline,
) -> dict[str, Any]:
    is_arabic = is_arabic_language(payload.language)
    description = str(payload.userDescription or "").strip()
    lowered = description.lower()

    keyword_map = [
        ("wallet", "wallet"),
        ("phone", "phone"),
        ("iphone", "phone"),
        ("keys", "keys"),
        ("key", "keys"),
        ("backpack", "backpack"),
        ("bag", "bag"),
        ("document", "documents"),
        ("id", "documents"),
        ("passport", "documents"),
        ("earbuds", "earbuds"),
        ("airpods", "earbuds"),
        ("نظارة", "sunglasses"),
        ("مفاتيح", "keys"),
        ("هاتف", "phone"),
        ("محفظ", "wallet"),
        ("حقيبة", "bag"),
        ("وثيقة", "documents"),
    ]

    item_type = "Unknown"
    for needle, value in keyword_map:
        if needle in lowered:
            item_type = value
            break

    category = pipeline.infer_category(item_type=item_type, raw_category="other", text=description)

    raw_features = [
        token.strip()
        for token in description.replace("\n", ",").split(",")
        if token.strip()
    ]
    distinctive_features = raw_features[:4]

    keyword_payload = {
        "subcategory": item_type,
        "category": category,
        "primary_color": "Unknown",
        "material": "Unknown",
        "brand": "Unknown",
        "notable_features": distinctive_features,
        "search_keywords": distinctive_features,
    }
    search_keywords = pipeline.expand_search_keywords(keyword_payload)[:12]

    if is_arabic:
        title = "عنصر معثور عليه"
        summary = description or "تم إنشاء ملخص مبدئي لأن خدمة الذكاء كانت مشغولة."
        review_hint = "تم إنشاء تحليل مبدئي لأن خدمة الذكاء مشغولة. راجع التفاصيل وعدّلها قبل النشر."
    else:
        title = f"Found {item_type}" if item_type != "Unknown" else "Found item"
        summary = description or "A draft summary was generated because the AI service is currently busy."
        review_hint = "A draft analysis was generated because the AI service is busy. Review details before publishing."

    return {
        "generated_title": title,
        "generated_summary": summary,
        "subcategory": item_type,
        "category": category,
        "brand": "Unknown",
        "primary_color": "Unknown",
        "material": "Unknown",
        "notable_features": distinctive_features,
        "search_keywords": search_keywords,
        "attribute_confidence": "low",
        "review_hint": review_hint,
    }


def translate_text_with_pipeline(
    text: str,
    *,
    target_language: str,
    pipeline: LostFoundPipeline,
) -> str:
    value = str(text or "").strip()
    if not value:
        return value

    for _ in range(2):
        try:
            response = pipeline.client.chat.completions.create(
                model=pipeline.config.kimi_model,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "Translate the text into the target language. "
                            "Preserve meaning and keep brand/person names unchanged. "
                            "Return plain text only."
                        ),
                    },
                    {"role": "user", "content": f"Target language: {target_language}\nText:\n{value}"},
                ],
                max_tokens=600,
                extra_body={"thinking": {"type": "disabled"}},
                timeout=20,
            )
            translated = (response.choices[0].message.content or "").strip()
            return translated or value
        except Exception:
            continue
    return value


def translate_list_with_pipeline(values: list[str], *, target_language: str, pipeline: LostFoundPipeline) -> list[str]:
    return [
        translate_text_with_pipeline(str(value or ""), target_language=target_language, pipeline=pipeline)
        for value in values
    ]


def relative_time_label(value: str | None, language: str) -> str:
    is_arabic = str(language).lower().startswith("ar")
    if not value:
        return "\u0627\u0644\u0622\u0646" if is_arabic else "Just now"
    try:
        parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except ValueError:
        return "\u0627\u0644\u0622\u0646" if is_arabic else "Just now"

    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=UTC)

    diff_minutes = int((datetime.now(UTC) - parsed.astimezone(UTC)).total_seconds() // 60)
    if diff_minutes <= 0:
        return "\u0627\u0644\u0622\u0646" if is_arabic else "Just now"
    if diff_minutes < 60:
        return (
            f"\u0642\u0628\u0644 {diff_minutes} \u062f\u0642\u064a\u0642\u0629"
            if is_arabic
            else f"{diff_minutes} minute{'s' if diff_minutes != 1 else ''} ago"
        )

    diff_hours = diff_minutes // 60
    if diff_hours < 24:
        return (
            f"\u0642\u0628\u0644 {diff_hours} \u0633\u0627\u0639\u0629"
            if is_arabic
            else f"{diff_hours} hour{'s' if diff_hours != 1 else ''} ago"
        )

    diff_days = diff_hours // 24
    return (
        f"\u0642\u0628\u0644 {diff_days} \u064a\u0648\u0645"
        if is_arabic
        else f"{diff_days} day{'s' if diff_days != 1 else ''} ago"
    )

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


@app.get("/health")
@app.get("/api/health")
def healthcheck() -> dict[str, Any]:
    return {
        "ok": True,
        "build": os.getenv("VERCEL_GIT_COMMIT_SHA", "local"),
    }


@app.post("/found/analyze")
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
    except Exception as error:
        raise HTTPException(status_code=502, detail=f"Found-item image fetch failed: {error}") from error

    analysis: dict[str, Any] | None = None
    used_fallback = False
    last_error: Exception | None = None
    for attempt in range(3):
        try:
            analysis = pipeline.analyze_found_item(image=image, user_description=payload.userDescription.strip())
            break
        except Exception as error:  # pragma: no cover - network/model failures vary
            last_error = error
            message = str(error)
            if is_transient_ai_overload_error(message):
                if attempt < 2:
                    time.sleep(0.9 * (attempt + 1))
                    continue
                analysis = build_fallback_found_analysis(payload, pipeline)
                used_fallback = True
                break
            raise HTTPException(status_code=502, detail=f"Found-item analysis failed: {error}") from error

    if analysis is None:
        raise HTTPException(status_code=502, detail=f"Found-item analysis failed: {last_error or 'Unknown error'}")

    confidence = map_confidence(analysis.get("attribute_confidence"))
    response_payload: dict[str, Any] = {
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
        "reviewHint": analysis.get("review_hint") or build_review_hint(payload.language, confidence),
    }

    if is_arabic_language(payload.language) and not used_fallback:
        response_payload["title"] = translate_text_with_pipeline(
            str(response_payload["title"]),
            target_language="arabic",
            pipeline=pipeline,
        )
        response_payload["summary"] = translate_text_with_pipeline(
            str(response_payload["summary"]),
            target_language="arabic",
            pipeline=pipeline,
        )
        response_payload["itemType"] = translate_text_with_pipeline(
            str(response_payload["itemType"]),
            target_language="arabic",
            pipeline=pipeline,
        )
        response_payload["brand"] = translate_text_with_pipeline(
            str(response_payload["brand"]),
            target_language="arabic",
            pipeline=pipeline,
        )
        response_payload["primaryColor"] = translate_text_with_pipeline(
            str(response_payload["primaryColor"]),
            target_language="arabic",
            pipeline=pipeline,
        )
        response_payload["material"] = translate_text_with_pipeline(
            str(response_payload["material"]),
            target_language="arabic",
            pipeline=pipeline,
        )
        response_payload["distinctiveFeatures"] = translate_list_with_pipeline(
            [str(item) for item in (response_payload["distinctiveFeatures"] or [])],
            target_language="arabic",
            pipeline=pipeline,
        )
        response_payload["searchKeywords"] = translate_list_with_pipeline(
            [str(item) for item in (response_payload["searchKeywords"] or [])],
            target_language="arabic",
            pipeline=pipeline,
        )
        response_payload["reviewHint"] = translate_text_with_pipeline(
            str(response_payload["reviewHint"]),
            target_language="arabic",
            pipeline=pipeline,
        )

    return response_payload


@app.post("/found/normalize")
@app.post("/api/found/normalize")
def normalize_found_post(
    payload: FoundNormalizeRequest,
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
        normalized = pipeline.build_match_normalization_from_fields(
            generated_title=payload.title,
            generated_summary=payload.summary,
            user_description=payload.description,
            public_location_label=payload.locationFound,
            category=payload.category,
            subcategory=payload.itemType,
            primary_color=payload.primaryColor,
            material=payload.material,
            brand=payload.brand,
            notable_features=[str(item) for item in payload.distinctiveFeatures],
            search_keywords=[str(item) for item in payload.searchKeywords],
        )
    except Exception as error:
        raise HTTPException(status_code=502, detail=f"Found-post normalization failed: {error}") from error

    return {
        "matchTextEn": normalized.get("match_text_en") or "",
        "matchKeywordsEn": normalized.get("match_keywords_en") or [],
        "matchLocationEn": normalized.get("match_location_en") or "",
    }


@app.post("/lost/search")
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

    original_query = payload.query.strip()
    normalized_query = pipeline.ensure_english_text(original_query, force=True).strip()
    search_inputs: list[str] = [normalized_query] if normalized_query else [original_query]
    if original_query and original_query not in search_inputs:
        search_inputs.append(original_query)
    debug_steps: list[dict[str, Any]] = []
    search_errors: list[dict[str, Any]] = []
    raw_results: list[dict[str, Any]] = []
    for query_text in search_inputs:
        try:
            result = pipeline.run_lost_item_search(
                lost_user_id=user_id,
                lost_description=query_text,
                top_k=payload.topK,
            )
            raw_results.append(result)

            if hasattr(pipeline, "get_last_search_debug") and callable(getattr(pipeline, "get_last_search_debug")):
                try:
                    debug_steps.append(
                        {
                            "query": query_text,
                            "stage": pipeline.get_last_search_debug(),
                        }
                    )
                except Exception:
                    pass
            continue
        except Exception as error:  # pragma: no cover - network/model failures vary
            search_errors.append(
                {
                    "query": query_text,
                    "error": str(error),
                    "traceback": traceback.format_exc(limit=4),
                }
            )

        # Fallback path: keep the API responsive instead of surfacing a hard 502 to mobile users.
        try:
            fallback_matches = pipeline.search_found_items(
                lost_description=query_text,
                top_k=payload.topK,
                threshold=0.35,
            )
            enriched_fallback_matches: list[dict[str, Any]] = []
            for match in fallback_matches:
                finder = {}
                try:
                    finder = pipeline.db.users.get(str(match.get("user_id") or ""), {})
                except Exception:
                    finder = {}

                fallback_item = dict(match)
                fallback_item["finder_name"] = str(finder.get("name") or fallback_item.get("user_id") or "Community member")
                fallback_item["finder_email"] = str(finder.get("email") or "")
                fallback_item["explanation"] = (
                    fallback_item.get("explanation")
                    or "Possible match found by fallback ranking. Verify distinctive details with the finder."
                )
                enriched_fallback_matches.append(fallback_item)

            raw_results.append(
                {
                    "lost_query": {
                        "id": f"fallback-{int(datetime.now(UTC).timestamp())}",
                        "user_id": user_id,
                        "description": query_text,
                        "created_at": datetime.now(UTC).isoformat(),
                    },
                    "matches": enriched_fallback_matches,
                }
            )
        except Exception as fallback_error:
            search_errors.append(
                {
                    "query": query_text,
                    "error": f"fallback_failed: {fallback_error}",
                    "traceback": traceback.format_exc(limit=4),
                }
            )

    if not raw_results:
        raw_results.append(
            {
                "lost_query": {
                    "id": f"run-{int(datetime.now(UTC).timestamp())}",
                    "user_id": user_id,
                    "description": original_query,
                    "created_at": datetime.now(UTC).isoformat(),
                },
                "matches": [],
            }
        )

    primary_result = raw_results[0] if raw_results else {"lost_query": {}}
    merged_matches_by_id: dict[str, dict[str, Any]] = {}
    for result in raw_results:
        for match in result.get("matches", []):
            match_id = str(match.get("id") or "")
            if not match_id:
                continue
            existing = merged_matches_by_id.get(match_id)
            if not existing or float(match.get("score", 0.0)) > float(existing.get("score", 0.0)):
                merged_matches_by_id[match_id] = match

    merged_ranked_matches = sorted(
        merged_matches_by_id.values(),
        key=lambda entry: float(entry.get("score", 0.0)),
        reverse=True,
    )[: payload.topK]

    debug_payload: dict[str, Any] = {
        "normalized_query": normalized_query,
        "search_inputs": search_inputs,
        "retrieved_candidate_count": len(merged_matches_by_id),
        "ranked_candidate_count": len(merged_ranked_matches),
        "top_scores": [float(item.get("score", 0.0)) for item in merged_ranked_matches[:8]],
        "per_query": debug_steps,
        "errors": search_errors,
    }

    matches: list[dict[str, Any]] = []
    for match in merged_ranked_matches:
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

    if is_arabic_language(payload.language):
        for match in matches:
            item = match["item"]
            item["title"] = translate_text_with_pipeline(
                str(item.get("title") or ""),
                target_language="arabic",
                pipeline=pipeline,
            )
            item["description"] = translate_text_with_pipeline(
                str(item.get("description") or ""),
                target_language="arabic",
                pipeline=pipeline,
            )
            item["location"] = translate_text_with_pipeline(
                str(item.get("location") or ""),
                target_language="arabic",
                pipeline=pipeline,
            )
            match["reason"] = translate_text_with_pipeline(
                str(match.get("reason") or ""),
                target_language="arabic",
                pipeline=pipeline,
            )    response_payload: dict[str, Any] = {
        "id": primary_result.get("lost_query", {}).get("id") or f"run-{int(datetime.now(UTC).timestamp())}",
        "query": original_query,
        "createdAtLabel": "\u0627\u0644\u0622\u0646" if str(payload.language).lower().startswith("ar") else "Just now",
        "matches": matches,
        "debug": debug_payload,
    }
    return response_payload
