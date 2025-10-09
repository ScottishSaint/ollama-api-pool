# Ollama API Pool - 配置指南

## 环境变量配置

所有配置都在 `wrangler.toml` 文件的 `[vars]` 部分。

### 1. 管理后台密钥（必须配置）

```toml
ADMIN_TOKEN = "your-secure-token"
```

**说明**：
- 用于访问管理后台 `/dashboard`
- 建议使用强密码（至少 32 位随机字符）
- 修改后需要重新部署

**安全建议**：
```bash
# 生成随机密钥
openssl rand -hex 32
```

---

### 2. 统计分析开关

```toml
ENABLE_ANALYTICS = "false"  # 推荐值：false
```

**作用**：
- `true`：启用统计分析（全局统计、模型统计）
- `false`：禁用统计分析（节省 KV 写入，**推荐**）

**影响**：
- 启用时：
  - Dashboard 显示完整统计数据
  - `/stats` 页面显示图表
  - 消耗 KV 写入配额（采样记录）
- 禁用时：
  - Dashboard 不显示统计数据
  - `/stats` 页面显示空白
  - **节省 KV 写入配额**

**KV 消耗**：
- 启用时：每次请求 0-2 次 KV 写入（采样）
- 禁用时：每次请求 0 次 KV 写入

**何时启用**：
- 需要查看请求统计
- 需要分析模型使用情况
- 已升级到付费计划（1M 次写入/月）

---

### 3. 速率限制开关

```toml
ENABLE_RATE_LIMIT = "false"  # 推荐值：false
```

**作用**：
- `true`：启用 IP 级别速率限制
- `false`：禁用速率限制（节省 KV 读取，**推荐**）

**影响**：
- 启用时：
  - 限制单个 IP 的请求频率
  - 超限返回 429 错误
  - 消耗 KV 读取配额
- 禁用时：
  - 依赖 Cloudflare 原生 DDoS 防护
  - **节省 KV 读取配额**

**KV 消耗**：
- 启用时：每次请求 1 次 KV 读取
- 禁用时：每次请求 0 次 KV 读取

**何时启用**：
- 遇到恶意请求或 DDoS 攻击
- 需要严格限制单个 IP 的请求量
- 已升级到付费计划

**替代方案**：
- 使用 Cloudflare Rate Limiting Rules（付费功能）
- 使用 Cloudflare Bot Management（付费功能）

---

### 4. Bot 检测开关

```toml
ENABLE_BOT_DETECTION = "true"  # 推荐值：true
```

**作用**：
- `true`：启用 User-Agent 检测（**推荐**）
- `false`：禁用 Bot 检测

**影响**：
- 启用时：
  - 检测常见爬虫和脚本（python-requests, curl, wget, scrapy 等）
  - 记录日志（`console.warn`）
  - **不消耗 KV 配额**
  - 不会拒绝请求（仅记录）
- 禁用时：
  - 不检测 Bot

**检测的 Bot 类型**：
- `python-requests`
- `curl/`
- `wget/`
- `scrapy`
- `bot`、`spider`、`crawler`

**白名单**（不会被标记）：
- Googlebot
- Bingbot

**如何查看日志**：
```bash
# 实时查看日志
wrangler tail

# 或在 Cloudflare Dashboard 中查看 Logs
```

**增强 Bot 防护**：
如需拒绝可疑流量，修改 `src/proxy.js`：
```javascript
if (isSuspicious && !userAgent.includes('Googlebot') && !userAgent.includes('Bingbot')) {
  console.warn(`Suspicious bot detected: ${userAgent} from ${clientIP}`);
  return errorResponse('Bot detected', 403);  // 取消注释这行
}
```

---

### 5. 速率限制配置

```toml
RATE_LIMIT_REQUESTS = "60"   # 每个时间窗口的最大请求数
RATE_LIMIT_WINDOW = "60"     # 时间窗口（秒）
```

**说明**：
- 仅当 `ENABLE_RATE_LIMIT=true` 时生效
- 默认：60 次请求 / 60 秒（即每分钟 60 次）

**调整建议**：
- 严格限制：`RATE_LIMIT_REQUESTS = "30"`
- 宽松限制：`RATE_LIMIT_REQUESTS = "120"`
- 更长窗口：`RATE_LIMIT_WINDOW = "300"`（5 分钟）

