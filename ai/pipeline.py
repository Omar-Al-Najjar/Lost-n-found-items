import base64
import hashlib
import json
import os
import re
import uuid
from dataclasses import dataclass, field
from datetime import UTC, datetime
from io import BytesIO
from pathlib import Path
from typing import Any

import numpy as np
import requests
from openai import OpenAI
from PIL import Image
try:
    from sentence_transformers import SentenceTransformer
except Exception:  # pragma: no cover - fallback path handles unavailable model/runtime
    SentenceTransformer = None  # type: ignore[assignment]

try:
    from sklearn.metrics.pairwise import cosine_similarity as sklearn_cosine_similarity
except Exception:  # pragma: no cover - fallback path handles unavailable sklearn runtime
    sklearn_cosine_similarity = None
try:
    import psycopg
    from psycopg.rows import dict_row
    from psycopg.types.json import Jsonb
except ImportError:  # pragma: no cover - handled when Supabase mode is actually used.
    psycopg = None
    dict_row = None
    Jsonb = None


FOUND_ITEM_SYSTEM_PROMPT = """You are an AI assistant for a Lost & Found application.
A user found an item and provided a photo plus a short raw description.

Return ONLY one valid JSON object with exactly these fields:
{
  "ai_description": "<2-4 sentence grounded description of only what is visible or strongly implied>",
  "item_type": "<specific item type like wallet, backpack, earbuds case, car keys, sunglasses, phone, document folder, etc.>",
  "category": "<one of: electronics | bags | documents | accessories | other>",
  "color": "<dominant color(s)>",
  "material": "<material if visible or strongly suggested, else Unknown>",
  "brand": "<brand/make if visible, else Unknown>",
  "visible_contents": ["<cards>", "<cash>", "<keys>", "..."],
  "distinctive_features": ["<zipper>", "<logo>", "<sticker>", "<keychain>", "<scratches>", "..."],
  "condition": "<New | Good | Used | Damaged | Unknown>",
  "attribute_confidence": "<High | Medium | Low>",
  "search_keywords": ["<keyword1>", "<keyword2>", "<keyword3>", "<keyword4>", "<keyword5>", "<keyword6>"]
}

Rules:
- Use the photo as the main source of truth.
- Use the user description only as supporting context.
- Never invent hidden details.
- If a field is unknown, use "Unknown".
- visible_contents and distinctive_features must be arrays.
- search_keywords must be short, lowercase-friendly retrieval terms.
- Keep ai_description factual and concise.
- Output JSON only. No markdown fences, no extra commentary.
"""

LOST_ITEM_PARSE_PROMPT = """You are helping a Lost & Found search engine.
Convert the user's lost-item description into structured JSON.

Return ONLY one valid JSON object with exactly these fields:
{
  "query_text": "<cleaned version of the user description>",
  "item_type": "<specific item type or Unknown>",
  "category": "<one of: electronics | bags | documents | accessories | other>",
  "color": "<dominant color(s) or Unknown>",
  "material": "<material or Unknown>",
  "brand": "<brand or Unknown>",
  "likely_contents": ["<cards>", "<cash>", "..."],
  "distinctive_features": ["<logo>", "<zipper>", "<engraving>", "..."],
  "location_clues": ["<university>", "<gate>", "..."],
  "time_clues": ["<this morning>", "<yesterday>", "..."],
  "search_keywords": ["<keyword1>", "<keyword2>", "<keyword3>", "<keyword4>", "<keyword5>", "<keyword6>"]
}

Rules:
- Infer cautiously.
- Do not hallucinate a brand, color, or material.
- Normalize vague descriptions into short retrieval-friendly terms.
- Treat time clues as approximate windows, not exact timestamps. A finder may discover an item much later than when it was lost.
- Arrays must always be arrays.
- Output JSON only.
"""

MATCH_EXPLANATION_PROMPT = """You are an AI assistant for a Lost & Found application.
Write a short, grounded explanation for a possible match.

Lost query:
{lost_description}

Structured lost query:
{lost_structured}

Found item record:
{found_structured}

Evidence supporting the match:
{evidence_lines}

Potential contradictions or uncertainty:
{contradiction_lines}

Ranking score: {score:.2f}
Confidence tier: {confidence_label}

Rules:
- Mention only evidence provided above.
- Be concise and honest.
- End with 1 sentence on what the owner should verify with the finder.
"""

ENGLISH_NORMALIZATION_PROMPT = """Rewrite the text into concise, retrieval-friendly English for lost-and-found matching.
Rules:
- Keep item details, places, and uncertainty words.
- If the input is already English, clean and normalize it.
- Do not invent facts.
- Return plain text only.
"""

ALLOWED_CATEGORIES = {
    "electronics",
    "bags",
    "documents",
    "accessories",
    "other",
}

CATEGORY_HINTS = {
    "bags": {"wallet", "billfold", "card holder", "cardholder", "backpack", "bag", "purse", "handbag"},
    "accessories": {"keys", "key", "keychain", "car keys", "watch", "ring", "bracelet", "necklace"},
    "electronics": {
        "airpods",
        "earbuds",
        "earbud",
        "headphones",
        "phone",
        "iphone",
        "ipad",
        "tablet",
        "laptop",
        "charger",
        "electronics",
        "sunglasses",
    },
    "documents": {"passport", "document", "id", "license", "folder", "papers", "card", "cards"},
}

CATEGORY_CONTRADICTIONS = {
    ("bags", "accessories"),
    ("bags", "electronics"),
    ("accessories", "electronics"),
    ("documents", "accessories"),
}

TIME_CLUE_GROUPS = {
    "morning": {"morning", "this morning", "today morning"},
    "afternoon": {"afternoon", "this afternoon"},
    "evening": {"evening", "this evening"},
    "night": {"night", "tonight", "late night"},
    "today": {"today"},
    "yesterday": {"yesterday"},
    "recently": {"recently", "earlier", "earlier today"},
}

TIME_UNCERTAINTY_PHRASES = {
    "i don't know when",
    "i dont know when",
    "dont know when",
    "don't know when",
    "not sure when",
    "unknown time",
    "time unknown",
    "unsure about time",
    "no idea when",
    "ما بعرف الوقت",
    "مو متاكد متى",
    "مش متاكد متى",
    "لا اعرف متى",
}

TIME_UNCERTAINTY_TOKENS = {
    "unknown",
    "unsure",
    "uncertain",
    "dont",
    "know",
    "when",
    "time",
    "timing",
    "idea",
}

