from __future__ import annotations

import sys
import unittest
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from ai.pipeline import InMemoryDatabase, LostFoundPipeline


class TranslationSpyPipeline(LostFoundPipeline):
    def __init__(self) -> None:
        super().__init__(database=InMemoryDatabase())
        self.translation_calls: list[tuple[str, bool]] = []

    def translate_to_english_text(self, text: str, *, force: bool = False) -> str:  # type: ignore[override]
        self.translation_calls.append((str(text or ""), force))
        return str(text or "").strip()


def make_found_item(
    *,
    item_id: str,
    title: str,
    summary: str,
    subcategory: str,
    category: str,
    keywords: list[str],
) -> dict:
    return {
        "id": item_id,
        "user_id": "user_001",
        "status": "active",
        "is_public": True,
        "is_removed": False,
        "generated_title": title,
        "generated_summary": summary,
        "user_description": summary,
        "subcategory": subcategory,
        "category": category,
        "primary_color": "brown",
        "material": "paper",
        "brand": "Unknown",
        "notable_features": ["spiral", "notes"],
        "visible_contents": [],
        "search_keywords": keywords,
        "match_text_en": f"{title} {summary}",
        "match_keywords_en": keywords,
        "match_location_en": "Techno University A103",
        "public_location_label": "Techno University A103",
        "posted_at": "2026-04-23T00:00:00+00:00",
    }


