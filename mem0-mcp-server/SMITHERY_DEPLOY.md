# Smithery 部署指南

本文档介绍如何将 Mem0 MCP Server 部署到 Smithery 平台。

## ✅ 部署准备清单

### 必需文件
- [x] `smithery.yaml` - Smithery 配置文件
- [x] `Dockerfile` - Docker 构建文件
- [x] `package.json` - Node.js 项目配置
- [x] `tsconfig.json` - TypeScript 配置
- [x] `src/` - 源代码目录
- [x] `.gitignore` - Git 忽略配置

### 安全配置
- [x] `.env.test` 已添加到 .gitignore
- [x] 测试脚本已添加到 .gitignore
- [x] 敏感信息不会被提交到仓库

## 📋 配置文件说明

### smithery.yaml

配置了 TypeScript 运行时和 HTTP 服务器参数：

```yaml
runtime: "typescript"
startCommand:
  type: "http"
  configSchema:
    type: "object"
    required: ["apiKey"]
    properties:
      apiKey:
        type: "string"
        title: "Mem0 API Key"
      orgId:
        type: "string"
        title: "Organization ID"
      projectId:
        type: "string"
        title: "Project ID"
      baseUrl:
        type: "string"
        default: "https://api.mem0.ai"
```

### Dockerfile

基于 Node.js 18 Alpine 的轻量级镜像：
- 安装生产依赖
- 编译 TypeScript
- 移除源文件保留编译产物
- 优化镜像大小

## 🚀 部署步骤

### 1. 本地验证

```bash
# 构建项目
npm run build

# 验证构建产物
ls -la dist/

# 本地测试（可选）
npm run dev
```

### 2. 部署到 Smithery

#### 方式一：使用 Smithery CLI

```bash
# 安装 Smithery CLI
npm install -g @smithery/cli

# 登录 Smithery
smithery login

# 部署项目
smithery deploy
```

#### 方式二：通过 GitHub 集成

1. 将代码推送到 GitHub 仓库
2. 在 Smithery 平台连接 GitHub 仓库
3. Smithery 会自动检测 `smithery.yaml` 并部署

### 3. 配置环境变量

部署后，在 Smithery 控制台配置以下参数：

- **apiKey** (必需): 你的 Mem0 API 密钥
- **orgId** (可选): 组织 ID
- **projectId** (可选): 项目 ID
- **baseUrl** (可选): API 基础 URL

## 🔧 故障排查

### 构建失败

检查 TypeScript 编译：
```bash
npm run build
```

查看错误日志并修复类型错误。

### 运行时错误

1. 检查环境变量是否正确配置
2. 验证 Mem0 API 密钥是否有效
3. 查看 Smithery 日志输出

### Docker 构建失败

本地测试 Docker 构建：
```bash
docker build -t mem0-mcp-server .
docker run -e MEM0_API_KEY=your_key mem0-mcp-server
```

## 📊 性能优化

### 镜像大小优化
- 使用 Alpine Linux 基础镜像
- 多阶段构建（如需要）
- 移除开发依赖和源文件

### 启动速度
- 预编译 TypeScript
- 使用 npm ci 而非 npm install
- 优化依赖树

## 🔒 安全建议

1. **API 密钥管理**
   - 永远不要将密钥硬编码在代码中
   - 使用 Smithery 的环境变量配置
   - 定期轮换 API 密钥

2. **访问控制**
   - 限制 API 密钥权限
   - 使用组织和项目级别的隔离
   - 监控 API 使用情况

3. **.gitignore 配置**
   - 确保 `.env.test` 被忽略
   - 测试脚本不包含在发布版本中
   - 定期审查忽略规则

## 📚 相关资源

- [Smithery 官方文档](https://smithery.ai/docs)
- [Mem0 Platform 文档](https://docs.mem0.ai)
- [项目 README](./README.md)
- [部署文档](./DEPLOYMENT.md)

## ✅ 验证清单

部署前检查：

- [ ] TypeScript 编译成功
- [ ] 所有依赖已安装
- [ ] smithery.yaml 配置正确
- [ ] Dockerfile 测试通过
- [ ] .gitignore 包含敏感文件
- [ ] 文档已更新

部署后验证：

- [ ] 服务成功启动
- [ ] API 端点可访问
- [ ] 环境变量正确加载
- [ ] 日志无错误信息
- [ ] 功能测试通过

## 🎯 下一步

部署成功后，你可以：

1. 在 Claude Desktop 中配置使用
2. 集成到你的 AI 应用中
3. 监控使用情况和性能
4. 根据需要扩展功能

---

**最后更新**: 2025-01-31  
**状态**: ✅ 准备就绪
