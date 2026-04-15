# 11 — API Contracts

This project relies on a mix of:
- direct Supabase table access from the mobile app
- RPCs/views for optimized reads
- Edge Functions for privileged and AI workflows

## Direct Client Reads/Writes

## profiles
- read own profile
- update own profile

## posts
- insert own post
- update own post
- read public feed rows via safe view
- read own private rows

## messages
- read authorized messages
- insert authorized messages

## Recommended Edge Functions

## 1. `analyze-item`

### Purpose
Analyze a found post's images and text and persist structured extraction.

### Input
```json
{
  "postId": "uuid"
}
```

### Output
```json
{
  "ok": true,
  "postId": "uuid",
  "analysisState": "completed",
  "extractionId": "uuid"
}
```

### Side Effects
- reads post and image paths
- calls AI provider
- writes `post_ai_extractions`
- updates `posts`
- enqueues embedding generation if split into separate job

## 2. `generate-embedding`

### Purpose
Generate or regenerate an embedding for a post or search query.

### Input
```json
{
  "entityType": "post",
  "entityId": "uuid"
}
```

### Output
```json
{
  "ok": true,
  "entityType": "post",
  "entityId": "uuid"
}
```

## 3. `search-found-items`

### Purpose
Run hybrid search against found posts from a natural-language lost item query.

### Input
```json
{
  "query": "black wallet with zipper lost near abdali mall",
  "countryCode": "JO",
  "citySlug": "amman",
  "regionSlug": null,
  "filters": {
    "category": "wallet",
    "brand": null,
    "color": "black"
  },
  "limit": 20,
  "offset": 0
}
```

### Output
```json
{
  "ok": true,
  "searchQueryId": "uuid",
  "results": [
    {
      "candidatePostId": "uuid",
      "score": 0.9231,
      "explanations": ["same category", "similar color", "nearby location"],
      "post": {
        "id": "uuid",
        "generatedTitle": "Black leather wallet",
        "category": "wallet",
        "brand": null,
        "primaryColor": "black",
        "citySlug": "amman",
        "primaryImagePath": "post-images/..."
      }
    }
  ]
}
```

## 4. `generate-post-matches`

### Purpose
Generate proactive matches for a newly created or updated post.

### Input
```json
{
  "postId": "uuid"
}
```

### Output
```json
{
  "ok": true,
  "postId": "uuid",
  "matchCount": 8
}
```

## 5. `create-conversation-for-post`

### Purpose
Create or reuse a conversation for a post context.

### Input
```json
{
  "postId": "uuid"
}
```

### Output
```json
{
  "ok": true,
  "conversationId": "uuid",
  "created": false
}
```

## 6. `report-content`

### Purpose
Create moderation report.

### Input
```json
{
  "targetType": "post",
  "targetId": "uuid",
  "reasonCode": "spam",
  "note": "optional note"
}
```

### Output
```json
{
  "ok": true,
  "reportId": "uuid"
}
```

## 7. `retry-ai-job`

### Purpose
Retry a failed AI job manually or from internal tooling.

### Input
```json
{
  "jobId": "uuid"
}
```

### Output
```json
{
  "ok": true,
  "jobId": "uuid",
  "status": "pending"
}
```

## Suggested RPCs / Views

## `get_public_feed`
Inputs:
- city
- region optional
- type optional
- cursor or offset

Returns:
- safe post card rows

## `get_post_public_detail`
Inputs:
- post id
Returns:
- safe post detail payload

## `get_user_posts`
Inputs:
- user id implicit from auth
Returns:
- own posts with private management fields

## `get_conversation_list`
Inputs:
- auth user implicit
Returns:
- inbox rows with unread counts

## `get_match_candidates_for_post`
Inputs:
- post id
Returns:
- proactive suggestions for owner

## Error Contract

All functions should return a normalized error shape:

```json
{
  "ok": false,
  "error": {
    "code": "ANALYSIS_FAILED",
    "message": "Unable to analyze item at this time."
  }
}
```

## API Rules

- all functions require authenticated user unless explicitly internal
- all client-callable functions validate auth user and entity ownership/access
- never trust raw client-provided score values or AI fields
- use schema validation on function request/response payloads