**计算公式**：
```
每秒允许请求数 = RATE_LIMIT_REQUESTS / RATE_LIMIT_WINDOW
```

**示例配置**：
```toml
# 每分钟 30 次（严格）
RATE_LIMIT_REQUESTS = "30"
RATE_LIMIT_WINDOW = "60"

# 每 5 分钟 100 次（宽松）
RATE_LIMIT_REQUESTS = "100"
RATE_LIMIT_WINDOW = "300"

# 每秒 10 次（API 级别）
RATE_LIMIT_REQUESTS = "10"
RATE_LIMIT_WINDOW = "1"
```

---

### 6. 统计采样率

```toml
STATS_SAMPLE_RATE = "0.1"        # 全局统计采样率（10%）
MODEL_STATS_SAMPLE_RATE = "0.2"  # 模型统计采样率（20%）
```

**说明**：
- 仅当 `ENABLE_ANALYTICS=true` 时生效
- 取值范围：0.0 - 1.0（0% - 100%）

**采样率选择**：
- `0.0`：完全不记录（等同于 `ENABLE_ANALYTICS=false`）
- `0.05`：5% 采样（极度节省 KV）
- `0.1`：10% 采样（**推荐**）
- `0.5`：50% 采样（精度较高）
- `1.0`：100% 记录（不采样，消耗大量 KV）

**精度 vs 成本**：
| 采样率 | KV 写入减少 | 统计精度 | 适用场景 |
|--------|-------------|----------|----------|
| 0.05   | 95%         | 低       | 免费计划 + 高流量 |
| 0.1    | 90%         | 中等     | 免费计划（推荐） |
| 0.2    | 80%         | 较高     | 免费计划 + 中流量 |
| 0.5    | 50%         | 高       | 付费计划 |
| 1.0    | 0%          | 完全准确 | 付费计划 + 需要精确统计 |

**调整建议**：
```toml
# 极度节省 KV（免费计划 + 高流量）
STATS_SAMPLE_RATE = "0.05"
MODEL_STATS_SAMPLE_RATE = "0.1"

# 平衡模式（推荐）
STATS_SAMPLE_RATE = "0.1"
MODEL_STATS_SAMPLE_RATE = "0.2"

# 高精度模式（付费计划）
STATS_SAMPLE_RATE = "0.5"
MODEL_STATS_SAMPLE_RATE = "0.5"

# 完全准确（付费计划 + 低流量）
STATS_SAMPLE_RATE = "1.0"
MODEL_STATS_SAMPLE_RATE = "1.0"
```

---

## 推荐配置方案

### 方案 A：免费计划 + 极度节省（默认）

```toml
[vars]
ADMIN_TOKEN = "your-secure-token"
ENABLE_ANALYTICS = "false"
ENABLE_RATE_LIMIT = "false"
ENABLE_BOT_DETECTION = "true"
RATE_LIMIT_REQUESTS = "60"
RATE_LIMIT_WINDOW = "60"
STATS_SAMPLE_RATE = "0.1"
MODEL_STATS_SAMPLE_RATE = "0.2"
```

**特点**：
- ✅ 最小化 KV 操作
- ✅ 无统计开销
- ✅ Bot 检测（仅日志）
- ✅ 支持 >1000 次请求/天
- ❌ 无统计数据

---

### 方案 B：免费计划 + 基础统计

```toml
[vars]
ADMIN_TOKEN = "your-secure-token"
ENABLE_ANALYTICS = "true"
ENABLE_RATE_LIMIT = "false"
ENABLE_BOT_DETECTION = "true"
RATE_LIMIT_REQUESTS = "60"
RATE_LIMIT_WINDOW = "60"
STATS_SAMPLE_RATE = "0.1"
MODEL_STATS_SAMPLE_RATE = "0.2"
```

**特点**：
- ✅ 基础统计（10-20% 采样）
- ✅ Dashboard 和 /stats 可用
- ✅ Bot 检测
- ⚠️ 支持 ~500-800 次请求/天
- ⚠️ KV 写入有限

---

### 方案 C：免费计划 + 安全增强

