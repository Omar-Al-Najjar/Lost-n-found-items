import base64
import hashlib
import json
import math
import os
import re
import uuid
from dataclasses import dataclass, field
from datetime import UTC, datetime
from io import BytesIO
from pathlib import Path
from typing import Any

import requests
from openai import OpenAI
from PIL import Image

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

    @classmethod
    def from_env(cls) -> "PipelineConfig":
        return cls(
            moonshot_api_key=os.getenv("MOONSHOT_API_KEY"),
            kimi_model=os.getenv("KIMI_MODEL", "kimi-k2.5"),
            embedding_model=os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2"),
            moonshot_base_url=os.getenv("MOONSHOT_BASE_URL", "https://api.moonshot.ai/v1"),
            supabase_db_url=os.getenv("SUPABASE_DB_URL"),
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
                      and is_public = true
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
        slug = re.sub(r"[^a-z0-9]+", "-", location.lower()).strip("-")
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
        self._embedder: Any | None = None

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
    def use_sentence_transformers(self) -> bool:
        return str(os.getenv("USE_SENTENCE_TRANSFORMERS", "0")).strip().lower() in {"1", "true", "yes", "on"}

    @property
    def embedder(self) -> Any:
        if not self.use_sentence_transformers:
            return None
        if self._embedder is None:
            try:
                from sentence_transformers import SentenceTransformer
            except ImportError as error:  # pragma: no cover - optional local-only path
                raise RuntimeError(
                    "sentence-transformers is not installed. Either install it in the local AI environment "
                    "or leave USE_SENTENCE_TRANSFORMERS unset to use lightweight embeddings."
                ) from error
            self._embedder = SentenceTransformer(self.config.embedding_model)
        return self._embedder

    def _lightweight_embed(self, text: str, dims: int = 256) -> list[float]:
        vector = [0.0] * dims
        tokens = self.tokenize(text)
        if not tokens:
            return vector

        weighted_features: list[tuple[str, float]] = [(token, 1.0) for token in tokens]
        weighted_features.extend(
            (f"{left}_{right}", 0.75) for left, right in zip(tokens, tokens[1:])
        )

        for feature, weight in weighted_features:
            digest = hashlib.blake2b(feature.encode("utf-8"), digest_size=8).digest()
            index = int.from_bytes(digest[:4], "big") % dims
            sign = 1.0 if digest[4] % 2 == 0 else -1.0
            vector[index] += sign * weight

        norm = math.sqrt(sum(value * value for value in vector))
        if norm == 0:
            return vector
        return [value / norm for value in vector]

    def embed(self, text: str) -> list[float]:
        if self.use_sentence_transformers:
            return self.embedder.encode(text, normalize_embeddings=True).tolist()
        return self._lightweight_embed(text)

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
        return " ".join(
            [
                parsed_lost.get("query_text", raw_description),
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

    def _extract_json_object(self, text: str) -> dict[str, Any]:
        text = (text or "").strip()
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            match = re.search(r"\{.*\}", text, flags=re.DOTALL)
            if match:
                return json.loads(match.group(0))
            raise

    def _fallback_parse_lost_item_description(self, lost_description: str) -> dict[str, Any]:
        text = (lost_description or "").strip()
        arabic_normalization_map = str.maketrans(
            {
                "أ": "ا",
                "إ": "ا",
                "آ": "ا",
                "ة": "ه",
                "ى": "ي",
                "ؤ": "و",
                "ئ": "ي",
            }
        )

        def normalize_lookup(value: str) -> str:
            normalized = str(value or "").lower().translate(arabic_normalization_map)
            normalized = re.sub(r"[\u064b-\u065f\u0670]", "", normalized)
            normalized = re.sub(r"\s+", " ", normalized)
            return normalized.strip()

        low_lookup = normalize_lookup(text)

        def has_any(terms: list[str]) -> bool:
            for term in terms:
                candidate = normalize_lookup(term)
                if not candidate:
                    continue
                if re.fullmatch(r"[a-z0-9 ]+", candidate):
                    pattern = rf"(?<![a-z0-9]){re.escape(candidate)}(?![a-z0-9])"
                    if re.search(pattern, low_lookup):
                        return True
                elif candidate in low_lookup:
                    return True
            return False

        def first_match(rules: list[tuple[str, list[str]]], default: str = "Unknown") -> str:
            for label, terms in rules:
                if has_any(terms):
                    return label
            return default

        def collect_matches(rules: list[tuple[str, list[str]]]) -> list[str]:
            return [label for label, terms in rules if has_any(terms)]

        item_type = first_match(
            [
                (
                    "earbuds case",
                    [
                        "airpods case",
                        "earbuds case",
                        "earbud case",
                        "علبة ايربودز",
                        "جراب ايربودز",
                        "حافظة سماعات",
                        "علبة سماعات",
                        "جراب سماعات",
                    ],
                ),
                ("earbuds", ["airpods", "earbuds", "earphones", "ايربودز", "سماعات لاسلكية"]),
                ("wallet", ["wallet", "billfold", "cardholder", "card holder", "محفظة", "محفظه", "جزدان"]),
                ("backpack", ["backpack", "school bag", "bagpack", "حقيبة ظهر", "حقيبه ظهر", "شنطة ظهر", "شنطه ظهر"]),
                ("bag", ["handbag", "bag", "purse", "tote", "pouch", "حقيبة", "حقيبه", "شنطة", "شنطه"]),
                ("keys", ["car keys", "keychain", "keys", "key", "مفاتيح", "مفتاح", "ميدالية مفاتيح", "تعليقة مفاتيح"]),
                ("sunglasses", ["sunglasses", "glasses", "shades", "نظارة شمس", "نظاره شمس", "نظارات شمس"]),
                ("phone", ["smartphone", "iphone", "mobile", "phone", "هاتف", "جوال", "موبايل", "تلفون", "ايفون"]),
                ("laptop", ["laptop", "macbook", "لاب توب", "لابتوب", "حاسوب محمول"]),
                ("document", ["passport", "document", "id card", "license", "جواز", "وثيقة", "بطاقة هوية", "رخصة"]),
            ]
        )

        color = first_match(
            [
                ("black", ["black", "اسود", "سوداء", "سوده"]),
                ("brown", ["brown", "بني", "بنيه"]),
                ("white", ["white", "ابيض", "بيضاء"]),
                ("silver", ["silver", "فضي", "فضيه"]),
                ("gold", ["gold", "ذهبي", "ذهبيه"]),
                ("blue", ["blue", "ازرق", "زرقاء"]),
                ("red", ["red", "احمر", "حمراء"]),
                ("green", ["green", "اخضر", "خضراء"]),
                ("pink", ["pink", "وردي", "ورديه", "زهري"]),
                ("gray", ["gray", "grey", "رمادي", "رماديه", "رصاصي"]),
                ("yellow", ["yellow", "اصفر", "صفراء"]),
            ]
        )

        material = first_match(
            [
                ("leather", ["leather", "جلد", "جلدي", "جلديه"]),
                ("metal", ["metal", "معدن", "معدني", "حديد", "المنيوم", "ألمنيوم"]),
                ("plastic", ["plastic", "بلاستيك", "بلاستيكي"]),
                ("fabric", ["fabric", "cloth", "قماش", "قماشي", "نسيج"]),
                ("canvas", ["canvas", "كانفس", "كتان"]),
            ]
        )

        brand = first_match(
            [
                ("apple", ["apple", "iphone", "ابل", "ايفون"]),
                ("samsung", ["samsung", "سامسونج"]),
                ("nike", ["nike", "نايك"]),
                ("adidas", ["adidas", "اديداس", "ادياس"]),
                ("ray-ban", ["ray-ban", "rayban", "راي بان", "ريبان"]),
            ]
        )

        likely_contents = collect_matches(
            [
                ("cards", ["cards", "card", "بطاقات", "بطاقة", "كروت", "كرت"]),
                ("cash", ["cash", "money", "فلوس", "نقود", "نقد", "مال"]),
                ("id", ["national id", "id", "هوية", "بطاقة هوية"]),
                ("license", ["driving license", "license", "رخصة", "رخصة قيادة"]),
                ("passport", ["passport", "جواز", "جواز سفر", "باسبور"]),
            ]
        )
        distinctive_features = collect_matches(
            [
                ("zipper", ["zipper", "zip", "سحاب", "سوستة"]),
                ("logo", ["logo", "شعار", "علامة"]),
                ("sticker", ["sticker", "ملصق", "ستيكر"]),
                ("engraving", ["engraving", "engraved", "نقش", "منقوش", "حفر"]),
                ("keychain", ["keychain", "ميدالية", "تعليقة"]),
                ("case", ["case", "cover", "جراب", "غلاف"]),
            ]
        )
        location_clues = collect_matches(
            [
                ("university", ["university", "campus", "جامعة", "جامعه", "الحرم"]),
                ("gate", ["gate", "بوابة", "بوابه"]),
                ("park", ["park", "حديقة", "حديقه", "منتزه"]),
                ("mall", ["mall", "مول", "مجمع"]),
                ("entrance", ["entrance", "entry", "مدخل"]),
                ("library", ["library", "مكتبة", "مكتبه"]),
            ]
        )
        time_clues = collect_matches(
            [
                ("morning", ["this morning", "morning", "الصباح", "هذا الصباح", "صباح"]),
                ("afternoon", ["this afternoon", "afternoon", "بعد الظهر", "العصر"]),
                ("evening", ["this evening", "evening", "المساء", "مساء"]),
                ("night", ["night", "tonight", "late night", "الليل", "ليلة", "الليلة"]),
                ("today", ["today", "اليوم", "النهارده"]),
                ("yesterday", ["yesterday", "امس", "أمس", "البارحة"]),
                ("recently", ["recently", "earlier", "earlier today", "قبل قليل", "من شوي", "من شوية"]),
            ]
        )

        category_hint_text = " ".join(
            [
                item_type,
                color,
                material,
                brand,
                " ".join(likely_contents),
                " ".join(distinctive_features),
                " ".join(location_clues),
            ]
        )
        category = self.infer_category(item_type=item_type, raw_category="other", text=category_hint_text)

        keywords = list(
            dict.fromkeys([item_type, category.lower(), color, material, brand] + likely_contents + distinctive_features + location_clues)
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
        normalized["search_keywords"] = self.expand_search_keywords(normalized)
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
        left_set = set(self.tokenize(" ".join(left)))
        right_set = set(self.tokenize(" ".join(right)))
        if not left_set or not right_set:
            return 0.0
        return len(left_set & right_set) / len(left_set | right_set)

    def cosine_similarity_score(self, left: list[float], right: list[float]) -> float:
        if not left or not right:
            return 0.0
        size = min(len(left), len(right))
        if size == 0:
            return 0.0
        return float(sum(left[index] * right[index] for index in range(size)))

    def normalize_time_clues(self, clues: list[str]) -> list[str]:
        normalized: list[str] = []
        for clue in clues:
            low = str(clue or "").strip().lower()
            if not low:
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
        ).lower()
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
        evidence: list[str] = []
        contradictions: list[str] = []
        bonus = 0.0
        penalty = 0.0

        lost_type = parsed_lost.get("subcategory", parsed_lost.get("item_type", "")).lower().strip()
        found_type = item.get("subcategory", item.get("item_type", "")).lower().strip()

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

        if parsed_lost.get("primary_color") not in {"", "Unknown"} and item.get("primary_color") not in {"", "Unknown"}:
            if self.text_match(parsed_lost.get("primary_color", ""), item.get("primary_color", "")):
                bonus += 0.12
                evidence.append(f"primary color aligns ({parsed_lost.get('primary_color')} <-> {item.get('primary_color')})")
            else:
                penalty += 0.10
                contradictions.append(f"primary color mismatch ({parsed_lost.get('primary_color')} vs {item.get('primary_color')})")

        if parsed_lost.get("material") not in {"", "Unknown"} and item.get("material") not in {"", "Unknown"}:
            if self.text_match(parsed_lost.get("material", ""), item.get("material", "")):
                bonus += 0.10
                evidence.append(f"material aligns ({parsed_lost.get('material')} <-> {item.get('material')})")
            else:
                penalty += 0.06
                contradictions.append(f"material mismatch ({parsed_lost.get('material')} vs {item.get('material')})")

        lost_brand = parsed_lost.get("brand", "")
        found_brand = item.get("brand", "")
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
            if enriched_item.get("embedding") is None:
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
        query_vector = self.embed(query_text)
        semantic_scores = [self.cosine_similarity_score(query_vector, item["embedding"]) for item in valid_items]
        lost_category = parsed_lost.get("category")

        ranked_results: list[dict[str, Any]] = []
        for item, semantic_score in zip(valid_items, semantic_scores):
            if semantic_score < 0.30:
                continue

            found_category = item.get("category")
            if (lost_category, found_category) in CATEGORY_CONTRADICTIONS or (found_category, lost_category) in CATEGORY_CONTRADICTIONS:
                continue

            scored = self.score_candidate(parsed_lost, item, float(semantic_score))
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
            finder = self.db.users.get(match["user_id"], {})
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
