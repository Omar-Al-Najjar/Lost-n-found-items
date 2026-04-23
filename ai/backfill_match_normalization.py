from __future__ import annotations

import argparse
from datetime import UTC, datetime

from ai.pipeline import LostFoundPipeline, SupabaseDatabase


def main() -> None:
    parser = argparse.ArgumentParser(description="Backfill match normalization fields for found posts.")
    parser.add_argument("--batch-size", type=int, default=200, help="Rows to process per batch.")
    parser.add_argument("--max-batches", type=int, default=0, help="Optional safety cap. 0 means no cap.")
    parser.add_argument("--dry-run", action="store_true", help="Compute normalization without writing updates.")
    args = parser.parse_args()

    pipeline = LostFoundPipeline()
    if not isinstance(pipeline.db, SupabaseDatabase):
        raise RuntimeError("Backfill requires SUPABASE_DB_URL so the pipeline runs in Supabase mode.")

    processed = 0
    failed = 0
    batches = 0
    while True:
        rows = pipeline.db.fetch_found_posts_for_normalization(batch_size=max(int(args.batch_size), 1))
        if not rows:
            break

        batches += 1
        for row in rows:
            post_id = str(row.get("id") or "")
            if not post_id:
                continue
            try:
                normalized = pipeline.build_match_normalization_from_fields(
                    generated_title=str(row.get("generated_title") or ""),
                    generated_summary=str(row.get("generated_summary") or ""),
                    user_description=str(row.get("user_description") or ""),
                    public_location_label=str(row.get("public_location_label") or ""),
                    category=str(row.get("category") or ""),
                    subcategory=str(row.get("subcategory") or ""),
                    primary_color=str(row.get("primary_color") or ""),
                    material=str(row.get("material") or ""),
                    brand=str(row.get("brand") or ""),
                    notable_features=[str(item) for item in (row.get("notable_features") or [])],
                    search_keywords=[str(item) for item in (row.get("search_keywords") or [])],
                )
                if not args.dry_run:
                    pipeline.db.update_post_match_normalization(
                        post_id=post_id,
                        match_text_en=str(normalized.get("match_text_en") or ""),
                        match_keywords_en=[str(item) for item in (normalized.get("match_keywords_en") or [])],
                        match_location_en=str(normalized.get("match_location_en") or ""),
                        updated_at_iso=datetime.now(UTC).isoformat(),
                    )
                processed += 1
            except Exception as error:  # pragma: no cover - operational backfill script
                failed += 1
                print(f"[backfill] failed post_id={post_id}: {error}")

        print(
            f"[backfill] batch={batches} processed_total={processed} failed_total={failed} "
            f"dry_run={args.dry_run}"
        )
        if args.max_batches and batches >= args.max_batches:
            break

    print(f"[backfill] done batches={batches} processed={processed} failed={failed} dry_run={args.dry_run}")


if __name__ == "__main__":
    main()