ITEM_TYPE_CONTRADICTIONS = {
    ("wallet", "backpack"),
    ("wallet", "bag"),
    ("wallet", "purse"),
    ("backpack", "wallet"),
    ("bag", "wallet"),
    ("purse", "wallet"),
    ("airpods", "phone"),
    ("phone", "airpods"),
    ("keys", "wallet"),
    ("wallet", "keys"),
}

SUPABASE_PIPELINE_SCHEMA_PATH = (
    Path(__file__).resolve().parents[1]
    / "supabase"
    / "migrations"
    / "20260421_align_ai_pipeline_with_live_schema.sql"
)


@dataclass
class PipelineConfig:
    moonshot_api_key: str | None = None
    kimi_model: str = "kimi-k2.5"
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    moonshot_base_url: str = "https://api.moonshot.ai/v1"
    supabase_db_url: str | None = None
    llm_timeout_seconds: int = 10
    lightweight_embeddings: bool = False
    embedding_dim: int = 384

    @staticmethod
    def _env_bool(name: str, default: bool = False) -> bool:
        value = os.getenv(name)
        if value is None:
            return default
        return str(value).strip().lower() in {"1", "true", "yes", "on"}

    @classmethod
    def from_env(cls) -> "PipelineConfig":
        use_lightweight = cls._env_bool("LIGHTWEIGHT_EMBEDDINGS", default=bool(os.getenv("VERCEL")))
        return cls(
            moonshot_api_key=os.getenv("MOONSHOT_API_KEY"),
            kimi_model=os.getenv("KIMI_MODEL", "kimi-k2.5"),
            embedding_model=os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2"),
            moonshot_base_url=os.getenv("MOONSHOT_BASE_URL", "https://api.moonshot.ai/v1"),
            supabase_db_url=os.getenv("SUPABASE_DB_URL"),
            llm_timeout_seconds=max(4, int(os.getenv("LLM_TIMEOUT_SECONDS", "10"))),
            lightweight_embeddings=use_lightweight,
            embedding_dim=max(64, int(os.getenv("EMBEDDING_DIM", "384"))),
        )


@dataclass
class InMemoryDatabase:
    found_items: list[dict[str, Any]] = field(default_factory=list)
    lost_queries: list[dict[str, Any]] = field(default_factory=list)
    matches: list[dict[str, Any]] = field(default_factory=list)
    users: dict[str, dict[str, str]] = field(
        default_factory=lambda: {
            "user_001": {"name": "Ahmad Al-Hassan", "email": "ahmad@example.com"},
            "user_002": {"name": "Sara Khalil", "email": "sara@example.com"},
            "user_003": {"name": "Omar Nasser", "email": "omar@example.com"},
            "user_004": {"name": "Lina Mansour", "email": "lina@example.com"},
        }
    )


