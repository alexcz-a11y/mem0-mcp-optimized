# Mem0 MCP Server - Deployment Guide

## ✅ Build Status

项目已成功构建！所有文件已生成在 `dist/` 目录。

## 📦 Project Structure

```
mem0-mcp-server/
├── src/
│   ├── index.ts           # MCP server entry point
│   ├── mem0-client.ts     # Mem0 Platform API client
│   └── types.ts           # TypeScript types & Zod schemas
├── dist/                  # Compiled JavaScript (built)
├── examples/
│   ├── claude_desktop_config.json
│   └── usage.md
├── package.json           # NPM package metadata
├── tsconfig.json          # TypeScript config
├── README.md              # User documentation
├── SMITHERY.md            # Smithery integration guide
├── DEPLOYMENT.md          # This file
├── LICENSE                # MIT License
├── .env.example           # Environment template
└── .gitignore

## 🚀 Quick Start

### 1. Set Environment Variables

```bash
cd /Users/alexnear/Documents/liquid-\ glass/mem0-mcp-server
cp .env.example .env

# Edit .env and add your Mem0 API key
vim .env
```

### 2. Test Locally

```bash
# Run in development mode
npm run dev
```

### 3. Configure MCP Client

#### For Claude Desktop

Edit: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "mem0": {
      "command": "node",
      "args": [
        "/Users/alexnear/Documents/liquid- glass/mem0-mcp-server/dist/index.js"
      ],
      "env": {
        "MEM0_API_KEY": "your_mem0_api_key_here"
      }
    }
  }
}
```

#### For Cursor

Add to Settings > Features > MCP:

```json
{
  "mcpServers": {
    "mem0": {
      "command": "node",
      "args": [
        "/Users/alexnear/Documents/liquid- glass/mem0-mcp-server/dist/index.js"
      ],
      "env": {
        "MEM0_API_KEY": "your_mem0_api_key_here"
      }
    }
  }
}
```

### 4. Verify Installation

1. Restart your MCP client (Claude Desktop / Cursor)
2. Check available tools - should see 6 Mem0 tools:
   - `add_memories`
   - `search_memories`
   - `get_memories`
   - `update_memory`
   - `delete_memory`
   - `submit_feedback`
3. Test with: "Add a memory: I prefer dark mode"

## 📤 Publishing to NPM

### Prerequisites

```bash
# Login to NPM
npm login

# Verify you're logged in
npm whoami
```

### Publish

```bash
# Ensure package.json has correct version
npm version patch  # or minor, major

# Publish to NPM
npm publish --access public
```

### Post-Publish

Update installation command in README:

```bash
npm install -g @mem0/mcp-server
```

## 🌐 Publishing to Smithery

### Via CLI

```bash
# Install Smithery CLI
npm install -g @smithery/cli

# Login
npx @smithery/cli login

# Publish
npx @smithery/cli publish
```

### Manual Submission

Visit: https://smithery.ai/submit

Submit with metadata from `SMITHERY.md`.

## 🔧 Troubleshooting

### Server Not Starting

1. Check MEM0_API_KEY is set
2. Verify Node.js version >= 18:
   ```bash
   node --version
   ```
3. Rebuild if needed:
   ```bash
   npm run build
   ```

### Tools Not Appearing

1. Check client configuration path
2. Verify `dist/index.js` exists
3. Check client logs (e.g., Claude logs in Console.app)
4. Restart MCP client

### API Errors

1. Verify API key is valid: https://app.mem0.ai/dashboard/api-keys
2. Check org_id/project_id if using multi-tenant
3. Review error messages in client logs

## 📊 Testing with MCP Inspector

```bash
# Install MCP Inspector
npm install -g @modelcontextprotocol/inspector

# Run inspector
npx @modelcontextprotocol/inspector node dist/index.js
```

Open browser to: http://localhost:5173

## 🎯 Production Checklist

- [ ] Set production API key
- [ ] Configure org_id and project_id (if multi-tenant)
- [ ] Test all 6 tools
- [ ] Verify error handling
- [ ] Check memory creation in Mem0 Dashboard
- [ ] Test filter syntax (AND/OR/NOT)
- [ ] Test graph memory (if Pro)
- [ ] Document team usage patterns

## 📈 Monitoring

### Mem0 Dashboard

Visit: https://app.mem0.ai

Monitor:
- Memory count
- API usage
- Search analytics (Pro)
- Graph relationships (Pro)

### Client Logs

**Claude Desktop:**
```bash
tail -f ~/Library/Logs/Claude/mcp*.log
```

**Cursor:**
Check extension logs in Cursor Developer Tools

## 🔐 Security Best Practices

1. **Never commit .env files**
   - Use .env.example as template
   - Add .env to .gitignore

2. **Use environment-specific keys**
   - Development: dev/test API key
   - Production: production API key with limited scope

3. **Rotate API keys regularly**
   - Generate new keys quarterly
   - Update in all environments

4. **Multi-tenant isolation**
   - Use org_id and project_id
   - Separate keys per environment

## 🆘 Support

- **Documentation**: https://docs.mem0.ai
- **Discord**: https://mem0.dev/DiD
- **GitHub Issues**: https://github.com/mem0ai/mem0-mcp-server/issues
- **Email**: support@mem0.ai

## ✨ Next Steps

1. Publish to NPM registry
2. Submit to Smithery.ai
3. Create demo video
4. Write blog post
5. Share on Discord/Twitter
6. Monitor usage & feedback
7. Add more tools (export, batch operations)

---

Built with ❤️ using Model Context Protocol
