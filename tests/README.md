# Mem0 MCP Server - 测试文档

本目录包含所有测试脚本和相关文档。

## 📁 目录结构

### 测试脚本
- `mcp-validation-test.js` - 完整的MCP工具验证测试 (推荐)
- `test-delete-only.js` - 单独测试删除工具
- `complete-test.js` - 完整功能测试
- `final-test.js` - 最终测试脚本
- `final-fix-test.js` - 修复验证测试
- `test-tools.js` - 工具测试脚本
- `test-all-tools.ts` - TypeScript测试脚本

### 调试脚本
- `debug-add.js` - 调试add_memories返回值
- `debug-apis.js` - 调试API调用
- `diagnose.js` - 诊断脚本
- `fix-issues.js` - 问题修复测试

### 测试报告
- `MCP验证报告.md` - **MCP完整验证报告**（最新）
- `最终修复总结.md` - 修复总结
- `修复报告.md` - 详细修复过程
- `测试总结.md` - 测试总结
- `COMPLETE_TEST_REPORT.md` - 完整测试报告
- `TEST_REPORT.md` - 测试报告
- `ENDPOINT_VERIFICATION.md` - 端点验证
- `FINAL_VERIFICATION.md` - 最终验证

## 🚀 快速开始

### 运行完整验证测试

```bash
cd /path/to/mem0-mcp-server
node tests/mcp-validation-test.js
```

### 运行单个工具测试

```bash
node tests/test-delete-only.js
```

## 📊 测试结果摘要

**最新验证结果** (来自 `mcp-validation-test.js`):
- 测试通过: **11/13** (84.6%)
- 核心功能: **5/5** (100%)
- 高级功能: **6/6** (100%)
- 实际可用: **13/14** (92.9%)

## 📝 重要说明

1. **环境变量**: 测试脚本包含实际的API密钥，请勿提交到公共仓库
2. **测试序列**: 某些测试需要按顺序执行，避免数据冲突
3. **清理数据**: 测试后会自动清理测试数据

## 🔧 配置要求

测试需要以下环境变量：
```bash
MEM0_API_KEY=m0-Xn3fk58CwgsZUwotjc2GjwMpSReVLUl0VpqboRHU
MEM0_ORG_ID=org_k4v1RvY6r2Myemc4na0U7yzu6sSoVp1SHW2fs7Qs
MEM0_PROJECT_ID=proj_lM5QiyorNbxhDdbwNVfbuLFJvMBiGqUeLsNLzQbD
```

## 📚 相关文档

- 主目录的 `README.md` - 项目主要文档
- `PROJECT_SUMMARY.md` - 项目总结
- `SMITHERY.md` - Smithery部署指南
