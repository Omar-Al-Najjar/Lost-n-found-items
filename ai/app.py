from io import BytesIO

import streamlit as st
from PIL import Image

from pipeline import LostFoundPipeline, SupabaseDatabase, create_pipeline


def get_pipeline() -> LostFoundPipeline:
    if "pipeline" not in st.session_state:
        st.session_state.pipeline = create_pipeline()
    return st.session_state.pipeline


def render_found_item_tab(pipeline: LostFoundPipeline):
    st.subheader("Post a found item")
    if isinstance(pipeline.db, SupabaseDatabase):
        st.caption("Upload a photo, add the finder description, let the AI structure it, then save it into the real Supabase app tables.")
    else:
        st.caption("Upload a photo, add the finder description, let the AI structure it, then save it to the local in-memory database.")

    with st.form("found_item_form", clear_on_submit=False):
        finder_user_id = st.selectbox(
            "Finder profile",
            options=list(pipeline.db.users.keys()),
            format_func=lambda user_id: f"{pipeline.db.users[user_id]['name']} ({user_id})",
        )
        location_found = st.text_input(
            "Public location label",
            placeholder="University gate, cafeteria, library table...",
        )
        user_description = st.text_area(
            "Finder description",
            placeholder="Found a black wallet near the university entrance this morning...",
            height=120,
        )
        uploaded_file = st.file_uploader("Upload item photo", type=["png", "jpg", "jpeg", "webp"])
        submitted = st.form_submit_button("Analyze and save found item")

    if not submitted:
        return

    if not uploaded_file:
        st.error("Please upload a photo first.")
        return

    if not user_description.strip():
        st.error("Please enter a finder description.")
        return

    try:
        image = Image.open(BytesIO(uploaded_file.getvalue())).convert("RGB")
        st.image(image, caption="Uploaded photo", use_container_width=True)

        with st.spinner("Analyzing item with the AI pipeline..."):
            ai_result = pipeline.analyze_found_item(image=image, user_description=user_description.strip())
            saved_record = pipeline.save_found_item(
                user_id=finder_user_id,
                user_description=user_description.strip(),
                ai_result=ai_result,
                location_found=location_found.strip() or "Unknown",
            )

        if isinstance(pipeline.db, SupabaseDatabase):
            st.success(f"Saved found item to Supabase posts as record `{saved_record['id']}`.")
        else:
            st.success(f"Saved found item locally as record `{saved_record['id']}`.")
        st.markdown("**Structured AI result**")
        st.json(ai_result)
        st.markdown("**Saved record**")
        st.json(saved_record)
    except Exception as error:
        st.error(f"Found-item pipeline failed: {error}")


