# 数据库设置指南

本项目支持 **Ollama** 和 **OpenRouter** 两个 Provider，使用 PostgreSQL (Supabase) 作为主数据库。

## 📋 目录

- [快速开始](#快速开始)
- [表结构说明](#表结构说明)
- [Provider 隔离](#provider-隔离)
- [数据迁移](#数据迁移)
- [常见问题](#常见问题)

## 🚀 快速开始

### 1. 创建 Supabase 项目

访问 [Supabase](https://supabase.com/) 创建新项目。

### 2. 执行初始化 SQL

在 Supabase SQL Editor 中执行 `schema.sql` 文件：

```sql
-- 复制并执行 schema.sql 中的全部内容
```

或者通过 Supabase CLI：

```bash
supabase db push
```

### 3. 配置环境变量

在 `wrangler.toml` 或 GitHub Secrets 中配置：

```toml
[vars]
# PostgreSQL 连接
DATABASE_URL = "postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
SUPABASE_REST_URL = "https://[PROJECT_REF].supabase.co/rest/v1"
SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOi..."

# Redis 缓存（可选）
REDIS_URL = "rediss://default:[PASSWORD]@[HOST]:6379"
```

### 4. 验证设置

访问管理后台，检查统计页面是否正常显示：

```bash
curl https://your-api.workers.dev/admin/public-stats
```

## 📊 表结构说明

### Provider 表命名规范

每个 Provider 有独立的表集合，使用表前缀区分：

| Provider | 表前缀 | 示例表名 |
|----------|--------|----------|
| Ollama | `ollama_api_` | `ollama_api_keys` |
| OpenRouter | `openrouter_api_` | `openrouter_api_keys` |

### 表类型

每个 Provider 包含以下 6 张表：

#### 1. `{prefix}_keys` - API Keys 主表

存储 API Key 和状态信息。

| 字段 | 类型 | 说明 |
|------|------|------|
| api_key | TEXT | API Key（主键） |
| username | TEXT | 关联用户名 |
| status | TEXT | 状态：active/disabled/failed/expired |
| created_at | TIMESTAMPTZ | 创建时间 |
| expires_at | TIMESTAMPTZ | 过期时间 |
| failed_until | TIMESTAMPTZ | 失败禁用截止时间 |
| disabled_until | TIMESTAMPTZ | 手动禁用截止时间 |
| consecutive_failures | INTEGER | 连续失败次数 |

#### 2. `{prefix}_key_stats` - API Key 统计表

记录每个 Key 的使用统计。

| 字段 | 类型 | 说明 |
|------|------|------|
| api_key | TEXT | API Key（主键，外键） |
| total_requests | BIGINT | 总请求数 |
| success_count | BIGINT | 成功次数 |
| failure_count | BIGINT | 失败次数 |
| success_rate | NUMERIC | 成功率 |
| last_used | TIMESTAMPTZ | 最后使用时间 |
| last_success | TIMESTAMPTZ | 最后成功时间 |
| last_failure | TIMESTAMPTZ | 最后失败时间 |
| consecutive_failures | INTEGER | 连续失败次数 |

#### 3. `{prefix}_client_tokens` - 客户端 Token 表

管理客户端访问凭证。

| 字段 | 类型 | 说明 |
|------|------|------|
| token | TEXT | Token 值（主键） |
| name | TEXT | Token 名称 |
| created_at | TIMESTAMPTZ | 创建时间 |
| expires_at | TIMESTAMPTZ | 过期时间 |
| request_count | BIGINT | 使用次数 |

#### 4. `{prefix}_global_stats` - 全局统计表

存储整体使用情况。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT | 固定值 'global'（主键） |
| total_requests | BIGINT | 总请求数 |
| success_count | BIGINT | 成功次数 |
| failure_count | BIGINT | 失败次数 |
| updated_at | TIMESTAMPTZ | 更新时间 |

#### 5. `{prefix}_model_stats` - 模型统计表

记录各模型使用情况。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL | 自增ID（主键） |
| provider | TEXT | Provider 标识 |
| model | TEXT | 模型名称 |
| total_requests | BIGINT | 总请求数 |
| success_count | BIGINT | 成功次数 |
| failure_count | BIGINT | 失败次数 |
| last_used | TIMESTAMPTZ | 最后使用时间 |

#### 6. `{prefix}_model_hourly` - 小时级模型统计表

用于生成趋势图表。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL | 自增ID（主键） |
| provider | TEXT | Provider 标识 |
| model | TEXT | 模型名称 |
| hour | TIMESTAMPTZ | 小时时间戳 |
| requests | BIGINT | 请求数 |
| success | BIGINT | 成功次数 |
| failure | BIGINT | 失败次数 |

## 🔒 Provider 隔离

### 数据隔离策略

每个 Provider 的数据完全独立：

- ✅ **表级隔离**：不同 Provider 使用不同的表
- ✅ **Key 隔离**：API Keys 不会跨 Provider 使用
- ✅ **统计隔离**：统计数据分别计算
- ✅ **Token 隔离**：客户端 Token 分 Provider 管理

### 切换 Provider

通过 URL 参数或路径区分：

```bash
# Ollama Provider
curl https://api.workers.dev/v1/chat/completions

# OpenRouter Provider
curl https://api.workers.dev/openrouter/v1/chat/completions

# 管理 API 指定 Provider
curl https://api.workers.dev/admin/api-keys?provider=openrouter
```

## 📦 数据迁移

### 从 KV 迁移到 PostgreSQL

如果你之前使用 Cloudflare KV 存储，现在想迁移到 PostgreSQL：

1. **导出 KV 数据**

```bash
# 使用 Wrangler CLI 导出
wrangler kv:key list --namespace-id=<NAMESPACE_ID>
```

2. **批量导入到数据库**

通过管理后台的批量导入功能，或使用 API：

```bash
curl -X POST https://api.workers.dev/admin/api-keys/import \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"keys": ["sk-xxx", "sk-yyy"], "provider": "ollama"}'
```

### 在 Provider 之间迁移

目前不支持跨 Provider 的 Key 迁移，因为：

- Ollama 和 OpenRouter 使用不同的 API Key 格式
- 两者的模型和能力不同
- 需要分别管理和验证

如需同时使用两个 Provider，请分别导入和管理。

## 🛠️ 常见问题

### Q1: 为什么要分表而不是用 provider 字段？

**A:** 分表设计有以下优势：

1. **性能优化**：减少索引大小，加快查询速度
2. **数据隔离**：防止误操作影响其他 Provider
3. **独立扩展**：可以为不同 Provider 使用不同的数据库
4. **清晰明确**：表结构更直观，便于维护

### Q2: 如何查看某个 Provider 的统计数据？

**A:** 通过 API 查询：

```bash
# Ollama 统计
curl https://api.workers.dev/admin/stats?provider=ollama

# OpenRouter 统计
curl https://api.workers.dev/admin/stats?provider=openrouter
```

### Q3: 可以在一个数据库中只创建一个 Provider 的表吗？

**A:** 可以！如果你只使用 Ollama，只需执行 `schema.sql` 中 Ollama 相关的部分。系统会自动检测表是否存在。

### Q4: 数据库表占用多少空间？

**A:** 以 10,000 个 API Keys 为例：

- API Keys 主表：~2 MB
- 统计表：~5 MB
- 模型统计：~1 MB
- 小时级统计：~10 MB（保留 30 天）

总计约 **18 MB** 每 10K Keys。

### Q5: 如何清理历史数据？

**A:** 使用以下 SQL 清理 30 天前的小时级统计：

```sql
-- Ollama
DELETE FROM ollama_api_model_hourly
WHERE created_at < NOW() - INTERVAL '30 days';

-- OpenRouter
DELETE FROM openrouter_api_model_hourly
WHERE created_at < NOW() - INTERVAL '30 days';
```

建议设置自动清理定时任务。

### Q6: 支持其他数据库吗（MySQL、MongoDB）？

**A:** 当前仅支持 PostgreSQL。原因：

1. PostgREST 提供了简洁的 HTTP API
2. Supabase 免费套餐足够使用
3. PostgreSQL 性能和可靠性优秀

如需支持其他数据库，欢迎提交 PR！

## 🔗 相关资源

- [Supabase 文档](https://supabase.com/docs)
- [PostgreSQL 优化指南](../OPTIMIZATION.md)
- [API 文档](https://ollama-api-pool.h7ml.workers.dev/api-docs)

---

如有问题，请在 [GitHub Issues](https://github.com/dext7r/ollama-api-pool/issues) 提出。
