# Smithery Integration Guide

This MCP server is fully compatible with [Smithery.ai](https://smithery.ai), the registry for Model Context Protocol servers.

## Quick Install

```bash
npx -y @smithery/cli install @mem0/mcp-server --client claude
```

## Server Metadata

- **Name**: `@mem0/mcp-server`
- **Display Name**: Mem0 Platform MCP Server
- **Category**: Memory Management, AI Agents
- **Homepage**: https://mem0.ai
- **Repository**: https://github.com/mem0ai/mem0-mcp-server
- **Icon**: https://mem0.ai/favicon.ico

## Features

- 6 production-ready tools for memory management
- Full Mem0 Platform API integration
- Enterprise-grade security with API key authentication
- Multi-tenant support (organizations & projects)
- Graph memory relationships (Pro feature)
- Advanced semantic search with filters
- Zod-based input validation

## Environment Variables

Required for installation:

```bash
MEM0_API_KEY=your_api_key_here
```

Optional:

```bash
MEM0_ORG_ID=your_org_id
MEM0_PROJECT_ID=your_project_id
```

## Compatible Clients

- ✅ Claude Desktop
- ✅ Cursor
- ✅ Windsurf
- ✅ Cline
- ✅ Continue
- ✅ Any MCP-compatible client

## Verification

After installation, verify the server is working:

1. Open your MCP client
2. Check available tools - should see 6 Mem0 tools
3. Try `add_memories` with a simple message
4. Verify in Mem0 Dashboard: https://app.mem0.ai

## Support

- 📚 Documentation: https://docs.mem0.ai
- 💬 Community: https://mem0.dev/DiD
- 🐛 Issues: GitHub Issues

## Publishing to Smithery

To publish or update this server on Smithery:

```bash
# Login to Smithery
npx @smithery/cli login

# Publish the server
npx @smithery/cli publish
```

## Smithery Server JSON

For manual registry submission:

```json
{
  "name": "@mem0/mcp-server",
  "displayName": "Mem0 Platform",
  "description": "Enterprise memory management for AI agents. Add, search, update, and manage persistent memories with semantic search, graph relationships, and multi-tenant support.",
  "version": "1.0.0",
  "author": "Mem0",
  "license": "MIT",
  "homepage": "https://mem0.ai",
  "repository": "https://github.com/mem0ai/mem0-mcp-server",
  "categories": ["memory", "ai-agents", "database", "search"],
  "keywords": ["mcp", "mem0", "memory", "ai", "llm", "agents", "semantic-search", "graph"],
  "transport": "stdio",
  "requirements": {
    "env": {
      "MEM0_API_KEY": {
        "required": true,
        "description": "Mem0 Platform API key from https://app.mem0.ai/dashboard/api-keys"
      },
      "MEM0_ORG_ID": {
        "required": false,
        "description": "Organization ID for multi-tenant setup"
      },
      "MEM0_PROJECT_ID": {
        "required": false,
        "description": "Project ID for multi-tenant setup"
      }
    }
  }
}
```