class MatchingPipelineTests(unittest.TestCase):
    def test_build_match_normalization_forces_translation_for_mixed_input(self) -> None:
        pipeline = TranslationSpyPipeline()
        pipeline.build_match_normalization_from_fields(
            generated_title="دفتر calculus A103",
            generated_summary="نوتبوك بني",
            user_description="ضاع في الجامعة",
            public_location_label="Techno gate A103",
            category="documents",
            subcategory="notebook",
            primary_color="brown",
            material="paper",
            brand="Unknown",
            notable_features=["spiral"],
            search_keywords=["notebook", "A103"],
        )

        force_map = {text: force for text, force in pipeline.translation_calls}
        self.assertTrue(force_map.get("دفتر calculus A103"))
        self.assertTrue(force_map.get("نوتبوك بني"))
        self.assertTrue(force_map.get("ضاع في الجامعة"))
        self.assertTrue(force_map.get("Techno gate A103"))

    def test_arabic_query_matches_english_found_item(self) -> None:
        database = InMemoryDatabase(
            found_items=[
                make_found_item(
                    item_id="item-1",
                    title="Brown Notebook",
                    summary="Spiral notebook with calculus notes near gate A103",
                    subcategory="notebook",
                    category="documents",
                    keywords=["notebook", "brown", "spiral", "calculus", "a103", "university"],
                )
            ]
        )
        pipeline = LostFoundPipeline(database=database)
        results = pipeline.search_found_items(
            "كان عندي نوتبوك بني خاص بملاحظات مادة الكلاكولاس وضاع مني في الجامعة عند القاعة A103",
            top_k=3,
        )

        self.assertGreaterEqual(len(results), 1)
        self.assertEqual(results[0]["id"], "item-1")

    def test_high_recall_fallback_returns_candidates_when_strict_scoring_is_empty(self) -> None:
        database = InMemoryDatabase(
            found_items=[
                make_found_item(
                    item_id="item-2",
                    title="Keys",
                    summary="Car keys found in campus parking",
                    subcategory="keys",
                    category="accessories",
                    keywords=["keys", "car", "parking", "campus"],
                )
            ]
        )
        pipeline = LostFoundPipeline(database=database)
        results = pipeline.search_found_items(
            "very vague description with weak clues",
            top_k=3,
            threshold=0.95,
        )

        self.assertGreaterEqual(len(results), 1)

    def test_category_conflict_is_soft_penalty_not_hard_drop(self) -> None:
        database = InMemoryDatabase(
            found_items=[
                make_found_item(
                    item_id="item-3",
                    title="Wallet with keychain",
                    summary="Black wallet with cards and attached keychain",
                    subcategory="keys",
                    category="accessories",
                    keywords=["wallet", "cards", "keychain", "black"],
                )
            ]
        )
        pipeline = LostFoundPipeline(database=database)
        results = pipeline.search_found_items("Lost black wallet with cards", top_k=3, threshold=0.35)
        result_ids = {str(item.get("id") or "") for item in results}
        self.assertIn("item-3", result_ids)

    def test_save_found_item_sets_found_or_lost_at(self) -> None:
        pipeline = LostFoundPipeline(database=InMemoryDatabase())
        saved = pipeline.save_found_item(
            user_id="user_001",
            user_description="found near gate",
            ai_result={
                "ai_description": "Brown notebook with spiral binding.",
                "item_type": "notebook",
                "category": "documents",
                "color": "brown",
                "material": "paper",
                "brand": "Unknown",
                "visible_contents": ["notes"],
                "distinctive_features": ["spiral"],
                "condition": "Used",
                "attribute_confidence": "Medium",
                "search_keywords": ["notebook", "brown", "spiral"],
            },
            location_found="Techno University A103",
        )
        self.assertTrue(str(saved.get("date_found") or "").strip())
        self.assertEqual(saved.get("found_or_lost_at"), saved.get("date_found"))

    def test_adaptive_threshold_is_lower_for_documents(self) -> None:
        pipeline = LostFoundPipeline(database=InMemoryDatabase())
        document_threshold = pipeline._get_search_threshold({"subcategory": "notebook", "category": "documents"})
        electronic_threshold = pipeline._get_search_threshold({"subcategory": "phone", "category": "electronics"})
        self.assertLess(document_threshold, electronic_threshold)

    def test_non_latin_precomputed_match_fields_do_not_skip_translation(self) -> None:
        pipeline = TranslationSpyPipeline()
        pipeline.normalize_found_item_for_matching(
            {
                "generated_title": "دفتر بني",
                "generated_summary": "ملاحظات جامعة",
                "user_description": "ضايع بين المحاضرات",
                "subcategory": "دفتر",
                "category": "documents",
                "primary_color": "بني",
                "material": "ورق",
                "brand": "Unknown",
                "public_location_label": "جامعة",
                "match_text_en": "دفتر ملاحظات بني",
                "match_keywords_en": ["دفتر", "جامعة"],
                "match_location_en": "جامعة",
            }
        )
        self.assertGreaterEqual(len(pipeline.translation_calls), 1)

    def test_arabic_noisy_query_with_typos_still_matches_notebook(self) -> None:
        database = InMemoryDatabase(
            found_items=[
                make_found_item(
                    item_id="item-ar-noisy",
                    title="Brown Notebook",
                    summary="Spiral notebook with calculus notes near gate A103",
                    subcategory="notebook",
                    category="documents",
                    keywords=["notebook", "brown", "spiral", "calculus", "a103", "university"],
                )
            ]
        )
        pipeline = LostFoundPipeline(database=database)
        results = pipeline.search_found_items(
            "ضيعت نووتبوك بني تبع كالكولس بين 12 و4 حوالين قاعة a103 بالجامعه",
            top_k=3,
        )
        self.assertGreaterEqual(len(results), 1)
        self.assertEqual(results[0]["id"], "item-ar-noisy")

    def test_english_typo_heavy_query_still_matches_notebook(self) -> None:
        database = InMemoryDatabase(
            found_items=[
                make_found_item(
                    item_id="item-en-typo",
                    title="Brown Notebook",
                    summary="Spiral notebook with calculus notes near gate A103",
                    subcategory="notebook",
                    category="documents",
                    keywords=["notebook", "brown", "spiral", "calculus", "a103", "university"],
                )
            ]
        )
        pipeline = LostFoundPipeline(database=database)
        results = pipeline.search_found_items(
            "lost brwn note book calc cls notes @ a103 uni bldg",
            top_k=3,
        )
        self.assertGreaterEqual(len(results), 1)
        self.assertEqual(results[0]["id"], "item-en-typo")

    def test_mixed_language_messy_query_matches_wallet(self) -> None:
        database = InMemoryDatabase(
            found_items=[
                make_found_item(
                    item_id="item-wallet-mix",
                    title="Black Wallet",
                    summary="Black leather wallet with cards found near university gate",
                    subcategory="wallet",
                    category="bags",
                    keywords=["wallet", "black", "leather", "cards", "gate", "university"],
                )
            ]
        )
        pipeline = LostFoundPipeline(database=database)
        results = pipeline.search_found_items(
            "ضاع مني walet اسود فيه cards عند بوابه الجامعه",
            top_k=3,
        )
        self.assertGreaterEqual(len(results), 1)
        result_ids = {str(item.get("id") or "") for item in results}
        self.assertIn("item-wallet-mix", result_ids)

    def test_none_subcategory_does_not_crash_scoring(self) -> None:
        pipeline = LostFoundPipeline(database=InMemoryDatabase())
        scored = pipeline.score_candidate(
            parsed_lost={
                "subcategory": None,
                "item_type": None,
                "category": "documents",
                "primary_color": "brown",
                "material": "paper",
                "brand": "Unknown",
                "notable_features": [],
                "likely_contents": [],
                "search_keywords": [],
                "location_clues": [],
                "time_clues": [],
            },
            item={
                "subcategory": None,
                "item_type": None,
                "category": "documents",
                "primary_color": "brown",
                "material": "paper",
                "brand": "Unknown",
                "notable_features": [],
                "visible_contents": [],
                "search_keywords": [],
                "public_location_label": "campus",
                "user_description": "",
                "generated_summary": "",
            },
            semantic_score=0.4,
        )
        self.assertIsInstance(scored, dict)
        self.assertIn("final_score", scored)


if __name__ == "__main__":
    unittest.main()
