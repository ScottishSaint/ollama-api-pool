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

### 2. 用户系统配置 <sup>v3.0.0+</sup>

#### 2.1 JWT 签名密钥（必须配置）

```toml
AUTH_SECRET = "your-jwt-secret-key-here"
```

**说明**：
- 用于 JWT Token 签名和验证
- 必须是 32 位以上的随机字符串
- 用户登录和会话管理依赖此密钥

**安全建议**：
```bash
# 生成随机密钥
openssl rand -base64 48
```

#### 2.2 Turnstile 人机验证（推荐配置）

```toml
ENABLE_TURNSTILE = "true"
TURNSTILE_SITE_KEY = "your-turnstile-site-key"
TURNSTILE_SECRET_KEY = "your-turnstile-secret-key"
```

**说明**：
- `ENABLE_TURNSTILE`：是否启用 Turnstile 验证（推荐 `true`）
- `TURNSTILE_SITE_KEY`：前端使用的 Site Key
- `TURNSTILE_SECRET_KEY`：后端验证使用的 Secret Key

**获取密钥**：
1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/?to=/:account/turnstile)
2. 创建新的 Turnstile 站点
3. 选择 "Managed" 模式（推荐）
4. 复制 Site Key 和 Secret Key

**作用范围**：
- 用户注册
- 用户登录（验证码/密码模式）
- 发送验证码邮件

**禁用方法**：
```toml
ENABLE_TURNSTILE = "false"  # 关闭 Turnstile 验证
```

#### 2.3 邮件服务配置（必须配置）

```toml
EMAIL_FORWARD_URL = "your-push-all-in-one-url"
EMAIL_HOST = "smtp.example.com"
EMAIL_PORT = "587"
EMAIL_AUTH_USER = "your-email@example.com"
EMAIL_AUTH_PASS = "your-email-password"
EMAIL_SECURE = "true"
```

**说明**：
- `EMAIL_FORWARD_URL`：邮件转发服务地址（推荐使用 push-all-in-one）
- `EMAIL_HOST`：SMTP 服务器地址
- `EMAIL_PORT`：SMTP 端口（通常为 587 或 465）
- `EMAIL_AUTH_USER`：SMTP 认证用户名（通常是邮箱地址）
- `EMAIL_AUTH_PASS`：SMTP 认证密码
- `EMAIL_SECURE`：是否使用 TLS/SSL（`true` 推荐）

**推荐方案**：
1. **push-all-in-one**（推荐）
   - GitHub: https://github.com/sinlatansen/push-all-in-one
   - 支持多种邮件服务商
   - 提供统一的 HTTP 接口

2. **常见 SMTP 服务商**：
   - **Gmail**: smtp.gmail.com:587
   - **Outlook**: smtp-mail.outlook.com:587
   - **QQ Mail**: smtp.qq.com:587
   - **163 Mail**: smtp.163.com:465

**验证码邮件特性**：
- 精美的 HTML 邮件模板
- 10 分钟有效期
- 单次使用验证码
- 频率限制（60 秒/次，10 次/天）

---

### 3. Provider 控制开关 <sup>v3.1.0+</sup>

```toml
DISABLE_OLLAMA = "false"         # 是否禁用 Ollama
DISABLE_OPENROUTER = "false"     # 是否禁用 OpenRouter
```

**作用**：
- 独立控制每个 Provider 的启用/禁用状态
- 灵活配置服务范围（仅 Ollama、仅 OpenRouter、或同时使用）

**详细说明**：
- 参考完整文档：[PROVIDER_TOGGLE.md](./PROVIDER_TOGGLE.md)

**常见场景**：

1. **仅使用 Ollama**（推荐新手）：
   ```toml
   DISABLE_OPENROUTER = "true"  # 禁用 OpenRouter
   ```

2. **仅使用 OpenRouter**（推荐高级用户）：
   ```toml
   DISABLE_OLLAMA = "true"  # 禁用 Ollama
   ```

3. **同时使用（默认，推荐）**：
   ```toml
   # 不设置或设置为 false
   ```

4. **临时维护**：
   ```toml
   DISABLE_OLLAMA = "true"  # 临时禁用 Ollama 进行维护
   ```

**健康检查**：
- `/health` 接口显示所有 Provider 状态
- 禁用时接口返回 503 错误

---