def render_lost_search_tab(pipeline: LostFoundPipeline):
    st.subheader("Search for a lost item")
    if isinstance(pipeline.db, SupabaseDatabase):
        st.caption("Enter the lost-item description and search against real found posts already stored in Supabase.")
    else:
        st.caption("Enter the lost-item description and search against the found items saved in the current local session.")

    with st.form("lost_item_form", clear_on_submit=False):
        lost_user_id = st.selectbox(
            "Searching profile",
            options=list(pipeline.db.users.keys()),
            format_func=lambda user_id: f"{pipeline.db.users[user_id]['name']} ({user_id})",
            key="lost_user_id",
        )
        lost_description = st.text_area(
            "Lost item description",
            placeholder="I lost my black leather wallet with cards near the university gate...",
            height=120,
        )
        top_k = st.slider("Maximum matches", min_value=1, max_value=5, value=3)
        submitted = st.form_submit_button("Search lost item")

    if not submitted:
        return

    if not lost_description.strip():
        st.error("Please enter the lost-item description.")
        return

    if not pipeline.db.found_items:
        st.warning("There are no found items saved yet in this session. Post a found item first.")
        return

    try:
        with st.spinner("Parsing the lost item and searching matches..."):
            result = pipeline.run_lost_item_search(
                lost_user_id=lost_user_id,
                lost_description=lost_description.strip(),
                top_k=top_k,
            )

        st.markdown("**Parsed lost-item query**")
        st.json(result["lost_query"]["parsed_query"])

        matches = result["matches"]
        if not matches:
            st.info("No matches passed the current ranking threshold.")
            return

        st.success(f"Found {len(matches)} potential match(es).")
        for index, match in enumerate(matches, start=1):
            with st.container(border=True):
                st.markdown(f"### Match #{index}")
                st.write(f"Confidence: **{match['confidence_label']}**")
                st.write(f"Score: **{match['score'] * 100:.1f}%**")
                st.write(f"Generated title: **{match.get('generated_title', 'Unknown')}**")
                st.write(f"Subcategory: **{match.get('subcategory', match.get('item_type', 'Unknown'))}**")
                st.write(f"Category: **{match.get('category', 'Unknown')}**")
                st.write(f"Primary color: **{match.get('primary_color', match.get('color', 'Unknown'))}**")
                st.write(f"Material: **{match.get('material', 'Unknown')}**")
                st.write(f"Brand: **{match.get('brand', 'Unknown')}**")
                st.write(f"Public location label: **{match.get('public_location_label', match.get('location_found', 'Unknown'))}**")
                st.write(f"Finder: **{match.get('finder_name', 'Unknown')}**")
                st.write(f"Finder email: **{match.get('finder_email', 'Unknown')}**")

                if match.get("evidence"):
                    st.markdown("**Why it ranked**")
                    for evidence in match["evidence"]:
                        st.write(f"- {evidence}")

                if match.get("contradictions"):
                    st.markdown("**Cautions**")
                    for contradiction in match["contradictions"]:
                        st.write(f"- {contradiction}")

                st.markdown("**AI explanation**")
                st.write(match["explanation"])
    except Exception as error:
        st.error(f"Lost-item search failed: {error}")


def render_database_tab(pipeline: LostFoundPipeline):
    st.subheader("Pipeline database")
    if isinstance(pipeline.db, SupabaseDatabase):
        st.caption("Found items come from real Supabase posts. Lost searches and match rows below are just this Streamlit session's latest AI runs.")
    else:
        st.caption("This mirrors the notebook behavior: everything stays in memory until the Streamlit process stops.")

    left, right, extra = st.columns(3)
    left.metric("Found items", len(pipeline.db.found_items))
    right.metric("Lost queries", len(pipeline.db.lost_queries))
    extra.metric("Saved matches", len(pipeline.db.matches))

    st.markdown("**Found items records**")
    if pipeline.db.found_items:
        st.dataframe(pipeline.db.found_items, use_container_width=True)
    else:
        st.info("No found items have been posted yet.")

    st.markdown("**Lost queries records**")
    if pipeline.db.lost_queries:
        st.dataframe(pipeline.db.lost_queries, use_container_width=True)
    else:
        st.info("No lost-item searches have been run yet.")

    st.markdown("**Matches records**")
    if pipeline.db.matches:
        st.dataframe(pipeline.db.matches, use_container_width=True)
    else:
        st.info("No matches have been saved yet.")


def main():
    st.set_page_config(page_title="Lost & Found AI Local App", page_icon="🔎", layout="wide")
    st.title("Lost & Found AI Local App")
    st.caption("Local VS Code frontend for the notebook pipeline before turning it into an API.")

    pipeline = get_pipeline()
    backend_label = "Supabase" if isinstance(pipeline.db, SupabaseDatabase) else "In-memory"
    st.info(f"Active database backend: {backend_label}")

    if not isinstance(pipeline.db, SupabaseDatabase):
        st.error("This app is now configured to use real Supabase data only. Set `SUPABASE_DB_URL` before running Streamlit.")
        st.stop()

    if not pipeline.config.moonshot_api_key:
        st.warning("`MOONSHOT_API_KEY` is not set. Add it to your environment before using the AI features.")

    if isinstance(pipeline.db, SupabaseDatabase) and not pipeline.db.users:
        st.warning("No real profiles were found in Supabase. Create users in the app/auth flow first.")

    found_tab, search_tab, db_tab = st.tabs(
        ["Found item post", "Lost item search", "Testing database"]
    )

    with found_tab:
        render_found_item_tab(pipeline)
    with search_tab:
        render_lost_search_tab(pipeline)
    with db_tab:
        render_database_tab(pipeline)


if __name__ == "__main__":
    main()
