# Smithery 部署问题修复

## 问题描述

部署到 Smithery 时遇到错误：
```
Build files validation failed
insufficientBuildFiles
```

## 根本原因

`dist/` 目录被 `.gitignore` 排除，导致编译后的 JavaScript 文件没有提交到 Git 仓库。Smithery 在验证构建文件时找不到必要的文件。

## 解决方案

### 1. 修改 .gitignore

```diff
- # Build output
- dist/
+ # Build output (keep dist/ for Smithery deployment)
+ # dist/
```

注释掉 `dist/` 行，允许编译文件被提交到 Git。

### 2. 提交编译文件

```bash
# 确保项目已构建
npm run build

# 添加 dist/ 目录到 Git
git add dist/

# 提交更改
git commit -m "fix: include dist/ for Smithery deployment"

# 推送到远程仓库
git push
```

### 3. 重新部署

推送后，Smithery 会自动触发新的部署，这次应该能成功通过构建文件验证。

## 为什么需要提交 dist/？

对于 TypeScript 项目部署到 Smithery，有两种方案：

### 方案 A：提交编译文件（当前采用）✅
- **优点**：部署快速，无需构建步骤
- **优点**：确保部署使用的是已测试的构建产物
- **缺点**：Git 仓库稍大（约 50KB）
- **适用**：Smithery 平台（当前必需）

### 方案 B：构建时编译（不适用）❌
- **优点**：Git 仓库更小
- **缺点**：Smithery 当前不支持此方式
- **适用**：其他部署平台

## 文件清单

提交到 Git 的编译文件：
```
dist/
├── index.d.ts          # TypeScript 声明文件
├── index.d.ts.map      # 声明文件源映射
├── index.js            # 主入口文件（编译后）
├── index.js.map        # 源映射文件
├── mem0-client.d.ts    # Mem0 客户端声明
├── mem0-client.d.ts.map
├── mem0-client.js      # Mem0 客户端（编译后）
├── mem0-client.js.map
├── types.d.ts          # 类型定义
├── types.d.ts.map
├── types.js            # 类型（编译后）
└── types.js.map        # 源映射
```

总计 12 个文件，约 60KB。

## 验证步骤

部署成功后，验证：

1. ✅ 构建文件验证通过
2. ✅ 服务成功启动
3. ✅ API 端点可访问
4. ✅ 配置正确加载

## 注意事项

### 保持 dist/ 同步

每次修改源代码后，记得：
```bash
npm run build    # 重新编译
git add dist/    # 添加更新
git commit -m "..." 
git push
```

### 自动化构建（可选）

可以使用 Git hooks 自动化此过程：

```bash
# .git/hooks/pre-commit
#!/bin/bash
npm run build
git add dist/
```

## 相关文档

- [Smithery 文档](https://smithery.ai/docs)
- [项目 README](./README.md)
- [SMITHERY_DEPLOY.md](./SMITHERY_DEPLOY.md)

---

**修复时间**: 2025-01-31 04:34  
**状态**: ✅ 已解决