### 4. 统计分析开关

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

### 7. Redis 缓存与限流（可选）

> 更新时间：2025-10-10 22:45 (UTC+8) — Codex

```toml
REDIS_URL = "rediss://default:<密码>@<子域>.upstash.io:6379"
```

**作用**：
- 启用后，代理缓存与速率限制优先使用 Upstash Redis，KV 作为回退通道；
- 速率限制通过 `INCR + EXPIRE` 提供秒级窗口计数；
- 缓存命中率提升后可显著减少 KV 的读写压力。

**配置步骤**：
1. 登录 Upstash 控制台，复制数据库的 **TLS Redis URL**（即 `rediss://...`）；
2. 将完整连接串填入 `wrangler.toml` 的 `[vars]` 中；
3. 重新部署 Worker，确保环境变量生效。

**实现细节**：
- Worker 内部会解析 `REDIS_URL`，使用 Upstash REST API（HTTPS + Bearer Token）发送命令；
- 缓存键以 `cache:*` 前缀写入 Redis，并设置与 KV 相同的 TTL；
- 速率限制键以 `ratelimit:*` 前缀存储，窗口结束后自动过期；
- 当 Redis 不可用时自动回退到 Cloudflare KV，确保功能连续性。

**注意事项**：
- Upstash REST API 返回 JSON，Worker 无需额外依赖即可调用；
- 如果使用自建 Redis，请提供兼容 Upstash REST 的 HTTPS 接口；
- 建议在 Upstash 控制台监控请求量和数据存储，避免超出免费配额。

---

### 8. PostgreSQL（Supabase）集成（推荐）

> 更新时间：2025-10-10 22:46 (UTC+8) — Codex

```toml
DATABASE_URL = "postgresql://postgres.<project-ref>:<密码>@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
SUPABASE_REST_URL = "https://<project-ref>.supabase.co/rest/v1"
SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJI..."  # Supabase Service Role Key
```

**作用**：
- 将 API Key、统计、客户端 Token 等高频写入数据迁移至 PostgreSQL，KV 仅作为兜底；
- 支持十万级 Key 导入与频繁状态更新，不再受 KV 写入 1000 次/天限制；
- 与 Redis 组合后可实现高吞吐 + 强一致的缓存/数据库架构。

**表命名要求**：所有自建数据表需以 `ollama_api_` 开头，默认使用以下结构：

```sql
create table if not exists ollama_api_keys (
  api_key text primary key,
  username text,
  status text default 'active',
  created_at timestamptz default now(),
  expires_at timestamptz,
  failed_until timestamptz,
  disabled_until timestamptz,
  consecutive_failures integer default 0
);

create table if not exists ollama_api_key_stats (
  api_key text primary key references ollama_api_keys(api_key) on delete cascade,
  total_requests bigint default 0,
  success_count bigint default 0,
  failure_count bigint default 0,
  success_rate numeric default 0,
  last_used timestamptz,
  last_success timestamptz,
  last_failure timestamptz,
  consecutive_failures integer default 0,
  created_at timestamptz default now()
);

create table if not exists ollama_api_client_tokens (
  token text primary key,
  name text,
  created_at timestamptz default now(),
  expires_at timestamptz,
  request_count bigint default 0
);
```

**配置步骤**：
1. 在 Supabase 控制台启用数据库，并执行上述建表 SQL（或使用迁移工具执行）；
2. 在 “Project Settings → API” 中获取 `Service Role Key`；
3. 将 `DATABASE_URL`、`SUPABASE_REST_URL`、`SUPABASE_SERVICE_ROLE_KEY` 写入 `wrangler.toml`；
4. 部署 Worker，确认管理后台 `/admin/stats` 显示 `storage = postgres+kv`；
5. 如需扩展更多字段，可在表中增加列，Worker 会自动映射。

**注意事项**：
- `SUPABASE_SERVICE_ROLE_KEY` 属于高敏感凭据，必须通过环境变量注入，勿提交到仓库；
- 若未设置 `SUPABASE_REST_URL`，Worker 会尝试从 `DATABASE_URL` 推断 `https://<project-ref>.supabase.co/rest/v1`，但显式配置更可靠；
- 推荐与 `REDIS_URL` 搭配使用，实现“Postgres 主存储 + Redis 热缓存 + KV 备份”的三层架构。

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