class SupabaseDatabase:
    def __init__(self, db_url: str, schema_path: Path | None = None):
        if psycopg is None or dict_row is None or Jsonb is None:
            raise RuntimeError(
                "psycopg is required for Supabase mode. Install ai/requirements.txt again to add it."
            )
        self.db_url = db_url
        self.schema_path = schema_path or SUPABASE_PIPELINE_SCHEMA_PATH
        self._recent_lost_queries: list[dict[str, Any]] = []
        self._recent_matches: list[dict[str, Any]] = []

    def _connect(self):
        return psycopg.connect(self.db_url, row_factory=dict_row)

    @property
    def users(self) -> dict[str, dict[str, str]]:
        with self._connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    select
                      id,
                      coalesce(nullif(trim(display_name), ''), nullif(trim(full_name), ''), email, id::text) as name,
                      email
                    from public.profiles
                    order by created_at asc, id asc
                    """
                )
                rows = cursor.fetchall()
        return {str(row["id"]): {"name": row["name"], "email": row["email"]} for row in rows}

    @property
    def found_items(self) -> list[dict[str, Any]]:
        with self._connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    select
                      id::text as id,
                      user_id::text as user_id,
                      user_description,
                      generated_title,
                      generated_summary,
                      subcategory,
                      category,
                      primary_color,
                      material,
                      brand,
                      notable_features,
                      search_keywords,
                      public_location_label,
                      posted_at,
                      found_or_lost_at,
                      status,
                      is_public,
                      is_removed
                    from public.posts
                    where type = 'found'
                      and status = 'active'
                      and is_removed = false
                    order by posted_at desc, id desc
                    """
                )
                return list(cursor.fetchall())

    @property
    def lost_queries(self) -> list[dict[str, Any]]:
        return list(self._recent_lost_queries)

    @property
    def matches(self) -> list[dict[str, Any]]:
        return list(self._recent_matches)

    def _guess_city_slug(self, payload: dict[str, Any]) -> str:
        location = str(payload.get("public_location_label") or "").strip()
        slug = re.sub(r"[^a-z0-9]+", "-", str(location or "").lower()).strip("-")
        return slug or "amman"

    def insert_found_item(self, record: dict[str, Any]) -> dict[str, Any]:
        payload = dict(record)
        with self._connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    insert into public.posts (
                      id,
                      user_id,
                      type,
                      status,
                      country_code,
                      city_slug,
                      public_location_label,
                      user_description,
                      generated_title,
                      generated_summary,
                      subcategory,
                      category,
                      primary_color,
                      material,
                      brand,
                      notable_features,
                      search_keywords,
                      found_or_lost_at,
                      is_public,
                      is_removed
                    )
                    values (
                      %(id)s,
                      %(user_id)s,
                      'found',
                      'active',
                      %(country_code)s,
                      %(city_slug)s,
                      %(public_location_label)s,
                      %(user_description)s,
                      %(generated_title)s,
                      %(generated_summary)s,
                      %(subcategory)s,
                      %(category)s,
                      %(primary_color)s,
                      %(material)s,
                      %(brand)s,
                      %(notable_features)s,
                      %(search_keywords)s,
                      %(found_or_lost_at)s,
                      true,
                      false
                    )
                    returning *
                    """,
                    {
    **payload,
    "notable_features": [str(x) for x in (payload.get("notable_features") or [])],
    "search_keywords": [str(x) for x in (payload.get("search_keywords") or [])],
    "country_code": "JO",
    "city_slug": self._guess_city_slug(payload),
    "found_or_lost_at": payload.get("date_found"),
},
                )
                row = cursor.fetchone()
            connection.commit()
        return dict(row)

    def insert_lost_query(self, record: dict[str, Any]) -> dict[str, Any]:
        self._recent_lost_queries.append(dict(record))
        return dict(record)

    def insert_match(self, record: dict[str, Any]) -> dict[str, Any]:
        self._recent_matches.append(dict(record))
        return dict(record)


class LostFoundPipeline:
    def __init__(
        self,
        config: PipelineConfig | None = None,
        database: InMemoryDatabase | SupabaseDatabase | None = None,
    ):
        self.config = config or PipelineConfig.from_env()
        self.db = database or (
            SupabaseDatabase(self.config.supabase_db_url)
            if self.config.supabase_db_url
            else InMemoryDatabase()
        )
        self._client: OpenAI | None = None
        self._embedder: SentenceTransformer | None = None
        self._last_search_debug: dict[str, Any] = {}
        self._use_lightweight_embeddings = bool(self.config.lightweight_embeddings)
        self._embedding_dim = int(self.config.embedding_dim)

    @staticmethod
    def _safe_lower(value: Any) -> str:
        return str(value or "").lower()

    @property
    def client(self) -> OpenAI:
        if not self.config.moonshot_api_key:
            raise RuntimeError("Missing MOONSHOT_API_KEY in environment.")
        if self._client is None:
            self._client = OpenAI(
                api_key=self.config.moonshot_api_key,
                base_url=self.config.moonshot_base_url,
            )
        return self._client

    @property
    def embedder(self) -> SentenceTransformer:
        if SentenceTransformer is None:
            raise RuntimeError("sentence-transformers runtime unavailable")
        if self._embedder is None:
            self._embedder = SentenceTransformer(self.config.embedding_model)
        return self._embedder

    def _lightweight_embed(self, text: str) -> list[float]:
        dim = max(64, int(self._embedding_dim))
        vector = np.zeros(dim, dtype=np.float32)
        tokens = self.tokenize(text)
        if not tokens:
            return vector.tolist()

        for token in tokens:
            digest = hashlib.md5(token.encode("utf-8")).hexdigest()
            index = int(digest[:8], 16) % dim
            sign = -1.0 if (int(digest[8:10], 16) % 2) else 1.0
            vector[index] += sign

        norm = float(np.linalg.norm(vector))
        if norm > 0:
            vector = vector / norm
        return vector.tolist()

    def _is_valid_embedding(self, value: Any) -> bool:
        if not isinstance(value, (list, tuple)):
            return False
        if len(value) < 8:
            return False
        try:
            _ = [float(item) for item in value]
        except Exception:
            return False
        return True

    def embed(self, text: str) -> list[float]:
        value = str(text or "").strip()
        if not value:
            return [0.0] * max(64, int(self._embedding_dim))
        if self._use_lightweight_embeddings:
            return self._lightweight_embed(value)
        try:
            return self.embedder.encode(value, normalize_embeddings=True).tolist()
        except Exception:
            self._use_lightweight_embeddings = True
            return self._lightweight_embed(value)

    def load_image_from_url(self, url: str) -> Image.Image:
        headers = {
            "User-Agent": "Mozilla/5.0",
            "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        }
        response = requests.get(url, headers=headers, timeout=20)
        response.raise_for_status()
        return Image.open(BytesIO(response.content)).convert("RGB")

    def load_image_from_path(self, path: str) -> Image.Image:
        return Image.open(path).convert("RGB")

    def pil_to_base64(self, image: Image.Image, image_format: str = "JPEG") -> str:
        buffer = BytesIO()
        fmt = (image_format or "JPEG").upper()
        if fmt == "JPG":
            fmt = "JPEG"
        image.save(buffer, format=fmt)
        mime = "image/jpeg" if fmt == "JPEG" else f"image/{fmt.lower()}"
        b64 = base64.b64encode(buffer.getvalue()).decode("utf-8")
        return f"data:{mime};base64,{b64}"

    def ensure_list(self, value: Any) -> list[str]:
        if value is None:
            return []
        if isinstance(value, list):
            return [str(item).strip() for item in value if str(item).strip() and str(item).strip().lower() != "unknown"]
        if isinstance(value, str):
            parts = [item.strip() for item in re.split(r"[,;\n]+", value) if item.strip()]
            return [item for item in parts if item.lower() != "unknown"]
        return [str(value).strip()]

    def normalize_token(self, text: str) -> str:
        return re.sub(r"[^a-z0-9]+", " ", str(text).lower()).strip()

    def tokenize(self, text: str) -> list[str]:
        return [token for token in self.normalize_token(text).split() if token]

    def infer_category(self, item_type: str = "Unknown", raw_category: str = "other", text: str = "") -> str:
        tokens = set(self.tokenize(" ".join([item_type or "", raw_category or "", text or ""])))
        for category, hints in CATEGORY_HINTS.items():
            if tokens & set(self.tokenize(" ".join(hints))):
                return category
        normalized_raw = self.normalize_token(raw_category or "other")
        if normalized_raw in {"bag wallet", "bag", "wallet", "bags"}:
            return "bags"
        if normalized_raw in {"keys", "key", "accessories", "accessory", "jewellery", "jewelry"}:
            return "accessories"
        if normalized_raw in {"documents", "document"}:
            return "documents"
        if normalized_raw in {"electronics", "electronic"}:
            return "electronics"
        return normalized_raw if normalized_raw in ALLOWED_CATEGORIES else "other"

    def build_generated_title(self, normalized: dict[str, Any]) -> str:
        parts = [
            normalized.get("primary_color") if normalized.get("primary_color") != "Unknown" else "",
            normalized.get("brand") if normalized.get("brand") != "Unknown" else "",
            normalized.get("subcategory") if normalized.get("subcategory") != "Unknown" else "",
        ]
        title = " ".join(str(part).strip() for part in parts if str(part).strip())
        return title.title() if title else "Found item"

    def expand_search_keywords(self, payload: dict[str, Any]) -> list[str]:
        base: list[Any] = []
        for key in [
            "subcategory",
            "category",
            "primary_color",
            "material",
            "brand",
            "visible_contents",
            "likely_contents",
            "notable_features",
            "location_clues",
            "search_keywords",
        ]:
            value = payload.get(key)
            if isinstance(value, list):
                base.extend(value)
            else:
                base.append(value)

        text = " ".join(str(value) for value in base if value)
        tokens = self.tokenize(text)
        synonyms: list[str] = []
        joined = " ".join(tokens)

        if "wallet" in joined:
            synonyms += ["billfold", "card holder", "cardholder"]
        if "airpods" in joined or "earbuds" in joined:
            synonyms += ["earbuds", "earbud case", "airpods case", "wireless earbuds"]
        if "keys" in joined:
            synonyms += ["keychain", "car keys"]
        if "backpack" in joined:
            synonyms += ["bag", "school bag"]
        if "sunglasses" in joined:
            synonyms += ["glasses", "shades"]

        combined = tokens + self.tokenize(" ".join(synonyms))
        unique: list[str] = []
        for token in combined:
            if token not in unique and token not in {"unknown", "other"}:
                unique.append(token)
        return unique[:18]

    def map_found_result_to_app_fields(self, ai_result: dict[str, Any]) -> dict[str, Any]:
        ai_result = ai_result or {}
        subcategory = str(ai_result.get("item_type") or ai_result.get("type") or "Unknown").strip() or "Unknown"
        category = self.infer_category(
            item_type=subcategory,
            raw_category=str(ai_result.get("category", "other")),
            text=json.dumps(ai_result, ensure_ascii=False),
        )
        primary_color = str(ai_result.get("color", "Unknown")).strip() or "Unknown"
        material = str(ai_result.get("material", "Unknown")).strip() or "Unknown"
        brand = str(ai_result.get("brand", "Unknown")).strip() or "Unknown"
        condition_text = str(ai_result.get("condition", "Unknown")).strip() or "Unknown"
        attribute_confidence = str(ai_result.get("attribute_confidence", "Unknown")).strip() or "Unknown"

        visible_contents = self.ensure_list(ai_result.get("visible_contents"))
        notable_features = self.ensure_list(
            ai_result.get("distinctive_features") or ai_result.get("notable_features") or ai_result.get("features")
        )
        search_keywords = self.ensure_list(ai_result.get("search_keywords"))

        generated_summary = ai_result.get("ai_description") or ai_result.get("generated_summary")
        if not generated_summary:
            parts = [primary_color, material, brand if brand != "Unknown" else "", subcategory, category, condition_text]
            parts = [str(part).strip() for part in parts if str(part).strip() and str(part).strip() != "Unknown"]
            generated_summary = " ".join(parts).strip() or "Found item"
            if notable_features:
                generated_summary += ". Distinctive features: " + ", ".join(notable_features[:5])

        normalized = {
            "generated_summary": str(generated_summary).strip(),
            "subcategory": subcategory,
            "category": category,
            "primary_color": primary_color,
            "material": material,
            "brand": brand,
            "visible_contents": visible_contents,
            "notable_features": notable_features,
            "condition_text": condition_text,
            "attribute_confidence": attribute_confidence,
            "search_keywords": self.expand_search_keywords(
                {
                    "subcategory": subcategory,
                    "category": category,
                    "primary_color": primary_color,
                    "material": material,
                    "brand": brand,
                    "visible_contents": visible_contents,
                    "notable_features": notable_features,
                    "search_keywords": search_keywords,
                }
            ),
        }
        normalized["generated_title"] = self.build_generated_title(normalized)
        return normalized

    def normalize_ai_result(self, ai_result: dict[str, Any]) -> dict[str, Any]:
        return self.map_found_result_to_app_fields(ai_result)

    def normalize_found_item_for_matching(self, item: dict[str, Any]) -> dict[str, Any]:
        """Compatibility helper for Streamlit all-scores diagnostics."""
        item = item or {}
        subcategory = str(item.get("subcategory") or item.get("item_type") or "Unknown").strip() or "Unknown"
        category = self.infer_category(
            item_type=subcategory,
            raw_category=str(item.get("category") or "other"),
            text=" ".join(
                [
                    str(item.get("generated_title") or ""),
                    str(item.get("generated_summary") or item.get("user_description") or ""),
                ]
            ),
        )
        primary_color = str(item.get("primary_color") or item.get("color") or "Unknown").strip() or "Unknown"
        material = str(item.get("material") or "Unknown").strip() or "Unknown"
        brand = str(item.get("brand") or "Unknown").strip() or "Unknown"
        visible_contents = self.ensure_list(item.get("visible_contents"))
        notable_features = self.ensure_list(item.get("notable_features") or item.get("distinctive_features"))
        search_keywords = self.ensure_list(item.get("search_keywords"))
        if not search_keywords:
            search_keywords = self.expand_search_keywords(
                {
                    "subcategory": subcategory,
                    "category": category,
                    "primary_color": primary_color,
                    "material": material,
                    "brand": brand,
                    "visible_contents": visible_contents,
                    "notable_features": notable_features,
                }
            )

        return {
            "generated_title": str(item.get("generated_title") or self.build_generated_title(
                {"subcategory": subcategory, "primary_color": primary_color, "brand": brand}
            )),
            "generated_summary": str(item.get("generated_summary") or item.get("user_description") or "Found item").strip(),
            "subcategory": subcategory,
            "category": category,
            "primary_color": primary_color,
            "material": material,
            "brand": brand,
            "visible_contents": visible_contents,
            "notable_features": notable_features,
            "search_keywords": search_keywords,
            "public_location_label": str(item.get("public_location_label") or item.get("location_found") or "Unknown"),
        }

    def build_found_embed_text(self, normalized: dict[str, Any], user_description: str, location_found: str) -> str:
        return " ".join(
            [
                normalized["generated_summary"],
                normalized["generated_title"],
                normalized["subcategory"],
                normalized["category"],
                normalized["primary_color"],
                normalized["material"],
                normalized["brand"],
                " ".join(self.ensure_list(normalized["visible_contents"])),
                " ".join(self.ensure_list(normalized["notable_features"])),
                str(user_description),
                str(location_found),
            ]
        ).strip()

    def build_lost_embed_text(self, parsed_lost: dict[str, Any], raw_description: str) -> str:
        query_text = self._strip_time_uncertainty_text(parsed_lost.get("query_text", raw_description))
        return " ".join(
            [
                query_text,
                parsed_lost.get("subcategory", parsed_lost.get("item_type", "")),
                parsed_lost.get("category", ""),
                parsed_lost.get("primary_color", parsed_lost.get("color", "")),
                parsed_lost.get("material", ""),
                parsed_lost.get("brand", ""),
                " ".join(self.ensure_list(parsed_lost.get("likely_contents"))),
                " ".join(self.ensure_list(parsed_lost.get("notable_features", parsed_lost.get("distinctive_features")))),
                " ".join(self.ensure_list(parsed_lost.get("location_clues"))),
            ]
        ).strip()

    def _strip_time_uncertainty_text(self, text: str) -> str:
        value = str(text or "")
        lowered = self._safe_lower(value)
        cleaned = lowered
        for phrase in TIME_UNCERTAINTY_PHRASES:
            cleaned = cleaned.replace(phrase, " ")
        cleaned = re.sub(r"\s+", " ", cleaned).strip()
        return cleaned or lowered.strip() or value.strip()

    def _extract_json_object(self, text: str) -> dict[str, Any]:
        text = (text or "").strip()
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            match = re.search(r"\{.*\}", text, flags=re.DOTALL)
            if match:
                return json.loads(match.group(0))
            raise

    def ensure_english_text(self, text: str, force: bool = False) -> str:
        value = str(text or "").strip()
        if not value:
            return ""
        if not force and re.fullmatch(r"[A-Za-z0-9\s.,;:'\"!?()\-\[\]/@#&+_*%]+", value):
            return value
        try:
            response = self.client.chat.completions.create(
                model=self.config.kimi_model,
                messages=[
                    {"role": "system", "content": ENGLISH_NORMALIZATION_PROMPT},
                    {"role": "user", "content": value},
                ],
                max_tokens=280,
                extra_body={"thinking": {"type": "disabled"}},
                timeout=self.config.llm_timeout_seconds,
            )
            normalized = str(response.choices[0].message.content or "").strip()
            return normalized or value
        except Exception:
            return value

    def translate_to_english_text(self, text: str, *, force: bool = False) -> str:
        return self.ensure_english_text(text, force=force)

    def build_match_normalization_from_fields(
        self,
        *,
        generated_title: str = "",
        generated_summary: str = "",
        user_description: str = "",
        public_location_label: str = "",
        category: str = "",
        subcategory: str = "",
        primary_color: str = "",
        material: str = "",
        brand: str = "",
        notable_features: list[str] | None = None,
        search_keywords: list[str] | None = None,
    ) -> dict[str, Any]:
        features = [str(item).strip() for item in (notable_features or []) if str(item).strip()]
        keywords = [str(item).strip() for item in (search_keywords or []) if str(item).strip()]

        normalized_title = self.ensure_english_text(str(generated_title or ""), force=True)
        normalized_summary = self.ensure_english_text(str(generated_summary or ""), force=True)
        normalized_user_description = self.ensure_english_text(str(user_description or ""), force=True)
        normalized_location = self.ensure_english_text(str(public_location_label or ""), force=True)
        normalized_category = self._safe_lower(self.ensure_english_text(str(category or ""), force=False))
        normalized_subcategory = self._safe_lower(self.ensure_english_text(str(subcategory or ""), force=False))
        normalized_color = self._safe_lower(self.ensure_english_text(str(primary_color or ""), force=False))
        normalized_material = self._safe_lower(self.ensure_english_text(str(material or ""), force=False))
        normalized_brand = self.ensure_english_text(str(brand or ""), force=False)
        normalized_features = [self.ensure_english_text(value, force=True) for value in features]
        normalized_keywords = [self.ensure_english_text(value, force=True) for value in keywords]

        match_text_en_parts = [
            normalized_title,
            normalized_summary,
            normalized_user_description,
            normalized_subcategory,
            normalized_category,
            normalized_color,
            normalized_material,
            normalized_brand,
            " ".join(normalized_features),
        ]
        match_text_en = " ".join(part.strip() for part in match_text_en_parts if part and part.strip()).strip()

        keyword_payload = {
            "subcategory": normalized_subcategory or subcategory or "Unknown",
            "category": normalized_category or category or "other",
            "primary_color": normalized_color or primary_color or "Unknown",
            "material": normalized_material or material or "Unknown",
            "brand": normalized_brand or brand or "Unknown",
            "notable_features": normalized_features,
            "search_keywords": normalized_keywords,
        }
        expanded = self.expand_search_keywords(keyword_payload)
        match_keywords_en = [token for token in expanded if token]

        return {
            "match_text_en": match_text_en,
            "match_keywords_en": match_keywords_en,
            "match_location_en": normalized_location or public_location_label or "",
        }

    def get_last_search_debug(self) -> dict[str, Any]:
        return dict(self._last_search_debug)

    def _fallback_parse_lost_item_description(self, lost_description: str) -> dict[str, Any]:
        text = (lost_description or "").strip()
        low = self._safe_lower(text)

        item_type = "Unknown"
        if "wallet" in low:
            item_type = "wallet"
        elif "backpack" in low or "bag" in low:
            item_type = "backpack" if "backpack" in low else "bag"
        elif "airpods" in low or "earbuds" in low:
            item_type = "earbuds case" if "case" in low else "earbuds"
        elif "keys" in low or "keychain" in low:
            item_type = "keys"
        elif "sunglasses" in low or "glasses" in low:
            item_type = "sunglasses"
        elif "phone" in low or "iphone" in low:
            item_type = "phone"

        color = "Unknown"
        for candidate in ["black", "brown", "white", "silver", "gold", "blue", "red", "green", "pink", "gray", "grey", "yellow"]:
            if candidate in low:
                color = candidate
                break

        material = "Unknown"
        for candidate in ["leather", "metal", "plastic", "fabric", "canvas"]:
            if candidate in low:
                material = candidate
                break

        brand = "Unknown"
        for candidate in ["apple", "samsung", "nike", "adidas", "ray-ban", "rayban"]:
            if candidate in low:
                brand = candidate
                break

        category = self.infer_category(item_type=item_type, raw_category="other", text=text)

        likely_contents = [item for item in ["cards", "cash", "id", "id cards", "license"] if item in low]
        distinctive_features = [item for item in ["zipper", "logo", "sticker", "engraving", "keychain"] if item in low]
        location_clues = [item for item in ["university", "gate", "park", "mall", "entrance", "library"] if item in low]
        time_clues = [item for item in ["this morning", "morning", "today", "yesterday", "afternoon", "evening"] if item in low]

        keywords = list(
            dict.fromkeys(
                [item_type, self._safe_lower(category), color, material, brand]
                + likely_contents
                + distinctive_features
                + location_clues
            )
        )
        keywords = [item for item in keywords if item and item != "Unknown"]

        return {
            "query_text": text,
            "item_type": item_type,
            "subcategory": item_type,
            "category": category,
            "color": color,
            "primary_color": color,
            "material": material,
            "brand": brand,
            "likely_contents": likely_contents,
            "distinctive_features": distinctive_features,
            "notable_features": distinctive_features,
            "location_clues": location_clues,
            "time_clues": time_clues,
            "search_keywords": keywords[:8],
        }

    def map_lost_query_to_app_fields(self, parsed: dict[str, Any], fallback: dict[str, Any], lost_description: str) -> dict[str, Any]:
        subcategory = str(parsed.get("item_type") or parsed.get("subcategory") or fallback["subcategory"]).strip() or "Unknown"
        primary_color = str(parsed.get("color") or parsed.get("primary_color") or fallback["primary_color"]).strip() or "Unknown"
        notable_features = self.ensure_list(
            parsed.get("distinctive_features")
            or parsed.get("notable_features")
            or fallback["notable_features"]
        )

        normalized = {
            "query_text": str(parsed.get("query_text") or fallback["query_text"]).strip(),
            "item_type": subcategory,
            "subcategory": subcategory,
            "category": self.infer_category(
                item_type=subcategory,
                raw_category=str(parsed.get("category") or fallback["category"]),
                text=lost_description,
            ),
            "color": primary_color,
            "primary_color": primary_color,
            "material": str(parsed.get("material") or fallback["material"]).strip() or "Unknown",
            "brand": str(parsed.get("brand") or fallback["brand"]).strip() or "Unknown",
            "likely_contents": self.ensure_list(parsed.get("likely_contents") or fallback["likely_contents"]),
            "distinctive_features": notable_features,
            "notable_features": notable_features,
            "location_clues": self.ensure_list(parsed.get("location_clues") or fallback["location_clues"]),
            "time_clues": self.ensure_list(parsed.get("time_clues") or fallback["time_clues"]),
            "search_keywords": self.ensure_list(parsed.get("search_keywords") or fallback["search_keywords"]),
        }
        normalized["search_keywords"] = [
            token for token in self.expand_search_keywords(normalized)
            if token not in TIME_UNCERTAINTY_TOKENS
        ]
        return normalized

    def analyze_found_item(self, image: Image.Image, user_description: str) -> dict[str, Any]:
        image_data_uri = self.pil_to_base64(image)
        response = self.client.chat.completions.create(
            model=self.config.kimi_model,
            messages=[
                {"role": "system", "content": FOUND_ITEM_SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": [
                        {"type": "image_url", "image_url": {"url": image_data_uri}},
                        {
                            "type": "text",
                            "text": f"Finder description: {user_description}\n\nAnalyze the image and return only the JSON object.",
                        },
                    ],
                },
            ],
            response_format={"type": "json_object"},
            max_tokens=1000,
            extra_body={"thinking": {"type": "disabled"}},
            timeout=max(self.config.llm_timeout_seconds, 18),
        )
        content = response.choices[0].message.content
        return self.normalize_ai_result(self._extract_json_object(content))

    def parse_lost_item_description(self, lost_description: str) -> dict[str, Any]:
        try:
            response = self.client.chat.completions.create(
                model=self.config.kimi_model,
                messages=[
                    {"role": "system", "content": LOST_ITEM_PARSE_PROMPT},
                    {"role": "user", "content": lost_description},
                ],
                response_format={"type": "json_object"},
                max_tokens=700,
                extra_body={"thinking": {"type": "disabled"}},
                timeout=self.config.llm_timeout_seconds,
            )
            parsed = self._extract_json_object(response.choices[0].message.content)
        except Exception:
            parsed = self._fallback_parse_lost_item_description(lost_description)

        fallback = self._fallback_parse_lost_item_description(lost_description)
        return self.map_lost_query_to_app_fields(parsed, fallback, lost_description)

    def save_found_item(
        self,
        user_id: str,
        user_description: str,
        ai_result: dict[str, Any],
        location_found: str = "Unknown",
    ) -> dict[str, Any]:
        normalized = self.normalize_ai_result(ai_result)
        embed_text = self.build_found_embed_text(normalized, user_description, location_found)
        record_id = str(uuid.uuid4()) if isinstance(self.db, SupabaseDatabase) else str(uuid.uuid4())[:8]
        record = {
            "id": record_id,
            "user_id": user_id,
            "user_description": user_description,
            "generated_title": normalized["generated_title"],
            "generated_summary": normalized["generated_summary"],
            "subcategory": normalized["subcategory"],
            "category": normalized["category"],
            "primary_color": normalized["primary_color"],
            "material": normalized["material"],
            "brand": normalized["brand"],
            "visible_contents": normalized["visible_contents"],
            "notable_features": normalized["notable_features"],
            "condition_text": normalized["condition_text"],
            "attribute_confidence": normalized["attribute_confidence"],
            "search_keywords": normalized["search_keywords"],
            "public_location_label": location_found,
            "date_found": datetime.now(UTC).isoformat(),
            "status": "available",
            "embed_text": embed_text,
            "embedding": self.embed(embed_text),
            "raw_ai_result": dict(ai_result or {}),
        }
        if hasattr(self.db, "insert_found_item"):
            return self.db.insert_found_item(record)

        self.db.found_items.append(record)
        return record

    def overlap_score(self, left: list[str], right: list[str]) -> float:
        left_values = self.ensure_list(left)
        right_values = self.ensure_list(right)
        left_set = set(self.tokenize(" ".join(left_values)))
        right_set = set(self.tokenize(" ".join(right_values)))
        if not left_set or not right_set:
            return 0.0
        return len(left_set & right_set) / len(left_set | right_set)

    def cosine_similarity_score(self, left: list[float], right: list[float]) -> float:
        left_vec = np.array(left).reshape(1, -1)
        right_vec = np.array(right).reshape(1, -1)
        if sklearn_cosine_similarity is not None:
            return float(sklearn_cosine_similarity(left_vec, right_vec)[0][0])
        denom = float(np.linalg.norm(left_vec[0]) * np.linalg.norm(right_vec[0]))
        if denom <= 1e-12:
            return 0.0
        return float(np.dot(left_vec[0], right_vec[0]) / denom)

    def normalize_time_clues(self, clues: list[str]) -> list[str]:
        normalized: list[str] = []
        for clue in clues:
            low = self._safe_lower(str(clue or "").strip())
            if not low:
                continue
            if any(phrase in low for phrase in TIME_UNCERTAINTY_PHRASES):
                continue
            matched_group = None
            for group, variants in TIME_CLUE_GROUPS.items():
                if low in variants or low == group:
                    matched_group = group
                    break
            normalized.append(matched_group or low)
        return list(dict.fromkeys(normalized))

    def infer_found_time_clues(self, item: dict[str, Any]) -> list[str]:
        text = " ".join(
            [
                str(item.get("user_description") or ""),
                str(item.get("generated_summary") or ""),
            ]
        )
        text = self._safe_lower(text)
        clues: list[str] = []

        for group, variants in TIME_CLUE_GROUPS.items():
            if any(variant in text for variant in variants):
                clues.append(group)

        timestamp_value = item.get("found_or_lost_at") or item.get("date_found") or item.get("posted_at")
        if timestamp_value:
            try:
                timestamp = datetime.fromisoformat(str(timestamp_value).replace("Z", "+00:00"))
                hour = timestamp.hour
                if 5 <= hour < 12:
                    clues.append("morning")
                elif 12 <= hour < 17:
                    clues.append("afternoon")
                elif 17 <= hour < 22:
                    clues.append("evening")
                else:
                    clues.append("night")
            except ValueError:
                pass

        return list(dict.fromkeys(clues))

    def text_match(self, left: str, right: str) -> bool:
        left_tokens = set(self.tokenize(left))
        right_tokens = set(self.tokenize(right))
        return bool(left_tokens and right_tokens and (left_tokens & right_tokens))

    def score_candidate(self, parsed_lost: dict[str, Any], item: dict[str, Any], semantic_score: float) -> dict[str, Any]:
        parsed_lost = dict(parsed_lost or {})
        item = dict(item or {})
        evidence: list[str] = []
        contradictions: list[str] = []
        bonus = 0.0
        penalty = 0.0

        lost_type = str(parsed_lost.get("subcategory") or parsed_lost.get("item_type") or "").lower().strip()
        found_type = str(item.get("subcategory") or item.get("item_type") or "").lower().strip()

        if self.text_match(lost_type, found_type):
            bonus += 0.22
            evidence.append(
                f"subcategory aligns ({parsed_lost.get('subcategory', parsed_lost.get('item_type'))} <-> {item.get('subcategory', item.get('item_type'))})"
            )
        elif lost_type not in {"", "unknown"} and found_type not in {"", "unknown"}:
            is_type_contradiction = (lost_type, found_type) in ITEM_TYPE_CONTRADICTIONS or (found_type, lost_type) in ITEM_TYPE_CONTRADICTIONS
            if is_type_contradiction:
                penalty += 0.43
                contradictions.append(f"subcategory contradiction ({lost_type} vs {found_type})")
            else:
                penalty += 0.28
                contradictions.append(
                    f"subcategory differs ({parsed_lost.get('subcategory', parsed_lost.get('item_type'))} vs {item.get('subcategory', item.get('item_type'))})"
                )

        lost_category = parsed_lost.get("category")
        found_category = item.get("category")
        if lost_category == found_category and lost_category != "other":
            bonus += 0.15
            evidence.append(f"category matches ({found_category})")
        elif (lost_category, found_category) in CATEGORY_CONTRADICTIONS or (found_category, lost_category) in CATEGORY_CONTRADICTIONS:
            penalty += 0.35
            contradictions.append(f"category conflict ({lost_category} vs {found_category})")
        elif lost_category != found_category and lost_category not in {"other", None} and found_category not in {"other", None}:
            penalty += 0.10
            contradictions.append(f"category mismatch ({lost_category} vs {found_category})")

        lost_primary_color = str(parsed_lost.get("primary_color") or "")
        found_primary_color = str(item.get("primary_color") or "")
        if lost_primary_color not in {"", "Unknown"} and found_primary_color not in {"", "Unknown"}:
            if self.text_match(lost_primary_color, found_primary_color):
                bonus += 0.12
                evidence.append(f"primary color aligns ({parsed_lost.get('primary_color')} <-> {item.get('primary_color')})")
            else:
                penalty += 0.10
                contradictions.append(f"primary color mismatch ({parsed_lost.get('primary_color')} vs {item.get('primary_color')})")

        lost_material = str(parsed_lost.get("material") or "")
        found_material = str(item.get("material") or "")
        if lost_material not in {"", "Unknown"} and found_material not in {"", "Unknown"}:
            if self.text_match(lost_material, found_material):
                bonus += 0.10
                evidence.append(f"material aligns ({parsed_lost.get('material')} <-> {item.get('material')})")
            else:
                penalty += 0.06
                contradictions.append(f"material mismatch ({parsed_lost.get('material')} vs {item.get('material')})")

        lost_brand = str(parsed_lost.get("brand") or "")
        found_brand = str(item.get("brand") or "")
        if lost_brand not in {"", "Unknown"} and found_brand not in {"", "Unknown"}:
            if self.text_match(lost_brand, found_brand):
                bonus += 0.18
                evidence.append(f"brand aligns ({lost_brand} <-> {found_brand})")
            else:
                penalty += 0.22
                contradictions.append(f"brand mismatch ({lost_brand} vs {found_brand})")

        feature_overlap = self.overlap_score(parsed_lost.get("notable_features", []), item.get("notable_features", []))
        contents_overlap = self.overlap_score(parsed_lost.get("likely_contents", []), item.get("visible_contents", []))
        keyword_overlap = self.overlap_score(parsed_lost.get("search_keywords", []), item.get("search_keywords", []))
        location_overlap = self.overlap_score(parsed_lost.get("location_clues", []), self.tokenize(item.get("public_location_label", "")))
        lost_time_clues = self.normalize_time_clues(self.ensure_list(parsed_lost.get("time_clues")))
        found_time_clues = self.infer_found_time_clues(item)
        time_overlap = self.overlap_score(lost_time_clues, found_time_clues)

        if feature_overlap > 0:
            bonus += min(0.14, feature_overlap * 0.20)
            evidence.append("distinctive features overlap")
        if contents_overlap > 0:
            bonus += min(0.10, contents_overlap * 0.18)
            evidence.append("contents/details overlap")
        if keyword_overlap > 0:
            bonus += min(0.08, keyword_overlap * 0.12)
            evidence.append("retrieval keywords overlap")
        if location_overlap > 0:
            bonus += min(0.05, location_overlap * 0.08)
            evidence.append("location context overlaps")
        if time_overlap > 0:
            bonus += min(0.04, time_overlap * 0.06)
            evidence.append("time window is broadly compatible")

        final_score = max(0.0, min(1.0, 0.50 * semantic_score + bonus - penalty))
        attribute_hits = len(evidence)
        if final_score >= 0.75 and not contradictions:
            confidence = "High"
        elif final_score >= 0.60 and attribute_hits >= 3:
            confidence = "Medium"
        else:
            confidence = "Low"

        return {
            "semantic_score": float(semantic_score),
            "final_score": float(final_score),
            "confidence_label": confidence,
            "evidence": evidence,
            "contradictions": contradictions,
            "keyword_overlap": keyword_overlap,
        }

    def search_found_items(self, lost_description: str, top_k: int = 3, threshold: float = 0.55) -> list[dict[str, Any]]:
        valid_items: list[dict[str, Any]] = []
        for item in self.db.found_items:
            item_status = str(item.get("status") or "").lower()
            if item_status not in {"available", "active"}:
                continue

            enriched_item = dict(item)
            if not self._is_valid_embedding(enriched_item.get("embedding")):
                enriched_item["embed_text"] = self.build_found_embed_text(
                    {
                        "generated_summary": enriched_item.get("generated_summary") or enriched_item.get("user_description") or "Found item",
                        "generated_title": enriched_item.get("generated_title") or "Found item",
                        "subcategory": enriched_item.get("subcategory") or "Unknown",
                        "category": enriched_item.get("category") or "other",
                        "primary_color": enriched_item.get("primary_color") or "Unknown",
                        "material": enriched_item.get("material") or "Unknown",
                        "brand": enriched_item.get("brand") or "Unknown",
                        "visible_contents": enriched_item.get("visible_contents") or [],
                        "notable_features": enriched_item.get("notable_features") or [],
                    },
                    enriched_item.get("user_description", ""),
                    enriched_item.get("public_location_label", "Unknown"),
                )
                enriched_item["embedding"] = self.embed(enriched_item["embed_text"])

            valid_items.append(enriched_item)

        if not valid_items:
            return []

        parsed_lost = self.parse_lost_item_description(lost_description)
        query_text = self.build_lost_embed_text(parsed_lost, lost_description)
        query_vector = np.array(self.embed(query_text)).reshape(1, -1)
        item_vectors = np.array([item["embedding"] for item in valid_items])
        if sklearn_cosine_similarity is not None:
            semantic_scores = sklearn_cosine_similarity(query_vector, item_vectors)[0]
        else:
            query = query_vector[0]
            query_norm = float(np.linalg.norm(query))
            item_norms = np.linalg.norm(item_vectors, axis=1)
            denom = (item_norms * query_norm) + 1e-12
            semantic_scores = np.dot(item_vectors, query) / denom
        lost_category = parsed_lost.get("category")
        self._last_search_debug = {
            "threshold": float(threshold),
            "query_text": query_text,
            "candidate_count": len(valid_items),
            "semantic_scores": [float(score) for score in semantic_scores[:20]],
        }

        ranked_results: list[dict[str, Any]] = []
        for item, semantic_score in zip(valid_items, semantic_scores):
            if semantic_score < 0.30:
                continue

            found_category = item.get("category")
            if (lost_category, found_category) in CATEGORY_CONTRADICTIONS or (found_category, lost_category) in CATEGORY_CONTRADICTIONS:
                continue

            try:
                scored = self.score_candidate(parsed_lost, item, float(semantic_score))
            except Exception as error:
                self._last_search_debug.setdefault("candidate_errors", []).append(
                    {
                        "item_id": str(item.get("id") or ""),
                        "error": str(error),
                    }
                )
                continue
            if scored["final_score"] < threshold:
                continue

            result = dict(item)
            result.update(
                {
                    "score": scored["final_score"],
                    "semantic_score": scored["semantic_score"],
                    "confidence_label": scored["confidence_label"],
                    "evidence": scored["evidence"],
                    "contradictions": scored["contradictions"],
                    "keyword_overlap": scored["keyword_overlap"],
                    "lost_structured": parsed_lost,
                }
            )
            ranked_results.append(result)

        ranked_results.sort(key=lambda item: item["score"], reverse=True)
        return ranked_results[:top_k]

    def explain_match(self, lost_description: str, found_item: dict[str, Any], score: float) -> str:
        evidence_lines = "\n".join(f"- {item}" for item in found_item.get("evidence", [])[:6]) or "- semantic similarity"
        contradiction_lines = "\n".join(f"- {item}" for item in found_item.get("contradictions", [])[:4]) or "- no major contradictions detected"
        lost_structured = json.dumps(found_item.get("lost_structured", {}), ensure_ascii=False)
        found_structured = json.dumps(
            {
                key: found_item.get(key)
                for key in [
                    "subcategory",
                    "category",
                    "primary_color",
                    "material",
                    "brand",
                    "visible_contents",
                    "notable_features",
                    "condition_text",
                    "public_location_label",
                ]
            },
            ensure_ascii=False,
        )

        prompt = MATCH_EXPLANATION_PROMPT.format(
            lost_description=lost_description,
            lost_structured=lost_structured,
            found_structured=found_structured,
            evidence_lines=evidence_lines,
            contradiction_lines=contradiction_lines,
            score=score,
            confidence_label=found_item.get("confidence_label", "Unknown"),
        )

        try:
            response = self.client.chat.completions.create(
                model=self.config.kimi_model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=220,
                extra_body={"thinking": {"type": "disabled"}},
                timeout=self.config.llm_timeout_seconds,
            )
            return response.choices[0].message.content.strip()
        except Exception:
            summary = "; ".join(found_item.get("evidence", [])[:3]) or "The semantic description is reasonably close."
            contradiction = ""
            if found_item.get("contradictions"):
                contradiction = " There are some uncertainties: " + "; ".join(found_item["contradictions"][:2]) + "."
            return (
                f"This looks like a possible match because {summary.lower()}.{contradiction} "
                "Ask the finder to verify the most distinctive details before claiming it."
            )

    def run_lost_item_search(self, lost_user_id: str, lost_description: str, top_k: int = 3) -> dict[str, Any]:
        parsed_lost = self.parse_lost_item_description(lost_description)
        embed_text = self.build_lost_embed_text(parsed_lost, lost_description)

        lost_query_record = {
            "id": str(uuid.uuid4())[:8],
            "user_id": lost_user_id,
            "description": lost_description,
            "parsed_query": parsed_lost,
            "embedding": self.embed(embed_text),
            "created_at": datetime.now(UTC).isoformat(),
        }
        if hasattr(self.db, "insert_lost_query"):
            lost_query_record = self.db.insert_lost_query(lost_query_record)
        else:
            self.db.lost_queries.append(lost_query_record)

        matches = self.search_found_items(lost_description, top_k=top_k)
        enriched_matches: list[dict[str, Any]] = []
        for match in matches:
            explanation = self.explain_match(lost_description, match, match["score"])
            try:
                finder = self.db.users.get(match["user_id"], {})
            except Exception:
                finder = {}
            enriched = dict(match)
            enriched["finder_name"] = finder.get("name", match["user_id"])
            enriched["finder_email"] = finder.get("email", "")
            enriched["explanation"] = explanation
            enriched_matches.append(enriched)

            match_record = {
                "id": str(uuid.uuid4())[:8],
                "lost_query_id": lost_query_record["id"],
                "found_item_id": match["id"],
                "similarity_score": match["score"],
                "semantic_score": match["semantic_score"],
                "confidence_label": match.get("confidence_label", "Low"),
                "evidence": match.get("evidence", []),
                "contradictions": match.get("contradictions", []),
                "explanation": explanation,
                "status": "pending",
            }
            if hasattr(self.db, "insert_match"):
                self.db.insert_match(match_record)
            else:
                self.db.matches.append(match_record)

        return {
            "lost_query": lost_query_record,
            "matches": enriched_matches,
        }


def create_pipeline() -> LostFoundPipeline:
    return LostFoundPipeline()