```toml
[vars]
ADMIN_TOKEN = "your-secure-token"
ENABLE_ANALYTICS = "false"
ENABLE_RATE_LIMIT = "true"
ENABLE_BOT_DETECTION = "true"
RATE_LIMIT_REQUESTS = "30"
RATE_LIMIT_WINDOW = "60"
STATS_SAMPLE_RATE = "0.1"
MODEL_STATS_SAMPLE_RATE = "0.2"
```

**特点**：
- ✅ 严格速率限制（30 次/分钟）
- ✅ Bot 检测
- ✅ 防止滥用
- ❌ 无统计数据
- ⚠️ 消耗 KV 读取配额

---

### 方案 D：付费计划 + 完整功能

```toml
[vars]
ADMIN_TOKEN = "your-secure-token"
ENABLE_ANALYTICS = "true"
ENABLE_RATE_LIMIT = "true"
ENABLE_BOT_DETECTION = "true"
RATE_LIMIT_REQUESTS = "60"
RATE_LIMIT_WINDOW = "60"
STATS_SAMPLE_RATE = "0.5"
MODEL_STATS_SAMPLE_RATE = "0.5"
```

**特点**：
- ✅ 完整统计（50% 采样）
- ✅ 速率限制
- ✅ Bot 检测
- ✅ 支持大规模使用
- 💰 需要付费计划（$5/月）

---

## 修改配置后的操作

### 1. 修改 `wrangler.toml`

```bash
vim wrangler.toml
# 或使用任何文本编辑器
```

### 2. 重新部署

```bash
pnpm run deploy
# 或
npm run deploy
# 或
wrangler deploy
```

### 3. 验证配置

```bash
# 测试健康检查
curl https://your-worker.workers.dev/health | jq

# 查看日志
wrangler tail
```

---

## KV 配额监控

### 查看当前使用量

1. 访问 Cloudflare Dashboard
2. Workers & Pages → KV
3. 查看 "Operations" 指标

### 设置告警

在 Cloudflare Dashboard 中设置告警：
- KV 写入超过 800 次/天
- KV 读取超过 80,000 次/天

---

## 常见问题

### Q1: 如何完全禁用统计功能？

```toml
ENABLE_ANALYTICS = "false"
```

### Q2: 如何启用严格的速率限制？

```toml
ENABLE_RATE_LIMIT = "true"
RATE_LIMIT_REQUESTS = "30"  # 每分钟 30 次
RATE_LIMIT_WINDOW = "60"
```

### Q3: 如何查看被标记的 Bot？

```bash
wrangler tail | grep "Suspicious bot"
```

### Q4: 统计不准确怎么办？

增加采样率或禁用采样：
```toml
ENABLE_ANALYTICS = "true"
STATS_SAMPLE_RATE = "1.0"    # 100% 记录
MODEL_STATS_SAMPLE_RATE = "1.0"
```

### Q5: 如何完全禁用所有 KV 写入？

```toml
ENABLE_ANALYTICS = "false"
ENABLE_RATE_LIMIT = "false"
```

同时修改 `src/proxy.js` 禁用失败追踪：
```javascript
async function recordUsage(env, clientToken, apiKey, statusCode, modelName) {
  // 完全不记录
  return;
}
```

---

## 性能调优

### 低流量场景（<100 次/天）

```toml
ENABLE_ANALYTICS = "true"
STATS_SAMPLE_RATE = "1.0"    # 完全准确
MODEL_STATS_SAMPLE_RATE = "1.0"
```

### 中流量场景（100-500 次/天）

```toml
ENABLE_ANALYTICS = "true"
STATS_SAMPLE_RATE = "0.2"    # 20% 采样
MODEL_STATS_SAMPLE_RATE = "0.3"
```

### 高流量场景（>1000 次/天）

```toml
ENABLE_ANALYTICS = "false"   # 禁用统计
# 或升级到付费计划
```

---

## 安全建议

1. **定期更换 ADMIN_TOKEN**
2. **启用 ENABLE_BOT_DETECTION**
3. **监控 KV 使用量**
4. **查看日志，识别异常流量**
5. **使用 Cloudflare 原生安全功能**
   - Bot Fight Mode
   - Security Level: High
   - Challenge Passage: 30 minutes

---

## 相关文档

- [优化措施总结](./OPTIMIZATION.md)
- [项目说明](./README.md)
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Cloudflare KV 文档](https://developers.cloudflare.com/kv/)
