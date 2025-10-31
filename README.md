# Mem0 MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-blue.svg)](https://modelcontextprotocol.io)

[![smithery badge](https://smithery.ai/badge/@mem0/mcp-server)](https://smithery.ai/server/@mem0/mcp-server)

Enterprise-grade memory management for AI agents via the Model Context Protocol (MCP). Connects AI assistants to [Mem0 Platform](https://mem0.ai) for persistent, searchable, and contextual memory.

## Features

### Core Operations (6 tools)
- 🧠 **Add Memories**: Store conversational context with metadata and graph relationships
- 🔍 **Semantic Search**: Advanced filtering with AND/OR/NOT, categories, timestamps
- 📋 **List & Browse**: Paginated memory retrieval by entity, date range, or metadata
- ✏️ **Update & Delete**: Full CRUD operations on memory records
- 📊 **Feedback Collection**: Submit quality ratings for continuous improvement

### Advanced Operations (8 tools)
- 📄 **Single Memory Retrieval**: Get full details by UUID
- 🔄 **Batch Operations**: Update/delete multiple memories efficiently
- 🗑️ **Filter-based Deletion**: Delete memories by complex criteria
- 📦 **Export & Backup**: Create and download memory exports
- 👥 **User Management**: List and manage users

### Interactive Features
- 💬 **Prompts** (2 templates): Guided memory creation and search with smart filters
  - `add-memory`: Step-by-step memory addition with context
  - `search-memories`: Build complex search queries with date ranges
- 📊 **Resources** (2 endpoints): Real-time data access for AI assistants
  - `mem0://stats`: Server statistics and entity overview
  - `mem0://users/{userId}`: User-specific memory profiles

### Infrastructure
- 🔐 **Multi-tenant**: Organization and project-level isolation
- 🌐 **Graph Memory**: Enable relationship extraction (Pro feature)
- ⚡ **Type Safety**: Zod validation on all inputs with detailed descriptions
- 🛡️ **Error Handling**: Comprehensive error messages with examples
- 📝 **Tool Annotations**: Read-only, destructive, and idempotent hints for all tools

## Installation

### Via Smithery

```bash
npx -y @smithery/cli install @mem0/mcp-server --client claude
```

### Via npm

```bash
npm install -g @mem0/mcp-server
```

### From Source

```bash
git clone https://github.com/mem0ai/mem0-mcp-server
cd mem0-mcp-server
npm install
npm run build
```

## Configuration

### Environment Variables

```bash
# Required
MEM0_API_KEY=your_api_key_here

# Optional (for multi-tenant setup)
MEM0_ORG_ID=your_org_id
MEM0_PROJECT_ID=your_project_id

# Optional (defaults to https://api.mem0.ai)
MEM0_BASE_URL=https://api.mem0.ai
```

Get your API key from [Mem0 Dashboard](https://app.mem0.ai/dashboard/api-keys).

### MCP Settings

#### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mem0": {
      "command": "npx",
      "args": ["-y", "@mem0/mcp-server"],
      "env": {
        "MEM0_API_KEY": "your_api_key_here",
        "MEM0_ORG_ID": "your_org_id",
        "MEM0_PROJECT_ID": "your_project_id"
      }
    }
  }
}
```

#### Cursor

Add to Cursor settings (Settings > Features > MCP):

```json
{
  "mcpServers": {
    "mem0": {
      "command": "npx",
      "args": ["-y", "@mem0/mcp-server"],
      "env": {
        "MEM0_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## Tools (14 Total)

### Core Memory Operations

#### `add_memories`

Store new memories from conversations with metadata and optional graph extraction.

**Parameters:**
- `messages`: Array of `{role: 'user'|'assistant', content: string}`
- `user_id`: (optional) User identifier
- `agent_id`: (optional) Agent identifier
- `app_id`: (optional) Application identifier
- `metadata`: (optional) Additional context
- `enable_graph`: (optional) Enable graph memory (Pro)
- `immutable`: (optional) Prevent future updates
- `expiration_date`: (optional) YYYY-MM-DD format

**Example:**
```typescript
{
  "messages": [
    {"role": "user", "content": "I prefer dark mode"},
    {"role": "assistant", "content": "Noted! I'll remember your preference."}
  ],
  "user_id": "alex",
  "metadata": {"category": "preferences"},
  "enable_graph": true
}
```

### `search_memories`

Semantic search with advanced filters (AND/OR/NOT, comparison operators).

**Parameters:**
- `query`: Search query string
- `filters`: Filter object with logical operators
- `top_k`: (optional) Number of results (default: 10)
- `threshold`: (optional) Similarity threshold (default: 0.3)
- `rerank`: (optional) Enable reranking

**Filter Examples:**
```typescript
// Single user
{"user_id": "alex"}

// Multiple agents (OR)
{"OR": [
  {"agent_id": "travel-agent"},
  {"agent_id": "coding-agent"}
]}

// Date range with user (AND)
{"AND": [
  {"user_id": "alex"},
  {"created_at": {"gte": "2024-01-01", "lte": "2024-12-31"}}
]}

// Category search
{"categories": {"contains": "preferences"}}
```

**Operators:**
- Logical: `AND`, `OR`, `NOT`
- Comparison: `in`, `gte`, `lte`, `gt`, `lt`, `ne`, `icontains`
- Wildcard: `*` (matches all)

### `get_memories`

List memories by filters without semantic search. Supports pagination.

**Parameters:**
- `filters`: Filter object (same syntax as search)
- `page`: (optional) Page number (default: 1)
- `page_size`: (optional) Items per page (default: 100)

### `update_memory`

Update memory text or metadata.

**Parameters:**
- `memory_id`: Memory UUID
- `text`: (optional) New text content
- `metadata`: (optional) New metadata

### `delete_memory`

Permanently delete a memory.

**Parameters:**
- `memory_id`: Memory UUID

#### `submit_feedback`

Provide quality feedback on a memory.

**Parameters:**
- `memory_id`: Memory UUID
- `feedback`: `POSITIVE` | `NEGATIVE` | `VERY_NEGATIVE`
- `feedback_reason`: (optional) Explanation

### Advanced Operations

#### `get_memory`

Retrieve a single memory by UUID with full details.

**Parameters:**
- `memory_id`: Memory UUID

#### `batch_update_memories`

Update metadata for multiple memories at once.

**Parameters:**
- `memory_ids`: Array of memory UUIDs
- `metadata`: New metadata to apply

#### `batch_delete_memories`

Delete multiple memories by UUIDs. Cannot be undone.

**Parameters:**
- `memory_ids`: Array of memory UUIDs

#### `delete_memories_by_filter`

Delete all memories matching filter criteria. Use with caution.

**Parameters:**
- `filters`: Filter object (same syntax as search)
- `org_id`: (optional) Organization ID
- `project_id`: (optional) Project ID

#### `create_memory_export`

Request an export of memories for backup or analysis.

**Parameters:**
- `filters`: (optional) Filter which memories to export
- `org_id`: (optional) Organization ID
- `project_id`: (optional) Project ID

**Returns:** Export ID to use with `get_memory_export`

#### `get_memory_export`

Check export status and get download URL when ready.

**Parameters:**
- `export_id`: Export UUID from `create_memory_export`

#### `get_users`

List all users in the organization or project.

**Parameters:**
- `org_id`: (optional) Organization ID
- `project_id`: (optional) Project ID

#### `delete_user`

Delete a user and all their associated memories. Cannot be undone.

**Parameters:**
- `user_id`: User identifier

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Run built version
node dist/index.js
```

## Pricing & Plans

- **Hobby**: Free tier (10K memories)
- **Starter**: $19/month (50K memories)
- **Pro**: $249/month (unlimited memories, graph memory, advanced analytics)
- **Enterprise**: Custom pricing

Visit [mem0.ai/pricing](https://mem0.ai/pricing) for details.

## API Reference

Official documentation: [docs.mem0.ai/api-reference](https://docs.mem0.ai/api-reference)

## Support

- 🌐 Website: [mem0.ai](https://mem0.ai)
- 📚 Docs: [docs.mem0.ai](https://docs.mem0.ai)
- 💬 Discord: [mem0.dev/DiD](https://mem0.dev/DiD)
- 🐛 Issues: [GitHub Issues](https://github.com/mem0ai/mem0-mcp-server/issues)

## License

MIT License - See [LICENSE](LICENSE) file for details.

---

Built with ❤️ using [Model Context Protocol](https://modelcontextprotocol.io)
