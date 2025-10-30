# Mem0 MCP Server Usage Examples

## Example 1: Add User Preference

```typescript
// Tool: add_memories
{
  "messages": [
    {
      "role": "user",
      "content": "I prefer Python over JavaScript for backend development"
    },
    {
      "role": "assistant",
      "content": "Got it! I'll remember you prefer Python for backend work."
    }
  ],
  "user_id": "alex",
  "metadata": {
    "category": "preferences",
    "topic": "programming"
  }
}
```

## Example 2: Search User's Preferences

```typescript
// Tool: search_memories
{
  "query": "programming language preferences",
  "filters": {
    "AND": [
      { "user_id": "alex" },
      { "metadata.category": "preferences" }
    ]
  },
  "top_k": 5
}
```

## Example 3: Get All Memories for User (Last 30 Days)

```typescript
// Tool: get_memories
{
  "filters": {
    "AND": [
      { "user_id": "alex" },
      { 
        "created_at": {
          "gte": "2024-10-01",
          "lte": "2024-10-31"
        }
      }
    ]
  },
  "page": 1,
  "page_size": 50
}
```

## Example 4: Multi-Agent Search

```typescript
// Tool: search_memories
{
  "query": "customer support interactions",
  "filters": {
    "OR": [
      { "agent_id": "support-agent" },
      { "agent_id": "escalation-agent" }
    ]
  },
  "rerank": true,
  "top_k": 10
}
```

## Example 5: Search with Category Filter

```typescript
// Tool: search_memories
{
  "query": "budget and financial goals",
  "filters": {
    "AND": [
      { "user_id": "alex" },
      { "categories": { "contains": "finance" } }
    ]
  },
  "threshold": 0.5
}
```

## Example 6: Update Memory Metadata

```typescript
// Tool: update_memory
{
  "memory_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
  "metadata": {
    "verified": true,
    "importance": "high",
    "last_reviewed": "2024-10-31"
  }
}
```

## Example 7: Add Graph Memory (Pro)

```typescript
// Tool: add_memories
{
  "messages": [
    {
      "role": "user",
      "content": "John works at Acme Corp as a Product Manager"
    },
    {
      "role": "assistant",
      "content": "I've recorded that John is a Product Manager at Acme Corp."
    }
  ],
  "user_id": "alex",
  "enable_graph": true,
  "metadata": {
    "type": "entity_relationship"
  }
}
```

## Example 8: Immutable Memory with Expiration

```typescript
// Tool: add_memories
{
  "messages": [
    {
      "role": "user",
      "content": "Temporary access code: ABC123, valid for 7 days"
    },
    {
      "role": "assistant",
      "content": "Stored the temporary access code."
    }
  ],
  "user_id": "alex",
  "immutable": true,
  "expiration_date": "2024-11-07",
  "metadata": {
    "type": "temporary_credential"
  }
}
```

## Example 9: Submit Positive Feedback

```typescript
// Tool: submit_feedback
{
  "memory_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
  "feedback": "POSITIVE",
  "feedback_reason": "Accurate capture of user preference"
}
```

## Example 10: Complex Filter Query

```typescript
// Tool: search_memories
{
  "query": "project deadlines and milestones",
  "filters": {
    "AND": [
      { "user_id": "alex" },
      {
        "OR": [
          { "categories": { "contains": "project" } },
          { "metadata.priority": { "in": ["high", "urgent"] } }
        ]
      },
      {
        "created_at": { "gte": "2024-10-01" }
      }
    ]
  },
  "top_k": 20,
  "rerank": true
}
```

## Filter Operators Reference

### Logical Operators
- `AND`: All conditions must be true
- `OR`: At least one condition must be true
- `NOT`: Condition must not be true

### Comparison Operators
- `in`: Value matches one of the specified values
- `gte`: Greater than or equal to
- `lte`: Less than or equal to
- `gt`: Greater than
- `lt`: Less than
- `ne`: Not equal to
- `contains`: String contains substring
- `icontains`: Case-insensitive contains
- `*`: Wildcard (matches everything)

### Common Fields for Filtering
- `user_id`: User identifier
- `agent_id`: Agent identifier
- `app_id`: Application identifier
- `run_id`: Run identifier
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp
- `categories`: Memory categories (use `contains` or `in`)
- `metadata.<key>`: Custom metadata fields
