# Smithery Docker 构建问题分析

## 🚨 问题描述

**现象**: Smithery 持续使用 Docker container runtime，尽管已明确配置为 TypeScript runtime

**部署日志证据**:
```
[14:05:51] Building image...
[14:05:52] Building Docker image...
[14:05:54] #5 transferring dockerfile: 3.28kB
[14:05:54] #7 [internal] load metadata for docker.io/library/node:22-slim
```

---

## 🔍 根本原因分析

### 1. Dockerfile 大小不匹配
- **我们的旧 Dockerfile**: 507 字节（已在 cdf30b7 删除）
- **Smithery 使用的 Dockerfile**: 3,280 字节 (3.28kB)
- **结论**: Smithery 正在使用**自动生成的默认 Dockerfile**

### 2. 配置完整性检查

| 配置项 | 状态 | 值 |
|--------|------|-----|
| smithery.yaml runtime | ✅ | `typescript` |
| package.json type | ✅ | `module` |
| package.json module | ✅ | `./src/index.ts` |
| src/index.ts export default | ✅ | `function createServer` |
| src/index.ts configSchema | ✅ | `export const configSchema` |
| smithery.config.js | ✅ | 存在，配置 esbuild |
| Dockerfile | ✅ | **不存在**（已删除）|
| .dockerignore | ❌ | **不应存在**（会触发 Docker） |

### 3. Git 历史检查
```bash
git log --all --full-history --oneline -- "*Dockerfile*"
# cdf30b7 fix: remove Dockerfile to force TypeScript runtime
# 29bde32 fix: move all files to repository root
# 24d5a63 first commit
```

**旧 Dockerfile 内容**（29bde32 之前）:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY tsconfig.json ./
COPY src ./src
RUN npm install -g typescript && npm run build && npm uninstall -g typescript
RUN rm -rf src tsconfig.json
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
```
**大小**: 507 字节

---

## 🎯 可能的原因

### A. Smithery 平台缓存
- Smithery 可能缓存了旧的部署配置
- 即使 GitHub 仓库已更新，平台仍使用旧配置

### B. 自动回退逻辑
Smithery 可能在以下情况自动回退到 container runtime：
1. 检测到 `package-lock.json`（优先使用 npm ci）
2. 检测到复杂的构建依赖
3. TypeScript 构建失败时的回退机制

### C. 隐式触发条件
可能触发 container runtime 的文件：
- `.dockerignore` ❌（我们刚删除了）
- `docker-compose.yml`
- 特定的 npm scripts（如 `docker:build`）

### D. 平台级别配置
- Smithery 网页界面可能有手动的 runtime 设置
- 项目初始创建时的配置可能被永久保存

---

## ✅ 已采取的修复措施

### 提交历史
1. **c6b8e7c**: 移除 smithery.yaml 中的 startCommand
2. **29bde32**: 将文件从子目录移到根目录
3. **cdf30b7**: 删除 Dockerfile
4. **2d4b3a9**: 添加 smithery.config.js 和 .smitheryignore
5. **0c27655**: 添加部署指南文档
6. **15e9d4d**: 更新 smithery.yaml，添加 .smithery/config.json

### 当前配置文件

#### `smithery.yaml`
```yaml
# Smithery TypeScript Runtime Configuration
# This explicitly forces TypeScript runtime (NOT container/Docker)
runtime: typescript

env:
  NODE_ENV: production
```

#### `.smithery/config.json` (新增)
```json
{
  "runtime": "typescript",
  "buildCommand": "npm run build",
  "entry": "./src/index.ts"
}
```

#### `smithery.config.js`
```javascript
export default {
  esbuild: {
    external: ["@modelcontextprotocol/sdk"],
    target: "node18",
    format: "esm",
    minify: true,
    platform: "node"
  }
};
```

---

## 🔧 建议的下一步

### 选项 1: 联系 Smithery 支持
如果问题持续，需要：
1. 在 Smithery 平台查看项目设置
2. 检查是否有手动的 runtime 覆盖
3. 请求清除平台缓存

### 选项 2: 重新创建项目
在 Smithery 平台上：
1. 删除当前项目
2. 重新连接 GitHub 仓库
3. 确保从干净状态开始

### 选项 3: 强制 TypeScript 构建
如果 Smithery 支持，添加更多强制标志：
- 在 package.json 添加 `"smithery": { "runtime": "typescript" }`
- 创建 `.smithery/force-typescript` 空文件

### 选项 4: 验证平台行为
检查 Smithery 文档或社区：
- 是否有已知的缓存问题
- TypeScript runtime 的优先级规则
- 平台更新可能改变的行为

---

## 📊 对比：我们的配置 vs Smithery 行为

| 方面 | 我们的意图 | Smithery 实际行为 |
|------|-----------|------------------|
| Runtime | TypeScript | Container (Docker) |
| Dockerfile | 无 | 自动生成 (3.28kB) |
| 入口点 | src/index.ts | ❓ |
| 构建方式 | @smithery/cli | Docker build |
| 依赖处理 | esbuild bundle | Docker layers |

---

## 🎓 从官方文档学到的关键点

### TypeScript Runtime 要求（官方）
1. ✅ `smithery.yaml` 设置 `runtime: "typescript"`
2. ✅ `package.json` 有 `"module"` 字段
3. ✅ `src/index.ts` 导出默认函数
4. ✅ 返回 `server.server`
5. ❌ **不能有任何 Dockerfile**

### Container Runtime 触发条件（官方）
1. ❌ 存在 `Dockerfile`
2. ❌ smithery.yaml 设置 `runtime: "container"`
3. ❌ 有 `build` 配置块
4. ❌ 有 `startCommand` 配置

### 我们完全符合 TypeScript 要求，但 Smithery 仍使用 Docker！

---

## 🔬 需要验证的假设

1. **假设**: `.smithery/config.json` 会被 Smithery 读取
   - **状态**: 未验证（非官方文档）
   - **测试**: 等待提交 15e9d4d 的部署结果

2. **假设**: 移除引号会改变 YAML 解析
   - **状态**: 低可能性
   - **对比**: `runtime: "typescript"` vs `runtime: typescript`

3. **假设**: Smithery 有隐藏的平台级 runtime 配置
   - **状态**: 高可能性
   - **验证**: 需要访问 Smithery 网页界面

---

## 📝 待办事项

- [ ] 等待提交 15e9d4d 的部署结果
- [ ] 如果仍失败，检查 Smithery 网页界面的项目设置
- [ ] 搜索 Smithery 社区是否有类似问题
- [ ] 考虑在 Smithery Discord/GitHub 提问
- [ ] 如有必要，准备最小复现案例

---

**最后更新**: 2025-10-31 14:21  
**当前提交**: 15e9d4d  
**状态**: 🔄 等待部署验证
