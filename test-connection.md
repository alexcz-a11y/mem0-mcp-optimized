# MCP 连接性能诊断

## 1. 检查 Smithery 部署日志
在 Smithery 控制台查看：
- 部署时间
- 启动日志
- 是否有错误或警告

## 2. 测试本地连接速度
```bash
# 本地测试（不经过 Smithery）
cd /Users/alexnear/Documents/liquid-\ glass
MEM0_API_KEY=your_key MEM0_DEFAULT_USER_ID=alex npm run dev
```

观察启动时间和连接速度。

## 3. 对比时间节点
- 之前（718dcd5）：连接很快
- 现在（f91b973）：连接很慢

具体慢了多少秒？

## 4. 检查 Claude/Windsurf 日志
在 Claude Desktop 或 Windsurf 的 MCP 日志中查看：
- 连接建立用了多久
- 是否有超时或重试
- 工具列表加载时间

## 5. 可能的临时解决方案

### 方案 A：移除 Resources（如果它们导致问题）
Resources 可能在连接时被自动访问，触发 API 调用。

### 方案 B：回滚到之前版本
如果问题严重，可以临时回滚：
```bash
git revert f91b973 8dd72ba 7d0cfd6 9c7035b
```

### 方案 C：优化 memory-stats Resource
延迟加载或缓存统计数据。
