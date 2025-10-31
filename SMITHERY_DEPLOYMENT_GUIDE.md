# Smithery 部署完整指南

**基于官方文档 (Context7) 的最佳实践配置**

---

## ✅ 当前配置状态

### 必需文件结构
```
repo/
├── smithery.yaml           ✅ TypeScript runtime 配置
├── smithery.config.js      ✅ 构建配置（新增）
├── .smitheryignore         ✅ 部署文件过滤（新增）
├── package.json            ✅ module 字段指向 src/index.ts
├── tsconfig.json           ✅ TypeScript 配置
├── src/
│   └── index.ts           ✅ export default createServer
└── dist/                   ✅ 编译文件（TypeScript 自动生成）
```

### ❌ 不应存在的文件
- ~~Dockerfile~~ （已删除）
- ~~docker-compose.yml~~
- ~~.dockerignore~~

---

## 📚 官方最佳实践总结

### 1. **smithery.yaml** - TypeScript Runtime
```yaml
runtime: "typescript"  # 必须，指定 TypeScript 运行时

env:
  NODE_ENV: "production"  # 可选的环境变量
```

**关键规则**：
- TypeScript runtime **不需要** `startCommand`
- TypeScript runtime **不需要** `build` 配置
- `startCommand` 和 `build` 只用于 **container runtime**

### 2. **package.json** - 入口点配置
```json
{
  "type": "module",              // 必须，ESM 模式
  "module": "./src/index.ts",    // 必须，Smithery 查找入口点
  "main": "dist/index.js"        // 可选，用于本地运行
}
```

### 3. **src/index.ts** - 导出格式
```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

// 1. 导出配置 schema（可选但推荐）
export const configSchema = z.object({
  apiKey: z.string().describe("Your API key"),
  // ... other config
});

// 2. 导出默认函数（必须）
export default function createServer({ config }: { config?: any } = {}) {
  const server = new McpServer({
    name: 'My Server',
    version: '1.0.0'
  });
  
  // ... register tools
  
  return server.server;  // 返回 server.server
}
```

### 4. **smithery.config.js** - 构建配置（新增）
```javascript
export default {
  esbuild: {
    // 外部依赖（Smithery 运行时提供）
    external: [
      "@modelcontextprotocol/sdk"
    ],
    
    // 目标环境
    target: "node18",
    format: "esm",
    platform: "node",
    
    // 优化
    minify: true
  }
};
```

---

## 🔧 关键修复历史

| 提交 | 问题 | 解决方案 |
|------|------|---------|
| cb7f21a | dist/ 被 .gitignore | 更新 .gitignore |
| 60c8326 | 缺少 export default | 添加导出函数 |
| bad362d | 缺少 module 字段 | package.json 添加 module |
| 8e318a5 | 返回值错误 | 返回 server.server |
| c6b8e7c | smithery.yaml 配置错误 | 移除 startCommand |
| 29bde32 | 文件在子目录 | 移动到根目录 |
| cdf30b7 | 存在 Dockerfile | 删除 Dockerfile |
| **2d4b3a9** | **缺少构建配置** | **添加 smithery.config.js** |

---

## 🎯 为什么之前看到 Docker 错误？

### 问题根源
Smithery 的部署检测优先级：
1. **检测 Dockerfile** → 使用 container runtime
2. **检测 smithery.yaml runtime 字段** → 使用指定 runtime

### 之前的错误
即使 `smithery.yaml` 设置了 `runtime: "typescript"`，但因为仓库中存在 `Dockerfile`，Smithery 优先使用了 container runtime，导致：
- 尝试使用 Docker 构建
- 查找 `@smithery/sdk`（container runtime 需要）
- 而不是使用 `@modelcontextprotocol/sdk`（TypeScript runtime 使用）

### 解决方案
1. ✅ 删除所有 Docker 相关文件
2. ✅ 添加 `smithery.config.js` 指定外部依赖
3. ✅ 添加 `.smitheryignore` 减少部署包大小

---

## 🚀 部署流程

### Smithery TypeScript Runtime 自动执行：
1. ✅ 克隆仓库
2. ✅ 读取 `smithery.yaml` 识别 `runtime: "typescript"`
3. ✅ 读取 `package.json` 找到 `module: "./src/index.ts"`
4. ✅ 运行 `npm install` 安装依赖
5. ✅ 运行 `npm run build`（如果有 prepare script）
6. ✅ 使用 `@smithery/cli build` 构建
7. ✅ 应用 `smithery.config.js` 配置
8. ✅ 部署为 Streamable HTTP 服务器

### 不再需要：
- ❌ Dockerfile
- ❌ Docker 构建
- ❌ 手动配置 HTTP 端点

---

## 📖 参考文档

### 官方资源
- [TypeScript 快速开始](https://smithery.ai/docs/build/getting-started)
- [项目配置](https://smithery.ai/docs/build/project-config)
- [smithery.yaml 配置](https://smithery.ai/docs/build/project-config/smithery-yaml)
- [会话配置](https://smithery.ai/docs/build/session-config)

### 关键概念
1. **TypeScript Runtime**: Smithery 自动构建和部署 TypeScript 项目
2. **Container Runtime**: 需要 Dockerfile 的自定义部署
3. **Streamable HTTP**: Smithery 使用的 MCP 传输协议
4. **Config Schema**: 使用 Zod 定义用户配置选项

---

## ✅ 验证清单

部署前确认：
- [ ] `smithery.yaml` 只有 `runtime: "typescript"`
- [ ] `package.json` 有 `"module": "./src/index.ts"`
- [ ] `package.json` 有 `"type": "module"`
- [ ] `src/index.ts` 有 `export default function createServer`
- [ ] `src/index.ts` 返回 `server.server`
- [ ] 仓库**没有** Dockerfile
- [ ] 有 `smithery.config.js` 配置构建
- [ ] 有 `.smitheryignore` 排除不必要文件
- [ ] `dist/` 文件已提交到 Git

---

## 🎉 预期结果

**提交 2d4b3a9** 之后，Smithery 应该：
1. ✅ 正确识别 TypeScript runtime
2. ✅ 使用 `@smithery/cli` 自动构建
3. ✅ 正确处理外部依赖
4. ✅ 成功部署为 HTTP 服务器
5. ✅ 不再出现 Docker 相关错误

---

**最后更新**: 2025-01-31 13:55  
**状态**: ✅ 配置完整，符合官方最佳实践
